from rest_framework import generics, status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import User, DonorProfile, NgoProfile, VolunteerProfile, AuditLog
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    DonorProfileSerializer,
    NgoProfileSerializer,
    VolunteerProfileSerializer,
    AuditLogSerializer
)
from .permissions import IsAdminUserRole
from apps.notifications.models import Notification


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for instant seamless login
        refresh = RefreshToken.for_user(user)
        user_serializer = UserSerializer(user)

        return Response({
            'user': user_serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'Registration successful.'
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @transaction.atomic
    def patch(self, request):
        user = request.user
        data = request.data

        # Update basic user fields
        if 'phone_number' in data:
            user.phone_number = data['phone_number']
            user.save(update_fields=['phone_number'])

        # Update role-specific profile fields
        profile_data = data.get('profile', {})
        if user.role == User.Role.DONOR and hasattr(user, 'donor_profile'):
            profile_serializer = DonorProfileSerializer(user.donor_profile, data=profile_data, partial=True)
            if profile_serializer.is_valid(raise_exception=True):
                profile_serializer.save()
        elif user.role == User.Role.NGO and hasattr(user, 'ngo_profile'):
            profile_serializer = NgoProfileSerializer(user.ngo_profile, data=profile_data, partial=True)
            if profile_serializer.is_valid(raise_exception=True):
                profile_serializer.save()
        elif user.role == User.Role.VOLUNTEER and hasattr(user, 'volunteer_profile'):
            profile_serializer = VolunteerProfileSerializer(user.volunteer_profile, data=profile_data, partial=True)
            if profile_serializer.is_valid(raise_exception=True):
                profile_serializer.save()

        AuditLog.objects.create(
            user=user,
            action='PROFILE_UPDATED',
            entity_type='User',
            entity_id=str(user.id),
            details={'fields_updated': list(data.keys())}
        )

        return Response(UserSerializer(user).data)


class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]
    filterset_fields = ['role', 'verification_status', 'is_verified']
    search_fields = ['email', 'username', 'donor_profile__organization_name', 'ngo_profile__organization_name', 'volunteer_profile__full_name']

    def get_queryset(self):
        return User.objects.all().select_related('donor_profile', 'ngo_profile', 'volunteer_profile').order_by('-created_at')


class AdminVerifyUserView(views.APIView):
    permission_classes = [IsAdminUserRole]

    @transaction.atomic
    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        action = request.data.get('action') # 'approve' or 'reject'
        reason = request.data.get('reason', '')

        if action == 'approve':
            user.is_verified = True
            user.verification_status = User.VerificationStatus.VERIFIED
            user.save(update_fields=['is_verified', 'verification_status'])

            Notification.objects.create(
                recipient=user,
                title="Account Verified 🎉",
                message="Your organization account has been verified by the administrator. You can now post donations and request surplus food without restrictions.",
                notification_type=Notification.NotificationType.ACCOUNT_VERIFIED
            )

            AuditLog.objects.create(
                user=request.user,
                action='USER_VERIFIED',
                entity_type='User',
                entity_id=str(user.id),
                details={'target_user': user.email, 'role': user.role}
            )

            return Response({'status': 'verified', 'user': UserSerializer(user).data})

        elif action == 'reject':
            user.is_verified = False
            user.verification_status = User.VerificationStatus.REJECTED
            user.save(update_fields=['is_verified', 'verification_status'])

            Notification.objects.create(
                recipient=user,
                title="Verification Needs Attention",
                message=f"Verification was not approved. Reason: {reason or 'Incomplete documentation'}. Please update your profile.",
                notification_type=Notification.NotificationType.SYSTEM_ALERT
            )

            AuditLog.objects.create(
                user=request.user,
                action='USER_VERIFICATION_REJECTED',
                entity_type='User',
                entity_id=str(user.id),
                details={'target_user': user.email, 'reason': reason}
            )

            return Response({'status': 'rejected', 'user': UserSerializer(user).data})

        return Response({'error': 'Invalid action. Specify "approve" or "reject".'}, status=status.HTTP_400_BAD_REQUEST)


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUserRole]
    queryset = AuditLog.objects.all().select_related('user')
    filterset_fields = ['action', 'entity_type']
    search_fields = ['action', 'entity_id', 'user__email']

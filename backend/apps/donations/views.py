from rest_framework import viewsets, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction

from .models import FoodCategory, Donation
from .serializers import (
    FoodCategorySerializer,
    DonationListSerializer,
    DonationDetailSerializer,
    DonationCreateUpdateSerializer
)
from apps.accounts.permissions import IsDonor, IsVerified, IsAdminUserRole
from apps.accounts.models import AuditLog
from apps.notifications.models import Notification


class FoodCategoryListView(generics.ListAPIView):
    queryset = FoodCategory.objects.all()
    serializer_class = FoodCategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class DonationViewSet(viewsets.ModelViewSet):
    filterset_fields = ['category', 'dietary_type', 'storage_requirement', 'status', 'city']
    search_fields = ['title', 'description', 'pickup_address', 'donor__donor_profile__organization_name']
    ordering_fields = ['pickup_deadline', 'created_at', 'quantity', 'available_quantity']

    def get_queryset(self):
        queryset = Donation.objects.all().select_related('category', 'donor', 'donor__donor_profile')
        
        # If public or NGO, only show active, non-expired, non-suspended donations unless specifically requesting
        if self.action == 'list' and not self.request.query_params.get('include_all'):
            # Automatically expire past deadlines
            now = timezone.now()
            Donation.objects.filter(
                status__in=[Donation.Status.AVAILABLE, Donation.Status.PARTIALLY_RESERVED],
                pickup_deadline__lt=now
            ).update(status=Donation.Status.EXPIRED)

            # Only return visible requestable or active ones for public feed
            status_param = self.request.query_params.get('status')
            if not status_param:
                queryset = queryset.filter(
                    status__in=[Donation.Status.AVAILABLE, Donation.Status.PARTIALLY_RESERVED],
                    pickup_deadline__gt=now,
                    is_flagged_unsafe=False
                )

        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DonationCreateUpdateSerializer
        elif self.action == 'retrieve':
            return DonationDetailSerializer
        return DonationListSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        elif self.action == 'create':
            return [permissions.IsAuthenticated(), IsDonor(), IsVerified()]
        elif self.action in ['update', 'partial_update', 'destroy', 'cancel']:
            return [permissions.IsAuthenticated()]
        elif self.action == 'moderate':
            return [permissions.IsAuthenticated(), IsAdminUserRole()]
        return [permissions.IsAuthenticated()]

    @transaction.atomic
    def perform_create(self, serializer):
        donation = serializer.save(
            donor=self.request.user,
            available_quantity=serializer.validated_data['quantity'],
            reserved_quantity=0,
            status=Donation.Status.AVAILABLE
        )
        AuditLog.objects.create(
            user=self.request.user,
            action='DONATION_CREATED',
            entity_type='Donation',
            entity_id=str(donation.id),
            details={'title': donation.title, 'quantity': float(donation.quantity), 'unit': donation.unit}
        )

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsDonor])
    def my_donations(self, request):
        queryset = Donation.objects.filter(donor=request.user).order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = DonationListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = DonationListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def cancel(self, request, pk=None):
        donation = self.get_object()
        if donation.donor != request.user and not request.user.is_staff:
            return Response({'error': 'You do not have permission to cancel this donation.'}, status=status.HTTP_403_FORBIDDEN)

        if donation.status in [Donation.Status.COMPLETED, Donation.Status.CANCELLED]:
            return Response({'error': f'Cannot cancel a donation that is already {donation.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        donation.status = Donation.Status.CANCELLED
        donation.save(update_fields=['status'])

        # Notify any active requesters
        for req in donation.requests.filter(status='PENDING'):
            req.status = 'CANCELLED'
            req.save(update_fields=['status'])
            Notification.objects.create(
                recipient=req.recipient,
                title="Donation Cancelled",
                message=f"The donation '{donation.title}' you requested was cancelled by the donor.",
                notification_type=Notification.NotificationType.SYSTEM_ALERT
            )

        AuditLog.objects.create(
            user=request.user,
            action='DONATION_CANCELLED',
            entity_type='Donation',
            entity_id=str(donation.id),
            details={'reason': request.data.get('reason', 'Cancelled by donor')}
        )

        return Response({'status': 'Donation cancelled successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUserRole])
    @transaction.atomic
    def moderate(self, request, pk=None):
        donation = self.get_object()
        action_type = request.data.get('action') # 'suspend', 'reinstate', 'flag'
        reason = request.data.get('reason', '')

        if action_type == 'suspend':
            donation.status = Donation.Status.SUSPENDED
            donation.is_flagged_unsafe = True
            donation.flag_reason = reason
            donation.suspended_by = request.user
            donation.save()

            Notification.objects.create(
                recipient=donation.donor,
                title="Donation Listing Suspended",
                message=f"Your listing '{donation.title}' was suspended by an administrator for food safety review: {reason}",
                notification_type=Notification.NotificationType.SYSTEM_ALERT
            )

            AuditLog.objects.create(
                user=request.user,
                action='DONATION_SUSPENDED',
                entity_type='Donation',
                entity_id=str(donation.id),
                details={'reason': reason}
            )
            return Response({'status': 'Listing suspended.'})

        elif action_type == 'reinstate':
            donation.is_flagged_unsafe = False
            donation.flag_reason = ''
            donation.suspended_by = None
            donation.status = Donation.Status.AVAILABLE
            donation.save()

            Notification.objects.create(
                recipient=donation.donor,
                title="Donation Listing Reinstated",
                message=f"Your listing '{donation.title}' was reviewed and reinstated.",
                notification_type=Notification.NotificationType.SYSTEM_ALERT
            )

            AuditLog.objects.create(
                user=request.user,
                action='DONATION_REINSTATED',
                entity_type='Donation',
                entity_id=str(donation.id),
                details={'moderator': request.user.email}
            )
            return Response({'status': 'Listing reinstated.'})

        return Response({'error': 'Invalid moderation action.'}, status=status.HTTP_400_BAD_REQUEST)

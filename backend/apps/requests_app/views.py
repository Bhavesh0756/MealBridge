from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import DonationRequest, Reservation
from .serializers import DonationRequestListSerializer, DonationRequestCreateSerializer
from apps.donations.models import Donation
from apps.accounts.permissions import IsNgo, IsDonor, IsVerified, IsAdminUserRole
from apps.accounts.models import AuditLog, User
from apps.notifications.models import Notification
from apps.pickups.models import PickupAssignment


class DonationRequestViewSet(viewsets.ModelViewSet):
    filterset_fields = ['status']
    search_fields = ['donation__title', 'recipient__ngo_profile__organization_name']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return DonationRequest.objects.none()

        if user.role == User.Role.DONOR:
            # Donor sees all requests made on their donations
            return DonationRequest.objects.filter(donation__donor=user).select_related(
                'donation', 'recipient', 'recipient__ngo_profile'
            )
        elif user.role == User.Role.NGO:
            # NGO sees requests they have submitted
            return DonationRequest.objects.filter(recipient=user).select_related(
                'donation', 'recipient', 'recipient__ngo_profile'
            )
        elif user.role in [User.Role.ADMIN, User.Role.VOLUNTEER] or user.is_staff:
            return DonationRequest.objects.all().select_related(
                'donation', 'recipient', 'recipient__ngo_profile'
            )
        return DonationRequest.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return DonationRequestCreateSerializer
        return DonationRequestListSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsNgo(), IsVerified()]
        return [permissions.IsAuthenticated()]

    @transaction.atomic
    def perform_create(self, serializer):
        req = serializer.save(recipient=self.request.user, status=DonationRequest.Status.PENDING)

        # Notify donor
        donor_user = req.donation.donor
        org_name = getattr(req.recipient, 'ngo_profile', None)
        ngo_label = org_name.organization_name if org_name else req.recipient.email

        Notification.objects.create(
            recipient=donor_user,
            title="New Donation Request Received",
            message=f"{ngo_label} requested {req.requested_quantity} {req.donation.unit} of '{req.donation.title}'.",
            notification_type=Notification.NotificationType.REQUEST_RECEIVED,
            related_entity_type='request',
            related_entity_id=str(req.id)
        )

        AuditLog.objects.create(
            user=self.request.user,
            action='REQUEST_SUBMITTED',
            entity_type='DonationRequest',
            entity_id=str(req.id),
            details={
                'donation_id': req.donation.id,
                'requested_quantity': float(req.requested_quantity)
            }
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsDonor])
    def accept(self, request, pk=None):
        """
        Donor accepts request: atomically reserves quantity and creates pickup assignment.
        Uses select_for_update to guarantee zero overbooking under concurrency.
        """
        notes = request.data.get('donor_notes', '')

        with transaction.atomic():
            req = get_object_or_404(
                DonationRequest.objects.select_for_update(),
                pk=pk,
                donation__donor=request.user
            )

            if req.status != DonationRequest.Status.PENDING:
                return Response(
                    {'error': f'Request is already {req.get_status_display()} and cannot be accepted.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Lock the donation record to check and deduct remaining quantity
            donation = Donation.objects.select_for_update().get(pk=req.donation.id)

            if req.requested_quantity > donation.available_quantity:
                return Response({
                    'error': f'Insufficient available food remaining! Only {donation.available_quantity} {donation.unit} available, but {req.requested_quantity} requested.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Deduct available quantity and increase reserved quantity
            donation.available_quantity -= req.requested_quantity
            donation.reserved_quantity += req.requested_quantity
            donation.save()

            # Update request status
            req.status = DonationRequest.Status.ACCEPTED
            req.donor_notes = notes
            req.responded_at = timezone.now()
            req.save()

            # Create Reservation record
            Reservation.objects.create(
                request=req,
                donation=donation,
                reserved_quantity=req.requested_quantity,
                is_active=True
            )

            # Automatically create PickupAssignment ready for volunteers
            PickupAssignment.objects.create(
                request=req,
                status=PickupAssignment.Status.READY_FOR_PICKUP
            )

            # Notify NGO
            donor_org = getattr(donation.donor, 'donor_profile', None)
            donor_label = donor_org.organization_name if donor_org else donation.donor.email

            Notification.objects.create(
                recipient=req.recipient,
                title="Donation Request Accepted! 🎉",
                message=f"{donor_label} accepted your request for {req.requested_quantity} {donation.unit} of '{donation.title}'. Food is reserved and pickup assignment has been posted.",
                notification_type=Notification.NotificationType.REQUEST_ACCEPTED,
                related_entity_type='request',
                related_entity_id=str(req.id)
            )

            # Broadcast notification to active volunteers
            for vol_user in User.objects.filter(role=User.Role.VOLUNTEER, is_verified=True)[:10]:
                Notification.objects.create(
                    recipient=vol_user,
                    title="New Food Rescue Pickup Available 🚚",
                    message=f"Pickup needed: {req.requested_quantity} {donation.unit} from {donation.pickup_address} to {req.recipient.email}.",
                    notification_type=Notification.NotificationType.PICKUP_READY,
                    related_entity_type='request',
                    related_entity_id=str(req.id)
                )

            # Audit log
            AuditLog.objects.create(
                user=request.user,
                action='REQUEST_ACCEPTED',
                entity_type='DonationRequest',
                entity_id=str(req.id),
                details={
                    'reserved_quantity': float(req.requested_quantity),
                    'remaining_available': float(donation.available_quantity)
                }
            )

        return Response(DonationRequestListSerializer(req).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsDonor])
    def reject(self, request, pk=None):
        reason = request.data.get('rejection_reason', 'Unable to fulfill at this time')
        donor_notes = request.data.get('donor_notes', '')

        with transaction.atomic():
            req = get_object_or_404(
                DonationRequest.objects.select_for_update(),
                pk=pk,
                donation__donor=request.user
            )

            if req.status != DonationRequest.Status.PENDING:
                return Response(
                    {'error': f'Cannot reject request with status {req.status}.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            req.status = DonationRequest.Status.REJECTED
            req.rejection_reason = reason
            req.donor_notes = donor_notes
            req.responded_at = timezone.now()
            req.save()

            Notification.objects.create(
                recipient=req.recipient,
                title="Donation Request Update",
                message=f"Your request for '{req.donation.title}' was declined. Reason: {reason}",
                notification_type=Notification.NotificationType.REQUEST_REJECTED,
                related_entity_type='request',
                related_entity_id=str(req.id)
            )

            AuditLog.objects.create(
                user=request.user,
                action='REQUEST_REJECTED',
                entity_type='DonationRequest',
                entity_id=str(req.id),
                details={'rejection_reason': reason}
            )

        return Response(DonationRequestListSerializer(req).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """
        NGO cancels their own request. If it was already accepted, releases the reserved quantity safely.
        """
        with transaction.atomic():
            req = get_object_or_404(DonationRequest.objects.select_for_update(), pk=pk)

            if req.recipient != request.user and not request.user.is_staff:
                return Response({'error': 'You do not have permission to cancel this request.'}, status=status.HTTP_403_FORBIDDEN)

            if req.status in [DonationRequest.Status.CANCELLED, DonationRequest.Status.REJECTED, DonationRequest.Status.FULFILLED]:
                return Response({'error': f'Request cannot be cancelled in state {req.status}.'}, status=status.HTTP_400_BAD_REQUEST)

            # If request was accepted, release quantity back to available!
            if req.status == DonationRequest.Status.ACCEPTED:
                donation = Donation.objects.select_for_update().get(pk=req.donation.id)
                donation.available_quantity += req.requested_quantity
                donation.reserved_quantity -= req.requested_quantity
                donation.save()

                # Deactivate reservation
                if hasattr(req, 'reservation'):
                    req.reservation.is_active = False
                    req.reservation.save()

                # Cancel pickup assignment if still pending or claimed
                if hasattr(req, 'pickup_assignment'):
                    pickup = req.pickup_assignment
                    pickup.status = PickupAssignment.Status.CANCELLED
                    pickup.failure_reason = 'Cancelled by recipient organization'
                    pickup.save()

                # Notify donor
                Notification.objects.create(
                    recipient=donation.donor,
                    title="Accepted Request Cancelled",
                    message=f"The accepted request by {req.recipient.email} for '{donation.title}' was cancelled. {req.requested_quantity} {donation.unit} has been restored to available inventory.",
                    notification_type=Notification.NotificationType.SYSTEM_ALERT
                )

            req.status = DonationRequest.Status.CANCELLED
            req.save()

            AuditLog.objects.create(
                user=request.user,
                action='REQUEST_CANCELLED',
                entity_type='DonationRequest',
                entity_id=str(req.id),
                details={'released_quantity': float(req.requested_quantity)}
            )

        return Response({'status': 'Request cancelled successfully.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def confirm_receipt(self, request, pk=None):
        """
        NGO recipient confirms food was safely received and provides quality rating and feedback.
        """
        with transaction.atomic():
            req = get_object_or_404(DonationRequest.objects.select_for_update(), pk=pk)

            if req.recipient != request.user and not request.user.is_staff:
                return Response({'error': 'Only the recipient NGO can confirm food delivery.'}, status=status.HTTP_403_FORBIDDEN)

            feedback = request.data.get('feedback', '')
            rating = request.data.get('rating', 5)

            req.recipient_feedback = feedback
            req.rating = int(rating) if rating else 5
            req.status = DonationRequest.Status.FULFILLED
            req.save(update_fields=['recipient_feedback', 'rating', 'status'])

            # If there was a pickup assignment, ensure it is marked DELIVERED
            if hasattr(req, 'pickup_assignment') and req.pickup_assignment.status != PickupAssignment.Status.DELIVERED:
                pickup = req.pickup_assignment
                pickup.status = PickupAssignment.Status.DELIVERED
                pickup.delivery_time = timezone.now()
                org = getattr(request.user, 'ngo_profile', None)
                pickup.recipient_signature_name = org.organization_name if org else request.user.username
                pickup.save()

            # Notify donor
            org_label = getattr(request.user, 'ngo_profile', None)
            org_name = org_label.organization_name if org_label else request.user.email
            Notification.objects.create(
                recipient=req.donation.donor,
                title="Food Delivery Confirmed by Recipient! 🌟",
                message=f"Recipient {org_name} confirmed delivery: '{feedback}' (Rating: {rating}/5)",
                notification_type=Notification.NotificationType.DELIVERY_COMPLETED,
                related_entity_type='request',
                related_entity_id=str(req.id)
            )

            AuditLog.objects.create(
                user=request.user,
                action='FOOD_DELIVERY_CONFIRMED',
                entity_type='DonationRequest',
                entity_id=str(req.id),
                details={'rating': rating, 'feedback': feedback}
            )

        return Response(DonationRequestListSerializer(req).data)

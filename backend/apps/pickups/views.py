from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import PickupAssignment, PickupStatusLog
from .serializers import PickupAssignmentSerializer, PickupStatusLogSerializer
from apps.accounts.models import User, AuditLog
from apps.accounts.permissions import IsVolunteer, IsVerified
from apps.notifications.models import Notification
from apps.requests_app.models import DonationRequest
from apps.donations.models import Donation


class PickupAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = PickupAssignmentSerializer
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'pickup_time', 'delivery_time']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return PickupAssignment.objects.none()

        if user.role == User.Role.VOLUNTEER:
            return PickupAssignment.objects.filter(
                models_Q_available_or_mine(user)
            ).select_related(
                'request', 'request__donation', 'request__recipient',
                'request__donation__donor', 'volunteer'
            )
        elif user.role == User.Role.DONOR:
            return PickupAssignment.objects.filter(
                request__donation__donor=user
            ).select_related('request', 'request__donation', 'request__recipient', 'volunteer')
        elif user.role == User.Role.NGO:
            return PickupAssignment.objects.filter(
                request__recipient=user
            ).select_related('request', 'request__donation', 'request__recipient', 'volunteer')
        elif user.role == User.Role.ADMIN or user.is_staff:
            return PickupAssignment.objects.all().select_related(
                'request', 'request__donation', 'request__recipient', 'volunteer'
            )
        return PickupAssignment.objects.none()

    def get_permissions(self):
        if self.action in ['claim', 'update_status']:
            return [permissions.IsAuthenticated(), IsVolunteer(), IsVerified()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def available_pool(self, request):
        """Pickups ready for assignment that have not been claimed."""
        queryset = PickupAssignment.objects.filter(
            status=PickupAssignment.Status.READY_FOR_PICKUP,
            volunteer__isnull=True
        ).select_related('request', 'request__donation', 'request__recipient')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_pickups(self, request):
        """Pickups assigned to current volunteer."""
        queryset = PickupAssignment.objects.filter(
            volunteer=request.user
        ).select_related('request', 'request__donation', 'request__recipient')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """Volunteer claims a pickup assignment."""
        with transaction.atomic():
            pickup = get_object_or_404(
                PickupAssignment.objects.select_for_update(),
                pk=pk
            )

            if pickup.status != PickupAssignment.Status.READY_FOR_PICKUP or pickup.volunteer is not None:
                return Response(
                    {'error': 'This pickup assignment has already been claimed or is not available.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            pickup.volunteer = request.user
            pickup.status = PickupAssignment.Status.CLAIMED
            pickup.save()

            # Record status log
            PickupStatusLog.objects.create(
                assignment=pickup,
                status=PickupAssignment.Status.CLAIMED,
                changed_by=request.user,
                notes=f"Claimed by volunteer {request.user.email}"
            )

            # Notify Donor & NGO
            vol_name = getattr(request.user, 'volunteer_profile', None)
            vol_label = vol_name.full_name if vol_name else request.user.email

            Notification.objects.create(
                recipient=pickup.request.donation.donor,
                title="Volunteer Assigned for Pickup 🚚",
                message=f"Volunteer {vol_label} has accepted the pickup for '{pickup.request.donation.title}'.",
                notification_type=Notification.NotificationType.PICKUP_CLAIMED,
                related_entity_type='pickup',
                related_entity_id=str(pickup.id)
            )

            Notification.objects.create(
                recipient=pickup.request.recipient,
                title="Volunteer Assigned for Delivery 🚚",
                message=f"Volunteer {vol_label} is handling your food delivery for '{pickup.request.donation.title}'.",
                notification_type=Notification.NotificationType.PICKUP_CLAIMED,
                related_entity_type='pickup',
                related_entity_id=str(pickup.id)
            )

            AuditLog.objects.create(
                user=request.user,
                action='PICKUP_CLAIMED',
                entity_type='PickupAssignment',
                entity_id=str(pickup.id),
                details={'volunteer': request.user.email}
            )

        return Response(PickupAssignmentSerializer(pickup).data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Volunteer updates status along valid lifecycle.
        Valid transitions:
        - CLAIMED -> EN_ROUTE_PICKUP
        - EN_ROUTE_PICKUP -> FOOD_COLLECTED
        - FOOD_COLLECTED -> EN_ROUTE_DELIVERY
        - EN_ROUTE_DELIVERY -> DELIVERED
        - ANY ACTIVE -> FAILED
        """
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        failure_reason = request.data.get('failure_reason', '')
        recipient_signature_name = request.data.get('recipient_signature_name', '')

        with transaction.atomic():
            pickup = get_object_or_404(
                PickupAssignment.objects.select_for_update(),
                pk=pk,
                volunteer=request.user
            )

            valid_transitions = {
                PickupAssignment.Status.CLAIMED: [
                    PickupAssignment.Status.EN_ROUTE_PICKUP,
                    PickupAssignment.Status.FAILED
                ],
                PickupAssignment.Status.EN_ROUTE_PICKUP: [
                    PickupAssignment.Status.FOOD_COLLECTED,
                    PickupAssignment.Status.FAILED
                ],
                PickupAssignment.Status.FOOD_COLLECTED: [
                    PickupAssignment.Status.EN_ROUTE_DELIVERY,
                    PickupAssignment.Status.FAILED
                ],
                PickupAssignment.Status.EN_ROUTE_DELIVERY: [
                    PickupAssignment.Status.DELIVERED,
                    PickupAssignment.Status.FAILED
                ],
            }

            allowed = valid_transitions.get(pickup.status, [])
            if new_status not in allowed:
                return Response({
                    'error': f"Invalid status transition from {pickup.status} to {new_status}. Allowed: {allowed}"
                }, status=status.HTTP_400_BAD_REQUEST)

            now = timezone.now()
            pickup.status = new_status
            if notes:
                pickup.handover_notes = notes

            if new_status == PickupAssignment.Status.FOOD_COLLECTED:
                pickup.pickup_time = now
                Notification.objects.create(
                    recipient=pickup.request.recipient,
                    title="Food Collected by Volunteer 🍱",
                    message=f"Food has been collected from the donor and is now in transit.",
                    notification_type=Notification.NotificationType.FOOD_COLLECTED,
                    related_entity_type='pickup',
                    related_entity_id=str(pickup.id)
                )

            elif new_status == PickupAssignment.Status.DELIVERED:
                pickup.delivery_time = now
                pickup.recipient_signature_name = recipient_signature_name or 'Verified by NGO Representative'

                # Complete the request
                req = pickup.request
                req.status = DonationRequest.Status.FULFILLED
                req.save(update_fields=['status'])

                # Update donation status if all reserved food is collected/delivered
                donation = req.donation
                if donation.available_quantity <= 0:
                    # Check if all requests for this donation are fulfilled
                    pending_or_accepted = donation.requests.filter(
                        status__in=[DonationRequest.Status.PENDING, DonationRequest.Status.ACCEPTED]
                    ).exclude(id=req.id).exists()
                    if not pending_or_accepted:
                        donation.status = Donation.Status.COMPLETED
                        donation.save(update_fields=['status'])

                Notification.objects.create(
                    recipient=pickup.request.donation.donor,
                    title="Food Rescued & Delivered Successfully! 🌟",
                    message=f"Your donation of '{donation.title}' was successfully delivered to {req.recipient.email}.",
                    notification_type=Notification.NotificationType.DELIVERY_COMPLETED,
                    related_entity_type='pickup',
                    related_entity_id=str(pickup.id)
                )

                Notification.objects.create(
                    recipient=pickup.request.recipient,
                    title="Delivery Received & Confirmed! 🥗",
                    message=f"Delivery of '{donation.title}' is confirmed. Thank you for rescuing surplus food!",
                    notification_type=Notification.NotificationType.DELIVERY_COMPLETED,
                    related_entity_type='pickup',
                    related_entity_id=str(pickup.id)
                )

            elif new_status == PickupAssignment.Status.FAILED:
                pickup.failure_reason = failure_reason or 'Volunteer reported delivery could not be completed.'
                
                # Release reserved quantity back to donation
                req = pickup.request
                donation = Donation.objects.select_for_update().get(pk=req.donation.id)
                donation.available_quantity += req.requested_quantity
                donation.reserved_quantity -= req.requested_quantity
                donation.save()

                req.status = DonationRequest.Status.CANCELLED
                req.save()

                Notification.objects.create(
                    recipient=donation.donor,
                    title="Pickup Attempt Failed ⚠️",
                    message=f"Pickup for '{donation.title}' failed: {pickup.failure_reason}. Available quantity was restored.",
                    notification_type=Notification.NotificationType.PICKUP_FAILED,
                    related_entity_type='pickup',
                    related_entity_id=str(pickup.id)
                )

            pickup.save()

            # Record log
            PickupStatusLog.objects.create(
                assignment=pickup,
                status=new_status,
                changed_by=request.user,
                notes=notes or failure_reason
            )

            AuditLog.objects.create(
                user=request.user,
                action=f'PICKUP_{new_status}',
                entity_type='PickupAssignment',
                entity_id=str(pickup.id),
                details={'status': new_status, 'notes': notes}
            )

        return Response(PickupAssignmentSerializer(pickup).data)


def models_Q_available_or_mine(user):
    from django.db.models import Q
    return Q(status=PickupAssignment.Status.READY_FOR_PICKUP) | Q(volunteer=user)

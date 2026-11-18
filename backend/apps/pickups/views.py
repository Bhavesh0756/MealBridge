from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.http import Http404

from .models import PickupAssignment, PickupStatusLog
from .serializers import PickupAssignmentSerializer, PickupStatusLogSerializer
from apps.accounts.models import User, AuditLog
from apps.accounts.permissions import IsVolunteer, IsVerified, IsAdminUserRole
from apps.notifications.models import Notification
from apps.requests_app.models import DonationRequest
from apps.donations.models import Donation


def resolve_pickup(pk, user, for_update=True):
    """
    Resolves a PickupAssignment given an identifier.
    Supports:
    - Direct PickupAssignment ID (pk)
    - Donation ID (request__donation_id)
    - DonationRequest ID (request_id)
    Returns a tuple: (pickup, flag)
    where flag can be:
    - 'assigned': Pickup belongs to current user
    - 'unassigned': Pickup is in available pool (volunteer is None)
    - 'other_volunteer': Pickup exists but is assigned to a different volunteer
    - 'not_found': No pickup matches
    """
    qs = PickupAssignment.objects.select_related(
        'request', 'request__donation', 'request__recipient',
        'request__donation__donor', 'volunteer'
    )
    if for_update:
        qs = qs.select_for_update()

    try:
        numeric_pk = int(pk)
    except (TypeError, ValueError):
        return None, 'not_found'

    # Step 1: Direct PK lookup across all pickups (exact primary key match takes precedence)
    direct_pickup = qs.filter(pk=numeric_pk).first()
    if direct_pickup:
        if direct_pickup.volunteer == user:
            return direct_pickup, 'assigned'
        elif direct_pickup.volunteer is None:
            return direct_pickup, 'unassigned'
        else:
            # Direct PK belongs to another volunteer.
            # If numeric_pk happens to also be a donation_id or request_id for the current user,
            # allow falling back to the current user's assignment.
            user_by_donation = qs.filter(request__donation_id=numeric_pk, volunteer=user).first()
            if user_by_donation:
                return user_by_donation, 'assigned'
            user_by_request = qs.filter(request_id=numeric_pk, volunteer=user).first()
            if user_by_request:
                return user_by_request, 'assigned'
            return direct_pickup, 'other_volunteer'

    # Step 2: Fallback when no pickup has pk as its primary key: check donation_id or request_id
    user_by_donation = qs.filter(request__donation_id=numeric_pk, volunteer=user).first()
    if user_by_donation:
        return user_by_donation, 'assigned'

    user_by_request = qs.filter(request_id=numeric_pk, volunteer=user).first()
    if user_by_request:
        return user_by_request, 'assigned'

    unassigned_by_donation = qs.filter(request__donation_id=numeric_pk, volunteer__isnull=True).first()
    if unassigned_by_donation:
        return unassigned_by_donation, 'unassigned'

    unassigned_by_request = qs.filter(request_id=numeric_pk, volunteer__isnull=True).first()
    if unassigned_by_request:
        return unassigned_by_request, 'unassigned'

    other_by_donation = qs.filter(request__donation_id=numeric_pk).first()
    if other_by_donation:
        return other_by_donation, 'other_volunteer'

    other_by_request = qs.filter(request_id=numeric_pk).first()
    if other_by_request:
        return other_by_request, 'other_volunteer'

    return None, 'not_found'


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
        if self.action in ['claim', 'unclaim', 'update_status']:
            return [permissions.IsAuthenticated(), (IsVolunteer | IsAdminUserRole)(), IsVerified()]
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
            pickup, flag = resolve_pickup(pk, request.user, for_update=True)
            if flag == 'not_found' or pickup is None:
                raise Http404("No PickupAssignment matches the given query.")

            if flag == 'assigned':
                # Already claimed by this volunteer
                return Response(PickupAssignmentSerializer(pickup).data)

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
    def unclaim(self, request, pk=None):
        """Volunteer releases a claimed assignment back to the available pool before food is collected."""
        reason = request.data.get('reason', 'Volunteer reported an unexpected scheduling conflict or emergency.')
        with transaction.atomic():
            pickup, flag = resolve_pickup(pk, request.user, for_update=True)
            if flag == 'not_found' or pickup is None:
                raise Http404("No PickupAssignment matches the given query.")

            is_admin = bool(request.user and (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser))
            if flag == 'other_volunteer' and not is_admin:
                return Response(
                    {'error': 'Cannot release an assignment assigned to another volunteer.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            if flag == 'unassigned' or pickup.volunteer is None:
                return Response(
                    {'error': 'This pickup assignment is already in the available pool.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if pickup.status not in [PickupAssignment.Status.CLAIMED, PickupAssignment.Status.EN_ROUTE_PICKUP]:
                return Response(
                    {'error': 'Cannot release mission once food has already been collected from the donor.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            previous_status = pickup.status
            pickup.volunteer = None
            pickup.status = PickupAssignment.Status.READY_FOR_PICKUP
            pickup.save()

            PickupStatusLog.objects.create(
                assignment=pickup,
                status=PickupAssignment.Status.READY_FOR_PICKUP,
                changed_by=request.user,
                notes=f"Released back to pool by volunteer ({reason})"
            )

            Notification.objects.create(
                recipient=pickup.request.recipient,
                title="Volunteer Reassignment Notice ℹ️",
                message=f"Mission for '{pickup.request.donation.title}' was returned to the pool ({reason}) and is available for other volunteers.",
                notification_type=Notification.NotificationType.PICKUP_CLAIMED,
                related_entity_type='pickup',
                related_entity_id=str(pickup.id)
            )

            AuditLog.objects.create(
                user=request.user,
                action='PICKUP_UNCLAIMED',
                entity_type='PickupAssignment',
                entity_id=str(pickup.id),
                details={'previous_status': previous_status, 'reason': reason}
            )

        return Response(PickupAssignmentSerializer(pickup).data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Volunteer updates status along valid lifecycle.
        Valid transitions:
        - READY_FOR_PICKUP -> CLAIMED, EN_ROUTE_PICKUP, FAILED
        - CLAIMED -> EN_ROUTE_PICKUP, FAILED
        - EN_ROUTE_PICKUP -> FOOD_COLLECTED, FAILED
        - FOOD_COLLECTED -> EN_ROUTE_DELIVERY, FAILED
        - EN_ROUTE_DELIVERY -> DELIVERED, FAILED
        - ANY ACTIVE -> FAILED
        """
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        failure_reason = request.data.get('failure_reason', '')
        recipient_signature_name = request.data.get('recipient_signature_name', '')

        with transaction.atomic():
            pickup, flag = resolve_pickup(pk, request.user, for_update=True)
            if flag == 'not_found' or pickup is None:
                raise Http404("No PickupAssignment matches the given query.")

            is_admin = bool(request.user and (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser))
            if flag == 'other_volunteer' and not is_admin:
                return Response(
                    {'error': 'This pickup assignment is assigned to another volunteer.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Auto-assign if unassigned
            was_unassigned = (flag == 'unassigned') or (pickup.volunteer is None)
            if was_unassigned:
                pickup.volunteer = request.user

            valid_transitions = {
                PickupAssignment.Status.READY_FOR_PICKUP: [
                    PickupAssignment.Status.CLAIMED,
                    PickupAssignment.Status.EN_ROUTE_PICKUP,
                    PickupAssignment.Status.FAILED
                ],
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

            # If claiming from READY_FOR_PICKUP directly or via EN_ROUTE_PICKUP
            if was_unassigned and new_status != PickupAssignment.Status.CLAIMED:
                PickupStatusLog.objects.create(
                    assignment=pickup,
                    status=PickupAssignment.Status.CLAIMED,
                    changed_by=request.user,
                    notes=f"Auto-assigned to volunteer {request.user.email}"
                )
                AuditLog.objects.create(
                    user=request.user,
                    action='PICKUP_CLAIMED',
                    entity_type='PickupAssignment',
                    entity_id=str(pickup.id),
                    details={'volunteer': request.user.email}
                )

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

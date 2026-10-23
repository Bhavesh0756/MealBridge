from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.requests_app.models import DonationRequest


class PickupAssignment(models.Model):
    class Status(models.TextChoices):
        READY_FOR_PICKUP = 'READY_FOR_PICKUP', _('Ready for Volunteer Assignment')
        CLAIMED = 'CLAIMED', _('Volunteer Assigned')
        EN_ROUTE_PICKUP = 'EN_ROUTE_PICKUP', _('En Route to Donor')
        FOOD_COLLECTED = 'FOOD_COLLECTED', _('Food Collected / In Transit')
        EN_ROUTE_DELIVERY = 'EN_ROUTE_DELIVERY', _('En Route to NGO')
        DELIVERED = 'DELIVERED', _('Successfully Delivered')
        FAILED = 'FAILED', _('Pickup / Delivery Failed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    request = models.OneToOneField(
        DonationRequest,
        on_delete=models.CASCADE,
        related_name='pickup_assignment'
    )
    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='pickup_assignments'
    )
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.READY_FOR_PICKUP
    )
    pickup_time = models.DateTimeField(null=True, blank=True)
    delivery_time = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True, default='')
    handover_notes = models.TextField(blank=True, default='')
    recipient_signature_name = models.CharField(max_length=150, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        vol = self.volunteer.email if self.volunteer else 'Unassigned'
        return f"Pickup #{self.id} for Req #{self.request.id} - {self.get_status_display()} ({vol})"


class PickupStatusLog(models.Model):
    assignment = models.ForeignKey(
        PickupAssignment,
        on_delete=models.CASCADE,
        related_name='logs'
    )
    status = models.CharField(max_length=30)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Log #{self.id} for Pickup #{self.assignment.id}: {self.status}"

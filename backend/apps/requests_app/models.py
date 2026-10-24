from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from apps.donations.models import Donation


class DonationRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending Donor Review')
        ACCEPTED = 'ACCEPTED', _('Accepted (Quantity Reserved)')
        REJECTED = 'REJECTED', _('Rejected by Donor')
        CANCELLED = 'CANCELLED', _('Cancelled by NGO')
        FULFILLED = 'FULFILLED', _('Fulfilled & Delivered')

    donation = models.ForeignKey(
        Donation,
        on_delete=models.PROTECT,
        related_name='requests'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donation_requests'
    )
    requested_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    beneficiary_notes = models.TextField(
        blank=True,
        default='',
        help_text=_('Details regarding target beneficiaries, distribution plan, and transport readiness.')
    )
    donor_notes = models.TextField(
        blank=True,
        default='',
        help_text=_('Donor comments or reasons for acceptance/rejection.')
    )
    rejection_reason = models.CharField(max_length=255, blank=True, default='')
    recipient_feedback = models.TextField(
        blank=True,
        default='',
        help_text=_('Feedback from NGO upon food delivery receipt.')
    )
    rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        help_text=_('Food quality & handover rating from 1 to 5.')
    )
    
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Req #{self.id}: {self.requested_quantity} {self.donation.unit} of '{self.donation.title}' by {self.recipient.email}"


class Reservation(models.Model):
    request = models.OneToOneField(
        DonationRequest,
        on_delete=models.CASCADE,
        related_name='reservation'
    )
    donation = models.ForeignKey(
        Donation,
        on_delete=models.CASCADE,
        related_name='reservations'
    )
    reserved_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Reservation for Req #{self.request.id} ({self.reserved_quantity} {self.donation.unit})"

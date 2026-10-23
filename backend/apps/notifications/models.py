from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        REQUEST_RECEIVED = 'REQUEST_RECEIVED', _('New Donation Request')
        REQUEST_ACCEPTED = 'REQUEST_ACCEPTED', _('Request Accepted')
        REQUEST_REJECTED = 'REQUEST_REJECTED', _('Request Rejected')
        PICKUP_READY = 'PICKUP_READY', _('Pickup Ready for Assignment')
        PICKUP_CLAIMED = 'PICKUP_CLAIMED', _('Volunteer Claimed Pickup')
        FOOD_COLLECTED = 'FOOD_COLLECTED', _('Food Collected by Volunteer')
        DELIVERY_COMPLETED = 'DELIVERY_COMPLETED', _('Food Delivered Successfully')
        PICKUP_FAILED = 'PICKUP_FAILED', _('Pickup Issue / Failed')
        DEADLINE_APPROACHING = 'DEADLINE_APPROACHING', _('Pickup Deadline Approaching')
        ACCOUNT_VERIFIED = 'ACCOUNT_VERIFIED', _('Account Verified')
        SYSTEM_ALERT = 'SYSTEM_ALERT', _('System Notice')

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM_ALERT
    )
    related_entity_type = models.CharField(max_length=50, blank=True, default='')
    related_entity_id = models.CharField(max_length=50, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.email}: {self.title} (read={self.is_read})"

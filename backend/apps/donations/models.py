from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class FoodCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    icon_name = models.CharField(max_length=50, default='Utensils')

    class Meta:
        verbose_name_plural = 'Food Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Donation(models.Model):
    class Unit(models.TextChoices):
        KG = 'KG', _('Kilograms (kg)')
        MEALS = 'MEALS', _('Meals / Portions')
        BOXES = 'BOXES', _('Boxes / Containers')
        PACKETS = 'PACKETS', _('Packets')
        LITERS = 'LITERS', _('Liters (L)')

    class StorageRequirement(models.TextChoices):
        ROOM_TEMPERATURE = 'ROOM_TEMPERATURE', _('Room Temperature (Dry/Packaged)')
        REFRIGERATED = 'REFRIGERATED', _('Refrigerated (0°C to 4°C)')
        FROZEN = 'FROZEN', _('Frozen (-18°C or below)')
        HOT_HOLDING = 'HOT_HOLDING', _('Hot Holding (Above 63°C)')

    class DietaryType(models.TextChoices):
        VEGETARIAN = 'VEGETARIAN', _('Vegetarian')
        VEGAN = 'VEGAN', _('Vegan')
        NON_VEGETARIAN = 'NON_VEGETARIAN', _('Non-Vegetarian')
        CONTAINS_EGG = 'CONTAINS_EGG', _('Contains Egg')

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        AVAILABLE = 'AVAILABLE', _('Available for Request')
        PARTIALLY_RESERVED = 'PARTIALLY_RESERVED', _('Partially Reserved')
        FULLY_RESERVED = 'FULLY_RESERVED', _('Fully Reserved')
        COMPLETED = 'COMPLETED', _('Completed / Rescued')
        CANCELLED = 'CANCELLED', _('Cancelled by Donor')
        EXPIRED = 'EXPIRED', _('Expired')
        SUSPENDED = 'SUSPENDED', _('Suspended by Admin')

    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donations'
    )
    title = models.CharField(max_length=200)
    category = models.ForeignKey(
        FoodCategory,
        on_delete=models.PROTECT,
        related_name='donations'
    )
    description = models.TextField(blank=True, default='')
    
    # Quantities
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, choices=Unit.choices, default=Unit.MEALS)
    available_quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reserved_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)

    # Time bounds
    preparation_time = models.DateTimeField()
    pickup_deadline = models.DateTimeField()

    # Storage and safety
    storage_requirement = models.CharField(
        max_length=30,
        choices=StorageRequirement.choices,
        default=StorageRequirement.ROOM_TEMPERATURE
    )
    dietary_type = models.CharField(
        max_length=30,
        choices=DietaryType.choices,
        default=DietaryType.VEGETARIAN
    )
    allergens = models.CharField(max_length=255, blank=True, default='None declared')

    # Location
    pickup_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default='Metro City')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, default=19.0760)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, default=72.8777)
    contact_phone = models.CharField(max_length=25, blank=True, default='')
    special_instructions = models.TextField(blank=True, default='')

    # Visual proof
    image = models.ImageField(upload_to='donations/', null=True, blank=True)

    # Status
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.AVAILABLE
    )

    # Food Safety Checklist (Strictly enforced)
    safety_checklist_completed = models.BooleanField(default=False)
    hygiene_verified = models.BooleanField(default=False)
    properly_stored = models.BooleanField(default=False)
    tamper_free_sealed = models.BooleanField(default=False)
    safety_disclaimer_accepted = models.BooleanField(default=False)
    
    # Admin Moderation / Safety Flagging
    is_flagged_unsafe = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True, default='')
    suspended_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='suspended_donations'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['pickup_deadline', '-created_at']

    def save(self, *args, **kwargs):
        # Auto-update status based on available quantity and expiration
        if not self.pk:
            if self.available_quantity is None:
                self.available_quantity = self.quantity
        else:
            if self.status not in [self.Status.CANCELLED, self.Status.SUSPENDED, self.Status.COMPLETED]:
                if timezone.now() > self.pickup_deadline:
                    self.status = self.Status.EXPIRED
                elif self.available_quantity <= 0 and self.reserved_quantity > 0:
                    self.status = self.Status.FULLY_RESERVED
                elif self.reserved_quantity > 0 and self.available_quantity > 0:
                    self.status = self.Status.PARTIALLY_RESERVED
                elif self.available_quantity == self.quantity:
                    self.status = self.Status.AVAILABLE

        super().save(*args, **kwargs)

    @property
    def is_requestable(self):
        return (
            self.status in [self.Status.AVAILABLE, self.Status.PARTIALLY_RESERVED] and
            self.available_quantity > 0 and
            timezone.now() < self.pickup_deadline and
            not self.is_flagged_unsafe and
            self.safety_checklist_completed
        )

    def __str__(self):
        return f"{self.title} ({self.available_quantity}/{self.quantity} {self.unit})"

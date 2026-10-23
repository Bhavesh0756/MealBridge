from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    class Role(models.TextChoices):
        DONOR = 'DONOR', _('Food Donor')
        NGO = 'NGO', _('NGO / Recipient Organization')
        VOLUNTEER = 'VOLUNTEER', _('Pickup Volunteer')
        ADMIN = 'ADMIN', _('Administrator')

    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', _('Pending Verification')
        VERIFIED = 'VERIFIED', _('Verified')
        REJECTED = 'REJECTED', _('Rejected')

    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.DONOR)
    phone_number = models.CharField(max_length=20, blank=True, default='')
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def save(self, *args, **kwargs):
        # Admins and superusers are automatically verified
        if self.role == self.Role.ADMIN or self.is_superuser:
            self.role = self.Role.ADMIN
            self.is_verified = True
            self.verification_status = self.VerificationStatus.VERIFIED
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class DonorProfile(models.Model):
    class DonorType(models.TextChoices):
        RESTAURANT = 'RESTAURANT', _('Restaurant')
        CATERER = 'CATERER', _('Caterer / Banquet')
        EVENT_ORGANIZER = 'EVENT_ORGANIZER', _('Event Organizer')
        CANTEEN = 'CANTEEN', _('Corporate / College Canteen')
        SUPERMARKET = 'SUPERMARKET', _('Supermarket / Bakery')
        INDIVIDUAL = 'INDIVIDUAL', _('Individual / Community Donor')

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='donor_profile')
    organization_name = models.CharField(max_length=255)
    donor_type = models.CharField(max_length=30, choices=DonorType.choices, default=DonorType.RESTAURANT)
    license_number = models.CharField(max_length=100, blank=True, default='')
    contact_person = models.CharField(max_length=150, blank=True, default='')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default='Metro City')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, default=19.0760)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, default=72.8777)
    operating_hours = models.CharField(max_length=120, blank=True, default='9:00 AM - 11:00 PM')
    bio = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.organization_name} ({self.user.email})"


class NgoProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ngo_profile')
    organization_name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, blank=True, default='')
    contact_person = models.CharField(max_length=150, blank=True, default='')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, default='Metro City')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, default=19.0820)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, default=72.8850)
    served_population = models.CharField(max_length=200, blank=True, default='Shelters, orphanages, and daily wage workers')
    daily_capacity_meals = models.PositiveIntegerField(default=200)
    cold_storage_available = models.BooleanField(default=False)
    mission_statement = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.organization_name} ({self.user.email})"


class VolunteerProfile(models.Model):
    class VehicleType(models.TextChoices):
        FOOT_OR_BICYCLE = 'FOOT_OR_BICYCLE', _('Foot / Bicycle')
        MOTORCYCLE = 'MOTORCYCLE', _('Motorcycle / Scooter')
        CAR = 'CAR', _('Car / Hatchback')
        VAN_TEMPO = 'VAN_TEMPO', _('Van / Delivery Tempo')

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    full_name = models.CharField(max_length=150)
    vehicle_type = models.CharField(max_length=30, choices=VehicleType.choices, default=VehicleType.MOTORCYCLE)
    max_transport_capacity_kg = models.PositiveIntegerField(default=30)
    id_proof_number = models.CharField(max_length=100, blank=True, default='')
    is_available = models.BooleanField(default=True)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, default=19.0750)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, default=72.8770)

    def __str__(self):
        return f"Volunteer: {self.full_name} ({self.user.email})"


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    entity_type = models.CharField(max_length=60)
    entity_id = models.CharField(max_length=60)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {self.action} by {self.user}"

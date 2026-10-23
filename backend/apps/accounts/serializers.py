from rest_framework import serializers
from django.db import transaction
from .models import User, DonorProfile, NgoProfile, VolunteerProfile, AuditLog


class DonorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorProfile
        fields = [
            'id', 'organization_name', 'donor_type', 'license_number',
            'contact_person', 'address', 'city', 'latitude', 'longitude',
            'operating_hours', 'bio'
        ]


class NgoProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NgoProfile
        fields = [
            'id', 'organization_name', 'registration_number', 'contact_person',
            'address', 'city', 'latitude', 'longitude', 'served_population',
            'daily_capacity_meals', 'cold_storage_available', 'mission_statement'
        ]


class VolunteerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerProfile
        fields = [
            'id', 'full_name', 'vehicle_type', 'max_transport_capacity_kg',
            'id_proof_number', 'is_available', 'current_latitude', 'current_longitude'
        ]


class UserSerializer(serializers.ModelSerializer):
    donor_profile = DonorProfileSerializer(read_only=True)
    ngo_profile = NgoProfileSerializer(read_only=True)
    volunteer_profile = VolunteerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'phone_number',
            'is_verified', 'verification_status', 'created_at',
            'donor_profile', 'ngo_profile', 'volunteer_profile'
        ]
        read_only_fields = ['id', 'is_verified', 'verification_status', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # Profile details provided during registration
    organization_name = serializers.CharField(required=False, allow_blank=True, default='')
    address = serializers.CharField(required=False, allow_blank=True, default='')
    city = serializers.CharField(required=False, allow_blank=True, default='Metro City')
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, default=19.0760)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, default=72.8777)
    
    # NGO specific
    registration_number = serializers.CharField(required=False, allow_blank=True, default='')
    cold_storage_available = serializers.BooleanField(required=False, default=False)
    
    # Volunteer specific
    vehicle_type = serializers.CharField(required=False, allow_blank=True, default='MOTORCYCLE')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'role', 'phone_number',
            'organization_name', 'address', 'city', 'latitude', 'longitude',
            'registration_number', 'cold_storage_available', 'vehicle_type'
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', User.Role.DONOR)
        
        # Extract profile fields
        org_name = validated_data.pop('organization_name', '') or validated_data.get('username')
        address = validated_data.pop('address', '') or '123 Rescue Way'
        city = validated_data.pop('city', 'Metro City')
        lat = validated_data.pop('latitude', 19.0760)
        lng = validated_data.pop('longitude', 72.8777)
        reg_number = validated_data.pop('registration_number', '')
        cold_storage = validated_data.pop('cold_storage_available', False)
        vehicle_type = validated_data.pop('vehicle_type', 'MOTORCYCLE')

        user = User.objects.create_user(password=password, **validated_data)

        # Create respective role profile
        if role == User.Role.DONOR:
            DonorProfile.objects.create(
                user=user,
                organization_name=org_name,
                address=address,
                city=city,
                latitude=lat,
                longitude=lng
            )
        elif role == User.Role.NGO:
            NgoProfile.objects.create(
                user=user,
                organization_name=org_name,
                registration_number=reg_number,
                address=address,
                city=city,
                latitude=lat,
                longitude=lng,
                cold_storage_available=cold_storage
            )
        elif role == User.Role.VOLUNTEER:
            VolunteerProfile.objects.create(
                user=user,
                full_name=org_name or user.username,
                vehicle_type=vehicle_type,
                current_latitude=lat,
                current_longitude=lng
            )

        # Create audit entry
        AuditLog.objects.create(
            user=user,
            action='USER_REGISTERED',
            entity_type='User',
            entity_id=str(user.id),
            details={'role': role, 'email': user.email}
        )

        return user


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_email', 'action', 'entity_type', 'entity_id', 'details', 'ip_address', 'timestamp']

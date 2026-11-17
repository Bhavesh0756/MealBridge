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
    # Nested profile objects support (sent by frontend forms)
    donor_profile = serializers.DictField(required=False, write_only=True)
    ngo_profile = serializers.DictField(required=False, write_only=True)
    volunteer_profile = serializers.DictField(required=False, write_only=True)

    # Flat profile details provided during registration
    organization_name = serializers.CharField(required=False, allow_blank=True, default='')
    donor_type = serializers.CharField(required=False, allow_blank=True, default='RESTAURANT')
    license_number = serializers.CharField(required=False, allow_blank=True, default='')
    address = serializers.CharField(required=False, allow_blank=True, default='')
    city = serializers.CharField(required=False, allow_blank=True, default='Metro City')
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, default=19.0760)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, default=72.8777)
    
    # NGO specific
    registration_number = serializers.CharField(required=False, allow_blank=True, default='')
    daily_capacity_meals = serializers.IntegerField(required=False, default=200)
    cold_storage_available = serializers.BooleanField(required=False, default=False)
    
    # Volunteer specific
    full_name = serializers.CharField(required=False, allow_blank=True, default='')
    vehicle_type = serializers.CharField(required=False, allow_blank=True, default='MOTORCYCLE')
    max_transport_capacity_kg = serializers.IntegerField(required=False, default=30)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'role', 'phone_number',
            'donor_profile', 'ngo_profile', 'volunteer_profile',
            'organization_name', 'donor_type', 'license_number', 'address', 'city',
            'latitude', 'longitude', 'registration_number', 'daily_capacity_meals',
            'cold_storage_available', 'full_name', 'vehicle_type', 'max_transport_capacity_kg'
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', User.Role.DONOR)
        
        # Pop nested profiles if provided
        donor_data = validated_data.pop('donor_profile', {}) or {}
        ngo_data = validated_data.pop('ngo_profile', {}) or {}
        volunteer_data = validated_data.pop('volunteer_profile', {}) or {}

        # Pop flat profile fields
        flat_org_name = validated_data.pop('organization_name', '')
        flat_donor_type = validated_data.pop('donor_type', 'RESTAURANT')
        flat_license = validated_data.pop('license_number', '')
        flat_address = validated_data.pop('address', '')
        flat_city = validated_data.pop('city', 'Metro City')
        flat_lat = validated_data.pop('latitude', 19.0760)
        flat_lng = validated_data.pop('longitude', 72.8777)
        flat_reg_number = validated_data.pop('registration_number', '')
        flat_daily_capacity = validated_data.pop('daily_capacity_meals', 200)
        flat_cold_storage = validated_data.pop('cold_storage_available', False)
        flat_full_name = validated_data.pop('full_name', '')
        flat_vehicle_type = validated_data.pop('vehicle_type', 'MOTORCYCLE')
        flat_max_capacity = validated_data.pop('max_transport_capacity_kg', 30)

        # Build clean user creation dictionary
        user_kwargs = {
            'email': validated_data['email'],
            'username': validated_data.get('username') or validated_data['email'].split('@')[0],
            'role': role,
            'phone_number': validated_data.get('phone_number', ''),
        }

        user = User.objects.create_user(password=password, **user_kwargs)

        # Create respective role profile with consolidated values
        if role == User.Role.DONOR:
            org_name = donor_data.get('organization_name') or flat_org_name or f"{user.username} Kitchen"
            donor_type = donor_data.get('donor_type') or flat_donor_type or DonorProfile.DonorType.RESTAURANT
            license_number = donor_data.get('license_number') or flat_license or ''
            address = donor_data.get('address') or flat_address or '123 Rescue Way'
            city = donor_data.get('city') or flat_city or 'Metro City'
            lat = donor_data.get('latitude') or flat_lat
            lng = donor_data.get('longitude') or flat_lng

            DonorProfile.objects.create(
                user=user,
                organization_name=org_name,
                donor_type=donor_type,
                license_number=license_number,
                address=address,
                city=city,
                latitude=lat,
                longitude=lng
            )
        elif role == User.Role.NGO:
            org_name = ngo_data.get('organization_name') or flat_org_name or f"{user.username} Welfare"
            reg_number = ngo_data.get('registration_number') or flat_reg_number or ''
            address = ngo_data.get('address') or flat_address or '123 Rescue Way'
            city = ngo_data.get('city') or flat_city or 'Metro City'
            lat = ngo_data.get('latitude') or flat_lat
            lng = ngo_data.get('longitude') or flat_lng
            daily_capacity = ngo_data.get('daily_capacity_meals') or flat_daily_capacity or 200
            cold_storage = ngo_data.get('cold_storage_available') if 'cold_storage_available' in ngo_data else flat_cold_storage

            NgoProfile.objects.create(
                user=user,
                organization_name=org_name,
                registration_number=reg_number,
                address=address,
                city=city,
                latitude=lat,
                longitude=lng,
                daily_capacity_meals=daily_capacity,
                cold_storage_available=cold_storage
            )
        elif role == User.Role.VOLUNTEER:
            full_name = volunteer_data.get('full_name') or flat_full_name or flat_org_name or user.username
            vehicle_type = volunteer_data.get('vehicle_type') or flat_vehicle_type or VolunteerProfile.VehicleType.MOTORCYCLE
            max_capacity = volunteer_data.get('max_transport_capacity_kg') or flat_max_capacity or 30
            lat = volunteer_data.get('latitude') or volunteer_data.get('current_latitude') or flat_lat
            lng = volunteer_data.get('longitude') or volunteer_data.get('current_longitude') or flat_lng

            VolunteerProfile.objects.create(
                user=user,
                full_name=full_name,
                vehicle_type=vehicle_type,
                max_transport_capacity_kg=max_capacity,
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

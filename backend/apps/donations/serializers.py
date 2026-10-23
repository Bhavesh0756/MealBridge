from rest_framework import serializers
from django.utils import timezone
from .models import FoodCategory, Donation
from apps.accounts.serializers import DonorProfileSerializer


class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = ['id', 'name', 'slug', 'description', 'icon_name']


class DonationListSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    donor_organization = serializers.SerializerMethodField()
    is_requestable = serializers.ReadOnlyField()

    class Meta:
        model = Donation
        fields = [
            'id', 'title', 'category', 'category_name', 'quantity', 'unit',
            'available_quantity', 'reserved_quantity', 'status',
            'preparation_time', 'pickup_deadline', 'storage_requirement',
            'dietary_type', 'pickup_address', 'city', 'latitude', 'longitude',
            'image', 'donor_organization', 'is_requestable',
            'safety_checklist_completed', 'is_flagged_unsafe', 'created_at'
        ]

    def get_donor_organization(self, obj):
        if hasattr(obj.donor, 'donor_profile'):
            return obj.donor.donor_profile.organization_name
        return obj.donor.username


class DonationDetailSerializer(serializers.ModelSerializer):
    category = FoodCategorySerializer(read_only=True)
    donor_profile = serializers.SerializerMethodField()
    is_requestable = serializers.ReadOnlyField()
    active_requests_count = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            'id', 'donor', 'donor_profile', 'title', 'category', 'description',
            'quantity', 'unit', 'available_quantity', 'reserved_quantity',
            'preparation_time', 'pickup_deadline', 'storage_requirement',
            'dietary_type', 'allergens', 'pickup_address', 'city',
            'latitude', 'longitude', 'contact_phone', 'special_instructions',
            'image', 'status', 'is_requestable',
            'safety_checklist_completed', 'hygiene_verified', 'properly_stored',
            'tamper_free_sealed', 'safety_disclaimer_accepted',
            'is_flagged_unsafe', 'flag_reason', 'created_at', 'updated_at',
            'active_requests_count'
        ]
        read_only_fields = [
            'id', 'donor', 'available_quantity', 'reserved_quantity', 'status',
            'is_flagged_unsafe', 'flag_reason', 'created_at', 'updated_at'
        ]

    def get_donor_profile(self, obj):
        if hasattr(obj.donor, 'donor_profile'):
            return DonorProfileSerializer(obj.donor.donor_profile).data
        return {'organization_name': obj.donor.username, 'email': obj.donor.email}

    def get_active_requests_count(self, obj):
        return obj.requests.exclude(status__in=['REJECTED', 'CANCELLED']).count()


class DonationCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            'id', 'title', 'category', 'description', 'quantity', 'unit',
            'preparation_time', 'pickup_deadline', 'storage_requirement',
            'dietary_type', 'allergens', 'pickup_address', 'city',
            'latitude', 'longitude', 'contact_phone', 'special_instructions',
            'image', 'safety_checklist_completed', 'hygiene_verified',
            'properly_stored', 'tamper_free_sealed', 'safety_disclaimer_accepted'
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Donation quantity must be greater than zero.")
        return value

    def validate(self, attrs):
        prep_time = attrs.get('preparation_time')
        pickup_deadline = attrs.get('pickup_deadline')

        if pickup_deadline and pickup_deadline <= timezone.now():
            raise serializers.ValidationError({"pickup_deadline": "Pickup deadline must be in the future."})

        if prep_time and pickup_deadline and pickup_deadline <= prep_time:
            raise serializers.ValidationError({"pickup_deadline": "Pickup deadline must be after preparation time."})

        # Food safety checklist requirements
        if not attrs.get('safety_checklist_completed'):
            raise serializers.ValidationError({"safety_checklist_completed": "Food safety checklist must be completed."})
        if not attrs.get('safety_disclaimer_accepted'):
            raise serializers.ValidationError({"safety_disclaimer_accepted": "Food safety terms and disclaimer must be acknowledged."})

        return attrs

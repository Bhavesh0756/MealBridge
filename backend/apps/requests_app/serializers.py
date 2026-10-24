from rest_framework import serializers
from .models import DonationRequest, Reservation
from apps.donations.serializers import DonationListSerializer
from apps.accounts.serializers import UserSerializer, NgoProfileSerializer


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['id', 'reserved_quantity', 'created_at', 'is_active']


class DonationRequestListSerializer(serializers.ModelSerializer):
    donation = DonationListSerializer(read_only=True)
    recipient_organization = serializers.SerializerMethodField()
    has_pickup_assignment = serializers.SerializerMethodField()
    pickup_status = serializers.SerializerMethodField()
    volunteer_details = serializers.SerializerMethodField()

    class Meta:
        model = DonationRequest
        fields = [
            'id', 'donation', 'recipient', 'recipient_organization',
            'requested_quantity', 'status', 'beneficiary_notes',
            'donor_notes', 'rejection_reason', 'responded_at',
            'created_at', 'has_pickup_assignment', 'pickup_status',
            'volunteer_details'
        ]

    def get_recipient_organization(self, obj):
        if hasattr(obj.recipient, 'ngo_profile'):
            return obj.recipient.ngo_profile.organization_name
        return obj.recipient.username

    def get_has_pickup_assignment(self, obj):
        return hasattr(obj, 'pickup_assignment')

    def get_pickup_status(self, obj):
        if hasattr(obj, 'pickup_assignment'):
            return obj.pickup_assignment.status
        return None

    def get_volunteer_details(self, obj):
        if hasattr(obj, 'pickup_assignment') and obj.pickup_assignment.volunteer:
            v = obj.pickup_assignment.volunteer
            name = getattr(v, 'volunteer_profile', None)
            return {
                'name': name.full_name if name else v.username,
                'phone': v.phone_number or '+91 98000 00000',
                'vehicle': name.vehicle_type if name else 'Motorcycle',
            }
        return None


class DonationRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationRequest
        fields = ['id', 'donation', 'requested_quantity', 'beneficiary_notes']

    def validate_requested_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Requested quantity must be greater than zero.")
        return value

    def validate(self, attrs):
        donation = attrs.get('donation')
        requested_qty = attrs.get('requested_quantity')

        if not donation.is_requestable:
            raise serializers.ValidationError({"donation": "This donation is currently not open or eligible for requests."})

        if requested_qty > donation.available_quantity:
            raise serializers.ValidationError({
                "requested_quantity": f"Requested quantity ({requested_qty} {donation.unit}) exceeds currently available amount ({donation.available_quantity} {donation.unit})."
            })

        return attrs

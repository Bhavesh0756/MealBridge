from rest_framework import serializers
from .models import PickupAssignment, PickupStatusLog
from apps.requests_app.serializers import DonationRequestListSerializer
from apps.accounts.serializers import VolunteerProfileSerializer


class PickupStatusLogSerializer(serializers.ModelSerializer):
    changed_by_email = serializers.ReadOnlyField(source='changed_by.email')

    class Meta:
        model = PickupStatusLog
        fields = ['id', 'status', 'changed_by', 'changed_by_email', 'notes', 'timestamp']


class PickupAssignmentSerializer(serializers.ModelSerializer):
    request_details = DonationRequestListSerializer(source='request', read_only=True)
    volunteer_name = serializers.SerializerMethodField()
    volunteer_phone = serializers.SerializerMethodField()
    pickup_assignment_id = serializers.ReadOnlyField(source='id')
    donation_id = serializers.SerializerMethodField()
    donation_title = serializers.SerializerMethodField()

    class Meta:
        model = PickupAssignment
        fields = [
            'id', 'pickup_assignment_id', 'request', 'request_details', 'volunteer', 'volunteer_name',
            'volunteer_phone', 'status', 'pickup_time', 'delivery_time',
            'failure_reason', 'handover_notes', 'recipient_signature_name',
            'donation_id', 'donation_title',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'pickup_assignment_id', 'created_at', 'updated_at']

    def get_donation_id(self, obj):
        if obj.request and obj.request.donation:
            return obj.request.donation.id
        return None

    def get_donation_title(self, obj):
        if obj.request and obj.request.donation:
            return obj.request.donation.title
        return None

    def get_volunteer_name(self, obj):
        if obj.volunteer:
            if hasattr(obj.volunteer, 'volunteer_profile'):
                return obj.volunteer.volunteer_profile.full_name
            return obj.volunteer.username
        return None

    def get_volunteer_phone(self, obj):
        if obj.volunteer:
            return obj.volunteer.phone_number
        return None

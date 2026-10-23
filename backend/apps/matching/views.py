from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404

from .services import SmartMatchingService
from apps.donations.models import Donation
from apps.accounts.models import User
from apps.accounts.permissions import IsNgo, IsDonor


class NgoRecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Returns smart-matched donations ranked for the calling NGO."""
        radius = float(request.query_params.get('radius', 25.0))
        limit = int(request.query_params.get('limit', 20))
        matches = SmartMatchingService.match_donations_for_ngo(
            request.user,
            max_radius_km=radius,
            limit=limit
        )
        return Response({
            'count': len(matches),
            'radius_km': radius,
            'matches': matches
        })


class DonationNgoMatchesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, donation_id):
        """Returns smart-matched NGOs for a specific donation."""
        donation = get_object_or_404(Donation, id=donation_id)
        if request.user != donation.donor and not request.user.is_staff:
            return Response(
                {'error': 'Only the donor or admin can view matched NGOs for this listing.'},
                status=status.HTTP_403_FORBIDDEN
            )
        radius = float(request.query_params.get('radius', 30.0))
        limit = int(request.query_params.get('limit', 10))
        matches = SmartMatchingService.match_ngos_for_donation(
            donation,
            max_radius_km=radius,
            limit=limit
        )
        return Response({
            'donation_id': donation.id,
            'donation_title': donation.title,
            'matches': matches
        })

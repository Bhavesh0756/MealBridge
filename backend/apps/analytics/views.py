from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from apps.donations.models import Donation
from apps.requests_app.models import DonationRequest
from apps.pickups.models import PickupAssignment
from apps.accounts.models import User, DonorProfile, NgoProfile, VolunteerProfile


class AnalyticsDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role

        # Base platform stats
        total_donations_created = Donation.objects.count()
        total_active_listings = Donation.objects.filter(
            status__in=[Donation.Status.AVAILABLE, Donation.Status.PARTIALLY_RESERVED]
        ).count()
        
        # Completed / delivered assignments
        completed_pickups = PickupAssignment.objects.filter(
            status=PickupAssignment.Status.DELIVERED
        )
        total_completed_pickups = completed_pickups.count()
        total_failed_pickups = PickupAssignment.objects.filter(
            status=PickupAssignment.Status.FAILED
        ).count()

        # Rescued quantity calculation (from fulfilled requests)
        fulfilled_requests = DonationRequest.objects.filter(
            status=DonationRequest.Status.FULFILLED
        ).select_related('donation')

        total_rescued_meals = 0
        total_rescued_kg = 0.0

        for req in fulfilled_requests:
            qty = float(req.requested_quantity)
            unit = req.donation.unit
            if unit == Donation.Unit.MEALS:
                total_rescued_meals += int(qty)
                total_rescued_kg += qty * 0.42  # 0.42 kg / meal UN FAO standard
            elif unit == Donation.Unit.KG:
                total_rescued_kg += qty
                total_rescued_meals += int(qty / 0.42)
            elif unit == Donation.Unit.BOXES:
                total_rescued_kg += qty * 5.0
                total_rescued_meals += int(qty * 12)
            else:
                total_rescued_kg += qty
                total_rescued_meals += int(qty)

        # Environmental metrics (Documented assumptions)
        # 1 kg diverted food ~ 2.5 kg CO2e saved (EPA / WRAP food loss index)
        # 1 kg diverted food ~ 1000 liters embedded agricultural water conserved
        co2_avoided_kg = round(total_rescued_kg * 2.5, 1)
        water_saved_liters = round(total_rescued_kg * 1000, 0)

        # Role-specific stats
        role_stats = {}
        if role == User.Role.DONOR:
            my_donations = Donation.objects.filter(donor=user)
            role_stats = {
                'my_donations_count': my_donations.count(),
                'active_donations_count': my_donations.filter(status__in=[Donation.Status.AVAILABLE, Donation.Status.PARTIALLY_RESERVED]).count(),
                'completed_donations_count': my_donations.filter(status=Donation.Status.COMPLETED).count(),
                'pending_requests_count': DonationRequest.objects.filter(donation__donor=user, status=DonationRequest.Status.PENDING).count(),
            }
        elif role == User.Role.NGO:
            my_requests = DonationRequest.objects.filter(recipient=user)
            role_stats = {
                'total_requests_submitted': my_requests.count(),
                'pending_review': my_requests.filter(status=DonationRequest.Status.PENDING).count(),
                'accepted_in_transit': my_requests.filter(status=DonationRequest.Status.ACCEPTED).count(),
                'fulfilled_deliveries': my_requests.filter(status=DonationRequest.Status.FULFILLED).count(),
            }
        elif role == User.Role.VOLUNTEER:
            my_pickups = PickupAssignment.objects.filter(volunteer=user)
            role_stats = {
                'claimed_pickups': my_pickups.count(),
                'active_in_transit': my_pickups.filter(status__in=[
                    PickupAssignment.Status.CLAIMED,
                    PickupAssignment.Status.EN_ROUTE_PICKUP,
                    PickupAssignment.Status.FOOD_COLLECTED,
                    PickupAssignment.Status.EN_ROUTE_DELIVERY
                ]).count(),
                'completed_deliveries': my_pickups.filter(status=PickupAssignment.Status.DELIVERED).count(),
                'available_in_pool': PickupAssignment.objects.filter(status=PickupAssignment.Status.READY_FOR_PICKUP, volunteer__isnull=True).count(),
            }
        elif role == User.Role.ADMIN or user.is_staff:
            role_stats = {
                'total_users': User.objects.count(),
                'pending_verifications': User.objects.filter(verification_status=User.VerificationStatus.PENDING).count(),
                'flagged_unsafe_listings': Donation.objects.filter(is_flagged_unsafe=True).count(),
                'total_volunteers': User.objects.filter(role=User.Role.VOLUNTEER).count(),
                'total_donors': User.objects.filter(role=User.Role.DONOR).count(),
                'total_ngos': User.objects.filter(role=User.Role.NGO).count(),
            }

        # Trend data: Last 7 days donation volume
        now = timezone.now()
        trend_days = []
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            count = Donation.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count()
            rescued_count = PickupAssignment.objects.filter(
                status=PickupAssignment.Status.DELIVERED,
                delivery_time__gte=day_start,
                delivery_time__lt=day_end
            ).count()
            trend_days.append({
                'date': day_start.strftime('%a'),
                'donations': count,
                'deliveries': rescued_count
            })

        return Response({
            'impact_metrics': {
                'meals_rescued': total_rescued_meals,
                'food_diverted_kg': round(total_rescued_kg, 1),
                'co2_avoided_kg': co2_avoided_kg,
                'water_saved_liters': water_saved_liters,
                'calculation_standards': {
                    'meal_weight_kg': 0.42,
                    'co2_factor_kg_per_kg_food': 2.5,
                    'water_liters_per_kg_food': 1000,
                    'source': 'UN FAO Food Loss & EPA Waste Reduction Model (WARM)'
                }
            },
            'platform_overview': {
                'total_donations': total_donations_created,
                'active_listings': total_active_listings,
                'completed_deliveries': total_completed_pickups,
                'failed_attempts': total_failed_pickups,
                'delivery_success_rate': round((total_completed_pickups / max(1, total_completed_pickups + total_failed_pickups)) * 100, 1)
            },
            'role_specific': role_stats,
            'weekly_trends': trend_days
        })

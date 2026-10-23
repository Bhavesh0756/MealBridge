import math
from datetime import timedelta
from django.utils import timezone
from apps.donations.models import Donation
from apps.accounts.models import NgoProfile, User


def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth (in km)
    using the Haversine formula.
    """
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999.0

    try:
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    except (ValueError, TypeError):
        return 999.0

    r = 6371.0  # Earth radius in kilometers

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


class SmartMatchingService:
    @staticmethod
    def match_donations_for_ngo(ngo_user, max_radius_km=25.0, limit=20):
        """
        Rank available donations specifically tailored for an NGO.
        Considers NGO location, daily capacity, and cold storage capabilities.
        """
        ngo_profile = getattr(ngo_user, 'ngo_profile', None)
        ngo_lat = ngo_profile.latitude if ngo_profile else 19.0820
        ngo_lon = ngo_profile.longitude if ngo_profile else 72.8850
        has_cold_storage = ngo_profile.cold_storage_available if ngo_profile else False
        daily_capacity = ngo_profile.daily_capacity_meals if ngo_profile else 200

        now = timezone.now()
        active_donations = Donation.objects.filter(
            status__in=[Donation.Status.AVAILABLE, Donation.Status.PARTIALLY_RESERVED],
            pickup_deadline__gt=now,
            available_quantity__gt=0,
            is_flagged_unsafe=False,
            safety_checklist_completed=True
        ).select_related('donor', 'donor__donor_profile', 'category')

        matches = []
        for donation in active_donations:
            dist = calculate_haversine_distance(
                ngo_lat, ngo_lon,
                donation.latitude, donation.longitude
            )

            # Skip if far beyond max radius
            if dist > max_radius_km:
                continue

            score = 0
            reasons = []
            warnings = []

            # 1. Distance scoring (Max 30 points)
            if dist <= 3.0:
                score += 30
                reasons.append(f"Ultra-local pickup: only {dist} km away")
            elif dist <= 8.0:
                score += 22
                reasons.append(f"Nearby pickup: {dist} km away")
            elif dist <= 15.0:
                score += 15
                reasons.append(f"Within feasible transport radius: {dist} km")
            else:
                score += 8

            # 2. Urgency / Remaining Time (Max 25 points)
            remaining_hours = (donation.pickup_deadline - now).total_seconds() / 3600.0
            if remaining_hours <= 2.5:
                score += 25
                reasons.append(f"🔥 Critical rescue urgency: expires in {remaining_hours:.1f} hours")
            elif remaining_hours <= 6.0:
                score += 18
                reasons.append(f"High urgency: pickup deadline in {remaining_hours:.1f} hours")
            elif remaining_hours <= 12.0:
                score += 12
                reasons.append(f"Same-day pickup: {remaining_hours:.1f} hours remaining")
            else:
                score += 6

            # 3. Capacity & Quantity fit (Max 20 points)
            qty = float(donation.available_quantity)
            if qty <= daily_capacity:
                score += 20
                reasons.append(f"Fits your shelter capacity ({int(qty)} / {daily_capacity} meals)")
            else:
                score += 10
                warnings.append(f"Large batch ({int(qty)} {donation.unit}) - partial reservation recommended")

            # 4. Storage Compatibility (Max 15 points)
            needs_cold = donation.storage_requirement in [
                Donation.StorageRequirement.REFRIGERATED,
                Donation.StorageRequirement.FROZEN
            ]
            if needs_cold:
                if has_cold_storage:
                    score += 15
                    reasons.append("Matched for your certified cold storage facilities")
                else:
                    score -= 10
                    warnings.append(f"Requires cold storage ({donation.get_storage_requirement_display()})")
            else:
                score += 15
                reasons.append(f"Standard room temperature storage ({donation.get_storage_requirement_display()})")

            # 5. Verification status (Max 10 points)
            if getattr(donation.donor, 'is_verified', False):
                score += 10
                reasons.append("Verified donor organization")

            matches.append({
                'donation_id': donation.id,
                'title': donation.title,
                'category_name': donation.category.name,
                'category_icon': donation.category.icon_name,
                'quantity': float(donation.quantity),
                'available_quantity': float(donation.available_quantity),
                'unit': donation.unit,
                'dietary_type': donation.get_dietary_type_display(),
                'storage_requirement': donation.get_storage_requirement_display(),
                'pickup_deadline': donation.pickup_deadline.isoformat(),
                'remaining_hours': round(remaining_hours, 1),
                'distance_km': dist,
                'pickup_address': donation.pickup_address,
                'latitude': float(donation.latitude),
                'longitude': float(donation.longitude),
                'donor_name': getattr(donation.donor, 'donor_profile', None).organization_name if hasattr(donation.donor, 'donor_profile') else donation.donor.email,
                'donor_verified': donation.donor.is_verified,
                'match_score': max(0, min(100, score)),
                'reasons': reasons,
                'warnings': warnings
            })

        matches.sort(key=lambda x: x['match_score'], reverse=True)
        return matches[:limit]

    @staticmethod
    def match_ngos_for_donation(donation, max_radius_km=30.0, limit=10):
        """
        Rank suitable NGOs for a given donation to suggest proactive outreach or auto-allocation.
        """
        ngos = NgoProfile.objects.select_related('user').filter(user__is_verified=True)
        matches = []
        now = timezone.now()
        remaining_hours = (donation.pickup_deadline - now).total_seconds() / 3600.0

        for ngo in ngos:
            dist = calculate_haversine_distance(
                donation.latitude, donation.longitude,
                ngo.latitude, ngo.longitude
            )
            if dist > max_radius_km:
                continue

            score = 50
            reasons = []

            if dist <= 4.0:
                score += 30
                reasons.append(f"Located {dist} km away")
            elif dist <= 12.0:
                score += 20
                reasons.append(f"Located {dist} km away")

            if float(donation.available_quantity) <= ngo.daily_capacity_meals:
                score += 15
                reasons.append(f"Can absorb batch into daily {ngo.daily_capacity_meals} meals capacity")

            if donation.storage_requirement in [Donation.StorageRequirement.REFRIGERATED, Donation.StorageRequirement.FROZEN]:
                if ngo.cold_storage_available:
                    score += 15
                    reasons.append("Equipped with verified cold storage")

            matches.append({
                'ngo_id': ngo.id,
                'user_id': ngo.user.id,
                'organization_name': ngo.organization_name,
                'contact_person': ngo.contact_person,
                'address': ngo.address,
                'city': ngo.city,
                'latitude': float(ngo.latitude) if ngo.latitude else None,
                'longitude': float(ngo.longitude) if ngo.longitude else None,
                'distance_km': dist,
                'daily_capacity_meals': ngo.daily_capacity_meals,
                'cold_storage_available': ngo.cold_storage_available,
                'match_score': min(100, score),
                'reasons': reasons
            })

        matches.sort(key=lambda x: x['match_score'], reverse=True)
        return matches[:limit]

from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, DonorProfile, NgoProfile, VolunteerProfile
from apps.donations.models import FoodCategory, Donation
from apps.requests_app.models import DonationRequest, Reservation
from apps.pickups.models import PickupAssignment
from apps.matching.services import SmartMatchingService, calculate_haversine_distance
from apps.notifications.models import Notification


class MealBridgeCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.now = timezone.now()

        # Categories
        self.category = FoodCategory.objects.create(
            name='Prepared Meals',
            slug='prepared-meals'
        )

        # Users
        self.donor_user = User.objects.create_user(
            username='donor1',
            email='donor1@test.com',
            password='Password@123',
            role=User.Role.DONOR,
            is_verified=True,
            verification_status=User.VerificationStatus.VERIFIED
        )
        self.donor_profile = DonorProfile.objects.create(
            user=self.donor_user,
            organization_name='Test Bistro',
            address='Bandra West',
            latitude=Decimal('19.0596'),
            longitude=Decimal('72.8295')
        )

        self.ngo_user = User.objects.create_user(
            username='ngo1',
            email='ngo1@test.com',
            password='Password@123',
            role=User.Role.NGO,
            is_verified=True,
            verification_status=User.VerificationStatus.VERIFIED
        )
        self.ngo_profile = NgoProfile.objects.create(
            user=self.ngo_user,
            organization_name='Test Shelter NGO',
            address='Kurla West',
            latitude=Decimal('19.0720'),
            longitude=Decimal('72.8750'),
            cold_storage_available=True,
            daily_capacity_meals=300
        )

        self.volunteer_user = User.objects.create_user(
            username='vol1',
            email='vol1@test.com',
            password='Password@123',
            role=User.Role.VOLUNTEER,
            is_verified=True,
            verification_status=User.VerificationStatus.VERIFIED
        )
        self.volunteer_profile = VolunteerProfile.objects.create(
            user=self.volunteer_user,
            full_name='Test Volunteer',
            current_latitude=Decimal('19.0650'),
            current_longitude=Decimal('72.8500')
        )

        # Sample Donation
        self.donation = Donation.objects.create(
            donor=self.donor_user,
            title='Test Rice & Curry Trays',
            category=self.category,
            quantity=Decimal('100.0'),
            available_quantity=Decimal('100.0'),
            reserved_quantity=Decimal('0.0'),
            unit=Donation.Unit.MEALS,
            preparation_time=self.now - timedelta(hours=1),
            pickup_deadline=self.now + timedelta(hours=4),
            storage_requirement=Donation.StorageRequirement.ROOM_TEMPERATURE,
            dietary_type=Donation.DietaryType.VEGETARIAN,
            pickup_address='Bandra West',
            latitude=Decimal('19.0596'),
            longitude=Decimal('72.8295'),
            status=Donation.Status.AVAILABLE,
            safety_checklist_completed=True,
            hygiene_verified=True,
            properly_stored=True,
            tamper_free_sealed=True,
            safety_disclaimer_accepted=True
        )

    def test_authentication_and_jwt_token(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'donor1@test.com',
            'password': 'Password@123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_role_permissions_for_donation_creation(self):
        # NGO user attempting to create donation should be forbidden
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.post('/api/donations/listings/', {
            'title': 'Illegal NGO Donation',
            'category': self.category.id,
            'quantity': 50,
            'unit': 'MEALS',
            'preparation_time': self.now.isoformat(),
            'pickup_deadline': (self.now + timedelta(hours=3)).isoformat(),
            'storage_requirement': 'ROOM_TEMPERATURE',
            'dietary_type': 'VEGETARIAN',
            'pickup_address': 'Kurla West',
            'safety_checklist_completed': True,
            'hygiene_verified': True,
            'properly_stored': True,
            'tamper_free_sealed': True,
            'safety_disclaimer_accepted': True
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Verified Donor user can create donation
        self.client.force_authenticate(user=self.donor_user)
        response = self.client.post('/api/donations/listings/', {
            'title': 'Valid Donor Feast',
            'category': self.category.id,
            'quantity': 50,
            'unit': 'MEALS',
            'preparation_time': self.now.isoformat(),
            'pickup_deadline': (self.now + timedelta(hours=3)).isoformat(),
            'storage_requirement': 'ROOM_TEMPERATURE',
            'dietary_type': 'VEGETARIAN',
            'pickup_address': 'Bandra West',
            'safety_checklist_completed': True,
            'hygiene_verified': True,
            'properly_stored': True,
            'tamper_free_sealed': True,
            'safety_disclaimer_accepted': True
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_request_acceptance_and_overbooking_prevention(self):
        self.client.force_authenticate(user=self.ngo_user)
        # 1. NGO submits request for 60 meals
        req_resp = self.client.post('/api/requests/', {
            'donation': self.donation.id,
            'requested_quantity': 60,
            'beneficiary_notes': 'Shelter evening food'
        })
        self.assertEqual(req_resp.status_code, status.HTTP_201_CREATED)
        req_id = req_resp.data['id']

        # 2. Donor accepts request
        self.client.force_authenticate(user=self.donor_user)
        accept_resp = self.client.post(f'/api/requests/{req_id}/accept/')
        self.assertEqual(accept_resp.status_code, status.HTTP_200_OK)

        self.donation.refresh_from_db()
        self.assertEqual(self.donation.available_quantity, Decimal('40.0'))
        self.assertEqual(self.donation.reserved_quantity, Decimal('60.0'))
        self.assertEqual(self.donation.status, Donation.Status.PARTIALLY_RESERVED)

        # 3. Submitting a request with quantity exceeding available quantity is blocked at submission
        self.client.force_authenticate(user=self.ngo_user)
        req2_resp = self.client.post('/api/requests/', {
            'donation': self.donation.id,
            'requested_quantity': 50,  # Only 40 remaining
            'beneficiary_notes': 'Exceeding remaining'
        })
        self.assertEqual(req2_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('requested_quantity', req2_resp.data)

        # 4. If a request was placed when food was available, but concurrent acceptance reduces quantity below it
        req3 = DonationRequest.objects.create(
            donation=self.donation,
            recipient=self.ngo_user,
            requested_quantity=Decimal('45.0'),
            status=DonationRequest.Status.PENDING
        )
        self.client.force_authenticate(user=self.donor_user)
        overbook_resp = self.client.post(f'/api/requests/{req3.id}/accept/')
        self.assertEqual(overbook_resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient available food remaining', overbook_resp.data['error'])

    def test_cancellation_releases_reserved_quantity(self):
        # Create and accept a request
        self.client.force_authenticate(user=self.ngo_user)
        req_resp = self.client.post('/api/requests/', {
            'donation': self.donation.id,
            'requested_quantity': 40
        })
        req_id = req_resp.data['id']

        self.client.force_authenticate(user=self.donor_user)
        self.client.post(f'/api/requests/{req_id}/accept/')

        self.donation.refresh_from_db()
        self.assertEqual(self.donation.available_quantity, Decimal('60.0'))

        # NGO cancels their accepted request
        self.client.force_authenticate(user=self.ngo_user)
        cancel_resp = self.client.post(f'/api/requests/{req_id}/cancel/')
        self.assertEqual(cancel_resp.status_code, status.HTTP_200_OK)

        self.donation.refresh_from_db()
        # Reserved quantity must be restored to available
        self.assertEqual(self.donation.available_quantity, Decimal('100.0'))
        self.assertEqual(self.donation.reserved_quantity, Decimal('0.0'))

    def test_smart_matching_service(self):
        matches = SmartMatchingService.match_donations_for_ngo(self.ngo_user)
        self.assertGreaterEqual(len(matches), 1)
        top_match = matches[0]
        self.assertIn('match_score', top_match)
        self.assertIn('distance_km', top_match)
        self.assertIn('reasons', top_match)
        self.assertGreater(top_match['match_score'], 50)

    def test_volunteer_pickup_lifecycle(self):
        # 1. Create and accept request to generate PickupAssignment
        self.client.force_authenticate(user=self.ngo_user)
        req_resp = self.client.post('/api/requests/', {
            'donation': self.donation.id,
            'requested_quantity': 30
        })
        req_id = req_resp.data['id']

        self.client.force_authenticate(user=self.donor_user)
        self.client.post(f'/api/requests/{req_id}/accept/')

        req = DonationRequest.objects.get(id=req_id)
        pickup = req.pickup_assignment
        self.assertEqual(pickup.status, PickupAssignment.Status.READY_FOR_PICKUP)

        # 2. Volunteer claims pickup
        self.client.force_authenticate(user=self.volunteer_user)
        claim_resp = self.client.post(f'/api/pickups/{pickup.id}/claim/')
        self.assertEqual(claim_resp.status_code, status.HTTP_200_OK)

        # 3. Volunteer invalid transition check (cannot jump straight to DELIVERED)
        invalid_resp = self.client.post(f'/api/pickups/{pickup.id}/update_status/', {
            'status': PickupAssignment.Status.DELIVERED
        })
        self.assertEqual(invalid_resp.status_code, status.HTTP_400_BAD_REQUEST)

        # 4. Valid step-by-step lifecycle
        self.client.post(f'/api/pickups/{pickup.id}/update_status/', {'status': PickupAssignment.Status.EN_ROUTE_PICKUP})
        self.client.post(f'/api/pickups/{pickup.id}/update_status/', {'status': PickupAssignment.Status.FOOD_COLLECTED})
        self.client.post(f'/api/pickups/{pickup.id}/update_status/', {'status': PickupAssignment.Status.EN_ROUTE_DELIVERY})
        deliver_resp = self.client.post(f'/api/pickups/{pickup.id}/update_status/', {
            'status': PickupAssignment.Status.DELIVERED,
            'recipient_signature_name': 'Sister Maria'
        })
        self.assertEqual(deliver_resp.status_code, status.HTTP_200_OK)

        pickup.refresh_from_db()
        self.assertEqual(pickup.status, PickupAssignment.Status.DELIVERED)
        self.assertIsNotNone(pickup.delivery_time)

    def test_analytics_and_notifications(self):
        self.client.force_authenticate(user=self.donor_user)
        analytics_resp = self.client.get('/api/analytics/dashboard/')
        self.assertEqual(analytics_resp.status_code, status.HTTP_200_OK)
        self.assertIn('impact_metrics', analytics_resp.data)
        self.assertIn('meals_rescued', analytics_resp.data['impact_metrics'])
        self.assertIn('co2_avoided_kg', analytics_resp.data['impact_metrics'])

        notif_resp = self.client.get('/api/notifications/unread_count/')
        self.assertEqual(notif_resp.status_code, status.HTTP_200_OK)
        self.assertIn('unread_count', notif_resp.data)

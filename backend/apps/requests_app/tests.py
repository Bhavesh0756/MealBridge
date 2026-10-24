from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, DonorProfile, NgoProfile
from apps.donations.models import FoodCategory, Donation
from apps.requests_app.models import DonationRequest, Reservation
from apps.pickups.models import PickupAssignment


class DonationRequestLifecycleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.now = timezone.now()

        self.category = FoodCategory.objects.create(name='Test Category', slug='test-category')

        self.donor = User.objects.create_user(
            username='donor_test',
            email='donor_test@example.com',
            password='Password@123',
            role=User.Role.DONOR,
            is_verified=True,
            verification_status=User.VerificationStatus.VERIFIED
        )
        DonorProfile.objects.create(
            user=self.donor,
            organization_name='Baker Bistro',
            address='Colaba, Mumbai',
            latitude=Decimal('18.9220'),
            longitude=Decimal('72.8347')
        )

        self.ngo = User.objects.create_user(
            username='ngo_test',
            email='ngo_test@example.com',
            password='Password@123',
            role=User.Role.NGO,
            is_verified=True,
            verification_status=User.VerificationStatus.VERIFIED
        )
        NgoProfile.objects.create(
            user=self.ngo,
            organization_name='Hope Foundation',
            address='Dadar, Mumbai',
            latitude=Decimal('19.0178'),
            longitude=Decimal('72.8478'),
            daily_capacity_meals=500
        )

        self.donation = Donation.objects.create(
            donor=self.donor,
            title='50 Fresh Meal Boxes',
            category=self.category,
            quantity=Decimal('50.0'),
            available_quantity=Decimal('50.0'),
            reserved_quantity=Decimal('0.0'),
            unit=Donation.Unit.MEALS,
            preparation_time=self.now - timedelta(hours=1),
            pickup_deadline=self.now + timedelta(hours=5),
            storage_requirement=Donation.StorageRequirement.ROOM_TEMPERATURE,
            dietary_type=Donation.DietaryType.VEGETARIAN,
            pickup_address='Colaba, Mumbai',
            latitude=Decimal('18.9220'),
            longitude=Decimal('72.8347'),
            status=Donation.Status.AVAILABLE,
            safety_checklist_completed=True,
            hygiene_verified=True,
            properly_stored=True,
            tamper_free_sealed=True,
            safety_disclaimer_accepted=True
        )

    def test_ngo_create_request_and_donor_accept_reserves_inventory(self):
        self.client.force_authenticate(user=self.ngo)
        response = self.client.post('/api/requests/', {
            'donation': self.donation.id,
            'requested_quantity': 20,
            'beneficiary_notes': 'Distributing to 20 community elders.'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id = response.data['id']
        self.assertEqual(DonationRequest.objects.get(id=request_id).status, DonationRequest.Status.PENDING)

        # Now donor accepts and reserves inventory
        self.client.force_authenticate(user=self.donor)
        accept_res = self.client.post(f'/api/requests/{request_id}/accept/', {
            'donor_notes': 'Accepted, packed and ready.'
        })
        self.assertEqual(accept_res.status_code, status.HTTP_200_OK)

        self.donation.refresh_from_db()
        self.assertEqual(self.donation.available_quantity, Decimal('30.0'))
        self.assertEqual(self.donation.reserved_quantity, Decimal('20.0'))

    def test_donor_accept_request_creates_pickup(self):
        self.client.force_authenticate(user=self.ngo)
        req_res = self.client.post('/api/requests/', {
            'donation': self.donation.id,
            'requested_quantity': 25,
            'beneficiary_notes': 'Shelter evening distribution.'
        })
        request_id = req_res.data['id']

        # Donor accepts
        self.client.force_authenticate(user=self.donor)
        accept_res = self.client.post(f'/api/requests/{request_id}/accept/', {
            'donor_notes': 'Packed in thermal boxes, ready at back entrance.'
        })
        self.assertEqual(accept_res.status_code, status.HTTP_200_OK)
        self.assertTrue(PickupAssignment.objects.filter(request_id=request_id).exists())

    def test_ngo_confirm_receipt_with_rating(self):
        # Create and accept
        self.client.force_authenticate(user=self.ngo)
        req_res = self.client.post('/api/requests/', {
            'donation': self.donation.id,
            'requested_quantity': 15,
            'beneficiary_notes': 'Distribution.'
        })
        request_id = req_res.data['id']

        self.client.force_authenticate(user=self.donor)
        self.client.post(f'/api/requests/{request_id}/accept/', {})

        # NGO confirms receipt
        self.client.force_authenticate(user=self.ngo)
        confirm_res = self.client.post(f'/api/requests/{request_id}/confirm_receipt/', {
            'feedback': 'Excellent meal quality, warm and perfectly sealed!',
            'rating': 5
        })
        self.assertEqual(confirm_res.status_code, status.HTTP_200_OK)
        req_obj = DonationRequest.objects.get(id=request_id)
        self.assertEqual(req_obj.status, DonationRequest.Status.FULFILLED)
        self.assertEqual(req_obj.rating, 5)
        self.assertIn('Excellent meal quality', req_obj.recipient_feedback)

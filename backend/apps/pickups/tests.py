from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User, DonorProfile, NgoProfile, VolunteerProfile
from apps.donations.models import FoodCategory, Donation
from apps.requests_app.models import DonationRequest
from apps.pickups.models import PickupAssignment


class PickupLifecycleAndUnclaimTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.now = timezone.now()

        self.category = FoodCategory.objects.create(name='Produce', slug='produce')

        self.donor = User.objects.create_user(
            username='donor_vol_test',
            email='donor_vol@example.com',
            password='Password@123',
            role=User.Role.DONOR,
            is_verified=True,
            verification_status=User.VerificationStatus.VERIFIED
        )
        DonorProfile.objects.create(user=self.donor, organization_name='Farm Hub', address='Andheri')

        self.ngo = User.objects.create_user(
            username='ngo_vol_test',
            email='ngo_vol@example.com',
            password='Password@123',
            role=User.Role.NGO,
            is_verified=True,
            verification_status=User.VerificationStatus.VERIFIED
        )
        NgoProfile.objects.create(user=self.ngo, organization_name='Shelter Home', address='Bandra')

        self.volunteer = User.objects.create_user(
            username='vol_test',
            email='vol_test@example.com',
            password='Password@123',
            role=User.Role.VOLUNTEER,
            is_verified=True,
            verification_status=User.VerificationStatus.VERIFIED
        )
        VolunteerProfile.objects.create(user=self.volunteer, full_name='Courier Champion', vehicle_type='BIKE')

        self.donation = Donation.objects.create(
            donor=self.donor,
            title='40kg Fresh Apples',
            category=self.category,
            quantity=Decimal('40.0'),
            available_quantity=Decimal('0.0'),
            reserved_quantity=Decimal('40.0'),
            unit=Donation.Unit.KG,
            preparation_time=self.now,
            pickup_deadline=self.now + timedelta(hours=6),
            storage_requirement=Donation.StorageRequirement.ROOM_TEMPERATURE,
            dietary_type=Donation.DietaryType.VEGETARIAN,
            pickup_address='Andheri Market',
            status=Donation.Status.FULLY_RESERVED,
            safety_checklist_completed=True,
            hygiene_verified=True,
            properly_stored=True,
            tamper_free_sealed=True,
            safety_disclaimer_accepted=True
        )

        self.donation_request = DonationRequest.objects.create(
            donation=self.donation,
            recipient=self.ngo,
            requested_quantity=Decimal('40.0'),
            status=DonationRequest.Status.ACCEPTED
        )

        self.pickup = PickupAssignment.objects.create(
            request=self.donation_request,
            status=PickupAssignment.Status.READY_FOR_PICKUP
        )

    def test_volunteer_claim_and_lifecycle_updates(self):
        self.client.force_authenticate(user=self.volunteer)

        # 1. Claim
        claim_res = self.client.post(f'/api/pickups/{self.pickup.id}/claim/')
        self.assertEqual(claim_res.status_code, status.HTTP_200_OK)
        self.pickup.refresh_from_db()
        self.assertEqual(self.pickup.status, PickupAssignment.Status.CLAIMED)
        self.assertEqual(self.pickup.volunteer, self.volunteer)

        # 2. En Route
        update_res = self.client.post(f'/api/pickups/{self.pickup.id}/update_status/', {
            'status': 'EN_ROUTE_PICKUP'
        })
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)

        # 3. Collected
        update_res2 = self.client.post(f'/api/pickups/{self.pickup.id}/update_status/', {
            'status': 'FOOD_COLLECTED'
        })
        self.assertEqual(update_res2.status_code, status.HTTP_200_OK)

        # 4. En route delivery
        update_res3 = self.client.post(f'/api/pickups/{self.pickup.id}/update_status/', {
            'status': 'EN_ROUTE_DELIVERY'
        })
        self.assertEqual(update_res3.status_code, status.HTTP_200_OK)

        # 5. Delivered
        update_res4 = self.client.post(f'/api/pickups/{self.pickup.id}/update_status/', {
            'status': 'DELIVERED',
            'recipient_signature_name': 'Sister Teresa'
        })
        self.assertEqual(update_res4.status_code, status.HTTP_200_OK)
        self.pickup.refresh_from_db()
        self.assertEqual(self.pickup.status, PickupAssignment.Status.DELIVERED)

    def test_volunteer_unclaim_returns_to_pool(self):
        self.client.force_authenticate(user=self.volunteer)
        self.client.post(f'/api/pickups/{self.pickup.id}/claim/')

        # Unclaim before food collected
        unclaim_res = self.client.post(f'/api/pickups/{self.pickup.id}/unclaim/', {
            'reason': 'Flat tire on highway'
        })
        self.assertEqual(unclaim_res.status_code, status.HTTP_200_OK)
        self.pickup.refresh_from_db()
        self.assertEqual(self.pickup.status, PickupAssignment.Status.READY_FOR_PICKUP)
        self.assertIsNone(self.pickup.volunteer)

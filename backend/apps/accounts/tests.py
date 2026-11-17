from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.accounts.models import DonorProfile, NgoProfile, VolunteerProfile, AuditLog

User = get_user_model()


class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_donor_registration_and_db_storage(self):
        payload = {
            'email': 'artisanbakery@test.com',
            'username': 'artisan_bakery',
            'password': 'SecurePassword@123',
            'role': 'DONOR',
            'phone_number': '+91 98201 12345',
            'organization_name': 'Artisan Bakery & Cafe',
            'donor_type': 'SUPERMARKET',
            'license_number': 'FSSAI-MH-2026-99',
            'address': 'Hill Road, Bandra',
            'city': 'Mumbai',
            'donor_profile': {
                'organization_name': 'Artisan Bakery & Cafe',
                'donor_type': 'SUPERMARKET',
                'license_number': 'FSSAI-MH-2026-99',
                'address': 'Hill Road, Bandra',
                'city': 'Mumbai',
            }
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['tokens']['access'], response.data['access'])
        self.assertEqual(response.data['tokens']['refresh'], response.data['refresh'])

        # Verify user in database
        user = User.objects.get(email='artisanbakery@test.com')
        self.assertEqual(user.username, 'artisan_bakery')
        self.assertEqual(user.role, User.Role.DONOR)
        self.assertEqual(user.phone_number, '+91 98201 12345')
        self.assertFalse(user.is_verified)

        # Verify password is securely hashed
        self.assertTrue(user.password.startswith('pbkdf2_sha256$'))
        self.assertNotEqual(user.password, 'SecurePassword@123')
        self.assertTrue(user.check_password('SecurePassword@123'))

        # Verify profile created and populated
        self.assertTrue(hasattr(user, 'donor_profile'))
        profile = user.donor_profile
        self.assertEqual(profile.organization_name, 'Artisan Bakery & Cafe')
        self.assertEqual(profile.donor_type, 'SUPERMARKET')
        self.assertEqual(profile.license_number, 'FSSAI-MH-2026-99')
        self.assertEqual(profile.address, 'Hill Road, Bandra')
        self.assertEqual(profile.city, 'Mumbai')

        # Verify audit log created
        audit = AuditLog.objects.filter(user=user, action='USER_REGISTERED').first()
        self.assertIsNotNone(audit)

    def test_ngo_registration_and_db_storage(self):
        payload = {
            'email': 'carefoundation@test.com',
            'username': 'care_foundation',
            'password': 'SecurePassword@123',
            'role': 'NGO',
            'phone_number': '+91 98202 23456',
            'organization_name': 'Care Community Foundation',
            'registration_number': 'NGO-MH-887766',
            'address': 'Dharavi Main Road',
            'city': 'Mumbai',
            'daily_capacity_meals': 450,
            'cold_storage_available': True,
            'ngo_profile': {
                'organization_name': 'Care Community Foundation',
                'registration_number': 'NGO-MH-887766',
                'address': 'Dharavi Main Road',
                'city': 'Mumbai',
                'daily_capacity_meals': 450,
                'cold_storage_available': True,
            }
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email='carefoundation@test.com')
        self.assertEqual(user.role, User.Role.NGO)
        self.assertTrue(hasattr(user, 'ngo_profile'))
        profile = user.ngo_profile
        self.assertEqual(profile.organization_name, 'Care Community Foundation')
        self.assertEqual(profile.registration_number, 'NGO-MH-887766')
        self.assertEqual(profile.daily_capacity_meals, 450)
        self.assertTrue(profile.cold_storage_available)

    def test_volunteer_registration_and_db_storage(self):
        payload = {
            'email': 'quickcourier@test.com',
            'username': 'quick_courier',
            'password': 'SecurePassword@123',
            'role': 'VOLUNTEER',
            'phone_number': '+91 98203 34567',
            'full_name': 'Sam Courier',
            'vehicle_type': 'CAR',
            'max_transport_capacity_kg': 60,
            'volunteer_profile': {
                'full_name': 'Sam Courier',
                'vehicle_type': 'CAR',
                'max_transport_capacity_kg': 60,
            }
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email='quickcourier@test.com')
        self.assertEqual(user.role, User.Role.VOLUNTEER)
        self.assertTrue(hasattr(user, 'volunteer_profile'))
        profile = user.volunteer_profile
        self.assertEqual(profile.full_name, 'Sam Courier')
        self.assertEqual(profile.vehicle_type, 'CAR')
        self.assertEqual(profile.max_transport_capacity_kg, 60)

    def test_duplicate_email_registration_fails(self):
        payload = {
            'email': 'duplicate@test.com',
            'username': 'user_one',
            'password': 'SecurePassword@123',
            'role': 'DONOR',
        }
        res1 = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Attempt registration with duplicate email (different case)
        payload2 = {
            'email': 'DUPLICATE@test.com',
            'username': 'user_two',
            'password': 'SecurePassword@123',
            'role': 'DONOR',
        }
        res2 = self.client.post('/api/auth/register/', payload2, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res2.data)
        self.assertIn('already exists', str(res2.data['email'][0]).lower())

    def test_duplicate_username_registration_fails(self):
        payload1 = {
            'email': 'first@test.com',
            'username': 'samename',
            'password': 'SecurePassword@123',
            'role': 'DONOR',
        }
        res1 = self.client.post('/api/auth/register/', payload1, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        payload2 = {
            'email': 'second@test.com',
            'username': 'samename',
            'password': 'SecurePassword@123',
            'role': 'DONOR',
        }
        res2 = self.client.post('/api/auth/register/', payload2, format='json')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', res2.data)

    def test_short_password_validation_fails(self):
        payload = {
            'email': 'shortpass@test.com',
            'username': 'shortpass',
            'password': '123',
            'role': 'DONOR',
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_login_with_newly_registered_credentials(self):
        email = 'logintest@test.com'
        password = 'MyStrongPassword@2026'
        reg_payload = {
            'email': email,
            'username': 'logintest_user',
            'password': password,
            'role': 'DONOR',
            'organization_name': 'Login Test Cafe',
        }
        reg_res = self.client.post('/api/auth/register/', reg_payload, format='json')
        self.assertEqual(reg_res.status_code, status.HTTP_201_CREATED)

        # Login using registered credentials
        login_res = self.client.post('/api/auth/login/', {'email': email, 'password': password}, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)
        self.assertIn('refresh', login_res.data)

        # Access protected endpoint with token
        access_token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        me_res = self.client.get('/api/auth/me/')
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data['email'], email)
        self.assertEqual(me_res.data['username'], 'logintest_user')
        self.assertEqual(me_res.data['role'], 'DONOR')
        self.assertEqual(me_res.data['donor_profile']['organization_name'], 'Login Test Cafe')

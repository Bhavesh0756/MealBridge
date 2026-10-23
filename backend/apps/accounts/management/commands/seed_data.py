from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.accounts.models import User, DonorProfile, NgoProfile, VolunteerProfile, AuditLog
from apps.donations.models import FoodCategory, Donation
from apps.requests_app.models import DonationRequest, Reservation
from apps.pickups.models import PickupAssignment, PickupStatusLog
from apps.notifications.models import Notification


class Command(BaseCommand):
    help = 'Seeds realistic production-style demonstration data for MealBridge'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("[SEED] Starting MealBridge database seeding..."))

        # 1. Food Categories
        categories_data = [
            {'name': 'Prepared Cooked Meals', 'slug': 'prepared-meals', 'icon_name': 'UtensilsCrossed', 'description': 'Freshly cooked curries, rice, pasta, casseroles from caterers & restaurants'},
            {'name': 'Bakery & Pastries', 'slug': 'bakery-pastries', 'icon_name': 'Croissant', 'description': 'Artisan bread, baguettes, muffins, buns, sandwich packs'},
            {'name': 'Fresh Produce & Fruits', 'slug': 'fresh-produce', 'icon_name': 'Apple', 'description': 'Surplus vegetables, fruit crates, salad greens from markets'},
            {'name': 'Dairy & Chilled Foods', 'slug': 'dairy-chilled', 'icon_name': 'Milk', 'description': 'Milk cartons, yogurt tubs, paneer, cheeses requiring cold storage'},
            {'name': 'Packaged Pantry Groceries', 'slug': 'packaged-groceries', 'icon_name': 'Package', 'description': 'Sealed canned goods, cereal, grains, pulses'},
            {'name': 'Banquet & Event Platters', 'slug': 'banquet-platters', 'icon_name': 'ConciergeBell', 'description': 'Corporate lunches, wedding buffet platters, catering trays'},
        ]

        cat_objs = {}
        for c in categories_data:
            cat, _ = FoodCategory.objects.get_or_create(
                slug=c['slug'],
                defaults={'name': c['name'], 'icon_name': c['icon_name'], 'description': c['description']}
            )
            cat_objs[c['slug']] = cat

        # 2. Users
        default_pwd = 'Password@123'

        # Admin
        admin_user, _ = User.objects.get_or_create(
            email='admin@mealbridge.org',
            defaults={
                'username': 'admin_mealbridge',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
                'verification_status': User.VerificationStatus.VERIFIED,
                'phone_number': '+91 98200 11223'
            }
        )
        admin_user.set_password(default_pwd)
        admin_user.save()

        # Donors
        donor1, _ = User.objects.get_or_create(
            email='greenbistro@mealbridge.org',
            defaults={
                'username': 'green_bistro',
                'role': User.Role.DONOR,
                'is_verified': True,
                'verification_status': User.VerificationStatus.VERIFIED,
                'phone_number': '+91 98111 22334'
            }
        )
        donor1.set_password(default_pwd)
        donor1.save()
        DonorProfile.objects.update_or_create(
            user=donor1,
            defaults={
                'organization_name': 'The Green Bistro & Artisan Bakery',
                'donor_type': DonorProfile.DonorType.RESTAURANT,
                'license_number': 'FSSAI-11223344556677',
                'contact_person': 'Chef Marcus Vance',
                'address': 'Plot 45, Bandra West',
                'city': 'Mumbai',
                'latitude': Decimal('19.0596'),
                'longitude': Decimal('72.8295'),
                'operating_hours': '8:00 AM - 11:30 PM',
                'bio': 'Upscale farm-to-table bistro committed to zero food waste in commercial kitchens.'
            }
        )

        donor2, _ = User.objects.get_or_create(
            email='grandcaterers@mealbridge.org',
            defaults={
                'username': 'grand_caterers',
                'role': User.Role.DONOR,
                'is_verified': True,
                'verification_status': User.VerificationStatus.VERIFIED,
                'phone_number': '+91 98333 44556'
            }
        )
        donor2.set_password(default_pwd)
        donor2.save()
        DonorProfile.objects.update_or_create(
            user=donor2,
            defaults={
                'organization_name': 'Grand Royal Banquets & Caterers',
                'donor_type': DonorProfile.DonorType.CATERER,
                'license_number': 'FSSAI-99887766554433',
                'contact_person': 'Suresh Mehta',
                'address': 'Andheri Kurla Road, Sakinaka',
                'city': 'Mumbai',
                'latitude': Decimal('19.1070'),
                'longitude': Decimal('72.8870'),
                'operating_hours': '10:00 AM - 1:00 AM',
                'bio': 'High-volume catering service providing untouched surplus banquet feasts.'
            }
        )

        # NGOs
        ngo1, _ = User.objects.get_or_create(
            email='hopeshare@mealbridge.org',
            defaults={
                'username': 'hopeshare_ngo',
                'role': User.Role.NGO,
                'is_verified': True,
                'verification_status': User.VerificationStatus.VERIFIED,
                'phone_number': '+91 98444 55667'
            }
        )
        ngo1.set_password(default_pwd)
        ngo1.save()
        NgoProfile.objects.update_or_create(
            user=ngo1,
            defaults={
                'organization_name': 'HopeShare Community Food Bank',
                'registration_number': 'REG-NGO-MH-2018-9941',
                'contact_person': 'Ananya Sengupta',
                'address': 'Seva Kendra, Kurla West',
                'city': 'Mumbai',
                'latitude': Decimal('19.0720'),
                'longitude': Decimal('72.8750'),
                'served_population': 'Homeless shelters, daily wage labor camps, and community soup kitchens',
                'daily_capacity_meals': 450,
                'cold_storage_available': True,
                'mission_statement': 'Feeding hungry families and building food sovereignty across urban settlements.'
            }
        )

        ngo2, _ = User.objects.get_or_create(
            email='sheltercare@mealbridge.org',
            defaults={
                'username': 'sheltercare_ngo',
                'role': User.Role.NGO,
                'is_verified': True,
                'verification_status': User.VerificationStatus.VERIFIED,
                'phone_number': '+91 98555 66778'
            }
        )
        ngo2.set_password(default_pwd)
        ngo2.save()
        NgoProfile.objects.update_or_create(
            user=ngo2,
            defaults={
                'organization_name': 'ShelterCare Outreach Foundation',
                'registration_number': 'REG-NGO-MH-2021-3104',
                'contact_person': 'David Dsouza',
                'address': 'Near Santacruz Station East',
                'city': 'Mumbai',
                'latitude': Decimal('19.0830'),
                'longitude': Decimal('72.8440'),
                'served_population': 'Children homes and elder day shelters',
                'daily_capacity_meals': 150,
                'cold_storage_available': False,
                'mission_statement': 'Immediate rescue meals for vulnerability hotspots.'
            }
        )

        # Volunteers
        vol1, _ = User.objects.get_or_create(
            email='volunteer.alex@mealbridge.org',
            defaults={
                'username': 'alex_volunteer',
                'role': User.Role.VOLUNTEER,
                'is_verified': True,
                'verification_status': User.VerificationStatus.VERIFIED,
                'phone_number': '+91 98666 77889'
            }
        )
        vol1.set_password(default_pwd)
        vol1.save()
        VolunteerProfile.objects.update_or_create(
            user=vol1,
            defaults={
                'full_name': 'Alex Rivera',
                'vehicle_type': VolunteerProfile.VehicleType.MOTORCYCLE,
                'max_transport_capacity_kg': 35,
                'is_available': True,
                'current_latitude': Decimal('19.0680'),
                'current_longitude': Decimal('72.8520')
            }
        )

        vol2, _ = User.objects.get_or_create(
            email='volunteer.priya@mealbridge.org',
            defaults={
                'username': 'priya_volunteer',
                'role': User.Role.VOLUNTEER,
                'is_verified': True,
                'verification_status': User.VerificationStatus.VERIFIED,
                'phone_number': '+91 98777 88990'
            }
        )
        vol2.set_password(default_pwd)
        vol2.save()
        VolunteerProfile.objects.update_or_create(
            user=vol2,
            defaults={
                'full_name': 'Priya Sharma',
                'vehicle_type': VolunteerProfile.VehicleType.CAR,
                'max_transport_capacity_kg': 80,
                'is_available': True,
                'current_latitude': Decimal('19.0950'),
                'current_longitude': Decimal('72.8720')
            }
        )

        # 3. Active & Diverse Donations
        now = timezone.now()

        # Donation 1: Critical urgency fresh banquet meals
        d1, _ = Donation.objects.get_or_create(
            title='Royal Mughlai Biryani & Paneer Curry Trays',
            donor=donor2,
            defaults={
                'category': cat_objs['banquet-platters'],
                'description': 'Untouched corporate banquet surplus. 3 stainless steel catering trays with sealed lids, prepared in certified kitchen.',
                'quantity': Decimal('120.0'),
                'available_quantity': Decimal('60.0'),
                'reserved_quantity': Decimal('60.0'),
                'unit': Donation.Unit.MEALS,
                'preparation_time': now - timedelta(hours=2),
                'pickup_deadline': now + timedelta(hours=3),
                'storage_requirement': Donation.StorageRequirement.HOT_HOLDING,
                'dietary_type': Donation.DietaryType.VEGETARIAN,
                'allergens': 'Dairy (Paneer, Ghee), Cashews',
                'pickup_address': 'Grand Royal Banquets, Sakinaka, Andheri East',
                'city': 'Mumbai',
                'latitude': Decimal('19.1070'),
                'longitude': Decimal('72.8870'),
                'contact_phone': '+91 98333 44556',
                'special_instructions': 'Security gate 2. Mention MealBridge dispatch to loading supervisor.',
                'status': Donation.Status.PARTIALLY_RESERVED,
                'safety_checklist_completed': True,
                'hygiene_verified': True,
                'properly_stored': True,
                'tamper_free_sealed': True,
                'safety_disclaimer_accepted': True
            }
        )

        # Donation 2: Artisan sourdough bread and croissant boxes
        d2, _ = Donation.objects.get_or_create(
            title='Fresh Sourdough Loaves & Croissant Assortment',
            donor=donor1,
            defaults={
                'category': cat_objs['bakery-pastries'],
                'description': 'Day-end bakery surplus in hygienic paper bread bags. Wholesome whole wheat and multigrain bread.',
                'quantity': Decimal('45.0'),
                'available_quantity': Decimal('45.0'),
                'reserved_quantity': Decimal('0.0'),
                'unit': Donation.Unit.PACKETS,
                'preparation_time': now - timedelta(hours=5),
                'pickup_deadline': now + timedelta(hours=8),
                'storage_requirement': Donation.StorageRequirement.ROOM_TEMPERATURE,
                'dietary_type': Donation.DietaryType.VEGETARIAN,
                'allergens': 'Wheat gluten',
                'pickup_address': 'The Green Bistro, Plot 45, Bandra West',
                'city': 'Mumbai',
                'latitude': Decimal('19.0596'),
                'longitude': Decimal('72.8295'),
                'contact_phone': '+91 98111 22334',
                'special_instructions': 'Collect from bakery counter at rear entrance.',
                'status': Donation.Status.AVAILABLE,
                'safety_checklist_completed': True,
                'hygiene_verified': True,
                'properly_stored': True,
                'tamper_free_sealed': True,
                'safety_disclaimer_accepted': True
            }
        )

        # Donation 3: Chilled Yogurt and Dairy Cartons (Cold storage test)
        d3, _ = Donation.objects.get_or_create(
            title='Probiotic Greek Yogurt & Organic Milk Cartons',
            donor=donor1,
            defaults={
                'category': cat_objs['dairy-chilled'],
                'description': 'Commercial refrigeration stock, sealed with original factory security tabs.',
                'quantity': Decimal('80.0'),
                'available_quantity': Decimal('80.0'),
                'reserved_quantity': Decimal('0.0'),
                'unit': Donation.Unit.PACKETS,
                'preparation_time': now - timedelta(hours=4),
                'pickup_deadline': now + timedelta(hours=14),
                'storage_requirement': Donation.StorageRequirement.REFRIGERATED,
                'dietary_type': Donation.DietaryType.VEGETARIAN,
                'allergens': 'Milk, Lactose',
                'pickup_address': 'The Green Bistro, Bandra West',
                'city': 'Mumbai',
                'latitude': Decimal('19.0596'),
                'longitude': Decimal('72.8295'),
                'contact_phone': '+91 98111 22334',
                'special_instructions': 'Cold bag or insulated box required during transit.',
                'status': Donation.Status.AVAILABLE,
                'safety_checklist_completed': True,
                'hygiene_verified': True,
                'properly_stored': True,
                'tamper_free_sealed': True,
                'safety_disclaimer_accepted': True
            }
        )

        # Donation 4: Completed donation with impact record
        d4, _ = Donation.objects.get_or_create(
            title='Dal Makhani, Jeera Rice & Chapati Meal Boxes',
            donor=donor2,
            defaults={
                'category': cat_objs['prepared-meals'],
                'description': 'Surplus luncheon boxes from conference event. Packed in eco-friendly meal trays.',
                'quantity': Decimal('150.0'),
                'available_quantity': Decimal('0.0'),
                'reserved_quantity': Decimal('150.0'),
                'unit': Donation.Unit.MEALS,
                'preparation_time': now - timedelta(days=1, hours=4),
                'pickup_deadline': now - timedelta(days=1),
                'storage_requirement': Donation.StorageRequirement.ROOM_TEMPERATURE,
                'dietary_type': Donation.DietaryType.VEGETARIAN,
                'allergens': 'Gluten, Dairy',
                'pickup_address': 'Grand Royal Banquets, Sakinaka',
                'city': 'Mumbai',
                'latitude': Decimal('19.1070'),
                'longitude': Decimal('72.8870'),
                'contact_phone': '+91 98333 44556',
                'status': Donation.Status.COMPLETED,
                'safety_checklist_completed': True,
                'hygiene_verified': True,
                'properly_stored': True,
                'tamper_free_sealed': True,
                'safety_disclaimer_accepted': True
            }
        )

        # 4. Requests & Pickup Lifecycle
        # Req 1: On d1 (60 meals requested by HopeShare, accepted, in transit by Alex)
        req1, _ = DonationRequest.objects.get_or_create(
            donation=d1,
            recipient=ngo1,
            defaults={
                'requested_quantity': Decimal('60.0'),
                'status': DonationRequest.Status.ACCEPTED,
                'beneficiary_notes': 'For distributing dinner at Kurla shelter home for 55 residents.',
                'donor_notes': 'Accepted! Ready for pickup at service door.',
                'responded_at': now - timedelta(hours=1)
            }
        )
        Reservation.objects.get_or_create(
            request=req1,
            defaults={'donation': d1, 'reserved_quantity': Decimal('60.0'), 'is_active': True}
        )
        pickup1, _ = PickupAssignment.objects.get_or_create(
            request=req1,
            defaults={
                'volunteer': vol1,
                'status': PickupAssignment.Status.FOOD_COLLECTED,
                'pickup_time': now - timedelta(minutes=20),
                'handover_notes': 'Hot insulation bags used. En route to Kurla shelter.'
            }
        )
        PickupStatusLog.objects.get_or_create(
            assignment=pickup1,
            status=PickupAssignment.Status.FOOD_COLLECTED,
            defaults={'changed_by': vol1, 'notes': 'Collected from Chef Marcus'}
        )

        # Req 2: Completed Request on d4 (150 meals delivered to HopeShare by Priya)
        req2, _ = DonationRequest.objects.get_or_create(
            donation=d4,
            recipient=ngo1,
            defaults={
                'requested_quantity': Decimal('150.0'),
                'status': DonationRequest.Status.FULFILLED,
                'beneficiary_notes': 'Community lunch program.',
                'donor_notes': 'Delivered in full.',
                'responded_at': now - timedelta(days=1, hours=3)
            }
        )
        Reservation.objects.get_or_create(
            request=req2,
            defaults={'donation': d4, 'reserved_quantity': Decimal('150.0'), 'is_active': False}
        )
        pickup2, _ = PickupAssignment.objects.get_or_create(
            request=req2,
            defaults={
                'volunteer': vol2,
                'status': PickupAssignment.Status.DELIVERED,
                'pickup_time': now - timedelta(days=1, hours=2),
                'delivery_time': now - timedelta(days=1, hours=1),
                'recipient_signature_name': 'Ananya Sengupta (Director)',
                'handover_notes': 'Successfully handed over 150 packaged meal boxes in warm condition.'
            }
        )

        # Req 3: Pending Request on d2 (15 packets requested by ShelterCare)
        req3, _ = DonationRequest.objects.get_or_create(
            donation=d2,
            recipient=ngo2,
            defaults={
                'requested_quantity': Decimal('15.0'),
                'status': DonationRequest.Status.PENDING,
                'beneficiary_notes': 'Fresh bread breakfast for Santacruz children home.'
            }
        )

        # 5. In-App Notifications
        Notification.objects.get_or_create(
            recipient=donor2,
            title='Food Collected by Volunteer',
            message='Volunteer Alex Rivera has collected 60 meals of Royal Mughlai Biryani and is en route to HopeShare.',
            notification_type=Notification.NotificationType.FOOD_COLLECTED,
            related_entity_type='pickup',
            related_entity_id=str(pickup1.id)
        )
        Notification.objects.get_or_create(
            recipient=ngo1,
            title='Food in Transit!',
            message='Volunteer Alex Rivera is on the way with your 60 meals from Grand Royal Banquets.',
            notification_type=Notification.NotificationType.FOOD_COLLECTED,
            related_entity_type='pickup',
            related_entity_id=str(pickup1.id)
        )
        Notification.objects.get_or_create(
            recipient=donor1,
            title='New Donation Request Received',
            message='ShelterCare Outreach Foundation requested 15 packets of Fresh Sourdough Loaves.',
            notification_type=Notification.NotificationType.REQUEST_RECEIVED,
            related_entity_type='request',
            related_entity_id=str(req3.id)
        )

        # 6. Audit Logs
        AuditLog.objects.create(
            user=admin_user,
            action='DATABASE_SEEDED',
            entity_type='System',
            entity_id='1',
            details={'message': 'Realistic production seed data applied successfully'}
        )

        self.stdout.write(self.style.SUCCESS("[SUCCESS] MealBridge demonstration seed data successfully populated!"))
        self.stdout.write(self.style.SUCCESS("----------------------------------------------------------------"))
        self.stdout.write(self.style.SUCCESS("Admin account:     admin@mealbridge.org / Password@123"))
        self.stdout.write(self.style.SUCCESS("Food Donor 1:      greenbistro@mealbridge.org / Password@123"))
        self.stdout.write(self.style.SUCCESS("Food Donor 2:      grandcaterers@mealbridge.org / Password@123"))
        self.stdout.write(self.style.SUCCESS("NGO 1 (Recipient): hopeshare@mealbridge.org / Password@123"))
        self.stdout.write(self.style.SUCCESS("NGO 2 (Recipient): sheltercare@mealbridge.org / Password@123"))
        self.stdout.write(self.style.SUCCESS("Volunteer 1:       volunteer.alex@mealbridge.org / Password@123"))
        self.stdout.write(self.style.SUCCESS("Volunteer 2:       volunteer.priya@mealbridge.org / Password@123"))
        self.stdout.write(self.style.SUCCESS("----------------------------------------------------------------"))

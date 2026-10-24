# 🍲 MealBridge — Smart Surplus Food Rescue Platform

**MealBridge** connects restaurants, banquet caterers, corporate canteens, and supermarkets that have surplus edible food with verified NGOs, shelters, and community food banks, supported by volunteer logistics.

The platform prevents avoidable food waste, protects recipient safety, eliminates overbooking via database transaction locks, and measures verified ecological and social impact.

---

## 🌟 Key Architecture & Capabilities

### 1. Four Distinct Role Consoles (Enforced on Backend)
- **Food Donor (Restaurants / Caterers / Canteens)**:
  - List surplus food with quantities, units, dietary classifications, allergens, and expiration deadlines.
  - Complete mandatory 5-point Food Safety Checklist (hygiene, temperature control, tamper-evident sealing, timing declaration).
  - Review incoming NGO requests; accept with atomic reservation or reject with reasons.
  - View matched NGOs for each listing with algorithmic match scores.
- **NGO / Recipient Organization (Shelters / Food Banks)**:
  - Real-time surplus radar with interactive Leaflet map view and filters (radius, category, dietary, storage).
  - Algorithmic Smart Recommendations tailored for shelter distance, daily capacity, and cold storage facilities.
  - Partial or full batch allocation requests with beneficiary notes.
  - Live tracking of request acceptance, reserved food, and volunteer delivery progress.
- **Pickup Volunteer (Couriers & Transport)**:
  - Public dispatch pool of accepted donations awaiting pickup.
  - Claim assignment and manage the verified status lifecycle:
    `CLAIMED` ➔ `EN_ROUTE_PICKUP` ➔ `FOOD_COLLECTED` ➔ `EN_ROUTE_DELIVERY` ➔ `DELIVERED` (with recipient signature name).
    - Failed pickup reporting automatically restores reserved quantities back to available inventory.
- **Administrator (Safety & Audit Oversight)**:
  - Verification queue for Donors, NGOs, and Volunteers before granting privileged actions.
  - Food safety moderation queue to suspend or reinstate flagged listings.
  - Immutable audit trail of critical actions and transactional events.

### 2. Concurrency Safety & Overbooking Prevention
- All request reservations utilize `select_for_update()` inside `transaction.atomic()` blocks.
- Concurrent requests cannot exceed the remaining available quantity.
- Cancelling or declining an accepted request releases the reserved quantity safely back to available stock.

### 3. Rule-Based Smart Matching Engine (No Fake AI)
- **Geographic Distance (30 pts)**: Haversine great-circle calculation between coordinates.
- **Rescue Urgency (25 pts)**: Weighted higher for food expiring within 2–6 hours.
- **Capacity Match (20 pts)**: Fits within the recipient NGO's stated daily meal intake.
- **Cold Chain Compatibility (15 pts)**: Ensures refrigerated/frozen food is only matched with NGOs equipped with verified cold storage.
- **Trust Verification (10 pts)**: Boosts verified community partners.
- Generates clear, human-readable explanations ("Why this donation is recommended").

### 4. Verified Impact Measurement (FAO & EPA Standards)
- **Rescued Meals**: Direct portions or converted using the United Nations FAO standard (1 meal portion ≈ 0.42 kg).
- **Food Diverted from Landfill (kg)**: Exact weight prevented from decomposition.
- **CO₂e Emissions Avoided (kg CO₂e)**: Benchmark EPA WARM index (1 kg diverted food avoids ~2.5 kg CO₂e).
- **Embedded Water Conserved (L)**: ~1,000 liters embedded agricultural water per kg food.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 with Vite 8 |
| **Styling & Design System** | Tailwind CSS v4, Plus Jakarta Sans typography |
| **Animations & Interactions** | Motion for React (`motion/react`) & Anime.js v4 (`animejs`) |
| **Mapping & Geospatial** | Leaflet & React-Leaflet with OpenStreetMap |
| **Backend Framework** | Python 3.12, Django 5.1 & Django REST Framework |
| **Authentication & Auth** | SimpleJWT (JSON Web Tokens) with token rotation |
| **Database** | PostgreSQL ready via `dj-database-url` (SQLite fallback for local dev) |
| **Concurrency & Integrity** | Django ORM with atomic transactions & row-level locking (`select_for_update`) |

---

## ⚡ Quick Start & Installation

### 1. Clone Repository
```bash
git clone https://github.com/Bhavesh0756/MealBridge.git
cd MealBridge
```

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed demonstration data
python manage.py seed_data

# Start Django development server
python manage.py runserver
```
The Django REST API runs at `http://127.0.0.1:8000/`.

### 3. Frontend Setup
```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```
The client application runs at `http://localhost:5173/` (with automatic proxying to `/api/` on port 8000).

---

## 🔑 Demonstration Accounts

The database seed command (`python manage.py seed_data`) creates verified accounts across all roles:

| Role | Account Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@mealbridge.org` | `Password@123` | Platform oversight & moderation |
| **Food Donor** | `greenbistro@mealbridge.org` | `Password@123` | The Green Bistro & Bakery |
| **Food Donor** | `grandcaterers@mealbridge.org` | `Password@123` | Grand Royal Banquets & Caterers |
| **NGO Recipient** | `hopeshare@mealbridge.org` | `Password@123` | HopeShare Community Food Bank (Cold Storage ✓) |
| **NGO Recipient** | `sheltercare@mealbridge.org` | `Password@123` | ShelterCare Outreach Foundation |
| **Volunteer** | `volunteer.alex@mealbridge.org` | `Password@123` | Alex Rivera (Motorcycle Courier) |
| **Volunteer** | `volunteer.priya@mealbridge.org` | `Password@123` | Priya Sharma (Car / Hatchback) |

> **Pro Tip:** In the frontend navigation bar, click the **"Role: Demo Switcher"** button at any time to switch between any of the 4 roles in a single click!

---

## 🧪 Automated Testing

Run the full Django automated test suite covering authentication, permissions, concurrency safety, matching, pickup transitions, emergency unclaiming, and receipt verification:

```bash
cd backend
.\venv\Scripts\python.exe manage.py test
```
*12 automated integration and unit tests across `donations`, `requests_app`, and `pickups` all passing.*

Run frontend production build validation:
```bash
cd frontend
npm run build
```

---

## 📁 Repository Structure

```
MealBridge/
├── backend/
│   ├── apps/
│   │   ├── accounts/         # Custom User model, Donor/Ngo/Volunteer profiles, Admin verification, Audit logs
│   │   ├── donations/        # Food categories, listings, safety checklists, moderation
│   │   ├── requests_app/     # NGO requests, atomic reservations, concurrency locks
│   │   ├── pickups/          # Volunteer pool, claim task, lifecycle state machine, status logs
│   │   ├── matching/         # Rule-based matching engine, Haversine scoring, recommendation API
│   │   ├── notifications/    # In-app real-time alerts & mark-as-read
│   │   └── analytics/        # Role KPI dashboards, UN FAO / EPA impact formulas
│   ├── mealbridge_core/      # Settings, ASGI/WSGI, routing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios client and service modules
│   │   ├── components/       # Navbar, Footer, ImpactCounter (Anime.js), LeafletMapView, SafetyModal
│   │   ├── context/          # AuthContext (with quick role switch), NotificationContext
│   │   ├── hooks/            # usePrefersReducedMotion accessibility hook
│   │   ├── pages/            # LandingPage, BrowseFeed, SmartMatchmaker, ImpactAnalytics, 4 Dashboards, Auth
│   │   ├── App.jsx           # App layout & role-protected routes
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 📄 License
MIT License. Built for community resilience and zero food waste.

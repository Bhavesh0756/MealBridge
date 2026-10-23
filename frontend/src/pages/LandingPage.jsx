import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Utensils,
  Truck,
  HeartHandshake,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  MapPin,
  Leaf,
  CheckCircle2,
  Users,
  Flame,
  Search
} from 'lucide-react';
import { ImpactCounter } from '../components/ImpactCounter';
import { LeafletMapView } from '../components/LeafletMapView';
import { donationsApi } from '../api/donations';
import { analyticsApi } from '../api/analytics';

export function LandingPage() {
  const [stats, setStats] = useState({
    meals_rescued: 210,
    food_diverted_kg: 88.2,
    co2_avoided_kg: 220.5,
    water_saved_liters: 88200,
  });
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [dash, listings] = await Promise.all([
          analyticsApi.getDashboard().catch(() => null),
          donationsApi.getListings().catch(() => ({ results: [] })),
        ]);
        if (dash?.impact_metrics) {
          setStats(dash.impact_metrics);
        }
        setFeaturedDonations(listings?.results?.slice(0, 4) || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Zero Hunger • Zero Food Waste Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Rescuing Surplus Food.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
                  Nourishing Communities.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                MealBridge directly connects restaurants, banquet caterers, and corporate canteens with verified NGOs and volunteer logistics — turning edible surplus meals into immediate hunger relief.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/browse"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Explore Available Food</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>Join as Food Donor</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified NGO Partners</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Real-time Expiry Matching</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>Volunteer Delivery Coordination</span>
                </div>
              </div>
            </motion.div>

            {/* Right Live Map Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="bg-white p-3.5 rounded-3xl shadow-xl border border-slate-200/80 relative">
                <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Live Food Rescue Radar
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Metro Hub</span>
                </div>
                <div className="h-72 w-full mt-2 rounded-2xl overflow-hidden">
                  <LeafletMapView
                    donations={featuredDonations}
                    zoom={12}
                    className="h-full w-full"
                    onSelectDonation={(d) => navigate(`/browse`)}
                  />
                </div>
                <div className="mt-3 px-2 flex items-center justify-between text-xs text-slate-600">
                  <span>🟢 Available Listings</span>
                  <span>🏠 Recipient NGOs</span>
                  <span>🚚 Volunteer couriers</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Real-time Impact Metrics Bar with Anime.js Tickers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-slate-700/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Verified Ecological & Social Impact
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Every Meal Rescued Matters
              </h2>
            </div>
            <Link
              to="/impact"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold backdrop-blur-xs transition flex items-center gap-1.5"
            >
              <span>View Measurement Methodology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 text-center sm:text-left">
            {/* Metric 1 */}
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium">Meals Rescued</p>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400">
                <ImpactCounter targetValue={stats.meals_rescued} />
              </div>
              <p className="text-[11px] text-slate-400">Fed to shelter communities</p>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium">Food Diverted</p>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-400">
                <ImpactCounter targetValue={stats.food_diverted_kg} suffix=" kg" decimals={1} />
              </div>
              <p className="text-[11px] text-slate-400">Prevented from landfills</p>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium">CO₂e Avoided</p>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-teal-300">
                <ImpactCounter targetValue={stats.co2_avoided_kg} suffix=" kg" decimals={1} />
              </div>
              <p className="text-[11px] text-slate-400">EPA WARM benchmark standard</p>
            </div>

            {/* Metric 4 */}
            <div className="space-y-1">
              <p className="text-xs text-slate-400 font-medium">Water Conserved</p>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-400">
                <ImpactCounter targetValue={stats.water_saved_liters} suffix=" L" />
              </div>
              <p className="text-[11px] text-slate-400">Embedded agricultural water</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Role Journey) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            End-to-End Coordination
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            How MealBridge Operates
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From commercial kitchen surplus to the plates of families in need, guided by safety checks and transparent matching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative group hover:border-emerald-500 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900">1. Donor Lists Food</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Restaurants or caterers post surplus batches with quantities, storage conditions, allergens, and pickup deadlines, backed by a safety declaration.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative group hover:border-emerald-500 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900">2. Smart Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The rule-based algorithm ranks closest verified NGOs based on driving distance, cold storage suitability, and daily intake capacity.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative group hover:border-emerald-500 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900">3. Safe Reservation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              NGOs request portions. Once accepted by the donor, database locks atomically reserve quantity to eliminate double-booking.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative group hover:border-emerald-500 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-base text-slate-900">4. Volunteer Pickup</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nearby volunteers claim assignments, record food temperature/handover, and complete delivery with verified recipient signoff.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Active Donations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Live Food Listings Awaiting Rescue
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Fresh surplus ready for immediate allocation to verified community shelters.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
          >
            <span>View all listings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDonations.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {d.category?.name || 'Cooked Feasts'}
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {d.remaining_hours !== undefined ? `${d.remaining_hours}h left` : 'Active'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">{d.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{d.description}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Available:</span>
                    <span className="font-bold text-emerald-700">
                      {d.available_quantity} {d.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Storage:</span>
                    <span className="font-medium text-slate-800">{d.storage_requirement_display || d.storage_requirement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">{d.pickup_address}</span>
                  </div>
                </div>

                <Link
                  to="/browse"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center transition block"
                >
                  Request Allocation
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h2 className="text-3xl font-black text-white">Join the Food Rescue Mission Today</h2>
            <p className="text-emerald-100 text-sm">
              Whether you are a food business aiming for zero waste, an NGO feeding shelter homes, or an individual with a vehicle ready to deliver meals.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-emerald-800 font-extrabold text-xs rounded-xl shadow-md transition text-center"
            >
              Create Free Account
            </Link>
            <Link
              to="/browse"
              className="px-6 py-3.5 bg-emerald-800/60 hover:bg-emerald-800/80 text-white border border-emerald-400/40 font-bold text-xs rounded-xl transition text-center"
            >
              Browse Active Radar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

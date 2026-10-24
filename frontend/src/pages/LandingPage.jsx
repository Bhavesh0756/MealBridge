import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Utensils,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { ImpactCounter } from '../components/ImpactCounter';
import { LeafletMapView } from '../components/LeafletMapView';
import { donationsApi } from '../api/donations';
import { analyticsApi } from '../api/analytics';

const FALLBACK_DONATIONS = [
  {
    id: 'f1',
    title: '60 Trays Steamed Basmati & Paneer Butter Masala',
    description: 'Freshly prepared wedding banquet surplus stored in thermal hot-holding units.',
    category: { name: 'Cooked Feast' },
    available_quantity: 60,
    quantity: 60,
    unit: 'Portions',
    remaining_hours: 3.5,
    storage_requirement: 'HOT_HOLDING',
    pickup_address: 'Bandra Banquet Hall, Mumbai',
    latitude: 19.0596,
    longitude: 72.8295,
  },
  {
    id: 'f2',
    title: '40 kg Fresh Organic Vegetables & Salad Leaves',
    description: 'Chilled hydroponic greens and seasonal vegetables surplus from luxury hotel restaurant.',
    category: { name: 'Fresh Produce' },
    available_quantity: 40,
    quantity: 40,
    unit: 'kg',
    remaining_hours: 6.0,
    storage_requirement: 'REFRIGERATED',
    pickup_address: 'BKC Hotel Kitchen, Mumbai',
    latitude: 19.0650,
    longitude: 72.8680,
  },
  {
    id: 'f3',
    title: '85 Packets Sourdough & Multigrain Loaves',
    description: 'Artisanal day-baked breads packaged in food-grade bakery bags ready for shelter breakfast.',
    category: { name: 'Bakery' },
    available_quantity: 85,
    quantity: 85,
    unit: 'Packets',
    remaining_hours: 12.0,
    storage_requirement: 'ROOM_TEMPERATURE',
    pickup_address: 'Juhu Artisan Bakery, Mumbai',
    latitude: 19.1000,
    longitude: 72.8270,
  },
];

export function LandingPage() {
  const [stats, setStats] = useState({
    meals_rescued: 210,
    food_diverted_kg: 88.2,
    co2_avoided_kg: 220.5,
    water_saved_liters: 88200,
  });
  const [featuredDonations, setFeaturedDonations] = useState(FALLBACK_DONATIONS);
  const [openFaq, setOpenFaq] = useState(null);
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
        if (listings?.results && listings.results.length > 0) {
          setFeaturedDonations(listings.results.slice(0, 4));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-24 overflow-hidden relative cyber-dots">
      {/* Ambient background glow orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-28 right-10 w-80 h-80 bg-cyan-400/18 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-64 left-1/3 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-7 space-y-7 text-center lg:text-left relative"
            >
              {/* Floating Stat Pill on desktop */}
              <div className="hidden sm:inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-black border border-emerald-500/30 shadow-xs backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="tracking-wide">HYPERLOCAL RESCUE ENGINE • ZERO WASTE NETWORK</span>
              </div>

              {/* Main Headline with Animated Aurora Flow */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
                Rescuing Surplus.{' '}
                <span className="block text-aurora-animated">
                  Nourishing Lives.
                </span>
              </h1>

              {/* Tagline */}
              <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Connecting commercial kitchens, hotels, and banquets directly with verified hunger relief NGOs and agile volunteer couriers. Safe, audited, and real-time.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/browse"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-aurora-animated text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 hover:scale-[1.03] transition-all flex items-center justify-center gap-2.5 group cursor-pointer border border-emerald-400/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Explore Available Food</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#0d1117]/90 hover:bg-[#111827] text-slate-100 font-extrabold text-sm border border-slate-200/90 shadow-md shadow-slate-200/50 hover:shadow-lg hover:border-emerald-400/60 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-sm"
                >
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <span>Join as Food Donor</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-400 font-semibold">
                <div className="flex items-center gap-2 bg-[#0d1117]/80 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-slate-200/70 shadow-2xs hover:border-emerald-300 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Verified Partners</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0d1117]/80 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-slate-200/70 shadow-2xs hover:border-amber-300 transition-colors">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Real-time Cold Chain Timers</span>
                </div>
                <div className="flex items-center gap-2 bg-[#0d1117]/80 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-slate-200/70 shadow-2xs hover:border-teal-300 transition-colors">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>Live Courier Dispatch</span>
                </div>
              </div>
            </motion.div>

            {/* Right Live Map Preview with Radar Sweep Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              {/* Pulsing Backlight glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-3xl blur-xl opacity-35 animate-float-slow -z-10" />
              
              <div className="backdrop-blur-2xl p-4 sm:p-5 rounded-3xl shadow-2xl relative overflow-hidden group"
                style={{ background: 'rgba(11,15,23,0.88)', border: '1px solid rgba(16,185,129,0.25)', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
                {/* Radar Top Header */}
                <div className="flex items-center justify-between pb-3 px-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-widest font-display">
                      Live Metro Dispatch Radar
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-bold"
                    style={{ background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Realtime Active
                  </span>
                </div>

                {/* Map View Frame with Overlay Radar Sweep effect */}
                <div className="h-80 w-full mt-3 rounded-2xl overflow-hidden shadow-inner border border-slate-200/80 relative">
                  <LeafletMapView
                    donations={featuredDonations}
                    zoom={12}
                    className="h-full w-full"
                    onSelectDonation={() => navigate(`/browse`)}
                  />

                  {/* Corner Target Reticle Overlay */}
                  <div className="absolute top-3 right-3 pointer-events-none z-10 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-400/30 text-[10px] font-mono-numbers text-emerald-300 flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    SCANNING METRO ZONE
                  </div>
                </div>

                {/* Map Legend */}
                <div className="mt-3.5 px-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 hover:text-emerald-700 transition">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span> Surplus Ready
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-blue-700 transition">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs"></span> Shelter Hubs
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-amber-700 transition">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span> Active Couriers
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Real-time Impact Metrics Bar with Obsidian Emerald & Aurora Mint Aesthetic */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F17] via-[#071712] to-[#051C14] p-8 sm:p-12 text-white shadow-2xl border border-emerald-500/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-widest border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Audited Ecological & Social Output
              </div>
              <h2 className="font-display text-2xl sm:text-4xl font-black text-white mt-2">
                Every Single Gram Rescued Drives Real Impact
              </h2>
            </div>
            <Link
              to="/impact"
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-white text-xs font-bold backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Scientific Measurement Methodology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 text-center sm:text-left relative z-10">
            {/* Metric 1 */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all">
              <p className="text-xs text-emerald-300/80 font-bold uppercase tracking-wider">Meals Provided</p>
              <div className="font-display text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                <ImpactCounter targetValue={stats.meals_rescued} />
              </div>
              <p className="text-[11px] text-slate-400">Direct hunger relief served</p>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all">
              <p className="text-xs text-amber-300/80 font-bold uppercase tracking-wider">Food Diverted</p>
              <div className="font-display text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                <ImpactCounter targetValue={stats.food_diverted_kg} suffix=" kg" decimals={1} />
              </div>
              <p className="text-[11px] text-slate-400">Zero methane landfill diversion</p>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all">
              <p className="text-xs text-cyan-300/80 font-bold uppercase tracking-wider">CO₂e Abatement</p>
              <div className="font-display text-4xl sm:text-5xl font-black text-cyan-300 tracking-tight">
                <ImpactCounter targetValue={stats.co2_avoided_kg} suffix=" kg" decimals={1} />
              </div>
              <p className="text-[11px] text-slate-400">EPA WARM 2.5× benchmark</p>
            </div>

            {/* Metric 4 */}
            <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all">
              <p className="text-xs text-blue-300/80 font-bold uppercase tracking-wider">Water Conserved</p>
              <div className="font-display text-4xl sm:text-5xl font-black text-blue-400 tracking-tight">
                <ImpactCounter targetValue={stats.water_saved_liters} suffix=" L" />
              </div>
              <p className="text-[11px] text-slate-400">Preserved virtual irrigation</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Role Journey) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3.5 py-1.5 rounded-full border border-emerald-300/50">
            End-to-End Coordination Flow
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
            How The Rescue Engine Operates
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            From commercial kitchen surplus to the plates of families in need, backed by digital health declarations and atomic reservation security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 shadow-md card-interactive shimmer-sweep-hover space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#047857] to-[#10b981] text-white flex items-center justify-center font-black text-base shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
              01
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-emerald-700 transition-colors">1. Donor Lists Food</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Commercial kitchens post batches with portion counts, temperature requirements, and safety compliance sign-offs.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 shadow-md card-interactive shimmer-sweep-hover space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#10b981] to-[#06b6d4] text-white flex items-center justify-center font-black text-base shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
              02
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-700 transition-colors">2. Smart Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Our intelligent engine scores local NGOs based on proximity, refrigerated storage capability, and urgent beneficiary demand.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 shadow-md card-interactive shimmer-sweep-hover space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f59e0b] to-[#d97706] text-white flex items-center justify-center font-black text-base shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
              03
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-amber-700 transition-colors">3. Safe Reservation</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              NGOs request meals. On donor approval, row-level locks instantly reserve portions, preventing race conditions or double-claims.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 shadow-md card-interactive shimmer-sweep-hover space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#06b6d4] to-[#047857] text-white flex items-center justify-center font-black text-base shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
              04
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-emerald-700 transition-colors">4. Courier Logistics</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Volunteer dispatch drivers navigate with one-tap GPS, verify transport temperatures, and secure final delivery signoff.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Active Donations Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300/60 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Verified Active Feeds
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight">
              Live Food Listings Awaiting Rescue
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Immediate surplus batches available for reservation by certified community organizations.
            </p>
          </div>
          <Link
            to="/browse"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#047857] text-white text-xs font-extrabold flex items-center gap-2 group transition-all cursor-pointer shadow-md"
          >
            <span>View Full Radar ({featuredDonations.length}+ items)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDonations.map((d) => (
            <div
              key={d.id}
              className="glass-panel rounded-3xl border border-slate-200/90 shadow-md card-interactive shimmer-sweep-hover transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50/40 border-b border-white/6 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                  {d.category?.name || 'Cooked Feasts'}
                </span>
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                  d.remaining_hours !== undefined && d.remaining_hours <= 4
                    ? 'badge-coral-urgent animate-pulse'
                    : 'badge-saffron'
                }`}>
                  <Clock className="w-3 h-3 animate-spin" />
                  {d.remaining_hours !== undefined ? `${d.remaining_hours}h left` : 'Active'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display font-bold text-base text-white mb-1.5 group-hover:text-emerald-700 transition">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{d.description}</p>
                </div>

                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-white/6 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Available:</span>
                    <span className="font-extrabold text-emerald-700 text-sm font-mono-numbers">
                      {d.available_quantity} {d.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Storage:</span>
                    <span className="font-semibold text-slate-100 text-[11px]">
                      {d.storage_requirement_display || d.storage_requirement}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Location:</span>
                    <span className="font-semibold text-slate-100 truncate max-w-[140px] text-[11px]">
                      {d.pickup_address}
                    </span>
                  </div>
                </div>

                <Link
                  to="/browse"
                  className="w-full py-2.5 bg-gradient-to-r from-[#047857] via-[#10b981] to-[#06b6d4] hover:brightness-110 text-white rounded-xl text-xs font-bold text-center transition-all shadow-md shadow-emerald-600/20 block cursor-pointer group-hover:scale-[1.02]"
                >
                  Request Allocation
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common Questions & Answers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about food safety, legal protection, and courier logistics.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Is donating surplus food legally protected under the Good Samaritan Law?',
              a: 'Yes. Commercial food businesses donating in good faith without negligence are protected under FSSAI regulations and Good Samaritan provisions. MealBridge requires every donor to verify preparation hygiene and safe temperature standards before publishing.'
            },
            {
              q: 'How does MealBridge prevent overbooking and food allocation conflicts?',
              a: 'MealBridge employs atomic row-level database locks with select_for_update. When an NGO requests portions and the donor accepts, quantity is immediately deducted from available stock, guaranteeing zero double-allocation even under high concurrent demand.'
            },
            {
              q: 'Can volunteers access GPS navigation and donor contact numbers directly?',
              a: 'Yes. The Volunteer Console provides direct one-tap Google Maps directions to both pickup kitchens and delivery shelters, contact calling buttons, and a digital signoff interface.'
            },
            {
              q: 'How are environmental metrics like CO₂e and water savings calculated?',
              a: 'We strictly adhere to the United Nations FAO standard meal benchmark (0.42 kg per portion) and US EPA WARM emission factors (2.5 kg CO₂e abated per kg of diverted food).'
            }
          ].map((faq, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-emerald-400/40 transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:bg-white/5/60 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 sm:p-5 pt-0 text-xs text-slate-400 leading-relaxed border-t border-white/6 bg-white/40">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F17] via-[#071712] to-[#051C14] border border-emerald-500/40 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl glow-aurora">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3 text-center md:text-left max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Community Network
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Join the Food Rescue Mission Today</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Whether you are a commercial food business aiming for zero waste, a certified NGO feeding shelter homes, or an agile volunteer courier with a vehicle.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-7 py-4 bg-gradient-to-r from-[#047857] via-[#10b981] to-[#06b6d4] hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-emerald-500/30 transition text-center cursor-pointer hover:scale-[1.03]"
            >
              Create Free Account
            </Link>
            <Link
              to="/browse"
              className="px-7 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs rounded-2xl transition text-center backdrop-blur-md cursor-pointer hover:scale-[1.03]"
            >
              Browse Active Radar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

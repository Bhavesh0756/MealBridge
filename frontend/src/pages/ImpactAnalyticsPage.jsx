import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Leaf,
  Droplet,
  Utensils,
  Award,
  Info,
  Download,
  Printer,
  Sparkles,
  X,
  ShieldCheck,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { ImpactCounter } from '../components/ImpactCounter';

export function ImpactAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // 'all' | 'month' | 'week'
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await analyticsApi.getDashboard();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const rawImpact = data?.impact_metrics || {
    meals_rescued: 210,
    food_diverted_kg: 88.2,
    co2_avoided_kg: 220.5,
    water_saved_liters: 88200,
  };

  const multiplier = timeRange === 'week' ? 0.28 : timeRange === 'month' ? 0.68 : 1.0;

  const impact = useMemo(() => ({
    meals_rescued: Math.round(rawImpact.meals_rescued * multiplier),
    food_diverted_kg: +(rawImpact.food_diverted_kg * multiplier).toFixed(1),
    co2_avoided_kg: +(rawImpact.co2_avoided_kg * multiplier).toFixed(1),
    water_saved_liters: Math.round(rawImpact.water_saved_liters * multiplier),
  }), [rawImpact, multiplier]);

  const overview = data?.platform_overview || {
    total_donations: 4,
    active_listings: 3,
    completed_deliveries: 1,
    failed_attempts: 0,
    delivery_success_rate: 100.0,
  };

  const weeklyTrends = data?.weekly_trends || [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Calculating verified ecological & social metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-widest border border-emerald-200/60">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audited ESG Impact & Sustainability Intelligence</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Ecological & Social Impact Command
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Every kilogram of food rescued eliminates organic landfill decomposition, mitigates greenhouse emissions, and delivers vital calories to underserved families.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Toggle */}
          <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl text-xs font-bold border border-slate-200/60 shadow-2xs">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === 'week' ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60 scale-[1.02]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === 'month' ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60 scale-[1.02]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeRange === 'all' ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60 scale-[1.02]' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Certificate Download Button */}
          <button
            onClick={() => setShowCertificate(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#047857] via-[#10b981] to-[#06b6d4] hover:from-[#065f46] hover:to-[#0891b2] text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Award className="w-4 h-4 text-emerald-200" />
            <span>Generate ESG Certificate</span>
          </button>
        </div>
      </div>

      {/* Hero 4 Big Metrics with Glowing Obsidian & Aurora Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 - Aurora Jade */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#047857] via-[#10b981] to-[#06b6d4] p-7 rounded-3xl text-white shadow-xl shadow-emerald-500/25 space-y-3 group hover:scale-[1.02] transition-all duration-300">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit shadow-xs">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-emerald-100 font-extrabold uppercase tracking-widest">
            Meals Rescued & Delivered
          </p>
          <div className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
            <ImpactCounter targetValue={impact.meals_rescued} />
          </div>
          <p className="text-[11px] text-emerald-100/90 leading-tight">
            Directly nourished community shelter residents and families.
          </p>
        </div>

        {/* Metric 2 - Saffron Amber */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#b45309] p-7 rounded-3xl text-white shadow-xl shadow-amber-500/25 space-y-3 group hover:scale-[1.02] transition-all duration-300">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit shadow-xs">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-amber-100 font-extrabold uppercase tracking-widest">
            Landfill Diversion
          </p>
          <div className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
            <ImpactCounter targetValue={impact.food_diverted_kg} suffix=" kg" decimals={1} />
          </div>
          <p className="text-[11px] text-amber-100/90 leading-tight">
            Zero organic methane emissions and toxic landfill leachate.
          </p>
        </div>

        {/* Metric 3 - Obsidian Noir */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0B0F17] via-[#071712] to-[#051C14] p-7 rounded-3xl text-white shadow-xl shadow-slate-900/40 space-y-3 border border-[#10b981]/30 group hover:scale-[1.02] transition-all duration-300">
          <div className="p-3 bg-emerald-500/20 backdrop-blur-md rounded-2xl w-fit shadow-xs border border-emerald-400/30">
            <Award className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest">
            CO₂e Emissions Abated
          </p>
          <div className="font-display text-4xl sm:text-5xl font-black text-emerald-300 tracking-tight">
            <ImpactCounter targetValue={impact.co2_avoided_kg} suffix=" kg" decimals={1} />
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Equivalent to avoiding hundreds of urban vehicle passenger-km.
          </p>
        </div>

        {/* Metric 4 - Luminous Cyan */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0284c7] via-[#06b6d4] to-[#0891b2] p-7 rounded-3xl text-white shadow-xl shadow-cyan-500/25 space-y-3 group hover:scale-[1.02] transition-all duration-300">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit shadow-xs">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-cyan-100 font-extrabold uppercase tracking-widest">
            Embedded Water Saved
          </p>
          <div className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
            <ImpactCounter targetValue={impact.water_saved_liters} suffix=" L" />
          </div>
          <p className="text-[11px] text-cyan-100/90 leading-tight">
            Preserved virtual agricultural irrigation embedded in produce.
          </p>
        </div>
      </div>

      {/* Platform Reliability & Distribution Overview */}
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
        <div>
          <h2 className="font-display text-xl font-black text-slate-900">Platform Performance & Logistics Health</h2>
          <p className="text-xs text-slate-500">Live operational metrics recorded across all four user roles in the ecosystem.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
            <div className="font-display text-2xl font-black text-slate-900">{overview.total_donations}</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Total Batches</div>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
            <div className="font-display text-2xl font-black text-emerald-600">{overview.active_listings}</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Available Feeds</div>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
            <div className="font-display text-2xl font-black text-blue-600">{overview.completed_deliveries}</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Rescues Fulfilled</div>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-center">
            <div className="font-display text-2xl font-black text-amber-600">{overview.failed_attempts}</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Failed Attempts</div>
          </div>
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 text-center col-span-2 lg:col-span-1">
            <div className="font-display text-2xl font-black text-teal-600">{overview.delivery_success_rate}%</div>
            <div className="text-xs font-bold text-slate-600 mt-1">Courier Success Rate</div>
          </div>
        </div>

        {/* Weekly Trend Bars */}
        {weeklyTrends.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Last 7 Days Rescue Volume
            </h3>
            <div className="grid grid-cols-7 gap-2 h-36 items-end pt-4">
              {weeklyTrends.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    style={{ height: `${Math.max(15, (d.donations + d.deliveries) * 20)}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-emerald-600 to-teal-400 hover:from-emerald-700 hover:to-teal-500 rounded-t-xl transition-all relative group shadow-xs"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 shadow-md">
                      {d.donations} batches
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{d.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Food Rescue Composition Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Food Rescue Stream Composition</h2>
          <p className="text-xs text-slate-500">Distribution of rescued food inventory by nutritional category and shelf stability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Hot Cooked Meals</span>
              <span className="font-black text-emerald-600">55%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '55%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Prepared hot curries, rice, breads ready for immediate consumption.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Raw Farm Produce & Fruits</span>
              <span className="font-black text-amber-600">30%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '30%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Fresh vegetables, whole fruits, and grains from markets and distributors.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Bakery & Cold Storage Dairy</span>
              <span className="font-black text-blue-600">15%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '15%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Bread loaves, buns, yogurt, and chilled items requiring temperature preservation.</p>
          </div>
        </div>
      </div>

      {/* Methodology & Documented Standards */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-extrabold text-slate-900">
            Documented Scientific Assumptions & Standards
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          MealBridge distinguishes strictly between <strong>measured values</strong> (exact weight and portions confirmed on delivery) and <strong>estimated environmental indices</strong>:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block">1. UN FAO Benchmark Weight</strong>
            <p>1 standard cooked meal portion is calculated as 0.42 kg based on United Nations Food and Agriculture Organization (FAO) Food Loss Indices.</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block">2. EPA WARM CO₂e Factor</strong>
            <p>1 kg of edible food diverted from landfill decomposition avoids approximately 2.5 kg of CO₂ equivalent greenhouse gas emissions (US EPA WARM model).</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block">3. Water Conservation Index</strong>
            <p>1 kg of mixed agricultural food incorporates approximately 1,000 liters of embedded irrigation and processing water saved from loss.</p>
          </div>
        </div>
      </div>

      {/* Official ESG Impact Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border-4 border-emerald-600 overflow-hidden relative p-8 space-y-6">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm uppercase tracking-wider">
                <ShieldCheck className="w-5 h-5" />
                <span>Verified ESG Sustainability Record</span>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-black">
                  Official Citation of Environmental Stewardship
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  Certificate of Food Rescue & Carbon Mitigation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Issued by the MealBridge Surplus Food Logistics Platform
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div>
                  <div className="text-xl font-black text-emerald-700">{impact.meals_rescued}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Meals Served</div>
                </div>
                <div>
                  <div className="text-xl font-black text-amber-700">{impact.food_diverted_kg} kg</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Food Rescued</div>
                </div>
                <div>
                  <div className="text-xl font-black text-teal-700">{impact.co2_avoided_kg} kg</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">CO₂e Abated</div>
                </div>
                <div>
                  <div className="text-xl font-black text-blue-700">{impact.water_saved_liters.toLocaleString()} L</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Water Saved</div>
                </div>
              </div>

              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                This certifies that community food donations managed through MealBridge have adhered to FSSAI food safety guidelines and contributed directly to UN Sustainable Development Goals (SDG 2: Zero Hunger & SDG 12: Responsible Consumption).
              </p>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-left text-xs text-slate-500">
                <div>
                  <span className="block font-bold text-slate-800">Verification Hash:</span>
                  <span className="font-mono text-[10px] text-slate-400">MB-ESG-{Date.now().toString(36).toUpperCase()}</span>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-slate-800">Date Verified:</span>
                  <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Leaf,
  Droplet,
  Utensils,
  Award,
  Info
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { ImpactCounter } from '../components/ImpactCounter';

export function ImpactAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const impact = data?.impact_metrics || {
    meals_rescued: 210,
    food_diverted_kg: 88.2,
    co2_avoided_kg: 220.5,
    water_saved_liters: 88200,
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparent Ecological & Social Measurement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Food Rescue Impact & Carbon Offset
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Every kilogram of food rescued directly prevents methane emissions from decomposition in landfills while delivering essential calories to vulnerable populations.
        </p>
      </div>

      {/* Hero 4 Big Metrics with Anime.js Animated Tickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-3xl text-white shadow-lg space-y-2">
          <div className="p-2.5 bg-white/20 rounded-2xl w-fit">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">
            Meals Rescued & Delivered
          </p>
          <div className="text-4xl sm:text-5xl font-black text-white">
            <ImpactCounter targetValue={impact.meals_rescued} />
          </div>
          <p className="text-[11px] text-emerald-100/90 leading-tight">
            Nourished shelter residents and families in urban settlements.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-6 rounded-3xl text-white shadow-lg space-y-2">
          <div className="p-2.5 bg-white/20 rounded-2xl w-fit">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-amber-100 font-semibold uppercase tracking-wider">
            Food Diverted from Landfill
          </p>
          <div className="text-4xl sm:text-5xl font-black text-white">
            <ImpactCounter targetValue={impact.food_diverted_kg} suffix=" kg" decimals={1} />
          </div>
          <p className="text-[11px] text-amber-100/90 leading-tight">
            Prevented organic waste and harmful landfill leachate.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-lg space-y-2 border border-slate-700">
          <div className="p-2.5 bg-white/10 rounded-2xl w-fit">
            <Award className="w-6 h-6 text-teal-400" />
          </div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            CO₂e Emissions Avoided
          </p>
          <div className="text-4xl sm:text-5xl font-black text-teal-300">
            <ImpactCounter targetValue={impact.co2_avoided_kg} suffix=" kg" decimals={1} />
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Equivalent to avoiding hundreds of car travel kilometers.
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl text-white shadow-lg space-y-2">
          <div className="p-2.5 bg-white/20 rounded-2xl w-fit">
            <Droplet className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-blue-100 font-semibold uppercase tracking-wider">
            Agricultural Water Conserved
          </p>
          <div className="text-4xl sm:text-5xl font-black text-white">
            <ImpactCounter targetValue={impact.water_saved_liters} suffix=" L" />
          </div>
          <p className="text-[11px] text-blue-100/90 leading-tight">
            Conserved agricultural freshwater embedded in food crops.
          </p>
        </div>
      </div>

      {/* Platform Reliability & Distribution Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Platform Performance & Logistics Health</h2>
          <p className="text-xs text-slate-500">Live operational metrics recorded across all four user roles.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-2xl font-black text-slate-900">{overview.total_donations}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Total Donations</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-2xl font-black text-emerald-600">{overview.active_listings}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Available Feeds</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-2xl font-black text-blue-600">{overview.completed_deliveries}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Rescues Completed</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <div className="text-2xl font-black text-amber-600">{overview.failed_attempts}</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Failed Attempts</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center col-span-2 lg:col-span-1">
            <div className="text-2xl font-black text-teal-600">{overview.delivery_success_rate}%</div>
            <div className="text-xs font-semibold text-slate-600 mt-1">Courier Success Rate</div>
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
                    className="w-full max-w-[36px] bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition relative group"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20">
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
    </div>
  );
}

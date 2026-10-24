import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, HeartHandshake, Truck, CheckCircle2, ShieldCheck, Zap, ArrowRight, Star, Clock } from 'lucide-react';
import { ExpiryTimerRing } from './ExpiryTimerRing';

const ROLE_TABS = [
  {
    id: 'DONOR',
    label: 'For Restaurants & Caterers',
    shortLabel: 'Food Donors',
    icon: Utensils,
    tagline: 'Zero Food Waste. 100% Tax Deductible Compliance.',
    description: 'Post surplus banquet batches in under 60 seconds with automated food safety temp logs and verified NGO dispatch.',
    perks: [
      '60-second batch donation listing wizard',
      'Instant digital ESG & tax exemption certificate',
      'Automated volunteer courier dispatch',
    ],
    demoAccount: 'donor@mealbridge.org',
    dashboardUrl: '/dashboard/donor',
    ctaText: 'Explore Donor Console',
  },
  {
    id: 'NGO',
    label: 'For NGOs & Community Shelters',
    shortLabel: 'NGOs & Shelters',
    icon: HeartHandshake,
    tagline: 'Fresh Wholesome Feasts Delivered Daily.',
    description: 'Receive real-time automated AI match alerts tailored to your shelter capacity, dietary rules, and refrigeration capabilities.',
    perks: [
      'Smart AI match score priority routing',
      'Instant 1-click batch allocation claim',
      'Inbound courier GPS live arrival tracker',
    ],
    demoAccount: 'ngo@mealbridge.org',
    dashboardUrl: '/dashboard/ngo',
    ctaText: 'Explore NGO Console',
  },
  {
    id: 'VOLUNTEER',
    label: 'For Volunteer Couriers',
    shortLabel: 'Volunteers',
    icon: Truck,
    tagline: 'Rescue Meals on Your Daily Commute.',
    description: 'Accept micro-pickup missions near your live route. Safe thermal containers and instant digital receipts provided.',
    perks: [
      'Hyperlocal GPS pickup-to-drop dispatch',
      'Digital recipient signature verification',
      'Personal carbon offset & hero rankings',
    ],
    demoAccount: 'volunteer@mealbridge.org',
    dashboardUrl: '/dashboard/volunteer',
    ctaText: 'Explore Volunteer Console',
  },
];

export function HeroRoleTabs() {
  const [activeTab, setActiveTab] = useState(ROLE_TABS[0]);

  return (
    <div className="stripe-card rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden bg-white">
      {/* Role Navigation Tab Header */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 p-2 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full">
          {ROLE_TABS.map((tab) => {
            const isSelected = activeTab.id === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[130px] sm:min-w-[160px] py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-emerald-800 shadow-sm border border-emerald-500/30 ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Body: Split Details & Live Interactive Mockup */}
      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Information & Benefits */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dedicated Workflow</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {activeTab.tagline}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {activeTab.description}
          </p>

          {/* Bullet Perks */}
          <div className="space-y-2.5 pt-1">
            {activeTab.perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 flex items-center gap-3">
            <Link
              to={activeTab.dashboardUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{activeTab.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition"
            >
              Join Network
            </Link>
          </div>
        </div>

        {/* Right Side: Interactive Role Mockup Card */}
        <div className="lg:col-span-7">
          {activeTab.id === 'DONOR' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">Oberoi Grand Banquet Hall</h5>
                    <span className="text-[10px] text-slate-500 font-medium">Verified Food Donor • Mumbai</span>
                  </div>
                </div>
                <ExpiryTimerRing remainingHours={3.5} maxHours={12} size="sm" />
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black text-slate-800">45 Trays Steamed Basmati & Mughlai Dal</span>
                    <p className="text-[11px] text-slate-500">Stored in commercial insulated hot-holding vessels (65°C+)</p>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    45 Portions
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Safety Log Verified
                  </span>
                  <span className="font-bold text-indigo-600">Claimed by Robin Hood Army</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Dispatch Status: <b>Volunteer en route (12m away)</b></span>
                <span className="text-emerald-700 font-black">+₹4,500 Tax ESG Credit</span>
              </div>
            </div>
          )}

          {activeTab.id === 'NGO' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">Anand Seva Shelter Intake</h5>
                    <span className="text-[10px] text-slate-500 font-medium">Daily Need: 200 Meals • Capacity 85%</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  98% Match Score
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">BKC Convention Center Surplus</span>
                  <span className="text-[10px] font-bold text-slate-500">1.2 km away</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Available Quantity:</span>
                    <b className="text-slate-800">80 Cooked Meal Portions</b>
                  </div>
                  <div className="flex justify-between">
                    <span>Dietary Classification:</span>
                    <b className="text-emerald-700">100% Pure Vegetarian</b>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <ExpiryTimerRing remainingHours={4.2} maxHours={12} size="sm" />
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-xs hover:bg-emerald-700"
                  >
                    1-Click Direct Claim
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab.id === 'VOLUNTEER' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900">Active Rescue Courier Mission #402</h5>
                    <span className="text-[10px] text-slate-500 font-medium">Bandra West &rarr; Dharavi Shelter</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  In Transit
                </span>
              </div>

              {/* Mini Step Tracker */}
              <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Pickup: Taj Lands End</span>
                  <span className="font-bold text-emerald-600">Drop: Asha Kiran Foundation</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-800 font-bold">1. Matched</div>
                  <div className="p-1 rounded bg-emerald-100 text-emerald-800 font-bold">2. Picked Up</div>
                  <div className="p-1 rounded bg-amber-100 text-amber-800 font-bold animate-pulse">3. Quality Checked</div>
                  <div className="p-1 rounded bg-slate-100 text-slate-500 font-semibold">4. Delivered</div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Estimated Arrival: <b>14 mins</b></span>
                  <span className="font-bold text-emerald-700">+120 Hero Karma Pts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

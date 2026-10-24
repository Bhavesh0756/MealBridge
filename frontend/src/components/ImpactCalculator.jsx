import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Building2, Coffee, ShoppingBag, Leaf, Droplets, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

const SECTORS = [
  {
    id: 'RESTAURANT',
    name: 'Restaurant / Eatery',
    icon: Utensils,
    defaultMeals: 45,
    co2Factor: 2.2, // kg per meal
    waterFactor: 340, // Liters per meal
    mealValue: 120, // INR estimate
    badge: 'Popular',
  },
  {
    id: 'BANQUET',
    name: 'Banquet & Wedding Hall',
    icon: Building2,
    defaultMeals: 120,
    co2Factor: 2.8,
    waterFactor: 420,
    mealValue: 180,
    badge: 'High Impact',
  },
  {
    id: 'BAKERY',
    name: 'Bakery & Artisan Café',
    icon: Coffee,
    defaultMeals: 30,
    co2Factor: 1.6,
    waterFactor: 210,
    mealValue: 85,
    badge: 'Daily Yield',
  },
  {
    id: 'SUPERMARKET',
    name: 'Supermarket & Grocer',
    icon: ShoppingBag,
    defaultMeals: 85,
    co2Factor: 2.5,
    waterFactor: 380,
    mealValue: 140,
    badge: 'Packaged & Produce',
  },
];

export function ImpactCalculator() {
  const [selectedSector, setSelectedSector] = useState(SECTORS[0]);
  const [mealsPerDay, setMealsPerDay] = useState(SECTORS[0].defaultMeals);

  // Switch sector and update suggested default
  const handleSelectSector = (sector) => {
    setSelectedSector(sector);
    setMealsPerDay(sector.defaultMeals);
  };

  // Calculations (30 days/month basis)
  const monthlyMeals = mealsPerDay * 30;
  const annualMeals = monthlyMeals * 12;
  const co2SavedKg = Math.round(monthlyMeals * selectedSector.co2Factor);
  const waterSavedL = Math.round(monthlyMeals * selectedSector.waterFactor);
  const financialBenefit = Math.round(monthlyMeals * selectedSector.mealValue * 0.75); // estimated CSR tax & waste disposal savings

  return (
    <div className="stripe-card rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl relative overflow-hidden bg-white">
      {/* Subtle background gradient decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            Interactive ESG ROI Estimator
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Calculate Your Organization's Food Rescue Impact
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            See how much CO2 emission you divert, fresh water you conserve, and tax credit value you unlock each month with MealBridge.
          </p>
        </div>

        {/* Sector Selection Pills */}
        <div className="space-y-3">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider text-center sm:text-left">
            1. Select Your Food Establishment Category
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {SECTORS.map((sec) => {
              const isSelected = selectedSector.id === sec.id;
              const Icon = sec.icon;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSelectSector(sec)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-3 relative ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {sec.badge}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-black text-slate-900 leading-snug">{sec.name}</span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">~{sec.defaultMeals} meals/day</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Surplus Range Slider */}
        <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                2. Estimated Daily Surplus Food Portions
              </span>
              <span className="text-xs text-slate-500">Slide to adjust your typical surplus volume per day</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                {mealsPerDay}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">Meals / Day</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(Number(e.target.value))}
              className="modern-slider"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>10 meals (Boutique Cafe)</span>
              <span>250 meals (Standard Hotel)</span>
              <span>500+ meals (Mega Convention)</span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500">Quick Presets:</span>
            {[25, 50, 100, 200, 350].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMealsPerDay(preset)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition ${
                  mealsPerDay === preset
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset} meals
              </button>
            ))}
          </div>
        </div>

        {/* Live ESG & Financial Impact Output Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Metric 1: Meals Rescued */}
          <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">Meals Rescued / Mo</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {monthlyMeals.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-600">
              Equals <span className="font-bold text-emerald-700">{annualMeals.toLocaleString()}</span> meals annually fed to nearby shelters.
            </p>
          </div>

          {/* Metric 2: CO2 & Water Saved */}
          <div className="bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-white p-5 rounded-2xl border border-teal-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-teal-800 uppercase tracking-wide">CO2 & Water Saved</span>
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {co2SavedKg.toLocaleString()} <span className="text-lg font-bold text-slate-500">kg CO₂</span>
            </div>
            <p className="text-[11px] text-slate-600 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-600 inline shrink-0" />
              <span>Plus <b>{waterSavedL.toLocaleString()} Liters</b> freshwater conserved.</span>
            </p>
          </div>

          {/* Metric 3: Financial & Tax CSR Benefit */}
          <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white p-5 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wide">Tax & CSR Savings</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              ₹{financialBenefit.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-600">
              Tax write-off value & zero commercial dumpster haulage fees.
            </p>
          </div>
        </div>

        {/* CTA Footer Banner */}
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-black text-base sm:text-lg">Ready to transform your surplus food into community impact?</h4>
            <p className="text-xs text-slate-300">
              Sign up in 2 minutes. Free automated compliance certificates & logistics pickup coordination included.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95 shrink-0"
          >
            <span>Register as Food Donor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

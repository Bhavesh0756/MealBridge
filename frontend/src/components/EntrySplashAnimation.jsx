import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Heart, Truck, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const STAGES = [
  {
    id: 'KITCHEN',
    label: '1. Surplus Kitchen',
    headline: 'Hot Banquet Feasts Left Untouched',
    subtitle: 'Freshly prepared wedding banquet food waiting in hot-holding units',
    badge: '🍽️ Kitchen Surplus',
  },
  {
    id: 'BRIDGE',
    label: '2. The Rescue Bridge',
    headline: 'Connecting Volunteer Logistics in Real-Time',
    subtitle: 'Thermal insulated transport rushes the meal across the city in under 20 mins',
    badge: '🚴 Swift Eco-Courier',
  },
  {
    id: 'SHELTER',
    label: '3. Community Table',
    headline: 'Nourishing 60 Shelter Families Tonight',
    subtitle: 'Zero edible food in landfills. 100% wholesome nutrition delivered.',
    badge: '❤️ Zero Hunger Relief',
  },
];

export function EntrySplashAnimation({ forceShow = false, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const seen = sessionStorage.getItem('mealbridge_splash_seen');
    if (!seen || forceShow) {
      setIsVisible(true);
      sessionStorage.setItem('mealbridge_splash_seen', 'true');
    }
  }, [forceShow]);

  useEffect(() => {
    if (!isVisible) return;

    // Stage progression timers
    const timer1 = setTimeout(() => setStageIndex(1), 1200); // Shift to Rescue Bridge
    const timer2 = setTimeout(() => setStageIndex(2), 2400); // Shift to Community Shelter
    const timer3 = setTimeout(() => {
      // Dismiss after final brand resolution
      handleDismiss();
    }, 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const currentStage = STAGES[stageIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(10px)',
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between py-10 px-4 select-none overflow-hidden bg-gradient-to-b from-white via-emerald-50/40 to-slate-50"
        >
          {/* Subtle Ambient Golden / Emerald Glows */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Live Mission Stage Badge & Skip Button */}
          <div className="w-full max-w-4xl flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                The Food Rescue Journey
              </span>
            </div>

            <button
              onClick={handleDismiss}
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/90 hover:bg-white border border-slate-200/90 shadow-2xs transition flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              <span>Enter Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Center Stage: The Animated Food Rescue Canvas */}
          <div className="relative z-10 max-w-lg w-full text-center space-y-6 my-auto">
            {/* Visual Transformation Stage Container */}
            <div className="h-56 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {/* STAGE 1: Steaming Kitchen Feast */}
                {stageIndex === 0 && (
                  <motion.div
                    key="stage-kitchen"
                    initial={{ scale: 0.7, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, x: -60 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col items-center"
                  >
                    {/* Rising Steam Curves */}
                    <div className="flex gap-2.5 mb-2">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [-4, -18, -26],
                            opacity: [0, 0.8, 0],
                            scaleX: [1, 1.4, 0.8],
                          }}
                          transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            delay: i * 0.25,
                            ease: 'easeInOut',
                          }}
                          className="w-1.5 h-7 rounded-full bg-gradient-to-t from-amber-400/80 to-transparent blur-2xs"
                        />
                      ))}
                    </div>

                    {/* Steaming Banquet Pot / Plate Emblem */}
                    <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-1 shadow-2xl shadow-amber-500/25">
                      <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-amber-600">
                        <span className="text-5xl drop-shadow-sm">🍲</span>
                      </div>
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase shadow-md flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>60 Fresh Meals</span>
                    </motion.div>
                  </motion.div>
                )}

                {/* STAGE 2: The Rescue Bridge & Courier Dispatch */}
                {stageIndex === 1 && (
                  <motion.div
                    key="stage-bridge"
                    initial={{ scale: 0.7, opacity: 0, x: 60 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 0.8, opacity: 0, x: -60 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col items-center w-full max-w-sm"
                  >
                    {/* Animated Arch / Bridge SVG with dashing pulse */}
                    <svg className="w-full h-24 overflow-visible" viewBox="0 0 300 80">
                      <defs>
                        <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>

                      {/* Bridge Arc */}
                      <path
                        d="M 20 70 Q 150 10 280 70"
                        stroke="url(#bridgeGrad)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="6 4"
                        className="animate-pulse"
                      />

                      {/* Pylon Pillars */}
                      <line x1="80" y1="42" x2="80" y2="70" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="2 2" />
                      <line x1="150" y1="25" x2="150" y2="70" stroke="#10b981" strokeWidth="2" strokeDasharray="2 2" />
                      <line x1="220" y1="42" x2="220" y2="70" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="2 2" />
                    </svg>

                    {/* Gliding Courier Bike on Top of Bridge */}
                    <motion.div
                      animate={{
                        x: [-70, 70],
                        y: [-12, -26, -12],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }}
                      className="absolute -top-3 w-16 h-16 rounded-2xl bg-white border border-emerald-300 shadow-xl flex items-center justify-center text-3xl"
                    >
                      <span>🚴</span>
                    </motion.div>

                    <div className="mt-4 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-300/80 shadow-2xs">
                      <Truck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Zero-Emission Volunteer Transit</span>
                    </div>
                  </motion.div>
                )}

                {/* STAGE 3: Community Table & Loving Handover */}
                {stageIndex === 2 && (
                  <motion.div
                    key="stage-shelter"
                    initial={{ scale: 0.7, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.05, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col items-center"
                  >
                    {/* Floating Heart & Love Sparkles */}
                    <div className="absolute -top-6 flex gap-8">
                      <motion.div
                        animate={{ y: [-2, -16], opacity: [1, 0], scale: [0.8, 1.4] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className="text-rose-500 text-xl"
                      >
                        ❤️
                      </motion.div>
                      <motion.div
                        animate={{ y: [-2, -20], opacity: [1, 0], scale: [0.8, 1.4] }}
                        transition={{ duration: 1.6, delay: 0.3, repeat: Infinity }}
                        className="text-emerald-500 text-xl"
                      >
                        ✨
                      </motion.div>
                    </div>

                    {/* Loving Handover Icon Container */}
                    <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-1 shadow-2xl shadow-emerald-600/30">
                      <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center">
                        <span className="text-5xl">🤲</span>
                      </div>
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -bottom-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase shadow-md flex items-center gap-1.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      <span>Shelter Nourished</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dynamic Stage Storyline Headlines */}
            <div className="space-y-2 min-h-[90px]">
              <motion.div
                key={currentStage.id + '-badge'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-800 text-xs font-black border border-slate-200 shadow-2xs"
              >
                <span>{currentStage.badge}</span>
              </motion.div>

              <motion.h2
                key={currentStage.id + '-title'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug"
              >
                {currentStage.headline}
              </motion.h2>

              <motion.p
                key={currentStage.id + '-sub'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto"
              >
                {currentStage.subtitle}
              </motion.p>
            </div>

            {/* Brand Logo Stamp */}
            <div className="pt-2 flex items-center justify-center gap-2 text-slate-800 font-extrabold text-base">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Utensils className="w-4 h-4" />
              </div>
              <span>Meal<span className="text-emerald-600">Bridge</span></span>
              <span className="text-xs text-slate-400 font-medium">— Food Rescue Platform</span>
            </div>
          </div>

          {/* Bottom Stage Stepper Bar */}
          <div className="w-full max-w-md space-y-2 z-20">
            <div className="grid grid-cols-3 gap-2">
              {STAGES.map((s, idx) => {
                const isActive = idx === stageIndex;
                const isPassed = idx < stageIndex;

                return (
                  <div key={s.id} className="space-y-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isActive
                          ? 'bg-emerald-600 ring-2 ring-emerald-500/30'
                          : isPassed
                          ? 'bg-emerald-400'
                          : 'bg-slate-200'
                      }`}
                    />
                    <span
                      className={`block text-[10px] font-black text-center ${
                        isActive ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

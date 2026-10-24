import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const LOADING_STEPS = [
  { at: 0, text: 'Initializing Surplus Food Network...' },
  { at: 28, text: 'Connecting Verified Commercial Donors...' },
  { at: 60, text: 'Calibrating AI Proximity Matchmaker...' },
  { at: 85, text: 'Aligning Real-Time Courier Logistics...' },
  { at: 100, text: 'MealBridge Ready.' },
];

export function EntrySplashAnimation({ forceShow = false, onComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState(LOADING_STEPS[0].text);

  useEffect(() => {
    // Check if user already saw the intro in this browser tab session
    const seen = sessionStorage.getItem('mealbridge_splash_seen');
    if (!seen || forceShow) {
      setIsVisible(true);
      sessionStorage.setItem('mealbridge_splash_seen', 'true');
    }
  }, [forceShow]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const duration = 2200; // 2.2 seconds total reveal

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(rawPct);

      // Update status text based on current percentage
      for (let i = LOADING_STEPS.length - 1; i >= 0; i--) {
        if (rawPct >= LOADING_STEPS[i].at) {
          setStepText(LOADING_STEPS[i].text);
          break;
        }
      }

      if (rawPct >= 100) {
        clearInterval(interval);
        // Wait a brief moment at 100% before smooth fade exit
        setTimeout(() => {
          handleDismiss();
        }, 350);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(8px)',
            transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 50% 45%, #ffffff 0%, #f8fafc 65%, #f1f5f9 100%)',
          }}
        >
          {/* Subtle Ambient Background Mesh Rings */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
              className="w-[620px] h-[620px] rounded-full border border-emerald-500/10 border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
              className="w-[450px] h-[450px] rounded-full border border-teal-500/15"
            />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-3xl" />
          </div>

          {/* Skip Button in top-right */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-500 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/80 shadow-2xs transition flex items-center gap-1 cursor-pointer"
            >
              <span>Skip Intro</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Center Brand Assembly Card */}
          <div className="relative z-10 max-w-sm w-full mx-auto px-6 text-center space-y-6">
            {/* Animated Emblem */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative inline-flex items-center justify-center"
            >
              {/* Outer pulsing emerald halo */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl"
              />

              {/* Main Badge Container */}
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-2xl shadow-emerald-500/30">
                <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Utensils className="w-10 h-10 drop-shadow-md" />
                  </motion.div>
                </div>
              </div>

              {/* Orbiting Sparkle Satellite */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 pointer-events-none"
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-md border border-emerald-200 flex items-center justify-center text-amber-500 -top-1 right-2">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                </div>
              </motion.div>
            </motion.div>

            {/* Brand Title with Linear Shimmer Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="space-y-1.5"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[11px] font-black uppercase tracking-widest border border-emerald-200/80 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Zero Hunger • Zero Waste</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Meal<span className="text-emerald-600">Bridge</span>
              </h1>

              <p className="text-xs text-slate-500 font-medium">
                Surplus Food Rescue & Hyperlocal Dispatch
              </p>
            </motion.div>

            {/* Micro Progress Bar & Live Status Ticker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="space-y-2 pt-2"
            >
              {/* Minimalist 3px Progress Line */}
              <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              {/* Step Status Text & Percentage */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-0.5">
                <span className="truncate max-w-[240px] text-left text-slate-600">
                  {stepText}
                </span>
                <span className="text-emerald-700 font-black shrink-0 font-mono">
                  {progress}%
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { CheckCircle2, Clock, Truck, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    key: 'ASSIGNED',
    title: 'Mission Confirmed',
    description: 'Volunteer matched & dispatch assigned',
    icon: CheckCircle2,
  },
  {
    key: 'PICKED_UP',
    title: 'Out for Pickup',
    description: 'En route to donor kitchen',
    icon: Truck,
  },
  {
    key: 'QUALITY_VERIFIED',
    title: 'Quality Verified',
    description: 'Food temp & hygienic seal inspected',
    icon: ShieldCheck,
  },
  {
    key: 'COMPLETED',
    title: 'Delivered to NGO',
    description: 'Safe handover & recipient receipt signed',
    icon: MapPin,
  },
];

export function DeliveryTimeline({
  currentStatus = 'ASSIGNED',
  pickupAddress,
  dropoffAddress,
  onAdvanceStatus,
  canAdvance = false,
  compact = false,
}) {
  // Map various backend status strings to 0-3 step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'PENDING':
      case 'ASSIGNED':
        return 0;
      case 'PICKED_UP':
        return 1;
      case 'IN_TRANSIT':
      case 'QUALITY_VERIFIED':
        return 2;
      case 'COMPLETED':
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs ${compact ? 'p-3.5' : 'p-5'} space-y-4`}>
      {/* Header with live badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">Live Courier Dispatch Tracker</h4>
            <p className="text-[11px] text-slate-500 font-medium">Real-time GPS handover & safety verification</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Step {activeIndex + 1} of 4
        </span>
      </div>

      {/* Progress Bar / Steps */}
      <div className="relative pt-2 pb-1">
        {/* Horizontal Connector Line */}
        <div className="hidden sm:block absolute top-7 left-8 right-8 h-1 bg-slate-100 rounded-full z-0">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
          {STEPS.map((step, idx) => {
            const isDone = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const isUpcoming = idx > activeIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 transition-opacity ${
                  isUpcoming ? 'opacity-45' : 'opacity-100'
                }`}
              >
                {/* Step Circle Indicator */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : isCurrent
                      ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-500/20 border-2 border-emerald-500 shadow-sm'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Step Label */}
                <div className="flex-1 sm:flex-none">
                  <span
                    className={`block text-xs font-black tracking-tight ${
                      isCurrent ? 'text-emerald-700' : isDone ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  {!compact && (
                    <span className="block text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Origin -> Destination Route Details */}
      {(pickupAddress || dropoffAddress) && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-500">From:</span>
            <span className="font-medium truncate max-w-[200px]">{pickupAddress || 'Donor Location'}</span>
          </div>
          <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-2 text-slate-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <span className="font-semibold text-slate-500">To:</span>
            <span className="font-medium truncate max-w-[200px]">{dropoffAddress || 'Designated Shelter'}</span>
          </div>
        </div>
      )}

      {/* Quick Action Button for Volunteer if interactive */}
      {canAdvance && onAdvanceStatus && activeIndex < 3 && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onAdvanceStatus}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Advance to Next Stage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

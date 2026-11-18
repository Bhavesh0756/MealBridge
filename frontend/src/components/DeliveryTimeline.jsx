import React from 'react';
import { CheckCircle2, Clock, Truck, ShieldCheck, MapPin, ArrowRight, Navigation, AlertCircle } from 'lucide-react';

const STEPS = [
  {
    key: 'CLAIMED',
    title: 'Mission Confirmed',
    description: 'Volunteer matched & dispatch assigned',
    icon: CheckCircle2,
  },
  {
    key: 'EN_ROUTE_PICKUP',
    title: 'Out for Pickup',
    description: 'En route to donor kitchen',
    icon: Truck,
  },
  {
    key: 'FOOD_COLLECTED',
    title: 'Food Collected',
    description: 'Inspected & safely secured in transit',
    icon: ShieldCheck,
  },
  {
    key: 'EN_ROUTE_DELIVERY',
    title: 'Out for Delivery',
    description: 'In transit to NGO distribution center',
    icon: Navigation,
  },
  {
    key: 'DELIVERED',
    title: 'Delivered to NGO',
    description: 'Safe handover & recipient receipt signed',
    icon: MapPin,
  },
];

export function DeliveryTimeline({
  currentStatus = 'CLAIMED',
  pickupAddress,
  dropoffAddress,
  onAdvanceStatus,
  canAdvance = false,
  compact = false,
}) {
  // Map various backend status strings to 0-4 step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'READY_FOR_PICKUP':
      case 'PENDING':
      case 'ASSIGNED':
      case 'CLAIMED':
        return 0;
      case 'EN_ROUTE_PICKUP':
      case 'PICKED_UP':
        return 1;
      case 'FOOD_COLLECTED':
      case 'QUALITY_VERIFIED':
        return 2;
      case 'EN_ROUTE_DELIVERY':
      case 'IN_TRANSIT':
        return 3;
      case 'DELIVERED':
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const isFailed = currentStatus === 'FAILED';
  const isDelivered = currentStatus === 'DELIVERED' || currentStatus === 'COMPLETED';
  const activeIndex = isFailed ? -1 : getStepIndex(currentStatus);

  const progressPercent = isFailed
    ? 0
    : isDelivered
    ? 100
    : Math.max(0, Math.min(100, (activeIndex / (STEPS.length - 1)) * 100));

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs ${compact ? 'p-3.5' : 'p-5'} space-y-4`}>
      {/* Header with live badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl ${isFailed ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center font-bold`}>
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">Live Courier Dispatch Tracker</h4>
            <p className="text-[11px] text-slate-500 font-medium">Real-time GPS handover & safety verification</p>
          </div>
        </div>

        {isFailed ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Delivery Issue Reported
          </span>
        ) : isDelivered ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Delivery Complete ✓
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Step {activeIndex + 1} of {STEPS.length}
          </span>
        )}
      </div>

      {/* Progress Bar / Steps */}
      <div className="relative pt-2 pb-1">
        {/* Horizontal Connector Line */}
        <div className="hidden sm:block absolute top-7 left-[10%] right-[10%] h-1 bg-slate-100 rounded-full z-0">
          <div
            className={`h-full ${isFailed ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'} rounded-full transition-all duration-700 ease-in-out`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-2 relative z-10">
          {STEPS.map((step, idx) => {
            const isDone = isDelivered ? true : (!isFailed && idx < activeIndex);
            const isCurrent = !isDelivered && !isFailed && idx === activeIndex;
            const isUpcoming = isFailed ? false : (!isDelivered && idx > activeIndex);
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 transition-all duration-300 ${
                  isUpcoming ? 'opacity-40' : 'opacity-100'
                }`}
              >
                {/* Step Circle Indicator */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-300 shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : isCurrent
                      ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-500/25 border-2 border-emerald-500 shadow-sm animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Label */}
                <div className="flex-1 sm:flex-none">
                  <span
                    className={`block text-xs font-black tracking-tight ${
                      isCurrent ? 'text-emerald-700' : isDone ? 'text-slate-800' : 'text-slate-400'
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
      {canAdvance && onAdvanceStatus && activeIndex < (STEPS.length - 1) && !isFailed && (
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

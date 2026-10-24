import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export function ExpiryTimerRing({ remainingHours, maxHours = 24, size = 'md', showLabel = true }) {
  if (remainingHours === undefined || remainingHours === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
        <Clock className="w-3 h-3" /> Active
      </span>
    );
  }

  const hours = Math.max(0, Number(remainingHours));
  const isUrgent = hours <= 2;
  const isWarning = hours > 2 && hours <= 6;

  // Visual color scheme
  const theme = isUrgent
    ? {
        stroke: '#f43f5e',
        track: '#ffe4e6',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        label: 'Critical Expiry',
      }
    : isWarning
    ? {
        stroke: '#f59e0b',
        track: '#fef3c7',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'Expiring Soon',
      }
    : {
        stroke: '#10b981',
        track: '#d1fae5',
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Fresh Batch',
      };

  // Dimensions
  const dim = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;
  const strokeWidth = size === 'sm' ? 2.5 : size === 'lg' ? 3.5 : 3;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Progress ratio
  const ratio = Math.min(1, Math.max(0, hours / maxHours));
  const strokeDashoffset = circumference - ratio * circumference;

  // Formatted hours or minutes
  const timeText = hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-2xs transition-colors duration-200 ${theme.bg} ${theme.text} ${theme.border} ${
        isUrgent ? 'animate-pulse' : ''
      }`}
      title={`${hours.toFixed(1)} hours remaining until batch freshness threshold`}
    >
      <div className="relative flex items-center justify-center shrink-0" style={{ width: dim, height: dim }}>
        <svg className="-rotate-90" width={dim} height={dim}>
          {/* Background circle track */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke={theme.track}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated active countdown progress ring */}
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center icon / value */}
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black tracking-tight">
          {isUrgent ? (
            <AlertTriangle className="w-2.5 h-2.5 text-rose-600 animate-bounce" />
          ) : (
            <span style={{ fontSize: size === 'sm' ? '8px' : '9.5px' }}>{timeText}</span>
          )}
        </span>
      </div>

      {showLabel && (
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[11px] font-black tracking-tight flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
            {timeText} left
          </span>
          <span className="text-[9px] font-medium opacity-75">{theme.label}</span>
        </div>
      )}
    </div>
  );
}

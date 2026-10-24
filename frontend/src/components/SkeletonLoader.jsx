import React from 'react';

export function SkeletonLine({ className = 'h-4 w-full' }) {
  return (
    <div className={`skeleton-shimmer rounded-md ${className}`} />
  );
}

export function SkeletonStat() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-4 w-24" />
        <div className="w-9 h-9 rounded-xl skeleton-shimmer" />
      </div>
      <SkeletonLine className="h-7 w-32" />
      <SkeletonLine className="h-3 w-40" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <SkeletonLine className="h-3 w-20 rounded-full" />
          <SkeletonLine className="h-5 w-4/5" />
        </div>
        <div className="w-12 h-12 rounded-full skeleton-shimmer shrink-0" />
      </div>
      
      <div className="space-y-2">
        <SkeletonLine className="h-3.5 w-full" />
        <SkeletonLine className="h-3.5 w-3/4" />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <SkeletonLine className="h-8 rounded-lg" />
        <SkeletonLine className="h-8 rounded-lg" />
      </div>

      <div className="pt-2 flex items-center justify-between">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonFeed({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton-shimmer shrink-0" />
          <div className="space-y-1.5 flex-1">
            <SkeletonLine className="h-4 w-36" />
            <SkeletonLine className="h-3 w-24" />
          </div>
        </div>
      </td>
      <td className="py-4 px-4"><SkeletonLine className="h-4 w-20" /></td>
      <td className="py-4 px-4"><SkeletonLine className="h-6 w-24 rounded-full" /></td>
      <td className="py-4 px-4"><SkeletonLine className="h-4 w-24" /></td>
      <td className="py-4 px-4 text-right"><SkeletonLine className="h-8 w-20 rounded-lg inline-block" /></td>
    </tr>
  );
}

import React from 'react';

export default function AdPlaceholder({ format = 'banner', label = 'Ad Placement Slot' }) {
  return (
    <div className="w-full my-4 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-[#0E1626]/80 p-3.5 text-center text-xs text-slate-500 shadow-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></span>
          <span className="font-mono uppercase tracking-wider text-[11px] text-slate-600 dark:text-slate-400 font-bold">
            {label}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
          High-CPM Container reserved for Adsterra &bull; 18+ Gamble Responsibly
        </p>
      </div>
    </div>
  );
}

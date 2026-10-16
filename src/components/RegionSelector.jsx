import React from 'react';
import { AFRICAN_REGIONS } from '../data/tickets';

export default function RegionSelector({ selectedRegion, onSelectRegion }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {AFRICAN_REGIONS.map((r) => {
        const isSelected = selectedRegion === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onSelectRegion(r.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-emerald-500 text-slate-950 shadow-sm scale-[1.02]'
                : 'bg-white dark:bg-[#0E172A] text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-white/[0.08]'
            }`}
          >
            <span>{r.flag}</span>
            <span>{r.name}</span>
          </button>
        );
      })}
    </div>
  );
}

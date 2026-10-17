import React from 'react';
import { MARKETS } from '../data/markets';
import { TICKETS } from '../data/tickets';
import { Layers, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function MarketsDirectoryPage({ onNavigate }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
            Football Betting Markets Directory
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Each football market operates under different tactical physics and statistical variance. Browse markets below for detailed rules, tips, and active tickets.
        </p>
      </div>

      {/* Markets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARKETS.map((market) => {
          const ticketsInMarket = TICKETS.filter(t => t.marketId === market.id);

          return (
            <div
              key={market.id}
              onClick={() => onNavigate(`market/${market.id}`)}
              className="bg-white dark:bg-[#0E1626] hover:border-blue-500/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                    {market.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {ticketsInMarket.length} {ticketsInMarket.length === 1 ? 'slip' : 'slips'}
                  </span>
                </div>

                <h2 className="text-base font-display font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {market.name}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {market.description}
                </p>

                {/* Tactical Tip Preview */}
                <div className="mt-3 bg-slate-50 dark:bg-[#121B2F] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                  <strong className="text-blue-600 dark:text-blue-400 block uppercase tracking-wide text-[9px] mb-0.5 font-bold">
                    Tactical Foundation:
                  </strong>
                  <p className="line-clamp-2">{market.tacticalTip}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {market.presets.slice(0, 3).map((p, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300 rounded font-mono">
                      {p}
                    </span>
                  ))}
                </div>

                <span className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>View Slips</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

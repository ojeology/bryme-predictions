import React from 'react';
import { MARKETS } from '../data/markets';
import { TICKETS } from '../data/tickets';
import { Layers, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function MarketsDirectoryPage({ onNavigate }) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-pitch-800 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-brand-green" />
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Football Betting Markets Directory
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
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
              onClick={() => onNavigate(`markets/${market.slug}`)}
              className="bg-brand-card hover:bg-pitch-800/90 border border-brand-cardBorder hover:border-slate-600 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-pitch-850 text-brand-greenLight border border-pitch-750">
                    {market.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {ticketsInMarket.length} {ticketsInMarket.length === 1 ? 'ticket' : 'tickets'}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {market.name}
                </h2>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {market.description}
                </p>

                {/* Tactical tip snippet */}
                <div className="mt-3 bg-pitch-950 p-2.5 rounded-lg border border-pitch-800 text-[11px] text-slate-300">
                  <span className="text-brand-green font-semibold block text-[10px] uppercase">
                    Tactical Strategy Note:
                  </span>
                  {market.tacticalTip}
                </div>
              </div>

              {/* Presets & CTA */}
              <div className="mt-4 pt-3 border-t border-pitch-800 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {market.presets.slice(0, 3).map((p, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-pitch-900 text-slate-400 rounded">
                      {p}
                    </span>
                  ))}
                </div>

                <span className="text-xs text-brand-green font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
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

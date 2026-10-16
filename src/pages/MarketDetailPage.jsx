import React from 'react';
import { MARKETS } from '../data/markets';
import { TICKETS } from '../data/tickets';
import TicketCard from '../components/TicketCard';
import { ArrowLeft, Layers, Info, CheckCircle2 } from 'lucide-react';

export default function MarketDetailPage({ slug, onNavigate }) {
  const market = MARKETS.find(m => m.slug === slug || m.id === slug) || MARKETS[0];
  const tickets = TICKETS.filter(t => t.marketId === market.id);

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('markets')}
          className="inline-flex items-center gap-1.5 text-xs text-brand-green hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Markets Directory</span>
        </button>
      </div>

      {/* Market Header */}
      <div className="bg-brand-card border border-brand-cardBorder rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-pitch-850 text-brand-green border border-pitch-750">
            {market.badge} Market
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {tickets.length} Available Tickets
          </span>
        </div>

        <h1 className="text-2xl font-black text-white">
          {market.name}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          {market.description}
        </p>

        {/* Tactical Note */}
        <div className="bg-pitch-950 p-3 rounded-xl border border-pitch-800 text-xs text-slate-300">
          <strong className="text-brand-green block mb-0.5 uppercase tracking-wide text-[10px]">
            Statistical Foundation:
          </strong>
          {market.tacticalTip}
        </div>

        {/* Common Market Formats / Presets */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Common Lines:</span>
          {market.presets.map((p, idx) => (
            <span key={idx} className="bg-pitch-850 border border-pitch-750 text-slate-200 px-2.5 py-1 rounded-md text-[11px] font-mono">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Tickets in this Market */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-green" />
          Active &amp; Tracked Tickets in {market.shortName}
        </h2>

        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onNavigate={onNavigate} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-pitch-850 p-8 rounded-xl border border-pitch-800 text-center text-xs text-slate-400">
            No active tickets currently logged under this market. Check back before weekend kickoff.
          </div>
        )}
      </div>

    </div>
  );
}

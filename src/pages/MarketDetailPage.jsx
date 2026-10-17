import React from 'react';
import { MARKETS } from '../data/markets';
import { TICKETS } from '../data/tickets';
import TicketCard from '../components/TicketCard';
import AdPlaceholder from '../components/AdPlaceholder';
import { ArrowLeft, Layers, Info, CheckCircle2 } from 'lucide-react';

export default function MarketDetailPage({ marketId, slug, onNavigate }) {
  const currentKey = marketId || slug;
  const market = MARKETS.find(m => m.id === currentKey || m.slug === currentKey) || MARKETS[0];
  const tickets = TICKETS.filter(t => t.marketId === market.id);

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Back to Hub</span>
        </button>
      </div>

      {/* TOP AD SLOT */}
      <AdPlaceholder label="Sponsored Betting Partner Banner (Adsterra / High-CPM Slot)" />

      {/* Market Header */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-300/40 dark:border-blue-800/40">
            {market.badge || 'Verified'} Market
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {tickets.length} Available Tickets
          </span>
        </div>

        <h1 className="text-2xl font-display font-black text-slate-900 dark:text-white">
          {market.name}
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {market.description}
        </p>

        {/* Tactical Note */}
        {market.tacticalTip && (
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-blue-600 dark:text-blue-400 block mb-0.5 uppercase tracking-wide text-[10px]">
              Statistical Model Tip:
            </strong>
            {market.tacticalTip}
          </div>
        )}

        {/* Common Market Formats / Presets */}
        {market.presets && market.presets.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Common Lines:</span>
            {market.presets.map((p, idx) => (
              <span key={idx} className="bg-slate-100 dark:bg-[#162238] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-mono">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tickets in this Market */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          <span>Active &amp; Tracked Slips in {market.shortName || market.name}</span>
        </h2>

        {tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onNavigate={onNavigate} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0E1626] p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No active tickets currently logged under this market. Fresh selections drop at 02:00 AM WAT.
          </div>
        )}
      </div>

      {/* BOTTOM AD SLOT */}
      <AdPlaceholder label="Bottom Partner Banner (Adsterra / Partner)" />

    </div>
  );
}

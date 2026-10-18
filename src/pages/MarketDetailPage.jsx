import React from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { MARKETS as FALLBACK_MARKETS } from '../data/markets';
import { TICKETS } from '../data/tickets';
import TicketCard from '../components/TicketCard';
import AdPlaceholder from '../components/AdPlaceholder';
import { ArrowLeft, Layers, Info, CheckCircle2, Percent, ShieldCheck, Flame } from 'lucide-react';

export default function MarketDetailPage({ marketId, slug, onNavigate }) {
  const { markets } = usePredictions();
  const currentKey = marketId || slug;
  const marketList = markets && markets.length > 0 ? markets : FALLBACK_MARKETS;
  const market = marketList.find(m => m.id === currentKey || m.slug === currentKey) || marketList[0];
  const tickets = TICKETS.filter(t => t.marketId === market?.id);

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('markets')}
          className="inline-flex items-center gap-1.5 text-xs text-[#E41B13] dark:text-rose-400 hover:underline font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Back to All 35+ Markets Database</span>
        </button>
      </div>

      {/* TOP AD SLOT */}
      <AdPlaceholder label="Sponsored Betting Partner Banner (Adsterra / High-CPM Slot)" />

      {/* Market Header */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded bg-[#E41B13]/10 dark:bg-[#E41B13]/20 text-[#E41B13] dark:text-rose-400 border border-[#E41B13]/30">
              {market.badge || 'Verified'} Market
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {tickets.length} Available Slips
            </span>
          </div>

          {market.averageHitRate && (
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              Avg Historical Hit Rate: {market.averageHitRate}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
            {market.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Category: <strong className="text-slate-900 dark:text-white uppercase">{market.category}</strong>
          </p>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {market.description}
        </p>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Typical Odds</span>
            <strong className="text-base text-slate-900 dark:text-white font-black">{market.typicalOddsRange || '1.30 - 2.00'}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Risk Profile</span>
            <strong className={`text-base font-black ${market.riskLevel?.includes('Low') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
              {market.riskLevel || 'Medium'}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800 sm:col-span-2">
            <span className="text-[10px] text-slate-400 uppercase block">Best Leagues</span>
            <span className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate block">
              {market.bestLeagues ? market.bestLeagues.join(', ') : 'European Top 5 Leagues'}
            </span>
          </div>
        </div>

        {/* How It Works & Settlement */}
        {market.howItWorks && (
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
            <strong className="uppercase font-bold text-[10px] block mb-0.5">Settlement Rule:</strong>
            {market.howItWorks}
          </div>
        )}

        {/* Tactical Note */}
        {market.tacticalTip && (
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-[#E41B13] dark:text-rose-400 block mb-0.5 uppercase tracking-wide text-[10px] font-bold">
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

        {/* Supported Bookmakers */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap text-xs font-mono text-slate-500">
          <span>Supported on:</span>
          {['SportyBet', 'Bet9ja', '1xBet', 'BetKing', 'Betway'].map(b => (
            <span key={b} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold">
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Tickets in this Market */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#E41B13]" />
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

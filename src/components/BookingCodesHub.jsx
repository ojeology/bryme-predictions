import React, { useState } from 'react';
import { DAILY_BOOKING_TICKETS } from '../data/bookingTickets';
import { 
  Copy, Check, Zap, Flame, ShieldCheck, ChevronRight, 
  Share2, ArrowRight, Trophy, Sparkles, Lock, Unlock, Eye
} from 'lucide-react';

export default function BookingCodesHub({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyCode = (e, code, codeKey) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(codeKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTickets = DAILY_BOOKING_TICKETS.filter(t => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'all', label: 'All Verified Slips (5)' },
          { id: 'banker', label: '🎯 2.00 Odds Banker' },
          { id: 'ladder', label: '🪜 Rollover Step 3' },
          { id: 'accumulator', label: '🛡️ 5.00 Odds Acca' },
          { id: 'goals', label: '⚽ Over 1.5 Radar' },
          { id: 'mega', label: '🚀 10.00 Odds Mega' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111A2E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* High-CTR Teaser Ticket Cards (Monetization Engine: Drives Pageviews to /ticket/:id) */}
      <div className="space-y-3.5">
        {filteredTickets.map(ticket => {
          const firstSelection = ticket.selections[0];
          const remainingCount = ticket.selections.length - 1;

          return (
            <div
              key={ticket.id}
              onClick={() => onNavigate(`ticket/${ticket.id}`)}
              className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] hover:border-blue-500/60 dark:hover:border-blue-500/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Card Header */}
              <div className="p-4 bg-slate-50/70 dark:bg-[#121B30] border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] uppercase font-display font-black tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300/40 dark:border-blue-800/40">
                      {ticket.badge}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      {ticket.confidence}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Dropped: {ticket.dropTime}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {ticket.title}
                  </h3>
                </div>

                {/* Total Odds Multiplier Pill */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                  <div className="bg-white dark:bg-[#162238] px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-right">
                    <span className="text-[9px] uppercase font-mono text-slate-400 block leading-tight">Total Odds</span>
                    <span className="text-xl font-mono font-black text-blue-600 dark:text-blue-400 leading-none">
                      {ticket.totalOdds}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Teaser Area (Strategic Teaser: Shows Match 1, Teases Remaining) */}
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  
                  {/* Selection #1: Fully Visible Teaser */}
                  {firstSelection && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131E33] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 block uppercase">
                          {firstSelection.league} &bull; Leg 1 of {ticket.selections.length}
                        </span>
                        <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {firstSelection.match}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Pick: <strong className="text-slate-900 dark:text-slate-100">{firstSelection.pick}</strong>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold bg-white dark:bg-[#1A2640] text-slate-900 dark:text-white px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex-shrink-0">
                        {firstSelection.odds}x
                      </span>
                    </div>
                  )}

                  {/* Remaining Matches: Teaser Card (Encourages Click to Detail Page) */}
                  {remainingCount > 0 && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-blue-50/50 dark:from-blue-950/20 dark:via-[#131F36] dark:to-[#0F1829] border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            +{remainingCount} Remaining Match{remainingCount > 1 ? 'es' : ''} &amp; Complete Breakdown
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Includes verified tactical analysis and booking codes.
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider hidden sm:inline flex-shrink-0">
                        Free Unlock &rarr;
                      </span>
                    </div>
                  )}

                </div>

                {/* Bottom Action Bar: 1-Tap Copy or Unlock Page */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span>Codes Available:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">SportyBet, Bet9ja, 1xBet, BetKing</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick Sporty copy */}
                    <button
                      onClick={(e) => handleCopyCode(e, ticket.codes.sportybet, `${ticket.id}-sporty`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-[#1C2A44] text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                      title="Quick Copy SportyBet"
                    >
                      {copiedId === `${ticket.id}-sporty` ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                      <span>Sporty</span>
                    </button>

                    {/* Main CTA: Route to Detail Page (Generates Pageview!) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`ticket/${ticket.id}`);
                      }}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-sm group-hover:bg-blue-500"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Unlock Slip &amp; Analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

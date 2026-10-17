import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { 
  Copy, Check, Zap, Flame, ShieldCheck, ChevronRight, 
  Share2, ArrowRight, Trophy, Sparkles, Lock, Unlock, Eye
} from 'lucide-react';

export default function BookingCodesHub({ onNavigate }) {
  const { tickets } = usePredictions();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyCode = (e, code, codeKey) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedId(codeKey);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      
      {/* Category Filter Tabs with Sporty app feel */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'all', label: 'All Slips' },
          { id: 'banker', label: '🎯 2.00x Banker' },
          { id: 'ladder', label: '🪜 Rollover Ladder' },
          { id: 'accumulator', label: '🛡️ 5.00x Acca' },
          { id: 'goals', label: '⚽ Over 1.5 Radar' },
          { id: 'mega', label: '🚀 10.00x Mega' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#E41B13] text-white shadow-md'
                : 'bg-white dark:bg-[#111A2E] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* High-CTR Teaser Ticket Cards (SportyBet Betting Slip Feel) */}
      <div className="space-y-3.5">
        {filteredTickets.map(ticket => {
          const firstSelection = ticket.selections[0];
          const remainingCount = ticket.selections.length - 1;
          const sportyCode = ticket.codes?.sportybet || ticket.bookingCode || 'BC9482';
          const bet9jaCode = ticket.codes?.bet9ja || 'B9J-772';

          return (
            <div
              key={ticket.id}
              onClick={() => onNavigate(`ticket/${ticket.id}`)}
              className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] hover:border-[#E41B13]/60 dark:hover:border-[#E41B13]/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Card Header */}
              <div className="p-4 bg-slate-50/70 dark:bg-[#121B30] border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] uppercase font-display font-black tracking-wider px-2 py-0.5 rounded bg-[#E41B13]/10 dark:bg-[#E41B13]/20 text-[#E41B13] dark:text-rose-400 border border-[#E41B13]/20">
                      {ticket.badge}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      {ticket.confidence}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Drop: {ticket.dropTime}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-[#E41B13] dark:group-hover:text-rose-400 transition-colors">
                    {ticket.title}
                  </h3>
                </div>

                {/* Total Odds Multiplier Pill */}
                <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                  <div className="bg-white dark:bg-[#162238] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right shadow-sm">
                    <span className="text-[9px] uppercase font-mono text-slate-400 block leading-tight">Acca Odds</span>
                    <span className="text-xl font-mono font-black text-[#E41B13] dark:text-rose-400 leading-none">
                      {ticket.totalOdds}x
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Teaser Area */}
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

                      {/* Tactile Sporty Odds Pill */}
                      <span className="text-xs font-mono font-black bg-rose-50 dark:bg-rose-950/40 text-[#E41B13] dark:text-rose-400 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900/40 flex-shrink-0">
                        {firstSelection.odds}x
                      </span>
                    </div>
                  )}

                  {/* Remaining Matches Teaser Card */}
                  {remainingCount > 0 && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50/40 via-slate-50 to-rose-50/40 dark:from-rose-950/20 dark:via-[#131F36] dark:to-[#0F1829] border border-rose-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#E41B13]/10 dark:bg-[#E41B13]/20 text-[#E41B13] dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            +{remainingCount} Remaining Match{remainingCount > 1 ? 'es' : ''} on this Slip
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Click to unlock complete match sheet, team news &amp; bookmaker codes.
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 uppercase tracking-wider hidden sm:inline flex-shrink-0">
                        Reveal Slip &rarr;
                      </span>
                    </div>
                  )}

                </div>

                {/* Bottom Action Bar: Sporty & Bet9ja 1-Tap Booking Codes */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* SportyBet Code Pill */}
                    <div className="flex items-center gap-1 bg-[#E41B13]/10 dark:bg-[#E41B13]/20 border border-[#E41B13]/30 px-2 py-1 rounded-lg">
                      <span className="text-[9px] font-display font-black text-[#E41B13] dark:text-rose-400 uppercase">Sporty:</span>
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white">{sportyCode}</span>
                      <button
                        onClick={(e) => handleCopyCode(e, sportyCode, `${ticket.id}-sporty`)}
                        className="p-1 hover:text-[#E41B13] text-slate-500 transition-colors"
                        title="Copy SportyBet Code"
                      >
                        {copiedId === `${ticket.id}-sporty` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Bet9ja Code Pill */}
                    <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 px-2 py-1 rounded-lg">
                      <span className="text-[9px] font-display font-black text-emerald-700 dark:text-emerald-400 uppercase">Bet9ja:</span>
                      <span className="text-xs font-mono font-black text-slate-900 dark:text-white">{bet9jaCode}</span>
                      <button
                        onClick={(e) => handleCopyCode(e, bet9jaCode, `${ticket.id}-bet9ja`)}
                        className="p-1 hover:text-emerald-600 text-slate-500 transition-colors"
                        title="Copy Bet9ja Code"
                      >
                        {copiedId === `${ticket.id}-bet9ja` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Main CTA: Route to Detail Page */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(`ticket/${ticket.id}`);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#E41B13] dark:hover:bg-[#E41B13] text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Slip</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

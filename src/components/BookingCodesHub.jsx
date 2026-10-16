import React, { useState } from 'react';
import { DAILY_BOOKING_TICKETS } from '../data/bookingTickets';
import { 
  Copy, Check, Zap, Flame, ShieldCheck, ChevronDown, ChevronUp, 
  Share2, ArrowUpRight, Trophy, Sparkles, Filter 
} from 'lucide-react';

export default function BookingCodesHub({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedTicketId, setExpandedTicketId] = useState('ticket-2-odds-banker');

  const handleCopyCode = (code, codeKey) => {
    navigator.clipboard.writeText(code);
    setCopiedId(codeKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareTicket = (ticket) => {
    const text = `🔥 BRYME PREDICTIONS - ${ticket.title} (${ticket.totalOdds}x Odds):\n` +
      ticket.selections.map(s => `• ${s.match} (${s.league}): ${s.pick} @ ${s.odds}x`).join('\n') +
      `\n\n📌 SportyBet Code: ${ticket.codes.sportybet}\n📌 Bet9ja Code: ${ticket.codes.bet9ja}\n📌 1xBet Code: ${ticket.codes.onexbet}\n\nVerified daily at: https://ojeology.github.io/bryme-predictions/`;
    navigator.clipboard.writeText(text);
    setCopiedId(`share-${ticket.id}`);
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
          { id: 'all', label: 'All Verified Tickets (5)' },
          { id: 'banker', label: '🎯 2.00 Odds Banker' },
          { id: 'ladder', label: '🪜 Rollover Ladder' },
          { id: 'accumulator', label: '🛡️ 5.00 Odds Acca' },
          { id: 'goals', label: '⚽ Over 1.5 Radar' },
          { id: 'mega', label: '🚀 10.00 Odds Mega' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/40'
                : 'bg-white dark:bg-[#131C2E] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tickets Cards List */}
      <div className="space-y-4">
        {filteredTickets.map(ticket => {
          const isExpanded = expandedTicketId === ticket.id;

          return (
            <div
              key={ticket.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] overflow-hidden shadow-sm hover:border-blue-500/50 transition-all"
            >
              {/* Card Header */}
              <div className="p-4 bg-slate-50/70 dark:bg-[#0E1626] border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-display font-black tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300/40 dark:border-blue-800/40">
                      {ticket.badge}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      {ticket.confidence}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Dropped: {ticket.dropTime}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {ticket.description}
                  </p>
                </div>

                {/* Total Odds & Action */}
                <div className="flex items-center gap-3 self-start md:self-auto flex-shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Multiplier</span>
                    <span className="text-2xl font-mono font-black text-blue-600 dark:text-blue-400 leading-none">
                      {ticket.totalOdds}x
                    </span>
                  </div>

                  <button
                    onClick={() => handleShareTicket(ticket)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-[#1A2438] text-slate-600 dark:text-slate-300 hover:text-blue-600 border border-slate-200 dark:border-slate-800 transition-colors"
                    title="Copy full slip breakdown"
                  >
                    {copiedId === `share-${ticket.id}` ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Multi-Bookmaker Booking Codes Grid (The Core Tool!) */}
              <div className="p-3 sm:p-4 bg-blue-50/30 dark:bg-[#0A1120] border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  1-Tap Booking Codes for Major African Bookmakers:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  
                  {/* SportyBet */}
                  <div className="p-2 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 shadow-sm">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400 block font-display">
                        SportyBet
                      </span>
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white truncate block">
                        {ticket.codes.sportybet}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(ticket.codes.sportybet, `${ticket.id}-sporty`)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1E293B] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors flex-shrink-0"
                      title="Copy SportyBet code"
                    >
                      {copiedId === `${ticket.id}-sporty` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Bet9ja */}
                  <div className="p-2 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 shadow-sm">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block font-display">
                        Bet9ja
                      </span>
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white truncate block">
                        {ticket.codes.bet9ja}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(ticket.codes.bet9ja, `${ticket.id}-bet9ja`)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1E293B] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors flex-shrink-0"
                      title="Copy Bet9ja code"
                    >
                      {copiedId === `${ticket.id}-bet9ja` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* 1xBet */}
                  <div className="p-2 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 shadow-sm">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400 block font-display">
                        1xBet
                      </span>
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white truncate block">
                        {ticket.codes.onexbet}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(ticket.codes.onexbet, `${ticket.id}-1xbet`)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1E293B] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors flex-shrink-0"
                      title="Copy 1xBet code"
                    >
                      {copiedId === `${ticket.id}-1xbet` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* BetKing */}
                  <div className="p-2 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 shadow-sm">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-amber-500 dark:text-amber-400 block font-display">
                        BetKing
                      </span>
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white truncate block">
                        {ticket.codes.betking}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(ticket.codes.betking, `${ticket.id}-betking`)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1E293B] hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors flex-shrink-0"
                      title="Copy BetKing code"
                    >
                      {copiedId === `${ticket.id}-betking` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Betway */}
                  <div className="p-2 rounded-xl bg-white dark:bg-[#162032] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 shadow-sm col-span-2 sm:col-span-1">
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-slate-700 dark:text-slate-300 block font-display">
                        Betway
                      </span>
                      <span className="font-mono font-black text-xs text-slate-900 dark:text-white truncate block">
                        {ticket.codes.betway}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(ticket.codes.betway, `${ticket.id}-betway`)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors flex-shrink-0"
                      title="Copy Betway code"
                    >
                      {copiedId === `${ticket.id}-betway` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                </div>
              </div>

              {/* Selections Breakdown Accordion */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Included Selections ({ticket.selections.length})</span>
                  </span>

                  <button
                    onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Tactical Rationale' : 'View Tactical Rationale'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {ticket.selections.map((sel, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/80 dark:border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {sel.league}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {sel.kickoff}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                            Pick: {sel.pick}
                          </span>
                          <span className="text-xs font-mono font-black text-slate-900 dark:text-white bg-white dark:bg-[#1A2438] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                            {sel.odds}x
                          </span>
                        </div>
                      </div>

                      <div className="font-display font-bold text-sm text-slate-900 dark:text-white">
                        {sel.match}
                      </div>

                      {isExpanded && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                          "{sel.analysis}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Copy, Check, Share2, ArrowRight, Flame, ExternalLink, Zap } from 'lucide-react';

export default function TicketCard({ ticket, onNavigate }) {
  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);
  const [copiedGeneral, setCopiedGeneral] = useState(false);

  const sportyCode = ticket.codes?.sportybet || (ticket.bookmaker?.toLowerCase() === 'sportybet' ? ticket.bookingCode : null) || ticket.bookingCode || 'Q7S287';
  const bet9jaCode = ticket.codes?.bet9ja || (ticket.bookmaker?.toLowerCase() === 'bet9ja' ? ticket.bookingCode : null) || '5WGQKM6';

  const handleCopyCode = (e, code, type) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      if (type === 'sporty') {
        setCopiedSporty(true);
        setTimeout(() => setCopiedSporty(false), 2500);
      } else if (type === 'bet9ja') {
        setCopiedBet9ja(true);
        setTimeout(() => setCopiedBet9ja(false), 2500);
      } else {
        setCopiedGeneral(true);
        setTimeout(() => setCopiedGeneral(false), 2500);
      }
    }
  };

  const selectionsCount = ticket.selections ? ticket.selections.length : (ticket.eventsCount || 3);
  const topSelection = ticket.selections && ticket.selections.length > 0 ? ticket.selections[0] : null;

  return (
    <div
      onClick={() => onNavigate(`ticket/${ticket.id}`)}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#E41B13]/60 bg-white dark:bg-[#0E1626] p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md space-y-3.5 group"
    >
      {/* Top Slip Bar: Bookmaker Badge, Leg Count, Odds & Status */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-display font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E41B13]/10 dark:bg-[#E41B13]/20 text-[#E41B13] dark:text-rose-400 border border-[#E41B13]/30">
            {ticket.bookmaker || 'Multi-Bookmaker'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
            {selectionsCount} {selectionsCount === 1 ? 'Game' : 'Games Acca'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-display font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-[#16223B] border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-md font-mono">
            {typeof ticket.totalOdds === 'number' ? ticket.totalOdds.toFixed(2) : ticket.totalOdds}x Odds
          </span>
          <StatusBadge status={ticket.status || 'pending'} size="xs" />
        </div>
      </div>

      {/* Slip Title & Key Highlight Match (Quick Context) */}
      <div>
        <h4 className="font-display font-black text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-[#E41B13] dark:group-hover:text-rose-400 transition-colors line-clamp-1">
          {ticket.title}
        </h4>
        
        {topSelection ? (
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate">
            <span className="text-[10px] uppercase font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
              Highlight
            </span>
            <span className="truncate font-medium">{topSelection.match} &bull; <strong className="text-slate-900 dark:text-white">{topSelection.pick}</strong></span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Fast slip: Load code on bookmaker to view all matches &amp; edit.
          </p>
        )}
      </div>

      {/* ── THE HERO: PICK CODE AND BOUNCE BAR ── */}
      <div className="rounded-xl bg-slate-50 dark:bg-[#070D1A] border border-slate-200 dark:border-slate-800 p-2.5 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span>Tap code to copy &amp; paste into bookmaker:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">1-Tap Load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* SportyBet Code Pill */}
          <div 
            onClick={(e) => handleCopyCode(e, sportyCode, 'sporty')}
            className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
              copiedSporty
                ? 'bg-[#00C250] text-black border-[#00C250] shadow-sm'
                : 'bg-white dark:bg-[#121B2F] border-slate-200 dark:border-slate-700 hover:border-[#E41B13]'
            }`}
          >
            <div className="min-w-0">
              <span className={`text-[9px] font-display font-black block uppercase ${copiedSporty ? 'text-black' : 'text-[#E41B13] dark:text-rose-400'}`}>
                SportyBet
              </span>
              <span className={`font-mono font-black text-xs truncate block ${copiedSporty ? 'text-black' : 'text-slate-900 dark:text-white'}`}>
                {sportyCode}
              </span>
            </div>

            <button
              type="button"
              className={`p-1.5 rounded text-xs transition-colors ${
                copiedSporty ? 'bg-black text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {copiedSporty ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Bet9ja Code Pill */}
          <div 
            onClick={(e) => handleCopyCode(e, bet9jaCode, 'bet9ja')}
            className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
              copiedBet9ja
                ? 'bg-[#00C250] text-black border-[#00C250] shadow-sm'
                : 'bg-white dark:bg-[#121B2F] border-slate-200 dark:border-slate-700 hover:border-emerald-500'
            }`}
          >
            <div className="min-w-0">
              <span className={`text-[9px] font-display font-black block uppercase ${copiedBet9ja ? 'text-black' : 'text-[#00C250]'}`}>
                Bet9ja
              </span>
              <span className={`font-mono font-black text-xs truncate block ${copiedBet9ja ? 'text-black' : 'text-slate-900 dark:text-white'}`}>
                {bet9jaCode}
              </span>
            </div>

            <button
              type="button"
              className={`p-1.5 rounded text-xs transition-colors ${
                copiedBet9ja ? 'bg-black text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {copiedBet9ja ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Action */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <span className="text-[10px] text-slate-400 font-mono">
          Pick code &bull; Edit directly on bookie
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(`ticket/${ticket.id}`);
          }}
          className="text-xs font-display font-bold uppercase tracking-wider text-[#E41B13] dark:text-rose-400 flex items-center gap-1 hover:underline"
        >
          <span>Analysis Sheet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

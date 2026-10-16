import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Copy, Check, Share2, ArrowRight } from 'lucide-react';

export default function TicketCard({ ticket, onNavigate }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (ticket.bookingCode) {
      navigator.clipboard.writeText(ticket.bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}#/ticket/${ticket.id}`;
    const shareData = {
      title: `${ticket.title} | BRYME Predictions`,
      text: `Check out ${ticket.title} (${ticket.totalOdds}x odds) on BRYME Predictions.`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const selectionsCount = ticket.selections ? ticket.selections.length : 0;
  const previewSelections = ticket.selections ? ticket.selections.slice(0, 3) : [];
  const remainingCount = selectionsCount - previewSelections.length;

  return (
    <div
      onClick={() => onNavigate(`ticket/${ticket.id}`)}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/50 bg-white dark:bg-[#0E172A] p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 space-y-3 group"
    >
      {/* Top Slip Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-display font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#16223B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/[0.08]">
            {ticket.bookmaker}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {selectionsCount} {selectionsCount === 1 ? 'Game' : 'Games'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-display font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-md font-mono">
            {ticket.totalOdds.toFixed(2)}x
          </span>
          <StatusBadge status={ticket.status} size="xs" />
        </div>
      </div>

      {/* Slip Title & Attribution */}
      <div>
        <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {ticket.title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-mono">
          <span>By {ticket.punterName || ticket.source}</span>
          <span>&bull;</span>
          <span>{ticket.date}</span>
        </p>
      </div>

      {/* Selections Preview */}
      <div className="rounded-xl bg-slate-50 dark:bg-[#070D1A] border border-slate-200 dark:border-white/[0.05] p-2.5 space-y-1.5 text-xs">
        {previewSelections.map((sel, idx) => (
          <div key={sel.id || idx} className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-white/[0.04] last:border-b-0 gap-2">
            <div className="truncate flex-1">
              <span className="text-slate-900 dark:text-slate-200 font-medium block truncate">
                {sel.match}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {sel.league} &bull; <strong className="text-amber-600 dark:text-amber-300 font-semibold">{sel.pick}</strong>
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 px-1.5 py-0.5 bg-white dark:bg-[#16223B] border border-slate-200 dark:border-transparent rounded">
              {sel.odds.toFixed(2)}
            </span>
          </div>
        ))}

        {remainingCount > 0 && (
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-display font-bold pt-1 text-center">
            + {remainingCount} more {remainingCount === 1 ? 'game' : 'games'} on slip
          </div>
        )}
      </div>

      {/* Bottom Bar: Booking Code & Actions */}
      <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
        {ticket.bookingCode ? (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#070D1A] border border-slate-200 dark:border-emerald-500/30 px-2.5 py-1 rounded-lg">
            <span className="text-[9px] uppercase font-mono text-slate-500 dark:text-slate-400">Code:</span>
            <span className="text-xs font-mono font-black text-emerald-700 dark:text-emerald-400">
              {ticket.bookingCode}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy Booking Code"
              className="p-1 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 italic">No code needed</span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            title="Share Ticket"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#16223B] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`ticket/${ticket.id}`);
            }}
            className="px-2.5 py-1 text-xs font-display font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-0.5 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

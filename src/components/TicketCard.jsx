import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Copy, Check, Share2, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

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
      } catch (err) {
        // Fallback to copy link if user dismisses or API rejects
      }
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
      className="bg-brand-card hover:bg-pitch-800/90 border border-brand-cardBorder hover:border-slate-600 rounded-xl p-3.5 sm:p-4 transition-all duration-150 cursor-pointer shadow-sm relative group flex flex-col justify-between"
    >
      <div>
        {/* Card Header: Bookmaker, Odds badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pitch-850 text-slate-300 border border-pitch-750">
              {ticket.bookmaker || 'Generic'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {selectionsCount} {selectionsCount === 1 ? 'Pick' : 'Picks'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold font-mono text-brand-green bg-brand-green/10 border border-brand-green/30 px-2 py-0.5 rounded-md">
              {ticket.totalOdds.toFixed(2)}x
            </span>
            <StatusBadge status={ticket.status} size="xs" />
          </div>
        </div>

        {/* Ticket Title & Attribution */}
        <div className="mb-3">
          <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug group-hover:text-emerald-400 transition-colors line-clamp-1">
            {ticket.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
            <span className="font-medium text-slate-300">
              By {ticket.punterName || ticket.source}
            </span>
            <span>&bull;</span>
            <span>{ticket.date}</span>
            <span>&bull;</span>
            <span className="text-slate-500 font-mono text-[10px]">{ticket.publishedAt}</span>
          </div>
        </div>

        {/* Selections Preview (Mobile-compact) */}
        <div className="space-y-1.5 mb-3 bg-pitch-950/60 rounded-lg p-2.5 border border-pitch-800/80">
          {previewSelections.map((sel, idx) => (
            <div key={sel.id || idx} className="flex items-center justify-between text-xs py-1 border-b border-pitch-850 last:border-b-0 gap-2">
              <div className="truncate flex-1">
                <span className="font-medium text-slate-200 block truncate">
                  {sel.match}
                </span>
                <span className="text-[10px] text-slate-400">
                  {sel.league} &bull; <strong className="text-slate-300 font-normal">{sel.pick}</strong>
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-300 px-1.5 py-0.5 bg-pitch-800 rounded">
                {sel.odds.toFixed(2)}
              </span>
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="text-[11px] text-brand-greenLight font-medium pt-1 text-center">
              + {remainingCount} more {remainingCount === 1 ? 'selection' : 'selections'} on full ticket
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Booking Code + Actions */}
      <div className="pt-2 border-t border-pitch-800 flex items-center justify-between gap-2 mt-auto">
        {/* Booking Code with Copy button */}
        {ticket.bookingCode ? (
          <div className="flex items-center gap-1.5 bg-pitch-900 border border-pitch-750 px-2 py-1 rounded-md">
            <span className="text-[10px] uppercase font-mono text-slate-400">Code:</span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {ticket.bookingCode}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy Booking Code"
              className="p-1 hover:text-brand-green text-slate-400 transition-colors"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-slate-500 italic">No code needed</span>
        )}

        {/* Share & Open Details */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            title="Share Ticket"
            className="p-1.5 rounded-lg bg-pitch-850 hover:bg-pitch-750 border border-pitch-750 text-slate-400 hover:text-white transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`ticket/${ticket.id}`);
            }}
            className="px-2.5 py-1 text-xs font-semibold text-slate-300 group-hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

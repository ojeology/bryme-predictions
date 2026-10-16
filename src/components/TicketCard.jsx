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
      className="glass-card hover:border-fortegreen-neon/50 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-lg relative group flex flex-col justify-between hover:scale-[1.01]"
    >
      <div>
        {/* Card Header: Bookmaker, Odds badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-display font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#121E36] text-slate-200 border border-[#1E3258]">
              {ticket.bookmaker || 'Generic'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {selectionsCount} {selectionsCount === 1 ? 'Game' : 'Games'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-display font-black font-mono text-fortegreen-neon bg-[#072412] border border-fortegreen-neon/40 px-2.5 py-0.5 rounded-lg shadow-sm">
              {ticket.totalOdds.toFixed(2)}x
            </span>
            <StatusBadge status={ticket.status} size="xs" />
          </div>
        </div>

        {/* Ticket Title & Attribution */}
        <div className="mb-3">
          <h3 className="font-display font-black text-slate-100 text-base leading-snug group-hover:text-fortegreen-neon transition-colors line-clamp-1">
            {ticket.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
            <span className="font-semibold text-slate-300">
              By {ticket.punterName || ticket.source}
            </span>
            <span>&bull;</span>
            <span className="font-mono">{ticket.date}</span>
          </div>
        </div>

        {/* Selections Preview */}
        <div className="space-y-1.5 mb-3 bg-[#070D1A]/90 rounded-xl p-3 border border-[#182847]">
          {previewSelections.map((sel, idx) => (
            <div key={sel.id || idx} className="flex items-center justify-between text-xs py-1 border-b border-[#121E36] last:border-b-0 gap-2">
              <div className="truncate flex-1">
                <span className="font-semibold text-slate-200 block truncate">
                  {sel.match}
                </span>
                <span className="text-[10px] text-slate-400">
                  {sel.league} &bull; <strong className="text-amber-300 font-normal">{sel.pick}</strong>
                </span>
              </div>
              <span className="font-mono font-bold text-xs text-slate-300 px-1.5 py-0.5 bg-[#121E36] rounded">
                {sel.odds.toFixed(2)}
              </span>
            </div>
          ))}

          {remainingCount > 0 && (
            <div className="text-[11px] text-fortegreen-neon font-display font-bold pt-1 text-center">
              + {remainingCount} more {remainingCount === 1 ? 'game' : 'games'} on ticket slip
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Booking Code + Actions */}
      <div className="pt-2.5 border-t border-[#182847] flex items-center justify-between gap-2 mt-auto">
        {/* Booking Code with Copy button */}
        {ticket.bookingCode ? (
          <div className="flex items-center gap-1.5 bg-[#070D1A] border border-fortegreen-neon/40 px-2.5 py-1 rounded-xl">
            <span className="text-[10px] uppercase font-mono text-slate-400">Code:</span>
            <span className="text-xs font-mono font-black text-fortegreen-neon">
              {ticket.bookingCode}
            </span>
            <button
              onClick={handleCopyCode}
              title="Copy Booking Code"
              className="p-1 hover:text-white text-slate-400 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-fortegreen-neon" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        ) : (
          <span className="text-[10px] text-slate-500 italic">No code needed</span>
        )}

        {/* Share & Open Details */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            title="Share Ticket"
            className="p-2 rounded-xl bg-[#0C1527] hover:bg-[#182847] border border-[#1E3258] text-slate-300 hover:text-white transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-fortegreen-neon" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`ticket/${ticket.id}`);
            }}
            className="px-3 py-1.5 text-xs font-display font-bold uppercase tracking-wider text-slate-200 group-hover:text-fortegreen-neon flex items-center gap-1 transition-colors"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { TICKETS, getTicketById } from '../data/tickets';
import { MARKETS } from '../data/markets';
import StatusBadge from '../components/StatusBadge';
import TicketCard from '../components/TicketCard';
import { 
  ArrowLeft, Copy, Check, Share2, ExternalLink, ShieldAlert, 
  Calendar, Layers, Trophy, AlertCircle, Info, Hash 
} from 'lucide-react';

export default function TicketDetailPage({ ticketId, onNavigate }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const ticket = getTicketById(ticketId) || TICKETS[0];
  const market = MARKETS.find(m => m.id === ticket.marketId);

  const relatedTickets = TICKETS.filter(t => t.marketId === ticket.marketId && t.id !== ticket.id).slice(0, 2);

  const handleCopyCode = () => {
    if (ticket.bookingCode) {
      navigator.clipboard.writeText(ticket.bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${ticket.title} | BRYME Predictions`,
      text: `${ticket.title} (${ticket.totalOdds}x odds) on BRYME Predictions.`,
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

  return (
    <div className="space-y-5">
      
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('predictions')}
          className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Predictions</span>
        </button>

        <span className="text-[10px] font-mono text-slate-400">
          Ticket #{ticket.id}
        </span>
      </div>

      {/* Main Ticket Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E172A] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-display font-black tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#16223B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]">
                {ticket.bookmaker}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {ticket.selections.length} {ticket.selections.length === 1 ? 'Selection' : 'Selections'}
              </span>
              <StatusBadge status={ticket.status} size="xs" />
            </div>

            <h1 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>By: <strong className="text-slate-700 dark:text-slate-200">{ticket.punterName}</strong></span>
              <span>&bull;</span>
              <span>{ticket.publishedAt}</span>
            </div>
          </div>

          {/* Odds and Code Box */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-slate-50 dark:bg-[#070D1A] p-3 rounded-xl border border-slate-200 dark:border-white/[0.06]">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block sm:text-right">Combined Odds</span>
              <span className="text-2xl font-display font-black text-emerald-600 dark:text-emerald-400">
                {ticket.totalOdds.toFixed(2)}x
              </span>
            </div>

            {ticket.bookingCode && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-emerald-500/30 px-2 py-1 rounded-lg">
                <span className="text-[10px] font-mono text-slate-400">Code:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">{ticket.bookingCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:text-emerald-500 text-slate-400"
                  title="Copy booking code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editorial notes */}
        {ticket.editorialNote && (
          <div className="bg-slate-50 dark:bg-[#070D1A] p-3 rounded-xl border border-slate-200 dark:border-white/[0.06] text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide text-[10px] block mb-0.5">
                Editorial Match Breakdown:
              </span>
              {ticket.editorialNote}
            </div>
          </div>
        )}

        {/* Share Bar */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#16223B] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Ticket'}</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            {ticket.date}
          </span>
        </div>
      </div>

      {/* Selections List */}
      <div className="space-y-2.5">
        <h2 className="text-sm font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" />
          Selections ({ticket.selections.length})
        </h2>

        <div className="space-y-2">
          {ticket.selections.map((sel, idx) => (
            <div 
              key={sel.id || idx}
              className="rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E172A] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {sel.match}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#16223B] text-slate-500 dark:text-slate-400 font-mono">
                    {sel.league}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kickoff: {sel.kickoff} &bull; Market: <strong className="text-slate-700 dark:text-slate-200 font-normal">{sel.market}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/[0.06]">
                <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mr-1">Pick:</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{sel.pick}</span>
                </div>

                <div className="font-mono text-sm font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#16223B] px-2 py-1 rounded">
                  {sel.odds.toFixed(2)}
                </div>

                <StatusBadge status={sel.status} size="xs" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tickets */}
      {relatedTickets.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/[0.08]">
          <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white">
            Related Slips
          </h3>
          <div className="space-y-3">
            {relatedTickets.map(t => (
              <TicketCard 
                key={t.id} 
                ticket={t} 
                onNavigate={onNavigate} 
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

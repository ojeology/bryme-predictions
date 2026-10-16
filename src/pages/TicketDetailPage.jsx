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

  // Related tickets in the same market
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
    <div className="space-y-6">
      
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate(market ? `markets/${market.slug}` : 'predictions')}
          className="inline-flex items-center gap-1.5 text-xs text-brand-green hover:underline font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {market ? market.name : 'Predictions'}</span>
        </button>

        <span className="text-[10px] font-mono text-slate-500">
          Ticket ID: #{ticket.id}
        </span>
      </div>

      {/* Main Ticket Banner Card */}
      <div className="bg-brand-card border border-brand-cardBorder rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pitch-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-pitch-850 text-slate-300 border border-pitch-750">
                {ticket.bookmaker}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {ticket.selections.length} {ticket.selections.length === 1 ? 'Selection' : 'Selections'}
              </span>
              <StatusBadge status={ticket.status} size="xs" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
              <span>Attributed to: <strong className="text-slate-200">{ticket.punterName}</strong></span>
              <span>&bull;</span>
              <span>Logged: {ticket.publishedAt}</span>
              {ticket.originalSourceUrl && (
                <>
                  <span>&bull;</span>
                  <a 
                    href={ticket.originalSourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-green hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Original Post</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Odds and Code Box */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-pitch-950 p-3 rounded-xl border border-pitch-800">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block sm:text-right">Combined Odds</span>
              <span className="text-2xl font-black font-mono text-brand-green">
                {ticket.totalOdds.toFixed(2)}x
              </span>
            </div>

            {ticket.bookingCode && (
              <div className="flex items-center gap-1.5 bg-pitch-900 border border-pitch-750 px-2 py-1 rounded-lg">
                <span className="text-[10px] font-mono text-slate-400">Code:</span>
                <span className="font-mono font-bold text-slate-200 text-xs">{ticket.bookingCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:text-brand-green text-slate-400 transition-colors"
                  title="Copy booking code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editorial notes */}
        {ticket.editorialNote && (
          <div className="bg-pitch-950 p-3 rounded-xl border border-pitch-800 text-xs text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 uppercase tracking-wide text-[10px] block mb-0.5">
                BRYME Editorial Breakdown:
              </span>
              {ticket.editorialNote}
            </div>
          </div>
        )}

        {/* Share & Copy Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg bg-pitch-850 hover:bg-pitch-800 border border-pitch-750 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Share Ticket (URL)'}</span>
          </button>

          <span className="text-[11px] text-slate-500 font-mono">
            {ticket.date}
          </span>
        </div>
      </div>

      {/* Full Selections Breakdown Table / List */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-green" />
          Individual Matches &amp; Selections ({ticket.selections.length})
        </h2>

        <div className="space-y-2">
          {ticket.selections.map((sel, idx) => (
            <div 
              key={sel.id || idx}
              className="bg-pitch-900 border border-pitch-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">
                    {sel.match}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-pitch-800 text-slate-400 font-mono">
                    {sel.league}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Kickoff: <strong className="text-slate-300 font-normal">{sel.kickoff}</strong></span>
                  <span>&bull;</span>
                  <span>Market: <strong className="text-slate-300 font-normal">{sel.market}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-pitch-800">
                <div className="bg-pitch-950 border border-brand-green/30 px-2.5 py-1 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase mr-1.5">Pick:</span>
                  <span className="text-xs font-bold text-brand-green">{sel.pick}</span>
                </div>

                <div className="font-mono text-sm font-extrabold text-slate-200 bg-pitch-800 px-2 py-1 rounded">
                  {sel.odds.toFixed(2)}
                </div>

                <StatusBadge status={sel.status} size="xs" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory 18+ Disclaimer Box */}
      <div className="bg-pitch-950 border border-amber-900/30 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <div>
          <strong>Responsible Gaming 18+:</strong> Odds represent probabilities, never guarantees. Only place wagers with licensed bookmakers using money you can afford to lose.
        </div>
      </div>

      {/* Related Tickets */}
      {relatedTickets.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-pitch-800">
          <h3 className="text-sm font-bold text-slate-200">
            More Tickets in {market ? market.name : 'This Category'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

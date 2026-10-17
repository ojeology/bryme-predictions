import React, { useState } from 'react';
import { TICKETS, getTicketById } from '../data/tickets';
import { MARKETS } from '../data/markets';
import StatusBadge from '../components/StatusBadge';
import TicketCard from '../components/TicketCard';
import AdPlaceholder from '../components/AdPlaceholder';
import { 
  ArrowLeft, Copy, Check, Share2, ExternalLink, ShieldAlert, 
  Calendar, Layers, Trophy, AlertCircle, Info, Hash, Zap, ArrowRight
} from 'lucide-react';

export default function TicketDetailPage({ ticketId, onNavigate }) {
  const [copiedCodeKey, setCopiedCodeKey] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const ticket = getTicketById(ticketId) || TICKETS[0];
  const market = MARKETS.find(m => m.id === ticket.marketId);

  // Recommendations to drive pageviews
  const otherTickets = TICKETS.filter(t => t.id !== ticket.id).slice(0, 3);

  const handleCopy = (code, key) => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiedCodeKey(key);
      setTimeout(() => setCopiedCodeKey(null), 2000);
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

  const sporty = ticket.sportyCode || (ticket.codes && ticket.codes.sportybet);
  const bet9ja = ticket.bet9jaCode || ticket.bookingCode || (ticket.codes && ticket.codes.bet9ja);
  const onex = ticket.onexCode || (ticket.codes && ticket.codes.onexbet);
  const betking = ticket.betkingCode || (ticket.codes && ticket.codes.betking);

  return (
    <div className="space-y-5">
      
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Back to Predictions Hub</span>
        </button>

        <span className="text-[10px] font-mono text-slate-400">
          Verified Slip #{ticket.id}
        </span>
      </div>

      {/* TOP HIGH-RPM AD SLOT */}
      <AdPlaceholder label="Top Betting Partner Banner (Adsterra / High-CPM Slot)" />

      {/* Main Ticket Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-display font-black tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300/40 dark:border-blue-800/40">
                {ticket.badge || 'Verified Slip'}
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {ticket.selections ? ticket.selections.length : 1} {ticket.selections?.length === 1 ? 'Selection' : 'Selections'}
              </span>
              <StatusBadge status={ticket.status || 'pending'} size="xs" />
            </div>

            <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>Analyst: <strong className="text-slate-700 dark:text-slate-200">{ticket.punterName || 'BRYME Sports Intelligence'}</strong></span>
              <span>&bull;</span>
              <span>{ticket.publishedAt || 'Published 02:00 AM WAT'}</span>
            </div>
          </div>

          {/* Odds Pill */}
          <div className="bg-slate-50 dark:bg-[#131E33] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto text-left sm:text-right flex-shrink-0">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Multiplier</span>
            <span className="text-3xl font-mono font-black text-blue-600 dark:text-blue-400 leading-none">
              {ticket.totalOdds ? ticket.totalOdds.toFixed(2) : '1.50'}x
            </span>
          </div>
        </div>

        {/* 1-Tap Booking Codes Bar */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-[#121B2F] border border-blue-200/60 dark:border-slate-700/80 space-y-2">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 block">
            Click to Copy 1-Tap Booking Codes into your App:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {sporty && (
              <button
                onClick={() => handleCopy(sporty, 'sporty')}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-display font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                {copiedCodeKey === 'sporty' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>SportyBet: {sporty}</span>
              </button>
            )}

            {bet9ja && (
              <button
                onClick={() => handleCopy(bet9ja, 'bet9ja')}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                {copiedCodeKey === 'bet9ja' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Bet9ja: {bet9ja}</span>
              </button>
            )}

            {onex && (
              <button
                onClick={() => handleCopy(onex, '1x')}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                {copiedCodeKey === '1x' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>1xBet: {onex}</span>
              </button>
            )}

            {betking && (
              <button
                onClick={() => handleCopy(betking, 'betking')}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                {copiedCodeKey === 'betking' ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                <span>BetKing: {betking}</span>
              </button>
            )}
          </div>
        </div>

        {/* Editorial notes */}
        {(ticket.editorialNote || ticket.description) && (
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide text-[10px] block mb-0.5">
                Tactical Breakdown &amp; Rationale:
              </span>
              <p className="leading-relaxed opacity-90">
                {ticket.editorialNote || ticket.description}
              </p>
            </div>
          </div>
        )}

        {/* Share Bar */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Slip'}</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            {ticket.date || 'October 2026'}
          </span>
        </div>
      </div>

      {/* Selections List (Fully Revealed) */}
      <div className="space-y-3">
        <h2 className="text-sm font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>Included Matches &amp; Verified Selections ({ticket.selections?.length || 1})</span>
        </h2>

        <div className="space-y-2.5">
          {ticket.selections && ticket.selections.map((sel, idx) => (
            <div 
              key={sel.id || idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono font-bold">
                    {sel.league}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {sel.kickoff}
                  </span>
                </div>
                <div className="font-display font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {sel.match}
                </div>
                {sel.analysis && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    "{sel.analysis}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
                <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mr-1.5 font-bold">Pick:</span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{sel.pick}</span>
                </div>

                <div className="font-mono text-sm font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#162238] px-2.5 py-1 rounded-lg">
                  {sel.odds ? (typeof sel.odds === 'number' ? sel.odds.toFixed(2) : sel.odds) : '1.50'}x
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MID-CONTENT HIGH-CPM AD SLOT */}
      <AdPlaceholder label="Mid-Article Recommended Partner (High CTR)" />

      {/* RECOMMENDED NEXT SLIPS (DRIVES PAGEVIEWS 1 -> 2 -> 3 -> 4) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Recommended Next Slips Today</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Click to unlock
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {otherTickets.map(other => (
            <div
              key={other.id}
              onClick={() => onNavigate(`ticket/${other.id}`)}
              className="cursor-pointer group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] hover:border-blue-500 transition-all flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[9px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                    {other.leagueId?.toUpperCase() || 'EUROPE'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {other.totalOdds}x
                  </span>
                </div>
                <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {other.title}
                </h4>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-display font-bold text-blue-600 dark:text-blue-400">
                <span>Unlock Slip</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

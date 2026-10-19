import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { MARKETS as FALLBACK_MARKETS } from '../data/markets';
import { TICKETS } from '../data/tickets';
import TicketCard from '../components/TicketCard';
import AdBanner from '../components/AdBanner';
import { 
  ArrowLeft, Layers, Info, CheckCircle2, Percent, ShieldCheck, 
  Flame, Copy, Check, ExternalLink, Zap, Clock, Filter
} from 'lucide-react';

export default function MarketDetailPage({ marketId, slug, onNavigate }) {
  const { markets, marketCodes, triggerCopyModal, adSettings } = usePredictions();
  const currentKey = marketId || slug;
  const marketList = markets && markets.length > 0 ? markets : FALLBACK_MARKETS;
  const market = marketList.find(m => m.id === currentKey || m.slug === currentKey) || marketList[0];

  // Attached dynamic booking codes
  const attachedCodes = (marketCodes || []).filter(c => 
    c.marketId === market?.id || c.marketId === market?.slug
  );

  // Attached multi-game tickets
  const tickets = TICKETS.filter(t => t.marketId === market?.id);
  const totalSlipsCount = attachedCodes.length + tickets.length;

  const [selectedBookmaker, setSelectedBookmaker] = useState('all');
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const filteredCodes = attachedCodes.filter(c => {
    if (selectedBookmaker === 'all') return true;
    return c.bookmaker?.toLowerCase() === selectedBookmaker.toLowerCase();
  });

  const handleCopyCode = (codeItem) => {
    const bName = codeItem.bookmakerName || codeItem.bookmaker?.toUpperCase() || 'SportyBet';
    if (triggerCopyModal) {
      triggerCopyModal(codeItem.code, bName, codeItem.title || `${market.name} Slip`, codeItem.odds);
    } else {
      navigator.clipboard.writeText(codeItem.code);
    }
    setCopiedCodeId(codeItem.id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const getBookmakerUrl = (bName) => {
    const b = (bName || '').toLowerCase();
    if (b.includes('sporty')) return adSettings?.sportyAffiliateUrl || 'https://www.sportybet.com/ng/';
    if (b.includes('bet9ja')) return adSettings?.bet9jaAffiliateUrl || 'https://register.bet9ja.com/';
    if (b.includes('msport')) return adSettings?.msportAffiliateUrl || 'https://www.msport.com/';
    if (b.includes('1x')) return adSettings?.oneXBetAffiliateUrl || 'https://1xbet.ng/';
    if (b.includes('king')) return adSettings?.betkingAffiliateUrl || 'https://www.betking.com/';
    return adSettings?.sportyAffiliateUrl || 'https://www.sportybet.com/ng/';
  };

  const getBookmakerBadgeStyle = (bName) => {
    const b = (bName || '').toLowerCase();
    if (b.includes('sporty')) return 'bg-[#E41B13] text-white';
    if (b.includes('bet9ja')) return 'bg-[#00C250] text-black';
    if (b.includes('msport')) return 'bg-amber-500 text-black';
    if (b.includes('1x')) return 'bg-blue-600 text-white';
    if (b.includes('king')) return 'bg-purple-600 text-white';
    return 'bg-slate-800 text-white';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('markets')}
          className="inline-flex items-center gap-1.5 text-xs text-[#E41B13] dark:text-rose-400 hover:underline font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>&larr; Back to All 35+ Markets Database</span>
        </button>
      </div>

      {/* TOP AD SLOT */}
      <AdBanner slot="top-banner" label="Sponsored Betting Partner Banner" />

      {/* Market Header */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded bg-[#E41B13]/10 dark:bg-[#E41B13]/20 text-[#E41B13] dark:text-rose-400 border border-[#E41B13]/30">
              {market.badge || 'Verified'} Market
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
              🔥 {totalSlipsCount} Available {totalSlipsCount === 1 ? 'Slip' : 'Slips'}
            </span>
          </div>

          {market.averageHitRate && (
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              Avg Historical Hit Rate: {market.averageHitRate}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
            {market.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Category: <strong className="text-slate-900 dark:text-white uppercase">{market.category}</strong>
          </p>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {market.description}
        </p>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Typical Odds</span>
            <strong className="text-base text-slate-900 dark:text-white font-black">{market.typicalOddsRange || '1.30 - 2.00'}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Risk Profile</span>
            <strong className={`text-base font-black ${market.riskLevel?.includes('Low') ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
              {market.riskLevel || 'Medium'}
            </strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800 sm:col-span-2">
            <span className="text-[10px] text-slate-400 uppercase block">Best Leagues</span>
            <span className="text-xs text-slate-800 dark:text-slate-200 font-bold truncate block">
              {market.bestLeagues ? market.bestLeagues.join(', ') : 'European Top 5 Leagues'}
            </span>
          </div>
        </div>

        {/* Tactical Note */}
        {market.tacticalTip && (
          <div className="bg-slate-50 dark:bg-[#121B2F] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <strong className="text-[#E41B13] dark:text-rose-400 block mb-0.5 uppercase tracking-wide text-[10px] font-bold">
              Statistical Model Tip:
            </strong>
            {market.tacticalTip}
          </div>
        )}
      </div>

      {/* ── 1. ACTIVE BOOKING CODES FOR THIS MARKET ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
                Live {market.name} Booking Codes ({attachedCodes.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified daily slips with odds and booking codes. 1-tap copy or load directly into your sportsbook.
            </p>
          </div>

          {/* Bookmaker Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none self-start sm:self-auto">
            {['all', 'sportybet', '1xbet', 'msport', 'bet9ja'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBookmaker(b)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  selectedBookmaker === b
                    ? 'bg-[#E41B13] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {b === 'all' ? 'All Books' : b}
              </button>
            ))}
          </div>
        </div>

        {filteredCodes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCodes.map(codeItem => {
              const isCopied = copiedCodeId === codeItem.id;
              const bookieName = codeItem.bookmakerName || codeItem.bookmaker?.toUpperCase() || 'SportyBet';
              const bookieLink = getBookmakerUrl(codeItem.bookmaker);
              const badgeStyle = getBookmakerBadgeStyle(codeItem.bookmaker);

              return (
                <div
                  key={codeItem.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-4 shadow-sm hover:border-amber-500/50 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {/* Header: Bookmaker & Odds */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-display font-black uppercase tracking-wider ${badgeStyle} shadow-sm`}>
                        {bookieName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 dark:text-amber-300 font-mono font-black text-xs border border-amber-500/30">
                        {codeItem.odds}x Odds
                      </span>
                    </div>

                    {/* Slip Title */}
                    <div>
                      <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {codeItem.title || `${market.name} Value Acca`}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {codeItem.eventsCount && <span>{codeItem.eventsCount} Legs (Matches)</span>}
                        {codeItem.dropTime && <span>&bull; {codeItem.dropTime}</span>}
                      </div>
                    </div>

                    {/* Booking Code Display */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block">
                          Booking Code
                        </span>
                        <span className="font-mono font-black text-base tracking-wider text-slate-900 dark:text-white select-all">
                          {codeItem.code}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyCode(codeItem)}
                        className={`p-2 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                          isCopied
                            ? 'bg-[#00FF66] text-slate-950 font-black'
                            : 'bg-slate-200 dark:bg-[#1a253d] text-slate-900 dark:text-white hover:bg-[#E41B13] hover:text-white'
                        }`}
                        title="Copy code"
                      >
                        {isCopied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleCopyCode(codeItem)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                    </button>

                    <a
                      href={bookieLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-[#1f2d4a] text-slate-700 dark:text-slate-300 font-display font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1"
                      title={`Load slip directly on ${bookieName}`}
                    >
                      <span>Load</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0E1626] p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No booking codes matching the filter right now.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New slips for {market.name} are added daily by our analysts. Check back around 02:00 AM WAT.
            </p>
          </div>
        )}
      </div>

      {/* MID-PAGE 300x250 BANNER */}
      <AdBanner slot="300x250" label="Sponsored 300x250 Banner" />

      {/* Multi-Match Tickets in this Market */}
      {tickets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#E41B13]" />
            <span>Featured Multi-Match Slips in {market.shortName || market.name}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map(ticket => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket} 
                onNavigate={onNavigate} 
              />
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM NATIVE ADSTERRA RECOMMENDATIONS */}
      <AdBanner slot="native" label="Recommended for You" />

    </div>
  );
}

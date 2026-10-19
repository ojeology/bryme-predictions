import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import VisibleLadder from '../components/VisibleLadder';
import Whale2OddsCard from '../components/Whale2OddsCard';
import BookingCodesHub from '../components/BookingCodesHub';
import AdBanner from '../components/AdBanner';
import { WEEKEND_2_ODDS_STATS } from '../data/weekendArchive';
import { 
  Trophy, ArrowRight, ShieldCheck, Flame, Sparkles, 
  TrendingUp, CheckCircle, Clock, Zap, Target, Copy, Check, 
  BarChart2, ChevronDown, ChevronUp, Layers, Lock, Eye, Shield, 
  Users, BookOpen, ExternalLink, Award, AlertCircle
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const { whaleSlip, punters, marketCodes, triggerCopyModal, adSettings } = usePredictions();
  const [copiedPunterCode, setCopiedPunterCode] = useState(null);
  const [activeCodeCategory, setActiveCodeCategory] = useState('all');

  // Enforce Mr banks pinned first
  const sortedPunters = (punters || []).slice().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleCopyPunterCode = (punter, codeItem) => {
    const bName = codeItem.bookmaker?.toUpperCase() || 'SportyBet';
    if (triggerCopyModal) {
      triggerCopyModal(codeItem.code, bName, `${punter.displayName}'s ${codeItem.marketType || 'Slip'}`, codeItem.totalOdds);
    } else {
      navigator.clipboard.writeText(codeItem.code);
    }
    setCopiedPunterCode(codeItem.code);
    setTimeout(() => setCopiedPunterCode(null), 2500);
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* ── 1. HIGH-ENERGY LIVE VIP TICKER ── */}
      <div className="bg-gradient-to-r from-slate-900 via-[#18233C] to-[#0A0F1D] border border-amber-500/30 rounded-2xl p-3 sm:p-3.5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E41B13] text-white font-display font-black text-[11px] uppercase tracking-wider shadow-sm animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
            LIVE DROPS 02:00 AM WAT
          </span>
          <span className="text-xs font-mono text-slate-300 font-bold">
            🔥 Over <strong>14,800+</strong> Punters In Play Today
          </span>
          <span className="hidden md:inline text-xs font-mono text-amber-400 font-bold">
            &bull; Verified 86.4% Accuracy
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 self-end sm:self-auto">
          <span>Jackpot Rollover Goal:</span>
          <strong className="text-[#00FF66] font-black bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
            ₦1,000,000
          </strong>
        </div>
      </div>

      {/* ── 2. THE DUAL HERO FISHHOOK: BRYME ROLLOVER & WHALE 2-ODDS ── */}
      <section className="space-y-4">
        <VisibleLadder onNavigate={onNavigate} />
      </section>

      {/* ── 3. TODAY'S WHALE 2-ODDS SYNDICATE STAKE (HIGH CONVICTION) ── */}
      <section id="whale-2-odds">
        <Whale2OddsCard whaleSlip={whaleSlip} onNavigate={onNavigate} />
      </section>

      {/* TOP HOME AD SLOT (MONETIZATION - MONETAG / ADSTERRA / AFFILIATE) */}
      <AdBanner slot="top-banner" label="Sponsored Betting Partner" />

      {/* ── 4. VIP PUNTERS HALL OF FAME (FEATURING MR BANKS 📌 PINNED MASTER) ── */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shadow-md">
              👑
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Tracked African Punters &amp; Daily Slips</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official verified analysts across Nigeria &bull; 1-tap copy today's active booking code
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('punters')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>All 11 Punters &rarr;</span>
          </button>
        </div>

        {/* Punters Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedPunters.slice(0, 6).map((punter) => {
            const isPinned = punter.pinned;
            const primaryCode = punter.dailyCodes && punter.dailyCodes[0];
            const isCopied = primaryCode && copiedPunterCode === primaryCode.code;

            return (
              <div
                key={punter.id}
                className={`rounded-2xl border ${
                  isPinned 
                    ? 'border-2 border-amber-500 bg-gradient-to-br from-amber-500/15 via-white dark:via-[#0E1626] to-transparent shadow-xl ring-2 ring-amber-500/20' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626]'
                } p-4 flex flex-col justify-between gap-3 shadow-sm transition-all hover:border-[#E41B13]/60`}
              >
                <div>
                  {/* Header: Name, Handle, Pinned badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl ${
                        isPinned 
                          ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 font-black shadow-md' 
                          : 'bg-gradient-to-br from-slate-900 via-[#1a2336] to-[#0A0F1D] border border-slate-700 text-white'
                      } flex items-center justify-center font-display font-black text-sm`}>
                        {isPinned ? '📌' : (punter.avatar || punter.displayName.slice(0, 2).toUpperCase())}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                            {punter.displayName}
                          </h3>
                          {isPinned && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-mono font-black text-[9px] uppercase">
                              VIP PINNED
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {punter.handle} &bull; {punter.region}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                        {punter.hitRate || '82%'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {punter.winStreak || 'Streak'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2">
                    {punter.specialty || punter.bio}
                  </p>
                </div>

                {/* Primary Daily Code Box */}
                {primaryCode ? (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#162238] font-bold uppercase text-slate-800 dark:text-slate-200">
                        {primaryCode.bookmaker}
                      </span>
                      <span className="font-bold text-amber-500">
                        {primaryCode.totalOdds}x Odds &bull; {primaryCode.gamesCount || 2} Legs
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-sm tracking-wider text-slate-900 dark:text-white select-all">
                        {primaryCode.code}
                      </span>

                      <button
                        onClick={() => handleCopyPunterCode(punter, primaryCode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-display font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                          isCopied 
                            ? 'bg-[#00FF66] text-slate-950' 
                            : 'bg-[#E41B13] hover:bg-[#D01710] text-white shadow-sm'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] text-center text-xs text-slate-400 font-mono">
                    New slip dropping at 02:00 AM WAT
                  </div>
                )}

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => onNavigate(`punter/${punter.id}`)}
                    className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Punter Profile &amp; Slips</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {primaryCode && (
                    <a
                      href={getBookmakerUrl(primaryCode.bookmaker)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Load Slip</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MID-PAGE ADSTERRA 300x250 BANNER SLOT */}
      <AdBanner slot="300x250" label="Adsterra 300x250 Banner" />

      {/* ── 5. READY-TO-LOAD BOOKING SLIPS HUB ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E41B13]/10 text-[#E41B13] flex items-center justify-center font-bold text-base">
              🔴
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                Today's Ready-to-Load Booking Slips
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant codes for SportyBet, Bet9ja &amp; 1xBet &bull; 1-tap copy
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('predictions')}
            className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1"
          >
            <span>View All Slips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <BookingCodesHub onNavigate={onNavigate} />
      </section>

      {/* ── 6. 35+ HIGH-YIELD FOOTBALL MARKETS DIRECTORY PREVIEW ── */}
      <section className="space-y-3 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📂</span>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white">
                35+ Football Markets Slips Vault
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore preloaded codes organized by betting market: Over 1.5 Goals, Double Chance, BTTS, Corners
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('markets')}
            className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse All 35+ Markets &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {[
            { id: 'over-15-goals', name: '⚽ Over 1.5 Total Goals', hit: '79.4%', slips: '4 Slips', desc: 'Codes like YEYEY (47x), YEYEU (197x), YEYEYE (92x)' },
            { id: 'over-25-goals', name: '🔥 Over 2.5 Total Goals', hit: '58.2%', slips: '2 Slips', desc: 'High xG European league surge (Bundesliga & Eredivisie)' },
            { id: 'double-chance', name: '🛡️ Double Chance (1X/X2)', hit: '84.0%', slips: '2 Slips', desc: 'Unbeaten home fortress and giant protection lines' },
            { id: 'both-teams-to-score', name: '🎯 Both Teams to Score (GG)', hit: '72.0%', slips: '2 Slips', desc: 'Premier League & Serie A attacking collisions' },
          ].map(m => (
            <div
              key={m.id}
              onClick={() => onNavigate(`market/${m.id}`)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121B2F] hover:border-amber-500/60 cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-mono font-bold text-[10px]">
                  {m.hit} Hit Rate
                </span>
                <span className="px-2 py-0.5 rounded bg-[#E41B13]/10 text-[#E41B13] font-mono font-bold text-[10px]">
                  {m.slips}
                </span>
              </div>

              <div>
                <h4 className="font-display font-black text-sm text-slate-900 dark:text-white group-hover:text-[#E41B13] transition-colors">
                  {m.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {m.desc}
                </p>
              </div>

              <div className="text-[11px] font-bold text-[#E41B13] dark:text-rose-400 flex items-center gap-1 pt-1">
                <span>Inspect Codes &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. BETTING ACADEMY: ARBITRAGE SUREBETS CALLOUT ── */}
      <section className="rounded-2xl border-2 border-cyan-500/40 bg-gradient-to-r from-cyan-950/20 via-[#0E1626] to-[#0A0F1D] p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xl flex-shrink-0">
              📚
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-black text-[10px] uppercase tracking-wider">
                BRYME BETTING ACADEMY
              </span>
              <h3 className="text-base sm:text-lg font-display font-black text-white mt-0.5">
                Everything to Know About Arbitrage Betting (Surebets in Nigeria)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                How sharp punters exploit odds discrepancies across SportyBet, Bet9ja, and 1xBet to guarantee mathematically risk-free returns.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('article/arbitrage-betting-nigeria')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto"
          >
            <span>Read Arbitrage Guide</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── 8. VERIFIED RESULTS & ACCURACY ARCHIVE ── */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Verified Win Rate &amp; Performance Ledger</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold text-xs border border-emerald-500/30">
                  {WEEKEND_2_ODDS_STATS.accuracyRate}% Win Rate
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% public transparency. No deleted tickets, real full-time scores verified.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View 13-Weekend Archive &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
            <strong className="text-lg text-emerald-500 font-black">{WEEKEND_2_ODDS_STATS.accuracyRate}%</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Won / Total</span>
            <strong className="text-lg text-blue-500 font-black">{WEEKEND_2_ODDS_STATS.won} / {WEEKEND_2_ODDS_STATS.totalWeekends}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">ROI Multiplier</span>
            <strong className="text-lg text-amber-500 font-black">{WEEKEND_2_ODDS_STATS.roiUnits}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Simulated Profit</span>
            <strong className="text-lg text-slate-900 dark:text-white font-black">+{WEEKEND_2_ODDS_STATS.simulatedProfitNGN}</strong>
          </div>
        </div>
      </section>

      {/* BOTTOM NATIVE RECOMMENDATIONS */}
      <AdBanner slot="native" label="Recommended for You" />

    </div>
  );
}

import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import VisibleLadder from '../components/VisibleLadder';
import ChampionsLeagueBanner from '../components/ChampionsLeagueBanner';
import Whale2OddsCard from '../components/Whale2OddsCard';
import BookingCodesHub from '../components/BookingCodesHub';
import StatisticalCheatSheet from '../components/StatisticalCheatSheet';
import AdBanner from '../components/AdBanner';
import AdPlaceholder from '../components/AdPlaceholder';
import { WEEKEND_2_ODDS_STATS, WEEKEND_ARCHIVE } from '../data/weekendArchive';
import { MARKETS } from '../data/markets';
import { 
  Trophy, ArrowRight, ShieldCheck, Flame, Sparkles, 
  TrendingUp, CheckCircle, Clock, Zap, Target, Copy, Check, 
  BarChart2, ChevronDown, ChevronUp, Layers, Lock, Eye, Shield, Users, BookOpen
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const { whaleSlip } = usePredictions();
  const [activeTab, setActiveTab] = useState('all');
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);

  const handleVote = (option) => {
    setSelectedVote(option);
    setVoted(true);
  };

  const highYieldMarkets = [
    { id: 'over-under-goals', name: '⚽ Over/Under Goals Radar', badge: 'High Hit Rate', picks: '8 Matches Today', desc: 'Over 1.5 & Over 2.5 banker lines for EPL, Bundesliga & Serie A.' },
    { id: 'match-winner-dc', name: '🛡️ Double Chance & Win Combos', badge: 'Lowest Variance', picks: '6 Banker Matches', desc: 'Home win or draw safety lines across European title contenders.' },
    { id: 'btts', name: '🎯 Both Teams to Score (BTTS)', badge: '78% Form Rating', picks: '5 Match Slips', desc: 'Both teams found the net in 8/10 previous encounters.' },
    { id: 'long-shots', name: '🚀 Weekend Long Shots (10x - 50x)', badge: 'Mega Value', picks: '3 Multi-Slips', desc: 'Calculated high-odds speculative accas with minimal stakes.' },
  ];

  return (
    <div className="space-y-6">
      
      {/* ── 1. THE MAIN HOOK & IDENTITY: THE ₦1,000 → ₦1,000,000 SPORTYBET ROLLOVER LADDER ── */}
      <section id="ladder-hero">
        <VisibleLadder onNavigate={onNavigate} />
      </section>

      {/* ── 2. QUICK CATEGORY JUMP RIBBON (SPORTY APP FEEL) ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C250] animate-ping"></span>
          <div>
            <span className="text-[11px] font-mono uppercase font-black text-slate-900 dark:text-white">
              Today's Betting Center &bull; Drop Live
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Verified 1-tap booking slips for SportyBet, Bet9ja &amp; 1xBet
            </p>
          </div>
        </div>

        {/* Quick jump pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all ${
              activeTab === 'all'
                ? 'bg-[#E41B13] text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔥 All
          </button>
          <button
            onClick={() => setActiveTab('whale')}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all ${
              activeTab === 'whale'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/30'
            }`}
          >
            🐋 Whale 2-Odds
          </button>
          <button
            onClick={() => onNavigate('articles')}
            className="px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all bg-cyan-500/15 hover:bg-cyan-500 text-cyan-600 dark:text-cyan-400 hover:text-white border border-cyan-500/30 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📚 Academy (Arbing)</span>
          </button>
          <button
            onClick={() => setActiveTab('codes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all ${
              activeTab === 'codes'
                ? 'bg-[#E41B13] text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔴 BRYME Codes
          </button>
          <button
            onClick={() => onNavigate('punters')}
            className="px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all bg-amber-500/15 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-slate-950 border border-amber-500/30 flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5" />
            <span>👑 Punters Hub</span>
          </button>
          <button
            onClick={() => onNavigate('results')}
            className="px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all bg-emerald-500/15 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-slate-950 border border-emerald-500/30 flex items-center gap-1"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>📊 Results (77% Won)</span>
          </button>
          <button
            onClick={() => onNavigate('markets')}
            className="px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all bg-slate-100 dark:bg-[#162035] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            📂 Markets
          </button>
        </div>
      </div>

      {/* ── 2.5. TODAY'S WHALE 2-ODDS SYNDICATE STAKE (PRIMARY BETTOR FISHHOOK) ── */}
      {(activeTab === 'all' || activeTab === 'whale' || activeTab === 'weekend') && (
        <section id="whale-2-odds" className="space-y-2">
          <Whale2OddsCard whaleSlip={whaleSlip} onNavigate={onNavigate} />
        </section>
      )}

      {/* TOP HOME AD SLOT (MONETIZATION - MONETAG / ADSTERRA / AFFILIATE) */}
      <AdBanner slot="top-banner" label="Sponsored Partner" />

      {/* ── 3. FEATURE MATCH: TUESDAY CHAMPIONS LEAGUE 2.45x BOOSTER ── */}
      {(activeTab === 'all' || activeTab === 'ucl') && (
        <section className="space-y-2">
          <ChampionsLeagueBanner onNavigate={onNavigate} />
        </section>
      )}

      {/* ── 4. READY-TO-LOAD DAILY BOOKING CODES HUB ── */}
      {(activeTab === 'all' || activeTab === 'codes') && (
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
                  Instant codes for SportyBet &amp; Bet9ja &bull; 1-tap copy action
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
      )}

      {/* ── 4.5. LIVE RESULTS & ACCURACY LEDGER (HIGH VISIBILITY) ── */}
      <section className="rounded-2xl border-2 border-emerald-500/30 bg-white dark:bg-[#0E1626] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  Verified Results &amp; Win Ledger
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                  {WEEKEND_2_ODDS_STATS.accuracyRate}% WIN RATE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every ticket settled publicly before kickoff. Real scores, no hidden losses.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-sm"
          >
            <span>Full Results Archive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
          <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-[#121B2F] border border-emerald-500/20">
            <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {WEEKEND_2_ODDS_STATS.accuracyRate}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Record</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {WEEKEND_2_ODDS_STATS.won}W - {WEEKEND_2_ODDS_STATS.lost}L
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Profit Units</span>
            <span className="text-xl font-black text-amber-500">
              {WEEKEND_2_ODDS_STATS.roiUnits}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Win Streak</span>
            <span className="text-xl font-black text-[#00C250]">
              {WEEKEND_2_ODDS_STATS.currentStreak} in a Row 🔥
            </span>
          </div>
        </div>

        {/* Recent Settled Tickets List */}
        <div className="space-y-2">
          {WEEKEND_ARCHIVE.slice(1, 4).map((ticket, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate('results')}
              className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ✓
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                      {ticket.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-bold uppercase">
                      WON
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {ticket.selections.map(s => `${s.match} (${s.score})`).join(' • ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{ticket.targetOdds}x Odds</span>
                <span className="text-slate-400 text-[11px]">{ticket.dateRange}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4.8. TRACKED AFRICAN PUNTERS DIRECTORY SPOTLIGHT ── */}
      <section 
        onClick={() => onNavigate('punters')}
        className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-[#131C2E] to-[#0E1626] p-4 sm:p-5 shadow-sm cursor-pointer hover:border-amber-500/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            👑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">
                Tracked African Punters &amp; Daily Booking Codes
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                UPDATED
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Browse top African tipsters &bull; Clean daily booking codes with event counts, total odds &amp; 1-tap copy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="px-3.5 py-2 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-md">
            <span>Explore Punters Hub</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── 4.8. BETTING ACADEMY: ARBITRAGE & SUREBETS MASTERCLASS ── */}
      <section className="rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-[#0A1226] via-[#0E1A38] to-[#070D1D] p-5 sm:p-6 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
            <BookOpen className="w-3 h-3" />
            <span>BRYME QUANTITATIVE ACADEMY</span>
          </div>
          <h3 className="font-display font-black text-lg sm:text-xl text-white">
            Everything to Know About Arbitrage Betting (Surebets 2026)
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Exploit price discrepancies across SportyBet, Bet9ja, and 1xBet. Learn how to calculate 4.9% risk-free margins, distribute ₦100k capital, and avoid account restrictions.
          </p>
        </div>

        <button
          onClick={() => onNavigate('article/arbitrage-betting-guide-nigeria-africa')}
          className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 flex-shrink-0 active:scale-95"
        >
          <span>Read Arbitrage Guide</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* IN-FEED AD SLOT */}
      <AdBanner slot="in-feed" label="Adsterra / Monetag In-Feed Placement" />

      {/* ── 5. HIGH-YIELD BETTING MARKETS DIRECTORY ── */}
      {(activeTab === 'all' || activeTab === 'markets') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
                📂
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                  High-Yield Betting Markets Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Curated statistical angles across European Top 6 Leagues
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('markets')}
              className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>All 8 Markets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highYieldMarkets.map((m) => (
              <div
                key={m.id}
                onClick={() => onNavigate(`market/${m.id}`)}
                className="group cursor-pointer p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] hover:border-blue-500/60 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                      {m.badge}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {m.picks}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {m.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Market Slips</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 6. VERIFIED WEEKEND 2.00x TRACK RECORD ── */}
      {(activeTab === 'all' || activeTab === 'weekend') && (
        <section className="space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-4 sm:p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                  🎯
                </div>
                <div>
                  <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    Verified Weekend 2.00x Audit Record
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculated historical performance across 13 recorded weekends. Zero deleted tickets.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('results')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#162035] hover:bg-slate-200 dark:hover:bg-[#1C2A44] text-slate-700 dark:text-slate-200 font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Full Archive ({WEEKEND_2_ODDS_STATS.won}/{WEEKEND_2_ODDS_STATS.totalWeekends})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick 4 Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Accuracy</span>
                <span className="text-lg sm:text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {WEEKEND_2_ODDS_STATS.accuracyRate}%
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Won / Total</span>
                <span className="text-lg sm:text-xl font-mono font-black text-blue-600 dark:text-blue-400">
                  {WEEKEND_2_ODDS_STATS.won} / {WEEKEND_2_ODDS_STATS.totalWeekends}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">ROI</span>
                <span className="text-lg sm:text-xl font-mono font-black text-amber-500">
                  {WEEKEND_2_ODDS_STATS.roiUnits}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Profit</span>
                <span className="text-lg sm:text-xl font-mono font-black text-slate-900 dark:text-white">
                  +{WEEKEND_2_ODDS_STATS.simulatedProfitNGN}
                </span>
              </div>
            </div>

            {/* Teaser to open dedicated Weekend Slip */}
            <div className="pt-2 text-right">
              <button
                onClick={() => onNavigate('ticket/epl-super-weekend')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span>Unlock Weekend 2.00x Slip &amp; Analysis &rarr;</span>
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ── 7. STATISTICAL FORM RADARS (EXPANDABLE) ── */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] overflow-hidden shadow-sm">
        <button
          onClick={() => setShowStatsDrawer(!showStatsDrawer)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-[#131E33] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Deep Statistical Form Radars &amp; Cheat Sheets
                </h3>
                <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                  Forebet / PredictZ Style
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {showStatsDrawer ? 'Click to collapse detailed tables' : 'Click to inspect Win%, Over 1.5/2.5 streaks, and BTTS probabilities'}
              </p>
            </div>
          </div>

          <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
            {showStatsDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showStatsDrawer && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A101D]">
            <StatisticalCheatSheet />
          </div>
        )}
      </section>

      {/* ── 8. COMMUNITY CONSENSUS MATCH POLL ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗳️</span>
            <div>
              <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                African Punters Consensus Poll
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sunday Feature Clash: <strong>Liverpool vs Chelsea</strong> (Premier League)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            2,419 Votes
          </span>
        </div>

        {!voted ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => handleVote('Liverpool Win')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all"
            >
              <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Liverpool Win (1)
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Anfield home form
              </div>
            </button>

            <button
              onClick={() => handleVote('Draw')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all"
            >
              <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Draw (X)
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tight tactical match
              </div>
            </button>

            <button
              onClick={() => handleVote('Chelsea Win')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all"
            >
              <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Chelsea Win (2)
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Maresca counter
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Liverpool Win</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">67% (1,620 votes)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Draw</span>
                <span className="font-mono font-bold text-slate-500">21% (508 votes)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '21%' }}></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Chelsea Win</span>
                <span className="font-mono font-bold text-slate-500">12% (291 votes)</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>

            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Your vote ({selectedVote}) has been recorded!</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

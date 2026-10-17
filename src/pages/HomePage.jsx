import React, { useState } from 'react';
import VisibleLadder from '../components/VisibleLadder';
import BookingCodesHub from '../components/BookingCodesHub';
import StatisticalCheatSheet from '../components/StatisticalCheatSheet';
import AdPlaceholder from '../components/AdPlaceholder';
import { WEEKEND_2_ODDS_STATS, WEEKEND_ARCHIVE } from '../data/weekendArchive';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import { 
  Trophy, ArrowRight, ShieldCheck, Flame, Sparkles, 
  TrendingUp, CheckCircle, Clock, Zap, Target, Copy, Check, BarChart2, ChevronDown, ChevronUp
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('all');
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);

  const handleVote = (option) => {
    setSelectedVote(option);
    setVoted(true);
  };

  // Grab the latest weekend pick from history for the feature card
  const latestWeekendPick = WEEKEND_ARCHIVE[0];

  return (
    <div className="space-y-6">
      
      {/* ── 1. WELCOME HERO & QUICK FILTER TABS ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400">
                Picks Live for Today
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-black tracking-tight text-slate-900 dark:text-white">
              BRYME Predictions Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              African sports intelligence, daily 1-tap booking codes, and the signature 18-step rollover.
            </p>
          </div>

          {/* Quick jump pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162035] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Hub
            </button>
            <button
              onClick={() => setActiveTab('ladder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all ${
                activeTab === 'ladder'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162035] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🪜 Ladder
            </button>
            <button
              onClick={() => setActiveTab('codes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all ${
                activeTab === 'codes'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162035] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📋 Codes
            </button>
            <button
              onClick={() => setActiveTab('weekend')}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all ${
                activeTab === 'weekend'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162035] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🎯 2 Odds
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. THE SIGNATURE LADDER CHALLENGE (CLEAR & INTUITIVE) ── */}
      {(activeTab === 'all' || activeTab === 'ladder') && (
        <section className="space-y-2">
          <VisibleLadder onNavigate={onNavigate} />
        </section>
      )}

      {/* ── 3. READY-TO-LOAD DAILY BOOKING CODES HUB ── */}
      {(activeTab === 'all' || activeTab === 'codes') && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
                📋
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                  Today's Ready Booking Codes
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SportyBet &bull; Bet9ja &bull; 1xBet (Dropped daily at 02:00 AM WAT)
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('results')}
              className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>Past Hit Rate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <BookingCodesHub onNavigate={onNavigate} />
        </section>
      )}

      {/* ── 4. WEEKEND 2.00 ODDS BANKER & VERIFIED ACCURACY ── */}
      {(activeTab === 'all' || activeTab === 'weekend') && (
        <section className="space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] p-4 sm:p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
                  🎯
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                      Weekend 2.00x Odds Banker
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                      {WEEKEND_2_ODDS_STATS.accuracyRate}% Accuracy
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculated on European Top 6 Leagues. Permanent public win/loss record.
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

          </div>
        </section>
      )}

      {/* ── 5. OPTIONAL EXPANDABLE: STATISTICAL FORM RADARS (REMOVES JAM-PACKED FEEL) ── */}
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

      {/* ── 6. COMMUNITY CONSENSUS MATCH POLL ── */}
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

      {/* ADSTERRA / BETTING PARTNER SLOT */}
      <AdPlaceholder label="Top Betting Partner Slot (18+ Gamble Responsibly)" />
    </div>
  );
}

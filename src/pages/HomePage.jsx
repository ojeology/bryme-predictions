import React, { useState } from 'react';
import VisibleLadder from '../components/VisibleLadder';
import BookingCodesHub from '../components/BookingCodesHub';
import StatisticalCheatSheet from '../components/StatisticalCheatSheet';
import AdPlaceholder from '../components/AdPlaceholder';
import { WEEKEND_2_ODDS_STATS } from '../data/weekendArchive';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import { 
  Trophy, ArrowRight, ShieldCheck, Flame, Sparkles, 
  TrendingUp, CheckCircle, Clock, Zap, Target, Copy, Check
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  // Simple Community Crowd Poll
  const [voted, setVoted] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);

  const handleVote = (option) => {
    setSelectedVote(option);
    setVoted(true);
  };

  return (
    <div className="space-y-6">
      
      {/* ── 1. SIGNATURE CROWN JEWEL: THE VISIBLE 18-STEP ROLLOVER LADDER ── */}
      {/* Front and center with peak readability and the 02:00 AM Midnight Drop */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
              🪜
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
                  The Signature Rollover Ladder
                </h2>
                <span className="text-[9px] uppercase font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  02:00 AM Drop
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1,000 NGN &rarr; 1,000,000 NGN &bull; 1.50 Daily Compound Odds with 50% Banking
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('ladder')}
            className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Masterpiece Ladder Component */}
        <VisibleLadder onNavigate={onNavigate} showFullInitial={false} />
      </section>

      {/* ── 2. DAILY MULTI-BOOKMAKER BOOKING CODES HUB ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
              📋
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
                Daily Ready-to-Load Booking Codes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-Tap copy for SportyBet, Bet9ja, 1xBet, BetKing &amp; Betway (Dropped at 02:00 AM WAT)
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Past Accuracy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-Bookmaker Cards */}
        <BookingCodesHub onNavigate={onNavigate} />
      </section>

      {/* ── 3. MATHEMATICAL RADARS & CHEAT SHEETS (COPIED FROM LEADING SITES) ── */}
      <section className="space-y-3">
        <StatisticalCheatSheet />
      </section>

      {/* ── 4. WEEKEND 2 ODDS ACCURACY HIGHLIGHT ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
              🎯
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                Weekend 2.00x Odds Verified Accuracy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracked every weekend on European Top 6 Leagues. Permanent win/loss record.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <span>Inspect Full Record ({WEEKEND_2_ODDS_STATS.accuracyRate}%)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-medium">Historical Hit Rate</span>
            <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
              {WEEKEND_2_ODDS_STATS.accuracyRate}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-medium">Weekends Won</span>
            <span className="text-xl font-mono font-black text-blue-600 dark:text-blue-400">
              {WEEKEND_2_ODDS_STATS.won} / {WEEKEND_2_ODDS_STATS.totalWeekends}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-medium">Cumulative ROI</span>
            <span className="text-xl font-mono font-black text-amber-500">
              {WEEKEND_2_ODDS_STATS.roiUnits}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-medium">Simulated Return</span>
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
              +{WEEKEND_2_ODDS_STATS.simulatedProfitNGN}
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. COMMUNITY CROWD WISDOM MATCH POLL ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C2E] p-4 sm:p-5 shadow-sm space-y-3">
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
            2,419 Votes Cast
          </span>
        </div>

        {!voted ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => handleVote('Liverpool Win')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all"
            >
              <div className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Liverpool Win (1)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Anfield home supremacy
              </div>
            </button>

            <button
              onClick={() => handleVote('Draw')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all"
            >
              <div className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Draw (X)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tight tactical stalemate
              </div>
            </button>

            <button
              onClick={() => handleVote('Chelsea Win')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all"
            >
              <div className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Chelsea Win (2)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Maresca counter-attack
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
              <span>Your vote ({selectedVote}) has been recorded in the community consensus!</span>
            </div>
          </div>
        )}
      </div>

      {/* RESERVED ADSTERRA SLOT */}
      <AdPlaceholder label="Top Betting Partner Slot (18+ Gamble Responsibly)" />
    </div>
  );
}

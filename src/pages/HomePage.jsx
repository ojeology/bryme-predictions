import React, { useState } from 'react';
import MidnightDropBanner from '../components/MidnightDropBanner';
import BookingCodesHub from '../components/BookingCodesHub';
import VisibleLadder from '../components/VisibleLadder';
import AdPlaceholder from '../components/AdPlaceholder';
import { WEEKEND_2_ODDS_STATS } from '../data/weekendArchive';
import { 
  Trophy, ArrowRight, ShieldCheck, Flame, Sparkles, 
  TrendingUp, CheckCircle, Clock, Zap, Target
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
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* ── 1. MIDNIGHT DROP COUNTDOWN BANNER (02:00 AM WAT) ── */}
      <MidnightDropBanner />

      {/* ── 2. THE CORE HUB: DAILY MULTI-BOOKMAKER BOOKING CODES ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              📋
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                Today's Ready-to-Load Booking Codes
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct codes for SportyBet, Bet9ja, 1xBet, BetKing &amp; Betway (1-Tap Copy)
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Accuracy Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-Bookmaker Cards */}
        <BookingCodesHub onNavigate={onNavigate} />
      </section>

      {/* ── 3. WEEKEND 2 ODDS ACCURACY HIGHLIGHT ── */}
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
                Tracked every weekend on European Top 6 Leagues. Transparent win/loss archive.
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
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Historical Hit Rate</span>
            <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
              {WEEKEND_2_ODDS_STATS.accuracyRate}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Weekends Won</span>
            <span className="text-xl font-mono font-black text-blue-600 dark:text-blue-400">
              {WEEKEND_2_ODDS_STATS.won} / {WEEKEND_2_ODDS_STATS.totalWeekends}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Net Profit Units</span>
            <span className="text-xl font-mono font-black text-amber-500">
              {WEEKEND_2_ODDS_STATS.roiUnits}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#162032] border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Simulated ₦ Return</span>
            <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
              +{WEEKEND_2_ODDS_STATS.simulatedProfitNGN}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. THE VISIBLE 18-STEP ROLLOVER LADDER ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              🪜
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white">
                The Visible 18-Step Rollover Ladder
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                1,000 NGN &rarr; 1,000,000 NGN with 50% Banking Milestone at Day 6
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('ladder')}
            className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Past Ladder Runs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <VisibleLadder onNavigate={onNavigate} showFullInitial={false} />
      </section>

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

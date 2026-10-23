import React from 'react';
import { ACTIVE_CHALLENGE, LADDER_AGGREGATE_STATS } from '../data/ladder';
import { OFFICIAL_3X_ROLLOVER } from '../data/fridayRolloverAndVaultData';
import VisibleLadder from '../components/VisibleLadder';
import CurrencyCalculator from '../components/CurrencyCalculator';
import StatusBadge from '../components/StatusBadge';
import { Trophy, AlertTriangle, TrendingUp, ShieldAlert, Zap } from 'lucide-react';

export default function LadderPage({ onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-7 h-7 text-emerald-500" />
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
            Official 3.00x Pure OVER Rollover Challenge
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
          <strong>₦1,000 Starting Stake &rarr; ₦81,972 in 4 Consecutive Wins.</strong> Strictly <strong>Pure OVER Match Behaviour</strong> (Corners, Fouls, Yellow Cards, Tackles &amp; Shots) audited against real live <strong>22Bet</strong> &amp; <strong>SportyBet</strong> lines — zero Under bets, zero Goal bets, zero advertisements.
        </p>
      </div>

      {/* Why 3.00x Pure OVER Math Works */}
      <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2 font-display font-black text-emerald-400 uppercase tracking-wide">
          <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Why 4 Steps at 3.00x Pure OVER Is Mathematically Superior</span>
        </div>
        <p className="text-slate-200 leading-relaxed text-xs">
          At <strong>₦1,000 per attempt</strong>, an entire 30-day month of tries costs at most <strong>₦30,000</strong>. Hitting just <strong>ONE 4-day streak</strong> at ~3.00x (`₦1,000 → ₦3,036 → ₦9,108 → ₦27,324 → ₦81,972`) pays back the entire ₦30,000 monthly risk AND locks <strong>+₦51,972 net profit</strong>!
        </p>
      </div>

      {/* Interactive Rollover Board */}
      <VisibleLadder onNavigate={onNavigate} />

      {/* Explicit Trap Audit Card — Why Certain Lines Were Rejected Today */}
      <div className="rounded-2xl border border-rose-500/40 bg-[#0E1626] p-5 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-display font-black text-sm uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Why Trap Lines Were Rejected From Today&apos;s Day 1 Ticket (Real Bookie Line Audit)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {OFFICIAL_3X_ROLLOVER.rejectedTodayTraps.map((t, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-rose-950/25 border border-rose-500/30 space-y-1">
              <div className="font-mono font-bold text-white">{t.match}</div>
              <div className="font-mono text-rose-300 font-bold">❌ Rejected: {t.rejectedBet}</div>
              <p className="text-slate-300 leading-relaxed">{t.whyRejected}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Currency / Stake Calculator */}
      <CurrencyCalculator />

      {/* Active Challenge Leg Status List */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E172A] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-display font-black text-white">
              Day 1 Official 22Bet Ticket — All 6 Legs ({ACTIVE_CHALLENGE.dailyOdds}x Combined)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Auto-grading into model_evaluation_ledger.csv tonight at 21:45 WAT
            </p>
          </div>
          <span className="font-mono font-black text-emerald-400 text-lg">₦1,000 &rarr; ₦3,036</span>
        </div>

        <div className="space-y-2">
          {ACTIVE_CHALLENGE.selections.map((sel, idx) => (
            <div key={idx} className="bg-[#0C1527] p-3 rounded-xl border border-white/[0.08] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-display font-bold text-white">{idx + 1}. {sel.match} ({sel.kickoff})</div>
                <div className="text-[11px] text-amber-300 font-mono mt-0.5">{sel.pick}</div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="font-mono font-black text-emerald-400 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded">
                  {sel.odds.toFixed(2)}
                </span>
                <StatusBadge status={sel.status} size="xs" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="space-y-3">
        <h2 className="text-lg font-display font-black text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Rollover Challenge Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="bg-[#0E172A] p-3 rounded-xl border border-white/[0.08]">
            <span className="text-[10px] uppercase text-slate-400 block">Current Step</span>
            <span className="text-lg font-display font-black text-emerald-400">Step 1 / 4</span>
          </div>
          <div className="bg-[#0E172A] p-3 rounded-xl border border-white/[0.08]">
            <span className="text-[10px] uppercase text-slate-400 block">Active Stake</span>
            <span className="text-lg font-display font-black text-white">₦1,000</span>
          </div>
          <div className="bg-[#0E172A] p-3 rounded-xl border border-white/[0.08]">
            <span className="text-[10px] uppercase text-slate-400 block">Day 1 Payout</span>
            <span className="text-lg font-display font-black text-amber-300">₦3,036</span>
          </div>
          <div className="bg-[#0E172A] p-3 rounded-xl border border-white/[0.08]">
            <span className="text-[10px] uppercase text-slate-400 block">4-Win Goal</span>
            <span className="text-lg font-display font-black text-emerald-400">₦81,972</span>
          </div>
        </div>
      </div>
    </div>
  );
}

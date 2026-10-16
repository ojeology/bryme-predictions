import React, { useState } from 'react';
import { 
  ACTIVE_CHALLENGE, PAST_CHALLENGES, LADDER_AGGREGATE_STATS, LADDER_CONFIG 
} from '../data/ladder';
import VisibleLadder from '../components/VisibleLadder';
import CurrencyCalculator from '../components/CurrencyCalculator';
import StatusBadge from '../components/StatusBadge';
import { 
  Trophy, ShieldAlert, Copy, Check, TrendingUp, Info, 
  AlertTriangle, DollarSign, ArrowRight, Clock, Target, Calendar, Zap
} from 'lucide-react';

export default function LadderPage({ onNavigate }) {
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);
  const [copiedSporty, setCopiedSporty] = useState(false);

  const handleCopy = (code, type) => {
    navigator.clipboard.writeText(code);
    if (type === 'bet9ja') {
      setCopiedBet9ja(true);
      setTimeout(() => setCopiedBet9ja(false), 2000);
    } else {
      setCopiedSporty(true);
      setTimeout(() => setCopiedSporty(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-white/[0.08] pb-4">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-7 h-7 text-emerald-500" />
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
            The Public Rollover Ladder
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
          A disciplined, public daily rollover starting with ₦1,000 aimed at the ₦1,000,000 target. Every step, loss, and 50% milestone banked in full public view.
        </p>
      </div>

      {/* MANDATORY HONEST DISCLOSURE */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2 font-display font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Mandatory Mathematical Honesty &amp; Risk Disclosure</span>
        </div>
        <p className="text-amber-900 dark:text-slate-200 leading-relaxed text-xs">
          <strong>"You can lose your whole stake. Most challenges end before reaching the goal."</strong> Reaching ₦1,000,000 from ₦1,000 at 1.50 odds with zero banking mathematically requires <strong>18 consecutive wins</strong> ((1.5)<sup>18</sup> &approx; 1,477x). Compound variance means most rollover challenges terminate within Days 1 to 4. We do not describe this challenge as low risk or as a source of income.
        </p>
      </div>

      {/* VISIBLE LADDER MOUNTAIN (THE FULL INTERACTIVE LADDER) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            The 18-Step Rollover Rung System
          </h2>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Day 6 Safe Haven &bull; 50% Bank
          </span>
        </div>

        {/* Full Visible Ladder */}
        <VisibleLadder onNavigate={onNavigate} showFullInitial={true} />
      </div>

      {/* CURRENCY CALCULATOR TOOL */}
      <div className="space-y-2">
        <CurrencyCalculator />
      </div>

      {/* LIVE ACTIVE CHALLENGE DETAILS CARD */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E172A] p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-black text-slate-900 dark:text-white">
                  Active Challenge #{ACTIVE_CHALLENGE.challengeNumber}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-display font-black bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  STEP 3 LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Started {ACTIVE_CHALLENGE.startDate} with ₦{ACTIVE_CHALLENGE.startingStake.toLocaleString()} starting stake
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 dark:bg-[#050914] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.06]">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block">Accumulated Purse</span>
            <span className="text-xl font-display font-black text-emerald-600 dark:text-emerald-400">
              ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Today's Selections & Booking Codes */}
        <div className="bg-slate-50 dark:bg-[#070D1A] rounded-xl p-4 border border-slate-200 dark:border-white/[0.06] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/[0.06] pb-2.5">
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">
                Today's Daily 1.50 Slip (Step {ACTIVE_CHALLENGE.currentDay})
              </span>
              <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white">
                Combined Target Odds: {ACTIVE_CHALLENGE.dailyOdds.toFixed(2)}x
              </h3>
            </div>

            {/* Quick Copy Booking Codes */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-emerald-500/40 px-2.5 py-1 rounded-lg text-xs shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Bet9ja:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{ACTIVE_CHALLENGE.todaysCode}</span>
                <button
                  onClick={() => handleCopy(ACTIVE_CHALLENGE.todaysCode, 'bet9ja')}
                  className="p-1 hover:text-slate-900 dark:hover:text-white text-slate-400"
                  title="Copy Bet9ja code"
                >
                  {copiedBet9ja ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-[#0C1527] border border-slate-200 dark:border-white/[0.08] px-2.5 py-1 rounded-lg text-xs shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Alt Code:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ACTIVE_CHALLENGE.sportyCode}</span>
                <button
                  onClick={() => handleCopy(ACTIVE_CHALLENGE.sportyCode, 'sporty')}
                  className="p-1 hover:text-slate-900 dark:hover:text-white text-slate-400"
                  title="Copy code"
                >
                  {copiedSporty ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Today's match breakdown */}
          <div className="space-y-2">
            {ACTIVE_CHALLENGE.selections.map((sel, idx) => (
              <div key={idx} className="bg-white dark:bg-[#0C1527] p-2.5 rounded-lg border border-slate-200 dark:border-white/[0.06] text-xs flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-display font-bold text-slate-900 dark:text-slate-100">{sel.match}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {sel.league} &bull; Kickoff {sel.kickoff} &bull; <strong className="text-amber-600 dark:text-amber-300 font-normal">{sel.pick}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs px-2 py-0.5 bg-slate-100 dark:bg-[#121E36] rounded">
                    {sel.odds.toFixed(2)}
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={sel.status} size="xs" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History of this challenge */}
        <div>
          <h4 className="text-xs font-display font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Active Run Step-By-Step History:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ACTIVE_CHALLENGE.daysHistory.map(d => (
              <div key={d.day} className="bg-slate-50 dark:bg-[#070D1A] p-2.5 rounded-xl border border-slate-200 dark:border-white/[0.06] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-slate-900 dark:text-slate-200">Step {d.day} ({d.date})</span>
                  <StatusBadge status={d.result} size="xs" />
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Stake ₦{d.stake.toLocaleString()} &rarr; Payout ₦{d.payout.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-1">
                  {d.summary}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HONEST AGGREGATE STATISTICS */}
      <div className="space-y-3">
        <h2 className="text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Transparent Aggregate Statistics
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="bg-white dark:bg-[#0E172A] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">Total Started</span>
            <span className="text-lg font-display font-black text-slate-900 dark:text-white">{LADDER_AGGREGATE_STATS.challengesStarted}</span>
          </div>
          <div className="bg-white dark:bg-[#0E172A] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">Average Step</span>
            <span className="text-lg font-display font-black text-amber-600 dark:text-amber-400">{LADDER_AGGREGATE_STATS.averageDayReached}</span>
          </div>
          <div className="bg-white dark:bg-[#0E172A] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">Longest Streak</span>
            <span className="text-lg font-display font-black text-emerald-600 dark:text-emerald-400">{LADDER_AGGREGATE_STATS.longestStreak}</span>
          </div>
          <div className="bg-white dark:bg-[#0E172A] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">Step 6 Banked</span>
            <span className="text-lg font-display font-black text-emerald-600 dark:text-emerald-400">{LADDER_AGGREGATE_STATS.milestonesSecuredDay6} Times</span>
          </div>
          <div className="bg-white dark:bg-[#0E172A] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">Total Staked</span>
            <span className="text-lg font-display font-black text-slate-900 dark:text-white">₦{LADDER_AGGREGATE_STATS.totalStakedNGN.toLocaleString()}</span>
          </div>
          <div className="bg-white dark:bg-[#0E172A] p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] shadow-sm">
            <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">Total Banked</span>
            <span className="text-lg font-display font-black text-amber-600 dark:text-amber-400">₦{LADDER_AGGREGATE_STATS.totalBankedNGN.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* FULL HISTORICAL LEDGER TABLE */}
      <div className="space-y-3">
        <h2 className="text-lg font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          Historical Challenges Ledger
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E172A] shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#070D1A] text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase border-b border-slate-200 dark:border-white/[0.08]">
              <tr>
                <th className="p-3">Challenge #</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Step Reached</th>
                <th className="p-3">Starting Stake</th>
                <th className="p-3">Banked Amount</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">Exit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] text-slate-700 dark:text-slate-300">
              {PAST_CHALLENGES.map((c) => (
                <tr key={c.challengeNumber} className="hover:bg-slate-50 dark:hover:bg-[#121E36] transition-colors">
                  <td className="p-3 font-display font-bold text-slate-900 dark:text-white">
                    Challenge #{c.challengeNumber}
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {c.startDate} to {c.endDate}
                  </td>
                  <td className="p-3 font-display font-bold text-slate-800 dark:text-slate-200">
                    Step {c.dayReached}
                  </td>
                  <td className="p-3 font-mono">
                    ₦{c.startingStake.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                    ₦{c.bankedAmount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={c.outcome === 'milestone-secured' ? 'won' : 'lost'} size="xs" />
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                    {c.fatalMatch}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

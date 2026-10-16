import React, { useState } from 'react';
import { 
  ACTIVE_CHALLENGE, PAST_CHALLENGES, LADDER_AGGREGATE_STATS, LADDER_CONFIG 
} from '../data/ladder';
import StatusBadge from '../components/StatusBadge';
import { 
  Trophy, ShieldAlert, Copy, Check, TrendingUp, Info, 
  AlertTriangle, DollarSign, ArrowRight, Clock, Target, Calendar
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
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-pitch-800 pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-brand-green" />
          <h1 className="text-xl sm:text-2xl font-black text-white">
            The Public Ladder Rollover Challenge
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          A disciplined, transparent daily rollover starting with ₦1,000 aimed at ₦1,000,000. Every step recorded in full view.
        </p>
      </div>

      {/* MANDATORY HONEST TRANSPARENCY BANNER (Per Section 5 Hard Requirement) */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Mandatory Mathematical Honesty &amp; Risk Disclosure</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          <strong>"You can lose your whole stake. Most challenges end before reaching the goal."</strong> Reaching ₦1,000,000 from ₦1,000 at 1.5 odds with zero banking mathematically requires <strong>18 consecutive wins</strong> ((1.5)<sup>18</sup> &approx; 1,477x). Compound variance means most rollover challenges terminate within Days 1 to 4. We do not describe this challenge as low risk or as a source of income.
        </p>
      </div>

      {/* LIVE ACTIVE CHALLENGE CARD */}
      <div className="bg-gradient-to-b from-pitch-850 to-pitch-900 border-2 border-brand-green/40 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pitch-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-green"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Active Challenge #{ACTIVE_CHALLENGE.challengeNumber}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-green/20 text-brand-green border border-brand-green/40">
                  LIVE &bull; IN PROGRESS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Started {ACTIVE_CHALLENGE.startDate} with ₦{ACTIVE_CHALLENGE.startingStake.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-pitch-950/80 px-3.5 py-2 rounded-xl border border-pitch-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Current Accumulated Purse</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-brand-green">
              ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Challenge Progress Stepper (1 to 18) */}
        <div className="my-6 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-1.5">
              <span>Day {ACTIVE_CHALLENGE.currentDay} of 18</span>
              <span className="text-slate-500">&bull;</span>
              <span className="text-amber-400 font-mono">Day 6 Milestone: 50% Banking</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              Target: ₦1,000,000
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-18 gap-1.5">
            {Array.from({ length: 18 }).map((_, i) => {
              const dayNum = i + 1;
              const isPast = dayNum < ACTIVE_CHALLENGE.currentDay;
              const isCurrent = dayNum === ACTIVE_CHALLENGE.currentDay;
              const isMilestone = dayNum === 6;

              return (
                <div
                  key={dayNum}
                  className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                    isPast
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                      : isCurrent
                      ? 'bg-brand-green text-pitch-950 border-2 border-white shadow-lg animate-pulse'
                      : isMilestone
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      : 'bg-pitch-800 text-slate-500 border border-pitch-750'
                  }`}
                  title={isMilestone ? 'Day 6: Bank 50%' : `Day ${dayNum}`}
                >
                  <span>D{dayNum}</span>
                  {isPast && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                  {isMilestone && !isPast && <span className="text-[8px]">BANK</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Selections & Booking Codes */}
        <div className="bg-pitch-950 rounded-xl p-4 border border-pitch-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pitch-850 pb-2.5">
            <div>
              <span className="text-[10px] uppercase font-mono text-brand-green font-bold tracking-wider">
                Today's Daily 1.50 Slip (Day {ACTIVE_CHALLENGE.currentDay})
              </span>
              <h3 className="text-sm font-bold text-slate-100">
                Combined Target Odds: {ACTIVE_CHALLENGE.dailyOdds.toFixed(2)}x
              </h3>
            </div>

            {/* Quick Copy Booking Codes */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-pitch-900 border border-brand-green/40 px-2.5 py-1 rounded-lg text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Bet9ja:</span>
                <span className="font-mono font-bold text-brand-green">{ACTIVE_CHALLENGE.todaysCode}</span>
                <button
                  onClick={() => handleCopy(ACTIVE_CHALLENGE.todaysCode, 'bet9ja')}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy Bet9ja code"
                >
                  {copiedBet9ja ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-pitch-900 border border-pitch-750 px-2.5 py-1 rounded-lg text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Sporty:</span>
                <span className="font-mono font-bold text-slate-200">{ACTIVE_CHALLENGE.sportyCode}</span>
                <button
                  onClick={() => handleCopy(ACTIVE_CHALLENGE.sportyCode, 'sporty')}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy SportyBet code"
                >
                  {copiedSporty ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Today's match breakdown */}
          <div className="space-y-2">
            {ACTIVE_CHALLENGE.selections.map((sel, idx) => (
              <div key={idx} className="bg-pitch-900 p-2.5 rounded-lg border border-pitch-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">{sel.match}</div>
                  <div className="text-[10px] text-slate-400">
                    {sel.league} &bull; Kickoff {sel.kickoff} &bull; <strong className="text-amber-300 font-normal">{sel.pick}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-brand-green text-xs px-2 py-0.5 bg-pitch-800 rounded">
                    {sel.odds.toFixed(2)}
                  </span>
                  <StatusBadge status={sel.status} size="xs" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Days history for active challenge */}
        <div className="mt-4 pt-4 border-t border-pitch-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Active Challenge Run History:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ACTIVE_CHALLENGE.daysHistory.map(d => (
              <div key={d.day} className="bg-pitch-950 p-2.5 rounded-lg border border-pitch-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-200">Day {d.day} ({d.date})</span>
                  <StatusBadge status={d.result} size="xs" />
                </div>
                <div className="text-[11px] text-slate-400">
                  Stake ₦{d.stake.toLocaleString()} &rarr; Payout ₦{d.payout.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-1">
                  {d.summary}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HONEST AGGREGATE STATISTICS (Computed from ledger per Section 5) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-green" />
            Transparent Aggregate Statistics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real figures calculated directly from our public challenge archive.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-pitch-850 p-3 rounded-xl border border-pitch-750">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Started</span>
            <span className="text-lg font-bold text-slate-100">{LADDER_AGGREGATE_STATS.challengesStarted}</span>
          </div>
          <div className="bg-pitch-850 p-3 rounded-xl border border-pitch-750">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Average Day</span>
            <span className="text-lg font-bold text-amber-400">{LADDER_AGGREGATE_STATS.averageDayReached}</span>
          </div>
          <div className="bg-pitch-850 p-3 rounded-xl border border-pitch-750">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Longest Streak</span>
            <span className="text-lg font-bold text-brand-green">{LADDER_AGGREGATE_STATS.longestStreak}</span>
          </div>
          <div className="bg-pitch-850 p-3 rounded-xl border border-pitch-750">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Day 6 Banked</span>
            <span className="text-lg font-bold text-emerald-400">{LADDER_AGGREGATE_STATS.milestonesSecuredDay6} Times</span>
          </div>
          <div className="bg-pitch-850 p-3 rounded-xl border border-pitch-750">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Staked</span>
            <span className="text-lg font-bold text-slate-100">₦{LADDER_AGGREGATE_STATS.totalStakedNGN.toLocaleString()}</span>
          </div>
          <div className="bg-pitch-850 p-3 rounded-xl border border-pitch-750">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Banked</span>
            <span className="text-lg font-bold text-brand-green">₦{LADDER_AGGREGATE_STATS.totalBankedNGN.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* HOW FAR CHALLENGES USUALLY GET - VISUAL CHART (Per Section 5 requirement) */}
      <div className="bg-pitch-850 border border-pitch-800 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100">
            Survival Distribution: How Far Challenges Usually Get
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Sample Size: 49 Completed</span>
        </div>
        <p className="text-xs text-slate-400">
          This chart visualizes why honest bankroll management matters: <strong>53% of all challenges end on Day 1 or Day 2</strong>.
        </p>

        <div className="space-y-2 pt-2">
          {LADDER_AGGREGATE_STATS.daysDistribution.map((item) => (
            <div key={item.dayLabel} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">{item.dayLabel}</span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {item.count} challenges ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-pitch-900 rounded-full h-3 overflow-hidden border border-pitch-750">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.dayLabel.includes('6') ? 'bg-amber-400' : 'bg-brand-green'
                  }`}
                  style={{ width: `${item.percentage * 2.5}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL HISTORICAL LEDGER TABLE (Per Section 5) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-green" />
            Historical Challenges Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every previous attempt logged with start date, final day reached, banked sum and outcome.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-pitch-800 bg-pitch-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-pitch-950 text-slate-400 text-[10px] font-mono uppercase border-b border-pitch-800">
              <tr>
                <th className="p-3">Challenge #</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Day Reached</th>
                <th className="p-3">Starting Stake</th>
                <th className="p-3">Banked Amount</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">Fatal Match / Exit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pitch-800 text-slate-300">
              {PAST_CHALLENGES.map((c) => (
                <tr key={c.challengeNumber} className="hover:bg-pitch-850/60 transition-colors">
                  <td className="p-3 font-bold font-mono text-slate-100">
                    Challenge #{c.challengeNumber}
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-[11px]">
                    {c.startDate} to {c.endDate}
                  </td>
                  <td className="p-3 font-semibold text-slate-200">
                    Day {c.dayReached}
                  </td>
                  <td className="p-3 font-mono">
                    ₦{c.startingStake.toLocaleString()}
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-400">
                    ₦{c.bankedAmount.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={c.outcome === 'milestone-secured' ? 'won' : 'lost'} size="xs" />
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] max-w-xs truncate">
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

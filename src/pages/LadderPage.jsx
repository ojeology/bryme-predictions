import React, { useState } from 'react';
import { 
  ACTIVE_CHALLENGE, PAST_CHALLENGES, LADDER_AGGREGATE_STATS, LADDER_CONFIG 
} from '../data/ladder';
import VisibleLadder from '../components/VisibleLadder';
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
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-[#1E3258] pb-5">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-8 h-8 text-fortegreen-neon" />
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            The Public Ladder Rollover Challenge
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          A disciplined, transparent daily rollover starting with ₦1,000 aimed at the ₦1,000,000 mountain peak. Every step, loss, and milestone banked in full public view.
        </p>
      </div>

      {/* MANDATORY HONEST TRANSPARENCY BANNER (Per Section 5 Hard Requirement) */}
      <div className="bg-amber-950/40 border-2 border-amber-800/80 rounded-2xl p-5 text-xs sm:text-sm space-y-2">
        <div className="flex items-center gap-2 font-display font-black text-amber-300 uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>Mandatory Mathematical Honesty &amp; Risk Disclosure</span>
        </div>
        <p className="text-slate-200 leading-relaxed">
          <strong>"You can lose your whole stake. Most challenges end before reaching the goal."</strong> Reaching ₦1,000,000 from ₦1,000 at 1.50 odds with zero banking mathematically requires <strong>18 consecutive wins</strong> ((1.5)<sup>18</sup> &approx; 1,477x). Compound variance means most rollover challenges terminate within Days 1 to 4. We do not describe this challenge as low risk or as a source of income.
        </p>
      </div>

      {/* VISIBLE LADDER MOUNTAIN (THE FULL INTERACTIVE LADDER) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-fortegreen-neon fill-fortegreen-neon" />
            The Visible 18-Step Rollover Rung System
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Day 6 Safe Haven &bull; 50% Bank
          </span>
        </div>

        {/* Full Visible Ladder */}
        <VisibleLadder onNavigate={onNavigate} showFullInitial={true} />
      </div>

      {/* LIVE ACTIVE CHALLENGE DETAILS CARD */}
      <div className="glass-card border-2 border-fortegreen-neon/50 rounded-3xl p-5 sm:p-7 shadow-glow-green space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E3258] pb-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fortegreen-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-fortegreen-neon"></span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-black text-white">
                  Active Challenge #{ACTIVE_CHALLENGE.challengeNumber}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-display font-black bg-fortegreen-neon/20 text-fortegreen-neon border border-fortegreen-neon/40">
                  LIVE &bull; STEP 3 IN PROGRESS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Started {ACTIVE_CHALLENGE.startDate} with ₦{ACTIVE_CHALLENGE.startingStake.toLocaleString()} starting stake
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-pitch-950/90 px-4 py-2.5 rounded-2xl border border-fortegreen-neon/40">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Accumulated Purse</span>
            <span className="text-2xl font-display font-black font-mono text-fortegreen-neon">
              ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Today's Selections & Booking Codes */}
        <div className="bg-[#050A14] rounded-2xl p-5 border border-[#1E3258] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#121E36] pb-3">
            <div>
              <span className="text-[10px] uppercase font-mono text-fortegreen-neon font-black tracking-wider">
                Today's Daily 1.50 Slip (Step {ACTIVE_CHALLENGE.currentDay})
              </span>
              <h3 className="text-base font-display font-black text-white">
                Combined Target Odds: {ACTIVE_CHALLENGE.dailyOdds.toFixed(2)}x
              </h3>
            </div>

            {/* Quick Copy Booking Codes */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-[#0C1527] border border-fortegreen-neon/40 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Bet9ja:</span>
                <span className="font-mono font-black text-fortegreen-neon text-sm">{ACTIVE_CHALLENGE.todaysCode}</span>
                <button
                  onClick={() => handleCopy(ACTIVE_CHALLENGE.todaysCode, 'bet9ja')}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy Bet9ja code"
                >
                  {copiedBet9ja ? <Check className="w-4 h-4 text-fortegreen-neon" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2 bg-[#0C1527] border border-[#1E3258] px-3 py-1.5 rounded-xl text-xs">
                <span className="text-[10px] text-slate-400 font-mono">Sporty:</span>
                <span className="font-mono font-black text-slate-200 text-sm">{ACTIVE_CHALLENGE.sportyCode}</span>
                <button
                  onClick={() => handleCopy(ACTIVE_CHALLENGE.sportyCode, 'sporty')}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy SportyBet code"
                >
                  {copiedSporty ? <Check className="w-4 h-4 text-fortegreen-neon" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Today's match breakdown */}
          <div className="space-y-2.5">
            {ACTIVE_CHALLENGE.selections.map((sel, idx) => (
              <div key={idx} className="bg-[#0C1527] p-3 rounded-xl border border-[#182847] text-xs flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-slate-100 text-sm">{sel.match}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {sel.league} &bull; Kickoff {sel.kickoff} &bull; <strong className="text-amber-300 font-normal">{sel.pick}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-fortegreen-neon text-xs px-2.5 py-1 bg-[#121E36] rounded-lg border border-fortegreen-neon/20">
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

        {/* Days history for active challenge */}
        <div className="pt-2">
          <h4 className="text-xs font-display font-black text-slate-300 uppercase tracking-wider mb-2.5">
            Active Run Step-By-Step History:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {ACTIVE_CHALLENGE.daysHistory.map(d => (
              <div key={d.day} className="bg-[#050A14] p-3 rounded-xl border border-[#182847] text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-slate-200">Step {d.day} ({d.date})</span>
                  <StatusBadge status={d.result} size="xs" />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
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
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-fortegreen-neon" />
            Transparent Aggregate Statistics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real figures calculated directly from our public challenge archive.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#0C1527] p-3.5 rounded-2xl border border-[#1E3258]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Started</span>
            <span className="text-xl font-display font-black text-slate-100">{LADDER_AGGREGATE_STATS.challengesStarted}</span>
          </div>
          <div className="bg-[#0C1527] p-3.5 rounded-2xl border border-[#1E3258]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Average Step</span>
            <span className="text-xl font-display font-black text-amber-400">{LADDER_AGGREGATE_STATS.averageDayReached}</span>
          </div>
          <div className="bg-[#0C1527] p-3.5 rounded-2xl border border-[#1E3258]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Longest Streak</span>
            <span className="text-xl font-display font-black text-fortegreen-neon">{LADDER_AGGREGATE_STATS.longestStreak}</span>
          </div>
          <div className="bg-[#0C1527] p-3.5 rounded-2xl border border-[#1E3258]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Step 6 Banked</span>
            <span className="text-xl font-display font-black text-fortegreen-neon">{LADDER_AGGREGATE_STATS.milestonesSecuredDay6} Times</span>
          </div>
          <div className="bg-[#0C1527] p-3.5 rounded-2xl border border-[#1E3258]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Staked</span>
            <span className="text-xl font-display font-black text-slate-100">₦{LADDER_AGGREGATE_STATS.totalStakedNGN.toLocaleString()}</span>
          </div>
          <div className="bg-[#0C1527] p-3.5 rounded-2xl border border-[#1E3258]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Banked</span>
            <span className="text-xl font-display font-black text-amber-400">₦{LADDER_AGGREGATE_STATS.totalBankedNGN.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* HOW FAR CHALLENGES USUALLY GET - VISUAL CHART */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-black text-slate-100">
            Survival Distribution: How Far Challenges Usually Get
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Sample Size: 49 Completed</span>
        </div>
        <p className="text-xs text-slate-400">
          This chart visualizes why honest bankroll management matters: <strong>53% of all challenges end on Day 1 or Day 2</strong>.
        </p>

        <div className="space-y-2.5 pt-2">
          {LADDER_AGGREGATE_STATS.daysDistribution.map((item) => (
            <div key={item.dayLabel} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.dayLabel}</span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {item.count} challenges ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-[#050A14] rounded-full h-3.5 overflow-hidden border border-[#182847]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.dayLabel.includes('6') ? 'bg-amber-400' : 'bg-fortegreen-neon'
                  }`}
                  style={{ width: `${item.percentage * 2.5}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FULL HISTORICAL LEDGER TABLE */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-fortegreen-neon" />
            Historical Challenges Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every previous attempt logged with start date, final day reached, banked sum and outcome.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#1E3258] bg-[#070D1A]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050A14] text-slate-400 text-[10px] font-mono uppercase border-b border-[#1E3258]">
              <tr>
                <th className="p-3.5">Challenge #</th>
                <th className="p-3.5">Dates</th>
                <th className="p-3.5">Step Reached</th>
                <th className="p-3.5">Starting Stake</th>
                <th className="p-3.5">Banked Amount</th>
                <th className="p-3.5">Outcome</th>
                <th className="p-3.5">Fatal Match / Exit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182847] text-slate-300">
              {PAST_CHALLENGES.map((c) => (
                <tr key={c.challengeNumber} className="hover:bg-[#0C1527] transition-colors">
                  <td className="p-3.5 font-display font-bold text-slate-100">
                    Challenge #{c.challengeNumber}
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                    {c.startDate} to {c.endDate}
                  </td>
                  <td className="p-3.5 font-display font-bold text-slate-200">
                    Step {c.dayReached}
                  </td>
                  <td className="p-3.5 font-mono">
                    ₦{c.startingStake.toLocaleString()}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-400">
                    ₦{c.bankedAmount.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={c.outcome === 'milestone-secured' ? 'won' : 'lost'} size="xs" />
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px] max-w-xs truncate">
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

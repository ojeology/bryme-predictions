import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { OFFICIAL_3X_ROLLOVER } from '../data/fridayRolloverAndVaultData';
import {
  Trophy, Shield, Flame, Check,
  ArrowRight, Clock, Lock
} from 'lucide-react';

export const LADDER_18_STEPS = [
  {
    step: 1,
    stake: 1000,
    odds: 3.036,
    returnVal: 3036,
    status: 'active',
    match: 'LIVE TONIGHT (22Bet 6-Leg Pure OVER): Malmö O2.5 C (1.12) × GA Eagles O4.5 C (1.20) × Valladolid O1.5 YC (1.24) × Stuttgart Fouls O18.5 (1.31) × Vicenza O2.5 C (1.15) × Monza O2.5 C (1.21)',
    score: 'DAY 1 LIVE'
  },
  {
    step: 2,
    stake: 3036,
    odds: 3.00,
    returnVal: 9108,
    status: 'upcoming',
    match: 'Day 2 — Saturday 24 Oct Top-5 & European Pure OVER 3.00x Specialist Slip (90%–100% Two-Team Floors Only)',
    score: 'Next'
  },
  {
    step: 3,
    stake: 9108,
    odds: 3.00,
    returnVal: 27324,
    status: 'upcoming',
    match: 'Day 3 — Sunday 25 Oct Pure OVER 3.00x Specialist Slip (27.3x Initial Stake Reached)',
    score: 'Target'
  },
  {
    step: 4,
    stake: 27324,
    odds: 3.00,
    returnVal: 81972,
    status: 'milestone',
    isSafeHaven: true,
    isSummit: true,
    safeHavenNum: 1,
    takeProfitAmount: 81972,
    rollAmount: 5000,
    match: 'DAY 4 MONTHLY GOAL REACHED — ₦81,972 PAYOUT (Covers Entire ₦30,000 Monthly Budget + ₦51,972 Net Profit!)',
    score: 'MONTHLY GOAL',
    takeProfitLabel: '₦81,972 PRIMARY GOAL (+₦51,972 NET PROFIT)',
    takeProfitDesc: '1 single 4-win streak out of 30 days covers 30 × ₦1,000 stakes (₦30,000) AND locks +₦51,972 guaranteed profit!'
  },
  {
    step: 5,
    stake: 81972,
    odds: 3.00,
    returnVal: 245916,
    status: 'upcoming',
    match: 'Optional Step 5 Extension — Quarter-Million Pure OVER Compounding Step',
    score: 'Bonus Step 5'
  },
  {
    step: 6,
    stake: 245916,
    odds: 3.00,
    returnVal: 737748,
    status: 'summit',
    isSummit: true,
    takeProfitAmount: 737748,
    match: 'Optional Step 6 Extension — ₦737,748 High-Water Summit (737.7x Starting Stake)',
    score: 'BONUS SUMMIT'
  }
];

export default function VisibleLadder({ onNavigate }) {
  const { ladder } = usePredictions();
  const currentStep = ladder?.currentDay || 1;
  const currentPot = ladder?.currentBalance || 1000;
  const dailyOdds = ladder?.dailyOdds || 3.036;
  const [slipTab, setSlipTab] = useState('22bet');
  const [filterView, setFilterView] = useState('core4');

  const wonStepsCount = Math.max(0, currentStep - 1);
  const visibleSteps = filterView === 'core4' ? LADDER_18_STEPS.slice(0, 4) : LADDER_18_STEPS;

  return (
    <div className="space-y-4">

      {/* ── 1. OFFICIAL 3.036x PURE OVER ROLLOVER HERO ── */}
      <div className="rounded-2xl border-2 border-emerald-500 bg-[#0A0F1D] text-white overflow-hidden shadow-2xl relative">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 text-white font-display font-black text-xs uppercase tracking-wider border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
              OFFICIAL 3.00x PURE OVER ROLLOVER &bull; DAY 1 LOCKED ON 22BET
            </span>
            <span className="px-2.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono font-black text-xs border border-amber-400/30">
              STEP {currentStep} OF 4 (3.036x TONIGHT)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/95">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Kickoffs: <strong>18:00–19:45 WAT</strong> &bull; Zero Unders &bull; Zero Goal Bets</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                ₦1,000 &rarr; ₦3,036 &rarr; ₦9,108 &rarr; ₦27,324 &rarr; ₦81,972
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                <strong className="text-emerald-400">Why 4 Steps at ~3.00x Beats 10 Steps at 2.00x:</strong> Just <strong>4 consecutive wins</strong> turn ₦1,000 into <strong className="text-white">₦81,972</strong> — covering an entire 30-day month of ₦1,000 tries (₦30,000) PLUS <strong className="text-amber-300">+₦51,972 net profit</strong>! Every leg is strictly <strong>OVER</strong> (90%–100% Two-Team Floor) verified against real <strong>22Bet</strong> &amp; <strong>SportyBet</strong> lines.
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  ✅ 6 Events Locked @ 3.036x (22Bet)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  🔥 Alt 4-Leg SportyBet @ 3.17x
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  🛡️ Every Leg 90%–100% Floor
                </span>
              </div>
            </div>

            <div className="bg-black/60 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex-shrink-0 flex flex-col justify-between gap-2.5 lg:min-w-[270px]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-bold">
                  Day {currentStep} Placed Stake (22Bet)
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight mt-0.5">
                  ₦{currentPot.toLocaleString()}
                </div>
                <div className="text-[11px] font-mono text-emerald-300 mt-0.5">
                  Combined Live Odds: <strong>{dailyOdds}x</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Tonight&apos;s Return:</span>
                <span className="font-black text-[#00FF66] bg-[#00FF66]/10 px-2.5 py-1 rounded border border-[#00FF66]/30 text-sm">
                  ₦{Math.round(currentPot * dailyOdds).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ── LIVE PLACED DAY 1 SLIP TABLE (22BET 3.036x vs SPORTYBET 3.17x) ── */}
          <div className="rounded-2xl bg-[#070B16] border border-slate-800 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setSlipTab('22bet')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all ${
                    slipTab === '22bet'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  🟢 Official Placed 22Bet Slip (6 Legs &bull; 3.036x)
                </button>
                <button
                  onClick={() => setSlipTab('sporty')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase transition-all ${
                    slipTab === 'sporty'
                      ? 'bg-[#E41B13] text-white shadow-md'
                      : 'bg-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  🔴 SportyBet 4-Leg Alternative (3.17x)
                </button>
              </div>

              <button
                onClick={() => onNavigate('friday')}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>Inspect Full 2-Team Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {slipTab === '22bet' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-mono">
                {OFFICIAL_3X_ROLLOVER.day1Ticket22Bet.legs.map((leg) => (
                  <div key={leg.num} className="p-3 rounded-xl bg-[#0E1626] border border-emerald-500/25 flex flex-col justify-between gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          #{leg.num} &bull; {leg.kickoff} &bull; {leg.league}
                        </span>
                        <strong className="font-display font-black text-sm text-white">{leg.match}</strong>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-xs flex-shrink-0">
                        {leg.odds.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-amber-300 font-bold">{leg.betSlipLabel}</div>
                    <div className="text-[11px] text-emerald-300">
                      Model: <strong>{leg.modelProj}</strong> &bull; {leg.twoSided}
                    </div>
                    <div className="text-[10px] text-slate-400">{leg.teamFloor} | {leg.oppFloor}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                {OFFICIAL_3X_ROLLOVER.altSportyBetSlip.legs.map((txt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0E1626] border border-rose-500/30 text-white font-bold">
                    #{idx + 1} &bull; {txt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. THE 4-STEP (PLUS OPTIONAL STEPS 5–6) ROLLOVER PROGRESSION ── */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
              4-Step Monthly Profit Rollover Board (₦1,000 &rarr; ₦81,972)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              4 consecutive ~3.00x Pure OVER wins = 81.97x bankroll growth &bull; Auto-graded tonight at 21:45 WAT
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterView('core4')}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all ${
                filterView === 'core4'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-300'
              }`}
            >
              Core 4 Steps (₦81,972)
            </button>
            <button
              onClick={() => setFilterView('all6')}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all ${
                filterView === 'all6'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-slate-100 dark:bg-[#162238] text-amber-500 dark:text-amber-300'
              }`}
            >
              + Bonus Steps 5–6 (₦737K)
            </button>
          </div>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-300 font-bold">4-Win Monthly Target Progress:</span>
            <span className="text-emerald-500 font-black">
              Step {currentStep}/4 Live Tonight ({wonStepsCount} Settled)
            </span>
          </div>
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {[1, 2, 3, 4].map((stepNum) => {
              const isWon = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              return (
                <div
                  key={stepNum}
                  className={`flex-1 border-r border-black/20 ${
                    isWon ? 'bg-emerald-500' : isActive ? 'bg-amber-400 animate-pulse' : 'bg-slate-700/40'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
            <span>Step 1: ₦3,036</span>
            <span>Step 2: ₦9,108</span>
            <span>Step 3: ₦27,324</span>
            <span className="text-emerald-400 font-bold">🏆 Step 4 Goal: ₦81,972</span>
          </div>
        </div>

        {/* Step Cards */}
        <div className="space-y-2.5">
          {visibleSteps.map((step) => {
            const isWon = step.step < currentStep;
            const isActive = step.step === currentStep;
            return (
              <div
                key={step.step}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-emerald-950/30 border-2 border-emerald-500 shadow-md'
                    : step.step === 4
                    ? 'bg-amber-950/20 border border-amber-400/50'
                    : 'bg-white dark:bg-[#101726] border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs flex-shrink-0 ${
                    isWon ? 'bg-emerald-500 text-slate-950' : isActive ? 'bg-emerald-500 text-slate-950 animate-pulse' : step.step === 4 ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isWon ? <Check className="w-5 h-5 stroke-[3]" /> : `S${step.step}`}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                        STEP {step.step} ({step.odds}x Pure OVER)
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-950 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          <span>PLACED &amp; LIVE TONIGHT</span>
                        </span>
                      )}
                      {step.isSafeHaven && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>FULL MONTH COVERED + ₦51,972 PROFIT</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{step.match}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 font-mono flex-shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] text-slate-400 uppercase">Stake &rarr; Return</div>
                    <div className="text-xs sm:text-sm">
                      <span className="text-slate-400">₦{step.stake.toLocaleString()}</span>
                      <span className="mx-1 text-slate-500">&rarr;</span>
                      <strong className="text-emerald-400 font-black">₦{step.returnVal.toLocaleString()}</strong>
                    </div>
                  </div>
                  {!isActive && !isWon && (
                    <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

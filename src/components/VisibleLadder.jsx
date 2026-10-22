import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { 
  Trophy, Shield, Flame, Copy, Check, 
  ArrowRight, Clock, Lock
} from 'lucide-react';

export const LADDER_18_STEPS = [
  // STAGE 1: FOUNDATION (Steps 1-3)
  { 
    step: 1, 
    stake: 1000, 
    odds: 2.00, 
    returnVal: 2000, 
    status: 'active', 
    match: 'Ajax vs Atalanta (Fouls U25.5) + Thun vs Hajduk (Fouls O21.5) + Bournemouth vs Milan (Fouls O20.5)', 
    score: 'DAY 1 LIVE' 
  },
  { step: 2, stake: 2000, odds: 2.00, returnVal: 4000, status: 'upcoming', match: 'Day 2 Two-Team Behaviour 2.00x Lock (Top-5 Leagues)', score: 'Next' },
  { step: 3, stake: 4000, odds: 2.00, returnVal: 8000, status: 'upcoming', match: 'Day 3 Weekend Top-5 Behaviour 2.00x Double', score: 'Target' },
  
  // SAFE HAVEN 1: STEP 4
  { 
    step: 4, 
    stake: 8000, 
    odds: 2.00, 
    returnVal: 16000, 
    status: 'milestone',
    isSafeHaven: true,
    safeHavenNum: 1,
    takeProfitAmount: 8000,
    rollAmount: 8000,
    match: 'Day 4 Safe Haven Milestone (16x Initial Capital)',
    score: 'Milestone #1',
    takeProfitLabel: 'OPTIONAL ₦8,000 SAFE HAVEN LOCK',
    takeProfitDesc: '16x starting capital reached (₦16,000 pot). Option to bank ₦8,000 profit or roll full ₦16,000.'
  },

  // STAGE 2: ACCELERATION (Steps 5-6)
  { step: 5, stake: 16000, odds: 2.00, returnVal: 32000, status: 'upcoming', match: 'Day 5 Two-Team Behaviour 2.00x Builder', score: 'Target' },
  { step: 6, stake: 32000, odds: 2.00, returnVal: 64000, status: 'upcoming', match: 'Day 6 European / Top-5 Behaviour 2.00x Lock', score: 'Target' },

  // SAFE HAVEN 2: STEP 7
  { 
    step: 7, 
    stake: 64000, 
    odds: 2.00, 
    returnVal: 128000, 
    status: 'milestone',
    isSafeHaven: true,
    safeHavenNum: 2,
    takeProfitAmount: 64000,
    rollAmount: 64000,
    match: 'Day 7 Major Capital Lock (128x Starting Stake)',
    score: 'Milestone #2',
    takeProfitLabel: 'OPTIONAL ₦64,000 SAFE HAVEN LOCK',
    takeProfitDesc: '128x initial capital reached (₦128,000 pot). Bank 50% or continue the pure 2.00x doubling run.'
  },

  // STAGE 3: THE SUMMIT RUSH (Steps 8-9)
  { step: 8, stake: 128000, odds: 2.00, returnVal: 256000, status: 'upcoming', match: 'Day 8 Quarter-Million 2.00x Behaviour Lock', score: 'Target' },
  { step: 9, stake: 256000, odds: 2.00, returnVal: 512000, status: 'upcoming', match: 'Day 9 Half-Million Penultimate 2.00x Lock', score: 'Target' },

  // THE ULTIMATE GOAL: STEP 10
  { 
    step: 10, 
    stake: 512000, 
    odds: 2.00, 
    returnVal: 1024000, 
    status: 'summit',
    isSummit: true,
    match: 'Day 10 Summit Finale — ₦1,024,000 Target Achieved',
    score: 'JACKPOT',
    takeProfitAmount: 1024000,
    takeProfitLabel: '₦1,024,000 JACKPOT PRIZE',
    takeProfitDesc: '10 Consecutive 2.00x Wins Achieved! ₦1,000 multiplied 1,024x into ₦1,024,000.'
  }
];

export default function VisibleLadder({ onNavigate }) {
  const { ladder, triggerCopyModal, adSettings } = usePredictions();
  const currentStep = ladder?.currentDay || 1;
  const currentPot = ladder?.currentBalance || 1000;
  const dailyOdds = ladder?.dailyOdds || 2.00;
  const sportyCode = ladder?.sportyCode || '2X-DAY1';
  const bet9jaCode = ladder?.todaysCode || '2X-DAY1';
  const totalSteps = LADDER_18_STEPS.length; // 10 steps at 2.00x

  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('sporty');
  const [filterView, setFilterView] = useState('all');

  const handleCopy = (code, type) => {
    if (triggerCopyModal) {
      triggerCopyModal(code, type === 'sporty' ? 'SportyBet' : 'Bet9ja', `BRYME 2.00x Challenge Day ${currentStep}`, `${dailyOdds}`);
    } else {
      navigator.clipboard.writeText(code);
    }
    if (type === 'sporty') {
      setCopiedSporty(true);
      setTimeout(() => setCopiedSporty(false), 2000);
    } else {
      setCopiedBet9ja(true);
      setTimeout(() => setCopiedBet9ja(false), 2000);
    }
  };

  const wonStepsCount = Math.max(0, currentStep - 1);

  return (
    <div className="space-y-4">
      
      {/* ── 1. BRYME 2.00x CHALLENGE HERO BANNER ── */}
      <div className="rounded-2xl border-2 border-[#E41B13] bg-[#0A0F1D] text-white overflow-hidden shadow-2xl relative">
        
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#E41B13]/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#D81A12] via-[#E41B13] to-[#990A04] px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 text-white font-display font-black text-xs uppercase tracking-wider border border-white/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
              FRESH RESET &bull; 2.00x ODDS CHALLENGE
            </span>
            <span className="px-2.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono font-black text-xs border border-amber-400/30">
              DAY {currentStep} OF {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/90">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Powered by <strong>Two-Team Behaviour Machine</strong></span>
          </div>
        </div>

        {/* Main Hero Body */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Core Concept */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">🪜</span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white tracking-tight">
                  BRYME 2.00x Odds Ladder Challenge
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                <strong className="text-white">₦1,000 Starting Stake &rarr; ₦1,024,000 Target Pot in 10 Steps.</strong> Reset fresh to Day 1 using strictly verified <strong>2.00x Two-Team Behaviour Locks</strong> (Fouls, Corners, Cards &amp; Goals where both teams agree 100%).
              </p>

              {/* Progress Summary Pills */}
              <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{wonStepsCount} Wins Locked</span>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-[#E41B13]/20 text-rose-300 border border-[#E41B13]/30 flex items-center gap-1.5 font-bold">
                  <Flame className="w-3.5 h-3.5 text-[#E41B13] animate-pulse" />
                  <span>Day {currentStep} Live Today (2.00x Target)</span>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-bold">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>10 Steps to ₦1.024M</span>
                </span>
              </div>
            </div>

            {/* Scoreboard Widget */}
            <div className="bg-black/60 border border-white/15 rounded-2xl p-4 sm:p-5 flex-shrink-0 flex flex-col justify-between gap-3 shadow-inner lg:min-w-[260px]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-bold">
                  Active Bankroll (Day {currentStep})
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight mt-0.5">
                  ₦{currentPot.toLocaleString()}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Fresh Reset at ₦1,000 on Day 1
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Day {currentStep} Payout (2.00x):</span>
                <span className="font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
                  ₦{Math.round(currentPot * 2).toLocaleString()}
                </span>
              </div>
            </div>

          </div>

          {/* ── TODAY'S SELECTION SPOTLIGHT ── */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black text-[10px] uppercase">
                  Today&apos;s Day {currentStep} 2-Team Lock
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  Target Odds: 2.00x (2.31x Builder)
                </span>
              </div>
              <div className="font-display font-black text-sm sm:text-base text-white">
                {LADDER_18_STEPS.find(s => s.step === currentStep)?.match || 'Ajax vs Atalanta (Fouls U25.5) + Thun vs Hajduk (Fouls O21.5) + Bournemouth vs Milan (Fouls O20.5)'}
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Current Stake: <strong>₦{currentPot.toLocaleString()}</strong> &rarr; Day {currentStep} Return: <strong>₦{Math.round(currentPot * 2).toLocaleString()}+</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onNavigate('machine')}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <span>Open 2-Team Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── 2. BRYME ROLLOVER 1-TAP BOOKING CODE BAR ── */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 hidden sm:inline">
                Today&apos;s Day {currentStep} Slip:
              </span>

              <button
                onClick={() => setActiveCodeTab('sporty')}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeCodeTab === 'sporty'
                    ? 'bg-[#E41B13] text-white shadow-md'
                    : 'bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>🔴 SportyBet</span>
              </button>

              <button
                onClick={() => setActiveCodeTab('bet9ja')}
                className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeCodeTab === 'bet9ja'
                    ? 'bg-[#00C250] text-black shadow-md'
                    : 'bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span>🟢 Bet9ja / 22Bet</span>
              </button>

              <div className="font-mono font-black text-sm px-3 py-1.5 rounded-xl bg-black border border-white/20 text-amber-300 tracking-wider">
                {activeCodeTab === 'sporty' ? sportyCode : bet9jaCode}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handleCopy(activeCodeTab === 'sporty' ? sportyCode : bet9jaCode, activeCodeTab)}
                className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
                  (activeCodeTab === 'sporty' ? copiedSporty : copiedBet9ja)
                    ? 'bg-[#00FF66] text-black font-black'
                    : activeCodeTab === 'sporty'
                    ? 'bg-[#E41B13] hover:bg-[#D01710] text-white'
                    : 'bg-[#00C250] hover:bg-[#00B048] text-black font-bold'
                }`}
              >
                {(activeCodeTab === 'sporty' ? copiedSporty : copiedBet9ja) ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Day {currentStep} Slip</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onNavigate('ticket/ticket-ladder-challenge')}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-display font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <span>Full Slip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── 3. THE COMPLETE 10-STEP 2.00x DOUBLER BOARD ── */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
                The 10-Step 2.00x Doubler Board (₦1,000 &rarr; ₦1,024,000)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every daily 2.00x step doubles your pot &bull; Reset Fresh at Day 1
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterView('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all ${
                filterView === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162238] text-slate-600 dark:text-slate-400'
              }`}
            >
              All 10 Steps
            </button>
            <button
              onClick={() => setFilterView('safehavens')}
              className={`px-3 py-1.5 rounded-xl text-xs font-display font-bold uppercase transition-all flex items-center gap-1.5 ${
                filterView === 'safehavens'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-100 dark:bg-[#162238] text-amber-600 dark:text-amber-400'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Milestones Only</span>
            </button>
          </div>
        </div>

        {/* ── 10-STEP PROGRESS METER ── */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400 font-bold">10 Consecutive 2.00x Wins Goal:</span>
            <span className="text-[#E41B13] dark:text-rose-400 font-black">
              Day {currentStep} Active &bull; {((wonStepsCount / totalSteps) * 100).toFixed(0)}% Done
            </span>
          </div>

          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const stepNum = idx + 1;
              const isWon = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              const isMilestone = stepNum === 4 || stepNum === 7;
              const isSummit = stepNum === 10;

              return (
                <div
                  key={idx}
                  className={`flex-1 border-r border-black/20 transition-all ${
                    isWon
                      ? 'bg-emerald-500'
                      : isActive
                      ? 'bg-[#E41B13] animate-pulse'
                      : isMilestone
                      ? 'bg-amber-400/50'
                      : isSummit
                      ? 'bg-yellow-400/40'
                      : 'bg-transparent'
                  }`}
                  title={`Day ${stepNum}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
            <span>₦1,000 (Day 1)</span>
            <span className="text-amber-500 font-bold">🛡️ Day 4: ₦16,000</span>
            <span className="text-amber-500 font-bold">🛡️ Day 7: ₦128,000</span>
            <span className="text-[#00C250] font-bold">🏆 Day 10: ₦1,024,000</span>
          </div>
        </div>

        {/* ── 10 STEPS LIST & CARDS ── */}
        <div className="space-y-2.5">
          {LADDER_18_STEPS.map((step) => {
            const isWon = step.step < currentStep;
            const isActive = step.step === currentStep;

            if (filterView === 'safehavens' && !step.isSafeHaven && !step.isSummit) {
              return null;
            }

            return (
              <div
                key={step.step}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-rose-50/80 dark:bg-[#181D2E] border-2 border-[#E41B13] shadow-md ring-2 ring-red-500/20'
                    : isWon
                    ? 'bg-emerald-50/50 dark:bg-[#0B151F] border-emerald-500/30'
                    : step.isSafeHaven
                    ? 'bg-amber-50/50 dark:bg-[#161C26] border-amber-500/40'
                    : step.isSummit
                    ? 'bg-yellow-50/50 dark:bg-[#1B1B26] border-yellow-500/40'
                    : 'bg-white dark:bg-[#101726] border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs flex-shrink-0 ${
                      isWon
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : isActive
                        ? 'bg-[#E41B13] text-white shadow-md animate-pulse'
                        : step.isSafeHaven
                        ? 'bg-amber-500 text-slate-950'
                        : step.isSummit
                        ? 'bg-yellow-400 text-slate-950 font-black'
                        : 'bg-slate-100 dark:bg-[#1A2438] text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isWon ? <Check className="w-5 h-5 stroke-[3]" /> : step.step < 10 ? `0${step.step}` : step.step}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                        DAY {step.step} (2.00x)
                      </span>

                      {isWon && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>WON &bull; {step.score}</span>
                        </span>
                      )}

                      {isActive && (
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#E41B13] text-white flex items-center gap-1 shadow-sm">
                          <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
                          <span>DAY 1 LIVE SELECTION</span>
                        </span>
                      )}

                      {step.isSafeHaven && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>Milestone #{step.safeHavenNum}</span>
                        </span>
                      )}

                      {step.isSummit && (
                        <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-yellow-400 text-slate-950 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>₦1.024M SUMMIT</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-2">
                      <span>{step.match}</span>
                      <span className="text-slate-400 font-mono text-[11px]">&bull; {step.odds.toFixed(2)}x Odds</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-[10px] text-slate-400 uppercase">
                      Stake &rarr; Payout
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm">
                      <span className="text-slate-500">₦{step.stake.toLocaleString()}</span>
                      <span className="text-slate-400">&rarr;</span>
                      <strong className={`font-black ${
                        isActive 
                          ? 'text-[#E41B13] dark:text-rose-400 text-sm sm:text-base' 
                          : isWon 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        ₦{step.returnVal.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {isActive ? (
                    <button
                      onClick={() => onNavigate('machine')}
                      className="px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1 transition-all bg-[#E41B13] hover:bg-[#D01710] text-white shadow-md"
                    >
                      <span>View 2-Team Picks</span>
                    </button>
                  ) : isWon ? (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#162238] text-slate-400 flex items-center justify-center">
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

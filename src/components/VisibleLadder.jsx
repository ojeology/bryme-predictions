import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { 
  Trophy, Shield, CheckCircle2, Flame, Copy, Check, 
  ArrowRight, Sparkles, Zap, Clock, ChevronRight, Lock, DollarSign, Wallet
} from 'lucide-react';

export const LADDER_18_STEPS = [
  // STAGE 1: FOUNDATION (Steps 1-5)
  { step: 1, stake: 1000, odds: 1.50, returnVal: 1500, status: 'won', match: 'Man City vs Fulham (Home Win & O1.5)', score: '3-0 FT' },
  { step: 2, stake: 1500, odds: 1.50, returnVal: 2250, status: 'won', match: 'Inter vs Torino (Over 1.5 Goals)', score: '2-1 FT' },
  { step: 3, stake: 2250, odds: 1.50, returnVal: 3375, status: 'won', match: 'Real Madrid vs Celta (1X & Over 1.5 Goals)', score: '2-0 FT' },
  { step: 4, stake: 3375, odds: 1.50, returnVal: 5062, status: 'active', match: 'Arsenal vs Everton + Bayern vs Stuttgart', score: 'TODAY' },
  { step: 5, stake: 5062, odds: 1.50, returnVal: 7593, status: 'upcoming', match: 'Sunday European Banker Slip', score: 'Next' },
  
  // SAFE HAVEN 1: STEP 6
  { 
    step: 6, 
    stake: 7593, 
    odds: 1.50, 
    returnVal: 11390, 
    status: 'milestone',
    isSafeHaven: true,
    safeHavenNum: 1,
    takeProfitAmount: 5695,
    rollAmount: 5695,
    takeProfitLabel: 'TAKE ₦5,695 CASH OUT',
    takeProfitDesc: 'Initial ₦1,000 stake + ₦4,695 pure profit secured in bank. Roll remainder 100% risk-free.'
  },

  // STAGE 2: COMPOUNDING (Steps 7-11)
  { step: 7, stake: 5695, odds: 1.50, returnVal: 8542, status: 'upcoming', match: 'Midweek UCL / Europa Banker', score: 'Target' },
  { step: 8, stake: 8542, odds: 1.50, returnVal: 12813, status: 'upcoming', match: 'Midweek Selection', score: 'Target' },
  { step: 9, stake: 12813, odds: 1.50, returnVal: 19220, status: 'upcoming', match: 'Weekend Feature Slip', score: 'Target' },
  { step: 10, stake: 19220, odds: 1.50, returnVal: 28830, status: 'upcoming', match: 'Weekend Feature Slip', score: 'Target' },
  { step: 11, stake: 28830, odds: 1.50, returnVal: 43245, status: 'upcoming', match: 'European Banker Slip', score: 'Target' },

  // SAFE HAVEN 2: STEP 12
  { 
    step: 12, 
    stake: 43245, 
    odds: 1.50, 
    returnVal: 64868, 
    status: 'milestone',
    isSafeHaven: true,
    safeHavenNum: 2,
    takeProfitAmount: 32434,
    rollAmount: 32434,
    takeProfitLabel: 'TAKE ₦32,434 CASH OUT',
    takeProfitDesc: '32x initial capital banked safely. Final 6 steps rolled on 100% house profit.'
  },

  // STAGE 3: THE SUMMIT RUSH (Steps 13-17)
  { step: 13, stake: 32434, odds: 1.50, returnVal: 48651, status: 'upcoming', match: 'Championship / Top Flights', score: 'Target' },
  { step: 14, stake: 48651, odds: 1.50, returnVal: 72976, status: 'upcoming', match: 'Weekend Mega Slips', score: 'Target' },
  { step: 15, stake: 72976, odds: 1.50, returnVal: 109464, status: 'upcoming', match: 'Midweek Banker', score: 'Target' },
  { step: 16, stake: 109464, odds: 1.50, returnVal: 164196, status: 'upcoming', match: 'Top Flight Derby', score: 'Target' },
  { step: 17, stake: 164196, odds: 1.50, returnVal: 246294, status: 'upcoming', match: 'Penultimate Semi-Final', score: 'Target' },

  // THE ULTIMATE GOAL: STEP 18
  { 
    step: 18, 
    stake: 246294, 
    odds: 1.50, 
    returnVal: 1000000, 
    status: 'summit',
    isSummit: true,
    takeProfitAmount: 1000000,
    takeProfitLabel: '₦1,000,000+ JACKPOT PRIZE',
    takeProfitDesc: '18 Consecutive Wins Achieved! Total Payout Delivered.'
  }
];

export default function VisibleLadder({ onNavigate }) {
  const { ladder, triggerCopyModal, adSettings } = usePredictions();
  const currentStep = ladder?.currentDay || 4;
  const currentPot = ladder?.currentBalance || 3375;
  const sportyCode = ladder?.sportyCode || 'Q7S287';
  const bet9jaCode = ladder?.todaysCode || 'Q7S287';

  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('sporty'); // 'sporty' | 'bet9ja'
  const [filterView, setFilterView] = useState('all'); // 'all' | 'safehavens'

  const handleCopy = (code, type) => {
    if (triggerCopyModal) {
      triggerCopyModal(code, type === 'sporty' ? 'SportyBet' : 'Bet9ja', `BRYME Rollover Step ${currentStep}`, '1.50');
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

  const wonStepsCount = currentStep - 1;

  return (
    <div className="space-y-4">
      
      {/* ── 1. BRYME ROLLOVER HERO BANNER ── */}
      <div className="rounded-2xl border-2 border-[#E41B13] bg-[#0A0F1D] text-white overflow-hidden shadow-2xl relative">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#E41B13]/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#D81A12] via-[#E41B13] to-[#990A04] px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 text-white font-display font-black text-xs uppercase tracking-wider border border-white/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
              BRYME ROLLOVER &bull; RUN #50
            </span>
            <span className="px-2.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono font-black text-xs border border-amber-400/30">
              STEP {currentStep} OF 18
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/90">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Codes Drop Daily at <strong>02:00 AM WAT</strong></span>
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
                  BRYME 18-Step Rollover Challenge
                </h1>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                <strong className="text-white">₦1,000 Starting Stake &rarr; ₦1,000,000 Target Pot.</strong> 18 consecutive 1.50x banker wins with 2 built-in <strong>Safe Haven Cashouts</strong> at Step 6 and Step 12 so you secure real profit into your pocket along the journey.
              </p>

              {/* Progress Summary Pills */}
              <div className="flex items-center gap-2 pt-1 flex-wrap text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{wonStepsCount} Wins Locked</span>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-[#E41B13]/20 text-rose-300 border border-[#E41B13]/30 flex items-center gap-1.5 font-bold">
                  <Flame className="w-3.5 h-3.5 text-[#E41B13] animate-pulse" />
                  <span>Step {currentStep} In Play Today</span>
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-bold">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>2 Profit Lock Milestones</span>
                </span>
              </div>
            </div>

            {/* Scoreboard Widget */}
            <div className="bg-black/60 border border-white/15 rounded-2xl p-4 sm:p-5 flex-shrink-0 flex flex-col justify-between gap-3 shadow-inner lg:min-w-[260px]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-bold">
                  Active Bankroll (Pot)
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight mt-0.5">
                  ₦{currentPot.toLocaleString()}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Started at ₦1,000 on Step 1
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Step {currentStep} Target:</span>
                <span className="font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
                  ₦{Math.round(currentPot * 1.5).toLocaleString()}
                </span>
              </div>
            </div>

          </div>

          {/* ── TODAY'S SELECTION SPOTLIGHT ── */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black text-[10px] uppercase">
                  Today's Step {currentStep} Pick
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  Target Odds: 1.50x
                </span>
              </div>
              <div className="font-display font-black text-sm sm:text-base text-white">
                {LADDER_18_STEPS.find(s => s.step === currentStep)?.match || 'Arsenal vs Everton + Bayern vs Stuttgart (Over 1.5 Goals & DC)'}
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                Current Pot Stake: <strong>₦{currentPot.toLocaleString()}</strong> &rarr; Target Return: <strong>₦{Math.round(currentPot * 1.5).toLocaleString()}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={adSettings?.sportyAffiliateUrl || 'https://www.sportybet.com/ng/'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#E41B13] hover:bg-[#D01710] text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <span>Load on SportyBet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* ── 2. BRYME ROLLOVER 1-TAP BOOKING CODE BAR ── */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 rounded-xl p-3 sm:p-4">
            
            {/* Bookmaker Tabs */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 hidden sm:inline">
                Today's Step {currentStep} Code:
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
                <span>🟢 Bet9ja</span>
              </button>

              {/* Code string */}
              <div className="font-mono font-black text-sm px-3 py-1.5 rounded-xl bg-black border border-white/20 text-amber-300 tracking-wider">
                {activeCodeTab === 'sporty' ? sportyCode : bet9jaCode}
              </div>
            </div>

            {/* Action buttons */}
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
                    <span>Copied! Ready to Paste</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy {activeCodeTab === 'sporty' ? 'SportyBet' : 'Bet9ja'} Code</span>
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

      {/* ── 3. THE COMPLETE 18-PLACE LADDER BOARD ── */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        {/* Board Header & Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-ping" />
              <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
                The 18-Step Consecutive Wins Board
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every step from ₦1,000 stake to ₦1,000,000 Jackpot Crown &bull; With 2 Take-Profit Safe Havens
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
              All 18 Steps
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
              <span>Safe Havens Only</span>
            </button>
          </div>
        </div>

        {/* ── 18-STEP PROGRESS METER ── */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400 font-bold">18 Consecutive Wins Goal:</span>
            <span className="text-[#E41B13] dark:text-rose-400 font-black">
              Step {currentStep} Active &bull; {((wonStepsCount / 18) * 100).toFixed(0)}% Done
            </span>
          </div>

          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {Array.from({ length: 18 }).map((_, idx) => {
              const stepNum = idx + 1;
              const isWon = stepNum < currentStep;
              const isActive = stepNum === currentStep;
              const isMilestone = stepNum === 6 || stepNum === 12;
              const isSummit = stepNum === 18;

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
                  title={`Step ${stepNum}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
            <span>₦1,000 (Day 1)</span>
            <span className="text-amber-500 font-bold">🛡️ Step 6: Bank ₦5.6K</span>
            <span className="text-amber-500 font-bold">🛡️ Step 12: Bank ₦32.4K</span>
            <span className="text-[#00C250] font-bold">🏆 Step 18: ₦1,000,000</span>
          </div>
        </div>

        {/* ── 18 STEPS LIST & CARDS ── */}
        <div className="space-y-2.5">
          {LADDER_18_STEPS.map((step) => {
            const isWon = step.step < currentStep;
            const isActive = step.step === currentStep;
            const isUpcoming = step.step > currentStep;

            if (filterView === 'safehavens' && !step.isSafeHaven && !step.isSummit) {
              return null;
            }

            return (
              <React.Fragment key={step.step}>
                
                {/* SAFE HAVEN CALLOUT HEADER BANNER (SEPARATING STAGES) */}
                {step.step === 6 && (
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border-2 border-amber-500/40 my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        🛡️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-display font-black text-amber-500 uppercase tracking-wider">
                            SAFE HAVEN #1 &bull; CASH OUT MILESTONE
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                            5.7x PROFIT SECURED
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                          <strong>Take ₦5,695 pure cash out</strong> straight to your bank! Recover your starting ₦1,000 + ₦4,695 profit. Roll remainder risk-free.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 self-start sm:self-auto">
                      Bank: ₦5,695 Cash
                    </span>
                  </div>
                )}

                {step.step === 12 && (
                  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border-2 border-amber-500/40 my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        🛡️
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-display font-black text-amber-500 uppercase tracking-wider">
                            SAFE HAVEN #2 &bull; HUGE CAPITAL LOCK
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-bold">
                            32x CAPITAL BANKED
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                          <strong>Take ₦32,434 cash out</strong> to your bank account! You have banked 32x your initial capital. The final 6 steps roll completely on house profit!
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 self-start sm:self-auto">
                      Bank: ₦32,434 Cash
                    </span>
                  </div>
                )}

                {step.step === 18 && (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-yellow-500/15 to-transparent border-2 border-yellow-500/50 my-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-lg flex-shrink-0 shadow-md">
                        🏆
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-display font-black text-yellow-500 dark:text-yellow-400 uppercase tracking-wider">
                            STEP 18 &bull; THE SUMMIT JACKPOT
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
                            18 WINS GOAL
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                          18 consecutive wins completed! Full <strong>₦1,000,000+ payout</strong> achieved from a single ₦1,000 starting stake.
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-mono font-black text-[#00FF66] bg-black/60 px-3 py-1.5 rounded-xl border border-emerald-500/40 self-start sm:self-auto">
                      ₦1,000,000+
                    </span>
                  </div>
                )}

                {/* THE INDIVIDUAL STEP ROW */}
                <div
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
                  {/* Left: Step indicator, Name, and Match */}
                  <div className="flex items-center gap-3">
                    
                    {/* Step Number Badge */}
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
                          STEP {step.step}
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
                            <span>TODAY'S SELECTION</span>
                          </span>
                        )}

                        {step.isSafeHaven && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            <span>Safe Haven #{step.safeHavenNum}</span>
                          </span>
                        )}

                        {step.isSummit && (
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-yellow-400 text-slate-950 flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            <span>JACKPOT GOAL</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-2">
                        <span>{step.match || 'Selected European Banker'}</span>
                        <span className="text-slate-400 font-mono text-[11px]">&bull; {step.odds.toFixed(2)}x Odds</span>
                      </div>
                    </div>

                  </div>

                  {/* Right: Stake & Return Values */}
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

                    {/* Active Step Quick Action Button */}
                    {isActive ? (
                      <button
                        onClick={() => handleCopy(sportyCode, 'sporty')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                          copiedSporty
                            ? 'bg-[#00FF66] text-black'
                            : 'bg-[#E41B13] hover:bg-[#D01710] text-white shadow-md'
                        }`}
                      >
                        {copiedSporty ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Code</span>
                          </>
                        )}
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

              </React.Fragment>
            );
          })}
        </div>

        {/* Board Bottom Footer */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121B2F] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>Strict Capital Protection: Start with ₦1,000 once. Bank profits at Step 6 &amp; Step 12. Never chase losses.</span>
          </div>

          <button
            onClick={() => onNavigate('ticket/ticket-ladder-challenge')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-display font-black uppercase tracking-wider text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <span>View Today's Match Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}

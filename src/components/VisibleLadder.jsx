import React, { useState } from 'react';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import { 
  Trophy, Shield, CheckCircle2, Flame, Copy, Check, 
  ArrowRight, AlertTriangle, Sparkles, ChevronDown, ChevronUp, Zap, HelpCircle
} from 'lucide-react';

const LADDER_STEPS = [
  { step: 18, stake: 492591, odds: 1.50, payout: 1000000, title: '₦1,000,000 SUMMIT', isPeak: true },
  { step: 17, stake: 328394, odds: 1.50, payout: 492591, title: 'Step 17 Final Push' },
  { step: 16, stake: 218929, odds: 1.50, payout: 328394, title: 'Step 16 Upper Ascent' },
  { step: 15, stake: 145953, odds: 1.50, payout: 218929, title: 'Step 15 Major Threshold' },
  { step: 14, stake: 97302, odds: 1.50, payout: 145953, title: 'Step 14 6-Figure Level' },
  { step: 13, stake: 64868, odds: 1.50, payout: 97302, title: 'Step 13 Challenger' },
  { step: 12, stake: 43245, odds: 1.50, payout: 64868, title: 'Step 12 Checkpoint' },
  { step: 11, stake: 28830, odds: 1.50, payout: 43245, title: 'Step 11 Upper Tier' },
  { step: 10, stake: 19220, odds: 1.50, payout: 28830, title: 'Step 10 Double Digits' },
  { step: 9, stake: 12813, odds: 1.50, payout: 19220, title: 'Step 9 Mid Ridge' },
  { step: 8, stake: 8542, odds: 1.50, payout: 12813, title: 'Step 8 Post-Bank' },
  { step: 7, stake: 5695, odds: 1.50, payout: 8542, title: 'Step 7 Rolling Remainder' },
  { step: 6, stake: 7593, odds: 1.50, payout: 11390, title: 'DAY 6: BANK 50% (₦5,695)', isSafeHaven: true },
  { step: 5, stake: 5062, odds: 1.50, payout: 7593, title: 'Step 5 Pre-Milestone' },
  { step: 4, stake: 3375, odds: 1.50, payout: 5062, title: 'Step 4 Breakout' },
  { step: 3, stake: 2250, odds: 1.50, payout: 3375, title: 'ACTIVE TODAY (STEP 3)', isCurrent: true },
  { step: 2, stake: 1500, odds: 1.50, payout: 2250, title: 'Day 2 Passed', isCompleted: true },
  { step: 1, stake: 1000, odds: 1.50, payout: 1500, title: 'Day 1 Launch (₦1,000)', isCompleted: true },
];

export default function VisibleLadder({ onNavigate, showFullInitial = false }) {
  const [showFull, setShowFull] = useState(showFullInitial);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedRung, setSelectedRung] = useState(3);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ACTIVE_CHALLENGE.todaysCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const stepsToRender = showFull 
    ? LADDER_STEPS 
    : LADDER_STEPS.filter(s => s.step <= 7 || s.step === 18);

  return (
    <div className="space-y-4">
      {/* Ladder Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#0A1224] p-4 sm:p-6 shadow-sm dark:shadow-xl transition-colors">
        
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"></div>

        {/* Top Summary Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/[0.08] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-display font-bold text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Challenge #50
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily 1.50 Rollover</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              The 18-Step Rollover Ladder
            </h3>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-slate-50 dark:bg-[#050914] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.08] text-right">
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">Current Purse</span>
              <span className="text-xl font-display font-black text-emerald-600 dark:text-emerald-400">
                ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onNavigate('ladder')}
              className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1"
            >
              <span>Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
              <span>Step 3 of 18 Cleared</span>
              <span className="text-slate-400 dark:text-slate-500">&bull;</span>
              <span className="text-amber-600 dark:text-amber-400 font-medium">Step 6: 50% Bank</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">16.7% to ₦1M Goal</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-500" style={{ width: '16.7%' }}></div>
          </div>
        </div>

        {/* Active Step Highlight Card */}
        <div className="relative mb-5 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-[#0B1C28] dark:to-[#0A1224] p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-display font-black text-[10px] uppercase tracking-wide">
                  Today's Code (Step 3)
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-300 font-mono font-bold">
                  Target Odds: 1.50x
                </span>
              </div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Arsenal 1X &amp; O1.5 + Bayern vs Stuttgart O2.5
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Stake: ₦2,250 &bull; Win advances purse to <strong className="text-emerald-600 dark:text-emerald-300">₦3,375</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center bg-white dark:bg-[#050914] border border-emerald-500/50 rounded-xl px-2.5 py-1.5 text-xs shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono uppercase mr-1.5">Bet9ja:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm tracking-wide">
                  {ACTIVE_CHALLENGE.todaysCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="ml-2 p-1 rounded-md hover:bg-emerald-500 hover:text-slate-950 text-slate-500 dark:text-slate-300 transition-colors"
                  title="Copy booking code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* The Visible Ladder Rungs */}
        <div className="relative max-w-xl mx-auto px-4 sm:px-8 py-2">
          
          {/* Left Vertical Ladder Rail */}
          <div className="absolute left-1 sm:left-4 top-0 bottom-0 w-3 bg-gradient-to-b from-amber-400 via-emerald-500 to-slate-400 dark:to-slate-700 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
          
          {/* Right Vertical Ladder Rail */}
          <div className="absolute right-1 sm:right-4 top-0 bottom-0 w-3 bg-gradient-to-b from-amber-400 via-emerald-500 to-slate-400 dark:to-slate-700 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>

          {/* Rungs */}
          <div className="space-y-2 relative z-10">
            {stepsToRender.map((rung) => {
              const isCurrent = rung.isCurrent;
              const isCompleted = rung.isCompleted;
              const isSafeHaven = rung.isSafeHaven;
              const isPeak = rung.isPeak;

              return (
                <div
                  key={rung.step}
                  onClick={() => setSelectedRung(rung.step)}
                  className={`relative rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 border ${
                    isPeak
                      ? 'bg-amber-50 dark:bg-gradient-to-r dark:from-amber-950/80 dark:via-yellow-900/50 dark:to-amber-950/80 border-amber-400 shadow-sm'
                      : isCurrent
                      ? 'bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-950 dark:via-emerald-900/80 dark:to-emerald-950 border-emerald-500 shadow-md scale-[1.02]'
                      : isSafeHaven
                      ? 'bg-amber-50/70 dark:bg-gradient-to-r dark:from-amber-950/60 dark:via-amber-900/30 dark:to-amber-950/60 border-amber-500/70'
                      : isCompleted
                      ? 'bg-slate-50 dark:bg-[#0A1812] border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-white dark:bg-[#080D1A]/90 border-slate-200 dark:border-white/[0.06] opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Step Pill & Details */}
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs ${
                      isPeak
                        ? 'bg-amber-400 text-slate-950'
                        : isCurrent
                        ? 'bg-emerald-500 text-slate-950 animate-pulse'
                        : isSafeHaven
                        ? 'bg-amber-500 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400'
                    }`}>
                      {rung.step}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-display font-bold text-xs sm:text-sm ${
                          isPeak ? 'text-amber-800 dark:text-amber-300' : isCurrent ? 'text-slate-950 dark:text-white' : isSafeHaven ? 'text-amber-800 dark:text-amber-300' : isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {rung.title}
                        </span>

                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-display font-black text-[9px] uppercase tracking-wider">
                            ACTIVE
                          </span>
                        )}

                        {isSafeHaven && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-display font-black text-[9px] uppercase tracking-wider">
                            50% BANK
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        Stake: ₦{rung.stake.toLocaleString()} &bull; 1.50x odds
                      </span>
                    </div>
                  </div>

                  {/* Payout */}
                  <div className="text-right">
                    <span className={`font-display font-black text-sm sm:text-base ${
                      isPeak
                        ? 'text-amber-700 dark:text-amber-300'
                        : isCurrent
                        ? 'text-emerald-700 dark:text-emerald-400 font-extrabold'
                        : isSafeHaven
                        ? 'text-amber-700 dark:text-amber-400'
                        : isCompleted
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-800 dark:text-slate-300'
                    }`}>
                      ₦{rung.payout.toLocaleString()}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-slate-400 dark:text-slate-500 block">
                      {isCompleted ? 'Cleared' : isCurrent ? 'Target' : 'Projected'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toggle View */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowFull(!showFull)}
            className="px-4 py-1.5 bg-slate-100 dark:bg-[#050914] hover:bg-slate-200 dark:hover:bg-[#0D182E] border border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            {showFull ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Show Focus Steps (1–7)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
                <span>View Full 18 Steps to ₦1M</span>
              </>
            )}
          </button>
        </div>

        {/* Mandatory Transparency Note */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.08] text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Zero Guarantees:</strong> 18 consecutive wins at 1.50 odds are mathematically required to reach ₦1M. Most challenges end on Days 1–4. Wager responsibly.
          </p>
        </div>

      </div>
    </div>
  );
}

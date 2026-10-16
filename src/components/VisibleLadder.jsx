import React, { useState } from 'react';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import { 
  Trophy, Shield, CheckCircle2, Flame, Copy, Check, 
  ArrowRight, Sparkles, ChevronDown, ChevronUp, Zap, Info, Clock
} from 'lucide-react';

const LADDER_STEPS = [
  { step: 18, stake: 492591, odds: 1.50, payout: 1000000, title: '₦1,000,000 FINAL SUMMIT', isPeak: true },
  { step: 17, stake: 328394, odds: 1.50, payout: 492591, title: 'Step 17 Summit Ascent' },
  { step: 16, stake: 218929, odds: 1.50, payout: 328394, title: 'Step 16 Upper Ridge' },
  { step: 15, stake: 145953, odds: 1.50, payout: 218929, title: 'Step 15 Major Peak' },
  { step: 14, stake: 97302, odds: 1.50, payout: 145953, title: 'Step 14 6-Figure Milestone' },
  { step: 13, stake: 64868, odds: 1.50, payout: 97302, title: 'Step 13 Post-Bank Highs' },
  { step: 12, stake: 43245, odds: 1.50, payout: 64868, title: 'DAY 12: BANK 50% (₦32,434)', isSafeHaven: true },
  { step: 11, stake: 28830, odds: 1.50, payout: 43245, title: 'Step 11 Upper Tier' },
  { step: 10, stake: 19220, odds: 1.50, payout: 28830, title: 'Step 10 Double Digits' },
  { step: 9, stake: 12813, odds: 1.50, payout: 19220, title: 'Step 9 Mid Ascent' },
  { step: 8, stake: 8542, odds: 1.50, payout: 12813, title: 'Step 8 Post-Bank Roll' },
  { step: 7, stake: 5695, odds: 1.50, payout: 8542, title: 'Step 7 Rolling Remainder' },
  { step: 6, stake: 7593, odds: 1.50, payout: 11390, title: 'DAY 6: BANK 50% (₦5,695)', isSafeHaven: true },
  { step: 5, stake: 5062, odds: 1.50, payout: 7593, title: 'Step 5 Pre-Milestone Gate' },
  { step: 4, stake: 3375, odds: 1.50, payout: 5062, title: 'Step 4 Breakout' },
  { step: 3, stake: 2250, odds: 1.50, payout: 3375, title: 'STEP 3: ACTIVE TODAY (02:00 AM DROP)', isCurrent: true },
  { step: 2, stake: 1500, odds: 1.50, payout: 2250, title: 'Day 2 Passed (WON ✅)', isCompleted: true },
  { step: 1, stake: 1000, odds: 1.50, payout: 1500, title: 'Day 1 Launch (₦1,000 Stake - WON ✅)', isCompleted: true },
];

export default function VisibleLadder({ onNavigate, showFullInitial = false }) {
  const [showFull, setShowFull] = useState(showFullInitial);
  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);

  const handleCopyCode = (code, type) => {
    navigator.clipboard.writeText(code);
    if (type === 'sporty') {
      setCopiedSporty(true);
      setTimeout(() => setCopiedSporty(false), 2000);
    } else {
      setCopiedBet9ja(true);
      setTimeout(() => setCopiedBet9ja(false), 2000);
    }
  };

  const stepsToRender = showFull 
    ? LADDER_STEPS 
    : LADDER_STEPS.filter(s => s.step <= 7 || s.step === 12 || s.step === 18);

  return (
    <div className="space-y-4">
      {/* Ladder Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1527] p-4 sm:p-6 shadow-sm transition-colors">
        
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -left-12 -bottom-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl"></div>

        {/* Top Summary Bar */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-display font-black text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Challenge #50 Active
              </span>

              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>1.50 Ticket Drops Daily at 02:00 AM WAT</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              The Visible 18-Step Rollover Mountain
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Disciplined ₦1,000 compound journey with 50% Banking at Day 6 &amp; Day 12 to guarantee zero capital loss.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <div className="bg-slate-50 dark:bg-[#131C2E] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-right">
              <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Current Accumulated Purse</span>
              <span className="text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => onNavigate('ladder')}
              className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1"
            >
              <span>Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
              <span>Step 3 of 18 In Play</span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-amber-500 font-bold">Day 6 Safe Haven: Bank ₦5,695</span>
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-black">16.7% to ₦1,000,000 Goal</span>
          </div>

          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: '16.7%' }}></div>
          </div>
        </div>

        {/* ── TODAY'S 1.50 ODDS MIDNIGHT DROP CARD ── */}
        <div className="relative mb-5 rounded-2xl border-2 border-blue-500 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-blue-50/70 dark:from-blue-950/40 dark:via-[#111C33] dark:to-[#0C1527] p-4 sm:p-5 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white font-display font-black text-[11px] uppercase tracking-wide">
                  TODAY'S 1.50 TICKET (STEP 3)
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-mono font-black">
                  Target Odds: 1.50x
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  &bull; Dropped at 02:00 AM WAT
                </span>
              </div>

              <h4 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg">
                Arsenal 1X &amp; O1.5 + Bayern Munich vs Stuttgart O2.5
              </h4>

              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-mono pt-0.5">
                <span>Rollover Stake: <strong>₦2,250</strong></span>
                <span>&bull;</span>
                <span>Next Purse on Win: <strong className="text-emerald-600 dark:text-emerald-400 font-black">₦3,375</strong></span>
              </div>
            </div>

            {/* Quick 1-Tap Booking Code Buttons for SportyBet & Bet9ja */}
            <div className="flex items-center gap-2 flex-shrink-0">
              
              {/* SportyBet Code */}
              <div className="flex items-center bg-white dark:bg-[#162032] border border-rose-300 dark:border-rose-900/60 rounded-xl px-3 py-1.5 text-xs shadow-sm">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-display font-bold uppercase mr-1.5">Sporty:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-wide">
                  {ACTIVE_CHALLENGE.sportyCode}
                </span>
                <button
                  onClick={() => handleCopyCode(ACTIVE_CHALLENGE.sportyCode, 'sporty')}
                  className="ml-2 p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-500 dark:text-slate-300 hover:text-rose-600 transition-colors"
                  title="Copy SportyBet code"
                >
                  {copiedSporty ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Bet9ja Code */}
              <div className="flex items-center bg-white dark:bg-[#162032] border border-emerald-300 dark:border-emerald-900/60 rounded-xl px-3 py-1.5 text-xs shadow-sm">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-display font-bold uppercase mr-1.5">Bet9ja:</span>
                <span className="font-mono font-black text-slate-900 dark:text-white text-xs sm:text-sm tracking-wide">
                  {ACTIVE_CHALLENGE.todaysCode}
                </span>
                <button
                  onClick={() => handleCopyCode(ACTIVE_CHALLENGE.todaysCode, 'bet9ja')}
                  className="ml-2 p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-500 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                  title="Copy Bet9ja code"
                >
                  {copiedBet9ja ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* ── THE VISIBLE LADDER RUNGS (ULTRA-READABLE HIGH CONTRAST) ── */}
        <div className="space-y-2 max-w-2xl mx-auto pt-1">
          {stepsToRender.map((rung) => {
            const isCurrent = rung.isCurrent;
            const isCompleted = rung.isCompleted;
            const isSafeHaven = rung.isSafeHaven;
            const isPeak = rung.isPeak;

            return (
              <div
                key={rung.step}
                className={`rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-all border ${
                  isPeak
                    ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400/40 text-amber-950 dark:text-amber-200'
                    : isCurrent
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg ring-2 ring-blue-400/50 scale-[1.01]'
                    : isSafeHaven
                    ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-950 dark:text-emerald-300 font-bold'
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-[#131C2E] border-emerald-500/40 text-slate-700 dark:text-slate-300'
                    : 'bg-white dark:bg-[#0E1626] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Step Number & Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs flex-shrink-0 ${
                    isPeak
                      ? 'bg-amber-400 text-slate-950'
                      : isCurrent
                      ? 'bg-white text-blue-600 font-black'
                      : isSafeHaven
                      ? 'bg-emerald-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {isPeak ? <Trophy className="w-4 h-4 text-slate-950" /> : rung.step}
                  </span>

                  <div className="min-w-0">
                    <div className="font-display font-black text-xs sm:text-sm truncate">
                      {rung.title}
                    </div>
                    <div className={`text-[10px] font-mono ${isCurrent ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      Daily 1.50x Compound Odds
                    </div>
                  </div>
                </div>

                {/* Financial Stake & Payout */}
                <div className="text-right flex-shrink-0">
                  <div className={`font-mono font-black text-xs sm:text-sm ${
                    isPeak 
                      ? 'text-amber-500 text-base' 
                      : isCurrent 
                      ? 'text-white font-black text-sm' 
                      : isSafeHaven 
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    ₦{rung.payout.toLocaleString()}
                  </div>
                  <div className={`text-[10px] font-mono ${isCurrent ? 'text-blue-200' : 'text-slate-400'}`}>
                    Stake: ₦{rung.stake.toLocaleString()}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Toggle Full 18 Steps Button */}
        <div className="pt-3 text-center">
          <button
            onClick={() => setShowFull(!showFull)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#162032] hover:bg-slate-200 dark:hover:bg-[#1A263D] text-slate-800 dark:text-slate-200 text-xs font-display font-bold transition-all border border-slate-200 dark:border-slate-800"
          >
            <span>{showFull ? 'Collapse to Key Milestones' : 'Expand All 18 Steps & Milestones'}</span>
            {showFull ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Mathematical Safety Explanation */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Why the 50% Milestone Rule Protects You:</strong>
            <p className="text-[11px] leading-relaxed opacity-90">
              Mathematically, rolling 18 consecutive bets at 1.50 raw odds has compounding variance. Under BRYME rules, at <strong>Day 6 (₦11,390)</strong>, exactly <strong>50% (₦5,695)</strong> is banked directly to your pocket. Even if a later day fails, you walk away with over 4.5x net profit on your ₦1,000 start.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

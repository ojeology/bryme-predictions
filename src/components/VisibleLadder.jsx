import React, { useState } from 'react';
import { ACTIVE_CHALLENGE, LADDER_CONFIG } from '../data/ladder';
import { 
  Trophy, Shield, CheckCircle2, Flame, Copy, Check, 
  ArrowRight, Sparkles, ChevronDown, ChevronUp, Zap, Info, Clock, Play
} from 'lucide-react';

const ALL_18_STEPS = [
  { day: 1, stake: 1000, odds: 1.50, returnVal: 1500, status: 'won' },
  { day: 2, stake: 1500, odds: 1.50, returnVal: 2250, status: 'won' },
  { day: 3, stake: 2250, odds: 1.50, returnVal: 3375, status: 'active' },
  { day: 4, stake: 3375, odds: 1.50, returnVal: 5062, status: 'upcoming' },
  { day: 5, stake: 5062, odds: 1.50, returnVal: 7593, status: 'upcoming' },
  { day: 6, stake: 7593, odds: 1.50, returnVal: 11390, isMilestone: true, bankAmount: 5695, rollAmount: 5695, status: 'milestone' },
  { day: 7, stake: 5695, odds: 1.50, returnVal: 8542, status: 'upcoming' },
  { day: 8, stake: 8542, odds: 1.50, returnVal: 12813, status: 'upcoming' },
  { day: 9, stake: 12813, odds: 1.50, returnVal: 19220, status: 'upcoming' },
  { day: 10, stake: 19220, odds: 1.50, returnVal: 28830, status: 'upcoming' },
  { day: 11, stake: 28830, odds: 1.50, returnVal: 43245, status: 'upcoming' },
  { day: 12, stake: 43245, odds: 1.50, returnVal: 64868, isMilestone: true, bankAmount: 32434, rollAmount: 32434, status: 'milestone' },
  { day: 13, stake: 32434, odds: 1.50, returnVal: 48651, status: 'upcoming' },
  { day: 14, stake: 48651, odds: 1.50, returnVal: 72976, status: 'upcoming' },
  { day: 15, stake: 72976, odds: 1.50, returnVal: 109464, status: 'upcoming' },
  { day: 16, stake: 109464, odds: 1.50, returnVal: 164196, status: 'upcoming' },
  { day: 17, stake: 164196, odds: 1.50, returnVal: 246294, status: 'upcoming' },
  { day: 18, stake: 246294, odds: 1.50, returnVal: 1000000, isPeak: true, status: 'peak' },
];

export default function VisibleLadder({ onNavigate }) {
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
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

  // Near-term 6 steps for clean, uncluttered display
  const nearTermSteps = ALL_18_STEPS.slice(0, 6);

  return (
    <div className="space-y-4">
      
      {/* ── MAIN LADDER CARD ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] overflow-hidden shadow-sm">
        
        {/* Card Header: Clear, Bold, Unintimidating */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-display font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                  Active Challenge #50
                </span>
                <span className="text-[11px] font-mono text-blue-200">
                  Daily 02:00 AM WAT Drop
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
                <span>The ₦1,000 &rarr; ₦1,000,000 Ladder</span>
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Start with ₦1,000. Re-invest safe ~1.50 daily odds. Bank half at Day 6 so you never lose.
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2 self-start sm:self-auto text-left sm:text-right">
              <span className="text-[10px] uppercase font-mono text-blue-200 block">Current Pot</span>
              <span className="text-2xl font-mono font-black text-amber-300">
                ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick "How It Works" toggle button */}
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="font-mono text-blue-100 text-[11px]">
              🎯 Current Stage: <strong>Day 3 of 18</strong>
            </span>
            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="text-[11px] font-display font-bold text-amber-300 hover:text-white transition-colors underline flex items-center gap-1"
            >
              <span>{showHowItWorks ? 'Hide Rules' : 'How does this work? (3 Rules)'}</span>
            </button>
          </div>
        </div>

        {/* ── EXPANDABLE: 3 SIMPLE RULES (EASY TO UNDERSTAND) ── */}
        {showHowItWorks && (
          <div className="p-4 sm:p-5 bg-blue-50/70 dark:bg-[#111A2E] border-b border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
              How The Ladder Works In 3 Simple Steps:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700/80">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-1.5">
                  1
                </div>
                <div className="font-display font-bold text-xs text-slate-900 dark:text-white">
                  Stake ₦1,000 Once
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  You only put in ₦1,000 on Day 1. You never add any more money from your bank account.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700/80">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-1.5">
                  2
                </div>
                <div className="font-display font-bold text-xs text-slate-900 dark:text-white">
                  Roll Daily 1.50 Odds
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Every night at 02:00 AM, we drop 1 safe ticket (usually 2 safe European matches). Re-invest yesterday's win.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#162238] border border-emerald-500/40">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center mb-1.5">
                  3
                </div>
                <div className="font-display font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  Bank Cash at Day 6
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  At Day 6 (₦11,390 pot), take <strong>₦5,695 cash</strong> to your pocket! You are now playing completely risk-free.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TODAY'S TICKET (DAY 3) - FRONT & CENTER ── */}
        <div className="p-4 sm:p-5">
          <div className="rounded-xl border-2 border-blue-500/80 bg-blue-50/40 dark:bg-[#121B30] p-4 sm:p-5 space-y-4">
            
            {/* Top row: Ticket Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-200/50 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">
                  D3
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      Today's Ticket &bull; Day 3 of 18
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Stake: <strong>₦2,250</strong> &rarr; Potential Win: <strong className="text-emerald-600 dark:text-emerald-400">₦3,375</strong>
                  </p>
                </div>
              </div>

              {/* Total Odds Badge */}
              <div className="bg-white dark:bg-[#18233C] px-3.5 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 self-start sm:self-auto">
                <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Odds</span>
                <span className="text-base font-mono font-black text-blue-600 dark:text-blue-400">
                  {ACTIVE_CHALLENGE.dailyOdds.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* The 2 Matches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACTIVE_CHALLENGE.selections.map((match, i) => (
                <div 
                  key={i}
                  className="p-3 rounded-lg bg-white dark:bg-[#162035] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">
                      {match.league}
                    </div>
                    <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {match.match}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Pick: <strong className="text-slate-900 dark:text-slate-100">{match.pick}</strong>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    {match.odds.toFixed(2)}x
                  </span>
                </div>
              ))}
            </div>

            {/* 1-Tap Copy Booking Codes */}
            <div className="pt-2 border-t border-blue-200/50 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-display font-bold text-slate-700 dark:text-slate-300">
                Load this ticket into your app:
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {/* SportyBet Button */}
                <button
                  onClick={() => handleCopyCode(ACTIVE_CHALLENGE.sportyCode, 'sporty')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-display font-bold text-xs transition-all shadow-sm"
                >
                  {copiedSporty ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Sporty: {ACTIVE_CHALLENGE.sportyCode}</span>
                </button>

                {/* Bet9ja Button */}
                <button
                  onClick={() => handleCopyCode(ACTIVE_CHALLENGE.todaysCode, 'bet9ja')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs transition-all shadow-sm"
                >
                  {copiedBet9ja ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Bet9ja: {ACTIVE_CHALLENGE.todaysCode}</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── VISUAL STEP-BY-STEP PROGRESS (CLEAN TIMELINE) ── */}
        <div className="px-4 sm:px-5 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display font-black text-xs sm:text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
              The 18-Day Path:
            </h4>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {ALL_18_STEPS.filter(s => s.status === 'won').length} Won &bull; 1 Active &bull; 15 Ahead
            </span>
          </div>

          {/* Stepper Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(showFullRoadmap ? ALL_18_STEPS : nearTermSteps).map((step) => {
              const isWon = step.status === 'won';
              const isActive = step.status === 'active';
              const isMilestone = step.isMilestone;
              const isPeak = step.isPeak;

              return (
                <div
                  key={step.day}
                  className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/40'
                      : isWon
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 text-slate-800 dark:text-slate-200'
                      : isMilestone
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/50 text-slate-900 dark:text-white'
                      : isPeak
                      ? 'bg-amber-500/10 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                      : 'bg-slate-50 dark:bg-[#131C2E] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-mono font-bold uppercase ${
                      isActive ? 'text-blue-100' : isWon ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}>
                      Day {step.day}
                    </span>

                    {isWon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    {isActive && <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse flex-shrink-0" />}
                    {isMilestone && <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    {isPeak && <Trophy className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                  </div>

                  <div>
                    <div className={`font-mono font-black text-xs sm:text-sm ${
                      isActive ? 'text-white' : 'text-slate-900 dark:text-white'
                    }`}>
                      ₦{step.returnVal.toLocaleString()}
                    </div>
                    <div className={`text-[10px] font-mono ${
                      isActive ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      {isMilestone ? 'Bank 50% 🛡️' : isPeak ? '₦1M Summit 🏆' : `Stake: ₦${step.stake.toLocaleString()}`}
                    </div>
                  </div>

                  {isActive && (
                    <div className="mt-2 text-[9px] font-display font-black uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded text-center">
                      Playing Today
                    </div>
                  )}

                  {isWon && (
                    <div className="mt-2 text-[9px] font-display font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-center">
                      Won ✅
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Toggle All 18 Steps */}
          <div className="mt-3 text-center">
            <button
              onClick={() => setShowFullRoadmap(!showFullRoadmap)}
              className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <span>{showFullRoadmap ? 'Show Next 6 Days Only' : 'View Full 18-Day Path to ₦1,000,000'}</span>
              {showFullRoadmap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

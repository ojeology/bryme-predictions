import React, { useState } from 'react';
import { ACTIVE_CHALLENGE, LADDER_CONFIG, PAST_CHALLENGES } from '../data/ladder';
import { 
  Trophy, Shield, CheckCircle2, Flame, Copy, Check, 
  ArrowRight, Sparkles, ChevronDown, ChevronUp, Zap, Info, Clock, Play, Lock, Eye, Calculator
} from 'lucide-react';

const ALL_18_STEPS = [
  { day: 1, stake: 1000, odds: 1.50, returnVal: 1500, status: 'won', match: 'Man City vs Fulham (Home Win & O1.5)', score: '3-0 FT' },
  { day: 2, stake: 1500, odds: 1.50, returnVal: 2250, status: 'won', match: 'Inter Milan vs Torino (Over 1.5 Goals)', score: '2-1 FT' },
  { day: 3, stake: 2250, odds: 1.50, returnVal: 3375, status: 'active', match: 'Arsenal vs Everton + Bayern vs Stuttgart', score: 'TODAY' },
  { day: 4, stake: 3375, odds: 1.50, returnVal: 5062, status: 'upcoming', match: 'European Sunday Feature', score: 'Next' },
  { day: 5, stake: 5062, odds: 1.50, returnVal: 7593, status: 'upcoming', match: 'Continental Midweek Match', score: 'Next' },
  { day: 6, stake: 7593, odds: 1.50, returnVal: 11390, isMilestone: true, bankAmount: 5695, rollAmount: 5695, status: 'milestone', match: 'MILESTONE: BANK 50% CASH', score: 'Shield' },
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
  const [selectedDayTab, setSelectedDayTab] = useState(3); // Default to active day 3
  const [startingStakeMultiplier, setStartingStakeMultiplier] = useState(1); // 1 = ₦1,000, 0.5 = ₦500, 2 = ₦2,000
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);
  const [showRules, setShowRules] = useState(false);
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

  const currentStakeValue = 1000 * startingStakeMultiplier;
  const currentPurse = Math.round(ACTIVE_CHALLENGE.currentBalance * startingStakeMultiplier);
  const day6BankValue = Math.round(5695 * startingStakeMultiplier);

  const nearTermSteps = ALL_18_STEPS.slice(0, 6);

  // Selected Day step data
  const selectedStepData = ALL_18_STEPS.find(s => s.day === selectedDayTab) || ALL_18_STEPS[2];

  return (
    <div className="space-y-4">
      
      {/* ── MAIN LADDER MASTER CARD ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] overflow-hidden shadow-sm">
        
        {/* Top Header: Visual Glow & High-Impact Typography */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-display font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
                  Run #50 Live
                </span>
                <span className="text-[11px] font-mono text-blue-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Dropped Daily at 02:00 AM WAT</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white flex items-center gap-2">
                <span>The ₦{currentStakeValue.toLocaleString()} &rarr; ₦{(1000000 * startingStakeMultiplier).toLocaleString()} Rollover Ladder</span>
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5 max-w-xl">
                Disciplined daily 1.50x compound bets. At Day 6, bank <strong>₦{day6BankValue.toLocaleString()} cash</strong> directly to your pocket to play risk-free.
              </p>
            </div>

            {/* Current Accumulated Purse */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 self-start sm:self-auto text-left sm:text-right flex-shrink-0">
              <span className="text-[10px] uppercase font-mono text-blue-200 block">Accumulated Purse</span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-300">
                ₦{currentPurse.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick Sub-Bar: Stake Multiplier & Rules Toggle */}
          <div className="mt-4 pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            {/* Stake Simulator Options */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-blue-200 mr-1 flex items-center gap-1">
                <Calculator className="w-3 h-3" />
                <span>Simulate:</span>
              </span>
              {[
                { multiplier: 0.5, label: '₦500' },
                { multiplier: 1, label: '₦1,000 (Official)' },
                { multiplier: 2, label: '₦2,000' },
              ].map(opt => (
                <button
                  key={opt.multiplier}
                  onClick={() => setStartingStakeMultiplier(opt.multiplier)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    startingStakeMultiplier === opt.multiplier
                      ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Rules Toggle */}
            <button
              onClick={() => setShowRules(!showRules)}
              className="text-[11px] font-display font-bold text-amber-300 hover:text-white transition-colors underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{showRules ? 'Hide Rules' : 'How does this work? (3 Rules)'}</span>
            </button>
          </div>
        </div>

        {/* ── EXPANDABLE: 3 SIMPLE RULES ── */}
        {showRules && (
          <div className="p-4 sm:p-5 bg-blue-50/60 dark:bg-[#111A2E] border-b border-slate-200 dark:border-slate-800 transition-all">
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5">
              The 3 Simple Rules of the BRYME Ladder:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700/80">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-1">1</span>
                <div className="font-display font-bold text-xs text-slate-900 dark:text-white">Stake ₦1,000 Once</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Only one single initial deposit. No top-ups.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700/80">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono font-bold text-xs flex items-center justify-center mb-1">2</span>
                <div className="font-display font-bold text-xs text-slate-900 dark:text-white">Roll 1.50 Daily Odds</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Every night at 02:00 AM, re-invest yesterday's win into 1 safe ticket.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-[#162238] border border-emerald-500/40">
                <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center mb-1">3</span>
                <div className="font-display font-bold text-xs text-emerald-600 dark:text-emerald-400">Bank 50% at Day 6</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Withdraw ₦5,695 cash on Day 6. You play the remaining 12 days 100% risk-free.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── INTERACTIVE STEP TABS (DAYS 1 TO 6) ── */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-display font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select A Day to Inspect Ticket &amp; Results:
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              Current: Day 3 Active 🔥
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {nearTermSteps.map((step) => {
              const isSelected = selectedDayTab === step.day;
              const isWon = step.status === 'won';
              const isActive = step.status === 'active';
              const isMilestone = step.isMilestone;

              return (
                <button
                  key={step.day}
                  onClick={() => setSelectedDayTab(step.day)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-400/50'
                      : isWon
                      ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-500'
                      : isMilestone
                      ? 'border-amber-400 dark:border-amber-600/60 bg-amber-50/40 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121B2F] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                    <span className={isActive ? 'text-blue-600 dark:text-blue-400' : isWon ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}>
                      Day {step.day}
                    </span>
                    {isWon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    {isActive && <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
                    {isMilestone && <Shield className="w-3.5 h-3.5 text-amber-500" />}
                  </div>

                  <div className="font-mono font-black text-xs text-slate-900 dark:text-white">
                    ₦{Math.round(step.returnVal * startingStakeMultiplier).toLocaleString()}
                  </div>

                  <div className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">
                    {step.score}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SELECTED DAY DETAIL CARD (WITH MONETIZING TEASER TO /ticket/:id) ── */}
        <div className="p-4 sm:p-5">
          {selectedDayTab === 3 ? (
            /* ACTIVE TODAY: DAY 3 MISSION (Strategic Teaser) */
            <div className="rounded-xl border-2 border-blue-500 bg-gradient-to-br from-blue-50/40 via-white to-blue-50/30 dark:from-[#111C33] dark:via-[#0E1626] dark:to-[#0A1120] p-4 sm:p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-blue-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center shadow-sm">
                    D3
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        Today's Ticket &bull; Day 3 of 18
                      </h3>
                      <span className="text-[9px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                        Active Today
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Stake: <strong>₦{(2250 * startingStakeMultiplier).toLocaleString()}</strong> &rarr; Target Return: <strong className="text-emerald-600 dark:text-emerald-400">₦{(3375 * startingStakeMultiplier).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#162238] px-3 py-1.5 rounded-xl border border-blue-200 dark:border-slate-700 self-start sm:self-auto text-right">
                  <span className="text-[9px] text-slate-400 font-mono uppercase block">Total Odds</span>
                  <span className="text-base font-mono font-black text-blue-600 dark:text-blue-400">
                    1.50x
                  </span>
                </div>
              </div>

              {/* Match Selections (Leg 1 Visible, Leg 2 Teased to maximize pageviews) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Leg 1: Visible */}
                <div className="p-3 rounded-xl bg-white dark:bg-[#141F35] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-sm">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase block">
                      🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League &bull; Leg 1
                    </span>
                    <div className="font-display font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      Arsenal vs Everton
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Pick: <strong className="text-slate-900 dark:text-slate-100">1X &amp; Over 1.5 Goals</strong>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 rounded">
                    1.25x
                  </span>
                </div>

                {/* Leg 2: Teased (Drives click to dedicated ticket page!) */}
                <div 
                  onClick={() => onNavigate('ticket/ticket-ladder-challenge')}
                  className="cursor-pointer group p-3 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-blue-950/30 dark:to-[#131F35] border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between gap-2 hover:border-blue-500 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase block">
                        🇩🇪 Bundesliga &bull; Leg 2 (1.20x)
                      </span>
                      <div className="font-display font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Bayern vs Stuttgart Selection
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Click to reveal pick &amp; booking codes
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-display font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 flex-shrink-0">
                    <span>Unlock</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Call-to-Action Bar */}
              <div className="pt-2 border-t border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Quick Sporty button */}
                  <button
                    onClick={() => handleCopyCode(ACTIVE_CHALLENGE.sportyCode, 'sporty')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-[#1C2A44] text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    {copiedSporty ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Sporty: {ACTIVE_CHALLENGE.sportyCode}</span>
                  </button>

                  {/* Quick Bet9ja button */}
                  <button
                    onClick={() => handleCopyCode(ACTIVE_CHALLENGE.todaysCode, 'bet9ja')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#162238] hover:bg-slate-200 dark:hover:bg-[#1C2A44] text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    {copiedBet9ja ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Bet9ja: {ACTIVE_CHALLENGE.todaysCode}</span>
                  </button>
                </div>

                {/* Primary CTA: Navigates to Ticket Detail Page (Pageview!) */}
                <button
                  onClick={() => onNavigate('ticket/ticket-ladder-challenge')}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Day 3 Full Sheet &rarr;</span>
                </button>
              </div>

            </div>
          ) : (
            /* PREVIOUS WON DAYS OR SAFE HAVEN */
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                    selectedStepData.status === 'won'
                      ? 'bg-emerald-500 text-white'
                      : selectedStepData.isMilestone
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    D{selectedStepData.day}
                  </span>
                  <div>
                    <h3 className="font-display font-black text-sm text-slate-900 dark:text-white">
                      Day {selectedStepData.day} &bull; {selectedStepData.match}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Stake: ₦{Math.round(selectedStepData.stake * startingStakeMultiplier).toLocaleString()} &bull; Payout: <strong>₦{Math.round(selectedStepData.returnVal * startingStakeMultiplier).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  selectedStepData.status === 'won'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                    : selectedStepData.isMilestone
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {selectedStepData.score}
                </span>
              </div>

              {selectedStepData.isMilestone && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200">
                  🛡️ <strong>Day 6 Safe Haven Rule:</strong> At Day 6, exactly 50% (₦{day6BankValue.toLocaleString()}) is banked to cash profit. The remaining 50% rolls forward to Day 7.
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  onClick={() => onNavigate('ladder')}
                  className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>View Full Public Audit Ledger &rarr;</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── EXPANDABLE: FULL 18-DAY TABLE ── */}
        <div className="px-4 sm:px-5 pb-5">
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowFullRoadmap(!showFullRoadmap)}
              className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline py-1 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <span>{showFullRoadmap ? 'Collapse Roadmap' : `Inspect Complete 18-Day Progression to ₦${(1000000 * startingStakeMultiplier).toLocaleString()}`}</span>
              {showFullRoadmap ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showFullRoadmap && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {ALL_18_STEPS.map((s) => (
                <div
                  key={s.day}
                  className={`p-2.5 rounded-xl border text-left text-xs ${
                    s.status === 'won'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                      : s.status === 'active'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : s.isMilestone
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/40 text-slate-900 dark:text-white'
                      : s.isPeak
                      ? 'bg-amber-500/10 border-amber-400 text-amber-950 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-[#121B2F] border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase font-bold mb-0.5">
                    Day {s.day} {s.status === 'won' ? '✅' : s.status === 'active' ? '🔥' : s.isMilestone ? '🛡️' : ''}
                  </div>
                  <div className="font-mono font-black">
                    ₦{Math.round(s.returnVal * startingStakeMultiplier).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

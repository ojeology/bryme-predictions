import React, { useState } from 'react';
import { usePredictions } from '../context/PredictionsContext';
import { 
  Trophy, Shield, CheckCircle2, Flame, Copy, Check, 
  ArrowRight, Sparkles, ChevronDown, ChevronUp, Zap, Info, Clock, Play, Lock, Eye, Calculator, Share2, ExternalLink
} from 'lucide-react';

const ALL_18_STEPS = [
  { day: 1, stake: 1000, odds: 1.50, returnVal: 1500, status: 'won', match: 'Man City vs Fulham (Home Win & O1.5)', league: 'EPL', score: '3-0 FT' },
  { day: 2, stake: 1500, odds: 1.50, returnVal: 2250, status: 'won', match: 'Inter Milan vs Torino (Over 1.5 Goals)', league: 'Serie A', score: '2-1 FT' },
  { day: 3, stake: 2250, odds: 1.50, returnVal: 3375, status: 'won', match: 'Real Madrid vs Celta (1X & Over 1.5 Goals)', league: 'La Liga', score: '2-0 FT' },
  { day: 4, stake: 3375, odds: 1.50, returnVal: 5062, status: 'active', match: 'Arsenal vs Everton + Bayern vs Stuttgart', league: 'EPL / Bundesliga', score: 'TODAY' },
  { day: 5, stake: 5062, odds: 1.50, returnVal: 7593, status: 'upcoming', match: 'European Sunday Banker Selection', league: 'Top Leagues', score: 'Next' },
  { day: 6, stake: 7593, odds: 1.50, returnVal: 11390, isMilestone: true, bankAmount: 5695, rollAmount: 5695, status: 'milestone', match: 'MILESTONE: BANK 50% CASH IN HAND', league: 'Safe Haven', score: 'Shield' },
  { day: 7, stake: 5695, odds: 1.50, returnVal: 8542, status: 'upcoming', league: 'Midweek' },
  { day: 8, stake: 8542, odds: 1.50, returnVal: 12813, status: 'upcoming', league: 'Midweek' },
  { day: 9, stake: 12813, odds: 1.50, returnVal: 19220, status: 'upcoming', league: 'Weekend' },
  { day: 10, stake: 19220, odds: 1.50, returnVal: 28830, status: 'upcoming', league: 'Weekend' },
  { day: 11, stake: 28830, odds: 1.50, returnVal: 43245, status: 'upcoming', league: 'Midweek' },
  { day: 12, stake: 43245, odds: 1.50, returnVal: 64868, isMilestone: true, bankAmount: 32434, rollAmount: 32434, status: 'milestone', league: 'Safe Haven' },
  { day: 13, stake: 32434, odds: 1.50, returnVal: 48651, status: 'upcoming', league: 'Weekend' },
  { day: 14, stake: 48651, odds: 1.50, returnVal: 72976, status: 'upcoming', league: 'Weekend' },
  { day: 15, stake: 72976, odds: 1.50, returnVal: 109464, status: 'upcoming', league: 'Midweek' },
  { day: 16, stake: 109464, odds: 1.50, returnVal: 164196, status: 'upcoming', league: 'Weekend' },
  { day: 17, stake: 164196, odds: 1.50, returnVal: 246294, status: 'upcoming', league: 'Weekend' },
  { day: 18, stake: 246294, odds: 1.50, returnVal: 1000000, isPeak: true, status: 'peak', league: 'Jackpot Target' },
];

export default function VisibleLadder({ onNavigate }) {
  const { ladder } = usePredictions();
  const currentLadderDay = ladder?.currentDay || 4;
  const [selectedDayTab, setSelectedDayTab] = useState(currentLadderDay);
  const [startingStakeMultiplier, setStartingStakeMultiplier] = useState(1);
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [copiedSporty, setCopiedSporty] = useState(false);
  const [copiedBet9ja, setCopiedBet9ja] = useState(false);
  const [activeBookmaker, setActiveBookmaker] = useState('sportybet');

  const sportyCode = ladder?.sportyCode || 'BC4-LAD50-D4';
  const bet9jaCode = ladder?.todaysCode || 'B9J-LAD-50-D4';
  const currentOdds = ladder?.targetOdds || 1.50;

  const handleCopyCode = (code, type) => {
    navigator.clipboard.writeText(code);
    if (type === 'sporty') {
      setCopiedSporty(true);
      setTimeout(() => setCopiedSporty(false), 2500);
    } else {
      setCopiedBet9ja(true);
      setTimeout(() => setCopiedBet9ja(false), 2500);
    }
  };

  const currentStakeValue = 1000 * startingStakeMultiplier;
  const currentPurse = Math.round((ladder?.currentBalance || 3375) * startingStakeMultiplier);
  const potentialWin = Math.round(currentPurse * currentOdds);
  const day6BankValue = Math.round(5695 * startingStakeMultiplier);

  const selectedStepData = ALL_18_STEPS.find(s => s.day === selectedDayTab) || ALL_18_STEPS[currentLadderDay - 1] || ALL_18_STEPS[3];

  // Default selections for active slip
  const selections = ladder?.selections && ladder.selections.length > 0 ? ladder.selections : [
    { match: 'Arsenal vs Everton', league: 'Premier League', kickoff: 'Today 17:30 WAT', pick: '1X & Over 1.5 Goals', odds: 1.25 },
    { match: 'Bayern Munich vs VfB Stuttgart', league: 'Bundesliga', kickoff: 'Today 19:30 WAT', pick: 'Over 2.5 Goals', odds: 1.20 }
  ];

  return (
    <div className="space-y-4">
      
      {/* ── 1. MAIN SPORTYBET-STYLE LADDER MASTER CARD ── */}
      <div className="rounded-2xl border-2 border-[#E41B13]/30 dark:border-[#E41B13]/40 bg-white dark:bg-[#0E1626] overflow-hidden shadow-xl transition-all">
        
        {/* SPORTYBET SIGNATURE RED HEADER BAR */}
        <div className="bg-gradient-to-r from-[#D81A12] via-[#E41B13] to-[#B01009] p-4 sm:p-5 text-white relative overflow-hidden shadow-md">
          {/* Subtle Sporty stadium floodlight effect */}
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-40 h-40 rounded-full bg-black/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Ladder Brand, Live Stage, & Hook */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Iconic Sporty-Style Pill */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/35 backdrop-blur-sm border border-white/20 text-white font-display font-black text-[11px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping"></span>
                  SPORTYBET ROLLOVER &bull; RUN #50
                </span>

                <span className="px-2 py-0.5 rounded bg-white/20 text-white font-mono font-bold text-[10px] uppercase">
                  DAY {currentLadderDay} OF 18
                </span>

                <span className="text-[11px] font-mono text-white/80 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-300" />
                  <span>02:00 AM WAT Midnight Drop</span>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
                <span>The ₦{currentStakeValue.toLocaleString()} &rarr; ₦{(1000000 * startingStakeMultiplier).toLocaleString()} Ladder</span>
              </h2>

              <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium leading-relaxed">
                Compound daily 1.50x banker odds. Reach Day 6 to bank <strong>₦{day6BankValue.toLocaleString()} pure cash</strong> into your pocket to play the rest 100% risk-free.
              </p>
            </div>

            {/* Right: Live Accumulated Pot Scoreboard (Sporty Style) */}
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 text-left md:text-right flex-shrink-0 shadow-inner flex flex-row md:flex-col justify-between items-center md:items-end gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-300 block">
                  Active Bankroll (Pot)
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight block">
                  ₦{currentPurse.toLocaleString()}
                </span>
              </div>

              <div className="md:mt-1 pt-1 border-t border-white/10 flex items-center gap-2">
                <span className="text-[10px] text-white/70 font-mono">Today's Target:</span>
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#00C250] text-black">
                  ₦{potentialWin.toLocaleString()}
                </span>
              </div>
            </div>

          </div>

          {/* Sub-Bar: Stake Simulator Pills & Rules Toggle */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Stake Simulator Options */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-white/80 mr-1 flex items-center gap-1">
                <Calculator className="w-3 h-3 text-amber-300" />
                <span>Simulate Stake:</span>
              </span>
              {[
                { multiplier: 0.5, label: '₦500' },
                { multiplier: 1, label: '₦1,000 (Official)' },
                { multiplier: 2, label: '₦2,000' },
                { multiplier: 5, label: '₦5,000' },
              ].map(opt => (
                <button
                  key={opt.multiplier}
                  onClick={() => setStartingStakeMultiplier(opt.multiplier)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    startingStakeMultiplier === opt.multiplier
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-white/50'
                      : 'bg-black/30 hover:bg-black/40 text-white border border-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Rules Trigger */}
            <button
              onClick={() => setShowRules(!showRules)}
              className="text-[11px] font-display font-bold text-amber-300 hover:text-white transition-colors underline flex items-center gap-1 self-start sm:self-auto"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showRules ? 'Hide Rollover Rules' : 'How the 1.50x Ladder Works (3 Rules)'}</span>
            </button>
          </div>

        </div>

        {/* ── 2. THE SPORTYBET 1-TAP LOAD CODE BAR ── */}
        <div className="bg-slate-900 text-white p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Bookmaker Selector & Code Display */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
              Instant Booking Code:
            </span>

            {/* SportyBet Tab */}
            <button
              onClick={() => setActiveBookmaker('sportybet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeBookmaker === 'sportybet'
                  ? 'bg-[#E41B13] text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🔴 SportyBet</span>
            </button>

            {/* Bet9ja Tab */}
            <button
              onClick={() => setActiveBookmaker('bet9ja')}
              className={`px-2.5 py-1 rounded-lg text-xs font-display font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                activeBookmaker === 'bet9ja'
                  ? 'bg-[#00C250] text-black shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>🟢 Bet9ja</span>
            </button>

            {/* Big Monospace Code Display */}
            <div className="px-3 py-1 rounded-lg bg-black/70 border border-slate-700 font-mono font-black text-sm tracking-wider text-amber-400">
              {activeBookmaker === 'sportybet' ? sportyCode : bet9jaCode}
            </div>
          </div>

          {/* Action Buttons: 1-Tap Copy & Open */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activeBookmaker === 'sportybet' ? (
              <button
                onClick={() => handleCopyCode(sportyCode, 'sporty')}
                className={`px-3.5 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
                  copiedSporty
                    ? 'bg-[#00C250] text-slate-950 ring-2 ring-emerald-300'
                    : 'bg-[#E41B13] hover:bg-[#D01710] text-white'
                }`}
              >
                {copiedSporty ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied! Ready to Paste</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy SportyBet Code</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => handleCopyCode(bet9jaCode, 'bet9ja')}
                className={`px-3.5 py-1.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
                  copiedBet9ja
                    ? 'bg-[#00C250] text-slate-950 ring-2 ring-emerald-300'
                    : 'bg-[#00C250] hover:bg-[#00B048] text-black'
                }`}
              >
                {copiedBet9ja ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied! Ready to Paste</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Bet9ja Code</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => onNavigate('ticket/ticket-ladder-challenge')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-display font-bold text-xs transition-colors flex items-center gap-1"
              title="Open full ticket details"
            >
              <span>Full Slip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* ── EXPANDABLE RULES DRAWER ── */}
        {showRules && (
          <div className="p-4 sm:p-5 bg-amber-50/70 dark:bg-[#111A2E] border-b border-slate-200 dark:border-slate-800 transition-all">
            <h4 className="text-xs font-display font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#E41B13]" />
              <span>The 3 Unbreakable Rules of the BRYME Rollover:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#E41B13] text-white font-mono font-black text-xs flex items-center justify-center">1</span>
                  <div className="font-display font-black text-xs text-slate-900 dark:text-white">Stake ₦1,000 Once</div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  You only fund your account on Day 1. No continuous deposits or chasing losses.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#162238] border border-slate-200 dark:border-slate-700 shadow-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-mono font-black text-xs flex items-center justify-center">2</span>
                  <div className="font-display font-black text-xs text-slate-900 dark:text-white">Roll Daily 1.50x Odds</div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every midnight at 02:00 AM, yesterday's returns roll entirely into 1 high-probability safety slip.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#162238] border border-emerald-500/50 shadow-sm space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#00C250] text-black font-mono font-black text-xs flex items-center justify-center">3</span>
                  <div className="font-display font-black text-xs text-emerald-600 dark:text-emerald-400">The Savings Safety Plan (Never Lose It All)</div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  The ladder is 18 basic steps. At Day 6 (₦11,390), immediately withdraw <strong>₦5,695 cash</strong> to your pocket! You have recovered your ₦1,000 + ₦4,695 profit. At Day 12, bank another ₦32,434. You never lose it all!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. WHO WANTS TO BE A MILLIONAIRE: RUNGS STEPPER ── */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-[#0A101D] border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono font-black tracking-wider text-slate-500 dark:text-slate-400">
              Interactive Ladder Mountain (Click any Day to view target &amp; slip):
            </span>
            <span className="text-[11px] font-mono font-bold text-[#E41B13] dark:text-rose-400">
              Run Progress: {((currentLadderDay / 18) * 100).toFixed(0)}%
            </span>
          </div>

          {/* Stepper Rung Horizontal Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {ALL_18_STEPS.slice(0, 10).map((step) => {
              const isWon = step.day < currentLadderDay;
              const isActive = step.day === currentLadderDay;
              const isSelected = selectedDayTab === step.day;

              return (
                <button
                  key={step.day}
                  onClick={() => setSelectedDayTab(step.day)}
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#E41B13] bg-white dark:bg-[#162238] border-[#E41B13] shadow-md'
                      : isWon
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : isActive
                      ? 'bg-[#E41B13]/10 dark:bg-[#E41B13]/20 border-[#E41B13] text-[#E41B13] dark:text-rose-300'
                      : step.isMilestone
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400/50 text-amber-800 dark:text-amber-300'
                      : 'bg-white dark:bg-[#121B2F] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase">
                    <span>Day {step.day}</span>
                    {isWon && <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />}
                    {isActive && <Flame className="w-3 h-3 text-[#E41B13] animate-pulse" />}
                    {step.isMilestone && <Shield className="w-3 h-3 text-amber-500" />}
                  </div>
                  <div className="font-mono font-black text-xs text-slate-900 dark:text-white">
                    ₦{Math.round(step.returnVal * startingStakeMultiplier).toLocaleString()}
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => setShowFullRoadmap(!showFullRoadmap)}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-transparent text-[11px] font-display font-bold text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              + All 18 Days &rarr;
            </button>
          </div>
        </div>

        {/* ── 4. THE SPORTYBET ACCUMULATOR BET SLIP (TODAY'S SELECTIONS) ── */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Slip Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C250] animate-ping"></span>
                <h3 className="font-display font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Day {selectedStepData.day} Official Slip Selections</span>
                  {selectedStepData.day === currentLadderDay && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-[#E41B13] text-white">
                      LIVE IN PLAY
                    </span>
                  )}
                  {selectedStepData.day < currentLadderDay && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-[#00C250] text-black">
                      PASSED ✅
                    </span>
                  )}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target Odds: <strong className="text-blue-600 dark:text-blue-400 font-bold">{selectedStepData.odds.toFixed(2)}x</strong> &bull; Calculated Stake: <strong className="text-slate-900 dark:text-white">₦{Math.round(selectedStepData.stake * startingStakeMultiplier).toLocaleString()}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                2 Matches Acca
              </span>
              <span className="text-xs font-mono font-black bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-300/40">
                {currentOdds.toFixed(2)}x Odds
              </span>
            </div>
          </div>

          {/* Matches List (Styled in Authentic SportyBet Betslip Market Format) */}
          {selectedStepData.day === currentLadderDay ? (
            <div className="space-y-3">
              {selections.map((sel, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#121B30] hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Match, League & Kickoff */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E41B13] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/40">
                          {sel.league || 'European Top Flight'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{sel.kickoff || 'Today 18:00 WAT'}</span>
                        </span>
                      </div>

                      <div className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                        {sel.match}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Market Selection: <strong className="text-slate-900 dark:text-slate-200">{sel.pick}</strong>
                      </div>
                    </div>

                    {/* Right: Tactile SportyBet Odds Selection Button */}
                    <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                      <div className="flex items-center rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A253D] shadow-sm">
                        <div className="px-3 py-2 text-xs font-display font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700">
                          {sel.pick.length > 18 ? sel.pick.slice(0, 16) + '...' : sel.pick}
                        </div>
                        <div className="px-3 py-2 text-xs font-mono font-black text-[#E41B13] dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30">
                          {sel.odds ? Number(sel.odds).toFixed(2) : '1.25'}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}

              {/* BETSLIP RECEIPT SUMMARY BOX (SPORTY STYLE) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-xs font-display font-bold uppercase text-slate-400">
                    SportyBet Accumulator Receipt
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00C250]">
                    ● Verified Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total Odds</span>
                    <span className="text-base font-black text-amber-300">{currentOdds.toFixed(2)}x</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Rollover Stake</span>
                    <span className="text-base font-black text-white">₦{currentPurse.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Potential Win</span>
                    <span className="text-base font-black text-[#00C250]">₦{potentialWin.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Net Profit</span>
                    <span className="text-base font-black text-cyan-300">+₦{(potentialWin - currentPurse).toLocaleString()}</span>
                  </div>
                </div>

                {/* 1-Tap Load Codes Footer */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400">Ready Codes:</span>
                    <button
                      onClick={() => handleCopyCode(sportyCode, 'sporty')}
                      className="px-2.5 py-1 rounded bg-[#E41B13] hover:bg-[#D01710] text-white font-mono font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <span>Sporty: {sportyCode}</span>
                      {copiedSporty ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopyCode(bet9jaCode, 'bet9ja')}
                      className="px-2.5 py-1 rounded bg-[#00C250] hover:bg-[#00B048] text-black font-mono font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <span>Bet9ja: {bet9jaCode}</span>
                      {copiedBet9ja ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => onNavigate('ticket/ticket-ladder-challenge')}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dedicated Ticket Page &rarr;</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* PREVIOUS WON DAYS OR FUTURE STAGE CARD */
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111A2E] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                    selectedStepData.status === 'won'
                      ? 'bg-emerald-500 text-white'
                      : selectedStepData.isMilestone
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    D{selectedStepData.day}
                  </span>
                  <div>
                    <h4 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      Day {selectedStepData.day} &bull; {selectedStepData.match}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Calculated Stake: ₦{Math.round(selectedStepData.stake * startingStakeMultiplier).toLocaleString()} &bull; Payout: <strong className="text-emerald-600 dark:text-emerald-400">₦{Math.round(selectedStepData.returnVal * startingStakeMultiplier).toLocaleString()}</strong>
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                  selectedStepData.status === 'won'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                    : selectedStepData.isMilestone
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {selectedStepData.score}
                </span>
              </div>

              {selectedStepData.isMilestone && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold uppercase tracking-wide flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                    <Shield className="w-4 h-4" />
                    <span>Day 6 Safe Haven Rule Activated</span>
                  </div>
                  <p>
                    At Day 6, exactly 50% (₦{day6BankValue.toLocaleString()}) is banked to cash profit directly into your pocket. The remaining 50% (₦{day6BankValue.toLocaleString()}) rolls into Day 7.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDayTab(currentLadderDay)}
                  className="text-xs font-display font-bold text-[#E41B13] dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  &larr; Return to Today's Active Day {currentLadderDay} Slip
                </button>

                <button
                  onClick={() => onNavigate('ladder')}
                  className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Full Ledger History &rarr;</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── EXPANDABLE: FULL 18-DAY COMPLETE PROGRESSION ── */}
        <div className="px-4 sm:px-5 pb-5">
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowFullRoadmap(!showFullRoadmap)}
              className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline py-1.5 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <span>{showFullRoadmap ? '▲ Collapse 18-Day Mountain' : `▼ Inspect Complete 18-Day Progression to ₦${(1000000 * startingStakeMultiplier).toLocaleString()}`}</span>
            </button>
          </div>

          {showFullRoadmap && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
              {ALL_18_STEPS.map((s) => (
                <div
                  key={s.day}
                  onClick={() => setSelectedDayTab(s.day)}
                  className={`p-2.5 rounded-xl border text-left text-xs cursor-pointer transition-all hover:scale-[1.02] ${
                    s.day < currentLadderDay
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/30'
                      : s.day === currentLadderDay
                      ? 'bg-[#E41B13] text-white border-[#E41B13] shadow-md'
                      : s.isMilestone
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/40 text-slate-900 dark:text-white'
                      : s.isPeak
                      ? 'bg-amber-500/10 border-amber-400 text-amber-950 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-[#121B2F] border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase font-bold mb-0.5 flex items-center justify-between">
                    <span>Day {s.day}</span>
                    <span>{s.day < currentLadderDay ? '✅' : s.day === currentLadderDay ? '🔥' : s.isMilestone ? '🛡️' : s.isPeak ? '👑' : ''}</span>
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

import React, { useState } from 'react';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import { 
  Trophy, Shield, CheckCircle2, Flame, Copy, Check, 
  ArrowUpRight, AlertTriangle, Sparkles, ChevronDown, ChevronUp, Info 
} from 'lucide-react';

// Precomputed 18 ladder steps with realistic rollover math (Day 6 banks 50%)
const LADDER_STEPS = [
  { step: 18, stake: 492591, odds: 1.50, payout: 1000000, label: '🏆 ₦1,000,000 SUMMIT', isPeak: true },
  { step: 17, stake: 328394, odds: 1.50, payout: 492591, label: 'Final Ascent' },
  { step: 16, stake: 218929, odds: 1.50, payout: 328394, label: 'High Altitude' },
  { step: 15, stake: 145953, odds: 1.50, payout: 218929, label: 'Major Milestone' },
  { step: 14, stake: 97302, odds: 1.50, payout: 145953, label: 'Six-Figure Threshold' },
  { step: 13, stake: 64868, odds: 1.50, payout: 97302, label: 'Challenger Rung' },
  { step: 12, stake: 43245, odds: 1.50, payout: 64868, label: 'Checkpoint 12' },
  { step: 11, stake: 28830, odds: 1.50, payout: 43245, label: 'Upper Tier' },
  { step: 10, stake: 19220, odds: 1.50, payout: 28830, label: 'Ten-Day Club' },
  { step: 9, stake: 12813, odds: 1.50, payout: 19220, label: 'Mid Ridge' },
  { step: 8, stake: 8542, odds: 1.50, payout: 12813, label: 'Secondary Roll' },
  { step: 7, stake: 5695, odds: 1.50, payout: 8542, label: 'Post-Bank Climb' },
  { step: 6, stake: 7593, odds: 1.50, payout: 11390, label: '🛡️ DAY 6: BANK 50% (₦5,695)', isSafeHaven: true },
  { step: 5, stake: 5062, odds: 1.50, payout: 7593, label: 'Pre-Milestone' },
  { step: 4, stake: 3375, odds: 1.50, payout: 5062, label: 'Breakout Level' },
  { step: 3, stake: 2250, odds: 1.50, payout: 3375, label: '⚡ LIVE TODAY (DAY 3)', isCurrent: true },
  { step: 2, stake: 1500, odds: 1.50, payout: 2250, label: 'Day 2 Passed', isCompleted: true },
  { step: 1, stake: 1000, odds: 1.50, payout: 1500, label: 'Day 1 Launch (₦1,000)', isCompleted: true },
];

export default function VisibleLadder({ onNavigate, showFullInitial = false }) {
  const [showFull, setShowFull] = useState(showFullInitial);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedStep, setSelectedStep] = useState(3);

  const displayedSteps = showFull 
    ? LADDER_STEPS 
    : LADDER_STEPS.filter(s => s.step <= 8 || s.step === 18);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ACTIVE_CHALLENGE.todaysCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="relative glass-card rounded-3xl p-4 sm:p-6 md:p-8 border-2 border-[#1E3258] overflow-hidden shadow-2xl">
      {/* Stadium Spotlight Background */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-fortegreen-neon/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E3258] pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-fortegreen-neon/20 border border-fortegreen-neon text-fortegreen-neon font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-fortegreen-neon animate-ping"></span>
              Live Rollover Ladder
            </span>
            <span className="text-xs font-mono text-slate-400">
              Challenge #{ACTIVE_CHALLENGE.challengeNumber}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
            The 18-Step Rollover Ladder
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Start at <strong className="text-white">₦1,000</strong> on Step 1. Win daily ~1.50 odds tickets to climb rungs toward <strong className="text-gold-400">₦1,000,000</strong>. Secure 50% profits at the Step 6 safe haven.
          </p>
        </div>

        {/* Live Climber Badge */}
        <div className="bg-pitch-950/90 border-2 border-fortegreen-neon/60 rounded-2xl p-3 sm:p-4 text-center sm:text-right shadow-glow-green self-start sm:self-auto min-w-[200px]">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">
            Current Climber Position
          </span>
          <div className="text-2xl sm:text-3xl font-display font-black text-fortegreen-neon">
            STEP 3 <span className="text-xs text-white font-sans font-normal">of 18</span>
          </div>
          <div className="text-xs font-mono font-bold text-amber-300 mt-0.5">
            Purse: ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Active Day 3 Spotlight Card (Quick Action) */}
      <div className="relative z-10 mb-6 bg-gradient-to-r from-[#0C1E38] via-[#112749] to-[#0A162B] border-2 border-fortegreen-neon rounded-2xl p-4 sm:p-5 shadow-glow-green">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-fortegreen-neon text-pitch-950 font-display font-black text-xs uppercase tracking-wide">
                Today's Rung In Action
              </span>
              <span className="text-xs font-mono text-slate-300">
                Target Odds: <strong className="text-fortegreen-neon">1.50x</strong>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white">
              Arsenal 1X &amp; Over 1.5 + Bayern Munich vs Stuttgart Over 2.5
            </h3>

            <p className="text-xs text-slate-400">
              Win advances the ladder to <strong className="text-white">Step 4 (₦5,062 purse)</strong>. One match loss terminates the challenge and starts fresh.
            </p>
          </div>

          {/* Quick Copy Booking Code */}
          <div className="flex items-center gap-2 self-start md:self-center flex-shrink-0">
            <div className="bg-pitch-950 px-3 py-2 rounded-xl border border-fortegreen-neon/40 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Bet9ja Code:</span>
              <span className="font-mono font-black text-sm text-fortegreen-neon tracking-wider">
                {ACTIVE_CHALLENGE.todaysCode}
              </span>
              <button
                onClick={handleCopy}
                className="ml-1 p-1.5 rounded-lg bg-[#182847] hover:bg-fortegreen-neon hover:text-pitch-950 text-slate-200 transition-colors"
                title="Copy today's code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-fortegreen-neon" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={() => onNavigate('ladder')}
              className="px-4 py-2.5 bg-fortegreen-neon hover:bg-[#00c853] text-pitch-950 font-display font-black text-xs uppercase rounded-xl transition-all shadow-md shadow-fortegreen-neon/30 flex items-center gap-1.5"
            >
              <span>View Ledger</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* THE PHYSICAL VISIBLE LADDER CONTAINER */}
      <div className="relative max-w-2xl mx-auto px-6 sm:px-12 py-4">
        
        {/* Left Metallic Ladder Rail */}
        <div className="absolute left-3 sm:left-6 top-0 bottom-0 w-4 bg-gradient-to-b from-amber-400 via-fortegreen-neon to-[#1E3258] rounded-full shadow-[0_0_15px_rgba(0,230,118,0.4)] flex flex-col justify-between items-center py-4">
          <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
          <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
          <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
          <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
        </div>

        {/* Right Metallic Ladder Rail */}
        <div className="absolute right-3 sm:right-6 top-0 bottom-0 w-4 bg-gradient-to-b from-amber-400 via-fortegreen-neon to-[#1E3258] rounded-full shadow-[0_0_15px_rgba(0,230,118,0.4)] flex flex-col justify-between items-center py-4">
          <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
          <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
          <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
          <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
        </div>

        {/* Vertical Rungs Stack (Ascending upwards from Step 1 to Step 18) */}
        <div className="space-y-2.5 relative z-10">
          {displayedSteps.map((rung) => {
            const isCompleted = rung.isCompleted;
            const isCurrent = rung.isCurrent;
            const isSafeHaven = rung.isSafeHaven;
            const isPeak = rung.isPeak;

            return (
              <div
                key={rung.step}
                onClick={() => setSelectedStep(rung.step)}
                className={`ladder-rung relative rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none transition-all duration-200 border ${
                  isPeak
                    ? 'bg-gradient-to-r from-amber-950/80 via-yellow-900/60 to-amber-950/80 border-amber-400 shadow-glow-gold hover:scale-[1.01]'
                    : isCurrent
                    ? 'ladder-rung-active bg-gradient-to-r from-[#003814] via-[#005721] to-[#003814] border-fortegreen-neon scale-[1.02] shadow-glow-green'
                    : isSafeHaven
                    ? 'ladder-rung-gold bg-gradient-to-r from-amber-950/70 via-[#2E2005] to-amber-950/70 border-amber-500 shadow-glow-gold'
                    : isCompleted
                    ? 'bg-[#0E2018]/90 border-emerald-700/80 hover:bg-[#122A1E]'
                    : 'bg-[#0C1527]/90 border-[#1E3258] opacity-75 hover:opacity-100 hover:border-slate-500'
                }`}
              >
                {/* Step Number & Label */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-xs ${
                    isPeak
                      ? 'bg-amber-400 text-pitch-950'
                      : isCurrent
                      ? 'bg-fortegreen-neon text-pitch-950 animate-pulse'
                      : isSafeHaven
                      ? 'bg-amber-500 text-pitch-950'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-pitch-800 text-slate-400'
                  }`}>
                    {rung.step}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-display font-black text-xs sm:text-sm tracking-wide ${
                        isPeak ? 'text-amber-300' : isCurrent ? 'text-white' : isSafeHaven ? 'text-amber-200' : isCompleted ? 'text-slate-200' : 'text-slate-400'
                      }`}>
                        {rung.label}
                      </span>

                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-fortegreen-neon text-pitch-950 font-display font-black text-[10px] uppercase tracking-wider animate-bounce">
                          YOU ARE HERE
                        </span>
                      )}

                      {isSafeHaven && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-pitch-950 font-display font-black text-[10px] uppercase tracking-wider">
                          SAFE HAVEN
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      Stake: ₦{rung.stake.toLocaleString()} &bull; Odds: {rung.odds.toFixed(2)}x
                    </div>
                  </div>
                </div>

                {/* Target Amount */}
                <div className="text-right">
                  <span className={`font-display font-black text-base sm:text-lg block tracking-tight ${
                    isPeak
                      ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : isCurrent
                      ? 'text-fortegreen-neon drop-shadow-[0_0_10px_rgba(0,230,118,0.5)]'
                      : isSafeHaven
                      ? 'text-amber-400'
                      : isCompleted
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}>
                    ₦{rung.payout.toLocaleString()}
                  </span>

                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {isCompleted ? 'Cleared' : isCurrent ? 'Target Today' : 'Potential'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggle View Button */}
      <div className="mt-5 text-center">
        <button
          onClick={() => setShowFull(!showFull)}
          className="px-4 py-2 bg-pitch-850 hover:bg-[#182847] border border-[#21355D] text-slate-200 font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-2"
        >
          {showFull ? (
            <>
              <ChevronUp className="w-4 h-4 text-fortegreen-neon" />
              <span>Show Focus View (Steps 1–8)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 text-fortegreen-neon" />
              <span>Show Full 18-Step Mountain Peak</span>
            </>
          )}
        </button>
      </div>

      {/* Mathematical Reality Check Note */}
      <div className="mt-6 pt-4 border-t border-[#1E3258] text-xs text-slate-400 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-300">Mathematical Transparency:</strong> Rollovers are high variance. Reaching Step 18 from ₦1,000 without banking requires 18 consecutive wins. BRYME logs all losses honestly in the public ledger.
        </p>
      </div>

    </div>
  );
}

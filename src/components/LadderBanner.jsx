import React, { useState } from 'react';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import { Copy, Check, ArrowRight, Zap, Trophy } from 'lucide-react';

export default function LadderBanner({ onNavigate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ACTIVE_CHALLENGE.todaysCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-[#050A14]/95 backdrop-blur-md border-b-2 border-fortegreen-neon/40 shadow-glow-green">
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Challenge Info */}
        <div 
          onClick={() => onNavigate('ladder')}
          className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-[280px]"
        >
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fortegreen-neon opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-fortegreen-neon shadow-[0_0_8px_#00E676]"></span>
          </span>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-display font-black tracking-wide text-white">
            <span className="text-fortegreen-neon uppercase flex items-center gap-1">
              <Zap className="w-4 h-4 fill-fortegreen-neon text-fortegreen-neon" />
              LADDER #{ACTIVE_CHALLENGE.challengeNumber}
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-white">STEP {ACTIVE_CHALLENGE.currentDay}/18</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-amber-400 font-mono font-bold">
              PURSE: ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
            </span>
          </div>

          <span className="text-[11px] text-fortegreen-neon font-display font-bold group-hover:underline flex items-center gap-0.5 ml-1 hidden sm:inline-flex">
            <span>Open Ladder</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* Today's 1.50 Code with Instant Copy */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center bg-[#091224] border border-fortegreen-neon/60 rounded-xl px-2.5 py-1 text-xs shadow-sm">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold mr-1.5 hidden md:inline">
              Daily 1.50 Code:
            </span>
            <span className="font-mono font-black text-fortegreen-neon tracking-wider text-xs sm:text-sm">
              {ACTIVE_CHALLENGE.todaysCode}
            </span>
            <button
              onClick={handleCopy}
              title="Copy code to clipboard"
              className="ml-2 p-1 rounded-md hover:bg-fortegreen-neon hover:text-pitch-950 text-slate-300 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-fortegreen-neon" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            onClick={() => onNavigate('ladder')}
            className="px-3 py-1 bg-fortegreen-neon hover:bg-[#00c853] text-pitch-950 font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-fortegreen-neon/20 flex items-center gap-1"
          >
            <span>Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
}

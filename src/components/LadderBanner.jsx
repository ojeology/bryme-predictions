import React, { useState } from 'react';
import { ACTIVE_CHALLENGE } from '../data/ladder';
import { Trophy, Copy, Check, ArrowRight, Zap } from 'lucide-react';

export default function LadderBanner({ onNavigate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ACTIVE_CHALLENGE.todaysCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-pitch-950/95 backdrop-blur-md border-b border-brand-green/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2">
        {/* Challenge Info */}
        <div 
          onClick={() => onNavigate('ladder')}
          className="flex items-center gap-2 cursor-pointer group flex-1 min-w-[260px]"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green"></span>
          </span>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-wide text-slate-200">
            <span className="text-brand-green font-bold uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-brand-green" />
              Ladder #{ACTIVE_CHALLENGE.challengeNumber}
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-300">Day {ACTIVE_CHALLENGE.currentDay}/18</span>
            <span className="text-slate-500">&bull;</span>
            <span className="hidden xs:inline text-amber-400 font-mono">
              Purse: ₦{ACTIVE_CHALLENGE.currentBalance.toLocaleString()}
            </span>
          </div>

          <span className="text-[11px] text-brand-greenLight font-medium group-hover:underline flex items-center gap-0.5 ml-1">
            <span className="hidden sm:inline">View Ledger</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>

        {/* Today's 1.50 Code with Instant Copy */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center bg-pitch-850 border border-brand-green/40 rounded-lg px-2 py-1 text-xs">
            <span className="text-[11px] text-slate-400 font-medium mr-1.5 hidden md:inline">
              Today's 1.50 Code:
            </span>
            <span className="font-mono font-bold text-brand-green tracking-wider text-xs sm:text-sm">
              {ACTIVE_CHALLENGE.todaysCode}
            </span>
            <button
              onClick={handleCopy}
              title="Copy code to clipboard"
              className="ml-2 p-1 rounded hover:bg-pitch-750 text-slate-300 hover:text-white transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          <button
            onClick={() => onNavigate('ladder')}
            className="px-2.5 py-1 bg-brand-green hover:bg-brand-greenDark text-pitch-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
}

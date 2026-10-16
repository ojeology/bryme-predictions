import React, { useState } from 'react';
import { Copy, Check, ChevronRight, Zap } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function SportyMatchRow({ match, onSelectOdd, selectedOdds = [], onNavigate }) {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (match.bookingCode) {
      navigator.clipboard.writeText(match.bookingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Helper to check if an odd is currently selected in betslip
  const isOddSelected = (pickKey) => {
    return selectedOdds.includes(`${match.id}-${pickKey}`);
  };

  const handleOddClick = (e, pickKey, oddsValue) => {
    e.stopPropagation();
    if (onSelectOdd) {
      onSelectOdd(match, pickKey, oddsValue);
    }
  };

  // Safe fallback odds
  const recommendedPick = match.recommendedPick || match.pick || '1X';
  const odds1 = match.odds1 || (match.odds ? (match.odds * 0.95).toFixed(2) : '1.85');
  const oddsX = match.oddsX || '3.25';
  const odds2 = match.odds2 || (match.odds ? (match.odds * 1.35).toFixed(2) : '3.80');

  return (
    <div 
      onClick={() => onNavigate && onNavigate(`ticket/${match.ticketId || match.id}`)}
      className="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-[#131C2E]/60 p-3 sm:p-3.5 transition-colors cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left Info: League, Teams, Recommended Pick */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1A2438] px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-slate-800">
              {match.kickoff || '16:00 WAT'}
            </span>
            <span>&bull;</span>
            <span className="truncate font-semibold text-slate-600 dark:text-slate-300">{match.league}</span>
            {match.status && match.status !== 'pending' && (
              <StatusBadge status={match.status} size="xs" />
            )}
          </div>

          {/* Teams Stacked */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-display font-bold text-slate-900 dark:text-white truncate">
              <span>{match.homeTeam || (match.match ? match.match.split('vs')[0] : 'Home')}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm font-display font-bold text-slate-900 dark:text-white truncate">
              <span>{match.awayTeam || (match.match ? match.match.split('vs')[1] : 'Away')}</span>
            </div>
          </div>

          {/* BRYME Verified Selection Pill & Code */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-display font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">
              <Zap className="w-3 h-3 text-blue-500 fill-blue-500" />
              <span>Smart Pick: <strong>{match.pick || recommendedPick}</strong> ({match.odds || odds1}x)</span>
            </span>

            {match.bookingCode && (
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 dark:bg-[#1A2438] border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="Copy booking code"
              >
                <span>Code: <strong>{match.bookingCode}</strong></span>
                {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            )}
          </div>
        </div>

        {/* Right Odds Boxes (The 1 X 2 Grid) */}
        <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
          
          {/* Box 1 (Home Win) */}
          <button
            onClick={(e) => handleOddClick(e, '1', odds1)}
            className={`odds-box w-14 sm:w-16 h-11 rounded-xl flex flex-col items-center justify-center border font-mono transition-all ${
              isOddSelected('1')
                ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/40'
                : 'bg-slate-100 dark:bg-[#131C2E] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500/60'
            }`}
          >
            <span className={`text-[9px] uppercase font-bold leading-none ${isOddSelected('1') ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>1</span>
            <span className={`text-xs sm:text-sm font-black mt-0.5 leading-none ${isOddSelected('1') ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{odds1}</span>
          </button>

          {/* Box X (Draw) */}
          <button
            onClick={(e) => handleOddClick(e, 'X', oddsX)}
            className={`odds-box w-14 sm:w-16 h-11 rounded-xl flex flex-col items-center justify-center border font-mono transition-all ${
              isOddSelected('X')
                ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/40'
                : 'bg-slate-100 dark:bg-[#131C2E] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500/60'
            }`}
          >
            <span className={`text-[9px] uppercase font-bold leading-none ${isOddSelected('X') ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>X</span>
            <span className={`text-xs sm:text-sm font-black mt-0.5 leading-none ${isOddSelected('X') ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{oddsX}</span>
          </button>

          {/* Box 2 (Away Win) */}
          <button
            onClick={(e) => handleOddClick(e, '2', odds2)}
            className={`odds-box w-14 sm:w-16 h-11 rounded-xl flex flex-col items-center justify-center border font-mono transition-all ${
              isOddSelected('2')
                ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/40'
                : 'bg-slate-100 dark:bg-[#131C2E] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500/60'
            }`}
          >
            <span className={`text-[9px] uppercase font-bold leading-none ${isOddSelected('2') ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>2</span>
            <span className={`text-xs sm:text-sm font-black mt-0.5 leading-none ${isOddSelected('2') ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{odds2}</span>
          </button>

          {/* More Markets Link */}
          <div className="hidden xs:flex items-center text-slate-400 hover:text-blue-500 p-1">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
}

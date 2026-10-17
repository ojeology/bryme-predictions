import React, { useState } from 'react';
import { EDITOR_PICKS } from '../data/editorPicks';
import StatusBadge from '../components/StatusBadge';
import { 
  Sparkles, ShieldAlert, Copy, Check, Info, Award, 
  Calendar, ArrowRight, TrendingUp 
} from 'lucide-react';

export default function EditorPicksPage({ onNavigate }) {
  const [copiedSat, setCopiedSat] = useState(false);
  const [copiedSun, setCopiedSun] = useState(false);

  const handleCopy = (code, day) => {
    navigator.clipboard.writeText(code);
    if (day === 'sat') {
      setCopiedSat(true);
      setTimeout(() => setCopiedSat(false), 2000);
    } else {
      setCopiedSun(true);
      setTimeout(() => setCopiedSun(false), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
            Editor's Best Pick (Saturday &amp; Sunday)
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Our editorial desk's lowest-risk selections of the weekend, assembled into disciplined 2.00 target odds slips.
        </p>
      </div>

      {/* Compliance Disclaimer Box */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-2xl p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 font-display font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-500" />
          <span>Strict Editorial Disclaimer</span>
        </div>
        <p className="text-amber-950 dark:text-slate-200 leading-relaxed text-[11px]">
          {EDITOR_PICKS.disclaimer}
        </p>
      </div>

      {/* Target Odds & Frequency Summary Bar */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Standard Target Odds</span>
          <span className="text-xl sm:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400">
            {EDITOR_PICKS.targetOdds}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Strictly targeted between 1.85 and 2.15 to balance model probability and value.
          </p>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">Release Schedule</span>
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
            {EDITOR_PICKS.releaseSchedule}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Verified on African bookmakers before publishing.
          </p>
        </div>
      </div>

      {/* Saturday Pick Card */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase">
                Saturday Banker
              </span>
              <StatusBadge status={EDITOR_PICKS.saturday.status} size="xs" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
              {EDITOR_PICKS.saturday.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{EDITOR_PICKS.saturday.date}</span>
              <span>&bull;</span>
              <span>{EDITOR_PICKS.saturday.bookmaker}</span>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Combined Odds</span>
            <span className="font-mono font-black text-xl text-emerald-600 dark:text-emerald-400">
              {EDITOR_PICKS.saturday.odds}x
            </span>
          </div>
        </div>

        {/* Matches */}
        <div className="space-y-2.5">
          {EDITOR_PICKS.saturday.selections.map((sel, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-[#121B2F] rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-slate-900 dark:text-white text-sm">{sel.match}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs px-2 py-0.5 bg-white dark:bg-[#162238] rounded border border-slate-200 dark:border-slate-700">
                  {sel.odds}x
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{sel.league}</span>
                <span>&bull;</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">Pick: {sel.pick}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                "{sel.rationale}"
              </p>
            </div>
          ))}
        </div>

        {/* Booking Code Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Booking Code:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#162238] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {EDITOR_PICKS.saturday.bookingCode}
            </span>
            <button
              onClick={() => handleCopy(EDITOR_PICKS.saturday.bookingCode, 'sat')}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              {copiedSat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSat ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Inspect Historical Hit Rate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sunday Pick Card */}
      <div className="bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-mono font-bold uppercase">
                Sunday Banker
              </span>
              <StatusBadge status={EDITOR_PICKS.sunday.status} size="xs" />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white">
              {EDITOR_PICKS.sunday.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{EDITOR_PICKS.sunday.date}</span>
              <span>&bull;</span>
              <span>{EDITOR_PICKS.sunday.bookmaker}</span>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Combined Odds</span>
            <span className="font-mono font-black text-xl text-emerald-600 dark:text-emerald-400">
              {EDITOR_PICKS.sunday.odds}x
            </span>
          </div>
        </div>

        {/* Matches */}
        <div className="space-y-2.5">
          {EDITOR_PICKS.sunday.selections.map((sel, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-[#121B2F] rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-slate-900 dark:text-white text-sm">{sel.match}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs px-2 py-0.5 bg-white dark:bg-[#162238] rounded border border-slate-200 dark:border-slate-700">
                  {sel.odds}x
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{sel.league}</span>
                <span>&bull;</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">Pick: {sel.pick}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                "{sel.rationale}"
              </p>
            </div>
          ))}
        </div>

        {/* Booking Code Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Booking Code:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#162238] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              {EDITOR_PICKS.sunday.bookingCode}
            </span>
            <button
              onClick={() => handleCopy(EDITOR_PICKS.sunday.bookingCode, 'sun')}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              {copiedSun ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSun ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-display font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Inspect Historical Hit Rate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

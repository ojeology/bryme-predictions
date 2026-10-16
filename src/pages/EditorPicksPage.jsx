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
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-pitch-800 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-400" />
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Editor's Best Pick (Saturday &amp; Sunday)
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Our editorial desk's lowest-risk selections of the weekend, assembled into disciplined 2.00 target odds slips.
        </p>
      </div>

      {/* Mandatory Compliance Disclaimer Box (Per Section 7) */}
      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-400 uppercase tracking-wide">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>Strict Editorial Disclaimer</span>
        </div>
        <p className="text-slate-200 leading-relaxed">
          <strong>"{EDITOR_PICKS.disclaimer}"</strong> We describe these selections strictly as our most confident selections or lowest-risk picks based on form metrics. We never use terms like "banker guaranteed" or promise any certainty.
        </p>
      </div>

      {/* Editor's Historical Track Record Stats */}
      <div className="bg-pitch-850 border border-pitch-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-400 block">
            Transparent Best Pick Record (Tracked by BRYME)
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-emerald-400 font-bold font-mono text-base">
              {EDITOR_PICKS.trackedRecord.won} Won
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-rose-400 font-bold font-mono text-base">
              {EDITOR_PICKS.trackedRecord.lost} Lost
            </span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-amber-400 font-bold font-mono text-base">
              {EDITOR_PICKS.trackedRecord.void} Void
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 block">Sample Demonstration Archive</span>
          <span>Targeting disciplined ~2.00 odds</span>
        </div>
      </div>

      {/* Two Featured Tickets: Saturday and Sunday */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Saturday Best Pick */}
        <div className="bg-brand-card border border-brand-cardBorder rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-pitch-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-brand-green/20 text-brand-green border border-brand-green/40 text-xs font-bold uppercase">
                  Saturday 2-Odds
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {EDITOR_PICKS.saturdayPick.date}
                </span>
              </div>

              <span className="font-mono font-extrabold text-base text-brand-green bg-pitch-950 px-2.5 py-1 rounded-lg border border-pitch-800">
                {EDITOR_PICKS.saturdayPick.targetOdds}x
              </span>
            </div>

            <h2 className="text-lg font-bold text-white mb-2">
              {EDITOR_PICKS.saturdayPick.title}
            </h2>

            <p className="text-xs text-slate-400 mb-4">
              {EDITOR_PICKS.saturdayPick.summaryNote}
            </p>

            {/* Selections with detailed tactical reasoning */}
            <div className="space-y-3">
              {EDITOR_PICKS.saturdayPick.selections.map((sel, idx) => (
                <div key={idx} className="bg-pitch-900 rounded-xl p-3.5 border border-pitch-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-100">
                    <span>{sel.match}</span>
                    <span className="font-mono text-brand-green text-xs px-2 py-0.5 bg-pitch-800 rounded">
                      {sel.odds}
                    </span>
                  </div>

                  <div className="text-[11px] text-amber-300 font-medium">
                    {sel.league} &bull; Pick: <strong>{sel.pick}</strong> ({sel.market})
                  </div>

                  <div className="bg-pitch-950 p-2.5 rounded-lg border border-pitch-850 text-[11px] text-slate-300">
                    <strong className="text-slate-400 block mb-0.5 uppercase tracking-wide text-[9px]">
                      Tactical Reasoning &amp; Head-to-Head:
                    </strong>
                    {sel.reasoning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-pitch-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 bg-pitch-950 px-2.5 py-1.5 rounded-lg border border-pitch-800">
              <span className="text-slate-400 font-mono text-[10px]">Bet9ja:</span>
              <span className="font-mono font-bold text-slate-200">{EDITOR_PICKS.saturdayPick.bookingCode}</span>
              <button
                onClick={() => handleCopy(EDITOR_PICKS.saturdayPick.bookingCode, 'sat')}
                className="p-1 hover:text-brand-green text-slate-400"
                title="Copy code"
              >
                {copiedSat ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <StatusBadge status={EDITOR_PICKS.saturdayPick.status} size="xs" />
          </div>
        </div>

        {/* Sunday Best Pick */}
        <div className="bg-brand-card border border-brand-cardBorder rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-pitch-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-brand-green/20 text-brand-green border border-brand-green/40 text-xs font-bold uppercase">
                  Sunday 2-Odds
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {EDITOR_PICKS.sundayPick.date}
                </span>
              </div>

              <span className="font-mono font-extrabold text-base text-brand-green bg-pitch-950 px-2.5 py-1 rounded-lg border border-pitch-800">
                {EDITOR_PICKS.sundayPick.targetOdds}x
              </span>
            </div>

            <h2 className="text-lg font-bold text-white mb-2">
              {EDITOR_PICKS.sundayPick.title}
            </h2>

            <p className="text-xs text-slate-400 mb-4">
              {EDITOR_PICKS.sundayPick.summaryNote}
            </p>

            {/* Selections with detailed tactical reasoning */}
            <div className="space-y-3">
              {EDITOR_PICKS.sundayPick.selections.map((sel, idx) => (
                <div key={idx} className="bg-pitch-900 rounded-xl p-3.5 border border-pitch-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-100">
                    <span>{sel.match}</span>
                    <span className="font-mono text-brand-green text-xs px-2 py-0.5 bg-pitch-800 rounded">
                      {sel.odds}
                    </span>
                  </div>

                  <div className="text-[11px] text-amber-300 font-medium">
                    {sel.league} &bull; Pick: <strong>{sel.pick}</strong> ({sel.market})
                  </div>

                  <div className="bg-pitch-950 p-2.5 rounded-lg border border-pitch-850 text-[11px] text-slate-300">
                    <strong className="text-slate-400 block mb-0.5 uppercase tracking-wide text-[9px]">
                      Tactical Reasoning &amp; Head-to-Head:
                    </strong>
                    {sel.reasoning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-pitch-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 bg-pitch-950 px-2.5 py-1.5 rounded-lg border border-pitch-800">
              <span className="text-slate-400 font-mono text-[10px]">Sporty:</span>
              <span className="font-mono font-bold text-slate-200">{EDITOR_PICKS.sundayPick.bookingCode}</span>
              <button
                onClick={() => handleCopy(EDITOR_PICKS.sundayPick.bookingCode, 'sun')}
                className="p-1 hover:text-brand-green text-slate-400"
                title="Copy code"
              >
                {copiedSun ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <StatusBadge status={EDITOR_PICKS.sundayPick.status} size="xs" />
          </div>
        </div>

      </div>

    </div>
  );
}

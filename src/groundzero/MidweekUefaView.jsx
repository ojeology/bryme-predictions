import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { toSlug } from './utils';

export default function MidweekUefaView({ data, onNavigate }) {
  const [comp, setComp] = useState('ucl'); // 'ucl' | 'uel'

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#0B1222] border border-blue-500/40 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500 text-white font-mono font-black text-[10px] uppercase">
            MIDWEEK EUROPEAN INTELLIGENCE &bull; AUTO-RETRAINED POST MATCHDAY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            UEFA Champions League &amp; Europa / Conference League Behaviour Lab
          </h1>
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <button
            onClick={() => setComp('ucl')}
            className={`px-3.5 py-2 rounded-xl font-black ${comp === 'ucl' ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-300'}`}
          >
            🔵 Champions League (16/18 Strict Won)
          </button>
          <button
            onClick={() => setComp('uel')}
            className={`px-3.5 py-2 rounded-xl font-black ${comp === 'uel' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300'}`}
          >
            🟠 Europa &amp; Conference
          </button>
        </div>
      </div>

      {comp === 'ucl' ? (
        <div className="space-y-3">
          {(data.tuesdayUcl || []).map(fix => (
            <div key={fix.id} className="rounded-2xl bg-[#0B1222] border border-slate-800 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-blue-300">{fix.day} &bull; {fix.kickoff}</span>
                  <h2 className="text-lg font-black text-white">{fix.match}</h2>
                  <p className="text-xs text-slate-400">{fix.refereeNote}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 font-mono text-xs">
                  <div className="text-emerald-400 font-bold">{fix.smallLock?.pick} @ {fix.smallLock?.odds}</div>
                  <div className="text-amber-300 text-[11px]">{fix.valueBet?.pick} @ {fix.valueBet?.odds}</div>
                </div>
              </div>
              <p className="text-xs text-slate-300">{fix.whyPick}</p>
              <p className="text-xs text-rose-300 font-mono">🚫 Trap Warning: {fix.whyNotBet}</p>
              <div className="flex gap-2">
                <button onClick={() => onNavigate(`team/${toSlug(fix.homeTeam)}`)} className="px-2.5 py-1 rounded bg-white/5 text-cyan-300 font-mono text-[11px]">
                  {fix.homeTeam} Page &rarr;
                </button>
                <button onClick={() => onNavigate(`team/${toSlug(fix.awayTeam)}`)} className="px-2.5 py-1 rounded bg-white/5 text-amber-300 font-mono text-[11px]">
                  {fix.awayTeam} Page &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(data.thursdayUefa || []).map(m => (
            <div key={m.id} className="rounded-2xl bg-[#0B1222] border border-slate-800 p-5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-amber-300">{m.comp} &bull; {m.waveLabel}</span>
                  <h2 className="text-lg font-black text-white">{m.match}</h2>
                  <div className="text-xs font-mono text-emerald-400 font-bold">{m.twoTeamPick}</div>
                </div>
                {m.actualBoxScore && (
                  <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/30 font-mono text-xs text-emerald-300">
                    FT {m.actualBoxScore.score} &bull; Fouls {m.actualBoxScore.fouls} &bull; Corners {m.actualBoxScore.corners}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-300">{m.whyPick}</p>
              <p className="text-xs text-rose-300 font-mono">🚫 {m.whyNotBet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

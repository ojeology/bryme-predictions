import React, { useState, useMemo } from 'react';
import { RefreshCw, CheckCircle2, ShieldAlert, Calculator } from 'lucide-react';
import { poissonOverProb, toSlug } from './utils';

export default function RetrainingAndLedgerView({ data, initialSection = 'retrain', onNavigate }) {
  const [tab, setTab] = useState(initialSection || 'retrain'); // 'retrain' | 'ledger' | 'rules' | 'sim'
  const [ledgerFilter, setLedgerFilter] = useState('ALL');

  const clubsWithAvg = useMemo(
    () => (data.clubs || []).filter(c => c.averages?.fouls || c.averages?.foulsFor),
    [data.clubs]
  );

  const [homeSlug, setHomeSlug] = useState(clubsWithAvg[0]?.slug || 'bournemouth');
  const [awaySlug, setAwaySlug] = useState(clubsWithAvg[1]?.slug || 'monaco');
  const [refSlug, setRefSlug] = useState(data.referees?.[0]?.slug || '');
  const [market, setMarket] = useState('fouls');
  const [line, setLine] = useState('19.5');
  const [odds, setOdds] = useState('1.32');

  React.useEffect(() => {
    if (initialSection === 'ledger') setTab('ledger');
    else if (initialSection === 'rules') setTab('rules');
    else if (initialSection === 'calculator') setTab('sim');
    else setTab('retrain');
  }, [initialSection]);

  const filteredRows = useMemo(() => {
    return (data.ledger?.rows || []).filter(r => {
      if (ledgerFilter === 'UCL') return r.date === '2026-10-20' || r.date === '2026-10-21';
      if (ledgerFilter === 'UEL') return r.date === '2026-10-22';
      if (ledgerFilter === 'WON') return r.grade === 'WON';
      if (ledgerFilter === 'LOST') return r.grade === 'LOST';
      return true;
    });
  }, [data.ledger, ledgerFilter]);

  const simOut = useMemo(() => {
    const h = clubsWithAvg.find(c => c.slug === homeSlug) || clubsWithAvg[0];
    const a = clubsWithAvg.find(c => c.slug === awaySlug) || clubsWithAvg[1];
    const ref = (data.referees || []).find(r => r.slug === refSlug);
    const fMult = ref ? Math.max(0.88, Math.min(1.15, (ref.avgFouls || 23) / 23)) : 1.0;
    const cMult = ref ? Math.max(0.85, Math.min(1.22, (ref.avgYellows || 4.1) / 4.1)) : 1.0;

    let lambda = 22;
    if (h && a) {
      if (market === 'fouls') lambda = (((h.averages.fouls || 23) + (a.averages.fouls || 23)) / 2) * fMult;
      else if (market === 'corners') lambda = ((h.averages.corners || 10) + (a.averages.corners || 10)) / 2;
      else if (market === 'cards') lambda = (((h.averages.cards || 4.1) + (a.averages.cards || 4.1)) / 2) * cMult;
      else lambda = ((h.averages.tackles || 32) + (a.averages.tackles || 32)) / 2;
    }
    const prob = poissonOverProb(parseFloat(line) || 0, lambda) * 100;
    const implied = (1 / (parseFloat(odds) || 1.3)) * 100;
    return { lambda, prob, edge: prob - implied, ref };
  }, [clubsWithAvg, homeSlug, awaySlug, refSlug, market, line, odds, data.referees]);

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="rounded-3xl bg-[#0B1222] border border-slate-800 p-5 sm:p-6 space-y-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-400 text-slate-950 font-mono font-black text-[10px] uppercase">
            AUTOMATED POST-MATCHWEEK SELF-LEARNING ENGINE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            UCL &rarr; Europa/UECL &rarr; Weekend Auto-Retraining &amp; 54-Match Graded Ledger
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
          {[
            { id: 'retrain', label: '🔄 3-Window Auto-Retraining Loop' },
            { id: 'ledger', label: `📋 54-Match Graded Ledger (${data.meta.uclStrictRecord} UCL)` },
            { id: 'rules', label: `🛡️ ${data.rules?.length || 14} Active Engine Rules` },
            { id: 'sim', label: '🧮 2-Team + Referee Simulator' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-xl font-black ${
                tab === t.id ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: RETRAINING CYCLES */}
      {tab === 'retrain' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data.retrainingCycles || []).map(cy => (
            <div key={cy.id} className="rounded-3xl bg-[#0B1222] border border-emerald-500/35 p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black">
                    {cy.matchesGraded} MATCHES
                  </span>
                </div>
                <h2 className="text-base font-black text-white">{cy.window}</h2>
                <div className="text-xs font-mono text-amber-300 font-bold">{cy.status}</div>
                <p className="text-xs text-slate-300 leading-relaxed">{cy.whatUpdates}</p>
              </div>
              <button
                onClick={() => setTab('ledger')}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-mono text-xs font-bold"
              >
                Inspect Graded Ledger Rows &rarr;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: 54-MATCH GRADED LEDGER */}
      {tab === 'ledger' && (
        <div className="rounded-3xl bg-[#0B1222] border border-slate-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-300">
              UCL Strict #1 Lock: <strong className="text-emerald-400">{data.meta.uclStrictRecord}</strong> &bull; All 54 Primary-or-Alt: <strong className="text-amber-300">{data.meta.ledgerEitherRecord}</strong>
            </div>
            <div className="flex gap-1.5 flex-wrap font-mono text-xs">
              {[
                { id: 'ALL', label: 'All 54' },
                { id: 'UCL', label: 'Tue+Wed UCL (18)' },
                { id: 'UEL', label: 'Thu UEL/UECL (36)' },
                { id: 'WON', label: '✅ Strict WON (42)' },
                { id: 'LOST', label: '❌ Losses Studied (12)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setLedgerFilter(f.id)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold ${
                    ledgerFilter === f.id ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Competition</th>
                  <th className="p-2.5">Match (FT)</th>
                  <th className="p-2.5">Pre-Match Lock</th>
                  <th className="p-2.5">Actual FT Stats</th>
                  <th className="p-2.5">Grade</th>
                  <th className="p-2.5">Self-Learning Takeaway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.03]">
                    <td className="p-2.5 text-slate-400 whitespace-nowrap">{r.date}</td>
                    <td className="p-2.5 text-cyan-300">{r.competition}</td>
                    <td className="p-2.5 font-bold text-white whitespace-nowrap">
                      <button onClick={() => onNavigate(`team/${toSlug(r.home)}`)} className="hover:text-cyan-300 underline decoration-white/20">
                        {r.home}
                      </button>{' '}
                      vs{' '}
                      <button onClick={() => onNavigate(`team/${toSlug(r.away)}`)} className="hover:text-amber-300 underline decoration-white/20">
                        {r.away}
                      </button>{' '}
                      ({r.score_ft})
                    </td>
                    <td className="p-2.5 text-amber-300">{r.primary_market}</td>
                    <td className="p-2.5 text-slate-200">{r.actual_stat}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        r.grade === 'WON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="p-2.5 text-[11px] text-slate-400 max-w-sm">{r.error_analysis_and_learning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RULES CONSTITUTION */}
      {tab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.rules || []).map(rule => (
            <div key={rule.id} className="rounded-2xl bg-[#0B1222] border border-slate-800 p-5 space-y-2.5 text-xs">
              <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10px] uppercase">
                {rule.badge}
              </span>
              <h3 className="text-base font-black text-white">{rule.title}</h3>
              <div className="p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-[11px] text-cyan-300">
                {rule.example}
              </div>
              <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/35 text-rose-100">
                <strong className="text-rose-400 font-mono block text-[10px] uppercase">Public Mistake:</strong>
                {rule.whatPublicSees}
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/35 text-emerald-100">
                <strong className="text-emerald-400 font-mono block text-[10px] uppercase">Ground Zero Rule:</strong>
                {rule.whatMachineSees} — <strong>{rule.howToProfit}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: TWO-TEAM + REFEREE PURE OVER SIMULATOR */}
      {tab === 'sim' && (
        <div className="rounded-3xl bg-[#0B1222] border border-slate-800 p-6 space-y-5 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-sans font-black text-lg">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <span>Two-Team + Assigned Referee Pure OVER Line Evaluator</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Home Club</label>
              <select value={homeSlug} onChange={e => setHomeSlug(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
                {clubsWithAvg.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Away Club</label>
              <select value={awaySlug} onChange={e => setAwaySlug(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
                {clubsWithAvg.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Official Referee</label>
              <select value={refSlug} onChange={e => setRefSlug(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
                {(data.referees || []).map(r => <option key={r.slug} value={r.slug}>{r.name} ({r.avgYellows}YC)</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Pure OVER Market</label>
              <select value={market} onChange={e => setMarket(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
                <option value="fouls">Match Fouls OVER</option>
                <option value="corners">Match Corners OVER</option>
                <option value="cards">Match Yellow Cards OVER</option>
                <option value="tackles">Match Tackles OVER</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Published Bookie Line</label>
              <input type="number" step="0.5" value={line} onChange={e => setLine(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Live OVER Odds</label>
              <input type="number" step="0.01" value={odds} onChange={e => setOdds(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-black/50 border border-emerald-500/30">
            <div>
              <span className="text-slate-400 block">Ref-Adjusted Projection</span>
              <strong className="text-2xl text-white font-black">{Math.round(simOut.lambda)} ({simOut.lambda.toFixed(1)})</strong>
            </div>
            <div>
              <span className="text-slate-400 block">OVER {line} Model Prob</span>
              <strong className="text-2xl text-emerald-400 font-black">{simOut.prob.toFixed(1)}%</strong>
            </div>
            <div>
              <span className="text-slate-400 block">3.00x Slip Verdict</span>
              <strong className={`text-xl font-black ${simOut.prob >= 85 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {simOut.prob >= 85 ? '✅ APPROVED PURE OVER' : '🚫 DISQUALIFIED — LINE TOO HIGH'}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

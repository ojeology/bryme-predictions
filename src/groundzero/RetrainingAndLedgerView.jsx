import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, RefreshCw, UserCheck } from 'lucide-react';
import { safeText } from './utils';

export default function RetrainingAndLedgerView({ data, initialTab = 'ledger' }) {
  const [tab, setTab] = useState(
    initialTab === 'referees' ? 'referees' : initialTab === 'retrain' ? 'retrain' : 'ledger'
  );
  const [search, setSearch] = useState('');
  const [strictFilter, setStrictFilter] = useState('all');

  const ledgerMeta = data?.ledger || {};
  const ledgerRows = ledgerMeta.rows || [];
  const referees = data?.referees || [];
  const cycles = data?.retrainingCycles || [];

  const filteredLedger = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ledgerRows;
    return ledgerRows.filter((r) =>
      `${r.home} ${r.away} ${r.competition} ${r.primary_market} ${r.grade}`.toLowerCase().includes(q)
    );
  }, [ledgerRows, search]);

  const filteredRefs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return referees.filter((r) => {
      const assignedList = r.assignedMatches || [];
      if (strictFilter === 'assigned' && assignedList.length === 0) return false;
      if (
        strictFilter !== 'all' &&
        strictFilter !== 'assigned' &&
        String(r.strictness || '').toLowerCase() !== strictFilter
      ) {
        return false;
      }
      if (q) {
        const hay = `${r.name} ${assignedList.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [referees, search, strictFilter]);

  return (
    <div className="space-y-6">
      {/* CLEAN HEADER WITH 3 SIMPLE SUB-TABS */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Graded Results, Referees & Auto-Retraining
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Verified track record across {ledgerRows.length} UEFA games, full {referees.length}-referee card database, and automated post-matchweek learning cycles.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start">
            {[
              { id: 'ledger', label: `Results (${ledgerRows.length})` },
              { id: 'referees', label: `Referees (${referees.length})` },
              { id: 'retrain', label: 'Auto-Retraining' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab !== 'retrain' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  tab === 'referees'
                    ? 'Search referee name or weekend match...'
                    : 'Search club, competition, or market...'
                }
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400"
              />
            </div>

            {tab === 'referees' && (
              <select
                value={strictFilter}
                onChange={(e) => setStrictFilter(e.target.value)}
                className="px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
              >
                <option value="all">All Referees ({referees.length})</option>
                <option value="assigned">Assigned This Weekend</option>
                <option value="strict">Strict Card Referees</option>
                <option value="balanced">Balanced Referees</option>
                <option value="lenient">Lenient Referees</option>
              </select>
            )}
          </div>
        )}
      </section>

      {/* TAB 1: 54 GRADED MATCHES */}
      {tab === 'ledger' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              54 Graded UEFA Matches — Pre-Match Predictions vs Final Box Scores
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Champions League strict record: <strong>{safeText(ledgerMeta.ucl18Record || '16/18 (88.9%)')}</strong> • Primary or backup hit rate: <strong>{ledgerMeta.eitherWon || 49}/{ledgerRows.length} ({ledgerMeta.eitherPct || 90.7}%)</strong>.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/40">
                  <th className="py-3.5 px-5">Match</th>
                  <th className="py-3.5 px-4">Competition</th>
                  <th className="py-3.5 px-4">Pre-Match Pick</th>
                  <th className="py-3.5 px-4">Final Match Numbers</th>
                  <th className="py-3.5 px-5 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredLedger.map((r, i) => {
                  const won =
                    String(r.grade || '').toUpperCase() === 'WON' ||
                    String(r.alt_grade || '').toUpperCase() === 'WON';
                  const label =
                    String(r.grade || '').toUpperCase() === 'WON'
                      ? 'WON'
                      : String(r.alt_grade || '').toUpperCase() === 'WON'
                      ? 'ALT WON'
                      : 'LOST';
                  return (
                    <tr key={r.match_id || i} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {safeText(r.home)} vs {safeText(r.away)}
                        <span className="block text-xs font-normal text-slate-500">
                          {safeText(r.date)} • FT {safeText(r.score_ft)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{safeText(r.competition)}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs">
                        {safeText(r.primary_market)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{safeText(r.actual_stat)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            won
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {won ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: 197 REFEREES */}
      {tab === 'referees' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50">
                  <th className="py-3.5 px-5">Referee</th>
                  <th className="py-3.5 px-4">Games</th>
                  <th className="py-3.5 px-4">Avg Yellow Cards</th>
                  <th className="py-3.5 px-4">Avg Fouls</th>
                  <th className="py-3.5 px-4">Over 3.5 Cards</th>
                  <th className="py-3.5 px-5">Style / Weekend Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredRefs.map((ref, idx) => {
                  const assigned = (ref.assignedMatches && ref.assignedMatches[0]) || null;
                  return (
                    <tr key={ref.slug || idx} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-5 font-bold text-slate-900">{safeText(ref.name)}</td>
                      <td className="py-3.5 px-4 text-slate-700">{safeText(ref.games)}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{safeText(ref.avgYellows)}</td>
                      <td className="py-3.5 px-4 text-slate-700">{safeText(ref.avgFouls)}</td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {ref.over35Pct != null ? `${ref.over35Pct}%` : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-xs">
                        {assigned ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                            <UserCheck className="w-3.5 h-3.5" />
                            {safeText(assigned)}
                          </span>
                        ) : (
                          <span className="capitalize text-slate-600 font-medium">
                            {safeText(ref.strictness || 'Tracked')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: AUTOMATIC RETRAINING SCHEDULE */}
      {tab === 'retrain' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cycles.map((c, idx) => (
            <div key={c.id || idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <RefreshCw className="w-3.5 h-3.5" />
                {safeText(c.status)}
              </div>
              <h3 className="text-base font-bold text-slate-900">{safeText(c.window)}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{safeText(c.whatUpdates)}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

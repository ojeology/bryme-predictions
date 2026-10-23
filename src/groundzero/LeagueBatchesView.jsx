import React, { useState, useMemo, useEffect } from 'react';
import { UserCheck, Search, ShieldCheck, AlertTriangle } from 'lucide-react';
import { safeText } from './utils';

const TOP5_UEFA_SLUGS = new Set([
  'premier-league',
  'la-liga',
  'bundesliga',
  'serie-a',
  'ligue-1',
  'champions-league',
  'europa-league',
]);

export default function LeagueBatchesView({ data, initialDay = 'all', initialLeague = 'all', navigate }) {
  const [day, setDay] = useState(initialDay || 'all');
  const [leagueFilter, setLeagueFilter] = useState(initialLeague && initialLeague !== 'all' ? initialLeague : 'top5');
  const [search, setSearch] = useState('');
  const [only90Locks, setOnly90Locks] = useState(false);

  useEffect(() => {
    setDay(initialDay || 'all');
  }, [initialDay]);

  useEffect(() => {
    setLeagueFilter(initialLeague && initialLeague !== 'all' ? initialLeague : 'top5');
  }, [initialLeague]);

  const batches = data?.leagueBatches || [];
  const meta = data?.meta || {};

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return batches
      .filter((b) => {
        if (leagueFilter === 'all') return true;
        if (leagueFilter === 'top5') return TOP5_UEFA_SLUGS.has(b.slug);
        return b.slug === leagueFilter;
      })
      .map((b) => {
        const matches = (b.matches || []).filter((m) => {
          if (day !== 'all' && m.dayBucket !== day) return false;
          if (only90Locks && !m.is90PlusLock) return false;
          if (q) {
            const hay = `${m.homeName} ${m.awayName} ${b.name} ${m.referee?.name || ''} ${m.bestPick1 || ''}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });
        return { ...b, matches };
      })
      .filter((b) => b.matches.length > 0);
  }, [batches, day, leagueFilter, search, only90Locks]);

  const totalShown = filteredBatches.reduce((acc, b) => acc + b.matches.length, 0);

  return (
    <div className="space-y-6">
      {/* HEADER & SIMPLE FILTERS INCLUDING MIDWEEK EUROPE */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Weekend & Midweek Matches — Batched by League
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Each league starts with its real 2026–27 averages, followed by every game, its assigned referee, two-team hit rates, and the exact Max Safe Bookmaker Line.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg self-start">
            Showing {totalShown} matches in {filteredBatches.length} leagues
          </div>
        </div>

        {/* DAY TABS (INCLUDING MIDWEEK EUROPE UCL/UEL!) + SEARCH + 90%+ LOCK FILTER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'All Windows' },
              { id: 'fri', label: `Friday (${meta.friCount || ''})` },
              { id: 'sat', label: `Saturday (${meta.satCount || ''})` },
              { id: 'sun', label: `Sunday (${meta.sunCount || ''})` },
              { id: 'midweek', label: `Midweek & UCL/UEL (${meta.midweekCount || ''})` },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDay(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  day === d.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search club, league, referee..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl cursor-pointer select-none">
              <input
                type="checkbox"
                checked={only90Locks}
                onChange={(e) => setOnly90Locks(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>90%+ Locks Only</span>
            </label>
          </div>
        </div>

        {/* SIMPLE HORIZONTAL LEAGUE SELECTOR */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setLeagueFilter('top5')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
              leagueFilter === 'top5'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Top 5 Leagues + UEFA
          </button>
          <button
            type="button"
            onClick={() => setLeagueFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
              leagueFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All {batches.length} Competitions
          </button>
          {batches.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => setLeagueFilter(b.slug === leagueFilter ? 'all' : b.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border ${
                leagueFilter === b.slug
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {safeText(b.flag)} {safeText(b.name)} ({(b.matches || []).length})
            </button>
          ))}
        </div>
      </section>

      {/* CLEAN LEAGUE-BY-LEAGUE SECTIONS */}
      <div className="space-y-6">
        {filteredBatches.map((batch) => (
          <section
            key={batch.slug}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* LEAGUE BEHAVIOUR HEADER */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-4 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {safeText(batch.flag)} {safeText(batch.name)}
                  <span className="ml-2 text-xs font-medium text-slate-500">
                    ({batch.matches.length} {batch.matches.length === 1 ? 'match' : 'matches'})
                  </span>
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg">
                    2026–27 Avg Corners: <strong>{batch.avgCorners}</strong>
                  </span>
                  <span className="bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg">
                    Avg Fouls: <strong>{batch.avgFouls}</strong>
                  </span>
                  <span className="bg-white border border-slate-200 text-slate-700 font-medium px-2.5 py-1 rounded-lg">
                    Avg Cards: <strong>{batch.avgCards}</strong>
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {safeText(batch.patternSummary)}
              </p>
            </div>

            {/* CLEAN MATCH CARDS INSIDE THIS LEAGUE */}
            <div className="divide-y divide-slate-200">
              {batch.matches.map((m) => {
                const ref = m.referee;
                return (
                  <div key={m.id} className="p-5 sm:p-6 hover:bg-slate-50/40 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* LEFT: KICKOFF + CLICKABLE TEAMS + REFEREE + LIVE BOX SCORE */}
                      <div className="space-y-2 max-w-xl">
                        <div className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-2">
                          <span>{safeText(m.dayLabel || m.date)}</span>
                          <span>•</span>
                          <span>{safeText(m.kickoff)}</span>
                          {m.venue ? (
                            <>
                              <span>•</span>
                              <span>{safeText(m.venue)}</span>
                            </>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900">
                          <button
                            type="button"
                            onClick={() => navigate(`/team/${m.homeSlug}`)}
                            className="inline-flex items-center gap-2 hover:text-emerald-700 underline decoration-slate-300 underline-offset-4"
                          >
                            {m.homeBadge ? (
                              <img src={m.homeBadge} alt="" className="w-5 h-5 object-contain" />
                            ) : null}
                            <span>{safeText(m.homeName)}</span>
                          </button>

                          <span className="text-sm font-normal text-slate-400">vs</span>

                          <button
                            type="button"
                            onClick={() => navigate(`/team/${m.awaySlug}`)}
                            className="inline-flex items-center gap-2 hover:text-emerald-700 underline decoration-slate-300 underline-offset-4"
                          >
                            {m.awayBadge ? (
                              <img src={m.awayBadge} alt="" className="w-5 h-5 object-contain" />
                            ) : null}
                            <span>{safeText(m.awayName)}</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {ref && ref.name ? (
                            <span className="inline-flex flex-wrap items-center gap-1.5 text-xs bg-amber-50/90 text-slate-800 border border-amber-200 px-3 py-1 rounded-lg">
                              <UserCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span>
                                Referee: <strong>{safeText(ref.name)}</strong>
                                {ref.avg_yellows != null ? ` • ${ref.avg_yellows} yellows/g` : ''}
                                {ref.avg_fouls != null ? ` • ${ref.avg_fouls} fouls/g` : ''}
                                {ref.strictness ? ` (${safeText(ref.strictness)})` : ''}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">Referee: Not yet announced</span>
                          )}

                          {m.liveBoxScore ? (
                            <span className="text-xs font-semibold text-sky-900 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                              {safeText(m.liveBoxScore)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* RIGHT: #1 PICK + 2-COLOR BOOKMAKER SAFETY GUARDRAIL BADGE */}
                      <div
                        className={`lg:w-[410px] rounded-xl p-4 shrink-0 border space-y-2 ${
                          m.is90PlusLock
                            ? 'bg-emerald-50/75 border-emerald-300'
                            : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          {m.is90PlusLock ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              90%+ Two-Sided Lock
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                              Best Statistical Angle
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3 text-amber-700" />
                            {safeText(m.lineSafetyBadge)}
                          </span>
                        </div>

                        <div className="text-sm sm:text-base font-bold text-slate-900">
                          {safeText(m.bestPick1)}
                        </div>

                        {m.bestPick2 ? (
                          <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-700">
                            <span className="font-semibold text-slate-500">Option 2: </span>
                            <span className="font-medium">{safeText(m.bestPick2)}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

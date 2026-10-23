import React, { useState, useMemo } from 'react';
import { Scale, ChevronDown, ChevronUp, ArrowUpRight, AlertTriangle } from 'lucide-react';

export default function LeagueBatchesView({ data, initialDay = 'ALL', initialLeague = 'ALL', onNavigate }) {
  const [dayFilter, setDayFilter] = useState(initialDay || 'ALL'); // 'ALL' | '2026-10-23' | '2026-10-24' | '2026-10-25'
  const [leagueFilter, setLeagueFilter] = useState(initialLeague || 'ALL');
  const [onlyWithRef, setOnlyWithRef] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  React.useEffect(() => {
    if (initialDay === 'sat') setDayFilter('2026-10-24');
    else if (initialDay === 'sun') setDayFilter('2026-10-25');
    else if (initialDay === 'fri') setDayFilter('2026-10-23');
    else setDayFilter('ALL');
  }, [initialDay]);

  const batches = useMemo(() => {
    return (data.leagueBatches || [])
      .filter(b => leagueFilter === 'ALL' || b.slug === leagueFilter)
      .map(b => {
        const matches = b.matches.filter(m => {
          const dayOk = dayFilter === 'ALL' || m.date === dayFilter;
          const refOk = !onlyWithRef || Boolean(m.referee);
          return dayOk && refOk;
        });
        return { ...b, matches };
      })
      .filter(b => b.matches.length > 0);
  }, [data.leagueBatches, dayFilter, leagueFilter, onlyWithRef]);

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="rounded-3xl bg-[#0B1222] border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-mono font-black text-[10px] uppercase">
              LEAGUE-BY-LEAGUE BEHAVIOUR INTELLIGENCE &bull; 120 WEEKEND FIXTURES
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Weekend Matches Batched by League DNA, Referee &amp; Best Picks
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Every league header shows its structural foul/corner/card DNA &amp; bookmaker trap warning. Click <strong>any club name/badge</strong> to open its dedicated Walk-Forward Team Page.
            </p>
          </div>

          {/* Day Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
            {[
              { id: 'ALL', label: `All (${data.meta.totalWeekendMatches})` },
              { id: '2026-10-23', label: `Fri 23 (${data.meta.fridayMatches})` },
              { id: '2026-10-24', label: `Sat 24 (${data.meta.saturdayMatches})` },
              { id: '2026-10-25', label: `Sun 25 (${data.meta.sundayMatches})` },
            ].map(d => (
              <button
                key={d.id}
                onClick={() => setDayFilter(d.id)}
                className={`px-3 py-2 rounded-xl font-black transition-all ${
                  dayFilter === d.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}

            <button
              onClick={() => setOnlyWithRef(v => !v)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border ${
                onlyWithRef
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                  : 'bg-slate-900 text-amber-300 border-amber-500/30'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Refs Assigned ({data.meta.assignedWeekendRefs})</span>
            </button>
          </div>
        </div>

        {/* Quick League Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          <button
            onClick={() => setLeagueFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
              leagueFilter === 'ALL' ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-900 text-slate-300'
            }`}
          >
            All {data.leagueBatches.length} Leagues
          </button>
          {data.leagueBatches.map(b => (
            <button
              key={b.slug}
              onClick={() => setLeagueFilter(b.slug)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold ${
                leagueFilter === b.slug ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              {b.flag} {b.name} ({b.totalMatches})
            </button>
          ))}
        </div>
      </div>

      {/* Render Each League Batch */}
      <div className="space-y-7">
        {batches.map(batch => (
          <section key={batch.slug} className="rounded-3xl border border-slate-800 bg-[#0A1120] overflow-hidden shadow-xl">
            {/* League Behaviour DNA Banner */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0F1B33] via-[#0C1527] to-[#09101E] border-b border-slate-800 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{batch.flag}</span>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{batch.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] font-bold">
                      {batch.matches.length} Matches Shown &bull; {batch.refsAssigned} Official Refs Linked
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{batch.patternSummary}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs flex-shrink-0">
                  <div className="px-3 py-2 rounded-xl bg-black/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">League Fouls</span>
                    <strong className="text-amber-300">{batch.avgFouls}/g</strong>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-black/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">League Corners</span>
                    <strong className="text-cyan-300">{batch.avgCorners}/g</strong>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-black/50 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">League Cards</span>
                    <strong className="text-rose-300">{batch.avgCards}/g</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 font-mono">
                  <strong>🎯 Best Market Target:</strong> {batch.softestMarket}
                </div>
                <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 font-mono flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Trap Alert:</strong> {batch.trapWarning}</span>
                </div>
              </div>
            </div>

            {/* League Match Cards */}
            <div className="divide-y divide-slate-800/80">
              {batch.matches.map(m => {
                const isOpen = expandedMatchId === m.id;
                return (
                  <div key={m.id} className="p-4 sm:p-5 hover:bg-white/[0.015] transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Club Badges + Clickable Team Links + Referee */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                            {m.dayLabel} &bull; {m.kickoff}
                          </span>
                          {m.venue && <span className="text-slate-400">{m.venue}</span>}
                          {m.referee ? (
                            <button
                              onClick={() => onNavigate(`referees/${m.referee.slug}`)}
                              className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 border ${
                                m.referee.strictness === 'strict'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              <Scale className="w-3 h-3" />
                              <span>Ref: {m.referee.name} ({m.referee.avg_fouls}F / {m.referee.avg_yellows}YC)</span>
                            </button>
                          ) : (
                            <span className="text-slate-500">Referee TBC</span>
                          )}
                        </div>

                        {/* Clickable Home vs Away Team Names & Crests */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <button
                            onClick={() => onNavigate(`team/${m.homeSlug}`)}
                            className="group flex items-center gap-2 text-left hover:text-cyan-300 transition-colors"
                          >
                            {m.homeBadge && <img src={m.homeBadge} alt="" className="w-6 h-6 object-contain" />}
                            <span className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 underline decoration-white/20">
                              {m.homeName}
                            </span>
                          </button>

                          <span className="font-mono text-xs text-slate-500">vs</span>

                          <button
                            onClick={() => onNavigate(`team/${m.awaySlug}`)}
                            className="group flex items-center gap-2 text-left hover:text-amber-300 transition-colors"
                          >
                            {m.awayBadge && <img src={m.awayBadge} alt="" className="w-6 h-6 object-contain" />}
                            <span className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 underline decoration-white/20">
                              {m.awayName}
                            </span>
                          </button>
                        </div>

                        {/* Best Match Picks */}
                        <div className="space-y-1 text-xs font-mono pt-0.5">
                          <div className="text-emerald-400 font-bold">✅ Best Pick #1: {m.bestPick1}</div>
                          <div className="text-amber-300">⚡ Best Pick #2: {m.bestPick2}</div>
                        </div>
                      </div>

                      {/* Right: Whole-Number Projections + Expand */}
                      <div className="flex items-center gap-3 self-end lg:self-center">
                        {m.projection && (
                          <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-black/50 border border-slate-800 font-mono text-center text-xs">
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Fouls</span>
                              <strong className="text-amber-300">{m.projection.fouls}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Corners</span>
                              <strong className="text-cyan-300">{m.projection.corners}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Cards</span>
                              <strong className="text-rose-300">{m.projection.cardsExact || m.projection.cards}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 uppercase block">Tackles</span>
                              <strong className="text-emerald-300">{m.projection.tackles}</strong>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedMatchId(isOpen ? null : m.id)}
                          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono font-bold text-white flex items-center gap-1"
                        >
                          <span>{isOpen ? 'Close' : 'Match Intel'}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-[#070C18] border border-cyan-500/30 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-cyan-400 uppercase block">Dedicated Home Dossier</span>
                            <strong className="text-white text-sm">{m.homeName}</strong>
                          </div>
                          <button
                            onClick={() => onNavigate(`team/${m.homeSlug}`)}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-black flex items-center gap-1"
                          >
                            <span>Open Club Page</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-[#070C18] border border-amber-500/30 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-amber-400 uppercase block">Dedicated Away Dossier</span>
                            <strong className="text-white text-sm">{m.awayName}</strong>
                          </div>
                          <button
                            onClick={() => onNavigate(`team/${m.awaySlug}`)}
                            className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center gap-1"
                          >
                            <span>Open Club Page</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-[#070C18] border border-rose-500/30 text-slate-300 font-sans">
                          <strong className="text-rose-300 font-mono block text-[10px] uppercase">Bookmaker Line Rule:</strong>
                          {m.bookieLineNote}
                        </div>
                      </div>
                    )}
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

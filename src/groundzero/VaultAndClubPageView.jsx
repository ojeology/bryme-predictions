import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, CheckCircle2, ArrowRight } from 'lucide-react';
import { safeText, resolveClub } from './utils';

export function VaultView({ data, navigate }) {
  const [search, setSearch] = useState('');

  const clubs = useMemo(() => {
    const raw = Array.isArray(data?.clubs) ? data.clubs : Object.values(data?.clubs || {});
    return [...raw].sort((a, b) => safeText(a.name).localeCompare(safeText(b.name)));
  }, [data]);

  const vaultLocks = useMemo(() => {
    const core = data?.vaultClubLocks || [];
    const globalFri = (data?.fridayGlobalLocks || []).map((g) => ({
      club: g.team || g.club,
      league: g.competition || g.league,
      market: g.market || g.pick,
      wins: g.wins,
      games: g.games,
      hitRate: 100,
      avg: g.avg,
      min: g.min,
    }));
    return [...core, ...globalFri];
  }, [data]);

  const filteredVault = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vaultLocks;
    return vaultLocks.filter((v) =>
      `${v.club} ${v.league || ''} ${v.market || ''}`.toLowerCase().includes(q)
    );
  }, [vaultLocks, search]);

  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clubs.slice(0, 64);
    return clubs.filter((c) => `${c.name} ${c.league || ''}`.toLowerCase().includes(q));
  }, [clubs, search]);

  const openClub = (nameOrSlug) => {
    const found = resolveClub(clubs, nameOrSlug);
    if (found?.slug) navigate(`/team/${found.slug}`);
  };

  return (
    <div className="space-y-8">
      {/* 1. CLEAN SEARCH HEADER */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              100% Club Vault & Team Pages
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Every club below has cleared its listed Over line in <strong>every tracked game this season</strong>. Click any club name to open its dedicated page, backtests, and match log.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg self-start">
            {vaultLocks.length} Unbroken 100% Streaks • {clubs.length} Club Pages
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search any club (e.g. Bournemouth, Stuttgart, Real Valladolid, Manchester City, Aston Villa)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400"
          />
        </div>
      </section>

      {/* 2. CLEAN 100% UNBROKEN STREAKS TABLE */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Unbroken 100% Season Streaks ({filteredVault.length})
          </h2>
          <span className="text-xs text-slate-500">Tap any row to open club report</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/40">
                <th className="py-3.5 px-5">Club</th>
                <th className="py-3.5 px-4">Safest Pure OVER Market</th>
                <th className="py-3.5 px-4">Season Record</th>
                <th className="py-3.5 px-4">Season Average</th>
                <th className="py-3.5 px-5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredVault.map((row, idx) => {
                const matchedClub = resolveClub(clubs, row.club);
                return (
                  <tr
                    key={`${row.club}-${row.market}-${idx}`}
                    onClick={() => openClub(row.club)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        {matchedClub?.badge ? (
                          <img src={matchedClub.badge} alt="" className="w-5 h-5 object-contain shrink-0" />
                        ) : null}
                        <div>
                          <div className="hover:text-emerald-700 underline decoration-slate-300 underline-offset-4">
                            {safeText(matchedClub?.name || row.club)}
                          </div>
                          {matchedClub?.league || row.league ? (
                            <div className="text-xs font-normal text-slate-500">
                              {safeText(matchedClub?.league || row.league)}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-800">
                      {safeText(row.market)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {row.wins && row.games ? `${row.wins} won out of ${row.games} (100%)` : '100%'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {row.avg != null ? `${row.avg} per game` : '—'}
                      {row.min != null ? ` (lowest: ${row.min})` : ''}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700">
                        Open Page <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. ALL 307 CLUBS DIRECTORY */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            All {clubs.length} Tracked Club Pages
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {search.trim()
              ? `Showing ${filteredClubs.length} matching clubs`
              : 'Showing first 64 clubs alphabetically — type any club name in the search bar above to find all 307 teams.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-4">
          {filteredClubs.map((club) => (
            <button
              key={club.slug}
              type="button"
              onClick={() => navigate(`/team/${club.slug}`)}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-400 text-left transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {club.badge ? (
                  <img src={club.badge} alt="" className="w-5 h-5 object-contain shrink-0" />
                ) : null}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {safeText(club.name)}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {safeText(club.league || 'Tracked Club')}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export function DedicatedTeamPage({ data, slug, navigate }) {
  const clubs = Array.isArray(data?.clubs) ? data.clubs : Object.values(data?.clubs || {});
  const club = resolveClub(clubs, slug);

  if (!club) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-900">Club page not found</h2>
        <p className="text-sm text-slate-600">
          Return to the Club Vault to search all 307 tracked clubs.
        </p>
        <button
          type="button"
          onClick={() => navigate('/vault')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Club Vault
        </button>
      </div>
    );
  }

  const averages = club.averages || {};
  const locks = club.pureOverLocks || [];
  const blindTests = (club.blindTests || []).filter(
    (b) => !String(b.market || '').toLowerCase().includes('goal')
  );
  const matches = club.matches || [];
  const nextFix = (club.upcomingFixtures && club.upcomingFixtures[0]) || null;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/vault')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to 100% Vault & All Clubs
        </button>
      </div>

      {/* 1. CLEAN TEAM HEADER + NEXT MATCH */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-center gap-4">
            {club.badge ? (
              <img src={club.badge} alt="" className="w-14 h-14 object-contain shrink-0" />
            ) : null}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {safeText(club.league)} • {safeText(club.tier || '2026–27 Club Behaviour Profile')}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {safeText(club.name)}
              </h1>
              {club.summary ? (
                <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {safeText(club.summary)}
                </p>
              ) : null}
            </div>
          </div>

          {nextFix && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 lg:w-[340px] shrink-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                Next Fixture ({safeText(nextFix.venue)})
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                vs{' '}
                {nextFix.opponentSlug ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/team/${nextFix.opponentSlug}`)}
                    className="underline decoration-emerald-400 underline-offset-4 hover:text-emerald-800"
                  >
                    {safeText(nextFix.opponent)}
                  </button>
                ) : (
                  safeText(nextFix.opponent)
                )}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                {safeText(nextFix.date)} at {safeText(nextFix.kickoff)} • {safeText(nextFix.comp)}
              </div>
              {nextFix.referee ? (
                <div className="text-xs text-slate-800 font-medium mt-1.5">
                  Referee: <strong>{safeText(nextFix.referee)}</strong>
                </div>
              ) : null}
              {nextFix.bestPick ? (
                <div className="text-xs font-bold text-emerald-900 mt-1.5 pt-1.5 border-t border-emerald-200">
                  Best Pick: {safeText(nextFix.bestPick)}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* 4 SIMPLE STAT CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Matches Logged</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{matches.length || '—'}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Match Corners Avg</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{safeText(averages.corners ?? '—')}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Match Fouls Avg</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{safeText(averages.fouls ?? '—')}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Match Cards Avg</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{safeText(averages.cards ?? '—')}</div>
          </div>
        </div>
      </section>

      {/* 2. VERIFIED PURE OVER SPECIALIST LINES */}
      {locks.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              High-Hit Pure OVER Markets for {safeText(club.name)}
            </h2>
          </div>
          <div className="divide-y divide-slate-200">
            {locks.map((lk, i) => (
              <div key={i} className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 text-sm sm:text-base">
                    {safeText(lk.market)}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Season average: <strong>{lk.avg}</strong> • Lowest single game: <strong>{lk.min}</strong> • Highest: <strong>{lk.max}</strong>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lk.wins}/{lk.games} Won ({lk.hitRate}%)
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. WALK-FORWARD BLIND TEST TABLE (MATCHING REPORT.md PLAIN-ENGLISH TABLE) */}
      {blindTests.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Blind Walk-Forward Backtests (Pre-Match Model vs Actual Result)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Generated strictly using prior games played before kickoff — zero future leakage.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/40">
                  <th className="py-3 px-5">Match</th>
                  <th className="py-3 px-4">Behaviour Market</th>
                  <th className="py-3 px-4">Pre-Match Model</th>
                  <th className="py-3 px-4">Actual Match Count</th>
                  <th className="py-3 px-5 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {blindTests.map((b, idx) => {
                  const won = String(b.result || '').toUpperCase().includes('WON');
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-5 font-semibold text-slate-900">{safeText(b.match)}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{safeText(b.market)}</td>
                      <td className="py-3 px-4 text-slate-600">{safeText(b.model)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{safeText(b.actual)}</td>
                      <td className="py-3 px-5 text-right">
                        <span
                          className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            won
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {safeText(b.result)}
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

      {/* 4. CHRONOLOGICAL 2026–27 MATCH LOG */}
      {matches.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Full 2026–27 Chronological Match Log ({matches.length} Games)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Format: Team count – Opponent count (Total in brackets).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/40">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-4">Opponent</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Corners (Team–Opp)</th>
                  <th className="py-3 px-4">Fouls (Team–Opp)</th>
                  <th className="py-3 px-4">Cards (Team–Opp)</th>
                  <th className="py-3 px-5">Referee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {matches
                  .filter((m) => m.totalCorners > 0 || m.totalFouls > 0 || m.totalCards > 0)
                  .map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-5 text-slate-600 whitespace-nowrap">{safeText(m.date)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {safeText(m.opponent)}
                        {m.comp ? <span className="block text-xs font-normal text-slate-500">{safeText(m.comp)}</span> : null}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{safeText(m.venue)}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {m.teamCorners}–{m.oppCorners} <span className="text-slate-500">({m.totalCorners})</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {m.teamFouls}–{m.oppFouls} <span className="text-slate-500">({m.totalFouls})</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {m.teamCards}–{m.oppCards} <span className="text-slate-500">({m.totalCards})</span>
                      </td>
                      <td className="py-3 px-5 text-slate-600 text-xs">{safeText(m.referee || '—')}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

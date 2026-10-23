import React, { useState, useMemo } from 'react';
import { Lock, Search, ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { resolveClub, toSlug, safeText } from './utils';

export function DedicatedTeamPage({ data, teamSlug, onNavigate }) {
  const club = useMemo(() => resolveClub(data.clubs, teamSlug), [data.clubs, teamSlug]);

  if (!club) return null;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Back Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => onNavigate('vault')}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to 100% Vault &amp; All {data.meta.totalClubs} Club Directory</span>
        </button>

        <button
          onClick={() => onNavigate('leagues')}
          className="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5"
        >
          <span>View League Matchweek Batch</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Club Intelligence Hero */}
      <div className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-[#0D182E] via-[#0A1222] to-[#060A14] p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            {club.badge ? (
              <img src={club.badge} alt={club.name} className="w-16 h-16 object-contain rounded-2xl bg-white/5 p-2 border border-white/10" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-2xl text-emerald-400">
                {club.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase">
                  {club.tier}
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold">{club.league}</span>
                {club.record && (
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold">
                    Walk-Forward: {club.record}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">{club.name}</h1>
              {club.summary && <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{club.summary}</p>}
            </div>
          </div>

          {/* Club Behaviour Averages */}
          {Object.keys(club.averages || {}).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center text-xs">
              <div className="p-3 rounded-2xl bg-black/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Match Fouls</span>
                <strong className="text-lg text-amber-300">{club.averages.fouls ?? '—'}</strong>
                {club.averages.foulsFor && <span className="text-[10px] text-slate-400 block">For {club.averages.foulsFor}</span>}
              </div>
              <div className="p-3 rounded-2xl bg-black/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Match Corners</span>
                <strong className="text-lg text-cyan-300">{club.averages.corners ?? '—'}</strong>
                {club.averages.cornersFor && <span className="text-[10px] text-slate-400 block">For {club.averages.cornersFor}</span>}
              </div>
              <div className="p-3 rounded-2xl bg-black/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Match Cards</span>
                <strong className="text-lg text-rose-300">{club.averages.cards ?? '—'}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-black/50 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Match Tackles</span>
                <strong className="text-lg text-emerald-300">{club.averages.tackles ?? '—'}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Weekend Fixture(s) Linked Directly to Opponent Page */}
        {club.upcomingFixtures?.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
              📅 Next Scheduled Match &amp; Pre-Match Intelligence Link
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              {club.upcomingFixtures.map((uf, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#070C18] border border-amber-400/30 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-slate-400">{uf.date} &bull; {uf.kickoff} &bull; {uf.comp} ({uf.venue})</div>
                    <div className="text-white font-bold text-sm">vs {uf.opponent} &bull; Ref: {uf.referee}</div>
                    <div className="text-emerald-400 font-bold">{uf.bestPick}</div>
                  </div>
                  <button
                    onClick={() => onNavigate(`team/${uf.opponentSlug}`)}
                    className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 font-black whitespace-nowrap"
                  >
                    Compare {uf.opponent} &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active 100% & 90%+ Pure OVER Specialist Locks */}
      <div className="rounded-3xl border border-slate-800 bg-[#0B1222] p-5 sm:p-6 space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          <span>Verified Pure OVER Specialist Floors ({club.pureOverLocks?.length || 0} Active)</span>
        </h2>

        {club.pureOverLocks?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Pure OVER Floor</th>
                  <th className="p-2.5">Season Record</th>
                  <th className="p-2.5">Hit Rate</th>
                  <th className="p-2.5">Min / Avg / Max</th>
                  <th className="p-2.5">2026–27 Game Sequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {club.pureOverLocks.map((lk, i) => (
                  <tr key={i}>
                    <td className="p-2.5 text-cyan-300 font-bold">{lk.category}</td>
                    <td className="p-2.5 text-amber-300 font-bold">{lk.market}</td>
                    <td className="p-2.5 text-white">{lk.wins}/{lk.games}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">{lk.hitRate}%</span>
                    </td>
                    <td className="p-2.5 text-slate-300">{lk.min} / {lk.avg} / {lk.max}</td>
                    <td className="p-2.5 text-slate-400">[{(lk.seasonArray || []).join(', ')}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs font-mono text-slate-400">
            Club baseline indexed — full 5-market 2026–27 game-by-game sequence scan populates automatically in the next test batch.
          </p>
        )}
      </div>

      {/* 2026-27 Raw Sequences Map if present */}
      {Object.keys(club.sequences2627 || {}).length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-[#0B1222] p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-black text-white">📊 Raw 2026–27 Game-by-Game Behaviour Sequences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {Object.entries(club.sequences2627).map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl bg-[#070C18] border border-slate-800">
                <span className="text-[10px] uppercase text-cyan-400 font-bold block">{k}</span>
                <div className="text-white font-bold mt-0.5 break-words">{safeText(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strict Walk-Forward Blind Test Table */}
      {club.blindTests?.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-[#0B1222] p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Walk-Forward Pre-Match Blind Tests (Zero Future Leakage)</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2.5">Match</th>
                  <th className="p-2.5">Market</th>
                  <th className="p-2.5">Pre-Match Model</th>
                  <th className="p-2.5">Bookie Line</th>
                  <th className="p-2.5">Actual FT</th>
                  <th className="p-2.5">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {club.blindTests.map((bt, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold text-white">{bt.match}</td>
                    <td className="p-2.5 text-amber-300">{bt.market}</td>
                    <td className="p-2.5 text-slate-200">{bt.model}</td>
                    <td className="p-2.5 text-slate-400">{bt.bookie}</td>
                    <td className="p-2.5 font-bold text-cyan-300">{bt.actual}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        bt.result === 'WON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {bt.result}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Full Chronological Season Match Log */}
      {club.matches?.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-[#0B1222] p-5 sm:p-6 space-y-3">
          <h2 className="text-lg font-black text-white">
            📂 Complete 2026–27 Chronological Match Log ({club.matches.length} Matches)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2">Date</th>
                  <th className="p-2">Comp</th>
                  <th className="p-2">Opponent</th>
                  <th className="p-2">Venue</th>
                  <th className="p-2">FT</th>
                  <th className="p-2">Fouls (For+Ag)</th>
                  <th className="p-2">Corners (For+Ag)</th>
                  <th className="p-2">Cards (For+Ag)</th>
                  <th className="p-2">Tackles (For+Ag)</th>
                  <th className="p-2">Referee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {club.matches.map((m, i) => (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="p-2 text-slate-400">{m.date}</td>
                    <td className="p-2 text-cyan-300">{m.comp}</td>
                    <td className="p-2 font-bold text-white">
                      <button onClick={() => onNavigate(`team/${toSlug(m.opponent)}`)} className="hover:text-amber-300 underline decoration-white/20">
                        {m.opponent}
                      </button>
                    </td>
                    <td className="p-2">{m.venue}</td>
                    <td className="p-2 font-bold text-emerald-400">{m.score}</td>
                    <td className="p-2 text-amber-300">{m.totalFouls} ({m.teamFouls}+{m.oppFouls})</td>
                    <td className="p-2 text-cyan-300">{m.totalCorners} ({m.teamCorners}+{m.oppCorners})</td>
                    <td className="p-2 text-rose-300">{m.totalCards} ({m.teamCards}+{m.oppCards})</td>
                    <td className="p-2 text-slate-200">{m.totalTackles} ({m.teamTackles}+{m.oppTackles})</td>
                    <td className="p-2 text-slate-400">{m.referee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VaultAndClubDirectoryView({ data, onNavigate }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('locks'); // 'locks' | 'clubs'

  const allPureOverLocks = useMemo(() => {
    const out = [];
    for (const c of data.clubs || []) {
      for (const lk of c.pureOverLocks || []) {
        out.push({ ...lk, clubSlug: c.slug, clubName: c.name, league: c.league, badge: c.badge });
      }
    }
    return out.sort((a, b) => b.hitRate - a.hitRate || b.wins - a.wins);
  }, [data.clubs]);

  const filteredLocks = useMemo(() => {
    return allPureOverLocks.filter(lk => {
      const q = search.trim().toLowerCase();
      const sOk = !q || lk.clubName.toLowerCase().includes(q) || lk.market.toLowerCase().includes(q) || lk.league.toLowerCase().includes(q);
      const cOk = catFilter === 'ALL' || lk.category.toLowerCase().includes(catFilter.toLowerCase());
      return sOk && cOk;
    });
  }, [allPureOverLocks, search, catFilter]);

  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data.clubs || []).filter(c => !q || c.name.toLowerCase().includes(q) || c.league.toLowerCase().includes(q));
  }, [data.clubs, search]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#0B1222] border border-emerald-500/40 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono font-black text-[10px] uppercase">
              100% SPECIALIST VAULT &amp; {data.meta.totalClubs} DEDICATED CLUB DOSSIERS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Pure OVER Specialist Vault — Click Any Club to Open Its Dedicated Page
            </h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setViewMode('locks')}
              className={`px-3.5 py-2 rounded-xl font-black ${
                viewMode === 'locks' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}
            >
              🔒 All Pure OVER Vault Locks ({allPureOverLocks.length})
            </button>
            <button
              onClick={() => setViewMode('clubs')}
              className={`px-3.5 py-2 rounded-xl font-black ${
                viewMode === 'clubs' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}
            >
              🏟️ All {data.meta.totalClubs} Dedicated Club Pages
            </button>
          </div>
        </div>

        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search any club (e.g. Stuttgart, Monza, Valladolid, Arsenal, Real Madrid, Go Ahead Eagles)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
            />
          </div>

          {viewMode === 'locks' && (
            <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
              {['ALL', 'Corners', 'Fouls', 'Tackles', 'Cards', 'SOT'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-3 py-2 rounded-xl font-bold ${
                    catFilter === cat ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewMode === 'locks' ? (
        <div className="rounded-3xl bg-[#0B1222] border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-3">Dedicated Club Page</th>
                  <th className="p-3">League</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Pure OVER Specialist Floor</th>
                  <th className="p-3">Record</th>
                  <th className="p-3">Hit %</th>
                  <th className="p-3">2026–27 Sequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredLocks.map((lk, i) => (
                  <tr
                    key={i}
                    onClick={() => onNavigate(`team/${lk.clubSlug}`)}
                    className="cursor-pointer hover:bg-emerald-500/[0.06] transition-colors"
                  >
                    <td className="p-3 font-bold text-white flex items-center gap-2 whitespace-nowrap">
                      {lk.badge && <img src={lk.badge} alt="" className="w-5 h-5 object-contain" />}
                      <span className="underline decoration-emerald-500/40">{lk.clubName}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    </td>
                    <td className="p-3 text-slate-400">{lk.league}</td>
                    <td className="p-3 text-cyan-300">{lk.category}</td>
                    <td className="p-3 font-bold text-amber-300">{lk.market}</td>
                    <td className="p-3 text-white">{lk.wins}/{lk.games}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                        lk.hitRate >= 100 ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {lk.hitRate}%
                      </span>
                    </td>
                    <td className="p-3 text-[10px] text-slate-400 max-w-xs truncate">[{(lk.seasonArray || []).join(', ')}]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredClubs.map(c => (
            <button
              key={c.slug}
              onClick={() => onNavigate(`team/${c.slug}`)}
              className="text-left p-4 rounded-2xl bg-[#0B1222] hover:bg-[#101B33] border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {c.badge ? (
                  <img src={c.badge} alt="" className="w-9 h-9 object-contain flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-black text-xs text-emerald-400 flex-shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-sm text-white truncate">{c.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">{c.league}</div>
                  <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                    {c.pureOverLocks?.length ? `${c.pureOverLocks.length} Pure OVER Locks` : 'Open Club Dossier'}
                    {c.matches?.length ? ` • ${c.matches.length} Logged Games` : ''}
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

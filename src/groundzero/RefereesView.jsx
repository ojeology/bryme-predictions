import React, { useState, useMemo } from 'react';
import { Scale, Search } from 'lucide-react';

export default function RefereesView({ data, highlightSlug = '', onNavigate }) {
  const [search, setSearch] = useState(highlightSlug ? highlightSlug.replace(/-/g, ' ') : '');
  const [strictFilter, setStrictFilter] = useState('ALL'); // 'ALL' | 'assigned' | 'strict' | 'balanced' | 'lenient'

  React.useEffect(() => {
    if (highlightSlug) setSearch(highlightSlug.replace(/-/g, ' '));
  }, [highlightSlug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data.referees || []).filter(r => {
      const sOk = !q || r.name.toLowerCase().includes(q) || r.slug.includes(q) || (r.assignedMatches || []).some(m => m.toLowerCase().includes(q));
      if (!sOk) return false;
      if (strictFilter === 'assigned') return (r.assignedMatches || []).length > 0;
      if (strictFilter !== 'ALL') return r.strictness === strictFilter;
      return true;
    });
  }, [data.referees, search, strictFilter]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-[#0B1222] border border-amber-400/40 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono font-black text-[10px] uppercase">
              REFEREE WHISTLE &amp; BOOKING INTELLIGENCE &bull; {data.meta.totalReferees} OFFICIALS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              2026–27 Referee Multipliers &amp; Assigned Matchweek Appointments
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Every assigned referee automatically scales our Two-Team Fouls &amp; Yellow Card expectations before checking real bookmaker lines.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
            {[
              { id: 'ALL', label: `All (${data.meta.totalReferees})` },
              { id: 'assigned', label: 'Assigned This Weekend' },
              { id: 'strict', label: '🔴 Strict Card Refs' },
              { id: 'balanced', label: '🟡 Balanced' },
              { id: 'lenient', label: '🟢 Lenient (Avoid Cards)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStrictFilter(f.id)}
                className={`px-3 py-2 rounded-xl font-bold ${
                  strictFilter === f.id ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-900 text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search referee name or match (e.g. Marta Huerta, Oliver, Taylor, Letexier, Zwayer)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(r => (
          <div key={r.slug} className="rounded-2xl bg-[#0B1222] border border-slate-800 p-4 space-y-3 font-mono text-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <strong className="font-sans font-black text-base text-white">{r.name}</strong>
                </div>
                <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-black ${
                  r.strictness === 'strict'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : r.strictness === 'lenient'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-amber-300'
                }`}>
                  {r.strictness}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/50 border border-slate-800 text-center">
                <div>
                  <span className="text-[9px] text-slate-400 block">Avg Fouls</span>
                  <strong className="text-amber-300 text-sm">{r.avgFouls}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Avg Yellows</span>
                  <strong className="text-rose-300 text-sm">{r.avgYellows}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block">Over 3.5 YC</span>
                  <strong className="text-emerald-300 text-sm">{r.over35Pct}%</strong>
                </div>
              </div>
            </div>

            {r.assignedMatches?.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[10px] uppercase text-cyan-400 font-bold block">Assigned Match(es):</span>
                {r.assignedMatches.map((mStr, idx) => (
                  <div
                    key={idx}
                    onClick={() => onNavigate('leagues')}
                    className="cursor-pointer text-[11px] text-emerald-300 hover:underline"
                  >
                    &bull; {mStr}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

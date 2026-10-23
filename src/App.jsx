import React, { useState, useEffect, useMemo } from 'react';
import { GROUND_ZERO } from './data/groundZeroData';
import CommandCenterView from './groundzero/CommandCenterView';
import LeagueBatchesView from './groundzero/LeagueBatchesView';
import VaultAndClubDirectoryView, { DedicatedTeamPage } from './groundzero/VaultAndClubPageView';
import RefereesView from './groundzero/RefereesView';
import RetrainingAndLedgerView from './groundzero/RetrainingAndLedgerView';
import MidweekUefaView from './groundzero/MidweekUefaView';
import { Search, Flame, Layers, Lock, Scale, RefreshCw, Trophy, X } from 'lucide-react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-6 rounded-2xl bg-[#0B1222] border border-rose-500/50 text-white space-y-3">
          <h2 className="text-lg font-bold text-rose-400">Ground Zero View Recovery</h2>
          <p className="text-xs font-mono text-slate-300">{String(this.state.error?.message || this.state.error)}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.hash = '#/'; }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Return to Command Center
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  const [quickQuery, setQuickQuery] = useState('');

  useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.title = 'GROUND ZERO | Football Match Behaviour & 3.00x Pure OVER Intelligence';
  }, [hash]);

  const navigate = (path) => {
    setQuickQuery('');
    const clean = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`;
    window.location.hash = clean;
  };

  const parts = hash.replace(/^#\/?/, '').trim().split('/');
  const route = parts[0] || 'command';
  const param = parts[1] || '';

  // Instant Omnibox Results across all 307 Clubs + 22 Leagues + 197 Referees
  const searchHits = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const clubHits = (GROUND_ZERO.clubs || [])
      .filter(c => c.name.toLowerCase().includes(q) || c.slug.includes(q))
      .slice(0, 6)
      .map(c => ({ type: 'CLUB PAGE', label: `${c.name} (${c.league})`, target: `team/${c.slug}` }));
    const refHits = (GROUND_ZERO.referees || [])
      .filter(r => r.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(r => ({ type: 'REFEREE', label: `${r.name} (${r.avgFouls}F / ${r.avgYellows}YC)`, target: `referees/${r.slug}` }));
    const lgHits = (GROUND_ZERO.leagueBatches || [])
      .filter(l => l.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(l => ({ type: 'LEAGUE BATCH', label: `${l.flag} ${l.name} (${l.totalMatches} Matches)`, target: `league/${l.slug}` }));
    return [...clubHits, ...lgHits, ...refHits];
  }, [quickQuery]);

  const navTabs = [
    { id: 'command', label: '3.00x Command (Step 1–4)', short: '3x Ladder', icon: Flame },
    { id: 'leagues', label: `Weekend Leagues (${GROUND_ZERO.meta.totalWeekendMatches})`, short: 'Leagues', icon: Layers },
    { id: 'vault', label: `100% Vault & ${GROUND_ZERO.meta.totalClubs} Clubs`, short: '100% Vault', icon: Lock },
    { id: 'referees', label: `Referees (${GROUND_ZERO.meta.totalReferees})`, short: 'Referees', icon: Scale },
    { id: 'retrain', label: 'Retraining & 54 Ledger', short: 'Ledger', icon: RefreshCw },
    { id: 'uefa', label: 'UCL & UEL Lab', short: 'UEFA', icon: Trophy },
  ];

  const renderMain = () => {
    if (route === 'team' || route === 'clubs') {
      return param
        ? <DedicatedTeamPage data={GROUND_ZERO} teamSlug={param} onNavigate={navigate} />
        : <VaultAndClubDirectoryView data={GROUND_ZERO} onNavigate={navigate} />;
    }
    if (route === 'leagues' || route === 'weekend') {
      return <LeagueBatchesView data={GROUND_ZERO} initialDay={param || 'ALL'} onNavigate={navigate} />;
    }
    if (route === 'league') {
      return <LeagueBatchesView data={GROUND_ZERO} initialLeague={param || 'ALL'} onNavigate={navigate} />;
    }
    if (route === 'vault') {
      return <VaultAndClubDirectoryView data={GROUND_ZERO} onNavigate={navigate} />;
    }
    if (route === 'referees' || route === 'referee') {
      return <RefereesView data={GROUND_ZERO} highlightSlug={param} onNavigate={navigate} />;
    }
    if (route === 'retrain' || route === 'ledger' || route === 'whynot' || route === 'calculator') {
      return <RetrainingAndLedgerView data={GROUND_ZERO} initialSection={route === 'whynot' ? 'rules' : route} onNavigate={navigate} />;
    }
    if (route === 'uefa' || route === 'tuesday' || route === 'thursday') {
      return <MidweekUefaView data={GROUND_ZERO} onNavigate={navigate} />;
    }
    return <CommandCenterView data={GROUND_ZERO} onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-[#050912] text-slate-100 flex flex-col font-sans pb-20 lg:pb-8">
      {/* ── CLEAN GROUND ZERO TOP TERMINAL BAR ── */}
      <header className="sticky top-0 z-40 bg-[#070D1B]/95 backdrop-blur-xl border-b border-slate-800/90 shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand */}
          <div onClick={() => navigate('')} className="flex items-center gap-3 cursor-pointer select-none">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
              GZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-white">GROUND ZERO</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  MATCH BEHAVIOUR LAB
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                4-Step 3.00x Rollover (₦1K &rarr; ₦81,972) &bull; {GROUND_ZERO.meta.totalClubs} Club Pages &bull; {GROUND_ZERO.meta.totalReferees} Referees
              </p>
            </div>
          </div>

          {/* Instant Global Jump Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={quickQuery}
              onChange={e => setQuickQuery(e.target.value)}
              placeholder="Jump to any Club Page, League, or Referee..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono text-white"
            />
            {quickQuery && (
              <button onClick={() => setQuickQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
            {searchHits.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-2xl bg-[#0B1325] border border-emerald-500/40 shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
                {searchHits.map((hit, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(hit.target)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-500/15 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-white font-bold truncate">{hit.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-2 flex-shrink-0">
                      {hit.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop & Tablet Primary Navigation Bar */}
        <div className="border-t border-white/[0.06] bg-[#050914] px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            {navTabs.map(t => {
              const Icon = t.icon;
              const isSelected =
                route === t.id ||
                (t.id === 'command' && (route === '' || route === 'friday' || route === 'ladder')) ||
                (t.id === 'vault' && route === 'team') ||
                (t.id === 'leagues' && route === 'league') ||
                (t.id === 'retrain' && (route === 'ledger' || route === 'whynot' || route === 'calculator'));
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(t.id === 'command' ? '' : t.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-7">
        <AppErrorBoundary key={hash}>
          {renderMain()}
        </AppErrorBoundary>
      </main>

      {/* ── CLEAN FOOTER ── */}
      <footer className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
        <span>GROUND ZERO &bull; Walk-Forward Match Behaviour Intelligence Lab</span>
        <span>Auto-Retraining Schedule: Post-UCL (Tue/Wed) &bull; Post-UEL/UECL (Thu) &bull; Post-Matchweek (Fri/Sat/Sun)</span>
      </footer>

      {/* ── MOBILE BOTTOM NAVIGATION DOCK ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#070D1B]/95 backdrop-blur-xl border-t border-slate-800 lg:hidden">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {navTabs.slice(0, 5).map(t => {
            const Icon = t.icon;
            const isSelected =
              route === t.id ||
              (t.id === 'command' && (route === '' || route === 'friday' || route === 'ladder')) ||
              (t.id === 'vault' && route === 'team') ||
              (t.id === 'leagues' && route === 'league');
            return (
              <button
                key={t.id}
                onClick={() => navigate(t.id === 'command' ? '' : t.id)}
                className={`flex flex-col items-center justify-center gap-1 ${
                  isSelected ? 'text-emerald-400 font-black' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-mono">{t.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

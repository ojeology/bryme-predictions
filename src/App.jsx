import React, { useState, useEffect, useMemo } from 'react';
import { Search, Layers, ShieldCheck, ClipboardCheck, Flame, Scale } from 'lucide-react';
import { GROUND_ZERO } from './data/groundZeroData';
import ArbScannerView from './arbs/ArbScannerView';
import CommandCenterView from './groundzero/CommandCenterView';
import LeagueBatchesView from './groundzero/LeagueBatchesView';
import { VaultView, DedicatedTeamPage } from './groundzero/VaultAndClubPageView';
import RetrainingAndLedgerView from './groundzero/RetrainingAndLedgerView';
import { safeText } from './groundzero/utils';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto mt-16 bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Ground Zero Reloaded</h2>
          <p className="text-sm text-slate-600">Click below to return cleanly to the Rollover Guide.</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.hash = '#/';
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
          >
            Back to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function parseRoute(hashStr) {
  const clean = (hashStr || '#/').replace(/^#/, '') || '/';
  if (clean.startsWith('/team/')) {
    return { view: 'team', param: decodeURIComponent(clean.replace('/team/', '').split('/')[0]) };
  }
  if (clean === '/leagues/sat') return { view: 'leagues', day: 'sat', league: 'all' };
  if (clean === '/leagues/sun') return { view: 'leagues', day: 'sun', league: 'all' };
  if (clean === '/leagues/fri') return { view: 'leagues', day: 'fri', league: 'all' };
  if (clean === '/leagues/midweek' || clean.startsWith('/uefa')) {
    return { view: 'leagues', day: 'midweek', league: 'all' };
  }
  if (clean.startsWith('/league/')) {
    return { view: 'leagues', day: 'all', league: decodeURIComponent(clean.replace('/league/', '')) };
  }
  if (clean.startsWith('/leagues') || clean.startsWith('/weekend')) {
    return { view: 'leagues', day: 'all', league: 'all' };
  }
  if (clean.startsWith('/vault')) return { view: 'vault' };
  if (clean.startsWith('/arbs')) return { view: 'arbs' };
  if (clean.startsWith('/referees')) return { view: 'ledger', tab: 'referees' };
  if (clean.startsWith('/retrain')) return { view: 'ledger', tab: 'retrain' };
  if (clean.startsWith('/ledger') || clean.startsWith('/whynot') || clean.startsWith('/calculator') || clean.startsWith('/uefa')) {
    return { view: 'ledger', tab: 'ledger' };
  }
  return { view: 'home' };
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash || '#/');
  const [quickQuery, setQuickQuery] = useState('');

  useEffect(() => {
    const onHash = () => {
      setHash(window.location.hash || '#/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to) => {
    const target = to.startsWith('#') ? to : `#${to}`;
    window.location.hash = target;
    setHash(target);
    setQuickQuery('');
  };

  const route = parseRoute(hash);

  const searchResults = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const clubHits = Object.values(GROUND_ZERO.clubs || {})
      .filter((c) => safeText(c.name).toLowerCase().includes(q))
      .slice(0, 8)
      .map((c) => ({
        type: 'Club Page',
        label: safeText(c.name),
        sub: safeText(c.league || c.compName || 'Tracked Club'),
        to: `/team/${c.slug}`,
      }));
    const leagueHits = (GROUND_ZERO.leagueBatches || [])
      .filter((l) => safeText(l.name).toLowerCase().includes(q))
      .slice(0, 4)
      .map((l) => ({
        type: 'League Guide',
        label: safeText(l.name),
        sub: `${(l.matches || []).length} weekend matches`,
        to: `/league/${l.slug}`,
      }));
    return [...clubHits, ...leagueHits];
  }, [quickQuery]);

  const navItems = [
    { id: 'home', label: 'Rollover (Step 1–4)', compactLabel: 'Rollover', to: '/', icon: Flame },
    { id: 'leagues', label: 'Weekend by League', compactLabel: 'Leagues', to: '/leagues', icon: Layers },
    { id: 'vault', label: '100% Vault & Teams', compactLabel: 'Vault', to: '/vault', icon: ShieldCheck },
    { id: 'ledger', label: 'Results & Referees', compactLabel: 'Results', to: '/ledger', icon: ClipboardCheck },
    { id: 'arbs', label: 'Arb Scanner', compactLabel: 'Arb Scanner', to: '/arbs', icon: Scale },
  ];

  const activeNav = route.view === 'team' ? 'vault' : route.view;

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-slate-900 pb-24 md:pb-12">
      {/* CLEAN CRISP WHITE TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* BRAND */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                GZ
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                  Ground Zero
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Match Behaviour Lab
                </div>
              </div>
            </button>

            {/* 5 SIMPLE DESKTOP NAVIGATION TABS */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className="xl:hidden">{item.compactLabel}</span>
                    <span className="hidden xl:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* SIMPLE QUICK SEARCH FOR ANY TEAM OR LEAGUE */}
            <div className="relative hidden lg:block w-44 xl:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Jump to team..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100 border border-transparent focus:border-slate-300 focus:bg-white rounded-xl focus:outline-none"
              />
              {searchResults.length > 0 && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden z-50 divide-y divide-slate-100">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{item.label}</div>
                        <div className="text-xs text-slate-500 truncate">{item.sub}</div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CLEAN SINGLE-COLUMN READABLE CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <AppErrorBoundary>
          {route.view === 'home' && <CommandCenterView data={GROUND_ZERO} navigate={navigate} />}
          {route.view === 'arbs' && <ArbScannerView navigate={navigate} />}
          {route.view === 'leagues' && (
            <LeagueBatchesView
              data={GROUND_ZERO}
              initialDay={route.day}
              initialLeague={route.league}
              navigate={navigate}
            />
          )}
          {route.view === 'vault' && <VaultView data={GROUND_ZERO} navigate={navigate} />}
          {route.view === 'team' && (
            <DedicatedTeamPage data={GROUND_ZERO} slug={route.param} navigate={navigate} />
          )}
          {route.view === 'ledger' && (
            <RetrainingAndLedgerView data={GROUND_ZERO} initialTab={route.tab} navigate={navigate} />
          )}
        </AppErrorBoundary>
      </main>

      {/* SIMPLE 5-BUTTON MOBILE BOTTOM BAR */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-cols-5 py-1.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center justify-center py-1 rounded-lg text-[11px] font-semibold ${
                active ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="truncate max-w-full px-1">
                {item.id === 'home'
                  ? 'Rollover'
                  : item.id === 'leagues'
                  ? 'Leagues'
                  : item.id === 'vault'
                  ? '100% Vault'
                  : item.id === 'ledger'
                  ? 'Results'
                  : 'Arbs'}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

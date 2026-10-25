import React, { useEffect, useState } from 'react';
import { Scale, ShieldCheck, Database } from 'lucide-react';
import ArbScannerView from './arbs/ArbScannerView';
import { RESPONSIBLE_GAMBLING } from './data/compliance';

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
          <h2 className="text-lg font-bold text-slate-900">The scanner hit an error</h2>
          <p className="text-sm text-slate-600">Nothing was changed. Reload to start again.</p>
          <button
            type="button"
            onClick={() => { this.setState({ hasError: false }); window.location.hash = '#/'; }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
          >
            Back to the scanner
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function parseRoute(hashStr) {
  const clean = (hashStr || '#/').replace(/^#/, '') || '/';
  return { view: clean.startsWith('/arbs') ? 'arbs' : 'arbs' };
}

export default function App() {
  const [route, setRoute] = useState(parseRoute(window.location.hash));

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (to) => {
    window.location.hash = to.startsWith('#') ? to : `#${to}`;
    setRoute(parseRoute(window.location.hash));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/arbs')}
            className="flex items-center gap-2.5 text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center shrink-0">
              <Scale className="w-4.5 h-4.5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black tracking-tight">BRYME</span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                Arb Scanner
              </span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-extrabold uppercase tracking-[0.14em]">
              <Database className="w-3.5 h-3.5" /> Pre-match only
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-extrabold uppercase tracking-[0.14em]">
              <ShieldCheck className="w-3.5 h-3.5" /> 18+
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
        <AppErrorBoundary>
          {route.view === 'arbs' && <ArbScannerView navigate={navigate} />}
        </AppErrorBoundary>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-4 text-xs text-slate-500 leading-5">
          <p className="font-bold text-slate-700">{RESPONSIBLE_GAMBLING.warningShort}</p>
          <p>
            BRYME Arb Scanner reads prices you are allowed to see and does the arithmetic. It never
            places a bet, never logs in, never moves money and never invents a price. A calculated
            edge is not a filled bet — verify every price and every rule yourself before you place
            anything.
          </p>
          <p>
            Support:{' '}
            {RESPONSIBLE_GAMBLING.helplines.nigeria.map((line) => (
              <span key={line.name} className="mr-4 inline-block">
                {line.name}
                {line.contact ? ` — ${line.contact}` : ''}
              </span>
            ))}
          </p>
        </div>
      </footer>
    </div>
  );
}

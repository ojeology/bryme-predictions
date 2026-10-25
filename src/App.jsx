import React, { useEffect, useState } from 'react';
import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import ArbScannerView from './arbs/ArbScannerView';
import { RESPONSIBLE_GAMBLING } from './data/compliance';

const PIN_KEY = 'bryme.labPin.v1';

function readPinHash() {
  try {
    return localStorage.getItem(PIN_KEY) || '';
  } catch {
    return '';
  }
}

async function hashPin(value) {
  const text = `bryme-lab:${value}`;
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // fallback for insecure contexts (plain http on a LAN address)
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) | 0;
  }
  return `fallback-${hash}`;
}

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
        <div className="max-w-xl mx-auto mt-16 bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-100">The lab hit an error</h2>
          <p className="text-xs text-slate-500">Nothing was changed. Reload to start again.</p>
          <button
            type="button"
            onClick={() => { this.setState({ hasError: false }); window.location.hash = '#/arbs'; }}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider"
          >
            Back to the console
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LockScreen({ onUnlock }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const hash = await hashPin(value);
    if (hash === readPinHash()) {
      onUnlock();
      return;
    }
    setError('That PIN does not match.');
    setValue('');
  };

  return (
    <div className="min-h-[70vh] grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-sm bg-slate-900/60 border border-white/10 rounded-2xl p-8 space-y-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-500 text-slate-950 grid place-items-center">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-sm font-black uppercase tracking-[0.16em] text-slate-100">BRYME LAB · locked</h1>
        <p className="text-xs text-slate-500 leading-5">Enter your PIN to open the console.</p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={value}
          onChange={(event) => { setValue(event.target.value); setError(''); }}
          placeholder="PIN"
          className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-white/10 text-slate-100 font-mono text-lg tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        />
        {error && <p className="text-xs text-rose-300">{error}</p>}
        <button type="submit" className="w-full px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider">
          Unlock
        </button>
        <p className="text-[11px] text-slate-600 leading-5">
          The PIN lives in this browser only. It keeps other people off your screen — it does not
          hide the site from the internet.
        </p>
      </form>
    </div>
  );
}

function PinDialog({ onClose, onSave, onClear, hasPin }) {
  const [value, setValue] = useState('');

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-100">Lab lock</h2>
        </div>
        <p className="text-xs text-slate-500 leading-5">
          {hasPin
            ? 'Your PIN is set. Clear it to open the lab without a PIN on this device.'
            : 'Set a PIN and this browser will ask for it every time you open the lab.'}
        </p>
        <input
          type="password"
          inputMode="numeric"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="New PIN (4+ digits)"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-100 font-mono tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-emerald-500/70"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onSave(value)} disabled={value.length < 4} className="px-4 py-2.5 rounded-xl bg-emerald-500 disabled:bg-white/10 disabled:text-slate-600 text-slate-950 text-xs font-black uppercase tracking-wider">
            Save PIN
          </button>
          {hasPin && (
            <button type="button" onClick={onClear} className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-rose-300">
              Remove PIN
            </button>
          )}
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function parseRoute(hashStr) {
  const clean = (hashStr || '#/arbs').replace(/^#/, '') || '/arbs';
  return { view: clean.startsWith('/arbs') || clean === '/' ? 'arbs' : 'arbs' };
}

export default function App() {
  const [route, setRoute] = useState(parseRoute(window.location.hash));
  const [pinHash, setPinHash] = useState(readPinHash);
  const [unlocked, setUnlocked] = useState(() => !readPinHash());
  const [showPinDialog, setShowPinDialog] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const savePin = async (value) => {
    const hash = await hashPin(value);
    try { localStorage.setItem(PIN_KEY, hash); } catch { /* storage may be unavailable */ }
    setPinHash(hash);
    setShowPinDialog(false);
    setUnlocked(true);
  };

  const clearPin = () => {
    try { localStorage.removeItem(PIN_KEY); } catch { /* storage may be unavailable */ }
    setPinHash('');
    setShowPinDialog(false);
    setUnlocked(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5 pb-12">
        {!unlocked ? (
          <LockScreen onUnlock={() => setUnlocked(true)} />
        ) : (
          <AppErrorBoundary>
            {route.view === 'arbs' && <ArbScannerView />}
          </AppErrorBoundary>
        )}
      </main>

      {unlocked && (
        <button
          type="button"
          onClick={() => setShowPinDialog(true)}
          title="Lab lock"
          className="fixed bottom-4 right-4 z-40 w-9 h-9 rounded-xl bg-slate-900/90 border border-white/10 text-slate-500 hover:text-emerald-400 grid place-items-center"
        >
          {pinHash ? <ShieldCheck className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
        </button>
      )}

      {showPinDialog && (
        <PinDialog
          hasPin={Boolean(pinHash)}
          onClose={() => setShowPinDialog(false)}
          onSave={savePin}
          onClear={clearPin}
        />
      )}

      <footer className="border-t border-white/10 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-[11px] text-slate-600 leading-5 space-y-2">
          <p className="font-bold text-slate-500">
            Private lab · {RESPONSIBLE_GAMBLING.warningShort}
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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  Copy,
  Database,
  Download,
  ExternalLink,
  FilePlus2,
  Gauge,
  Globe,
  History,
  Info,
  Keyboard,
  Link2,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Terminal,
  WifiOff,
  X,
} from 'lucide-react';
import {
  BOOKMAKERS,
  DEFAULT_ROUNDING,
  DEFAULT_STAKE,
  bookmakerLabel,
  calculateArbitrage,
} from '../lib/arbitrage';

const LEDGER_KEY = 'bryme.arbPlacementLedger.v1';
const RUN_HISTORY_KEY = 'bryme.arbRunHistory.v1';
const MAX_RUN_HISTORY = 30;
const CHECKS = [
  'Same event and start time',
  'Exact same market and line',
  'Settlement rules match (including overtime)',
  'Odds and stake limits re-checked at every bookmaker',
  'The price on screen is still the price the book is offering',
];
const DEFAULT_CONNECTORS = [
  { id: 'sportybet', label: 'SportyBet NG', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
  { id: 'msport', label: 'MSport', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
  { id: 'betking', label: 'BetKing', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
  { id: 'nairabet', label: 'NairaBet', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
  { id: 'jackpotbet', label: 'JackpotBet', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
  { id: 'stake', label: 'Stake', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
  { id: 'betway', label: 'Betway', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
  { id: '12bet', label: '12BET', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
  { id: '22bet', label: '22Bet NG', status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 },
];

const moneyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});
const preciseMoneyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const numberFormatter = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 2 });

function money(value, precise = false) {
  if (!Number.isFinite(Number(value))) return '—';
  return (precise ? preciseMoneyFormatter : moneyFormatter).format(Number(value));
}

function numeric(value) {
  return Number.isFinite(Number(value)) ? numberFormatter.format(Number(value)) : '—';
}

function timeLabel(value) {
  if (!value) return 'time unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'time unknown';
  return date.toLocaleString('en-NG', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function clockLabel(date) {
  return date.toLocaleTimeString('en-NG', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function quoteAge(value) {
  if (!value) return { label: 'price time unknown', stale: true };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: 'price time unknown', stale: true };
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return { label: `${seconds}s old`, stale: seconds > 120 };
  if (seconds < 3600) return { label: `${Math.floor(seconds / 60)}m old`, stale: seconds > 300 };
  return { label: `${Math.floor(seconds / 3600)}h old`, stale: true };
}


/**
 * How long the book itself has stood on this price.
 *
 * This is not the same as how old our copy of the price is: it is the
 * moment the book last changed the number.  A price that has not moved for
 * days may be one the book has left behind, and it can be taken away the
 * moment the book wakes up.
 */
function priceStoodFor(value) {
  if (!value) return null;
  // the stamp travels as a number of milliseconds
  const date = new Date(typeof value === 'number' ? value : String(value));
  if (Number.isNaN(date.getTime())) return null;
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'moved just now';
  if (seconds < 3600) return `moved ${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `moved ${Math.floor(seconds / 3600)}h ago`;
  return `moved ${Math.floor(seconds / 86400)}d ago`;
}

function safeHttpUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function uid() {
  return globalThis.crypto?.randomUUID?.() || `arb-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function blankLeg(index = 0) {
  return {
    id: uid(),
    outcome: `outcome-${index + 1}`,
    label: '',
    bookmaker: index === 0 ? 'sportybet' : index === 1 ? 'nairabet' : '22bet',
    odds: '',
    url: '',
  };
}

function readLedger() {
  try {
    const value = JSON.parse(localStorage.getItem(LEDGER_KEY) || '[]');
    return Array.isArray(value) ? value.filter((entry) => entry && entry.id && Array.isArray(entry.legs)) : [];
  } catch {
    return [];
  }
}

// How long an opportunity has been showing on this phone.  The phone
// remembers what it has seen, so a price that keeps coming back can be
// told apart from one that flashed past once.
const SEEN_KEY = 'arb.seen.v1';

function readSeen() {
  try {
    const value = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

function writeSeen(seen) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch { /* private mode */ }
}

// What the phone has seen: every opportunity it has found, and how the
// prices behind it moved.  A price that keeps coming back, and keeps its
// edge, is a different thing from one that flashed past for a minute.
const HISTORY_KEY = 'arb.history.v1';
const HISTORY_MAX = 400;

function readHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

/** How an opportunity has moved since the phone first found it. */
function summariseHistory(entries) {
  const first = entries[0];
  const last = entries[entries.length - 1];
  const priceMoves = [];
  for (const leg of last.legs || []) {
    const before = (first.legs || []).find((item) => item.book === leg.book && item.outcome === leg.outcome);
    if (before && before.odds !== leg.odds) {
      priceMoves.push({ book: leg.book, from: before.odds, to: leg.odds });
    }
  }
  return {
    count: entries.length,
    firstRoi: numeric(first.roi),
    lastRoi: numeric(last.roi),
    priceMoves,
  };
}

function writeHistory(history) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-HISTORY_MAX))); } catch { /* private mode */ }
}

// How close the books came on every scan.  Kept on the phone, so it is
// this phone's own record and nothing else.
const NEARMISS_KEY = 'arb.nearmiss.v1';

function readNearMiss() {
  try {
    const value = JSON.parse(localStorage.getItem(NEARMISS_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeNearMiss(records) {
  try { localStorage.setItem(NEARMISS_KEY, JSON.stringify(records.slice(-200))); } catch { /* private mode */ }
}

function readRunHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(RUN_HISTORY_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  area.remove();
}

function StatusPill({ children, tone = 'slate', icon: Icon }) {
  const tones = {
    slate: 'bg-white/5 text-slate-300 border-white/10',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    blue: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    red: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-bold uppercase tracking-wider text-[10px] ${tones[tone]}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

function Panel({ title, subtitle, icon: Icon, right, children, className = '' }) {
  return (
    <section className={`bg-slate-900/60 border border-white/10 rounded-2xl ${className}`}>
      {(title || right) && (
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && <Icon className="w-4 h-4 text-emerald-400 shrink-0" />}
            <div className="min-w-0">
              {title && <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-200">{title}</h2>}
              {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

function Stat({ label, value, tone = 'slate', hint }) {
  const tones = {
    slate: 'text-slate-200',
    emerald: 'text-emerald-300',
    amber: 'text-amber-300',
    rose: 'text-rose-300',
    sky: 'text-sky-300',
  };
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 truncate">{label}</div>
      <div className={`font-mono text-lg font-bold tabular-nums leading-tight ${tones[tone]}`}>{value}</div>
      {hint && <div className="text-[10px] text-slate-600 truncate">{hint}</div>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="w-11 h-11 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">{title}</h3>
      <div className="text-xs text-slate-500 leading-6 max-w-lg mx-auto mt-2">{children}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function BookCard({ connector }) {
  const status = connector.status || 'not_configured';
  const tone = status === 'connected' ? 'green' : status === 'error' ? 'red' : status === 'configured' ? 'blue' : 'slate';
  const dot = status === 'connected' ? 'bg-emerald-400' : status === 'error' ? 'bg-rose-400' : 'bg-slate-600';
  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
          <span className="text-xs font-bold text-slate-200 truncate">{connector.label}</span>
        </div>
        <StatusPill tone={tone}>
          {status === 'connected' ? 'live' : status === 'error' ? 'blocked' : status === 'configured' ? 'set' : 'off'}
        </StatusPill>
      </div>
      <div className="font-mono text-2xl font-bold tabular-nums text-slate-100 mt-3">
        {status === 'connected' ? Number(connector.quoteCount || 0).toLocaleString() : '—'}
      </div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">prices</div>
      <p className="text-[11px] text-slate-500 leading-4 mt-2 line-clamp-2">{connector.detail || 'No verified server-side feed is configured.'}</p>
    </div>
  );
}

function OpportunityCard({ opportunity, onOpen, firstSeen, history }) {
  const age = quoteAge(opportunity.latestQuoteAt);
  const moves = history && history.length > 1 ? summariseHistory(history) : null;
  const staleNames = (opportunity.staleBookmakers || [])
    .map((book) => bookmakerLabel(book));
  return (
    <article className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusPill tone="green" icon={BadgeCheck}>matched {opportunity.way}-way</StatusPill>
            <StatusPill tone={age.stale ? 'amber' : 'blue'} icon={Clock3}>{age.label}</StatusPill>
            {firstSeen ? <StatusPill tone="blue" icon={Clock3}>seen since {firstSeen}</StatusPill> : null}
          </div>
          <h3 className="font-extrabold text-slate-100 text-lg leading-6">{opportunity.event}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {opportunity.competition || opportunity.sport} · {timeLabel(opportunity.startsAt)}
          </p>
          <p className="text-sm font-semibold text-slate-200 mt-2">{opportunity.market}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">rules: {opportunity.rules || 'confirm before placing'}</p>
          {moves ? (
            <p className="text-[11px] text-slate-400 mt-1.5">
              edge {moves.firstRoi}% → {moves.lastRoi}% over {moves.count} readings
              {moves.priceMoves.length ? ` · ${moves.priceMoves.map((move) => `${move.book} ${move.from}→${move.to}`).join(', ')}` : ''}
            </p>
          ) : null}
          {staleNames.length ? (
            <p className="text-[11px] text-amber-400 mt-1.5 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {staleNames.join(', ')} has not moved this price while the other book has. Check that price in the app first.
            </p>
          ) : null}
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-3xl font-bold tabular-nums text-emerald-400">+{numeric(opportunity.theoreticalRoiPct)}%</div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">theoretical roi</div>
          <div className="font-mono text-sm font-bold text-slate-200 mt-2">{money(opportunity.minProfit)}</div>
          <div className="text-[10px] text-slate-500">min. after rounding</div>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {opportunity.legs.map((leg) => {
          const legAge = quoteAge(leg.fetchedAt);
          const url = safeHttpUrl(leg.url);
          const stood = priceStoodFor(leg.priceMovedAt);
          const staleLeg = Array.isArray(opportunity.staleBookmakers)
            && opportunity.staleBookmakers.includes(leg.bookmaker);
          return (
            <div key={leg.id} className="px-5 py-3.5 grid grid-cols-[1fr_auto] sm:grid-cols-[1.2fr_1fr_auto_auto] items-center gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-100 truncate">{leg.label || leg.outcome}</div>
                <div className="text-[11px] text-slate-500 sm:hidden">{leg.bookmakerLabel}</div>
                {leg.rules ? <div className="text-[10px] text-slate-600 truncate">settles: {leg.rules}</div> : null}
              </div>
              <div className="hidden sm:block text-sm font-semibold text-slate-400">{leg.bookmakerLabel}</div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-slate-100">@{numeric(leg.odds)}</div>
                <div className={`text-[10px] ${legAge.stale ? 'text-amber-400' : 'text-slate-600'}`}>{legAge.label}</div>
                {stood ? <div className={`text-[10px] ${staleLeg ? 'text-amber-400' : 'text-slate-600'}`}>{stood}</div> : null}
              </div>
              <div className="text-right col-span-2 sm:col-span-1">
                <div className="font-mono text-sm font-bold text-emerald-400">{money(leg.stake)}</div>
                <div className="text-[10px] text-slate-600">returns {money(Number(leg.stake || 0) * Number(leg.odds || 0))}</div>
                {url && (
                  <a href={url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-sky-400 inline-flex items-center gap-1 mt-0.5">
                    verify <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-4 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
          Verify every price and rule again. A calculated edge is not a filled bet.
        </p>
        <button type="button" onClick={() => onOpen(opportunity)} className="shrink-0 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2">
          open calculator <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}

const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-slate-100 text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/70';
const labelClass = 'block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500';

export default function ArbScannerView() {
  const [tab, setTab] = useState('scanner');
  const [connection, setConnection] = useState({ state: 'loading', mode: 'manual', connectors: DEFAULT_CONNECTORS });
  const [opportunities, setOpportunities] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [priceAge, setPriceAge] = useState(null);
  const [seen, setSeen] = useState(readSeen);
  const [history, setHistory] = useState(readHistory);
  const [nearMiss, setNearMiss] = useState(readNearMiss);
  const [scannedAt, setScannedAt] = useState(null);
  const [runSummary, setRunSummary] = useState(null);
  const [runHistory, setRunHistory] = useState(readRunHistory);
  const [discovering, setDiscovering] = useState(false);
  const [discovery, setDiscovery] = useState(null);
  const [edge, setEdge] = useState(null);
  const [whereami, setWhereami] = useState(null);
  const [whereamiBusy, setWhereamiBusy] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [phoneCollected, setPhoneCollected] = useState({});
  const [scanError, setScanError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [notice, setNotice] = useState('');
  const [totalStake, setTotalStake] = useState(DEFAULT_STAKE);
  const [rounding, setRounding] = useState(DEFAULT_ROUNDING);
  const [meta, setMeta] = useState({ event: '', sport: 'Football', competition: '', market: '', rules: '', startsAt: '' });
  const [legs, setLegs] = useState([blankLeg(0), blankLeg(1)]);
  const [checks, setChecks] = useState(CHECKS.map(() => false));
  const [training, setTraining] = useState(false);
  const [ledger, setLedger] = useState(readLedger);
  const [returns, setReturns] = useState({});
  const [now, setNow] = useState(() => new Date());

  const result = useMemo(
    () => calculateArbitrage(legs, { totalStake, rounding }),
    [legs, totalStake, rounding],
  );

  useEffect(() => {
    try { localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger)); } catch { /* device storage can be unavailable */ }
  }, [ledger]);

  useEffect(() => {
    try { localStorage.setItem(RUN_HISTORY_KEY, JSON.stringify(runHistory)); } catch { /* device storage can be unavailable */ }
  }, [runHistory]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 6000);
    fetch('/api/arbs/status', { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then(async (response) => {
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('API unavailable');
        return response.json();
      })
      .then((data) => {
        setConnection({
          state: 'ready',
          mode: data.mode || 'manual',
          connectors: Array.isArray(data.connectors) ? data.connectors : DEFAULT_CONNECTORS,
        });
      })
      .catch(() => {
        setConnection({
          state: 'offline',
          mode: 'manual',
          connectors: DEFAULT_CONNECTORS.map((connector) => ({
            ...connector,
            detail: 'Static/offline mode. The calculator and device ledger remain available.',
          })),
        });
      })
      .finally(() => window.clearTimeout(timer));
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, []);

  const scanRef = useRef(null);
  const pollRef = useRef({ count: 0, timer: null });

  const scanLive = useCallback(async () => {
    if (scanning) return;
    setScanning(true);
    setScanError('');
    const startedAt = Date.now();
    let record = null;
    try {
      const params = new URLSearchParams({ totalStake: String(totalStake), rounding: String(rounding) });
      const response = await fetch(`/api/arbs?${params}`, { headers: { Accept: 'application/json' } });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('The scanner API is not available on this deployment.');
      const data = await response.json();
      const found = Array.isArray(data.opportunities) ? data.opportunities : [];
      const connectors = Array.isArray(data.connectors) ? data.connectors : [];
      setOpportunities(found);
      if (connectors.length) setConnection((current) => ({ ...current, state: 'ready', mode: data.mode || current.mode, connectors }));
      setScannedAt(new Date().toISOString());
      // the phone's title says how many chances are open, so a glance at the
      // task switcher is enough to know a new one has appeared
      const title = found.length
        ? `\u{1F534} ${found.length} ${found.length === 1 ? 'chance' : 'chances'} — Ground Zero`
        : 'Ground Zero — arb lab';
      if (document.title !== title) document.title = title;
      setPriceAge(Number.isFinite(Number(data.priceAgeSeconds)) ? Number(data.priceAgeSeconds) : null);
      // remember when this opportunity was first seen on this phone
      const stamp = new Date().toISOString();
      const known = readSeen();
      let changed = false;
      for (const opportunity of found) {
        if (!opportunity?.id) continue;
        if (!known[opportunity.id]) { known[opportunity.id] = stamp; changed = true; }
      }
      if (changed) { writeSeen(known); setSeen(known); }
      // write down what was found, so the phone can show how the edge moved
      const knownHistory = readHistory();
      const entries = found.map((opportunity) => ({
        at: stamp,
        id: opportunity.id,
        event: opportunity.event,
        marketKey: opportunity.marketKey,
        roi: Number(opportunity.theoreticalRoiPct || 0),
        sum: Number(opportunity.impliedSum || 0),
        legs: (opportunity.legs || []).map((leg) => ({
          book: leg.bookmaker,
          outcome: leg.outcome,
          odds: Number(leg.odds || 0),
        })),
      }));
      if (entries.length) {
        writeHistory([...knownHistory, ...entries]);
        setHistory(readHistory());
      }
      const closest = (data.overlap?.closestPairs || []).slice(0, 3);
      if (closest.length) {
        const knownNear = readNearMiss();
        writeNearMiss([...knownNear, { at: stamp, pairs: closest }]);
        setNearMiss(readNearMiss());
      }
      // the prices were getting old: the reader has been started, so keep
      // looking until they are fresh
      const stale = data.refreshing === true || Number(data.priceAgeSeconds || 0) > 300;
      if (stale && pollRef.current.count < 12) {
        pollRef.current.count += 1;
        setRefreshing(true);
        if (pollRef.current.timer) window.clearTimeout(pollRef.current.timer);
        pollRef.current.timer = window.setTimeout(() => { scanRef.current?.(); }, 30000);
      } else {
        pollRef.current.count = 0;
        setRefreshing(false);
      }
      record = {
        id: uid(),
        at: new Date().toISOString(),
        ms: Date.now() - startedAt,
        mode: data.mode || 'manual',
        quoteCount: Number(data.quoteCount || 0),
        freshQuoteCount: Number(data.freshQuoteCount || 0),
        rejectedQuoteCount: Number(data.rejectedQuoteCount || 0),
        opportunities: found.length,
        booksLive: connectors.filter((connector) => connector.status === 'connected').length,
        booksBlocked: connectors.filter((connector) => connector.status === 'error').length,
        books: connectors.length,
        errors: Array.isArray(data.errors) ? data.errors : [],
        overlap: data.overlap || null,
        ok: true,
      };
      setRunSummary(record);
      if (data.edge) setEdge(data.edge);
      if (data.mode !== 'feed') setScanError('No automatic feed is configured. Use the calculator with prices you have verified.');
      if (Array.isArray(data.errors) && data.errors.length) setScanError(data.errors.join(' '));
    } catch (error) {
      const message = error.message || 'Scan failed. No prices were changed.';
      setScanError(message);
      setOpportunities([]);
      record = {
        id: uid(),
        at: new Date().toISOString(),
        ms: Date.now() - startedAt,
        mode: 'manual',
        quoteCount: 0,
        freshQuoteCount: 0,
        rejectedQuoteCount: 0,
        opportunities: 0,
        booksLive: 0,
        booksBlocked: 0,
        books: connection.connectors?.length || 0,
        errors: [message],
        overlap: null,
        ok: false,
      };
      setRunSummary(record);
    } finally {
      setScanning(false);
      if (record) setRunHistory((current) => [record, ...current].slice(0, MAX_RUN_HISTORY));
    }
  }, [connection.connectors, rounding, scanning, totalStake]);

  // the refresh timer calls the newest scan, not the one it was made with
  useEffect(() => { scanRef.current = scanLive; }, [scanLive]);
  useEffect(() => () => { if (pollRef.current.timer) window.clearTimeout(pollRef.current.timer); }, []);

  useEffect(() => {
    if (!autoRefresh || connection.mode !== 'feed') return undefined;
    const timer = window.setInterval(scanLive, 60000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, connection.mode, scanLive]);

  // R runs the scanner, as long as you are not typing in a field
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== 'r' && event.key !== 'R') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = event.target?.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || event.target?.isContentEditable) return;
      event.preventDefault();
      setTab('scanner');
      scanLive();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scanLive]);

  const findFeeds = useCallback(async () => {
    if (discovering) return;
    setDiscovering(true);
    // one book per request: the server may only open a limited number of
    // connections at a time, and hunting a single book takes a good many
    const books = ['sportybet', 'msport', 'betking', 'livescorebet', 'nairabet', 'jackpotbet',
      'stake', 'betway', '12bet', '22bet', '1xbet'];
    const collected = new Map();
    const remember = (entry) => {
      if (!entry || !entry.id) return;
      const previous = collected.get(entry.id);
      if (!previous) { collected.set(entry.id, entry); return; }
      const attempts = [...(previous.attempts || [])];
      const seen = new Set(attempts.map((attempt) => attempt.url));
      for (const attempt of entry.attempts || []) {
        if (!seen.has(attempt.url)) { attempts.push(attempt); seen.add(attempt.url); }
      }
      const found = [previous, entry].find((item) => item.status === 'found');
      collected.set(entry.id, {
        ...previous,
        ...entry,
        status: found ? 'found' : entry.status,
        url: found ? found.url : entry.url,
        quoteCount: Math.max(previous.quoteCount || 0, entry.quoteCount || 0),
        note: found ? found.note : entry.note,
        attempts,
      });
    };
    setDiscovery({ state: 'running', results: [] });
    for (const book of books) {
      for (const round of [1, 2]) {
        try {
          const response = await fetch(`/api/arbs/discover?book=${book}&round=${round}`, { headers: { Accept: 'application/json' } });
          if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
            throw new Error('the discovery endpoint is not available here');
          }
          const data = await response.json();
          if (data.edge) setEdge(data.edge);
          remember((data.results || [])[0]);
        } catch (error) {
          remember({ id: book, status: 'error', url: '', quoteCount: 0, note: error.message || 'failed', attempts: [] });
        }
        setDiscovery({ state: 'running', results: [...collected.values()] });
      }
    }
    setDiscovery({ state: 'done', results: [...collected.values()] });
    setDiscovering(false);
  }, [discovering]);

  const updateLeg = (index, patch) => {
    setLegs((current) => current.map((leg, legIndex) => legIndex === index ? { ...leg, ...patch } : leg));
    setTraining(false);
  };

  const addLeg = () => {
    if (legs.length >= 3) return;
    setLegs((current) => [...current, blankLeg(current.length)]);
    setChecks(CHECKS.map(() => false));
  };

  const removeLeg = (index) => {
    if (legs.length <= 2) return;
    setLegs((current) => current.filter((_, legIndex) => legIndex !== index).map((leg, legIndex) => ({ ...leg, outcome: `outcome-${legIndex + 1}` })));
    setChecks(CHECKS.map(() => false));
  };

  const resetCalculator = () => {
    setMeta({ event: '', sport: 'Football', competition: '', market: '', rules: '', startsAt: '' });
    setLegs([blankLeg(0), blankLeg(1)]);
    setChecks(CHECKS.map(() => false));
    setTraining(false);
  };

  const openInCalculator = (opportunity) => {
    setMeta({
      event: opportunity.event || '',
      sport: opportunity.sport || 'Other',
      competition: opportunity.competition || '',
      market: opportunity.market || '',
      rules: opportunity.rules || '',
      startsAt: opportunity.startsAt ? String(opportunity.startsAt).slice(0, 16) : '',
    });
    setLegs(opportunity.legs.map((leg, index) => ({
      id: uid(), outcome: `outcome-${index + 1}`, label: leg.label || leg.outcome,
      bookmaker: leg.bookmaker, odds: leg.odds, url: leg.url || '', fetchedAt: leg.fetchedAt || null,
    })));
    if (opportunity.totalStake) setTotalStake(opportunity.totalStake);
    if (opportunity.rounding !== undefined) setRounding(opportunity.rounding);
    setChecks(CHECKS.map(() => false));
    setTraining(false);
    setTab('calculator');
  };

  const loadTrainingExample = () => {
    setMeta({
      event: 'Training match — historical example',
      sport: 'Basketball',
      competition: 'Worked example only',
      market: 'Total points — Over/Under 154.5',
      rules: 'Example only: confirm overtime rules yourself',
      startsAt: '',
    });
    setLegs([
      { id: uid(), outcome: 'outcome-1', label: 'Over 154.5', bookmaker: 'sportybet', odds: 2.25, url: '' },
      { id: uid(), outcome: 'outcome-2', label: 'Under 154.5', bookmaker: 'nairabet', odds: 1.8334, url: '' },
    ]);
    setTotalStake(100000);
    setRounding(100);
    setChecks(CHECKS.map(() => false));
    setTraining(true);
    setTab('calculator');
  };

  /**
   * Collect the books on the phone itself.
   *
   * Some books only answer traffic that comes from inside their own country,
   * and the server may be standing far outside it. The phone is standing
   * inside it, so the phone asks each book and hands the answers back for
   * the server to compare.
   */
  const collectOnPhone = async () => {
    setCollecting(true);
    setPhoneCollected({});
    const gathered = [];
    const results = {};
    try {
      const candidateResponse = await fetch('/api/arbs/candidates', { headers: { Accept: 'application/json' } });
      const candidateData = await candidateResponse.json();
      const feeds = candidateData?.feeds || {};
      for (const [book, urls] of Object.entries(feeds)) {
        let answered = false;
        for (const url of urls.slice(0, 3)) {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 12000);
          try {
            const response = await fetch(url, {
              headers: { Accept: 'application/json' },
              mode: 'cors',
              signal: controller.signal,
            });
            if (!response.ok) {
              results[book] = { status: 'blocked', detail: `the book answered HTTP ${response.status}` };
              continue;
            }
            const payload = await response.json();
            gathered.push({ book, payload });
            results[book] = { status: 'collected' };
            answered = true;
            break;
          } catch (error) {
            results[book] = {
              status: 'blocked',
              detail: error?.name === 'AbortError'
                ? 'the book did not answer in time'
                : 'the book would not let this page read it',
            };
          } finally {
            clearTimeout(timer);
          }
        }
        if (!answered && !results[book]) results[book] = { status: 'none', detail: 'no answer' };
        setPhoneCollected({ ...results });
      }
      if (gathered.length) {
        const ingest = await fetch('/api/arbs/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feeds: gathered, totalStake, rounding }),
        });
        const data = await ingest.json();
        const found = Array.isArray(data.opportunities) ? data.opportunities : [];
        setOpportunities(found);
        setRunSummary({
          id: uid(),
          at: new Date().toISOString(),
          ms: 0,
          mode: 'phone',
          quoteCount: Number(data.quoteCount || 0),
          freshQuoteCount: Number(data.freshQuoteCount || 0),
          rejectedQuoteCount: Number(data.rejectedQuoteCount || 0),
          opportunities: found.length,
          booksLive: (data.perBook || []).filter((entry) => entry.ok).length,
          booksBlocked: (data.perBook || []).filter((entry) => !entry.ok).length,
          books: (data.perBook || []).length,
          errors: (data.perBook || []).filter((entry) => !entry.ok).map((entry) => `${entry.book}: ${entry.error || 'no answer'}`),
          ok: true,
        });
        if (data.edge) setEdge(data.edge);
      } else {
        setScanError('The phone could not read any of the books directly. Check the "where from" reading above.');
      }
    } catch (error) {
      setScanError(error?.message || 'The phone could not collect the books.');
    } finally {
      setCollecting(false);
    }
  };

  const checkWhere = async () => {
    setWhereamiBusy(true);
    try {
      const response = await fetch('/api/arbs/whereami', { headers: { Accept: 'application/json' } });
      const data = await response.json();
      setWhereami(data);
    } catch {
      setWhereami({ error: 'The check could not reach the server.' });
    } finally {
      setWhereamiBusy(false);
    }
  };

  const saveToLedger = () => {
    if (!result.valid || !result.executableInTheory || training || !checks.every(Boolean)) return;
    if (!meta.event.trim() || !meta.market.trim() || legs.some((leg) => !leg.label.trim())) {
      setNotice('Add the event, market and every outcome label before saving.');
      return;
    }
    const entry = {
      id: uid(),
      createdAt: new Date().toISOString(),
      status: 'ready',
      meta: { ...meta },
      totalStake: result.totalStake,
      rounding: result.rounding,
      impliedSum: result.impliedSum,
      theoreticalRoiPct: result.theoreticalRoiPct,
      minReturn: result.minReturn,
      minProfit: result.minProfit,
      actualReturn: null,
      actualProfit: null,
      settledAt: null,
      legs: result.legs.map((leg) => ({ ...leg, placed: false, placedAt: null })),
    };
    setLedger((current) => [entry, ...current]);
    setNotice('Saved to your placement ledger on this device.');
    setTab('ledger');
  };

  const togglePlaced = (entryId, legId) => {
    setLedger((current) => current.map((entry) => {
      if (entry.id !== entryId || entry.status === 'settled') return entry;
      const nextLegs = entry.legs.map((leg) => leg.id === legId ? {
        ...leg,
        placed: !leg.placed,
        placedAt: !leg.placed ? new Date().toISOString() : null,
      } : leg);
      const placedCount = nextLegs.filter((leg) => leg.placed).length;
      return { ...entry, legs: nextLegs, status: placedCount === nextLegs.length ? 'placed' : placedCount ? 'partial' : 'ready' };
    }));
  };

  const settleEntry = (entryId) => {
    const actualReturn = Number(returns[entryId]);
    if (!Number.isFinite(actualReturn) || actualReturn < 0) {
      setNotice('Enter the actual total return, using 0 if every stake lost.');
      return;
    }
    setLedger((current) => current.map((entry) => entry.id === entryId ? {
      ...entry,
      status: 'settled',
      actualReturn,
      actualProfit: actualReturn - entry.totalStake,
      settledAt: new Date().toISOString(),
    } : entry));
    setNotice('Result recorded. The original calculation is unchanged.');
  };

  const exportLedger = () => {
    const rows = [['Created', 'Event', 'Market', 'Status', 'Total stake NGN', 'Expected min profit NGN', 'Actual return NGN', 'Actual profit NGN', 'Legs']];
    for (const entry of ledger) {
      rows.push([
        entry.createdAt, entry.meta?.event || '', entry.meta?.market || '', entry.status,
        entry.totalStake, entry.minProfit, entry.actualReturn ?? '', entry.actualProfit ?? '',
        entry.legs.map((leg) => `${leg.label}: ${leg.bookmakerLabel} @${leg.odds}, stake ${leg.stake}, ${leg.placed ? 'placed' : 'not placed'}`).join(' | '),
      ]);
    }
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `bryme-arb-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyStakes = async () => {
    if (!result.valid) return;
    const lines = [
      meta.event || 'Arbitrage calculation',
      meta.market || 'Market not named',
      `Total stake: ${money(result.totalStake)}`,
      ...result.legs.map((leg) => `${leg.label}: ${money(leg.stake)} at ${leg.bookmakerLabel} @${leg.odds}`),
      `Theoretical ROI: ${numeric(result.theoreticalRoiPct)}%`,
      `Minimum return after rounding: ${money(result.minReturn, true)}`,
      'Manual placement only — re-check all odds and rules before betting.',
    ];
    try { await copyText(lines.join('\n')); setNotice('Stake plan copied.'); } catch { setNotice('Could not access the clipboard.'); }
  };

  const tabs = [
    { id: 'scanner', label: 'Opportunities', icon: Gauge },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'ledger', label: `Ledger (${ledger.length})`, icon: Clipboard },
    { id: 'connections', label: 'Feeds', icon: Database },
  ];
  const allChecked = checks.every(Boolean);
  const canSave = result.valid && result.executableInTheory && allChecked && !training;
  const connectors = connection.connectors?.length ? connection.connectors : DEFAULT_CONNECTORS;
  const liveBooks = connectors.filter((connector) => connector.status === 'connected').length;

  return (
    <div className="space-y-4">
      {notice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-emerald-500 text-slate-950 text-sm font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {notice}
        </div>
      )}

      {/* ───────── console ───────── */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-slate-950/95 backdrop-blur border-b border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 mr-1">
            <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 grid place-items-center">
              <Terminal className="w-4 h-4" />
            </span>
            <div className="leading-none">
              <div className="text-sm font-black tracking-tight text-slate-100">BRYME LAB</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">arb terminal</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className={`w-1.5 h-1.5 rounded-full ${connection.mode === 'feed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {connection.mode === 'feed' ? 'feed mode' : 'manual mode'}
            </span>
            <span className="text-[10px] font-mono text-slate-500">· {liveBooks}/{connectors.length} books</span>
          </div>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">bankroll</span>
            <span className="text-sm font-mono font-bold text-slate-100 tabular-nums">₦{numeric(totalStake)}</span>
            <select
              value={rounding}
              onChange={(event) => setRounding(Number(event.target.value))}
              className="bg-transparent text-[10px] font-mono text-slate-400 focus:outline-none cursor-pointer"
              aria-label="Round each stake to"
            >
              <option value={1}>₦1</option><option value={50}>₦50</option><option value={100}>₦100</option>
              <option value={500}>₦500</option><option value={1000}>₦1,000</option>
            </select>
          </div>

          <div className="font-mono text-xs tabular-nums text-slate-500 ml-auto hidden sm:block" title="Lagos time">
            {clockLabel(now)} WAT
          </div>

          <button
            type="button"
            onClick={checkWhere}
            disabled={whereamiBusy}
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 hover:text-slate-200 disabled:opacity-40"
            title="Show which country the books will see"
          >
            {whereamiBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            where from
          </button>

          {Object.keys(phoneCollected || {}).length > 0 && (
            <div className="w-full md:w-auto md:col-span-6 font-mono text-[11px] text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2 leading-relaxed">
              collected on this phone:{' '}
              {Object.entries(phoneCollected).map(([book, result]) => (
                <span key={book} className="mr-3">
                  {book}{' '}
                  <span className={result.status === 'collected' ? 'text-emerald-400' : 'text-amber-400'}>
                    {result.status}
                  </span>
                  {result.detail ? <span className="text-slate-500"> ({result.detail})</span> : null}
                </span>
              ))}
            </div>
          )}

          {whereami && !whereami.error && (
            <div className="w-full md:w-auto md:col-span-6 font-mono text-[11px] text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2 leading-relaxed">
              your phone reaches the books through{' '}
              <span className={whereami.phone?.country === 'NG' ? 'text-emerald-400' : 'text-amber-400'}>
                {whereami.phone?.country || 'an unknown country'} ({whereami.phone?.colo || '??'})
              </span>
              {' · the server reaches them through '}
              <span className={whereami.worker?.country === 'NG' ? 'text-emerald-400' : 'text-amber-400'}>
                {whereami.worker?.country || 'an unknown country'} ({whereami.worker?.colo || '??'})
              </span>
              {whereami.worker?.country && whereami.worker.country !== 'NG' && (
                <span className="block text-slate-500">
                  A book that only answers Nigerian traffic will refuse the server. Turn off any VPN on this
                  phone, then run &ldquo;find feeds&rdquo; again.
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => { setTab('scanner'); scanLive(); }}
            disabled={scanning}
            className="ml-auto sm:ml-0 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:text-slate-900 text-slate-950 text-sm font-black uppercase tracking-[0.14em] inline-flex items-center gap-2.5 shadow-lg shadow-emerald-500/10"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {scanning ? 'downloading' : 'run'}
          </button>
          <button
            type="button"
            onClick={findFeeds}
            disabled={discovering}
            className="px-4 py-3 rounded-xl border border-white/15 text-white/80 hover:bg-white/5 disabled:opacity-40 text-xs font-black uppercase tracking-[0.14em] inline-flex items-center gap-2"
            title="Let the server hunt for each book's price feed"
          >
            {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {discovering ? 'looking' : 'find feeds'}
          </button>
          <button
            type="button"
            onClick={collectOnPhone}
            disabled={collecting}
            className="px-4 py-3 rounded-xl border border-sky-500/40 text-sky-200 hover:bg-sky-500/10 disabled:opacity-40 text-xs font-black uppercase tracking-[0.14em] inline-flex items-center gap-2"
            title="Ask the books from this phone, on this phone's connection"
          >
            {collecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {collecting ? 'collecting' : 'collect here'}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-2">
          <Stat label="prices" value={runSummary ? runSummary.quoteCount.toLocaleString() : '—'} tone={runSummary && runSummary.quoteCount ? 'emerald' : 'slate'} />
          <Stat label="fresh" value={runSummary ? runSummary.freshQuoteCount.toLocaleString() : '—'} tone="sky" />
          <Stat label="rejected" value={runSummary ? runSummary.rejectedQuoteCount.toLocaleString() : '—'} tone="amber" />
          <Stat label="opportunities" value={runSummary ? runSummary.opportunities : '—'} tone={runSummary && runSummary.opportunities ? 'emerald' : 'slate'} />
          <Stat label="last run" value={runSummary ? `${(runSummary.ms / 1000).toFixed(1)}s` : '—'} />
          <Stat label="edge" value={edge || '—'} hint={runSummary ? timeLabel(runSummary.at) : 'press run'} />
        </div>
      </div>

      {runSummary?.overlap && (
        <Panel
          title="What the books have in common"
          subtitle="an arbitrage needs the same match at the same price from two books - this is how much the books actually share"
          icon={Link2}
        >
          <div className="p-4 grid gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="shared matches" value={runSummary.overlap.sharedFixtures ?? 0} tone={(runSummary.overlap.sharedFixtures || 0) ? 'emerald' : 'slate'} />
              <Stat label="two books agree" value={runSummary.overlap.groupsWithTwoBooks ?? 0} tone="sky" />
              <Stat label="three books agree" value={runSummary.overlap.groupsWithThreeBooks ?? 0} tone={(runSummary.overlap.groupsWithThreeBooks || 0) ? 'emerald' : 'slate'} />
              <Stat label="markets compared" value={runSummary.overlap.marketGroups ?? 0} />
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(runSummary.overlap.quotesPerBook || {}).map(([book, count]) => (
                <span key={book} className="rounded-lg border border-white/10 bg-slate-950/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  {book} <span className="text-emerald-300 ml-1">{count.toLocaleString()}</span>
                </span>
              ))}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {runSummary.opportunities > 0
                ? 'An arbitrage was found in the matches the books share.'
                : (runSummary.overlap.sharedFixtures || 0) === 0
                  ? 'The books are not offering the same matches at the same time, so there is nothing to compare yet.'
                  : 'The books do offer the same matches, but on those matches the prices do not add up to more than 100% — no arbitrage right now.'}
            </p>
            {(runSummary.overlap.closestPairs || []).length > 0 && (
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  how close the books came (under 1.000 would be an arbitrage)
                </p>
                <div className="grid gap-1.5">
                  {(runSummary.overlap.closestPairs || []).slice(0, 5).map((pair, index) => (
                    <div key={`${pair.fixture}-${pair.market}-${pair.outcome}-${index}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px]">
                      <span className="font-mono text-amber-300/90 w-14 shrink-0">{pair.impliedSum?.toFixed?.(4)}</span>
                      <span className="text-slate-200 truncate max-w-[46%]">{pair.fixture}</span>
                      <span className="text-slate-500 truncate">{pair.market} · {pair.outcome}</span>
                      <span className="text-slate-400 ml-auto font-mono">
                        {(pair.books || []).join(' ')} {(pair.odds || []).join(' / ')}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500 mt-2">
                  {(runSummary.overlap.arbitragePairs || 0) > 0
                    ? `${runSummary.overlap.arbitragePairs} pair(s) sum under 1.000 — that is an arbitrage.`
                    : `Nothing summed under 1.000. The closest was ${(runSummary.overlap.closestPairs || [])[0]?.impliedSum ?? '—'} — that is how near the books came to disagreeing.`}
                </p>
                {nearMiss.length ? (
                  <p className="text-[10px] leading-relaxed text-slate-500 mt-1">
                    {(() => {
                      const sums = nearMiss.flatMap((entry) => (entry.pairs || []).map((pair) => Number(pair.impliedSum || 9)));
                      const best = sums.length ? Math.min(...sums) : null;
                      const near = sums.filter((sum) => sum < 1.02).length;
                      if (best === null) return null;
                      return `On this phone the books have come within ${((1 - best) * 100).toFixed(2)}% of an arbitrage, ${near} time${near === 1 ? '' : 's'} in ${nearMiss.length} scans.`;
                    })()}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </Panel>
      )}

      {discovery && (
        <Panel
          title={discovery.state === 'running' ? 'Looking for the books’ feeds' : 'Feeds found'}
          subtitle={discovery.state === 'running'
            ? 'the server is opening each book and watching what it loads'
            : discovery.state === 'error' ? discovery.error : 'every address below was proven to carry prices'}
          icon={Search}
        >
          {discovery.state === 'running' ? (
            <div className="p-5 flex items-center gap-3 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              Give it a minute — each book is opened and checked in turn.
            </div>
          ) : (
            <div className="p-4 grid gap-2">
              {(discovery.results || []).map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2.5">
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wider w-32 shrink-0">{entry.id}</span>
                  <StatusPill tone={entry.status === 'found' ? 'green' : entry.status === 'blocked' ? 'red' : 'amber'}>
                    {entry.status === 'found' ? `found · ${entry.quoteCount} prices` : entry.status === 'blocked' ? 'blocked' : 'nothing found'}
                  </StatusPill>
                  {entry.url && (
                    <button
                      type="button"
                      onClick={() => copyText(entry.url)}
                      className="font-mono text-[11px] text-sky-400 truncate max-w-full hover:text-sky-300"
                      title="Copy this address"
                    >
                      {entry.url}
                    </button>
                  )}
                  {!entry.url && entry.note && <span className="text-[11px] text-slate-500">{entry.note}</span>}
                </div>
              ))}
              {(discovery.results || []).length === 0 && (
                <p className="text-xs text-slate-500 p-3">Nothing was found. Press RUN again — the hunt runs from wherever you are.</p>
              )}
            </div>
          )}
        </Panel>
      )}

      {/* ───────── feeds ───────── */}
      <Panel
        title="Books"
        subtitle={connection.mode === 'feed' ? 'server-side feeds configured' : 'no feed configured — manual mode'}
        icon={Database}
        right={<button type="button" onClick={() => setTab('connections')} className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300">setup</button>}
      >
        <div className="p-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
          {connectors.map((connector) => <BookCard key={connector.id} connector={connector} />)}
        </div>
      </Panel>

      {scanError && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-xs text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{scanError}</span>
        </div>
      )}

      {runSummary && runSummary.quoteCount === 0 && (
        <div className="bg-slate-900/60 border border-white/10 rounded-xl px-4 py-4 text-xs text-slate-400 leading-6">
          {runSummary.mode === 'feed' ? (
            <>
              <span className="font-bold text-slate-200">The books are connected but returned nothing.</span>{' '}
              The addresses answered without prices — usually a block or the wrong address. On the
              machine with your own connection run <code className="font-mono text-emerald-400">npm run doctor</code>
              {' '}to see which book is failing, then <code className="font-mono text-emerald-400">npm run setup</code>
              {' '}to look again.
            </>
          ) : (
            <>
              <span className="font-bold text-slate-200">This deployment has no book addresses yet.</span>{' '}
              The scanner only reads what the server has been given, and it has been given nothing —
              so RUN correctly returns 0 prices rather than inventing them.
              <span className="block mt-2">
                <strong className="text-slate-300">To fix it:</strong> on your own computer run{' '}
                <code className="font-mono text-emerald-400">npm run setup</code> (it opens each book and
                writes what it finds to <code className="font-mono text-emerald-400">.env</code>), then add
                those values as Worker secrets in Cloudflare —{' '}
                <code className="font-mono text-emerald-400">SPORTYBET_FEED_URL</code>,{' '}
                <code className="font-mono text-emerald-400">NAIRABET_FEED_URL</code>,{' '}
                <code className="font-mono text-emerald-400">BET22_FEED_URL</code> — and push once so the
                Worker picks them up. <code className="font-mono text-emerald-400">npm run doctor</code> checks
                both ends and prints the exact values.
              </span>
            </>
          )}
        </div>
      )}

      {/* ───────── tabs ───────── */}
      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Lab tools">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 border transition-colors ${
                tab === item.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {item.label}
            </button>
          );
        })}
        <span className="ml-auto hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-600 pr-1">
          <Keyboard className="w-3.5 h-3.5" /> press R to run
        </span>
      </div>

      {tab === 'scanner' && (
        <section className="space-y-4">
          <Panel
            title="Opportunities"
            subtitle={`₦${numeric(totalStake)} bankroll · exact event, market and rules matching · ${scannedAt ? `last run ${timeLabel(scannedAt)}` : 'not run yet'}${refreshing ? ' · reading fresh prices now' : priceAge !== null ? ` · prices ${priceAge < 60 ? `${priceAge}s` : `${Math.floor(priceAge / 60)}m`} old` : ''}`}
            icon={Gauge}
            right={(
              <div className="flex items-center gap-3">
                {connection.mode === 'feed' && (
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1.5">
                    <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} className="rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-500" />
                    60s auto
                  </label>
                )}
                <button type="button" onClick={scanLive} disabled={scanning || connection.state === 'loading'} className="px-4 py-2 rounded-lg bg-emerald-500 disabled:bg-white/10 disabled:text-slate-500 text-slate-950 text-[11px] font-black uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2">
                  {scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  {scanning ? 'downloading' : 'run'}
                </button>
              </div>
            )}
          >
            {opportunities.length > 0 ? (
              <div className="p-4 space-y-4">
                {opportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onOpen={openInCalculator}
                    firstSeen={seen?.[opportunity.id] ? timeLabel(seen[opportunity.id]) : null}
                    history={history.filter((entry) => entry.id === opportunity.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ShieldCheck}
                title="No live opportunities"
                action={(
                  <button type="button" onClick={() => setTab('calculator')} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                    open calculator
                  </button>
                )}
              >
                This area stays empty rather than filling with demo odds. Connect a permitted
                server-side feed, or use the calculator with prices open in your bookmaker tabs.
                Every result still requires manual verification and placement.
              </EmptyState>
            )}
          </Panel>
        </section>
      )}

      {tab === 'calculator' && (
        <section className="space-y-4">
          {training && (
            <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-3 text-xs text-sky-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 shrink-0" /><span><strong>Training prices, not a current tip.</strong> This historical worked example only demonstrates the arithmetic. Saving it is disabled.</span></div>
              <button type="button" onClick={resetCalculator} className="text-xs font-bold shrink-0 underline">Clear</button>
            </div>
          )}

          <Panel title="Event and market" subtitle="One event, one exact market, two or three outcomes" icon={FilePlus2}>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <label className={`${labelClass} sm:col-span-2`}>Event / match
                <input value={meta.event} onChange={(event) => { setMeta({ ...meta, event: event.target.value }); setTraining(false); }} placeholder="e.g. Team A vs Team B" className={`${inputClass} mt-1.5`} />
              </label>
              <label className={labelClass}>Sport
                <select value={meta.sport} onChange={(event) => setMeta({ ...meta, sport: event.target.value })} className={`${inputClass} mt-1.5`}>
                  {['Football', 'Basketball', 'Tennis', 'American Football', 'Ice Hockey', 'Other'].map((sport) => <option key={sport}>{sport}</option>)}
                </select>
              </label>
              <label className={labelClass}>Competition (optional)
                <input value={meta.competition} onChange={(event) => setMeta({ ...meta, competition: event.target.value })} placeholder="League or tournament" className={`${inputClass} mt-1.5`} />
              </label>
              <label className={`${labelClass} sm:col-span-2`}>Exact market and line
                <input value={meta.market} onChange={(event) => { setMeta({ ...meta, market: event.target.value }); setTraining(false); }} placeholder="e.g. 1X2, or Total points Over/Under 154.5" className={`${inputClass} mt-1.5`} />
              </label>
              <label className={labelClass}>Scheduled start (optional)
                <input type="datetime-local" value={meta.startsAt} onChange={(event) => setMeta({ ...meta, startsAt: event.target.value })} className={`${inputClass} mt-1.5`} />
              </label>
              <label className={labelClass}>Settlement rules to verify
                <input value={meta.rules} onChange={(event) => { setMeta({ ...meta, rules: event.target.value }); setTraining(false); }} placeholder="e.g. Overtime included at both books" className={`${inputClass} mt-1.5`} />
              </label>
            </div>
          </Panel>

          <Panel
            title="Best price for each outcome"
            subtitle="Decimal odds only. Links are for your own verification."
            icon={ListChecks}
            right={legs.length < 3 ? (
              <button type="button" onClick={addLeg} className="px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-bold text-slate-300 inline-flex items-center gap-1.5 hover:border-white/25">
                <Plus className="w-3.5 h-3.5" /> 3rd outcome
              </button>
            ) : null}
          >
            <div className="p-4 space-y-3">
              {legs.map((leg, index) => (
                <div key={leg.id} className="border border-white/10 rounded-xl p-3.5 bg-slate-950/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">outcome {index + 1}</span>
                    {legs.length > 2 && (
                      <button type="button" onClick={() => removeLeg(index)} aria-label={`Remove outcome ${index + 1}`} className="text-slate-500 hover:text-rose-400"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.65fr] gap-3">
                    <label className={labelClass}>Outcome label
                      <input value={leg.label} onChange={(event) => updateLeg(index, { label: event.target.value })} placeholder={legs.length === 3 ? ['Home', 'Draw', 'Away'][index] : index === 0 ? 'Over / Player A / Home' : 'Under / Player B / Away'} className={`${inputClass} mt-1`} />
                    </label>
                    <label className={labelClass}>Bookmaker
                      <select value={leg.bookmaker} onChange={(event) => updateLeg(index, { bookmaker: event.target.value })} className={`${inputClass} mt-1`}>
                        {BOOKMAKERS.map((book) => <option key={book.id} value={book.id}>{book.label}</option>)}
                      </select>
                    </label>
                    <label className={labelClass}>Decimal odds
                      <input type="number" min="1.01" step="0.0001" inputMode="decimal" value={leg.odds} onChange={(event) => updateLeg(index, { odds: event.target.value })} placeholder="2.00" className={`${inputClass} mt-1 font-mono`} />
                    </label>
                    <label className={`${labelClass} sm:col-span-2 lg:col-span-3`}>Bookmaker verification link (optional)
                      <div className="mt-1 flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-slate-600 shrink-0" />
                        <input type="url" value={leg.url} onChange={(event) => updateLeg(index, { url: event.target.value })} placeholder="https://…" className={`${inputClass} text-xs`} />
                        {safeHttpUrl(leg.url) && <a href={safeHttpUrl(leg.url)} target="_blank" rel="noreferrer" aria-label="Open bookmaker page" className="p-2 text-sky-400"><ExternalLink className="w-4 h-4" /></a>}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-4 items-start">
            <Panel title="Bankroll" icon={Calculator}>
              <div className="p-5 space-y-4">
                <label className={labelClass}>Total stake (NGN)
                  <div className="mt-1.5 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-500">₦</span>
                    <input type="number" min="1" step="100" value={totalStake} onChange={(event) => setTotalStake(event.target.value)} className={`${inputClass} pl-8 font-mono text-lg font-bold`} />
                  </div>
                </label>
                <label className={labelClass}>Round each stake to
                  <select value={rounding} onChange={(event) => setRounding(Number(event.target.value))} className={`${inputClass} mt-1.5`}>
                    <option value={1}>₦1 (most precise)</option><option value={50}>₦50</option><option value={100}>₦100</option><option value={500}>₦500</option><option value={1000}>₦1,000</option>
                  </select>
                </label>
                <p className="text-[11px] text-slate-500 leading-5 bg-slate-950/40 border border-white/5 rounded-xl p-3">
                  The calculator preserves your total stake and shows the <strong className="text-slate-300">lowest return after rounding</strong>, not just the ideal mathematical profit.
                </p>
              </div>
            </Panel>

            <div className={`border rounded-2xl overflow-hidden ${result.valid && result.isArb ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-slate-900/60'}`}>
              <div className="p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">implied probability</div>
                  <div className="font-mono text-3xl font-bold tabular-nums text-slate-100 mt-1">{result.valid ? `${numeric(result.impliedSum * 100)}%` : '—'}</div>
                  <div className="text-[11px] text-slate-500 mt-1">arbitrage only when this is below 100%</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-3xl font-bold tabular-nums ${result.valid && result.isArb ? 'text-emerald-400' : 'text-slate-600'}`}>{result.valid && result.isArb ? `+${numeric(result.theoreticalRoiPct)}%` : 'no arb'}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">theoretical roi</div>
                </div>
              </div>
              {result.errors.length > 0 && <div className="mx-5 mb-4 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 text-xs text-rose-200">{result.errors[0]}</div>}
              {result.valid && (
                <>
                  <div className="grid grid-cols-2 border-y border-white/10">
                    <div className="p-4 border-r border-white/10">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">ideal gross profit</div>
                      <div className="font-mono text-lg font-bold text-slate-100 mt-0.5">{money(result.theoreticalProfit, true)}</div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">min. profit after rounding</div>
                      <div className={`font-mono text-lg font-bold mt-0.5 ${result.minProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{money(result.minProfit, true)}</div>
                    </div>
                  </div>
                  <div className="divide-y divide-white/5">
                    {result.legs.map((leg) => {
                      const stood = priceStoodFor(leg.priceMovedAt);
                      return (
                        <div key={leg.id} className="px-5 py-3 grid grid-cols-[1fr_auto] gap-3 items-center">
                          <div>
                            <div className="text-sm font-bold text-slate-100">{leg.label || leg.outcome}</div>
                            <div className="text-[11px] text-slate-500">{leg.bookmakerLabel} · @{numeric(leg.odds)} · return {money(leg.returnAmount, true)}</div>
                            {stood ? <div className="text-[10px] text-slate-600">the book {stood}</div> : null}
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-lg font-bold text-slate-100">{money(leg.stake)}</div>
                            <div className="text-[10px] text-slate-600">exact {money(leg.exactStake, true)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {result.warnings.length > 0 && (
                    <div className="m-4 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{result.warnings.join(' ')}</span>
                    </div>
                  )}
                  <div className="p-4 flex flex-wrap gap-2">
                    <button type="button" onClick={copyStakes} className="px-3 py-2 rounded-lg border border-white/10 bg-slate-950 text-xs font-bold text-slate-300 inline-flex items-center gap-1.5 hover:border-white/25">
                      <Copy className="w-3.5 h-3.5" /> Copy stake plan
                    </button>
                    <button type="button" onClick={resetCalculator} className="px-3 py-2 rounded-lg border border-white/10 bg-slate-950 text-xs font-bold text-slate-400 hover:border-white/25">Reset</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <Panel title="Manual verification gate" subtitle="Tick these only after checking the bookmaker pages yourself. This app never places a bet." icon={ShieldCheck}>
            <div className="p-5">
              <div className="grid sm:grid-cols-2 gap-3">
                {CHECKS.map((label, index) => (
                  <label key={label} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${checks[index] ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10 bg-slate-950/40'}`}>
                    <input type="checkbox" checked={checks[index]} onChange={(event) => setChecks((current) => current.map((value, checkIndex) => checkIndex === index ? event.target.checked : value))} className="mt-0.5 rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-500" />
                    <span className="text-xs font-semibold text-slate-300 leading-5">{label}</span>
                  </label>
                ))}
              </div>
              <button type="button" disabled={!canSave} onClick={saveToLedger} className="mt-5 w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 disabled:bg-white/5 disabled:text-slate-600 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save plan to ledger
              </button>
              {!canSave && <p className="text-[11px] text-slate-600 mt-2">Needs a valid arbitrage with a non-negative minimum profit after rounding, all four checks and non-training prices. Event, market and outcome labels are also required.</p>}
            </div>
          </Panel>
        </section>
      )}

      {tab === 'ledger' && (
        <section className="space-y-4">
          <Panel
            title="Placement ledger"
            subtitle="Saved only in this browser. Nothing is sent to a bookmaker."
            icon={Clipboard}
            right={ledger.length > 0 ? (
              <button type="button" onClick={exportLedger} className="px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-bold text-slate-300 inline-flex items-center gap-1.5 hover:border-white/25">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            ) : null}
          >
            {ledger.length === 0 ? (
              <EmptyState icon={Clipboard} title="No placement plans saved" action={<button type="button" onClick={() => setTab('calculator')} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider">Open calculator</button>}>
                Verify an arbitrage in the calculator and save it here. You can then tick each
                bookmaker placement and record the actual return without deleting the original
                calculation.
              </EmptyState>
            ) : (
              <div className="p-4 space-y-4">
                {ledger.map((entry) => {
                  const allPlaced = entry.legs.every((leg) => leg.placed);
                  return (
                    <article key={entry.id} className="bg-slate-950/50 border border-white/10 rounded-2xl overflow-hidden">
                      <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <StatusPill tone={entry.status === 'settled' ? 'blue' : allPlaced ? 'green' : entry.status === 'partial' ? 'amber' : 'slate'} icon={entry.status === 'settled' ? CheckCircle2 : Clock3}>
                              {entry.status === 'settled' ? 'settled' : allPlaced ? 'all placed' : entry.status === 'partial' ? 'partial' : 'ready'}
                            </StatusPill>
                            <span className="text-[11px] text-slate-500">{timeLabel(entry.createdAt)}</span>
                          </div>
                          <h3 className="font-extrabold text-slate-100">{entry.meta?.event || 'Untitled event'}</h3>
                          <p className="text-xs text-slate-500 mt-1">{entry.meta?.market || 'Market not recorded'} · {entry.meta?.rules || 'Rules not recorded'}</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <div className="font-mono text-lg font-bold text-slate-100">{money(entry.totalStake)}</div>
                          <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">total staked</div>
                          <div className={`font-mono text-sm font-bold mt-1 ${(entry.actualProfit ?? entry.minProfit) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {entry.status === 'settled' ? `${money(entry.actualProfit, true)} actual` : `${money(entry.minProfit, true)} expected min.`}
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-white/5">
                        {entry.legs.map((leg) => {
                          const url = safeHttpUrl(leg.url);
                          return (
                            <div key={leg.id} className="px-5 py-3.5 flex items-center gap-3">
                              <button type="button" disabled={entry.status === 'settled'} onClick={() => togglePlaced(entry.id, leg.id)} aria-label={`${leg.placed ? 'Unmark' : 'Mark'} ${leg.label} placed`} className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${leg.placed ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-white/15 text-transparent'} disabled:opacity-60`}>
                                <Check className="w-4 h-4" />
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-slate-100 truncate">{leg.label}</div>
                                <div className="text-[11px] text-slate-500">{leg.bookmakerLabel} @{numeric(leg.odds)} · {leg.placed ? `marked ${timeLabel(leg.placedAt)}` : 'not marked placed'}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-sm font-bold text-slate-100">{money(leg.stake)}</div>
                                {url && <a href={url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-sky-400 inline-flex items-center gap-1">open book <ExternalLink className="w-3 h-3" /></a>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {entry.status !== 'settled' && (
                        <div className="p-4 bg-slate-950/40 border-t border-white/10">
                          {allPlaced ? (
                            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                              <label className={`${labelClass} flex-1`}>Actual total return (NGN)
                                <input type="number" min="0" step="0.01" value={returns[entry.id] ?? ''} onChange={(event) => setReturns({ ...returns, [entry.id]: event.target.value })} placeholder={String(Math.round(entry.minReturn))} className={`${inputClass} mt-1.5 font-mono`} />
                              </label>
                              <button type="button" onClick={() => settleEntry(entry.id)} className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Record result
                              </button>
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500">Mark every leg only after you have placed it yourself at the bookmaker. You can then record the actual settled return.</p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </Panel>
        </section>
      )}

      {tab === 'connections' && (
        <section className="space-y-4">
          <Panel title="Feeds" subtitle="what the server can actually read" icon={Database}>
            <div className="p-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
              {connectors.map((connector) => <BookCard key={connector.id} connector={connector} />)}
            </div>
          </Panel>

          <Panel title="Run history" subtitle="every run on this device" icon={History}>
            {runHistory.length === 0 ? (
              <EmptyState icon={Activity} title="No runs yet">Press RUN. Every run is logged here with what came down, what was rejected and how long it took.</EmptyState>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.14em] text-slate-500 border-b border-white/10">
                      <th className="text-left font-bold px-4 py-2.5">when</th>
                      <th className="text-left font-bold px-4 py-2.5">mode</th>
                      <th className="text-right font-bold px-4 py-2.5">prices</th>
                      <th className="text-right font-bold px-4 py-2.5">fresh</th>
                      <th className="text-right font-bold px-4 py-2.5">rejected</th>
                      <th className="text-right font-bold px-4 py-2.5">opps</th>
                      <th className="text-right font-bold px-4 py-2.5">books</th>
                      <th className="text-right font-bold px-4 py-2.5">took</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono tabular-nums">
                    {runHistory.map((run) => (
                      <tr key={run.id} className="text-slate-300">
                        <td className="px-4 py-2.5 whitespace-nowrap">{timeLabel(run.at)}</td>
                        <td className="px-4 py-2.5"><span className={run.ok ? 'text-emerald-400' : 'text-rose-400'}>{run.ok ? run.mode : 'error'}</span></td>
                        <td className="px-4 py-2.5 text-right">{run.quoteCount}</td>
                        <td className="px-4 py-2.5 text-right text-sky-300">{run.freshQuoteCount}</td>
                        <td className="px-4 py-2.5 text-right text-amber-300">{run.rejectedQuoteCount}</td>
                        <td className="px-4 py-2.5 text-right text-emerald-300">{run.opportunities}</td>
                        <td className="px-4 py-2.5 text-right text-slate-500">{run.booksLive}/{run.books}</td>
                        <td className="px-4 py-2.5 text-right text-slate-500">{(run.ms / 1000).toFixed(1)}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="How automatic scanning is enabled" icon={Info}>
            <div className="p-5">
              <ol className="space-y-2.5 text-xs text-slate-400 leading-6 list-decimal list-inside">
                <li>Deploy the included Cloudflare Worker or run the local API; a static site cannot fetch cross-origin bookmaker data.</li>
                <li>Configure a permitted JSON quote feed with <code className="font-mono text-emerald-400">ARB_FEED_URL</code>, or implement a book-specific server connector after reviewing access terms.</li>
                <li>Each quote must include event, market, settlement rules, outcome, bookmaker, decimal odds and its fetch timestamp. Only exact matches are compared.</li>
                <li>Press RUN, open a calculated plan, verify all four checks, then place every bet manually.</li>
              </ol>
              <p className="mt-4 text-[11px] text-slate-600">Technical setup and the normalized quote schema are documented in <strong className="text-slate-400">ARB_SCANNER.md</strong> in the repository.</p>
            </div>
          </Panel>
        </section>
      )}

      <footer className="text-[11px] text-slate-600 leading-5 flex items-start gap-2 pt-2">
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
        <p><strong className="text-slate-500">Risk:</strong> odds move, settlement rules differ, books limit or void bets, and one leg can fail after another is placed. Calculations are informational, not a promise of profit. 18+ only; stake only what you can afford to lose.</p>
      </footer>
    </div>
  );
}

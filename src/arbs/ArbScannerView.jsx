import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
  Info,
  Link2,
  ListChecks,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Scale,
  ShieldCheck,
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
const CHECKS = [
  'Same event and start time',
  'Exact same market and line',
  'Settlement rules match (including overtime)',
  'Odds and stake limits re-checked at every bookmaker',
];
const DEFAULT_CONNECTORS = [
  { id: 'sportybet', label: 'SportyBet NG', status: 'not_configured', detail: 'No verified server-side feed is configured.' },
  { id: 'nairabet', label: 'NairaBet', status: 'not_configured', detail: 'No verified server-side feed is configured.' },
  { id: '22bet', label: '22Bet NG', status: 'not_configured', detail: 'No verified server-side feed is configured.' },
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
  if (!value) return 'Time not supplied';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Time not supplied';
  return date.toLocaleString('en-NG', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function quoteAge(value) {
  if (!value) return { label: 'Price time unknown', stale: true };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: 'Price time unknown', stale: true };
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return { label: `${seconds}s old`, stale: seconds > 120 };
  if (seconds < 3600) return { label: `${Math.floor(seconds / 60)}m old`, stale: seconds > 300 };
  return { label: `${Math.floor(seconds / 3600)}h old`, stale: true };
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
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    red: 'bg-red-50 text-red-800 border-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${tones[tone]}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
}

function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-6 py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900">{title}</h3>
      <div className="text-sm text-slate-500 leading-6 max-w-lg mx-auto mt-2">{children}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function OpportunityCard({ opportunity, onOpen }) {
  const age = quoteAge(opportunity.latestQuoteAt);
  return (
    <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusPill tone="green" icon={BadgeCheck}>Matched {opportunity.way}-way market</StatusPill>
            <StatusPill tone={age.stale ? 'amber' : 'blue'} icon={Clock3}>{age.label}</StatusPill>
          </div>
          <h3 className="font-extrabold text-slate-900 text-lg leading-6">{opportunity.event}</h3>
          <p className="text-sm text-slate-500 mt-1">
            {opportunity.competition || opportunity.sport} · {timeLabel(opportunity.startsAt)}
          </p>
          <p className="text-sm font-semibold text-slate-700 mt-2">{opportunity.market}</p>
          <p className="text-xs text-slate-500 mt-0.5">Rules: {opportunity.rules || 'Confirm before placing'}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black tracking-tight text-emerald-700">+{numeric(opportunity.theoreticalRoiPct)}%</div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Theoretical ROI</div>
          <div className="text-sm font-bold text-slate-700 mt-2">{money(opportunity.minProfit)}</div>
          <div className="text-[11px] text-slate-400">min. after rounding</div>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {opportunity.legs.map((leg) => {
          const legAge = quoteAge(leg.fetchedAt);
          const url = safeHttpUrl(leg.url);
          return (
            <div key={leg.id} className="px-5 py-3.5 grid grid-cols-[1fr_auto] sm:grid-cols-[1.2fr_1fr_auto_auto] items-center gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{leg.label || leg.outcome}</div>
                <div className="text-xs text-slate-500 sm:hidden">{leg.bookmakerLabel}</div>
              </div>
              <div className="hidden sm:block text-sm font-semibold text-slate-600">{leg.bookmakerLabel}</div>
              <div className="text-right">
                <div className="text-sm font-black text-slate-900">@{numeric(leg.odds)}</div>
                <div className={`text-[10px] ${legAge.stale ? 'text-amber-600' : 'text-slate-400'}`}>{legAge.label}</div>
              </div>
              <div className="text-right col-span-2 sm:col-span-1">
                <div className="text-sm font-extrabold text-emerald-700">{money(leg.stake)}</div>
                {url && (
                  <a href={url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-blue-600 inline-flex items-center gap-1 mt-0.5">
                    Verify <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-slate-500 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
          Verify every price and rule again. A calculated edge is not a guaranteed filled bet.
        </p>
        <button type="button" onClick={() => onOpen(opportunity)} className="shrink-0 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-slate-800">
          Open calculator <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}

export default function ArbScannerView() {
  const [tab, setTab] = useState('scanner');
  const [connection, setConnection] = useState({ state: 'loading', mode: 'manual', connectors: DEFAULT_CONNECTORS });
  const [opportunities, setOpportunities] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [scannedAt, setScannedAt] = useState(null);
  const [runSummary, setRunSummary] = useState(null);
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

  const result = useMemo(
    () => calculateArbitrage(legs, { totalStake, rounding }),
    [legs, totalStake, rounding],
  );

  useEffect(() => {
    try { localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger)); } catch { /* Device storage can be unavailable. */ }
  }, [ledger]);

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

  const scanLive = useCallback(async () => {
    setScanning(true);
    setScanError('');
    const startedAt = Date.now();
    try {
      const params = new URLSearchParams({ totalStake: String(totalStake), rounding: String(rounding) });
      const response = await fetch(`/api/arbs?${params}`, { headers: { Accept: 'application/json' } });
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('The scanner API is not available on this deployment.');
      const data = await response.json();
      const found = Array.isArray(data.opportunities) ? data.opportunities : [];
      setOpportunities(found);
      if (Array.isArray(data.connectors)) setConnection((current) => ({ ...current, state: 'ready', mode: data.mode || current.mode, connectors: data.connectors }));
      setScannedAt(new Date().toISOString());
      setRunSummary({
        at: new Date().toISOString(),
        ms: Date.now() - startedAt,
        quoteCount: Number(data.quoteCount || 0),
        freshQuoteCount: Number(data.freshQuoteCount || 0),
        rejectedQuoteCount: Number(data.rejectedQuoteCount || 0),
        opportunities: found.length,
        mode: data.mode || 'manual',
        connectors: Array.isArray(data.connectors) ? data.connectors : [],
        errors: Array.isArray(data.errors) ? data.errors : [],
      });
      if (data.mode !== 'feed') setScanError('No automatic feed is configured. Use the manual calculator with prices you have verified.');
      if (Array.isArray(data.errors) && data.errors.length) setScanError(data.errors.join(' '));
    } catch (error) {
      setScanError(error.message || 'Scan failed. No prices were changed.');
      setOpportunities([]);
    } finally {
      setScanning(false);
    }
  }, [rounding, totalStake]);

  useEffect(() => {
    if (!autoRefresh || connection.mode !== 'feed') return undefined;
    const timer = window.setInterval(scanLive, 60000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, connection.mode, scanLive]);

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
    setNotice('Result recorded. The original calculation remains unchanged.');
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
    { id: 'calculator', label: 'NGN calculator', icon: Calculator },
    { id: 'ledger', label: `Placement ledger (${ledger.length})`, icon: Clipboard },
    { id: 'connections', label: 'Connections', icon: Database },
  ];
  const allChecked = checks.every(Boolean);
  const canSave = result.valid && result.executableInTheory && allChecked && !training;

  return (
    <div className="space-y-6">
      {notice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> {notice}
        </div>
      )}

      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 overflow-hidden relative">
        <div className="absolute -right-8 -top-10 opacity-[0.06]"><Scale className="w-52 h-52" /></div>
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusPill tone={connection.mode === 'feed' ? 'green' : 'amber'} icon={connection.mode === 'feed' ? Database : WifiOff}>
              {connection.state === 'loading' ? 'Checking data connection' : connection.mode === 'feed' ? 'Server feed configured' : 'Manual / offline calculator'}
            </StatusPill>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Pre-match · No auto-betting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Run the scanner.</h1>
          <p className="text-sm sm:text-base text-slate-300 leading-6 max-w-2xl mt-3">
            Press RUN and the server downloads the live pre-match prices from every book you have
            connected, lines them up against each other and shows only the markets that really
            match. You place every bet yourself.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              onClick={() => { setTab('scanner'); scanLive(); }}
              disabled={scanning}
              className="px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 disabled:text-slate-300 text-slate-950 text-base font-black uppercase tracking-[0.12em] inline-flex items-center gap-3 shadow-lg shadow-emerald-500/20"
            >
              {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              {scanning ? 'Downloading prices…' : 'Run — download the books’ prices'}
            </button>
            <button type="button" onClick={() => setTab('calculator')} className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-bold inline-flex items-center gap-2 hover:bg-white/15">
              <Calculator className="w-4 h-4" /> Calculate stakes
            </button>
            <button type="button" onClick={loadTrainingExample} className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-bold inline-flex items-center gap-2 hover:bg-white/15">
              <BookOpen className="w-4 h-4" /> Load labelled training example
            </button>
          </div>

          {runSummary && (
            <div className="mt-6 rounded-2xl bg-white/[0.06] border border-white/10 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="text-slate-400 font-semibold">Last run</span>
                <span className="text-white font-bold">{runSummary.opportunities} opportunity{runSummary.opportunities === 1 ? '' : 'ies'}</span>
                <span className="text-slate-300">{runSummary.quoteCount.toLocaleString()} prices downloaded</span>
                {runSummary.freshQuoteCount > 0 && <span className="text-slate-300">{runSummary.freshQuoteCount.toLocaleString()} still fresh</span>}
                {runSummary.rejectedQuoteCount > 0 && <span className="text-amber-300">{runSummary.rejectedQuoteCount.toLocaleString()} rejected (stale or started)</span>}
                <span className="text-slate-400">in {(runSummary.ms / 1000).toFixed(1)}s</span>
              </div>
              {runSummary.quoteCount === 0 && (
                <p className="mt-3 text-sm text-amber-200 leading-6">
                  No prices came down, because no book is connected yet. On the machine that
                  uses your own Nigerian connection: run <span className="font-bold text-white">node arb/discover.mjs</span>,
                  then put the address it finds in <span className="font-bold text-white">.env</span> as
                  SPORTYBET_FEED_URL (and the same for the other books) and press RUN again.
                </p>
              )}
              {runSummary.connectors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {runSummary.connectors.map((connector) => (
                    <span
                      key={connector.id}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
                        connector.status === 'connected'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : connector.status === 'error'
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {connector.label} · {connector.status === 'connected' ? `${connector.quoteCount || 0} prices` : connector.status === 'error' ? 'blocked' : 'not connected'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Arbitrage tools">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`shrink-0 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 border transition-colors ${tab === item.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              <Icon className="w-4 h-4" /> {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'scanner' && (
        <section className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-extrabold text-slate-900">Verified-feed scanner</h2>
              <p className="text-xs text-slate-500 mt-1">₦{numeric(totalStake)} bankroll · exact event, market and rules matching · {scannedAt ? `last scanned ${timeLabel(scannedAt)}` : 'not scanned yet'}</p>
            </div>
            <div className="flex items-center gap-3">
              {connection.mode === 'feed' && (
                <label className="text-xs font-semibold text-slate-600 inline-flex items-center gap-2">
                  <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  60s refresh
                </label>
              )}
              <button type="button" onClick={scanLive} disabled={scanning || connection.state === 'loading'} className="px-5 py-3 rounded-xl bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-black uppercase tracking-[0.1em] inline-flex items-center justify-center gap-2">
                {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {scanning ? 'Downloading…' : 'Run'}
              </button>
            </div>
          </div>

          {scanError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{scanError}</span>
            </div>
          )}

          {opportunities.length > 0 ? opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} onOpen={openInCalculator} />
          )) : (
            <EmptyState
              icon={ShieldCheck}
              title="No verified live opportunities to show"
              action={(
                <button type="button" onClick={() => setTab('calculator')} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold inline-flex items-center gap-2">
                  Enter verified odds manually <ArrowRight className="w-4 h-4" />
                </button>
              )}
            >
              This area stays empty rather than filling with demo odds. Connect a permitted server-side feed, or use the calculator with prices open in your bookmaker tabs. Every result still requires manual verification and placement.
            </EmptyState>
          )}
        </section>
      )}

      {tab === 'calculator' && (
        <section className="space-y-5">
          {training && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-900 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 shrink-0" /><span><strong>Training prices, not a current tip.</strong> This historical worked example only demonstrates the arithmetic. Saving it as an opportunity is disabled.</span></div>
              <button type="button" onClick={resetCalculator} className="text-xs font-bold shrink-0 underline">Clear</button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <FilePlus2 className="w-5 h-5 text-emerald-600" />
              <div><h2 className="font-extrabold text-slate-900">Event and market</h2><p className="text-xs text-slate-500">One event, one exact market, two or three outcomes.</p></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-slate-600 sm:col-span-2">Event / match
                <input value={meta.event} onChange={(event) => { setMeta({ ...meta, event: event.target.value }); setTraining(false); }} placeholder="e.g. Team A vs Team B" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="text-xs font-bold text-slate-600">Sport
                <select value={meta.sport} onChange={(event) => setMeta({ ...meta, sport: event.target.value })} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {['Football', 'Basketball', 'Tennis', 'American Football', 'Ice Hockey', 'Other'].map((sport) => <option key={sport}>{sport}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-slate-600">Competition (optional)
                <input value={meta.competition} onChange={(event) => setMeta({ ...meta, competition: event.target.value })} placeholder="League or tournament" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="text-xs font-bold text-slate-600 sm:col-span-2">Exact market and line
                <input value={meta.market} onChange={(event) => { setMeta({ ...meta, market: event.target.value }); setTraining(false); }} placeholder="e.g. 1X2, or Total points Over/Under 154.5" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="text-xs font-bold text-slate-600">Scheduled start (optional)
                <input type="datetime-local" value={meta.startsAt} onChange={(event) => setMeta({ ...meta, startsAt: event.target.value })} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label className="text-xs font-bold text-slate-600">Settlement rules to verify
                <input value={meta.rules} onChange={(event) => { setMeta({ ...meta, rules: event.target.value }); setTraining(false); }} placeholder="e.g. Overtime included at both books" className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2"><ListChecks className="w-5 h-5 text-emerald-600" /><div><h2 className="font-extrabold text-slate-900">Best price for each outcome</h2><p className="text-xs text-slate-500">Decimal odds only. Links are for your own verification.</p></div></div>
              {legs.length < 3 && <button type="button" onClick={addLeg} className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-50"><Plus className="w-3.5 h-3.5" /> Add 3rd outcome</button>}
            </div>
            <div className="space-y-3">
              {legs.map((leg, index) => (
                <div key={leg.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Outcome {index + 1}</span>
                    {legs.length > 2 && <button type="button" onClick={() => removeLeg(index)} aria-label={`Remove outcome ${index + 1}`} className="text-slate-400 hover:text-red-600"><X className="w-4 h-4" /></button>}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_0.65fr] gap-3">
                    <label className="text-[11px] font-bold text-slate-500">Outcome label
                      <input value={leg.label} onChange={(event) => updateLeg(index, { label: event.target.value })} placeholder={legs.length === 3 ? ['Home', 'Draw', 'Away'][index] : index === 0 ? 'Over / Player A / Home' : 'Under / Player B / Away'} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </label>
                    <label className="text-[11px] font-bold text-slate-500">Bookmaker
                      <select value={leg.bookmaker} onChange={(event) => updateLeg(index, { bookmaker: event.target.value })} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        {BOOKMAKERS.map((book) => <option key={book.id} value={book.id}>{book.label}</option>)}
                      </select>
                    </label>
                    <label className="text-[11px] font-bold text-slate-500">Decimal odds
                      <input type="number" min="1.01" step="0.0001" inputMode="decimal" value={leg.odds} onChange={(event) => updateLeg(index, { odds: event.target.value })} placeholder="2.00" className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </label>
                    <label className="text-[11px] font-bold text-slate-500 sm:col-span-2 lg:col-span-3">Bookmaker verification link (optional)
                      <div className="mt-1 flex items-center gap-2"><Link2 className="w-4 h-4 text-slate-400 shrink-0" /><input type="url" value={leg.url} onChange={(event) => updateLeg(index, { url: event.target.value })} placeholder="https://…" className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500" />{safeHttpUrl(leg.url) && <a href={safeHttpUrl(leg.url)} target="_blank" rel="noreferrer" aria-label="Open bookmaker page" className="p-2 text-blue-600"><ExternalLink className="w-4 h-4" /></a>}</div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-5 items-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="font-extrabold text-slate-900 flex items-center gap-2"><Calculator className="w-5 h-5 text-emerald-600" /> Bankroll</h2>
              <label className="block text-xs font-bold text-slate-600">Total stake (NGN)
                <div className="mt-1.5 relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-500">₦</span><input type="number" min="1" step="100" value={totalStake} onChange={(event) => setTotalStake(event.target.value)} className="w-full pl-8 pr-3 py-3 rounded-xl border border-slate-200 text-lg font-black focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              </label>
              <label className="block text-xs font-bold text-slate-600">Round each stake to
                <select value={rounding} onChange={(event) => setRounding(Number(event.target.value))} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value={1}>₦1 (most precise)</option><option value={50}>₦50</option><option value={100}>₦100</option><option value={500}>₦500</option><option value={1000}>₦1,000</option>
                </select>
              </label>
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 leading-5">The calculator preserves your total stake and shows the <strong>lowest return after rounding</strong>, not just the ideal mathematical profit.</div>
            </div>

            <div className={`border rounded-2xl overflow-hidden ${result.valid && result.isArb ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">Combined implied probability</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{result.valid ? `${numeric(result.impliedSum * 100)}%` : '—'}</div>
                  <div className="text-xs text-slate-500 mt-1">Arbitrage only when this is below 100%</div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black tracking-tight ${result.valid && result.isArb ? 'text-emerald-700' : 'text-slate-400'}`}>{result.valid && result.isArb ? `+${numeric(result.theoreticalRoiPct)}%` : 'No arb'}</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Theoretical ROI</div>
                </div>
              </div>
              {result.errors.length > 0 && <div className="mx-5 mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700">{result.errors[0]}</div>}
              {result.valid && (
                <>
                  <div className="grid grid-cols-2 border-y border-slate-200/80">
                    <div className="p-4 border-r border-slate-200/80"><div className="text-[11px] font-bold text-slate-500">Ideal gross profit</div><div className="text-lg font-black text-slate-900 mt-0.5">{money(result.theoreticalProfit, true)}</div></div>
                    <div className="p-4"><div className="text-[11px] font-bold text-slate-500">Min. profit after rounding</div><div className={`text-lg font-black mt-0.5 ${result.minProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{money(result.minProfit, true)}</div></div>
                  </div>
                  <div className="divide-y divide-slate-200/80">
                    {result.legs.map((leg) => (
                      <div key={leg.id} className="px-5 py-3 grid grid-cols-[1fr_auto] gap-3 items-center">
                        <div><div className="text-sm font-bold text-slate-900">{leg.label || leg.outcome}</div><div className="text-xs text-slate-500">{leg.bookmakerLabel} · @{numeric(leg.odds)} · return {money(leg.returnAmount, true)}</div></div>
                        <div className="text-right"><div className="text-lg font-black text-slate-900">{money(leg.stake)}</div><div className="text-[10px] text-slate-400">exact {money(leg.exactStake, true)}</div></div>
                      </div>
                    ))}
                  </div>
                  {result.warnings.length > 0 && <div className="m-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 flex items-start gap-2"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{result.warnings.join(' ')}</span></div>}
                  <div className="p-4 flex flex-wrap gap-2">
                    <button type="button" onClick={copyStakes} className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copy stake plan</button>
                    <button type="button" onClick={resetCalculator} className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700">Reset</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-2 mb-4"><ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" /><div><h2 className="font-extrabold text-slate-900">Manual verification gate</h2><p className="text-xs text-slate-500 mt-1">Tick these only after checking the bookmaker pages yourself. This app never places a bet.</p></div></div>
            <div className="grid sm:grid-cols-2 gap-3">
              {CHECKS.map((label, index) => (
                <label key={label} className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${checks[index] ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <input type="checkbox" checked={checks[index]} onChange={(event) => setChecks((current) => current.map((value, checkIndex) => checkIndex === index ? event.target.checked : value))} className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700 leading-5">{label}</span>
                </label>
              ))}
            </div>
            <button type="button" disabled={!canSave} onClick={saveToLedger} className="mt-5 w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-extrabold inline-flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save verified plan to placement ledger
            </button>
            {!canSave && <p className="text-[11px] text-slate-400 mt-2">Requires a valid arbitrage with a non-negative minimum profit after rounding, all four checks and non-training prices. Event, market and outcome labels are also required.</p>}
          </div>
        </section>
      )}

      {tab === 'ledger' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-extrabold text-slate-900">Manual placement ledger</h2><p className="text-xs text-slate-500 mt-1">Saved only in this browser. Nothing is sent to a bookmaker.</p></div>
            {ledger.length > 0 && <button type="button" onClick={exportLedger} className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"><Download className="w-4 h-4" /> Export CSV</button>}
          </div>
          {ledger.length === 0 ? (
            <EmptyState icon={Clipboard} title="No placement plans saved" action={<button type="button" onClick={() => setTab('calculator')} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">Open NGN calculator</button>}>
              Verify an arbitrage in the calculator and save it here. You can then tick each bookmaker placement and record the actual return without deleting the original calculation.
            </EmptyState>
          ) : ledger.map((entry) => {
            const allPlaced = entry.legs.every((leg) => leg.placed);
            return (
              <article key={entry.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusPill tone={entry.status === 'settled' ? 'blue' : allPlaced ? 'green' : entry.status === 'partial' ? 'amber' : 'slate'} icon={entry.status === 'settled' ? CheckCircle2 : Clock3}>
                        {entry.status === 'settled' ? 'Settled / recorded' : allPlaced ? 'All legs marked placed' : entry.status === 'partial' ? 'Partially placed' : 'Ready for manual placement'}
                      </StatusPill>
                      <span className="text-[11px] text-slate-400">{timeLabel(entry.createdAt)}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900">{entry.meta?.event || 'Untitled event'}</h3>
                    <p className="text-xs text-slate-500 mt-1">{entry.meta?.market || 'Market not recorded'} · {entry.meta?.rules || 'Rules not recorded'}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-lg font-black text-slate-900">{money(entry.totalStake)}</div>
                    <div className="text-xs text-slate-500">total staked</div>
                    <div className={`text-sm font-bold mt-1 ${(entry.actualProfit ?? entry.minProfit) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {entry.status === 'settled' ? `${money(entry.actualProfit, true)} actual` : `${money(entry.minProfit, true)} expected min.`}
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {entry.legs.map((leg) => {
                    const url = safeHttpUrl(leg.url);
                    return (
                      <div key={leg.id} className="px-5 py-3.5 flex items-center gap-3">
                        <button type="button" disabled={entry.status === 'settled'} onClick={() => togglePlaced(entry.id, leg.id)} aria-label={`${leg.placed ? 'Unmark' : 'Mark'} ${leg.label} placed`} className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${leg.placed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 text-transparent'} disabled:opacity-60`}><Check className="w-4 h-4" /></button>
                        <div className="min-w-0 flex-1"><div className="text-sm font-bold text-slate-900 truncate">{leg.label}</div><div className="text-xs text-slate-500">{leg.bookmakerLabel} @{numeric(leg.odds)} · {leg.placed ? `marked ${timeLabel(leg.placedAt)}` : 'not marked placed'}</div></div>
                        <div className="text-right"><div className="text-sm font-black text-slate-900">{money(leg.stake)}</div>{url && <a href={url} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-blue-600 inline-flex items-center gap-1">Open book <ExternalLink className="w-3 h-3" /></a>}</div>
                      </div>
                    );
                  })}
                </div>
                {entry.status !== 'settled' && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    {allPlaced ? (
                      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                        <label className="text-xs font-bold text-slate-600 flex-1">Actual total return (NGN)
                          <input type="number" min="0" step="0.01" value={returns[entry.id] ?? ''} onChange={(event) => setReturns({ ...returns, [entry.id]: event.target.value })} placeholder={String(Math.round(entry.minReturn))} className="mt-1.5 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold" />
                        </label>
                        <button type="button" onClick={() => settleEntry(entry.id)} className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Record final result</button>
                      </div>
                    ) : <p className="text-xs text-slate-500">Mark every leg only after you have placed it yourself at the bookmaker. You can then record the actual settled return.</p>}
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {tab === 'connections' && (
        <section className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-900 flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div><h2 className="font-extrabold">Honest connection status</h2><p className="leading-6 mt-1">Public pages and downloadable JavaScript do not prove a permitted or reliable odds feed. Until a server-side connector returns real timestamps, this deployment stays in manual mode and shows no invented opportunities.</p></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {(connection.connectors?.length ? connection.connectors : DEFAULT_CONNECTORS).map((connector) => {
              const connected = connector.status === 'connected';
              const configured = connector.status === 'configured';
              const error = connector.status === 'error';
              return (
                <div key={connector.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-2"><div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700">{connector.label.slice(0, 2).toUpperCase()}</div><StatusPill tone={connected ? 'green' : configured ? 'blue' : error ? 'red' : 'slate'} icon={connected || configured ? Database : WifiOff}>{connected ? 'Connected' : configured ? 'Configured' : error ? 'Feed error' : 'Not connected'}</StatusPill></div>
                  <h3 className="font-extrabold text-slate-900 mt-4">{connector.label}</h3>
                  <p className="text-xs text-slate-500 leading-5 mt-2">{connector.detail || 'No verified server-side feed is configured.'}</p>
                  {connector.quoteCount !== undefined && <p className="text-[11px] font-bold text-slate-400 mt-3">{connector.quoteCount} normalized quotes</p>}
                </div>
              );
            })}
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
            <h2 className="font-extrabold text-slate-900 flex items-center gap-2"><Database className="w-5 h-5 text-emerald-600" /> How automatic scanning is enabled</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-600 leading-6 list-decimal list-inside">
              <li>Deploy the included Cloudflare Worker or run the local API; static GitHub Pages cannot fetch cross-origin bookmaker data.</li>
              <li>Configure a permitted JSON quote feed with <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">ARB_FEED_URL</code>, or implement a book-specific server connector after reviewing access terms.</li>
              <li>Each quote must include event, market, settlement rules, outcome, bookmaker, decimal odds and its fetch timestamp. Only exact matches are compared.</li>
              <li>Use the Opportunities tab to scan. Open the calculated plan, verify all four checks, then place every bet manually.</li>
            </ol>
            <p className="mt-4 text-xs text-slate-400">Technical setup and the normalized quote schema are documented in <strong>ARB_SCANNER.md</strong> in the repository.</p>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 pt-5 text-xs text-slate-500 leading-5 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
        <p><strong>Risk warning:</strong> odds can move, markets can use different settlement rules, bookmakers can limit or void bets, and one leg can fail after another is placed. Calculations are informational, not a promise of profit. 18+ only; stake only what you can afford to lose.</p>
      </footer>
    </div>
  );
}

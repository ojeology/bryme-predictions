import { scanOpportunities } from '../src/lib/arbitrage.js';
import { getConnectorStatus, loadConnectorQuotes } from './connectors/index.js';
import { discoverBook, proveFeed, BOOK_PAGES } from './discovery.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function numberOption(value, fallback, { min, max, name }) {
  if (value === undefined || value === null || value === '') return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new Error(`${name} must be between ${min} and ${max}.`);
  }
  return number;
}

function scanOptions(source = {}) {
  return {
    totalStake: numberOption(source.totalStake, 100000, { min: 1, max: 1_000_000_000, name: 'totalStake' }),
    rounding: numberOption(source.rounding, 100, { min: 0, max: 1_000_000, name: 'rounding' }),
  };
}

function maxFeedAge(env) {
  return numberOption(env?.ARB_MAX_QUOTE_AGE_SECONDS, 300, { min: 30, max: 3600, name: 'ARB_MAX_QUOTE_AGE_SECONDS' });
}

function isFreshPreMatch(quote, now, maxAgeSeconds) {
  const fetchedAt = new Date(quote.fetchedAt || '').getTime();
  const startsAt = new Date(quote.startsAt || '').getTime();
  if (!Number.isFinite(fetchedAt) || !Number.isFinite(startsAt)) return false;
  const age = (now - fetchedAt) / 1000;
  return age >= -30 && age <= maxAgeSeconds && startsAt > now;
}

export async function scanConfiguredFeeds(env = {}, options = {}) {
  const status = getConnectorStatus(env);
  if (status.mode !== 'feed') {
    if (env.ARB_AUTO_DISCOVER === '0') {
      return { ...status, opportunities: [], quoteCount: 0, freshQuoteCount: 0, errors: [], scannedAt: new Date().toISOString() };
    }
    // Nothing is pinned. Rather than showing an empty table, the Worker hunts
    // for the feeds itself - from the point of presence nearest the person who
    // pressed RUN, which is what the books require. The hunt starts with the
    // addresses these books are known to publish; the deep crawl (reading the
    // book's own scripts) is what the FIND FEEDS button does.
    const found = await discoverAll(env, [], { crawl: false });
    const usable = found.filter((entry) => entry.status === 'found' && entry.url);
    if (!usable.length) {
      return {
        ...status,
        mode: 'discover',
        opportunities: [],
        quoteCount: 0,
        freshQuoteCount: 0,
        rejectedQuoteCount: 0,
        errors: found.map((entry) => `${entry.id}: ${entry.note || entry.status}`),
        discovery: found,
        scannedAt: new Date().toISOString(),
      };
    }
    return scanWithDiscovered(env, options, usable, found);
  }
  const { quotes, connectors, errors } = await loadConnectorQuotes(env);
  const maxQuoteAgeSeconds = maxFeedAge(env);
  const now = Date.now();
  const freshQuotes = quotes.filter((quote) => isFreshPreMatch(quote, now, maxQuoteAgeSeconds));
  if (quotes.length && !freshQuotes.length) {
    errors.push(`No quotes passed the pre-match and ${maxQuoteAgeSeconds}-second freshness checks. Missing fetchedAt/startsAt values are rejected.`);
  }
  const opportunities = scanOpportunities(freshQuotes, {
    ...options,
    maxQuoteAgeSeconds,
    now: new Date(now),
  });
  return {
    ok: true,
    mode: 'feed',
    connectors,
    opportunities,
    quoteCount: quotes.length,
    freshQuoteCount: freshQuotes.length,
    rejectedQuoteCount: quotes.length - freshQuotes.length,
    maxQuoteAgeSeconds,
    errors: [...new Set(errors)],
    scannedAt: new Date().toISOString(),
  };
}

/**
 * Feeds found by the Worker itself are kept for a while, so a second press of
 * RUN does not repeat the hunt.
 */
const discoveredCache = new Map();
const DISCOVERY_TTL_MS = 15 * 60 * 1000;

function cacheGet(id) {
  const entry = discoveredCache.get(id);
  if (!entry) return null;
  if (Date.now() - entry.at > DISCOVERY_TTL_MS) {
    discoveredCache.delete(id);
    return null;
  }
  return entry;
}

/** Hunt for one book's feed and remember it. */
export async function runDiscovery(bookId, env = {}, options = {}) {
  const result = await discoverBook(bookId, {
    timeoutMs: Number(env.ARB_DISCOVERY_TIMEOUT_MS || 9000),
    crawl: options.crawl !== false,
  });
  if (result.status === 'found') {
    discoveredCache.set(bookId, { url: result.url, quoteCount: result.quoteCount, at: Date.now() });
  }
  return {
    id: bookId,
    status: result.status,
    url: result.url || '',
    quoteCount: result.quoteCount || 0,
    note: result.note || '',
    attempts: (result.attempts || []).slice(0, 8).map((attempt) => ({
      url: attempt.url,
      ok: Boolean(attempt.ok),
      reason: attempt.ok ? `${attempt.quoteCount} quotes` : attempt.reason,
    })),
  };
}

/**
 * Quotes from a feed the Worker found by itself. Used when the operator has
 * not pinned an address, so RUN still works with nothing to configure.
 */
async function quotesFromDiscovered(bookmaker, env = {}) {
  const cached = cacheGet(bookmaker);
  if (!cached) return { quotes: [], error: null, url: '' };
  const result = await proveFeed(cached.url, bookmaker, { timeoutMs: Number(env.BOOK_TIMEOUT_MS || 8000) });
  if (!result.ok) return { quotes: [], error: new Error(result.reason), url: cached.url };
  const fetchedAt = new Date().toISOString();
  return {
    quotes: result.quotes.map((quote) => ({ ...quote, fetchedAt })),
    error: null,
    url: cached.url,
  };
}

/**
 * Hunt for every book's feed at once. Each book is independent, so they run
 * side by side; a book that fails never stops the others.
 */
export async function discoverAll(env = {}, bookIds = [], options = {}) {
  const ids = bookIds.length ? bookIds : Object.keys(BOOK_PAGES);
  const results = await Promise.all(ids.map((id) => runDiscovery(id, env, options).catch((error) => ({
    id, status: 'error', url: '', quoteCount: 0, note: error?.message || 'discovery failed', attempts: [],
  }))));
  return results;
}

async function scanWithDiscovered(env, options, usable, found) {
  const perBook = await Promise.all(usable.map(async (entry) => {
    const result = await quotesFromDiscovered(entry.id, env);
    return { id: entry.id, label: entry.id, quotes: result.quotes, error: result.error };
  }));

  const quotes = perBook.flatMap((entry) => entry.quotes);
  const errors = perBook.filter((entry) => entry.error).map((entry) => `${entry.id}: ${entry.error.message}`);
  for (const entry of found) {
    if (entry.status !== 'found') errors.push(`${entry.id}: ${entry.note || entry.status}`);
  }
  const maxQuoteAgeSeconds = maxFeedAge(env);
  const now = Date.now();
  const freshQuotes = quotes.filter((quote) => isFreshPreMatch(quote, now, maxQuoteAgeSeconds));
  const opportunities = scanOpportunities(freshQuotes, {
    ...options,
    maxQuoteAgeSeconds,
    now: new Date(now),
  });
  return {
    ok: true,
    mode: 'discover',
    connectors: found.map((entry) => ({
      id: entry.id,
      label: entry.id,
      status: entry.status === 'found' ? 'connected' : entry.status === 'blocked' ? 'error' : 'not_configured',
      detail: entry.status === 'found'
        ? `The Worker found this book's feed by itself (${entry.quoteCount} prices).`
        : (entry.note || 'No feed found.'),
      quoteCount: entry.quoteCount || 0,
      url: entry.url || '',
    })),
    opportunities,
    quoteCount: quotes.length,
    freshQuoteCount: freshQuotes.length,
    rejectedQuoteCount: quotes.length - freshQuotes.length,
    maxQuoteAgeSeconds,
    errors: [...new Set(errors)],
    discovery: found,
    scannedAt: new Date().toISOString(),
  };
}

export async function scanSubmittedQuotes(payload) {
  if (!payload || !Array.isArray(payload.quotes)) throw new Error('POST body must contain a quotes array.');
  if (payload.quotes.length > 2000) throw new Error('A manual scan accepts at most 2,000 quotes.');
  const options = scanOptions(payload);
  const opportunities = scanOpportunities(payload.quotes, {
    ...options,
    maxQuoteAgeSeconds: Number(payload.maxQuoteAgeSeconds) > 0 ? Number(payload.maxQuoteAgeSeconds) : 0,
    now: new Date(),
  });
  return {
    ok: true,
    mode: 'manual',
    opportunities,
    quoteCount: payload.quotes.length,
    scannedAt: new Date().toISOString(),
    rejectedGroupCount: opportunities.rejectedGroupCount || 0,
    notice: 'Calculations use only the submitted quotes. Matches that have already started are excluded. Verify current prices and rules manually before placement.',
  };
}

async function readJsonBody(request) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > 512_000) throw new Error('Request body exceeds the 512 KB limit.');
  const text = await request.text();
  if (text.length > 512_000) throw new Error('Request body exceeds the 512 KB limit.');
  try { return JSON.parse(text || '{}'); } catch { throw new Error('Request body must be valid JSON.'); }
}

/** Web Request handler shared by Cloudflare Workers and the local Vite adapter. */
export async function handleArbRequest(request, env = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  if (!['/api/arbs', '/api/arbs/status', '/api/arbs/scan', '/api/arbs/discover'].includes(path)) return null;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { Allow: 'GET, POST, OPTIONS', 'Cache-Control': 'no-store' } });
  }

  // Which Cloudflare point of presence actually served this request. With
  // smart placement the Worker runs in the nearest one to the person who
  // pressed the button - which is what decides whether the books answer.
  const edge = request.cf?.colo || null;
  try {
    if (path === '/api/arbs/status') {
      if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed.' }, 405);
      return json({ ok: true, ...getConnectorStatus(env), edge, checkedAt: new Date().toISOString() });
    }
    if (path === '/api/arbs') {
      if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed.' }, 405);
      const options = scanOptions(Object.fromEntries(url.searchParams));
      return json({ ...(await scanConfiguredFeeds(env, options)), edge });
    }
    if (path === '/api/arbs/discover') {
      if (request.method !== 'GET' && request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      const book = url.searchParams.get('book');
      const ids = book ? [book] : [];
      const results = await discoverAll(env, ids, { crawl: true });
      return json({ ok: true, results, edge, discoveredAt: new Date().toISOString() });
    }
    if (path === '/api/arbs/scan') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      return json(await scanSubmittedQuotes(await readJsonBody(request)));
    }
    return json({ ok: false, error: 'Not found.' }, 404);
  } catch (error) {
    return json({ ok: false, error: error?.message || 'Scanner request failed.' }, 400);
  }
}

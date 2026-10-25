import { scanOpportunities } from '../src/lib/arbitrage.js';
import { getConnectorStatus, loadConnectorQuotes } from './connectors/index.js';

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
    return { ...status, opportunities: [], quoteCount: 0, freshQuoteCount: 0, errors: [], scannedAt: new Date().toISOString() };
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

export async function scanSubmittedQuotes(payload) {
  if (!payload || !Array.isArray(payload.quotes)) throw new Error('POST body must contain a quotes array.');
  if (payload.quotes.length > 2000) throw new Error('A manual scan accepts at most 2,000 quotes.');
  const options = scanOptions(payload);
  const opportunities = scanOpportunities(payload.quotes, {
    ...options,
    maxQuoteAgeSeconds: Number(payload.maxQuoteAgeSeconds) > 0 ? Number(payload.maxQuoteAgeSeconds) : 0,
  });
  return {
    ok: true,
    mode: 'manual',
    opportunities,
    quoteCount: payload.quotes.length,
    scannedAt: new Date().toISOString(),
    notice: 'Calculations use only the submitted quotes. Verify current prices and rules manually before placement.',
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
  if (!['/api/arbs', '/api/arbs/status', '/api/arbs/scan'].includes(path)) return null;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { Allow: 'GET, POST, OPTIONS', 'Cache-Control': 'no-store' } });
  }

  try {
    if (path === '/api/arbs/status') {
      if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed.' }, 405);
      return json({ ok: true, ...getConnectorStatus(env), checkedAt: new Date().toISOString() });
    }
    if (path === '/api/arbs') {
      if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed.' }, 405);
      const options = scanOptions(Object.fromEntries(url.searchParams));
      return json(await scanConfiguredFeeds(env, options));
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

import { scanOpportunities, scanWithClusters, clusterFixtures, normalizeQuote } from '../src/lib/arbitrage.js';
import { getConnectorStatus, loadConnectorQuotes } from './connectors/index.js';
import { snapshotQuotes } from './connectors/snapshot.js';
import { discoverBook, proveFeed, BOOK_PAGES, KNOWN_FEEDS } from './discovery.js';
import { flattenBookPayload } from './connectors/normalize.js';
import { captureBookViaBrowser } from './browserFeed.js';

/** Hosts the probe is allowed to talk to. */
const PROBE_HOSTS = [
  '1xbet.ng', '22bet.ng', 'nairabet.com', '1xbet.com', '22bet.com',
  'api.1xbet.ng', 'api.22bet.ng', 'api.nairabet.com',
  'msport.com', 'www.msport.com', 'm.msport.ng', 'api.msport.ng',
  'bet9ja.com', 'www.bet9ja.com', 'api.bet9ja.com', 'sports.bet9ja.com',
  'merrybet.com', 'www.merrybet.com', 'merrybet.ng', 'api.merrybet.ng', 'mobile.merrybet.ng',
  'betking.com', 'www.betking.com', 'api.betking.com', 'sportsapicdn-desktop.betking.com',
  'm.22bet.ng', 'm.22bet.com', 'm.1xbet.ng',
  'gateway-ng.livescorebet.com', 'www.sportybet.com', 'sports.sportybet.com',
  // the widget platform NairaBet runs on, and the addresses its prices live on
  'biahosted.com', 'biahosted.net', 'twoup.io', 'tabet-live.io', 'traincdn.com',
];

async function probeBook(address, method, body, headers, seconds = 8) {
  let target;
  try { target = new URL(address); } catch { return { ok: false, error: 'That is not a web address.' }; }
  const allowed = PROBE_HOSTS.some((host) => target.hostname === host || target.hostname.endsWith('.' + host));
  if (!allowed) return { ok: false, error: 'That host is not on the book list.' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), seconds * 1000);
  try {
    const response = await fetch(target.toString(), {
      method: method || 'GET',
      body: body || undefined,
      headers: { Accept: '*/*', 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', ...(headers || {}) },
      signal: controller.signal,
    });
    const text = await response.text().catch((error) => `<<body unreadable: ${error?.message}>>`);
    return {
      ok: true,
      status: response.status,
      type: response.headers.get('content-type') || '',
      length: text.length,
      head: text.slice(0, 40000),
      tail: text.slice(-4000),
    };
  } catch (error) {
    return {
      ok: false,
      error: `The request did not finish: ${error?.message || error}`,
      errorName: error?.name || '',
      errorStack: String(error?.stack || '').slice(0, 500),
    };
  } finally {
    clearTimeout(timer);
  }
}
import { reportDiscovery, readKnownFeeds } from './report.js';

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
    debug: source.debug === '2' ? 2 : (source.debug === '1' || source.debug === 'true' ? 1 : 0),
    // which books to read: /api/arbs?books=betking,msport
    only: String(source.books || '').split(',').map((id) => id.trim()).filter(Boolean),
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

/**
 * A small look at what each book is offering, so a quiet scan can be
 * understood rather than guessed at.
 */
function sampleQuotes(quotes, perBook = 40) {
  const byBook = {};
  for (const quote of quotes) {
    const book = byBook[quote.bookmaker] = byBook[quote.bookmaker] || [];
    if (book.length >= perBook) continue;
    book.push({
      event: quote.event,
      eventId: quote.eventId,
      startsAt: quote.startsAt,
      competition: quote.competition,
      marketKey: quote.marketKey,
      outcome: quote.outcome,
      odds: quote.odds,
      rulesKey: quote.rulesKey,
    });
  }
  return byBook;
}

/**
 * How much the books actually have in common.
 *
 * A scanner that finds nothing should be able to say why: because the
 * books are not offering the same fixtures, because they are not offering
 * the same markets, or because the prices simply do not add up.
 */
function overlapReport(quotes, clustersByGroup = null) {
  const byBook = {};
  const groups = new Map();
  for (const quote of quotes) {
    byBook[quote.bookmaker] = (byBook[quote.bookmaker] || 0) + 1;
    const key = `${quote.sport}|${quote.marketKey}|${quote.rulesKey}|${quote.way}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(quote);
  }

  // The same fixture is recognised the way the scanner recognises it: by the
  // two team names and the kick-off time, not by the book's own event id.
  const fixtureCounts = {};
  const sharedFixtures = new Map();
  const closest = [];
  let twoBooks = 0;
  let threeBooks = 0;
  for (const [groupKey, groupQuotes] of groups) {
    // the scan has already worked out which prices belong to the same
    // match; that work is not done a second time here
    const clusters = clustersByGroup?.get(groupKey) || clusterFixtures(groupQuotes);
    for (const cluster of clusters) {
      const books = new Set(cluster.map((quote) => quote.bookmaker));
      const label = [...books].sort().join(' + ');
      fixtureCounts[label] = (fixtureCounts[label] || 0) + 1;
      if (books.size >= 2) {
        twoBooks += 1;
        const key = `${cluster[0].event}|${cluster[0].startsAt || 'unknown'}`;
        if (!sharedFixtures.has(key)) sharedFixtures.set(key, books);
        if (books.size >= 3) threeBooks += 1;
      }

      // How close the books came on the same market.  This is the same
      // calculation the scanner makes: the best price for each outcome, from
      // any book, added up.  Under 1.000 is an arbitrage; the nearer it is
      // to 1.000, the nearer the books are to disagreeing.  This is the
      // honest answer to "why was nothing found?".
      // a match only one book lists has nothing to compare: the books can
      // only be close to each other where two of them meet
      if (books.size < 2) continue;

      const outcomes = new Map();
      for (const quote of cluster) {
        if (!outcomes.has(quote.outcome)) outcomes.set(quote.outcome, []);
        outcomes.get(quote.outcome).push(quote);
      }
      const way = cluster[0].way;
      if (outcomes.size === way && way >= 2 && way <= 3) {
        const legs = [];
        for (const outcomeQuotes of outcomes.values()) {
          const unique = new Map();
          for (const quote of outcomeQuotes.sort((a, b) => b.odds - a.odds)) {
            const key = `${quote.bookmaker}|${quote.odds}`;
            if (!unique.has(key)) unique.set(key, quote);
          }
          const best = [...unique.values()].slice(0, 4);
          legs.push(best);
        }
        // take the best combination that uses at least two books
        const pick = (index, chosen, books) => {
          if (index === legs.length) {
            if (books.size < 2) return;
            const sum = chosen.reduce((total, leg) => total + 1 / leg.odds, 0);
            if (closest.length >= 12 && sum >= closest[closest.length - 1].impliedSum) return;
            closest.push({
              fixture: cluster[0].event,
              startsAt: cluster[0].startsAt || null,
              market: cluster[0].market,
              marketKey: cluster[0].marketKey,
              outcome: chosen.map((leg) => leg.outcome).join(' + '),
              impliedSum: Number(sum.toFixed(4)),
              books: chosen.map((leg) => leg.bookmaker),
              odds: chosen.map((leg) => leg.odds),
            });
            closest.sort((a, b) => a.impliedSum - b.impliedSum);
            if (closest.length > 12) closest.length = 12;
            return;
          }
          for (const leg of legs[index]) {
            chosen.push(leg);
            books.add(leg.bookmaker);
            pick(index + 1, chosen, books);
            chosen.pop();
            books.delete(leg.bookmaker);
          }
        };
        pick(0, [], new Set());
      }
    }
  }

  return {
    quotesPerBook: byBook,
    sharedFixtures: sharedFixtures.size,
    fixtureCounts,
    marketGroups: groups.size,
    groupsWithTwoBooks: twoBooks,
    groupsWithThreeBooks: threeBooks,
    closestPairs: closest.slice(0, 8),
    arbitragePairs: closest.filter((entry) => entry.impliedSum < 1).length,
  };
}

export async function scanConfiguredFeeds(env = {}, options = {}) {
  const status = getConnectorStatus(env);
  if (status.mode !== 'feed') {
    if (env.ARB_AUTO_DISCOVER === '0') {
      return { ...status, opportunities: [], quoteCount: 0, freshQuoteCount: 0, errors: [], scannedAt: new Date().toISOString() };
    }
    // Nothing is pinned. Two possibilities:
    //   a) a previous FIND FEEDS run already found the addresses - use them;
    //   b) nothing is known yet - hunt for one book now, and say so.
    const known = await readKnownFeeds(env);
    const knownList = Object.entries(known).map(([id, entry]) => ({
      id, status: 'found', url: entry.url, quoteCount: entry.quoteCount || 0, note: 'found by an earlier FIND FEEDS run', attempts: [],
    }));
    if (knownList.length) {
      return scanWithDiscovered(env, options, knownList, knownList);
    }
    const found = await discoverAll(env, [], { crawl: false });
    await reportDiscovery(env, found, { trigger: 'scan' });
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
  const { quotes, connectors, errors } = await loadConnectorQuotes(env, options);
  const maxQuoteAgeSeconds = maxFeedAge(env);
  const now = Date.now();
  const freshQuotes = quotes.filter((quote) => isFreshPreMatch(quote, now, maxQuoteAgeSeconds));
  if (quotes.length && !freshQuotes.length) {
    errors.push(`No quotes passed the pre-match and ${maxQuoteAgeSeconds}-second freshness checks. Missing fetchedAt/startsAt values are rejected.`);
  }
  const __t2 = Date.now();
  const { opportunities, clustersByGroup } = scanWithClusters(freshQuotes, {
    ...options,
    maxQuoteAgeSeconds,
    now: new Date(now),
    alreadyNormalized: true,
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
    overlap: overlapReport(freshQuotes, clustersByGroup),
    ...(options.debug === 2 ? { allQuotes: quotes.slice(0, 2500).map((quote) => ({
      bookmaker: quote.bookmaker, event: quote.event, startsAt: quote.startsAt,
      marketKey: quote.marketKey, outcome: quote.outcome, odds: quote.odds,
      rulesKey: quote.rulesKey, way: quote.way,
    })), allQuotesTruncated: quotes.length > 2500 } : options.debug ? { sample: sampleQuotes(quotes) } : {}),
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
    round: options.round === 2 ? 2 : 1,
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
    evidence: result.evidence || {},
    attempts: (result.attempts || []).slice(0, 20).map((attempt) => ({
      url: attempt.url,
      ok: Boolean(attempt.ok),
      status: attempt.status,
      keys: attempt.keys || [],
      reason: attempt.ok ? `${attempt.quoteCount} quotes` : attempt.reason,
      sample: String(attempt.ok ? (attempt.rawSample || '') : (attempt.sample || '')).slice(0, 400),
    })),
  };
}

/**
 * Quotes from a feed the Worker found by itself. Used when the operator has
 * not pinned an address, so RUN still works with nothing to configure.
 */
async function quotesFromDiscovered(bookmaker, env = {}, knownUrl = '') {
  const cached = cacheGet(bookmaker);
  const url = cached?.url || knownUrl || '';
  if (!url) return { quotes: [], error: null, url: '' };
  const result = await proveFeed(url, bookmaker, { timeoutMs: Number(env.BOOK_TIMEOUT_MS || 8000) });
  if (!result.ok) return { quotes: [], error: new Error(result.reason), url };
  const fetchedAt = new Date().toISOString();
  return {
    quotes: result.quotes.map((quote) => ({ ...quote, fetchedAt })),
    error: null,
    url,
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
    const result = await quotesFromDiscovered(entry.id, env, entry.url);
    return { id: entry.id, label: entry.id, quotes: result.quotes, error: result.error, url: result.url };
  }));

  const quotes = perBook.flatMap((entry) => entry.quotes);
  const errors = perBook.filter((entry) => entry.error).map((entry) => `${entry.id}: ${entry.error.message}`);
  for (const entry of found) {
    if (entry.status !== 'found') errors.push(`${entry.id}: ${entry.note || entry.status}`);
  }
  const maxQuoteAgeSeconds = maxFeedAge(env);
  const now = Date.now();
  const freshQuotes = quotes.filter((quote) => isFreshPreMatch(quote, now, maxQuoteAgeSeconds));
  const __t2 = Date.now();
  const { opportunities, clustersByGroup } = scanWithClusters(freshQuotes, {
    ...options,
    maxQuoteAgeSeconds,
    now: new Date(now),
    alreadyNormalized: true,
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

/**
 * Where does the Worker reach the world from? The books decide whether to
 * answer based on the country the request appears to come from, so this is
 * the one number that explains why a feed is refused.
 */
async function egressTrace() {
  try {
    const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
      headers: { Accept: 'text/plain' },
    });
    const text = await response.text();
    const out = {};
    for (const line of text.split('\n')) {
      const [key, ...rest] = line.trim().split('=');
      if (key && rest.length) out[key] = rest.join('=');
    }
    return { country: out.loc || null, colo: out.colo || null, ip: out.ip || null, warp: out.warp || null };
  } catch {
    return { country: null, colo: null, ip: null, warp: null };
  }
}

/** Web Request handler shared by Cloudflare Workers and the local Vite adapter. */
export async function handleArbRequest(request, env = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  if (!['/api/arbs', '/api/arbs/status', '/api/arbs/scan', '/api/arbs/discover', '/api/arbs/whereami', '/api/arbs/candidates', '/api/arbs/ingest', '/api/arbs/browser', '/api/arbs/probe', '/api/arbs/snapshot'].includes(path)) return null;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { Allow: 'GET, POST, OPTIONS', 'Cache-Control': 'no-store' } });
  }

  // Which Cloudflare point of presence actually served this request. With
  // smart placement the Worker runs in the nearest one to the person who
  // pressed the button - which is what decides whether the books answer.
  const edge = request.cf?.colo || null;
  try {
    if (path === '/api/arbs/probe') {
      let spec = {};
      if (request.method === 'GET') {
        spec = { url: url.searchParams.get('url'), method: 'GET', seconds: Number(url.searchParams.get('seconds')) || 8 };
      } else {
        try { spec = await request.json(); } catch (error) {
          return json({ ok: false, error: `The body must be JSON: ${error?.message || error}` }, 400);
        }
      }
      const result = await probeBook(spec.url, spec.method, spec.body, spec.headers, Number(spec.seconds) || 8);
      return json({ ...result, edge, checkedAt: new Date().toISOString() });
    }
    if (path === '/api/arbs/browser') {
      if (request.method !== 'GET' && request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      let book = url.searchParams.get('book');
      if (request.method === 'POST') {
        try {
          const peek = await request.clone().json();
          if (peek.book) book = peek.book;
        } catch { /* the body may arrive later */ }
      }
      if (!book) return json({ ok: false, error: 'Name one book: /api/arbs/browser?book=22bet' }, 400);
      let probe = null;
      let askedUrl = null;
      let extraPages = [];
      let waitMs = Number(url.searchParams.get('wait')) || 9000;
      if (request.method === 'POST') {
        let spec = {};
        try { spec = await request.json(); } catch { spec = {}; }
        if (spec.probe) probe = spec.probe;
        if (spec.wait) waitMs = Number(spec.wait) || waitMs;
        if (spec.book) book = spec.book;
        if (spec.url) askedUrl = spec.url;
        if (spec.pages) extraPages = spec.pages;
      }
      const capture = await captureBookViaBrowser(env, book, { waitMs, probe, pageUrl: askedUrl, pages: extraPages });
      const quotes = [];
      const shapes = [];
      for (const entry of capture.payloads || []) {
        let payload;
        try { payload = JSON.parse(entry.body); } catch { continue; }
        const found = flattenBookPayload(payload, { bookmaker: book });
        shapes.push({ url: entry.url, quotes: found.length });
        quotes.push(...found);
      }
      return json({
        ok: capture.ok,
        note: capture.note,
        book,
        quoteCount: quotes.length,
        quotes: quotes.slice(0, 2000),
        urls: capture.urls,
        requests: capture.requests,
        allPayloads: capture.allPayloads,
        pageUrl: capture.pageUrl,
        pageTitle: capture.pageTitle,
        pageText: capture.pageText,
        probe: capture.probe,
        shapes,
        edge,
        checkedAt: new Date().toISOString(),
      });
    }
    if (path === '/api/arbs/candidates') {
      if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed.' }, 405);
      const feeds = {};
      for (const [book, urls] of Object.entries(KNOWN_FEEDS)) feeds[book] = urls.slice(0, 8);
      return json({ ok: true, feeds });
    }
    if (path === '/api/arbs/snapshot') {
      // what the free reader published, book by book
      const books = {};
      for (const book of ['sportybet', 'msport', 'betking', 'livescorebet']) {
        const result = await snapshotQuotes(env, book);
        books[book] = {
          quotes: result.quotes.length,
          capturedAt: result.capturedAt,
          error: result.error?.message || null,
        };
      }
      return json({ ok: true, books, checkedAt: new Date().toISOString() });
    }

    if (path === '/api/arbs/ingest') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      // The phone collected the books' own answers on the phone's own
      // network - the phone's connection is inside the country the books
      // answer. The server only turns them into comparable quotes.
      let body;
      try { body = await request.json(); } catch { return json({ ok: false, error: 'The body must be JSON.' }, 400); }
      const feeds = Array.isArray(body?.feeds) ? body.feeds : [];
      if (!feeds.length) return json({ ok: false, error: 'Send {feeds:[{book, payload}]}.' }, 400);
      const quotes = [];
      const perBook = [];
      for (const feed of feeds) {
        const book = String(feed?.book || 'unknown');
        try {
          const bookQuotes = flattenBookPayload(feed?.payload, { bookmaker: book });
          quotes.push(...bookQuotes);
          perBook.push({ book, quoteCount: bookQuotes.length, ok: true });
        } catch (error) {
          perBook.push({ book, quoteCount: 0, ok: false, error: error?.message || 'could not read that answer' });
        }
      }
      const opportunities = scanOpportunities(quotes, {
        totalStake: numberOption(body?.totalStake, 100000, { min: 1, max: 1_000_000_000, name: 'totalStake' }),
        rounding: numberOption(body?.rounding, 100, { min: 0, max: 1_000_000, name: 'rounding' }),
        maxQuoteAgeSeconds: maxFeedAge(env),
        now: new Date(),
      });
      const fresh = quotes.filter((quote) => isFreshPreMatch(quote, Date.now(), maxFeedAge(env)));
      return json({
        ok: true,
        perBook,
        quoteCount: quotes.length,
        freshQuoteCount: fresh.length,
        rejectedQuoteCount: quotes.length - fresh.length,
        opportunities,
        rejectedGroupCount: opportunities.rejectedGroupCount || 0,
        edge,
        checkedAt: new Date().toISOString(),
      });
    }
    if (path === '/api/arbs/whereami') {
      if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed.' }, 405);
      const cf = request.cf || {};
      return json({
        ok: true,
        // where the request came from
        phone: { country: cf.country || null, colo: cf.colo || null, ip: cf.clientIp || null },
        // where the Worker itself reaches the world from
        worker: await egressTrace(),
        edge,
        checkedAt: new Date().toISOString(),
      });
    }
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
      if (!book) return json({ ok: false, error: 'Name one book: /api/arbs/discover?book=sportybet' }, 400);
      const round = url.searchParams.get('round') === '2' ? 2 : 1;
      // One book per request: Cloudflare allows a limited number of open
      // subrequests per invocation, and hunting through a whole book takes a
      // good many of them. Round 2 continues where round 1 stopped.
      const results = await discoverAll(env, [book], { crawl: true, round });
      // The country the Worker reaches the world from decides whether a book
      // answers at all, so it goes into the report next to the evidence.
      const egress = await egressTrace();
      const report = await reportDiscovery(env, results, {
        edge,
        trigger: 'discover',
        phoneCountry: request.cf?.country || null,
        workerCountry: egress.country || null,
        workerColo: egress.colo || null,
      });
      return json({ ok: true, results, edge, report, discoveredAt: new Date().toISOString() });
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

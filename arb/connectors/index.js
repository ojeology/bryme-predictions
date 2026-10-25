import { normalizeBookmaker, normalizeQuote, parseOdds } from '../../src/lib/arbitrage.js';
import { fetchJsonFeed } from './jsonFeed.js';
import { flattenBookPayload } from './normalize.js';
import { fetchLiveScoreBetQuotes, isLiveScoreBetGateway } from './livescorebetFeed.js';
import { fetchBook } from './httpBook.js';
import { fetchBookWithBrowser } from './browserBook.js';
import { fetchMsportQuotes } from './msportFeed.js';
import { fetchBetkingQuotes } from './betkingFeed.js';
import { openSharedBrowser, closeSharedBrowser } from './browserSession.js';
import { snapshotQuotes } from './snapshot.js';

export const CONNECTORS = [
  // these three are also read by the free reader on GitHub's runners, and
  // its published prices come first: they carry the whole slate and cost no
  // browser time
  { id: 'sportybet', label: 'SportyBet NG', envKey: 'SPORTYBET_FEED_URL', snapshot: true },
  { id: 'nairabet', label: 'NairaBet', envKey: 'NAIRABET_FEED_URL' },
  { id: '22bet', label: '22Bet NG', envKey: 'BET22_FEED_URL' },
  { id: '1xbet', label: '1xBet', envKey: 'BET1X_FEED_URL' },
  { id: 'livescorebet', label: 'LiveScore Bet NG', envKey: 'LSCB_FEED_URL', snapshot: true },
  // MSport is read over plain HTTP (with the browser as a fallback)
  { id: 'msport', label: 'MSport', envKey: 'MSPORT_FEED_URL', reader: fetchMsportQuotes, snapshot: true },
  // BetKing's edge only answers a real browser, so it gets one
  { id: 'betking', label: 'BetKing', envKey: 'BETKING_FEED_URL', reader: fetchBetkingQuotes, viaBrowser: true, snapshot: true },
];

function configured(definition, env) {
  return Boolean(env?.[definition.envKey] || env?.ARB_FEED_URL);
}

export function getConnectorStatus(env = {}) {
  const mode = CONNECTORS.some((definition) => configured(definition, env)) ? 'feed' : 'manual';
  return {
    mode,
    connectors: CONNECTORS.map((definition) => ({
      id: definition.id,
      label: definition.label,
      status: configured(definition, env) ? 'configured' : 'not_configured',
      detail: configured(definition, env)
        ? 'A server-side JSON feed is configured. Run a scan to verify reachability and quote timestamps.'
        : 'No verified server-side feed is configured.',
    })),
  };
}

// Prices read through a browser are kept for a minute and a half, so a
// second press of RUN does not spend more of the daily browser budget.  The
// quotes keep the time they were really fetched, so the freshness check
// still holds them to account.
const BROWSER_CACHE_MS = 90_000;
const browserCache = new Map();

function browserCachePick(definitions, env) {
  const hits = new Map();
  const now = Date.now();
  for (const definition of definitions) {
    const entry = browserCache.get(definition.id);
    if (entry && entry.url === env[definition.envKey] && now - entry.at <= BROWSER_CACHE_MS) {
      hits.set(definition.id, entry);
    }
  }
  return hits;
}

function browserCachePut(id, url, quotes) {
  if (!quotes?.length) return;
  browserCache.set(id, { id, url, at: Date.now(), quotes });
}

function usableQuote(quote) {
  const odds = parseOdds(quote.odds ?? quote.price);
  return quote.event && quote.market && quote.outcome && quote.bookmaker
    && quote.rulesKey !== 'unspecified' && Number.isFinite(odds) && odds > 1;
}

/**
 * Modular book adapters. Each currently accepts a permitted, operator-supplied
 * JSON feed; no access-control bypass or browser challenge solving is included.
 */
export async function loadConnectorQuotes(env = {}, options = {}) {
  // a scan can be limited to some of the books, which is how a single book
  // is checked on its own
  const only = Array.isArray(options.only) && options.only.length
    ? new Set(options.only.map((id) => String(id)))
    : null;
  // One book at a time, on purpose: a book's own price tree can be several
  // megabytes of JSON, and holding two of them at once is enough to run the
  // Worker out of memory. Each payload is released before the next one is
  // fetched.
  const combined = env.ARB_FEED_URL
    ? await fetchJsonFeed(env.ARB_FEED_URL)
      .then((payload) => ({ quotes: flattenBookPayload(payload, { bookmaker: 'combined' }), error: null }))
      .catch((error) => ({ quotes: [], error }))
    : { quotes: [], error: null };

  // The prices the free reader published come first: they carry the whole
  // slate, and they cost no browser time at all.
  const published = new Map();
  const snapshotErrors = [];
  for (const definition of CONNECTORS) {
    if (!definition.snapshot) continue;
    const result = await snapshotQuotes(env, definition.id);
    if (result.quotes.length) {
      published.set(definition.id, result.quotes);
    } else if (result.error) {
      snapshotErrors.push(`${definition.label}: ${result.error.message}`);
    }
  }

  // The books whose edge only serves a real browser share ONE browser
  // session, with a tab each: the free plan allows ten minutes of browser
  // time a day and one new browser every twenty seconds.  A book whose
  // prices the free reader already published does not need one.
  const browserBooks = CONNECTORS.filter((d) => d.viaBrowser && env[d.envKey] && !published.has(d.id));
  const cached = browserCachePick(browserBooks, env);
  const needsBrowser = browserBooks.filter((d) => !cached.has(d.id));
  let sharedBrowser = null;
  let browserError = null;
  if (needsBrowser.length) {
    const opened = await openSharedBrowser(env);
    sharedBrowser = opened.browser;
    browserError = opened.error;
  }

  const specific = [];
  try {
  for (const definition of CONNECTORS) {
    if (!env[definition.envKey] || (only && !only.has(definition.id))) {
      specific.push({ quotes: [], error: null, attempted: false });
      continue;
    }
    try {
      const feedUrl = env[definition.envKey];

      // the free reader's published prices come first
      if (published.has(definition.id)) {
        specific.push({ quotes: published.get(definition.id), error: null, attempted: true, source: 'reader' });
        continue;
      }

      if (definition.reader) {
        // a book that needs its own way of asking (a POST, or a browser)
        const hit = cached.get(definition.id);
        if (hit) {
          specific.push({ quotes: hit.quotes, error: null, attempted: true, cached: true });
          continue;
        }
        const result = await definition.reader(env, feedUrl, { browser: sharedBrowser });
        if (result.error) throw result.error;
        browserCachePut(definition.id, feedUrl, result.quotes);
        specific.push({ quotes: result.quotes, error: null, attempted: true });
      } else if (isLiveScoreBetGateway(feedUrl)) {
        // this book's whole slate does not fit in memory at once, so it is
        // read in pieces
        const result = await fetchLiveScoreBetQuotes(feedUrl, {
          maxCompetitions: Number(env.LSB_MAX_COMPETITIONS || 32),
        });
        if (result.error) throw result.error;
        specific.push({ quotes: result.quotes, error: null, attempted: true });
      } else {
        const payload = await fetchJsonFeed(feedUrl);
        const quotes = flattenBookPayload(payload, { bookmaker: definition.id });
        specific.push({ quotes, error: null, attempted: true });
      }
    } catch (error) {
      specific.push({ quotes: [], error, attempted: true });
    }
  }
  } finally {
    await closeSharedBrowser(sharedBrowser);
  }

  const allQuotes = [];
  const errors = [];
  const connectors = await Promise.all(CONNECTORS.map(async (definition, index) => {
    const own = specific[index];
    const ownQuotes = [];
    const sources = [];
    if (own.attempted && !own.error) {
      // a quote that already carries this book's name is used as it is:
      // copying thousands of prices again is what runs a Worker out of memory
      for (const quote of own.quotes) {
        sources.push(quote.bookmaker === definition.id ? quote : { ...quote, bookmaker: definition.id });
      }
    }
    if (env.ARB_FEED_URL && !combined.error) {
      sources.push(...combined.quotes.filter((quote) => normalizeBookmaker(quote.bookmaker || quote.book) === definition.id));
    }

    // normalizeQuote builds a new object of its own, so the quote is not
    // copied again first
    const normalized = sources.map((quote) => normalizeQuote(
      quote.bookmaker === definition.id ? quote : { ...quote, bookmaker: definition.id },
    ));
    const usable = normalized.filter(usableQuote);
    allQuotes.push(...usable);

    // The book may also be read through its own JSON endpoint, or through a
    // headless browser when the prices are only in the page.
    if (!usable.length && !definition.viaBrowser && (env[definition.envKey] || env[`${definition.id.toUpperCase()}_BROWSER_URL`] || env.BROWSER_BOOK_URL)) {
      const viaHttp = await fetchBook(env, definition);
      const viaBrowser = viaHttp.quotes.length ? { quotes: [], error: null }
        : await fetchBookWithBrowser(env, definition);
      const chosen = viaHttp.quotes.length ? viaHttp : viaBrowser;
      if (chosen.quotes.length) {
        allQuotes.push(...chosen.quotes);
        ownQuotes.push(...chosen.quotes);
      }
      if (chosen.error) errors.push(`${definition.label}: ${chosen.error}`);
    }

    if (own.error) errors.push(`${definition.label}: ${own.error.message}`);
    if (configured(definition, env) && own.error && (combined.error || !env.ARB_FEED_URL)) {
      return { id: definition.id, label: definition.label, status: 'error', detail: own.error.message, quoteCount: 0 };
    }
    if (configured(definition, env) && combined.error && !own.attempted) {
      return { id: definition.id, label: definition.label, status: 'error', detail: combined.error.message, quoteCount: 0 };
    }
    if (!configured(definition, env)) {
      return { id: definition.id, label: definition.label, status: 'not_configured', detail: 'No verified server-side feed is configured.', quoteCount: 0 };
    }
    return {
      id: definition.id,
      label: definition.label,
      status: 'connected',
      detail: usable.length
        ? 'JSON feed reachable. Quotes still pass exact-market and stale-price checks during scanning.'
        : 'Feed reachable, but it returned no usable quotes for this bookmaker.',
      quoteCount: usable.length + ownQuotes.length,
    };
  }));

  if (combined.error) errors.push(`Combined feed: ${combined.error.message}`);
  errors.push(...snapshotErrors);
  return { quotes: allQuotes, connectors, errors: [...new Set(errors)] };
}

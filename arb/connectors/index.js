import { normalizeBookmaker, normalizeQuote, parseOdds } from '../../src/lib/arbitrage.js';
import { fetchJsonFeed } from './jsonFeed.js';
import { flattenBookPayload } from './normalize.js';
import { fetchLiveScoreBetQuotes, isLiveScoreBetGateway } from './livescorebetFeed.js';
import { fetchBook } from './httpBook.js';
import { fetchBookWithBrowser } from './browserBook.js';
import { fetchMsportQuotes } from './msportFeed.js';
import { fetchBetkingQuotes } from './betkingFeed.js';
import { openSharedBrowser, closeSharedBrowser } from './browserSession.js';
import { snapshotQuotes, dispatchReader, waitForFreshReader, snapshotMaxAgeSeconds } from './snapshot.js';

export const CONNECTORS = [
  // these three are also read by the free reader on GitHub's runners, and
  // its published prices come first: they carry the whole slate and cost no
  // browser time
  { id: 'sportybet', label: 'SportyBet NG', envKey: 'SPORTYBET_FEED_URL', snapshot: true },
  // NairaBet's own price tree is nearly three megabytes: reading it here
  // would cost more CPU than the whole scan may use, so the free reader
  // reads it and publishes the prices that another book is also showing
  { id: 'nairabet', label: 'NairaBet', envKey: 'NAIRABET_FEED_URL', snapshot: true, snapshotOnly: true },
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
  //
  // If they have gone cold, the reader is started and waited for: the
  // prices of a match that is already being played are no use, and the
  // reader takes about a minute and a half.
  const published = new Map();
  const publishedAt = new Map();
  const snapshotErrors = [];
  const readerNotes = [];

  const readBooks = async (force) => {
    published.clear();
    publishedAt.clear();
    const problems = [];
    for (const definition of CONNECTORS) {
      if (!definition.snapshot) continue;
      if (only && !only.has(definition.id)) continue;
      const result = await snapshotQuotes(env, definition.id, { force });
      if (result.quotes.length) {
        published.set(definition.id, result.quotes);
        publishedAt.set(definition.id, result.capturedAt);
      } else if (result.error) {
        problems.push(`${definition.label}: ${result.error.message}`);
      }
    }
    // the notes of a cold read are not kept once fresh prices have arrived
    if (force) snapshotErrors.length = 0;
    snapshotErrors.push(...problems);
  };
  const __t0 = Date.now();
  await readBooks(false);
  console.log('TIMING readBooks', Date.now() - __t0, 'ms');

  // How old are the prices?  The age is taken from the prices themselves,
  // not from a summary: the summary can be served from a copy kept by the
  // address, and a copy of a copy is how a scan ends up looking at prices
  // that have been cold for an hour.
  const ages = [...publishedAt.values()]
    .map((at) => (Date.now() - new Date(at).getTime()) / 1000)
    .filter((age) => Number.isFinite(age));
  const oldest = ages.length ? Math.max(...ages) : Infinity;
  const maxAge = snapshotMaxAgeSeconds(env);

  if (!Number.isFinite(oldest) || oldest > maxAge) {
    // the prices have expired: there is nothing to compare, so the read is
    // started and waited for
    const started = await dispatchReader(env);
    if (started.dispatched) {
      const fresh = await waitForFreshReader(env, { timeoutMs: 200000 });
      await readBooks(true);
      const newAges = [...publishedAt.values()]
        .map((at) => (Date.now() - new Date(at).getTime()) / 1000)
        .filter((age) => Number.isFinite(age));
      const age = newAges.length ? Math.round(Math.max(...newAges) / 60) : null;
      const wasMinutes = Number.isFinite(oldest) ? `${Math.round(oldest / 60)} minutes old` : 'there were none';
      readerNotes.push(fresh.ok
        ? `The prices had expired (${wasMinutes}), so a fresh read was started and waited for. The prices now are ${age} minute${age === 1 ? '' : 's'} old.`
        : `The prices had expired (${wasMinutes}) and a fresh read was started.`);
    } else {
      readerNotes.push(`The prices had expired and the reader could not be started: ${started.error}.`);
    }
  } else if (oldest > 600) {
    // the prices are still good, but they are getting old: a fresh read is
    // started in the background so the next press has the newest ones
    const started = await dispatchReader(env);
    if (started.dispatched) {
      readerNotes.push(`The prices are ${Math.round(oldest / 60)} minutes old; a fresh read has been started in the background.`);
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

      // a book the free reader reads for us: its prices are read there, and
      // read here only when the reader has published them
      if (definition.snapshotOnly && !published.has(definition.id)) {
        specific.push({
          quotes: [],
          error: new Error("The free reader has not published this book's prices yet."),
          attempted: true,
        });
        continue;
      }

      // the free reader's published prices come first
      if (published.has(definition.id)) {
        specific.push({
          quotes: published.get(definition.id),
          error: null,
          attempted: true,
          source: 'reader',
          readAt: publishedAt.get(definition.id) || null,
        });
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

  const __t1 = Date.now();
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
    // The last way of asking a book is only for a book that was asked for,
    // that has no other way of asking, and whose feed is small enough to
    // read in one piece.  LiveScore Bet's whole football slate is nearly
    // ten megabytes: reading it in one piece is what runs a Worker out of
    // memory, so that book is read in pieces by its own reader.
    if (own.attempted && !usable.length && !definition.viaBrowser && !definition.reader
        && !isLiveScoreBetGateway(env[definition.envKey] || '')
        && (env[definition.envKey] || env[`${definition.id.toUpperCase()}_BROWSER_URL`] || env.BROWSER_BOOK_URL)) {
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
    const readBy = own.source === 'reader' ? own.readAt : null;
    const ageMinutes = readBy ? Math.max(0, Math.round((Date.now() - new Date(readBy).getTime()) / 60000)) : null;
    return {
      id: definition.id,
      label: definition.label,
      status: 'connected',
      detail: usable.length
        ? (readBy
          ? `Read by the free runner ${ageMinutes} minute${ageMinutes === 1 ? '' : 's'} ago. Every price still passes the exact-market and freshness checks.`
          : 'JSON feed reachable. Quotes still pass exact-market and stale-price checks during scanning.')
        : 'Feed reachable, but it returned no usable quotes for this bookmaker.',
      quoteCount: usable.length + ownQuotes.length,
      readAt: readBy,
    };
  }));

  if (combined.error) errors.push(`Combined feed: ${combined.error.message}`);
  errors.push(...snapshotErrors);
  errors.push(...readerNotes);
  return { quotes: allQuotes, connectors, errors: [...new Set(errors)] };
}

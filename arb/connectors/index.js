import { normalizeBookmaker, normalizeQuote } from '../../src/lib/arbitrage.js';
import { fetchJsonFeed } from './jsonFeed.js';

export const CONNECTORS = [
  { id: 'sportybet', label: 'SportyBet NG', envKey: 'SPORTYBET_FEED_URL' },
  { id: 'nairabet', label: 'NairaBet', envKey: 'NAIRABET_FEED_URL' },
  { id: '22bet', label: '22Bet NG', envKey: 'BET22_FEED_URL' },
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

function usableQuote(quote) {
  return quote.event && quote.market && quote.outcome && quote.bookmaker && quote.rulesKey !== 'unspecified' && Number.isFinite(quote.odds) && quote.odds > 1;
}

/**
 * Modular book adapters. Each currently accepts a permitted, operator-supplied
 * JSON feed; no access-control bypass or browser challenge solving is included.
 */
export async function loadConnectorQuotes(env = {}) {
  const combinedPromise = env.ARB_FEED_URL
    ? fetchJsonFeed(env.ARB_FEED_URL).then((quotes) => ({ quotes, error: null })).catch((error) => ({ quotes: [], error }))
    : Promise.resolve({ quotes: [], error: null });

  const [combined, ...specific] = await Promise.all([
    combinedPromise,
    ...CONNECTORS.map(async (definition) => {
      if (!env[definition.envKey]) return { quotes: [], error: null, attempted: false };
      try {
        return { quotes: await fetchJsonFeed(env[definition.envKey]), error: null, attempted: true };
      } catch (error) {
        return { quotes: [], error, attempted: true };
      }
    }),
  ]);

  const allQuotes = [];
  const errors = [];
  const connectors = CONNECTORS.map((definition, index) => {
    const own = specific[index];
    const sources = [];
    if (own.attempted && !own.error) {
      sources.push(...own.quotes.map((quote) => ({ ...quote, bookmaker: definition.id })));
    }
    if (env.ARB_FEED_URL && !combined.error) {
      sources.push(...combined.quotes.filter((quote) => normalizeBookmaker(quote.bookmaker || quote.book) === definition.id));
    }

    const normalized = sources.map((quote) => normalizeQuote({ ...quote, bookmaker: definition.id }));
    const usable = normalized.filter(usableQuote);
    allQuotes.push(...usable);

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
      quoteCount: usable.length,
    };
  });

  if (combined.error) errors.push(`Combined feed: ${combined.error.message}`);
  return { quotes: allQuotes, connectors, errors: [...new Set(errors)] };
}

/**
 * FINDING THE FEEDS FROM THE SERVER
 * ==================================
 * The user has no terminal, so the Worker does the hunting.
 *
 * For each book it tries, in order:
 *   1. the address families that book is known to publish (fast, no crawling);
 *   2. the book's own sports page, then the JavaScript it loads, looking for
 *      the path those scripts call for prices.
 *
 * Every candidate is PROVEN before it is accepted: it is fetched and run
 * through the same normaliser the scanner uses, and it only counts if it
 * produces real quotes. A page that answers with a challenge, a login wall
 * or an empty shell is reported as such, never as a working feed.
 *
 * Because the Worker runs in the Cloudflare point of presence nearest the
 * person who pressed the button, the requests leave from their own country -
 * which is what the books require.
 */
import { flattenBookPayload } from './connectors/normalize.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const LINEFEED_QUERY = 'mode=4&count=200&lng=en&country=566&getEmpty=true';

export const BOOK_PAGES = {
  sportybet: 'https://www.sportybet.com/ng/sports/football',
  nairabet: 'https://nairabet.com/sports/football',
  '22bet': 'https://22bet.ng/en/sports/football',
  '1xbet': 'https://1xbet.ng/en/sports/football',
  livescorebet: 'https://livescorebet.com/ng/sports/football',
};

/** Addresses these books are known to publish. Tried before any crawling. */
export const KNOWN_FEEDS = {
  '1xbet': [
    `https://linefeed.1xbet.com/linefeed/getLineFeed?${LINEFEED_QUERY}`,
    `https://sports.1xbet.com/linefeed/getLineFeed?${LINEFEED_QUERY}`,
    `https://sports.1xbet.ng/linefeed/getLineFeed?${LINEFEED_QUERY}`,
    `https://linefeed.1xbet.ng/linefeed/getLineFeed?${LINEFEED_QUERY}`,
    `https://1xbet.ng/linefeed/getLineFeed?${LINEFEED_QUERY}`,
    `https://sports.1xbet.com/linefeed/getPreMatchLineFeed?${LINEFEED_QUERY}`,
  ],
  '22bet': [
    `https://22bet.ng/linefeed/getLineFeed?${LINEFEED_QUERY}`,
    `https://sports.22bet.ng/linefeed/getLineFeed?${LINEFEED_QUERY}`,
    `https://linefeed.22bet.com/linefeed/getLineFeed?${LINEFEED_QUERY}`,
    `https://22bet.com/linefeed/getLineFeed?${LINEFEED_QUERY}`,
  ],
  sportybet: [
    'https://www.sportybet.com/ng/api/v1/odds',
    'https://www.sportybet.com/ng/api/v1/sports/football',
    'https://api.sportybet.com/ng/v1/odds',
  ],
  nairabet: [
    'https://nairabet.com/api/sports/football',
    'https://api.nairabet.com/sports/football',
  ],
  livescorebet: [],
};

function headers(extra = {}) {
  return {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-NG,en;q=0.9',
    'User-Agent': UA,
    ...extra,
  };
}

async function fetchText(url, { timeoutMs = 9000, maxBytes = 3_000_000, extraHeaders } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { headers: headers(extraHeaders), signal: controller.signal, redirect: 'follow' });
    const text = await response.text();
    if (text.length > maxBytes) return { ok: false, status: response.status, text: '', blocked: false, tooBig: true };
    return { ok: response.ok, status: response.status, text, blocked: blocked(text, response.status) };
  } catch (error) {
    return { ok: false, status: 0, text: '', blocked: false, error: error?.name === 'AbortError' ? 'timed out' : (error?.message || 'failed') };
  } finally {
    clearTimeout(timer);
  }
}

function blocked(text, status) {
  if (status === 403 || status === 429 || status === 503) return true;
  const head = String(text || '').slice(0, 500).toLowerCase();
  return /cloudflare|captcha|just a moment|access denied|unusual traffic|verify you are human|enable javascript/.test(head);
}

/** Fetch a candidate and prove it produces quotes through the real normaliser. */
export async function proveFeed(url, bookmaker, { timeoutMs = 9000 } = {}) {
  const result = await fetchText(url, { timeoutMs, maxBytes: 3_000_000 });
  if (!result.ok) {
    return { ok: false, url, reason: result.blocked ? `blocked (HTTP ${result.status})` : (result.error || `HTTP ${result.status}`) };
  }
  if (result.tooBig) return { ok: false, url, reason: 'response too large' };
  let payload;
  try {
    payload = JSON.parse(result.text);
  } catch {
    return { ok: false, url, reason: 'not JSON' };
  }
  const quotes = flattenBookPayload(payload, { bookmaker, defaultRules: 'unspecified', now: new Date() });
  if (!quotes.length) return { ok: false, url, reason: 'JSON, but no prices in it' };
  return { ok: true, url, quoteCount: quotes.length, quotes, sample: quotes[0] };
}

/** The scripts a page loads, and any API-looking path inside them. */
export function extractApiPaths(html, baseUrl, scriptBodies = []) {
  const found = new Set();
  const add = (value) => {
    if (!value || typeof value !== 'string') return;
    const trimmed = value.trim();
    if (trimmed.length < 4 || trimmed.length > 160) return;
    if (!/api|feed|odds|linefeed|coupon|sport|market|event/i.test(trimmed)) return;
    found.add(trimmed);
  };

  const scriptSrcs = [...String(html).matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]);
  const scriptUrls = scriptSrcs.slice(0, 10).map((src) => {
    try { return new URL(src, baseUrl).toString(); } catch { return null; }
  }).filter(Boolean);

  const bodies = [html, ...scriptBodies];
  for (const body of bodies) {
    const text = String(body || '').slice(0, 1_200_000);
    for (const match of text.matchAll(/https?:\\?\/\\?\/[a-z0-9.-]{3,60}\.[a-z]{2,12}(?:\\?\/[a-z0-9_\-./?=&%]{2,120})?/gi)) {
      add(match[0].replace(/\\/g, ''));
    }
    for (const match of text.matchAll(/["'](\/[a-z0-9_\-.\/?=&%:#{}~]{3,160})["']/gi)) {
      add(match[1]);
    }
  }

  const resolved = [];
  for (const candidate of found) {
    try {
      const url = new URL(candidate, baseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) continue;
      if (/\.(js|mjs|css|png|jpe?g|svg|webp|gif|ico|woff2?|map)$/i.test(url.pathname)) continue;
      resolved.push(url.toString());
    } catch { /* not a url */ }
  }
  return { scriptUrls, candidates: [...new Set(resolved)].slice(0, 14) };
}

/** Look inside a book's own page for the address it calls for prices. */
export async function crawlBook(bookId, { timeoutMs = 9000 } = {}) {
  const page = BOOK_PAGES[bookId];
  if (!page) return { candidates: [], scriptUrls: [], note: 'no known page for this book' };
  const html = await fetchText(page, { timeoutMs, maxBytes: 1_500_000 });
  if (!html.ok || html.blocked) {
    return { candidates: [], scriptUrls: [], note: html.blocked ? `the page served a challenge (HTTP ${html.status})` : `page unavailable (HTTP ${html.status})` };
  }
  const first = extractApiPaths(html.text, page);
  const bodies = [];
  for (const scriptUrl of first.scriptUrls.slice(0, 6)) {
    const script = await fetchText(scriptUrl, { timeoutMs: 7000, maxBytes: 1_500_000 });
    if (script.ok && !script.blocked && script.text) bodies.push(script.text);
  }
  const second = extractApiPaths('', page, bodies);
  const candidates = [...new Set([...first.candidates, ...second.candidates])].slice(0, 14);
  return { candidates, scriptUrls: first.scriptUrls, note: `page loaded, ${first.scriptUrls.length} scripts read` };
}

/** Discover one book's working feed. */
export async function discoverBook(bookmaker, { timeoutMs = 9000, crawl = true } = {}) {
  const known = KNOWN_FEEDS[bookmaker] || [];
  const attempts = [];

  const knownResults = await Promise.all(known.map(async (url) => {
    const result = await proveFeed(url, bookmaker, { timeoutMs });
    attempts.push({ url, ...result });
    return result;
  }));
  const winner = knownResults.find((result) => result.ok);
  if (winner) {
    return { id: bookmaker, status: 'found', url: winner.url, quoteCount: winner.quoteCount, attempts };
  }

  if (crawl) {
    const crawlResult = await crawlBook(bookmaker, { timeoutMs });
    const probed = await Promise.all(crawlResult.candidates.map(async (url) => {
      const result = await proveFeed(url, bookmaker, { timeoutMs: 7000 });
      attempts.push({ url, ...result });
      return result;
    }));
    const found = probed.find((result) => result.ok);
    if (found) {
      return { id: bookmaker, status: 'found', url: found.url, quoteCount: found.quoteCount, attempts, note: crawlResult.note };
    }
    return { id: bookmaker, status: 'none', url: '', quoteCount: 0, attempts, note: crawlResult.note };
  }

  const blockedCount = attempts.filter((attempt) => /blocked/.test(attempt.reason || '')).length;
  return {
    id: bookmaker,
    status: 'blocked',
    url: '',
    quoteCount: 0,
    attempts,
    note: blockedCount
      ? `the book served a challenge instead of prices (${blockedCount} attempt${blockedCount === 1 ? '' : 's'})`
      : 'no address answered with prices',
  };
}

/**
 * A book connector that reads the bookmaker's own JSON endpoint.
 *
 * No browser, no DOM, no scraping of rendered markup: this is the same JSON
 * the sportsbook's own web app calls.  It is far lighter, far more complete
 * and far less fragile than driving a browser - but it is also the route
 * most likely to be rate-limited or geo-blocked, so every connector:
 *   - sends a normal browser-shaped request,
 *   - honours a short timeout,
 *   - refuses a response that is not JSON (a block page or a challenge),
 *   - stamps every quote with the time it was actually fetched, which is what
 *     the scanner's freshness gate reads.
 */
import { flattenBookPayload } from './normalize.js';

const MAX_BYTES = 2_000_000;

function browserHeaders(env = {}) {
  const extra = {};
  const raw = env.BOOK_EXTRA_HEADERS;
  if (raw) {
    try { Object.assign(extra, JSON.parse(raw)); } catch { /* ignore a malformed header block */ }
  }
  return {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-NG,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      + '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ...extra,
  };
}

export function looksBlocked(text, status) {
  if (status === 403 || status === 429 || status === 503) return true;
  const head = String(text || '').slice(0, 400).toLowerCase();
  return /cloudflare|captcha|challenge|just a moment|access denied|unusual traffic/.test(head);
}

/** Fetch a JSON payload of any shape. Throws with a readable reason. */
export async function fetchJson(url, options = {}) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Feed URL is invalid.');
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Feed URL must use HTTP or HTTPS.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 8000);
  try {
    const response = await fetch(parsed, {
      headers: browserHeaders(options.env),
      signal: controller.signal,
      redirect: 'follow',
    });
    const text = await response.text();
    if (text.length > MAX_BYTES) throw new Error('Response exceeds the 2 MB safety limit.');
    if (looksBlocked(text, response.status)) {
      throw new Error(`Request was blocked (HTTP ${response.status}) - the book served a challenge, not prices.`);
    }
    if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}.`);
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Response was not JSON (the endpoint may need a session or a browser).');
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(`Request timed out after ${options.timeoutMs || 8000} ms.`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Read one book. The endpoint comes from server configuration only.
 * The payload may be any of the shapes normalize.js understands.
 */
export async function fetchBook(env = {}, definition = {}) {
  const url = env[definition.envKey];
  if (!url) return { quotes: [], error: null, detail: 'no endpoint configured' };
  try {
    const payload = await fetchJson(url, { env, timeoutMs: Number(env.BOOK_TIMEOUT_MS || 8000) });
    const fetchedAt = new Date().toISOString();
    const quotes = flattenBookPayload(payload, {
      bookmaker: definition.id,
      defaultRules: env[`${definition.id.toUpperCase()}_DEFAULT_RULES`] || env.BOOK_DEFAULT_RULES || 'unspecified',
      defaultFamily: env[`${definition.id.toUpperCase()}_DEFAULT_FAMILY`] || env.BOOK_DEFAULT_FAMILY || '',
      minStake: Number(env[`${definition.id.toUpperCase()}_MIN_STAKE`] || env.BOOK_MIN_STAKE) || null,
      now: fetchedAt,
    }).map((q) => ({ ...q, fetchedAt }));
    return { quotes, error: null, detail: `${quotes.length} quotes from ${definition.label}` };
  } catch (error) {
    return { quotes: [], error: error.message, detail: error.message };
  }
}

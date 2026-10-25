/**
 * Reading MSport's prices.
 *
 * MSport publishes its price tree here:
 *   POST https://www.msport.com/api/ng/facts-center/query/frontend/sports-matches-list?sportId=sr:sport:1&timeslot=Today
 *
 * The edge in front of it answers a normal web client with the prices, and
 * answers an unknown client with a "your browser is out of date" page.  The
 * request is a plain public call - no account, no cookie, no bet - so it is
 * made as an ordinary web client would make it, with the headers the book's
 * own web app sends.
 *
 * If the edge ever stops answering that way, the same question is asked from
 * inside a real browser on the book's own page, which is what a visitor
 * opening the site does.  Nothing is guessed, no check is solved, no bet is
 * placed.
 */
import { fetchMsportQuotesViaBrowser } from './msportBrowser.js';
import { flattenMsport } from './msport.js';

/** A current web client's identity, the way any browser sends it. */
export const WEB_CLIENT = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept-Language': 'en-NG,en;q=0.9',
};

/** The headers the book's own web app sends with every price request. */
function appHeaders() {
  return {
    operid: '2',
    deviceId: crypto.randomUUID(),
    ApiLevel: '2',
    devMem: '2',
    network: '4g',
    screenWH: '412x900',
    clientid: 'WEB',
    platform: 'WEB',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/**
 * Ask the book for its prices over plain HTTP.
 *
 * @param {string} url the price endpoint (server-side configuration)
 * @returns {Promise<{payload: object|null, error: Error|null}>}
 */
async function fetchMsportPayload(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...WEB_CLIENT, ...appHeaders() },
      body: '[]',
      signal: controller.signal,
      redirect: 'follow',
    });
    const text = await response.text();
    if (!response.ok) {
      return { payload: null, error: new Error(`MSport answered HTTP ${response.status}.`) };
    }
    try {
      const payload = JSON.parse(text);
      if (!payload || typeof payload !== 'object' || !payload.data) {
        return { payload: null, error: new Error('MSport answered with something that is not a price tree.') };
      }
      return { payload, error: null };
    } catch {
      return { payload: null, error: new Error('MSport answered with a page instead of prices.') };
    }
  } catch (error) {
    if (error?.name === 'AbortError') return { payload: null, error: new Error('MSport did not answer in time.') };
    return { payload: null, error };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch MSport's prices.
 *
 * @param {object} env    the Worker environment (needs the browser binding
 *                         only for the fallback)
 * @param {string} url    the price endpoint (server-side configuration)
 * @returns {Promise<{quotes: Array, error: Error|null, detail: string}>}
 */
export async function fetchMsportQuotes(env = {}, url = '', options = {}) {
  if (!url) return { quotes: [], error: null, detail: 'no endpoint configured' };

  const fetchedAt = new Date().toISOString();
  const direct = await fetchMsportPayload(url);
  if (direct.payload) {
    const quotes = flattenMsport(direct.payload, { bookmaker: 'msport', url, now: fetchedAt });
    if (quotes.length) {
      return { quotes, error: null, detail: `${quotes.length} quotes from MSport` };
    }
    // an answer with no prices in it is no better than no answer
  }

  // the fallback: the same question, asked from inside a real browser
  const viaBrowser = await fetchMsportQuotesViaBrowser(env, url, options);
  if (viaBrowser.error) {
    const why = direct.error ? `${direct.error.message} The browser route failed too: ${viaBrowser.error.message}` : viaBrowser.error.message;
    return { quotes: [], error: new Error(`MSport did not return prices: ${why}`), detail: why };
  }
  return viaBrowser;
}

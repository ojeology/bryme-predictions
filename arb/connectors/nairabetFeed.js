/**
 * Reading NairaBet's prices.
 *
 * NairaBet runs on the Altenar/SB widget platform, which answers a public
 * JSON endpoint:
 *   GET https://sb2frontend-altenar2.biahosted.com/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=nairabet&deviceType=desktop&sportId=66
 *
 * The answer is the book's own price tree - the same one the public website
 * is built on.  It is a plain public call: no account, no cookie, no bet.
 * The request is made as an ordinary web client would make it.
 *
 * Nothing is guessed, no check is solved, and no bet is placed.
 */
import { flattenNairaBet } from './nairabet.js';

/** A current web client's identity, the way any browser sends it. */
export const WEB_CLIENT = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-GB,en;q=0.9',
  'Referer': 'https://nairabet.com/',
  'Origin': 'https://nairabet.com',
};

/**
 * Ask the book for its prices over plain HTTP.
 *
 * @param {string} url the price endpoint (server-side configuration)
 * @returns {Promise<{payload: object|null, error: Error|null}>}
 */
async function fetchNairaBetPayload(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { ...WEB_CLIENT },
      signal: controller.signal,
      redirect: 'follow',
    });
    const text = await response.text();
    if (!response.ok) {
      return { payload: null, error: new Error(`NairaBet answered HTTP ${response.status}.`) };
    }
    try {
      const payload = JSON.parse(text);
      if (!payload || typeof payload !== 'object' || !Array.isArray(payload.events)) {
        return { payload: null, error: new Error('NairaBet answered with something that is not a price tree.') };
      }
      return { payload, error: null };
    } catch {
      return { payload: null, error: new Error('NairaBet answered with a page instead of prices.') };
    }
  } catch (error) {
    if (error?.name === 'AbortError') return { payload: null, error: new Error('NairaBet did not answer in time.') };
    return { payload: null, error };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch NairaBet's prices.
 *
 * @param {object} env    the Worker environment
 * @param {string} url    the price endpoint (server-side configuration)
 * @returns {Promise<{quotes: Array, error: Error|null, detail: string}>}
 */
export async function fetchNairaBetQuotes(env = {}, url = '') {
  if (!url) return { quotes: [], error: null, detail: 'no endpoint configured' };

  const fetchedAt = new Date().toISOString();
  const result = await fetchNairaBetPayload(url);
  if (!result.payload) {
    return { quotes: [], error: result.error, detail: result.error?.message || 'no prices' };
  }

  const quotes = flattenNairaBet(result.payload, { bookmaker: 'nairabet', now: fetchedAt });
  if (!quotes.length) {
    return { quotes: [], error: new Error('NairaBet answered, but the answer held no prices the scanner can use.'), detail: 'no usable prices' };
  }
  return { quotes, error: null, detail: `${quotes.length} quotes from NairaBet` };
}

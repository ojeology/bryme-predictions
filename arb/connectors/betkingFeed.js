/**
 * Reading BetKing's prices.
 *
 * BetKing's edge sends a bot check to plain server requests - the Worker gets
 * a "Just a moment" page instead of prices, on the book domain and on the
 * price service alike.  A real browser, opened on the book's own page, is
 * served normally, so the price request is made from inside that page: same
 * origin, no cross-origin question to answer, and the page's own session is
 * used.
 *
 * The page itself asks for two public price feeds - the day's popular
 * matches and the last-minute list - and both are read the same way the page
 * reads them.  Nothing is guessed and nothing is bypassed: the browser opens
 * the public page a visitor would open and asks the public price endpoints
 * the same questions the page asks.  No account is used, no check is solved,
 * no bet is placed.
 */
import puppeteer from '@cloudflare/puppeteer';
import { flattenBetking } from './betking.js';
import { browserLimitNote } from './browserSession.js';

const PAGE = 'https://www.betking.com/sports';
const PAGE_WAIT_MS = 12000;

/** Runs inside the page: ask the book for prices and hand back the answer. */
const ASK = `
  (async function (request) {
    try {
      const response = await fetch(request.url, {
        method: request.method || 'GET',
        headers: request.headers || { 'Accept': 'application/json' },
      });
      const text = await response.text();
      return { status: response.status, length: text.length, body: text.slice(0, 2000000) };
    } catch (error) {
      return { status: 0, length: 0, error: String((error && error.message) || error) };
    }
  })
`;

/** The endpoints may be given one per comma. */
function endpointList(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Fetch BetKing's prices through a real browser.
 *
 * @param {object} env    the Worker environment (needs the browser binding)
 * @param {string} url    the price endpoint(s), comma separated
 * @returns {Promise<{quotes: Array, error: Error|null, detail: string}>}
 */
export async function fetchBetkingQuotes(env = {}, url = '', options = {}) {
  const endpoints = endpointList(url);
  if (!endpoints.length) return { quotes: [], error: null, detail: 'no endpoint configured' };
  if (!env?.browser) {
    return { quotes: [], error: new Error('This deployment has no browser available.'), detail: 'no browser binding' };
  }

  // a browser opened by the scan is shared between the books that need one
  const shared = options.browser || null;
  const ownsBrowser = !shared;
  let browser = shared;
  try {
    if (!browser) browser = await puppeteer.launch(env.browser);
    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900 });
    await page.goto(PAGE, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, PAGE_WAIT_MS));

    await page.evaluate(`window.__betkingAsk = ${ASK}; true`).catch(() => {});

    const quotes = [];
    const failures = [];
    for (const endpoint of endpoints) {
      const answer = await page
        .evaluate(`window.__betkingAsk(${JSON.stringify({ url: endpoint, method: 'GET' })})`)
        .catch((error) => ({ status: 0, length: 0, error: String(error?.message || error) }));

      if (!answer || answer.status !== 200 || !answer.body) {
        failures.push(`${endpoint}: ${answer?.error || `HTTP ${answer?.status ?? 'nothing'}`}`);
        continue;
      }

      let payload;
      try {
        payload = JSON.parse(answer.body);
      } catch {
        failures.push(`${endpoint}: not JSON`);
        continue;
      }

      const found = flattenBetking(payload, { bookmaker: 'betking', url: endpoint });
      quotes.push(...found);
    }

    if (!quotes.length) {
      const why = failures.join('; ') || 'the book returned no prices';
      return { quotes: [], error: new Error(`BetKing did not return prices: ${why}.`), detail: why };
    }

    const fetchedAt = new Date().toISOString();
    const stamped = quotes.map((quote) => ({ ...quote, fetchedAt }));
    const detail = `${stamped.length} quotes from BetKing${failures.length ? ` (${failures.length} feed(s) failed)` : ''}`;
    return { quotes: stamped, error: null, detail };
  } catch (error) {
    return { quotes: [], error: new Error(browserLimitNote(error)), detail: error?.message || String(error) };
  } finally {
    if (ownsBrowser) {
      try { await browser?.close(); } catch { /* the session may already be gone */ }
    }
  }
}

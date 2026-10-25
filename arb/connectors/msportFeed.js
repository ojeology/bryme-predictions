/**
 * Reading MSport's prices.
 *
 * MSport's edge sends a bot check to plain server requests - the Worker gets
 * a challenge page instead of prices.  A real browser, opened on the book's
 * own page, is served normally, so the price request is made from inside that
 * page: same origin, no cross-origin question to answer, and the page's own
 * session is used.
 *
 * Nothing is guessed and nothing is bypassed: the browser opens the public
 * page a visitor would open, and asks the public price endpoint the same
 * question the page asks.
 */
import puppeteer from '@cloudflare/puppeteer';
import { flattenMsport } from './msport.js';

const PAGE = 'https://www.msport.com/ng/web/';

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

/** Runs inside the page: ask the book for prices and hand back the answer. */
const ASK = `
  (async function (request) {
    try {
      const response = await fetch(request.url, {
        method: request.method || 'POST',
        headers: request.headers || {},
        body: request.body === null ? undefined : request.body,
      });
      const text = await response.text();
      return { status: response.status, length: text.length, body: text.slice(0, 2000000) };
    } catch (error) {
      return { status: 0, length: 0, error: String((error && error.message) || error) };
    }
  })
`;

/**
 * Fetch MSport's prices through a real browser.
 *
 * @param {object} env    the Worker environment (needs the browser binding)
 * @param {string} url    the price endpoint (server-side configuration)
 * @returns {Promise<{quotes: Array, error: Error|null, detail: string}>}
 */
export async function fetchMsportQuotes(env = {}, url = '') {
  if (!url) return { quotes: [], error: null, detail: 'no endpoint configured' };
  if (!env?.browser) {
    return { quotes: [], error: new Error('This deployment has no browser available.'), detail: 'no browser binding' };
  }

  let browser = null;
  try {
    browser = await puppeteer.launch(env.browser);
    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900 });
    await page.goto(PAGE, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await page.evaluate(`window.__msportAsk = ${ASK}; true`).catch(() => {});
    const answer = await page.evaluate(`window.__msportAsk(${JSON.stringify({
      url,
      method: 'POST',
      headers: appHeaders(),
      body: '[]',
    })})`);

    if (!answer || answer.status !== 200 || !answer.body) {
      const why = answer?.error
        ? answer.error
        : `the book answered HTTP ${answer?.status ?? 'nothing'}`;
      return { quotes: [], error: new Error(`MSport did not return prices: ${why}.`), detail: why };
    }

    let payload;
    try {
      payload = JSON.parse(answer.body);
    } catch {
      return { quotes: [], error: new Error('MSport returned something that is not JSON (a challenge page?).'), detail: 'not json' };
    }

    const fetchedAt = new Date().toISOString();
    const quotes = flattenMsport(payload, { bookmaker: 'msport', url, now: fetchedAt })
      .map((quote) => ({ ...quote, fetchedAt }));
    return { quotes, error: null, detail: `${quotes.length} quotes from MSport` };
  } catch (error) {
    return { quotes: [], error, detail: error?.message || String(error) };
  } finally {
    try { await browser?.close(); } catch { /* the session may already be gone */ }
  }
}

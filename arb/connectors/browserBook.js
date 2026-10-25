/**
 * A book connector that drives a headless browser.
 *
 * WHEN YOU NEED THIS
 *   - the book renders prices into the page and exposes no plain JSON endpoint
 *   - the JSON endpoint needs a session cookie or a token minted by the page
 *   - the book blocks plain server requests but serves a real browser
 * WHEN YOU DO NOT
 *   - if the book has a JSON endpoint, use httpBook.js instead: it is 10x
 *     lighter, returns every market instead of the few on screen, and does
 *     not break every time the site redesigns its markup
 *
 * CONFIGURATION (server environment, never the browser)
 *   BROWSER_BOOK_URL        the page to open
 *   BROWSER_BOOK_ROWS       JSON describing how to read one price row, e.g.
 *       {"row":".market-row","event":".event","market":".market",
 *        "outcome":".sel","odds":".odds","time":".time"}
 *   BROWSER_BOOK_TIMEOUT_MS page wait, default 20000
 *   BROWSER_BOOK_COOKIE     optional cookie string for the session
 *
 * The extractor reads the configured selectors and emits the same flat quote
 * rows the JSON connector emits, so both paths feed the scanner unchanged.
 */
import { flattenBookPayload } from './normalize.js';

async function loadPlaywright() {
  // The specifier is held in a variable on purpose: a static import would be
  // resolved by the Cloudflare Worker bundler, which has no browser and no
  // node_modules, and the deploy would break over a connector that only
  // matters on a machine.  At runtime this throws inside the try and is
  // reported as "Playwright is not installed".
  const names = ['playwright', 'playwright-core'];
  for (const name of names) {
    try {
      return await import(/* @vite-ignore */ name);
    } catch {
      /* try the next one */
    }
  }
  throw new Error('Playwright is not installed (npm i -D playwright && npx playwright install chromium).');
}

export async function fetchBookWithBrowser(env = {}, definition = {}) {
  const url = env[`${definition.id.toUpperCase()}_BROWSER_URL`] || env.BROWSER_BOOK_URL;
  if (!url) return { quotes: [], error: null, detail: 'no browser page configured' };

  const selectors = env[`${definition.id.toUpperCase()}_BROWSER_ROWS`] || env.BROWSER_BOOK_ROWS;
  let config;
  try {
    config = JSON.parse(selectors);
  } catch {
    return { quotes: [], error: 'BROWSER_BOOK_ROWS is not valid JSON.', detail: 'bad row config' };
  }
  if (!config.row) {
    return { quotes: [], error: 'BROWSER_BOOK_ROWS needs a "row" selector.', detail: 'bad row config' };
  }

  let browser;
  try {
    const playwright = await loadPlaywright();
    browser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const context = await browser.newContext({
      locale: 'en-NG',
      timezoneId: 'Africa/Lagos',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
        + '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });
    if (env.BROWSER_BOOK_COOKIE) {
      const cookies = String(env.BROWSER_BOOK_COOKIE).split(';').map((part) => {
        const [name, ...rest] = part.trim().split('=');
        return { name: name.trim(), value: rest.join('='), domain: new URL(url).hostname, path: '/' };
      }).filter((c) => c.name);
      await context.addCookies(cookies);
    }
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Number(env.BROWSER_BOOK_TIMEOUT_MS || 20000) });
    await page.waitForSelector(config.row, { timeout: Number(env.BROWSER_BOOK_TIMEOUT_MS || 20000) }).catch(() => {});
    const rows = await page.$$eval(config.row, (nodes, cfg) => nodes.map((node) => {
      const read = (sel) => (sel ? (node.querySelector(sel)?.textContent || '').trim() : '');
      return {
        event: read(cfg.event),
        market: read(cfg.market),
        outcome: read(cfg.outcome),
        odds: read(cfg.odds),
        time: read(cfg.time),
        href: node.querySelector('a')?.href || '',
      };
    }), config);

    const fetchedAt = new Date().toISOString();
    const flat = rows
      .filter((r) => r.event && r.market && r.outcome && r.odds)
      .map((r) => ({
        event: r.event,
        market: r.market,
        outcome: r.outcome,
        odds: Number(String(r.odds).replace(/[^0-9.]/g, '')),
        startsAt: r.time || null,
        url: r.href || '',
      }))
      .filter((r) => Number.isFinite(r.odds) && r.odds > 1);

    const quotes = flattenBookPayload(flat, {
      bookmaker: definition.id,
      defaultRules: env[`${definition.id.toUpperCase()}_DEFAULT_RULES`] || env.BOOK_DEFAULT_RULES || 'unspecified',
      defaultFamily: env[`${definition.id.toUpperCase()}_DEFAULT_FAMILY`] || env.BOOK_DEFAULT_FAMILY || '',
      now: fetchedAt,
    }).map((q) => ({ ...q, fetchedAt }));

    return { quotes, error: null, detail: `${quotes.length} quotes read from ${definition.label} in the browser` };
  } catch (error) {
    return { quotes: [], error: error.message, detail: error.message };
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

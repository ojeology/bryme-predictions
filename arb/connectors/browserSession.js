/**
 * One browser for the whole scan.
 *
 * Cloudflare's free plan allows ten minutes of browser time a day and one
 * new browser instance every twenty seconds, so a scan that opens a browser
 * per book runs out of budget almost at once.  One browser is opened, each
 * book gets its own tab in it, and the browser is closed as soon as the
 * scan is done.
 */
import puppeteer from '@cloudflare/puppeteer';

/** A plain-English note when the browser budget or the cooldown bites. */
export function browserLimitNote(error) {
  const message = String(error?.message || error || '');
  if (/429/.test(message) && /today/i.test(message)) {
    return 'This deployment has used its browser time for today (the free plan allows ten minutes a day). The books that need a browser will come back after midnight UTC; the books read over plain HTTP keep working.';
  }
  if (/429/.test(message)) {
    return 'Cloudflare allows one new browser every twenty seconds. Give it a minute and press RUN again.';
  }
  return message;
}

/**
 * Open one browser for every book that needs one.
 *
 * @param {object} env the Worker environment (needs the browser binding)
 * @returns {Promise<{browser: object|null, error: Error|null}>}
 */
export async function openSharedBrowser(env = {}) {
  if (!env?.browser) {
    return { browser: null, error: new Error('This deployment has no browser available.') };
  }

  // The free plan allows one new browser every twenty seconds, so a request
  // that lands in the cooling-off window waits it out instead of failing.
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const browser = await puppeteer.launch(env.browser);
      return { browser, error: null };
    } catch (error) {
      lastError = error;
      const message = String(error?.message || error);
      if (!/429/.test(message) || /today/i.test(message)) break;
      await new Promise((resolve) => setTimeout(resolve, 21000));
    }
  }
  return { browser: null, error: new Error(browserLimitNote(lastError)) };
}

/** Close a shared browser, ignoring the fact that it may already be gone. */
export async function closeSharedBrowser(browser) {
  try { await browser?.close(); } catch { /* the session may already be gone */ }
}

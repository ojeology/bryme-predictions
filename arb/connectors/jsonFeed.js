import { feedHeaders } from './feedHeaders.js';

// A book's own price tree can be several megabytes; the limit keeps a
// runaway response from taking the Worker down, nothing more.
const MAX_FEED_BYTES = Number(process?.env?.ARB_MAX_FEED_BYTES || 12_000_000);

/**
 * Fetch an operator-configured JSON quote feed. The URL comes only from server
 * environment variables, never from a browser parameter.
 */
export async function fetchJsonFeed(url, options = {}) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Feed URL is invalid.');
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Feed URL must use HTTP or HTTPS.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 8000);
  try {
    const response = await fetch(parsed, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BrymeArbScanner/1.0 (+https://predictions.thebryme.com)',
        ...feedHeaders(url),
        ...(options.headers || {}),
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}.`);
    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength > MAX_FEED_BYTES) throw new Error('Feed is larger than the 12 MB safety limit.');
    const text = await response.text();
    if (text.length > MAX_FEED_BYTES) throw new Error('Feed is larger than the 12 MB safety limit.');
    let payload;
    try { payload = JSON.parse(text); } catch { throw new Error('Feed did not return valid JSON.'); }
    // The feed may be a plain list of quotes, or the book's own price tree.
    // The normaliser knows how to read both.
    return payload;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Feed timed out after 8 seconds.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

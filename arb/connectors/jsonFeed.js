const MAX_FEED_BYTES = 2_000_000;

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
        ...(options.headers || {}),
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}.`);
    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength > MAX_FEED_BYTES) throw new Error('Feed exceeds the 2 MB safety limit.');
    const text = await response.text();
    if (text.length > MAX_FEED_BYTES) throw new Error('Feed exceeds the 2 MB safety limit.');
    let payload;
    try { payload = JSON.parse(text); } catch { throw new Error('Feed did not return valid JSON.'); }
    const quotes = Array.isArray(payload) ? payload : payload.quotes || payload.data;
    if (!Array.isArray(quotes)) throw new Error('Feed JSON must be an array or contain a quotes array.');
    if (quotes.length > 5000) throw new Error('Feed exceeds the 5,000-quote safety limit.');
    return quotes;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Feed timed out after 8 seconds.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

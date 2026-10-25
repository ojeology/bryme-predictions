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
import { feedHeaders } from './connectors/feedHeaders.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export const BOOK_PAGES = {
  sportybet: 'https://www.sportybet.com/ng/',
  nairabet: 'https://nairabet.com/sports',
  '22bet': 'https://22bet.ng/en/',
  '1xbet': 'https://1xbet.ng/en/',
  livescorebet: 'https://livescorebet.com/ng/',
};

/**
 * Addresses these books publish their prices on.
 *
 * The hosts below were found by resolving the books' own domains (DNS is not
 * geo-restricted), and the paths are the ones their platforms are known to
 * use. Every one of them is PROVEN before it is accepted.
 */
const LINEFEED_QUERY = 'mode=4&count=200&lng=en&country=566&getEmpty=true';

/**
 * 1xBet-group books (1xBet, 22Bet and their white labels) serve their prices
 * from their own domain. These paths were PROVEN to exist by the router
 * itself: the ones it does not know answer "No route found", the ones it knows
 * answer with something else.
 */
const GROUP_PATHS = [
  '/service-api/linefeed/getPreMatchLineFeed',
  '/service-api/linefeed/getLineFeed',
  '/linefeed/getPreMatchLineFeed',
  '/linefeed/getLineFeed',
  '/service-api/linefeed/getLiveLineFeed',
  '/api/v1/linefeed/getPreMatchLineFeed',
  '/service-api/sports/getSports',
  '/service-api/gamespreview/GetGamesPreviewLight',
];

/** Books that run their own platform publish plain REST endpoints. */
const GENERIC_PATHS = [
  '/api/v1/odds',
  '/api/v1/markets',
  '/api/v1/events',
  '/api/v1/sports',
  '/v1/odds',
  '/v1/markets',
  '/v1/events',
  '/v1/sports',
];

/**
 * Two hosts per book, eight paths each - sixteen candidates, split into two
 * rounds so that no single request asks for more connections than the
 * platform allows at once.
 */
export const KNOWN_FEEDS = {
  '1xbet': [
    ...GROUP_PATHS.map((path) => `https://1xbet.ng${path}?${LINEFEED_QUERY}`),
    ...GROUP_PATHS.map((path) => `https://api.1xbet.ng${path}?${LINEFEED_QUERY}`),
  ],
  '22bet': [
    ...GROUP_PATHS.map((path) => `https://22bet.ng${path}?${LINEFEED_QUERY}`),
    ...GROUP_PATHS.map((path) => `https://api.22bet.ng${path}?${LINEFEED_QUERY}`),
  ],
  nairabet: [
    // NairaBet runs on the Alteran platform; its addresses only resolve
    // inside Nigeria, so these are tried from the phone's own network
    'https://sb2frontend-alternar2.biahosted.com/api/sports',
    'https://sb2frontend-alternar2.biahosted.com/api/events',
    'https://sb2commongateway-alternar2.biahosted.com/api/sports',
    'https://sb2commongateway-alternar2.biahosted.com/api/events',
    'https://ps.tabet-live.io/sports',
    'https://nairabet.nairabet.twoup.io/beapi/sports',
    ...GROUP_PATHS.slice(0, 4).map((path) => `https://nairabet.com${path}?${LINEFEED_QUERY}`),
    ...GROUP_PATHS.slice(0, 4).map((path) => `https://api.nairabet.com${path}?${LINEFEED_QUERY}`),
  ],
  livescorebet: [
    // PROVEN: the book publishes its own tree through its gateway
    'https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/events/matches?sportcategoryid=SBTC1_1&categoryid=SBTC1_1',
    'https://gateway-ng.livescorebet.com/sportsbook/gateway/v2/view/coupon?id=3103&sportcategoryid=SBTC1_1',
    'https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/sport/groupedleagues?sportcategoryid=SBTC1_1',
    'https://gateway-ng.livescorebet.com/sportsbook/gateway/v1/view/sport/leagues?sportcategoryid=SBTC1_1',
    'https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/az/sports?sportcategoryid=SBTC1_1',
    'https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/events/matches?sportcategoryid=SBTC1_1&categoryid=SBTC3_9916',
    'https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/configs',
    // and the older hosts
    ...GENERIC_PATHS.map((path) => `https://api.livescorebet.net${path}?${LINEFEED_QUERY}`),
  ],
  sportybet: [
    // PROVEN: the book publishes its own price tree under /api/ng/factsCenter
    'https://www.sportybet.com/api/ng/factsCenter/importantEvents?sportId=sr:sport:1',
    'https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1',
    'https://www.sportybet.com/api/ng/factsCenter/pcUpcomingEvents?sportId=sr:sport:1',
    'https://www.sportybet.com/api/ng/factsCenter/commonThumbnailEvents?sportId=sr:sport:1',
    'https://www.sportybet.com/api/ng/factsCenter/sportList',
    'https://www.sportybet.com/api/ng/factsCenter/marketGroups?sportId=sr:sport:1',
    'https://www.sportybet.com/api/ng/factsCenter/popularAndSportList',
    'https://www.sportybet.com/api/ng/factsCenter/orderedSportList',
    // the same service behind the other name
    'https://sports.sportybet.com/api/ng/factsCenter/importantEvents?sportId=sr:sport:1',
    'https://sports.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1',
    'https://sports.sportybet.com/api/ng/factsCenter/pcUpcomingEvents?sportId=sr:sport:1',
    'https://sports.sportybet.com/api/ng/factsCenter/commonThumbnailEvents?sportId=sr:sport:1',
    'https://sports.sportybet.com/api/ng/factsCenter/sportList',
    'https://sports.sportybet.com/api/ng/factsCenter/marketGroups?sportId=sr:sport:1',
    'https://sports.sportybet.com/api/ng/factsCenter/popularAndSportList',
    'https://sports.sportybet.com/api/ng/factsCenter/orderedSportList',
  ],
};

/** Which half of the candidates a round is allowed to try. */
export function candidatesForRound(bookmaker, round = 1) {
  const all = KNOWN_FEEDS[bookmaker] || [];
  const half = Math.ceil(all.length / 2);
  return round === 2 ? all.slice(half) : all.slice(0, half);
}

/**
 * Spring Boot applications publish their own map of every endpoint. When one
 * of these answers, the exact path for the prices is inside it - no guessing.
 */
export const API_DOC_PATHS = ['/v3/api-docs', '/ng/v3/api-docs'];

/**
 * Cloudflare allows only a limited number of open subrequests at once, so
 * candidates are probed in small batches rather than all at the same time.
 */
export async function runLimited(items, limit, worker) {
  const results = [];
  for (let index = 0; index < items.length; index += limit) {
    const batch = items.slice(index, index + limit);
    const settled = await Promise.all(batch.map((item) => worker(item).catch((error) => ({ ok: false, url: item, reason: error?.message || 'failed' }))));
    results.push(...settled);
  }
  return results;
}

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
  const result = await fetchText(url, { timeoutMs, maxBytes: 12_000_000, extraHeaders: feedHeaders(url) });
  if (!result.ok) {
    return {
      ok: false,
      url,
      status: result.status,
      reason: result.blocked ? `blocked (HTTP ${result.status})` : (result.error || `HTTP ${result.status}`),
      sample: result.text.slice(0, 300),
    };
  }
  if (result.tooBig) return { ok: false, url, status: result.status, reason: 'response too large' };
  let payload;
  try {
    payload = JSON.parse(result.text);
  } catch {
    return { ok: false, url, status: result.status, reason: 'not JSON', sample: result.text.slice(0, 300) };
  }
  const keys = payload && typeof payload === 'object' && !Array.isArray(payload) ? Object.keys(payload).slice(0, 12) : [];
  const quotes = flattenBookPayload(payload, { bookmaker, defaultRules: 'unspecified', now: new Date() });
  if (!quotes.length) {
    return { ok: false, url, status: result.status, reason: 'JSON, but no prices in it', keys, sample: result.text.slice(0, 300) };
  }
  return { ok: true, url, status: result.status, quoteCount: quotes.length, quotes, keys, sample: quotes[0] };
}

/**
 * The scripts a page loads, and any API-looking path inside them.
 *
 * `scriptBodies` may be plain strings or {url, text} pairs - the pair form
 * lets chunk references be resolved against the script they were found in.
 */
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

  const chunks = new Set();
  const bodies = [{ url: baseUrl, text: html }, ...scriptBodies];
  for (const body of bodies) {
    const text = String(body?.text ?? body ?? '').slice(0, 1_200_000);
    const origin = body?.url || baseUrl;
    for (const match of text.matchAll(/https?:\\?\/\\?\/[a-z0-9.-]{3,60}\.[a-z]{2,12}(?:\\?\/[a-z0-9_\-./?=&%]{2,120})?/gi)) {
      add(match[0].replace(/\\/g, ''));
    }
    // paths with a leading slash
    for (const match of text.matchAll(/["'](\/[a-z0-9_\-.\/?=&%:#{}~]{3,160})["']/gi)) {
      add(match[1]);
    }
    // paths without one, e.g. "linefeed/getLineFeed"
    for (const match of text.matchAll(/["']([a-z0-9][a-z0-9_\-.]*(?:\/[a-z0-9_\-.]{2,60}){1,4})["']/gi)) {
      add(match[1]);
    }
    // chunk references: the app splits itself into hashed files
    for (const match of text.matchAll(/["'](\.\.\/[A-Za-z0-9_\-.\/]+\.js|\.\/[0-9a-f]{6,16}\.js)["']/gi)) {
      try { chunks.add(new URL(match[1], origin).toString()); } catch { /* not a url */ }
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
  return { scriptUrls, candidates: [...new Set(resolved)].slice(0, 18), chunks: [...chunks].slice(0, 16) };
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
  await runLimited(first.scriptUrls.slice(0, 3), 3, async (scriptUrl) => {
    const script = await fetchText(scriptUrl, { timeoutMs: 7000, maxBytes: 2_500_000 });
    if (script.ok && !script.blocked && script.text) bodies.push({ url: scriptUrl, text: script.text });
  });
  // the app is split into hashed chunks; the addresses live in those
  const chunkUrls = [...new Set(bodies.flatMap((body) => extractApiPaths('', body.url, [body]).chunks))].slice(0, 3);
  await runLimited(chunkUrls, 3, async (chunkUrl) => {
    const chunk = await fetchText(chunkUrl, { timeoutMs: 7000, maxBytes: 2_500_000 });
    if (chunk.ok && !chunk.blocked && chunk.text) bodies.push({ url: chunkUrl, text: chunk.text });
  });
  const second = extractApiPaths('', page, bodies);
  const candidates = [...new Set([...first.candidates, ...second.candidates])].slice(0, 18);
  return {
    candidates,
    scriptUrls: first.scriptUrls,
    chunkUrls,
    note: `page loaded, ${first.scriptUrls.length} scripts and ${chunkUrls.length} chunks read`,
  };
}

/**
 * If the book runs a Spring Boot (or similar) API, it publishes the whole map
 * of its endpoints. When that answers, the real path for the prices is inside
 * it - so the search stops guessing.
 */
export async function readApiMap(host, { timeoutMs = 8000 } = {}) {
  for (const docPath of API_DOC_PATHS) {
    const url = `https://${host}${docPath}`;
    const result = await fetchText(url, { timeoutMs, maxBytes: 3_000_000 });
    if (!result.ok || result.blocked) continue;
    let payload;
    try { payload = JSON.parse(result.text); } catch { continue; }
    const paths = Object.keys(payload?.paths || {});
    if (!paths.length) continue;
    const interesting = paths.filter((path) => /odd|market|event|sport|match|fixture|price|line|selection|coupon/i.test(path));
    return { host, docPath, total: paths.length, paths: (interesting.length ? interesting : paths).slice(0, 20) };
  }
  return null;
}

/**
 * Discover one book's working feed.
 *
 * `round` 1 tries the first half of the known addresses and asks the book for
 * its own API map. `round` 2 tries the second half and reads the book's own
 * scripts. Splitting the work keeps every request inside the number of
 * connections the platform allows at once.
 */
export async function discoverBook(bookmaker, { timeoutMs = 9000, crawl = true, round = 1 } = {}) {
  const known = candidatesForRound(bookmaker, round);
  const attempts = [];

  const knownResults = await runLimited(known, 4, async (url) => {
    const result = await proveFeed(url, bookmaker, { timeoutMs });
    attempts.push({ url, ...result });
    return result;
  });
  const winner = knownResults.find((result) => result.ok);
  if (winner) {
    return { id: bookmaker, status: 'found', url: winner.url, quoteCount: winner.quoteCount, attempts, round };
  }

  if (crawl) {
    try {
      if (round === 1) {
        // 1. the book's own API map, if it publishes one
        const apiHosts = [...new Set(known.map((url) => {
          try { return new URL(url).host; } catch { return null; }
        }).filter(Boolean))].slice(0, 1);
        const maps = await runLimited(apiHosts, 1, (host) => readApiMap(host, { timeoutMs: 7000 }).catch(() => null));
        const apiMap = maps.find(Boolean);
        if (apiMap) {
          const mapProbes = await runLimited(apiMap.paths.slice(0, 5), 3, async (path) => {
            const url = `https://${apiMap.host}${path}`;
            const result = await proveFeed(url, bookmaker, { timeoutMs: 7000 });
            attempts.push({ url, ...result });
            return result;
          });
          const found = mapProbes.find((result) => result.ok);
          if (found) {
            return {
              id: bookmaker, status: 'found', url: found.url, quoteCount: found.quoteCount, attempts,
              note: `the book's own API map listed ${apiMap.total} endpoints`,
              evidence: { apiMap: apiMap.docPath, apiPaths: apiMap.paths.slice(0, 10) },
              round,
            };
          }
        }
      }

      // 2. the book's own page and scripts
      const crawlResult = await crawlBook(bookmaker, { timeoutMs });
      const probed = await runLimited(crawlResult.candidates.slice(0, 6), 4, async (url) => {
        const result = await proveFeed(url, bookmaker, { timeoutMs: 7000 });
        attempts.push({ url, ...result });
        return result;
      });
      const found = probed.find((result) => result.ok);
      const evidence = {
        page: BOOK_PAGES[bookmaker],
        scripts: crawlResult.scriptUrls || [],
        chunks: (crawlResult.chunkUrls || []).slice(0, 10),
        candidatesTried: crawlResult.candidates.length,
      };
      if (found) {
        return { id: bookmaker, status: 'found', url: found.url, quoteCount: found.quoteCount, attempts, note: crawlResult.note, evidence, round };
      }
      return { id: bookmaker, status: 'none', url: '', quoteCount: 0, attempts, note: crawlResult.note, evidence, round };
    } catch (error) {
      // the crawl ran out of connections - keep what the earlier phases found
      const found = attempts.find((attempt) => attempt.ok);
      if (found) {
        return { id: bookmaker, status: 'found', url: found.url, quoteCount: found.quoteCount, attempts, note: 'found before the crawl ran out of connections', round };
      }
      return {
        id: bookmaker,
        status: 'none',
        url: '',
        quoteCount: 0,
        attempts,
        note: `the crawl ran out of connections (${error?.message || 'limit'})`,
        round,
      };
    }
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
    round,
  };
}

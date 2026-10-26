/**
 * The free reader.
 *
 * Two of the books answer only a client that looks like an ordinary browser
 * on an ordinary connection: our own server is refused, because the edge in
 * front of the book knows exactly what it is.  This script runs on GitHub's
 * free runners - ordinary machines on ordinary networks - and reads the same
 * public price pages a visitor reads.  The prices are written to a branch of
 * this repository and the Worker picks them up from there, so the phone's
 * RUN button finds all the books without spending a minute of browser time.
 *
 * The prices are put through the same adapter the Worker uses, so what is
 * published is already in comparable form: one file per book, one list of
 * prices, and the time the prices were really read.
 *
 * No account is used, no check is solved, no bet is placed.  Every request
 * here is the same public request the book's own web app makes.
 *
 *   node scripts/arb-read.mjs          -> out/<book>.json + out/latest.json
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { flattenMsport } from '../arb/connectors/msport.js';
import { flattenBetking } from '../arb/connectors/betking.js';
import { flattenSportyBet } from '../arb/connectors/sportybet.js';
import { fetchLiveScoreBetQuotes } from '../arb/connectors/livescorebetFeed.js';
import { flattenNairaBet } from '../arb/connectors/nairabet.js';
import { clusterFixtures } from '../src/lib/arbitrage.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MSPORT_URL = (process.env.MSPORT_FEED_URL
  || 'https://www.msport.com/api/ng/facts-center/query/frontend/sports-matches-list?sportId=sr:sport:1&timeslot=Today').trim();

const BETKING_URLS = (process.env.BETKING_FEED_URL
  || 'https://sportsapicdn-desktop.betking.com/api/feeds/prematch/mostpopularsports/en/1/7/3/,https://sportsapicdn-desktop.betking.com/api/feeds/prematch/lastminute/en/1/15/')
  .split(',').map((entry) => entry.trim()).filter(Boolean);

const LSB_URL = (process.env.LSCB_FEED_URL
  || 'https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/events/matches?sportcategoryid=SBTC1_1&categoryid=SBTC1_1').trim();

const NAIRABET_URL = (process.env.NAIRABET_FEED_URL
  || 'https://sb2frontend-altenar2.biahosted.com/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=nairabet&deviceType=desktop&sportId=66').trim();

const SPORTYBET_ORIGIN = 'https://www.sportybet.com';
const SPORTYBET_PAGE = `${SPORTYBET_ORIGIN}/ng/`;

/** How many SportyBet tournaments to read (the busiest ones first). */
const SPORTYBET_TOURNAMENT_LIMIT = Number(process.env.SPORTYBET_TOURNAMENTS || 140);

/** The price calls the book's own page makes, one per tournament. */
const SPORTYBET_TEMPLATES = [
  '/api/ng/factsCenter/sportList?timeline=24&productId=1&option=1',
  '/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1',
  '/api/ng/factsCenter/wapEvents?sportId=sr:sport:1&tournamentId={id}',
  '/api/ng/factsCenter/wapConfigurableEventsByOrder?sportId=sr:sport:1&tournamentId={id}',
  '/api/ng/factsCenter/wapConfigurableUpcomingEvents?sportId=sr:sport:1&tournamentId={id}',
  '/api/ng/factsCenter/v2/wapConfigurableNewHighlightEvents?sportId=sr:sport:1&tournamentId={id}',
  '/api/ng/factsCenter/pcEvents?sportId=sr:sport:1&tournamentId={id}',
  '/api/ng/factsCenter/wapEventsByOrder?sportId=sr:sport:1&tournamentId={id}',
  '/api/ng/factsCenter/importantEvents?sportId=sr:sport:1&tournamentId={id}',
];

const notes = [];
function note(book, message) {
  const line = `[${book}] ${message}`;
  notes.push({ book, message, at: new Date().toISOString() });
  console.log(line);
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ *
 * MSport - a plain public POST.  No browser needed.
 * ------------------------------------------------------------------ */
function msportHeaders() {
  return {
    'User-Agent': UA,
    'Accept-Language': 'en-NG,en;q=0.9',
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

async function readMsport() {
  try {
    const response = await fetch(MSPORT_URL, {
      method: 'POST',
      headers: msportHeaders(),
      body: '[]',
      redirect: 'follow',
    });
    const text = await response.text();
    if (!response.ok) {
      note('msport', `HTTP ${response.status} (${text.length} bytes)`);
      return [];
    }
    const payload = JSON.parse(text);
    if (!payload?.data) {
      note('msport', 'answered, but not with a price tree');
      return [];
    }
    const quotes = flattenMsport(payload, { bookmaker: 'msport', url: MSPORT_URL });
    note('msport', `HTTP ${response.status}, ${text.length} bytes -> ${quotes.length} prices`);
    return quotes;
  } catch (error) {
    note('msport', `failed: ${error?.message || error}`);
    return [];
  }
}

/* ------------------------------------------------------------------ *
 * LiveScore Bet - a plain gateway.  It is read here rather than in the
 * Worker, because the Worker's memory is small and this book's whole
 * football slate is a big answer.
 * ------------------------------------------------------------------ */
async function readLiveScoreBet() {
  try {
    const result = await fetchLiveScoreBetQuotes(LSB_URL, {
      maxCompetitions: Number(process.env.LSB_MAX_COMPETITIONS || 48),
      timeoutMs: 20000,
    });
    if (result.error) {
      note('livescorebet', `failed: ${result.error.message}`);
      return [];
    }
    const quotes = result.quotes.map((quote) => ({ ...quote, bookmaker: 'livescorebet' }));
    note('livescorebet', `${result.competitions} competitions -> ${quotes.length} prices`);
    return quotes;
  } catch (error) {
    note('livescorebet', `failed: ${error?.message || error}`);
    return [];
  }
}

/**
 * NairaBet's prices.  The book runs on the Altenar/SB widget platform, and
 * that platform answers a public JSON endpoint with the whole price tree -
 * no browser, no account, no cookie.
 */
async function readNairaBet() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(NAIRABET_URL, {
      method: 'GET',
      headers: {
        'User-Agent': UA,
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-GB,en;q=0.9',
        Referer: 'https://nairabet.com/',
        Origin: 'https://nairabet.com',
      },
      signal: controller.signal,
    });
    const text = await response.text();
    clearTimeout(timer);
    if (!response.ok) {
      note('nairabet', `failed: HTTP ${response.status}`);
      return [];
    }
    let payload;
    try { payload = JSON.parse(text); } catch {
      note('nairabet', 'failed: the answer was not a price tree');
      return [];
    }
    const quotes = flattenNairaBet(payload, { bookmaker: 'nairabet', now: new Date().toISOString() });
    const fixtures = new Set(quotes.map((quote) => quote.event)).size;
    note('nairabet', `${quotes.length} prices over ${fixtures} matches`);
    return quotes;
  } catch (error) {
    if (error?.name === 'AbortError') note('nairabet', 'failed: the book did not answer in time');
    else note('nairabet', `failed: ${error?.message || error}`);
    return [];
  }
}

/* ------------------------------------------------------------------ *
 * The browser.  GitHub's runners already carry Chrome, so no browser
 * is downloaded - the run starts in seconds.
 * ------------------------------------------------------------------ */
const CHROME_PATHS = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/opt/google/chrome/chrome',
];

function findChrome() {
  const found = CHROME_PATHS.find((path) => existsSync(path));
  if (!found) throw new Error('No Chrome on this machine.');
  return found;
}

async function openBrowser() {
  const puppeteer = (await import('puppeteer-core')).default;
  return puppeteer.launch({
    executablePath: findChrome(),
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      // an ordinary browser, not an obvious machine
      '--disable-blink-features=AutomationControlled',
      '--lang=en-NG',
    ],
  });
}

/** A page that reads like a visitor's, not like an automation tool. */
async function dressAsVisitor(page) {
  await page.setUserAgent(UA);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-NG,en;q=0.9' });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  }).catch(() => {});
}

/**
 * Wait until the page has really arrived - a bot check shows a "Just a
 * moment" page, and a question asked from that page cannot be answered.
 */
async function waitForRealPage(page, { timeoutMs = 30000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    const state = await page.evaluate(`(() => ({
      title: document.title || '',
      href: location.href,
    }))()`).catch(() => null);
    if (state) {
      last = `${state.title} | ${state.href}`;
      if (!/just a moment|attention required|checking your browser|one more step/i.test(state.title)
        && !/\/cdn-cgi\/challenge/.test(state.href)) {
        return { ok: true, state };
      }
    }
    await sleep(1500);
  }
  return { ok: false, state: { title: last } };
}

/** Runs inside the page: ask the book for prices and hand back the answer. */
const ASK = `
  (async function (request) {
    try {
      const response = await fetch(request.url, {
        method: request.method || 'GET',
        headers: request.headers || { 'Accept': 'application/json' },
        body: request.body === undefined ? undefined : request.body,
        credentials: 'include',
      });
      const text = await response.text();
      return { status: response.status, length: text.length, body: text.slice(0, 4000000) };
    } catch (error) {
      return { status: 0, length: 0, error: String((error && error.message) || error) };
    }
  })
`;

async function askInPage(page, request) {
  await page.evaluate(`window.__ask = ${ASK}; true`).catch(() => {});
  const answer = await page
    .evaluate(`window.__ask(${JSON.stringify(request)})`)
    .catch((error) => ({ status: 0, length: 0, error: String(error?.message || error) }));
  return answer;
}

/* ------------------------------------------------------------------ *
 * BetKing - the page asks two public price feeds.
 * ------------------------------------------------------------------ */
async function readBetking(browser) {
  const quotes = [];
  const captured = [];
  let page = null;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900 });
    await dressAsVisitor(page);

    // the page asks for the prices itself: whatever it asks for is what we
    // read, so nothing has to be guessed
    page.on('response', async (response) => {
      const url = response.url();
      if (!/sportsapicdn|betking\.com\/api/i.test(url)) return;
      if (!/feed|prematch|odds|event/i.test(url)) return;
      try {
        const text = await response.text();
        if (!text || text.length < 200) return;
        captured.push({ url, body: text });
      } catch { /* the body may already be gone */ }
    });

    await page.goto('https://www.betking.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    const arrived = await waitForRealPage(page, { timeoutMs: 30000 });
    note('betking', `page: ${arrived.ok ? 'arrived' : 'still checking'} (${arrived.state?.title || '?'})`);
    await sleep(12000);

    for (const item of captured) {
      try {
        const payload = JSON.parse(item.body);
        quotes.push(...flattenBetking(payload, { bookmaker: 'betking', url: item.url }));
        note('betking', `the page's own call ${item.url.slice(0, 90)} -> ${item.body.length} bytes`);
      } catch { /* not JSON */ }
    }

    // if the page asked for nothing, the public price feeds are visited
    // directly, the way a browser would open them
    if (!quotes.length) {
      for (const url of BETKING_URLS) {
        const answer = await askInPage(page, { url, method: 'GET' });
        if (answer?.status === 200 && answer.body) {
          try {
            quotes.push(...flattenBetking(JSON.parse(answer.body), { bookmaker: 'betking', url }));
            note('betking', `${url} -> ${answer.length} bytes`);
          } catch { /* not JSON */ }
        } else {
          note('betking', `${url} -> ${answer?.error || `HTTP ${answer?.status ?? 'nothing'}`}`);
        }
      }
    }
    if (!quotes.length) {
      for (const url of BETKING_URLS) {
        const tab = await browser.newPage();
        await dressAsVisitor(tab);
        await tab.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
        await sleep(6000);
        const body = await tab.evaluate(`document.body ? document.body.innerText : ''`).catch(() => '');
        try {
          quotes.push(...flattenBetking(JSON.parse(body), { bookmaker: 'betking', url }));
          note('betking', `visited ${url} -> ${body.length} bytes`);
        } catch {
          note('betking', `visited ${url} -> not JSON (${String(body).slice(0, 60)})`);
        }
        try { await tab.close(); } catch { /* the tab may already be gone */ }
      }
    }
  } catch (error) {
    note('betking', `failed: ${error?.message || error}`);
  } finally {
    try { await page?.close(); } catch { /* the tab may already be gone */ }
  }
  return quotes;
}

/* ------------------------------------------------------------------ *
 * SportyBet - the whole slate, not the fourteen games the small public
 * feed lists.
 *
 * The site asks its own price service for the events of each tournament.
 * The first run records every call the page makes, so the exact call the
 * book uses is used here as well - nothing is guessed.
 * ------------------------------------------------------------------ */
async function readSportyBet(browser) {
  const quotes = [];
  const seen = [];
  const captured = [];
  let page = null;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900 });
    await dressAsVisitor(page);
    page.on('response', async (response) => {
      const url = response.url();
      if (!/sportybet\.com\/api\//i.test(url)) return;
      const request = response.request();
      const call = { url, method: request?.method() || 'GET', body: request?.postData() || null, status: response.status() };
      seen.push(call);
      if (!/factsCenter/i.test(url)) return;
      try {
        const text = await response.text();
        if (text && text.length > 500) captured.push({ ...call, body: text });
      } catch { /* the body may already be gone */ }
    });

    await page.goto(SPORTYBET_PAGE, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    const arrived = await waitForRealPage(page, { timeoutMs: 30000 });
    note('sportybet', `page: ${arrived.ok ? 'arrived' : 'still checking'} (${arrived.state?.title || '?'})`);
    await sleep(6000);

    // the device id the site's own app asks for
    const device = await askInPage(page, { url: `${SPORTYBET_ORIGIN}/api/ng/patron/deviceId`, method: 'POST' });
    note('sportybet', `device id -> HTTP ${device?.status ?? 'nothing'}${device?.length ? `, ${device.length} bytes` : ''}`);

    // whatever the page fetched for itself is the book's own answer
    for (const item of captured) {
      try {
        const payload = JSON.parse(item.body);
        const found = flattenSportyBet(payload, { bookmaker: 'sportybet' });
        if (found.length) {
          quotes.push(...found);
          note('sportybet', `the page's own call ${item.url.slice(0, 90)} -> ${found.length} prices`);
        }
      } catch { /* not a price tree */ }
    }
    if (quotes.length) note('sportybet', `the page's own calls: ${quotes.length} prices`);

    // The full slate: the site asks its price service for the events of each
    // tournament, so one tournament is opened and the call it makes is
    // watched.  The call the book itself uses is the one that is used here.
    const list = await askInPage(page, {
      url: `${SPORTYBET_ORIGIN}/api/ng/factsCenter/sportList?timeline=24&productId=1&option=1`,
      method: 'GET',
    });
    let listPayload = null;
    if (list?.status === 200 && list.body) {
      try { listPayload = JSON.parse(list.body); } catch { /* not JSON */ }
    }
    const tournaments = [];
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) { for (const item of node) walk(item); return; }
      const id = node.id || node.tournamentId || node.srTournamentId;
      const name = node.name || node.tournamentName || node.desc;
      if (typeof id === 'string' && /^sr:tournament:/.test(id) && name) {
        tournaments.push({ id, name, events: node.eventSize || node.eventCount || 0 });
      }
      for (const value of Object.values(node)) {
        if (value && typeof value === 'object') walk(value);
      }
    };
    walk(listPayload);
    note('sportybet', `the tournament list: ${tournaments.length} tournaments`);
    if (!tournaments.length) {
      note('sportybet', `calls the page made: ${seen.length}`);
      for (const call of seen.slice(0, 40)) note('sportybet', `  page call ${call.method} ${call.url} -> ${call.status}`);
      return quotes;
    }

    // open the first tournament and watch what the page asks for
    const wanted = tournaments.find((t) => t.events) || tournaments[0];
    const before = seen.length;
    await page.evaluate(`(() => {
      const wanted = ${JSON.stringify(wanted.name)};
      const nodes = [...document.querySelectorAll('div,span,a,li')].filter(
        (node) => node.children.length === 0 && (node.textContent || '').trim() === wanted,
      );
      if (nodes[0]) { nodes[0].click(); return true; }
      return false;
    })()`).catch(() => false);
    await sleep(9000);
    const after = seen.slice(before);
    note('sportybet', `opening "${wanted.name}" made ${after.length} calls`);
    for (const call of after) note('sportybet', `  call ${call.method} ${call.url} -> ${call.status}${call.body ? ` body ${String(call.body).slice(0, 120)}` : ''}`);

    // the call that carries prices, and the way the tournament is named in it
    let template = null;
    for (const call of after) {
      if (!/factsCenter/i.test(call.url)) continue;
      if (!/event|odds|match|price/i.test(call.url + ' ' + String(call.body || ''))) continue;
      template = call;
      break;
    }
    if (!template) {
      for (const call of after) {
        if (/factsCenter/i.test(call.url)) { template = call; break; }
      }
    }
    if (!template) {
      note('sportybet', 'no price call was seen; the page calls were:');
      for (const call of seen.slice(0, 40)) note('sportybet', `  page call ${call.method} ${call.url} -> ${call.status}`);
      return quotes;
    }

    // turn the call into a template: the tournament's own id in the
    // address becomes the place holder
    const idInUrl = template.url.includes(wanted.id);
    note('sportybet', `the price call is ${template.method} ${template.url}${idInUrl ? ' (the tournament is in the address)' : ' (the tournament is in the body)'}`);

    const buildCall = (tournament) => {
      if (idInUrl) {
        return {
          url: template.url.replace(wanted.id, tournament.id),
          method: template.method,
          body: template.body ? String(template.body).replace(wanted.id, tournament.id) : null,
        };
      }
      return {
        url: template.url,
        method: template.method,
        body: template.body ? String(template.body).replace(wanted.id, tournament.id) : null,
      };
    };

    // the whole slate, a few tournaments at a time
    const wanted2 = tournaments.filter((t) => t.events).sort((a, b) => b.events - a.events)
      .slice(0, SPORTYBET_TOURNAMENT_LIMIT);
    let done = 0;
    let failed = 0;
    for (let start = 0; start < wanted2.length; start += 6) {
      const batch = wanted2.slice(start, start + 6);
      const answers = await Promise.all(batch.map(async (tournament) => {
        const call = buildCall(tournament);
        const answer = await askInPage(page, {
          url: call.url,
          method: call.method,
          headers: { 'Content-Type': 'application/json' },
          body: call.body,
        });
        return { tournament, answer };
      }));
      for (const { tournament, answer } of answers) {
        done += 1;
        if (answer?.status !== 200 || !answer.body) { failed += 1; continue; }
        try {
          const payload = JSON.parse(answer.body);
          const found = flattenSportyBet(payload, { bookmaker: 'sportybet' });
          quotes.push(...found);
        } catch { failed += 1; }
      }
      if (done % 30 === 0 || done === wanted2.length) {
        note('sportybet', `${done}/${wanted2.length} tournaments read, ${quotes.length} prices, ${failed} failed`);
      }
    }
    note('sportybet', `the slate: ${quotes.length} prices from ${done - failed} tournaments`);
  } catch (error) {
    note('sportybet', `failed: ${error?.message || error}`);
  } finally {
    try { await page?.close(); } catch { /* the tab may already be gone */ }
  }
  return quotes;
}

/* ------------------------------------------------------------------ *
 * The books that are not connected yet.
 *
 * The reader opens them the way a visitor does and writes down every call
 * the page makes that carries prices.  Nothing is guessed and nothing is
 * forced: the report is what the book itself asked for.
 * ------------------------------------------------------------------ */
const DISCOVERY_TARGETS = [
  { id: '22bet', url: 'https://22bet.ng/' },
  { id: '1xbet', url: 'https://1xbet.ng/' },
  { id: 'nairabet', url: 'https://nairabet.com/sports' },
];

async function discoverBooks(browser) {
  const report = {};
  for (const target of DISCOVERY_TARGETS) {
    const calls = [];
    let page = null;
    try {
      page = await browser.newPage();
      await page.setViewport({ width: 412, height: 900 });
      await dressAsVisitor(page);
      page.on('response', async (response) => {
        const url = response.url();
        if (!/^https?:\/\//.test(url)) return;
        if (!/api|line|odds|sport|event|match|feed/i.test(url)) return;
        const request = response.request();
        const call = {
          url,
          method: request?.method() || 'GET',
          status: response.status(),
          body: request?.postData() ? String(request.postData()).slice(0, 200) : null,
        };
        calls.push(call);
        try {
          const text = await response.text();
          if (text && /odds|price|selection/i.test(text) && text.length > 2000) {
            call.snippet = text.slice(0, 400);
            call.length = text.length;
          }
        } catch { /* the body may already be gone */ }
      });

      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
      const arrived = await waitForRealPage(page, { timeoutMs: 20000 });
      await sleep(12000);
      const heading = await page.evaluate(`(() => {
        const body = (document.body && document.body.innerText || '').slice(0, 300);
        return { title: document.title || '', body };
      })()`).catch(() => ({ title: '', body: '' }));
      note(target.id, `page: ${arrived.ok ? 'arrived' : 'still checking'} (${heading.title || '?'})`);
      if (/prohibit|not available|restricted|blocked|forbidden/i.test(heading.body || '')) {
        note(target.id, `the book says: ${String(heading.body).slice(0, 140)}`);
      }
      const withPrices = calls.filter((call) => call.snippet);
      note(target.id, `${calls.length} calls, ${withPrices.length} of them carry prices`);
      for (const call of withPrices.slice(0, 8)) {
        note(target.id, `  ${call.method} ${call.url.slice(0, 130)} -> ${call.status} (${call.length} bytes)`);
      }
      report[target.id] = { url: target.url, title: heading.title, body: String(heading.body || '').slice(0, 200), calls, withPrices };
    } catch (error) {
      note(target.id, `failed: ${error?.message || error}`);
      report[target.id] = { url: target.url, error: error?.message || String(error), calls: [] };
    } finally {
      try { await page?.close(); } catch { /* the tab may already be gone */ }
    }
  }
  return report;
}

/* ------------------------------------------------------------------ *
 * The fixtures the books share.
 *
 * A price for a match no other book is showing cannot be compared with
 * anything, so it is left out of what is published.  What is left is the
 * part of each book that can be compared: a few thousand prices instead of
 * tens of thousands, and a scan that fits in the Worker.
 * ------------------------------------------------------------------ */
function sharedFixturesOnly(books) {
  const all = [];
  for (const [book, quotes] of Object.entries(books)) {
    quotes.forEach((quote, index) => all.push({ quote, book, index }));
  }
  if (!all.length) return books;

  // The same search the scanner makes: the two names and the kick-off time.
  const keep = new Map();
  const byQuote = new Map();
  for (const item of all) byQuote.set(item.quote, item);
  for (const cluster of clusterFixtures(all.map((item) => item.quote))) {
    const members = cluster.map((quote) => byQuote.get(quote)).filter(Boolean);
    const bookNames = new Set(members.map((item) => item.book));
    if (bookNames.size < 2) continue;
    for (const item of members) {
      if (!keep.has(item.book)) keep.set(item.book, new Set());
      keep.get(item.book).add(item.index);
    }
  }

  const result = {};
  for (const [book, quotes] of Object.entries(books)) {
    const kept = keep.get(book);
    result[book] = kept ? quotes.filter((_, index) => kept.has(index)) : [];
  }
  return result;
}

/* ------------------------------------------------------------------ *
 * Read everything, then write the snapshot.
 * ------------------------------------------------------------------ */
async function main() {
  const capturedAt = new Date().toISOString();
  const books = {};
  await mkdir('out', { recursive: true });

  const mspportQuotes = await readMsport();
  if (mspportQuotes.length) books.msport = mspportQuotes;

  const lsbQuotes = await readLiveScoreBet();
  if (lsbQuotes.length) books.livescorebet = lsbQuotes;

  const nairaQuotes = await readNairaBet();
  if (nairaQuotes.length) books.nairabet = nairaQuotes;

  let browser = null;
  try {
    browser = await openBrowser();
    note('browser', `opened (${findChrome()})`);

    const betkingQuotes = await readBetking(browser);
    if (betkingQuotes.length) books.betking = betkingQuotes;

    const sportybetQuotes = await readSportyBet(browser);
    if (sportybetQuotes.length) books.sportybet = sportybetQuotes;

    // the books that are not connected yet are looked at, and what they ask
    // for is written down
    const discovery = await discoverBooks(browser);
    await writeFile('out/discovery.json', JSON.stringify({ capturedAt: new Date().toISOString(), books: discovery }, null, 1));
  } catch (error) {
    note('browser', `unavailable: ${error?.message || error}`);
  } finally {
    try { await browser?.close(); } catch { /* the browser may already be gone */ }
  }

  // only the prices that another book is also showing
  const shared = sharedFixturesOnly(books);
  for (const [book, quotes] of Object.entries(books)) {
    note(book, `${quotes.length} prices read, ${shared[book].length} of them a match another book is showing`);
  }

  // one file per book, so the Worker reads one book's prices at a time
  await mkdir('out', { recursive: true });
  const summary = { capturedAt, books: {}, notes };
  for (const [book, quotes] of Object.entries(shared)) {
    const file = {
      capturedAt,
      book,
      // only what the scanner compares: the settlement wording, the address
      // the price came from and the stake note are left behind
      quotes: quotes.map((quote) => ({
        event: quote.event,
        eventId: quote.eventId,
        sport: quote.sport,
        competition: quote.competition,
        startsAt: quote.startsAt,
        market: quote.market,
        marketKey: quote.marketKey,
        rulesKey: quote.rulesKey,
        way: quote.way,
        outcome: quote.outcome,
        label: quote.label,
        bookmaker: book,
        odds: quote.odds,
        fetchedAt: capturedAt,
      })),
    };
    await writeFile(`out/${book}.json`, JSON.stringify(file));
    summary.books[book] = { quotes: file.quotes.length, bytes: JSON.stringify(file).length };
    console.log(`[done] ${book} -> out/${book}.json (${file.quotes.length} prices, ${summary.books[book].bytes} bytes)`);
  }
  await writeFile('out/latest.json', JSON.stringify(summary));
  console.log(`[done] summary -> out/latest.json (${JSON.stringify(summary).length} bytes)`);
}

main().catch((error) => {
  console.error('[fatal]', error?.message || error);
  process.exitCode = 1;
});

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

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MSPORT_URL = (process.env.MSPORT_FEED_URL
  || 'https://www.msport.com/api/ng/facts-center/query/frontend/sports-matches-list?sportId=sr:sport:1&timeslot=Today').trim();

const BETKING_URLS = (process.env.BETKING_FEED_URL
  || 'https://sportsapicdn-desktop.betking.com/api/feeds/prematch/mostpopularsports/en/1/7/3/,https://sportsapicdn-desktop.betking.com/api/feeds/prematch/lastminute/en/1/15/')
  .split(',').map((entry) => entry.trim()).filter(Boolean);

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
  let page = null;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900 });
    await dressAsVisitor(page);
    const captured = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (!/sportybet\.com\/api\//i.test(url)) return;
      seen.push({ url, method: response.request()?.method() || 'GET', status: response.status() });
      if (!/factsCenter/i.test(url)) return;
      try {
        const text = await response.text();
        if (text && text.length > 500) captured.push({ url, body: text });
      } catch { /* the body may already be gone */ }
    });

    await page.goto(SPORTYBET_PAGE, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    const arrived = await waitForRealPage(page, { timeoutMs: 30000 });
    note('sportybet', `page: ${arrived.ok ? 'arrived' : 'still checking'} (${arrived.state?.title || '?'})`);
    await sleep(6000);

    // the device id the site's own app asks for
    const device = await askInPage(page, { url: `${SPORTYBET_ORIGIN}/api/ng/patron/deviceId`, method: 'POST' });
    note('sportybet', `device id -> HTTP ${device?.status ?? 'nothing'}${device?.length ? `, ${device.length} bytes` : ''}`);

    // the menu: which tournaments are on today
    const menu = await askInPage(page, {
      url: `${SPORTYBET_ORIGIN}/api/ng/factsCenter/wapPopularAndSportOption`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sportId: 'sr:sport:1' }),
    });
    let menuPayload = null;
    if (menu?.status === 200 && menu.body) {
      try { menuPayload = JSON.parse(menu.body); } catch { /* not JSON */ }
    }
    const categories = menuPayload?.data?.sportList?.[0]?.categories || [];
    const tournaments = [];
    for (const category of categories) {
      for (const tournament of category?.tournaments || []) {
        tournaments.push({ id: tournament.id, name: tournament.name, events: tournament.eventSize || 0, category: category.name });
      }
    }
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
    if (quotes.length) {
      note('sportybet', `the slate: ${quotes.length} prices`);
      return quotes;
    }
    if (!tournaments.length) {
      note('sportybet', `menu -> ${menu?.error ? menu.error : `HTTP ${menu?.status ?? 'nothing'}: ${String(menu?.body || '').slice(0, 90)}`}`);
      note('sportybet', `calls the page made: ${seen.length}`);
      for (const call of seen.slice(0, 40)) note('sportybet', `  page call ${call.method} ${call.url} -> ${call.status}`);
      return quotes;
    }
    note('sportybet', `menu -> ${categories.length} categories, ${tournaments.length} tournaments, ${menuPayload?.data?.sportList?.[0]?.eventSize ?? '?'} events`);

    // the price call the site's own page makes, one per tournament
    const sample = tournaments.filter((t) => t.events).slice(0, 2);
    let working = null;
    for (const template of SPORTYBET_TEMPLATES) {
      for (const tournament of sample) {
        const url = template.replace('{id}', tournament.id);
        const answer = await askInPage(page, {
          url,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sportId: 'sr:sport:1', tournamentId: tournament.id }),
        });
        const ok = answer?.status === 200 && answer.body && answer.body.length > 500;
        note('sportybet', `${template.split('?')[0]} ${tournament.id} -> ${answer?.status ?? 'nothing'} ${answer?.length || 0}b${ok ? ' OK' : ''}`);
        if (ok) {
          try {
            JSON.parse(answer.body);
            working = template;
            break;
          } catch { /* not JSON */ }
        }
      }
      if (working) break;
    }
    if (!working) {
      note('sportybet', `calls the page made: ${seen.length}`);
      for (const call of seen.slice(0, 40)) note('sportybet', `  page call ${call.method} ${call.url} -> ${call.status}`);
      return quotes;
    }
    note('sportybet', `the working price call is ${working}`);

    // the whole slate: every tournament, a few at a time
    const wanted = tournaments
      .filter((t) => t.events)
      .sort((a, b) => b.events - a.events)
      .slice(0, SPORTYBET_TOURNAMENT_LIMIT);
    let done = 0;
    let failed = 0;
    for (let start = 0; start < wanted.length; start += 6) {
      const batch = wanted.slice(start, start + 6);
      const answers = await Promise.all(batch.map(async (tournament) => {
        const url = working.replace('{id}', tournament.id);
        const answer = await askInPage(page, {
          url,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sportId: 'sr:sport:1', tournamentId: tournament.id }),
        });
        return { tournament, answer };
      }));
      for (const { tournament, answer } of answers) {
        done += 1;
        if (answer?.status !== 200 || !answer.body) { failed += 1; continue; }
        try {
          const payload = JSON.parse(answer.body);
          quotes.push(...flattenSportyBet(payload, { bookmaker: 'sportybet' }));
        } catch { failed += 1; }
      }
      if (done % 30 === 0 || done === wanted.length) {
        note('sportybet', `${done}/${wanted.length} tournaments read, ${quotes.length} prices, ${failed} failed`);
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
 * Read everything, then write the snapshot.
 * ------------------------------------------------------------------ */
async function main() {
  const capturedAt = new Date().toISOString();
  const books = {};

  const mspportQuotes = await readMsport();
  if (mspportQuotes.length) books.msport = mspportQuotes;

  let browser = null;
  try {
    browser = await openBrowser();
    note('browser', `opened (${findChrome()})`);

    const betkingQuotes = await readBetking(browser);
    if (betkingQuotes.length) books.betking = betkingQuotes;

    const sportybetQuotes = await readSportyBet(browser);
    if (sportybetQuotes.length) books.sportybet = sportybetQuotes;
  } catch (error) {
    note('browser', `unavailable: ${error?.message || error}`);
  } finally {
    try { await browser?.close(); } catch { /* the browser may already be gone */ }
  }

  // one file per book, so the Worker reads one book's prices at a time
  await mkdir('out', { recursive: true });
  const summary = { capturedAt, books: {}, notes };
  for (const [book, quotes] of Object.entries(books)) {
    const file = {
      capturedAt,
      book,
      quotes: quotes.map((quote) => ({ ...quote, bookmaker: book, fetchedAt: capturedAt })),
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

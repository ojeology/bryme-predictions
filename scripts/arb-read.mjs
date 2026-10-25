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
 * No account is used, no check is solved, no bet is placed.  Every request
 * here is the same public request the book's own web app makes.
 *
 *   node scripts/arb-read.mjs          -> out/latest.json
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const MSPORT_URL = (process.env.MSPORT_FEED_URL
  || 'https://www.msport.com/api/ng/facts-center/query/frontend/sports-matches-list?sportId=sr:sport:1&timeslot=Today').trim();

const BETKING_URLS = (process.env.BETKING_FEED_URL
  || 'https://sportsapicdn-desktop.betking.com/api/feeds/prematch/mostpopularsports/en/1/7/3/,https://sportsapicdn-desktop.betking.com/api/feeds/prematch/lastminute/en/1/15/')
  .split(',').map((entry) => entry.trim()).filter(Boolean);

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
      return null;
    }
    const payload = JSON.parse(text);
    if (!payload?.data) {
      note('msport', 'answered, but not with a price tree');
      return null;
    }
    note('msport', `HTTP ${response.status}, ${text.length} bytes`);
    return { url: MSPORT_URL, payload };
  } catch (error) {
    note('msport', `failed: ${error?.message || error}`);
    return null;
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
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
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
  const payloads = [];
  let page = null;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900 });
    await page.setUserAgent(UA);
    await page.goto('https://www.betking.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    await sleep(12000);
    for (const url of BETKING_URLS) {
      const answer = await askInPage(page, { url, method: 'GET' });
      if (answer?.status === 200 && answer.body) {
        try {
          payloads.push({ url, payload: JSON.parse(answer.body) });
          note('betking', `${url} -> ${answer.length} bytes`);
        } catch {
          note('betking', `${url} -> answered, but not JSON`);
        }
      } else {
        note('betking', `${url} -> ${answer?.error || `HTTP ${answer?.status ?? 'nothing'}`}`);
      }
    }
  } catch (error) {
    note('betking', `failed: ${error?.message || error}`);
  } finally {
    try { await page?.close(); } catch { /* the tab may already be gone */ }
  }
  return payloads.length ? { payloads } : null;
}

/* ------------------------------------------------------------------ *
 * SportyBet - the whole slate, not the fourteen games the small
 * public feed lists.
 *
 * The site asks its own price service for the events of each tournament.
 * The first run records every call the page makes, so the exact call the
 * book uses is used here as well - nothing is guessed.
 * ------------------------------------------------------------------ */
const SPORTYBET_PAGE = 'https://www.sportybet.com/ng/m/';

async function readSportyBet(browser) {
  const payloads = [];
  const seen = [];
  let page = null;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900 });
    await page.setUserAgent(UA);
    page.on('response', (response) => {
      const url = response.url();
      if (!/sportybet\.com\/api\//i.test(url)) return;
      seen.push({ url, method: response.request()?.method() || 'GET', status: response.status() });
    });
    await page.goto(SPORTYBET_PAGE, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    await sleep(10000);

    // the device id the site's own app asks for
    const device = await askInPage(page, { url: '/api/ng/patron/deviceId', method: 'POST' });
    note('sportybet', `device id -> HTTP ${device?.status ?? 'nothing'}`);

    // the menu: which tournaments are on today
    const menu = await askInPage(page, {
      url: '/api/ng/factsCenter/wapPopularAndSportOption',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sportId: 'sr:sport:1' }),
    });
    if (menu?.status !== 200 || !menu.body) {
      note('sportybet', `menu -> ${menu?.error || `HTTP ${menu?.status ?? 'nothing'}`}`);
    } else {
      let menuPayload = null;
      try { menuPayload = JSON.parse(menu.body); } catch { /* not JSON */ }
      const categories = menuPayload?.data?.sportList?.[0]?.categories || [];
      const tournaments = [];
      for (const category of categories) {
        for (const tournament of category?.tournaments || []) {
          tournaments.push({ id: tournament.id, name: tournament.name, events: tournament.eventSize, category: category.name });
        }
      }
      note('sportybet', `menu -> ${categories.length} categories, ${tournaments.length} tournaments, ${menuPayload?.data?.sportList?.[0]?.eventSize ?? '?'} events`);

      // the price calls the site's own page makes, one per tournament
      const templates = [
        '/api/ng/factsCenter/wapEvents?sportId=sr:sport:1&tournamentId={id}',
        '/api/ng/factsCenter/wapConfigurableEventsByOrder?sportId=sr:sport:1&tournamentId={id}',
        '/api/ng/factsCenter/wapConfigurableUpcomingEvents?sportId=sr:sport:1&tournamentId={id}',
        '/api/ng/factsCenter/v2/wapConfigurableNewHighlightEvents?sportId=sr:sport:1&tournamentId={id}',
        '/api/ng/factsCenter/pcEvents?sportId=sr:sport:1&tournamentId={id}',
        '/api/ng/factsCenter/wapEventsByOrder?sportId=sr:sport:1&tournamentId={id}',
      ];
      const sample = tournaments.filter((t) => t.events).slice(0, 3);
      const working = [];
      for (const template of templates) {
        for (const tournament of sample) {
          const url = template.replace('{id}', tournament.id);
          const answer = await askInPage(page, { url, method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sportId: 'sr:sport:1', tournamentId: tournament.id }) });
          const ok = answer?.status === 200 && answer.body && answer.body.length > 500;
          note('sportybet', `${template.split('?')[0]} ${tournament.id} -> ${answer?.status ?? 'nothing'} ${answer?.length || 0}b${ok ? ' OK' : ''}`);
          if (ok) {
            try {
              const payload = JSON.parse(answer.body);
              payloads.push({ url, tournament: tournament.name, payload });
              working.push(template);
              break;
            } catch { /* not JSON */ }
          }
        }
        if (working.length) break;
      }
      if (!working.length) {
        // the page's own calls are the last word on where the prices live
        note('sportybet', `calls the page made: ${seen.length}`);
        for (const call of seen.slice(0, 40)) note('sportybet', `  page call ${call.method} ${call.url} -> ${call.status}`);
      }
    }
  } catch (error) {
    note('sportybet', `failed: ${error?.message || error}`);
  } finally {
    try { await page?.close(); } catch { /* the tab may already be gone */ }
  }
  return payloads.length ? { payloads } : null;
}

/* ------------------------------------------------------------------ *
 * Read everything, then write the snapshot.
 * ------------------------------------------------------------------ */
async function main() {
  const capturedAt = new Date().toISOString();
  const books = {};

  const msport = await readMsport();
  if (msport) books.msport = msport;

  let browser = null;
  try {
    browser = await openBrowser();
    note('browser', `opened (${findChrome()})`);

    const betking = await readBetking(browser);
    if (betking) books.betking = betking;

    const sportybet = await readSportyBet(browser);
    if (sportybet) books.sportybet = sportybet;
  } catch (error) {
    note('browser', `unavailable: ${error?.message || error}`);
  } finally {
    try { await browser?.close(); } catch { /* the browser may already be gone */ }
  }

  // one file per book, so the Worker reads one book's prices at a time
  await mkdir('out', { recursive: true });
  const summary = { capturedAt, books: {}, notes };
  for (const [book, entry] of Object.entries(books)) {
    const file = { capturedAt, ...entry };
    await writeFile(`out/${book}.json`, JSON.stringify(file));
    summary.books[book] = { bytes: JSON.stringify(file).length };
    console.log(`[done] ${book} -> out/${book}.json (${summary.books[book].bytes} bytes)`);
  }
  await writeFile('out/latest.json', JSON.stringify(summary));
  console.log(`[done] summary -> out/latest.json (${JSON.stringify(summary).length} bytes)`);
}

main().catch((error) => {
  console.error('[fatal]', error?.message || error);
  process.exitCode = 1;
});

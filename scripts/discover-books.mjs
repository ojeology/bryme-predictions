/**
 * FIND THE PRICE ADDRESSES OF A BOOK
 * =================================
 * Some books answer only a client that looks like an ordinary browser.  For
 * those, the only honest way to find out where the prices come from is to
 * open the site in a real browser and watch the calls it makes.  This
 * script does exactly that, and writes down what it saw.
 *
 * It reads nothing but the public pages of the book.  It logs no
 * credentials, and it does not place a bet.
 *
 *   node scripts/discover-books.mjs [bookId ...]
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const TARGETS = [
  { id: 'nairabet', urls: ['https://nairabet.com/sports'] },
  { id: 'bet9ja', urls: ['https://sports.bet9ja.com/', 'https://www.bet9ja.com/'] },
  { id: 'merrybet', urls: ['https://merrybet.ng/', 'https://merrybet.com/'] },
  { id: 'betway', urls: ['https://www.betway.ng/'] },
];

const NAIRABET_TREE = 'https://sb2frontend-altenar2.biahosted.com/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=nairabet&deviceType=desktop&sportId=66';
const UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Look like an ordinary visitor, and not like a machine. */
async function dressAsVisitor(page) {
  await page.setUserAgent(UA);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-NG,en;q=0.9' });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  }).catch(() => {});
}

/** Wait out a check page, if there is one. */
async function waitForRealPage(page, { timeoutMs = 30000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    const state = await page.evaluate(`(() => ({ title: document.title || '', href: location.href }))()`).catch(() => null);
    if (state) {
      last = `${state.title} | ${state.href}`;
      if (!/just a moment|attention required|checking your browser|one more step/i.test(state.title)
        && !/\/cdn-cgi\/challenge/.test(state.href)) return { ok: true, state };
    }
    await sleep(1500);
  }
  return { ok: false, state: { title: last } };
}

const WANTED = process.argv.slice(2).filter((value) => !value.startsWith('-'));
const targets = WANTED.length ? TARGETS.filter((target) => WANTED.includes(target.id)) : TARGETS;
const WAIT_MS = Number(process.env.DISCOVER_WAIT_MS || 16000);
const OUT = 'out/discovery';

function log(line) {
  console.log(line);
}

function findChrome() {
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const candidate of candidates) {
    try {
      if (existsSync(candidate)) return candidate;
    } catch { /* keep looking */ }
  }
  return undefined;
}

async function openBrowser() {
  const puppeteer = (await import('puppeteer-core')).default;
  return puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1366,900',
      '--lang=en-NG',
    ],
    defaultViewport: { width: 1366, height: 900 },
  });
}

async function watch(page, label) {
  page.on('response', async (response) => {
    try {
      const request = response.request();
      const type = request.resourceType();
      const contentType = response.headers()['content-type'] || '';
      const url = response.url();
      if (type !== 'xhr' && type !== 'fetch' && !/json/i.test(contentType)) return;
      if (/analytics|telemetry|sentry|log|tracking|beacon|ads|gtm|facebook|google/i.test(url)) return;
      let body = '';
      try {
        body = (await response.text()).slice(0, 600);
      } catch { /* the body may be gone */ }
      log(`  [${label}] ${response.status()} ${type} ${url}`);
      if (body) log(`      body: ${body.replace(/\s+/g, ' ').slice(0, 500)}`);
    } catch { /* a response we cannot read is not a problem */ }
  });
}

/**
 * Look inside the price tree NairaBet's widget uses, and write down what
 * the total-goals markets look like: the line, the price, and the flag that
 * says whether the price is money-back.  A market on a half line can never
 * be a push, so a money-back flag there changes nothing; on a whole line it
 * changes everything.
 */
async function inspectNairaBet(browser) {
  const page = await browser.newPage();
  try {
    log('== nairabet: opening the page so the widget is allowed to answer');
    await page.setViewport({ width: 412, height: 900 });
    await dressAsVisitor(page);
    await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    const arrived = await waitForRealPage(page, { timeoutMs: 30000 });
    log(`== nairabet: page ${arrived.ok ? 'arrived' : 'still checking'} (${arrived.state?.title || '?'})`);
    await sleep(12000);
    const clicked = await page.evaluate(`(() => {
      const nodes = [...document.querySelectorAll('a,div,span,li,button')].filter(
        (node) => node.children.length === 0 && /^(football|soccer)$/i.test((node.textContent || '').trim()),
      );
      if (nodes[0]) { nodes[0].click(); return true; }
      return false;
    })()`).catch(() => false);
    await sleep(18000);
    log(`== nairabet: opening football (${clicked ? 'yes' : 'no'})`);
    const summary = await page.evaluate(async (address) => {
      const answer = await fetch(address, { credentials: 'omit' });
      if (!answer.ok) return { error: `HTTP ${answer.status}` };
      const payload = await answer.json();
      const rows = [];
      const walk = (node, path) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          for (const item of node) walk(item, path);
          return;
        }
        const name = node.name || node.title || node.displayName || '';
        if (node.odds && typeof node.odds === 'object') {
          const typeId = node.typeId ?? node.type?.id ?? null;
          rows.push({ path, name, typeId, id: node.id, keys: Object.keys(node).slice(0, 24), odds: node.odds });
        }
        for (const [key, value] of Object.entries(node)) {
          if (key === 'odds') continue;
          walk(value, path ? `${path}.${key}` : key);
        }
      };
      walk(payload, '');
      const totals = rows.filter((row) => /total|goals/i.test(row.name));
      const byType = {};
      for (const row of rows) {
        const key = `${row.typeId}|${row.name}`;
        byType[key] = (byType[key] || 0) + 1;
      }
      const sample = totals.slice(0, 2).map((row) => ({
        name: row.name,
        typeId: row.typeId,
        keys: row.keys,
        odds: row.odds,
      }));
      // the whole of two total-goals markets, so the line and the
      // money-back flag can be read
      const full = [];
      const walkFull = (node) => {
        if (!node || typeof node !== 'object' || full.length >= 2) return;
        if (Array.isArray(node)) { for (const item of node) walkFull(item); return; }
        const typeId = node.typeId ?? node.type?.id ?? null;
        if (typeId === 18 && node.mst) {
          full.push(JSON.parse(JSON.stringify(node)));
          return;
        }
        for (const [key, value] of Object.entries(node)) {
          if (key === 'odds') continue;
          walkFull(value);
        }
      };
      walkFull(payload);
      const isMbValues = {};
      for (const row of totals) {
        for (const odd of Object.values(row.odds || {})) {
          if (odd && typeof odd === 'object' && 'isMB' in odd) {
            const key = String(odd.isMB);
            isMbValues[key] = (isMbValues[key] || 0) + 1;
          }
        }
      }
      return {
        totalRows: rows.length,
        totalMarkets: totals.length,
        isMbValues,
        marketTypes: Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 40),
        sample,
        full,
      };
    }, NAIRABET_TREE);
    log(`== nairabet: ${JSON.stringify(summary, null, 1)}`);
  } catch (error) {
    log(`== nairabet: failed: ${error?.message || error}`);
  } finally {
    await page.close().catch(() => {});
  }
}

async function look(browser, target) {
  for (const address of target.urls) {
    const page = await browser.newPage();
    try {
      await watch(page, target.id);
      log(`== ${target.id}: opening ${address}`);
      await page.goto(address, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await new Promise((resolve) => setTimeout(resolve, WAIT_MS));
      const title = await page.title().catch(() => '');
      const landed = page.url();
      log(`== ${target.id}: title "${title}" at ${landed}`);
      const scripts = await page.evaluate(() => [...document.querySelectorAll('script[src]')].map((node) => node.src).slice(0, 40)).catch(() => []);
      log(`== ${target.id}: scripts`);
      for (const src of scripts) log(`      ${src}`);
      const text = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1200)).catch(() => '');
      log(`== ${target.id}: page text: ${text.replace(/\s+/g, ' ')}`);
      if (landed && !/access denied|error|forbidden|not found|blocked/i.test(`${title} ${text.slice(0, 200)}`)) {
        log(`== ${target.id}: REACHED ${landed}`);
        return true;
      }
    } catch (error) {
      log(`== ${target.id}: ${address} failed: ${error?.message || error}`);
    } finally {
      await page.close().catch(() => {});
    }
  }
  log(`== ${target.id}: NOT REACHED`);
  return false;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await openBrowser();
  const reached = {};
  try {
    for (const target of targets) {
      if (target.id === 'nairabet') {
        await inspectNairaBet(browser);
        reached[target.id] = true;
        continue;
      }
      reached[target.id] = await look(browser, target);
    }
  } finally {
    await browser.close().catch(() => {});
  }
  writeFileSync(`${OUT}/reached.json`, JSON.stringify(reached, null, 2));
  log(`== summary: ${JSON.stringify(reached)}`);
}

main().catch((error) => {
  log(`discovery failed: ${error?.stack || error}`);
  process.exit(1);
});

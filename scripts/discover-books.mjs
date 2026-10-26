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
import { writeFileSync, mkdirSync } from 'node:fs';

const TARGETS = [
  { id: 'bet9ja', urls: ['https://sports.bet9ja.com/', 'https://www.bet9ja.com/'] },
  { id: 'merrybet', urls: ['https://merrybet.ng/', 'https://merrybet.com/'] },
  { id: 'betway', urls: ['https://www.betway.ng/'] },
];

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
      if (require('node:fs').existsSync(candidate)) return candidate;
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

#!/usr/bin/env node
/**
 * FEED DISCOVERY — let the browser find the prices for you
 * ======================================================
 * You do not need to know what an API is. This script opens each bookmaker
 * in a real browser, exactly the way you would, and watches the data the
 * page pulls in behind the scenes. When it sees a feed that carries prices
 * it writes the address down for you.
 *
 *   npm install -D playwright
 *   npx playwright install chromium
 *
 *   node arb/discover.mjs                     # headless, the three books
 *   node arb/discover.mjs --headed            # watch it happen
 *   node arb/discover.mjs --book sportybet    # just one book
 *   node arb/discover.mjs --url https://...   # a page you name yourself
 *
 * Results land in arb/discovered/. Paste the winning address into .env as
 * SPORTYBET_FEED_URL (or NAIRABET_FEED_URL / BET22_FEED_URL) and the scanner
 * can read that book directly from then on.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'discovered');

const BOOKS = [
  { id: 'sportybet', label: 'SportyBet NG', url: 'https://www.sportybet.com/ng/sports/football' },
  { id: 'nairabet', label: 'NairaBet', url: 'https://nairabet.com/sports/football' },
  { id: '22bet', label: '22Bet NG', url: 'https://22bet.ng/en/sports/football' },
  { id: '1xbet', label: '1xBet', url: 'https://1xbet.ng/en/sports/football' },
  { id: 'livescorebet', label: 'LiveScore Bet NG', url: 'https://livescorebet.com/ng/sports/football' },
];

const args = process.argv.slice(2);
const headed = args.includes('--headed');
const only = args.includes('--book') ? args[args.indexOf('--book') + 1] : null;
const customUrl = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;

function looksLikePrices(text) {
  if (!text) return false;
  const s = text.slice(0, 4000);
  if (/"(odds|price|selection|outcomes?|markets?|matches|events|fixtures|handicap|line)"\s*:/i.test(s)) return true;
  if (/"odds"\s*:\s*\d/i.test(s)) return true;
  return false;
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    try {
      return await import('playwright-core');
    } catch {
      console.error('\nPlaywright is not installed. Run:\n  npm install -D playwright\n  npx playwright install chromium\n');
      process.exit(1);
    }
  }
}

async function discover(book, playwright) {
  const url = customUrl || book.url;
  console.log(`\n=== ${book.label} — ${url}`);
  let browser;
  const found = [];
  try {
    browser = await playwright.chromium.launch({
      headless: !headed,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const context = await browser.newContext({
      locale: 'en-NG',
      timezoneId: 'Africa/Lagos',
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
        + '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    page.on('response', async (response) => {
      try {
        const type = (response.headers()['content-type'] || '').toLowerCase();
        if (!type.includes('json')) return;
        const text = await response.text().catch(() => '');
        if (!looksLikePrices(text)) return;
        found.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          bytes: text.length,
          sample: text.slice(0, 1200),
          seenAt: new Date().toISOString(),
        });
      } catch { /* a body we cannot read is not a feed */ }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(9000);   // let the page load its markets
    const title = await page.title().catch(() => '');
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 400) || '').catch(() => '');
    console.log(`   page title: ${title}`);
    const blocked = /access denied|unusual traffic|just a moment|verify|cloudflare|blocked|not available|restricted/i.test(bodyText);
    if (blocked) console.log(`   ! the page looks like a block/challenge page: "${bodyText.slice(0, 120).replace(/\n/g, ' ')}"`);
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, `${book.id}-page.txt`), bodyText);
    // keep a copy of the rendered page too: if this book turns out to have no
    // usable data feed, the browser route can read the prices off the screen
    // and the selectors can be written from this file
    const html = await page.content().catch(() => '');
    if (html) fs.writeFileSync(path.join(OUT, `${book.id}-dom.html`), html);
  } catch (error) {
    console.log(`   ! ${error.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  if (!found.length) {
    console.log('   no price-carrying data feed was seen.');
    console.log('   (a block page, a login wall, or prices that only exist after you log in)');
    return [];
  }
  // the same address seen twice is one feed
  const unique = [...new Map(found.map((f) => [f.url, f])).values()]
    .sort((a, b) => b.bytes - a.bytes);
  fs.writeFileSync(path.join(OUT, `${book.id}.json`), JSON.stringify(unique, null, 1));
  console.log(`   ${unique.length} price feed(s) found — written to arb/discovered/${book.id}.json`);
  for (const f of unique.slice(0, 6)) {
    console.log(`     ${f.method} ${f.status} ${(f.bytes / 1024).toFixed(0)}KB  ${f.url.slice(0, 120)}`);
  }
  return unique;
}

async function main() {
  const playwright = await loadPlaywright();
  const books = only ? BOOKS.filter((b) => b.id === only) : BOOKS;
  if (!books.length) {
    console.error(`No book called "${only}". Known: ${BOOKS.map((b) => b.id).join(', ')}`);
    process.exit(1);
  }
  console.log('FEED DISCOVERY — watching what each book loads its prices from.');
  console.log('Run this from your own connection, not from a foreign cloud server.\n');
  const summary = [];
  for (const book of books) {
    const found = await discover(book, playwright);
    summary.push({ book: book.id, feeds: found.length });
  }
  console.log('\n=== SUMMARY ===');
  for (const s of summary) console.log(`   ${s.book.padEnd(14)} ${s.feeds ? `${s.feeds} feed(s) found` : 'nothing found'}`);
  console.log('\nNext: copy the best address for each book into .env, e.g.');
  console.log('   SPORTYBET_FEED_URL=<the address that carried the prices>');
  console.log('Then run: node arb/probe.mjs --scan');
}

main().catch((error) => {
  console.error('discovery failed:', error?.message || error);
  process.exit(1);
});

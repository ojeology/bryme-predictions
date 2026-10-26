// How many prices does each book actually yield, and how many survive the
// "another book is also showing this match" rule?  This is what the reader
// publishes, and what the Worker has to hold.
import puppeteer from 'puppeteer-core';
import { flattenNairaBet } from '../arb/connectors/nairabet.js';
import { clusterFixtures } from '../src/lib/arbitrage.js';
const HOST = 'https://sb2frontend-altenar2.biahosted.com';
const url = (t) => `${HOST}/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=${encodeURIComponent(t)}&deviceType=desktop&sportId=66`;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900 });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
const books = {};
for (const token of ['nairabet', 'betking', 'jackpotbet', 'betway', 'stake']) {
  const asked = await page.evaluate(async (u) => {
    const r = await fetch(u, { credentials: 'omit' });
    return { status: r.status, body: await r.text() };
  }, url(token));
  const payload = JSON.parse(asked.body);
  const quotes = flattenNairaBet(payload, { bookmaker: token, now: new Date().toISOString() });
  books[token] = quotes;
  const kinds = {};
  for (const q of quotes) kinds[q.marketKey] = (kinds[q.marketKey] || 0) + 1;
  console.log(`${token.padEnd(12)} ${String(quotes.length).padStart(7)} prices  markets: ${Object.entries(kinds).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,v])=>`${k}×${v}`).join(' ')}`);
  await new Promise(r => setTimeout(r, 3000));
}
// the shared-fixture filter, exactly as the reader does it
const all = [];
for (const [book, quotes] of Object.entries(books)) quotes.forEach((quote, index) => all.push({ quote, book, index }));
const keep = new Map(); const byQuote = new Map();
for (const item of all) byQuote.set(item.quote, item);
for (const cluster of clusterFixtures(all.map((i) => i.quote))) {
  const members = cluster.map((q) => byQuote.get(q)).filter(Boolean);
  if (new Set(members.map((m) => m.book)).size < 2) continue;
  for (const item of members) {
    if (!keep.has(item.book)) keep.set(item.book, new Set());
    keep.get(item.book).add(item.index);
  }
}
console.log('\nAFTER the shared-fixture filter:');
let total = 0;
for (const [book, quotes] of Object.entries(books)) {
  const n = keep.get(book)?.size || 0; total += n;
  console.log(`  ${book.padEnd(12)} ${String(n).padStart(7)} of ${quotes.length}`);
}
console.log(`  TOTAL ${total}`);
await browser.close();

// Are stake and 12bet the same book under two names?  If the prices are
// identical, comparing them would produce false arbitrages.
import puppeteer from 'puppeteer-core';
import { createHash } from 'node:crypto';
const HOST = 'https://sb2frontend-altenar2.biahosted.com';
const url = (t) => `${HOST}/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=${encodeURIComponent(t)}&deviceType=desktop&sportId=66`;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900 });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
const got = {};
for (const token of ['stake', '12bet', 'nairabet', 'jackpotbet', 'betking', 'betway']) {
  const asked = await page.evaluate(async (u) => {
    const r = await fetch(u, { credentials: 'omit' });
    return { status: r.status, body: await r.text() };
  }, url(token));
  const d = JSON.parse(asked.body);
  // a fingerprint of the odds themselves
  const fp = (d.odds || []).map(o => `${o.competitorId}:${o.typeId}:${o.price}`).sort().join('|');
  got[token] = { events: (d.events||[]).length, odds: (d.odds||[]).length, hash: createHash('sha256').update(fp).digest('hex').slice(0,16) };
  console.log(`${token.padEnd(12)} events ${got[token].events} odds ${got[token].odds} odds-hash ${got[token].hash}`);
  await new Promise(r => setTimeout(r, 3000));
}
const tokens = Object.keys(got);
for (let i=0;i<tokens.length;i++) for (let j=i+1;j<tokens.length;j++) {
  if (got[tokens[i]].hash === got[tokens[j]].hash) console.log(`  !! ${tokens[i]} and ${tokens[j]} have IDENTICAL prices`);
}
await browser.close();

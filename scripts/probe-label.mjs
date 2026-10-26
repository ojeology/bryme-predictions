// stake and 12bet answered with the same prices, so they are one book under
// two names.  Which name is the book's own?
import puppeteer from 'puppeteer-core';
const HOST = 'https://sb2frontend-altenar2.biahosted.com';
const url = (t) => `${HOST}/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=${encodeURIComponent(t)}&deviceType=desktop&sportId=66`;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900 });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
for (const token of ['stake', '12bet', 'nairabet']) {
  const asked = await page.evaluate(async (u) => {
    const r = await fetch(u, { credentials: 'omit' });
    return { status: r.status, body: await r.text() };
  }, url(token));
  const d = JSON.parse(asked.body);
  console.log(`\n=== ${token} ===`);
  console.log('  top-level keys:', Object.keys(d).join(', '));
  // anything that names the book?
  for (const k of Object.keys(d)) {
    if (!Array.isArray(d[k])) console.log(`  ${k} = ${JSON.stringify(d[k]).slice(0, 200)}`);
  }
  const ev = (d.events || [])[0] || {};
  console.log('  first event keys:', Object.keys(ev).join(', '));
  for (const k of Object.keys(ev)) if (typeof ev[k] === 'string' && k !== 'name') console.log(`    event.${k} = ${ev[k].slice(0,90)}`);
  // the competitions, in order - a book's own front page order
  console.log('  competitions:', (d.champs||[]).slice(0,12).map(c=>c.name).join(' | '));
  await new Promise(r => setTimeout(r, 3000));
}
await browser.close();

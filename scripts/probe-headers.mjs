// The platform may name the book in its own headers.  If it does, that is
// the answer to which name is the book's own.
import puppeteer from 'puppeteer-core';
const HOST = 'https://sb2frontend-altenar2.biahosted.com';
const url = (t) => `${HOST}/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=${encodeURIComponent(t)}&deviceType=desktop&sportId=66`;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900 });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
for (const token of ['nairabet', 'stake', '12bet', 'betway']) {
  const asked = await page.evaluate(async (u) => {
    const r = await fetch(u, { credentials: 'omit' });
    return { status: r.status, body: await r.text() };
  }, url(token));
  const d = JSON.parse(asked.body);
  console.log(`\n=== ${token} ===`);
  console.log('  headers:', JSON.stringify(d.headers).slice(0, 700));
  const ev = (d.events || [])[0] || {};
  console.log('  event codes: sc', ev.sc, '| mc', ev.mc, '| rc', ev.rc, '| catId', ev.catId, '| champId', ev.champId, '| pId', ev.pId);
  const c = (d.competitors || [])[0] || {};
  console.log('  competitor keys:', Object.keys(c).join(','), '| name', c.name);
  await new Promise(r => setTimeout(r, 3000));
}
await browser.close();

// What markets do the new books answer with?  The reader must not guess:
// the market names come from the platform's own headers.
import puppeteer from 'puppeteer-core';
const HOST = 'https://sb2frontend-altenar2.biahosted.com';
const url = (t) => `${HOST}/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=${encodeURIComponent(t)}&deviceType=desktop&sportId=66`;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900 });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
for (const token of ['stake', 'betway', '12bet']) {
  const asked = await page.evaluate(async (u) => {
    const r = await fetch(u, { credentials: 'omit' });
    return { status: r.status, body: await r.text() };
  }, url(token));
  const d = JSON.parse(asked.body);
  const names = {};
  for (const m of (d.markets || [])) names[`${m.typeId}:${m.name}`] = (names[`${m.typeId}:${m.name}`] || 0) + 1;
  const mb = (d.odds || []).filter(o => o.isMB).length;
  console.log(`\n=== ${token} === events ${(d.events||[]).length} markets ${(d.markets||[]).length} odds ${(d.odds||[]).length} isMB ${mb}`);
  console.log('  market types:', Object.entries(names).sort((a,b)=>b[1]-a[1]).slice(0,14).map(([k,v])=>`${k}×${v}`).join('  '));
}
await browser.close();

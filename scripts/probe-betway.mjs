// betway answered with 11 MB that is not the same shape as the others.
import puppeteer from 'puppeteer-core';
const HOST = 'https://sb2frontend-altenar2.biahosted.com';
const url = (t) => `${HOST}/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=${encodeURIComponent(t)}&deviceType=desktop&sportId=66`;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900 });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
const asked = await page.evaluate(async (u) => {
  const r = await fetch(u, { credentials: 'omit' });
  return { status: r.status, body: await r.text() };
}, url('betway'));
console.log('HTTP', asked.status, 'bytes', asked.body.length);
try {
  const d = JSON.parse(asked.body);
  console.log('top-level keys:', Object.keys(d).join(', '));
  for (const k of Object.keys(d)) {
    if (Array.isArray(d[k])) console.log(`  ${k}: array of ${d[k].length}`);
    else console.log(`  ${k}: ${JSON.stringify(d[k]).slice(0, 150)}`);
  }
  console.log('\nfirst event:', JSON.stringify((d.events||[])[0]).slice(0, 400));
  console.log('first market:', JSON.stringify((d.markets||[])[0]).slice(0, 300));
  console.log('first odds:', JSON.stringify((d.odds||[])[0]).slice(0, 300));
  console.log('first competitor:', JSON.stringify((d.competitors||[])[0]).slice(0, 200));
} catch (e) {
  console.log('not JSON:', e.message);
  console.log('body starts:', asked.body.slice(0, 300));
}
await browser.close();

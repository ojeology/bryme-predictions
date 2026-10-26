// Ask the platform for each book's prices, from the runner's own browser.
import puppeteer from 'puppeteer-core';
const HOST = 'https://sb2frontend-altenar2.biahosted.com';
const url = (token) => `${HOST}/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=${encodeURIComponent(token)}&deviceType=desktop&sportId=66`;
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900 });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
for (const token of ['nairabet', 'betking', 'jackpotbet', 'stake', 'betway', '12bet']) {
  try {
    const asked = await page.evaluate(async (u) => {
      const r = await fetch(u, { credentials: 'omit' });
      return { status: r.status, body: await r.text() };
    }, url(token));
    let events = 0, name = '';
    try { const d = JSON.parse(asked.body); events = (d.events || []).length; } catch {}
    console.log(`${token.padEnd(12)} HTTP ${asked.status}  ${String(asked.body.length).padStart(9)} bytes  events ${events}`);
  } catch (e) {
    console.log(`${token.padEnd(12)} ERROR ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 3000));
}
await browser.close();

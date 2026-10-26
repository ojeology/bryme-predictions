// stake and 12bet answer with one book's prices.  Which brand's own site
// asks this platform for its prices?
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const sites = [
  ['12bet.com', 'https://12bet.com/'],
  ['12bet.com.ng', 'https://12bet.com.ng/'],
  ['stake.com', 'https://stake.com/'],
  ['betway.com', 'https://www.betway.com/'],
  ['betway.ng', 'https://www.betway.ng/'],
];
for (const [name, site] of sites) {
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
  const calls = [];
  page.on('request', (r) => { if (/GetEvents|integration=|biahosted|alterna/i.test(r.url())) calls.push(r.url().slice(0, 240)); });
  let status = '?';
  try {
    const res = await page.goto(site, { waitUntil: 'domcontentloaded', timeout: 35000 });
    status = res ? res.status() : 'no answer';
    await new Promise(r => setTimeout(r, 12000));
  } catch (e) { status = `error: ${e.message.slice(0, 70)}`; }
  const tokens = calls.map(c => (/integration=([^&]+)/.exec(c) || [])[1]).filter(Boolean);
  console.log(`\n=== ${name} === HTTP ${status}`);
  console.log(`  widget calls: ${calls.length} | tokens: ${[...new Set(tokens)].join(', ') || 'none'}`);
  for (const c of calls.slice(0, 3)) console.log('   ', c);
  await page.close();
}
await browser.close();

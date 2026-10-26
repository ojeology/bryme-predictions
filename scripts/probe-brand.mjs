// stake and 12bet answered with the same prices.  Which brand's own site
// asks for which token, and do the sites serve Nigeria at all?
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
for (const [brand, site] of [['stake', 'https://stake.com/'], ['12bet', 'https://12bet.com/'], ['betway', 'https://betway.com/']]) {
  const page = await browser.newPage();
  await page.setViewport({ width: 412, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
  const calls = [];
  page.on('request', (r) => {
    const u = r.url();
    if (/GetEvents|integration=|biahosted/i.test(u)) calls.push(u.slice(0, 200));
  });
  let title = '?', status = '?';
  try {
    const res = await page.goto(site, { waitUntil: 'domcontentloaded', timeout: 40000 });
    status = res ? res.status() : 'no answer';
    await new Promise(r => setTimeout(r, 9000));
    title = await page.title().catch(() => '?');
  } catch (e) { status = `error: ${e.message.slice(0, 60)}`; }
  console.log(`\n=== ${brand} === ${site}`);
  console.log(`  HTTP ${status} | title: ${title}`);
  const tokens = calls.map(c => (/integration=([^&]+)/.exec(c) || [])[1]).filter(Boolean);
  console.log(`  token(s) its own site asked for: ${[...new Set(tokens)].join(', ') || 'none'}`);
  console.log(`  calls: ${calls.length}`);
  await page.close();
}
await browser.close();

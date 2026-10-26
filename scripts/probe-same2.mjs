// stake and 12bet answered with the same prices.  Is one of them the
// other's feed - and do they differ only in wording, or completely?
import puppeteer from 'puppeteer-core';
const HOST = 'https://sb2frontend-altenar2.biahosted.com';
const url = (t) => `${HOST}/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=${encodeURIComponent(t)}&deviceType=desktop&sportId=66`;
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 900 });
await page.setUserAgent('Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36');
await page.goto('https://nairabet.com/sports', { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
const trees = {};
for (const token of ['stake', '12bet']) {
  const asked = await page.evaluate(async (u) => {
    const r = await fetch(u, { credentials: 'omit' });
    return { status: r.status, body: await r.text() };
  }, url(token));
  trees[token] = JSON.parse(asked.body);
  await new Promise(r => setTimeout(r, 3000));
}
for (const t of ['stake','12bet']) {
  const d = trees[t];
  const ev = (d.events||[]).slice(0,3).map(e => `${e.name} | ${e.startDate} | ext ${e.extId}`);
  console.log(`\n=== ${t} ===`);
  console.log('  first events:'); ev.forEach(x=>console.log('   ', x));
  const odds = (d.odds||[]).slice(0,6).map(o=>`${o.name} ${o.price} type ${o.typeId} mb ${o.isMB?1:0}`);
  console.log('  first odds:'); odds.forEach(x=>console.log('   ', x));
  console.log('  champs:', (d.champs||[]).slice(0,4).map(c=>c.name).join(' | '));
}
// are the competitor names the same?
const names = (t) => new Set((trees[t].competitors||[]).map(c=>c.name));
const a = names('stake'), b = names('12bet');
console.log(`\ncompetitors stake ${a.size} 12bet ${b.size} | shared ${[...a].filter(x=>b.has(x)).length}`);
await browser.close();

#!/usr/bin/env node
/**
 * ONE-COMMAND SETUP — from zero to a working scanner
 * ==================================================
 *   npm run setup
 *
 * What it does, in order:
 *   1. makes sure Playwright and a Chromium browser are on this machine;
 *   2. opens each book in a real browser and watches the prices load;
 *   3. writes the address it found into .env (SPORTYBET_FEED_URL etc.);
 *   4. checks that each address really carries prices right now;
 *   5. prints the exact lines to paste into Cloudflare so the public
 *      domain can read the same feeds;
 *   6. tells you to start the lab and press RUN.
 *
 * Run it from your own connection (a phone hotspot is fine). The books read
 * the internet address, and a foreign cloud server gets a challenge page
 * instead of prices.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'discovered');
const ENV_FILE = path.join(ROOT, '.env');

const BOOKS = [
  { id: 'sportybet', label: 'SportyBet NG', envKey: 'SPORTYBET_FEED_URL' },
  { id: 'nairabet', label: 'NairaBet', envKey: 'NAIRABET_FEED_URL' },
  { id: '22bet', label: '22Bet NG', envKey: 'BET22_FEED_URL' },
  { id: '1xbet', label: '1xBet', envKey: 'BET1X_FEED_URL' },
  { id: 'livescorebet', label: 'LiveScore Bet NG', envKey: 'LSCB_FEED_URL' },
];

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32', ...options });
    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', () => resolve(1));
  });
}

function heading(text) {
  console.log(`\n\x1b[1m${text}\x1b[0m`);
}

async function ensureBrowser() {
  heading('1/5  Browser');
  try {
    await import('playwright');
    console.log('   Playwright is installed.');
  } catch {
    console.log('   Installing Playwright…');
    await run('npm', ['install', '-D', 'playwright']);
  }
  console.log('   Making sure Chromium is downloaded…');
  await run('npx', ['playwright', 'install', 'chromium']);
}

async function discover() {
  heading('2/5  Watching each book load its prices');
  await run(process.execPath, [path.join(HERE, 'discover.mjs')]);
}

function bestFeed(bookId) {
  const file = path.join(OUT, `${bookId}.json`);
  if (!fs.existsSync(file)) return null;
  let feeds = [];
  try {
    feeds = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
  if (!Array.isArray(feeds) || !feeds.length) return null;
  const usable = feeds.filter((feed) => feed && feed.url && feed.status >= 200 && feed.status < 300);
  const pool = usable.length ? usable : feeds;
  return pool.slice().sort((a, b) => (b.bytes || 0) - (a.bytes || 0))[0] || null;
}

function readEnv() {
  if (!fs.existsSync(ENV_FILE)) return [];
  return fs.readFileSync(ENV_FILE, 'utf8').split('\n');
}

function writeEnv(lines) {
  fs.writeFileSync(ENV_FILE, `${lines.join('\n').replace(/\n*$/, '\n')}`);
}

function setEnvValue(lines, key, value) {
  const index = lines.findIndex((line) => line.trim().startsWith(`${key}=`));
  const line = `${key}=${value}`;
  if (index >= 0) lines[index] = line;
  else {
    if (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    lines.push(line, '');
  }
  return lines;
}

async function verify(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await response.text();
    const carriesPrices = /"(odds|price|selections?|outcomes?|markets?|matches|events|fixtures|handicap|line)"\s*:/i.test(text.slice(0, 6000));
    return { ok: response.ok, bytes: text.length, carriesPrices };
  } catch (error) {
    return { ok: false, bytes: 0, carriesPrices: false, error: error.message };
  }
}

async function main() {
  console.log('\x1b[1m\x1b[32mBRYME LAB — setup\x1b[0m');
  console.log('This finds the price feeds for you. Nothing is placed, logged in to, or bought.');

  await ensureBrowser();
  await discover();

  heading('3/5  Writing .env');
  let lines = readEnv();
  if (!lines.length) lines = [''];
  const chosen = [];
  for (const book of BOOKS) {
    const feed = bestFeed(book.id);
    if (!feed) {
      console.log(`   ${book.label.padEnd(18)} no feed found`);
      continue;
    }
    lines = setEnvValue(lines, book.envKey, feed.url);
    chosen.push({ book, feed });
    console.log(`   ${book.label.padEnd(18)} ${book.envKey}  (${(feed.bytes / 1024).toFixed(0)}KB)`);
  }
  writeEnv(lines);
  console.log(`   saved to ${path.relative(ROOT, ENV_FILE)}`);

  heading('4/5  Checking the feeds really carry prices');
  for (const { book, feed } of chosen) {
    const result = await verify(feed.url);
    const verdict = result.carriesPrices ? 'PRICES OK' : result.ok ? 'reachable, but no prices found' : 'blocked';
    console.log(`   ${book.label.padEnd(18)} ${verdict}  ${result.bytes ? `${(result.bytes / 1024).toFixed(0)}KB` : ''}`);
  }

  heading('5/5  Making the public domain read the same feeds');
  console.log('   Cloudflare dashboard → Workers & Pages → bryme-predictions →');
  console.log('   Settings → Variables and Secrets → Add → Secret (encrypted):\n');
  for (const { book } of chosen) {
    console.log(`   Name: ${book.envKey}`);
    console.log(`   Value: ${book.envKey === 'SPORTYBET_FEED_URL' ? '(the SportyBet address from your .env)' : '(the address from your .env)'}\n`);
  }
  console.log('   Or paste this straight from your .env file — it already holds the values:\n');
  for (const { book } of chosen) {
    const value = (readEnv().find((line) => line.startsWith(`${book.envKey}=`)) || '').split('=').slice(1).join('=');
    console.log(`   ${book.envKey}=${value}`);
  }
  console.log('\n   After saving the secrets, push once (or re-run the deploy) so the Worker picks them up.');

  heading('Done — start the lab');
  console.log('   npm run lab');
  console.log('   then open http://localhost:5173 and press RUN (or press R anywhere).');
  console.log('\n   On your phone, on the same Wi-Fi: http://<your-computer-ip>:5173\n');
}

main().catch((error) => {
  console.error('\nsetup failed:', error?.message || error);
  process.exit(1);
});

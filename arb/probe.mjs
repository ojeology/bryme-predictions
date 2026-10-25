#!/usr/bin/env node
/**
 * PROBE YOUR BOOKS
 * =================
 * Answers the only question that matters before any scanner is useful:
 * "right now, from this machine, what can we actually read?"
 *
 *   node arb/probe.mjs            report what each configured book returns
 *   node arb/probe.mjs --scan     also look for live arbitrage across the books
 *
 * Configuration comes from the environment or a .env file next to the repo
 * root.  Nothing is sent to a book that is not configured.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanOpportunities } from '../src/lib/arbitrage.js';
import { flattenBookPayload, marketSummary } from './connectors/normalize.js';
import { fetchBook } from './connectors/httpBook.js';
import { fetchBookWithBrowser } from './connectors/browserBook.js';
import { CONNECTORS } from './connectors/index.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');

function loadEnv() {
  const env = { ...process.env };
  const file = path.join(ROOT, '.env');
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

function bookConfigured(env, definition) {
  return Boolean(env[definition.envKey] || env.ARB_FEED_URL
    || env[`${definition.id.toUpperCase()}_BROWSER_URL`] || env.BROWSER_BOOK_URL);
}

async function probeBook(env, definition) {
  const started = Date.now();
  const result = await fetchBook(env, definition);
  const latency = Date.now() - started;
  const row = { id: definition.id, label: definition.label, mode: 'http', latency, quotes: result.quotes.length };
  if (result.error) row.error = result.error;
  if (!result.error && !result.quotes.length) {
    const browser = await fetchBookWithBrowser(env, definition);
    row.mode = browser.error ? 'http (browser unavailable)' : 'browser';
    row.quotes = browser.quotes.length;
    row.latency = Date.now() - started;
    if (browser.error) row.error = browser.error;
    else row.detail = browser.detail;
    row.quotesList = browser.quotes;
    if (result.quotes.length) row.quotesList = result.quotes;
  } else {
    row.quotesList = result.quotes;
  }
  return row;
}

async function main() {
  const env = loadEnv();
  const scan = process.argv.includes('--scan');
  const configured = CONNECTORS.filter((d) => bookConfigured(env, d));

  console.log('BOOK PROBE — what can we actually read right now?\n');
  if (!configured.length) {
    console.log('No books are configured. Add endpoints to .env, for example:');
    console.log('  SPORTYBET_FEED_URL=https://...');
    console.log('  NAIRABET_FEED_URL=https://...');
    console.log('  BET22_FEED_URL=https://...');
    console.log('  # or drive a page in a real browser:');
    console.log('  BROWSER_BOOK_URL=https://...');
    console.log('  BROWSER_BOOK_ROWS={"row":".market-row","event":".event","market":".market","outcome":".sel","odds":".odds"}');
    console.log('\nA book with no endpoint configured is skipped — that is expected in manual mode.');
    return;
  }

  const rows = [];
  for (const definition of configured) {
    const row = await probeBook(env, definition);
    rows.push(row);
    const status = row.error ? 'BLOCKED/ERROR' : 'OK';
    console.log(`${definition.label.padEnd(16)} ${String(row.mode).padEnd(12)} ${status.padEnd(14)} `
      + `${String(row.latency).padStart(6)}ms  ${String(row.quotes).padStart(5)} quotes`);
    if (row.error) console.log(`   ! ${row.error}`);
  }

  const all = rows.flatMap((r) => r.quotesList || []);
  if (!all.length) {
    console.log('\nNo prices came back. Nothing to compare yet.');
    return;
  }

  const summary = marketSummary(all);
  console.log(`\n${all.length} quotes across ${summary.length} markets.`);
  console.log('Sample markets:');
  for (const m of summary.slice(0, 8)) {
    console.log(`   ${m.market} — ${m.ways} outcome(s) [${m.outcomes.join(', ')}] — ${m.quotes} quotes — ${m.event}`);
  }

  const books = [...new Set(all.map((q) => q.bookmaker))];
  console.log(`\nBooks seen: ${books.join(', ')}`);
  const starts = all.map((q) => q.startsAt).filter(Boolean).sort();
  if (starts.length) console.log(`Kick-off range: ${starts[0]} -> ${starts[starts.length - 1]}`);

  if (!scan) {
    console.log('\nRun with --scan to look for live arbitrage across these books.');
    return;
  }

  const opportunities = scanOpportunities(all, {
    totalStake: Number(env.ARB_TOTAL_STAKE || 100000),
    rounding: Number(env.ARB_ROUNDING || 100),
    now: new Date(),
  });
  console.log(`\nARBITRAGE FOUND: ${opportunities.length}`);
  for (const o of opportunities.slice(0, 15)) {
    const legs = o.legs.map((l) => `${l.bookmaker} ${l.label} @${l.odds.toFixed(2)} -> ${Math.round(l.stake)}`).join(' | ');
    console.log(`  ${o.event} — ${o.market} [${o.rules}]  ROI ${o.theoreticalRoiPct.toFixed(2)}%  `
      + `lowest return ${Math.round(o.minReturn)} (profit ${Math.round(o.minProfit)})`);
    console.log(`     ${legs}`);
  }
  if (opportunities.rejectedGroupCount) {
    console.log(`\n${opportunities.rejectedGroupCount} market group(s) refused (incomplete market, extra outcome key, or rules mismatch).`);
  }
}

main().catch((error) => {
  console.error('probe failed:', error?.message || error);
  process.exit(1);
});

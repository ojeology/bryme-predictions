#!/usr/bin/env node
/**
 * DOCTOR — find out exactly why RUN gives you zero prices
 * ======================================================
 *   npm run doctor
 *
 * It checks the whole chain and tells you which link is broken:
 *
 *   1. your machine   — is .env there, and does each address answer with
 *                       prices right now (from your connection)?
 *   2. the deployment — does the Worker on the domain have any feed
 *                       addresses at all?
 *
 * Then it prints the fix for whichever link is broken.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONNECTORS } from './connectors/index.js';
import { fetchBook } from './connectors/httpBook.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DEPLOY = process.env.ARB_DEPLOY_URL || 'https://predictions.thebryme.com';

function loadEnv() {
  const env = { ...process.env };
  const file = path.join(ROOT, '.env');
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  return env;
}

function configuredUrl(env, definition) {
  return env[definition.envKey] || (env.ARB_FEED_URL ? 'ARB_FEED_URL (one address for every book)' : '');
}

function head(text) {
  console.log(`\n\x1b[1m\x1b[36m${text}\x1b[0m`);
}

function ok(text) { console.log(`   \x1b[32m✓\x1b[0m ${text}`); }
function bad(text) { console.log(`   \x1b[31m✗\x1b[0m ${text}`); }
function warn(text) { console.log(`   \x1b[33m!\x1b[0m ${text}`); }
function info(text) { console.log(`   · ${text}`); }

async function main() {
  const env = loadEnv();
  const envFile = path.join(ROOT, '.env');

  head('1. YOUR MACHINE');
  if (!fs.existsSync(envFile)) {
    bad('No .env file — the scanner has no book addresses to read.');
    info('Fix: npm run setup   (it writes .env for you)');
  } else {
    ok('.env exists');
  }

  const rows = [];
  for (const definition of CONNECTORS) {
    const url = configuredUrl(env, definition);
    if (!url) {
      rows.push({ definition, url: '', state: 'missing' });
      continue;
    }
    const started = Date.now();
    const result = await fetchBook(env, definition);
    const latency = Date.now() - started;
    rows.push({ definition, url, latency, quotes: result.quotes.length, error: result.error, state: result.quotes.length ? 'live' : (result.error ? 'error' : 'empty') });
  }

  for (const row of rows) {
    const label = row.definition.label.padEnd(18);
    if (row.state === 'missing') {
      warn(`${label} no address`);
    } else if (row.state === 'live') {
      ok(`${label} ${row.quotes} prices  (${row.latency}ms)`);
    } else if (row.state === 'empty') {
      bad(`${label} the address answered but carried no prices`);
    } else {
      bad(`${label} ${String(row.error).slice(0, 110)}`);
    }
  }

  const live = rows.filter((row) => row.state === 'live');
  const hasAny = rows.some((row) => row.state !== 'missing');

  head('2. THE DEPLOYMENT (the domain)');
  let deployed = null;
  try {
    const response = await fetch(`${DEPLOY}/api/arbs/status`, { headers: { Accept: 'application/json' } });
    deployed = response.ok ? await response.json() : null;
  } catch { /* offline is fine, we report it below */ }

  if (!deployed) {
    warn(`Could not reach ${DEPLOY}/api/arbs/status`);
  } else if (deployed.mode === 'feed') {
    ok(`The Worker has feed addresses (mode: feed)`);
    const configured = (deployed.connectors || []).filter((connector) => connector.status === 'connected');
    info(`${configured.length} book(s) connected on the domain`);
  } else {
    bad('The Worker has NO feed addresses (mode: manual)');
    info('This is why RUN on the domain returns 0 prices — the deployment has');
    info('nothing to read yet. Your local .env is not sent to the server.');
  }

  head('3. THE FIX');
  if (!live.length) {
    console.log('   \x1b[1mYour machine has no working feed yet.\x1b[0m\n');
    if (!hasAny) {
      console.log('   npm run setup          # opens each book, finds the prices');
    } else {
      console.log('   The address is set but no prices came back. That usually means');
      console.log('   the book blocked the request, or the address is the wrong one.');
      console.log('   Run this to look again:');
      console.log('     npm run setup         # re-runs discovery and rewrites .env');
      console.log('     npm run feeds --headed   # watch the browser do it');
    }
    console.log('\n   Nothing else can work until one book answers with prices.\n');
    return;
  }

  console.log(`   \x1b[32mYour machine reads ${live.length} book(s).\x1b[0m The lab works locally:\n`);
  console.log('     npm run lab        # then press RUN\n');

  if (deployed && deployed.mode !== 'feed') {
    console.log('   \x1b[1mTo make the public domain read the same books\x1b[0m\n');
    console.log('   Cloudflare dashboard → Workers & Pages → bryme-predictions →');
    console.log('   Settings → Variables and Secrets → Add → Secret (encrypted).\n');
    for (const row of live) {
      console.log(`   Name:  ${row.definition.envKey}`);
      console.log(`   Value: ${row.url}`);
      console.log('');
    }
    console.log('   Then push once so the Worker picks the secrets up:');
    console.log('     git push origin main\n');
  } else if (deployed) {
    console.log('   The deployment is already configured. Press RUN on the domain.');
    console.log('');
  }

  if (live.length < CONNECTORS.length) {
    const missing = rows.filter((row) => row.state === 'missing').map((row) => row.definition.label);
    if (missing.length) {
      console.log(`   Not connected yet: ${missing.join(', ')}`);
      console.log('   More books = more pairs = more chances of a real arbitrage.');
      console.log('   Run npm run setup again to look for them.\n');
    }
  }
}

main().catch((error) => {
  console.error('doctor failed:', error?.message || error);
  process.exit(1);
});

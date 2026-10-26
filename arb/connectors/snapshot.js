/**
 * The prices the free reader published.
 *
 * GitHub's runners read the books that refuse a server, and publish what
 * they read to a branch of this repository.  The Worker picks the prices up
 * from the public raw address of that branch - no secret, no browser time,
 * and no account anywhere.
 *
 * One file per book, so the Worker holds one book's prices at a time: a
 * book's own price tree can be several megabytes of JSON, and holding two
 * of them at once is enough to run the Worker out of memory.
 *
 * The snapshot carries the time the prices were really read, so the normal
 * freshness check still holds them to account: a snapshot that has gone
 * cold is refused exactly like a feed that has gone cold.
 */
import { flattenMsport } from './msport.js';
import { flattenBetking } from './betking.js';
import { flattenSportyBet } from './sportybet.js';
import { expandRows } from './published.js';

const REPO = 'ojeology/bryme-predictions';
const BRANCH = 'prices';
const RAW = `https://raw.githubusercontent.com/${REPO}`;
const CACHE_MS = 60_000;
// The reader publishes fresh prices every ten minutes.  Looking up the
// commit it published last costs a question to GitHub, and a copy of that
// answer that is five minutes old is a commit that is five minutes old -
// which is a whole publishing round out of date.  The lookup is done
// every time the prices are read, so a new publish is seen at once.
const HEAD_CACHE_MS = 45_000;
const DEFAULT_MAX_AGE_SECONDS = 1800;

// What is kept between two requests.
//
// The prices of a book are kept as the text the reader published, and not
// as the prices themselves.  A book publishes tens of thousands of prices,
// and keeping them all, expanded, between two requests is what filled the
// Worker's memory: the next request began with the last request's prices
// still there, and the Worker was refused for want of room before it had
// done any work at all.
//
// The text is a third of the size of the prices, and it is turned back into
// prices only when a scan really needs them.
const cache = new Map();
let head = { sha: null, at: 0 };

function snapshotBase(env = {}) {
  return String(env.ARB_SNAPSHOT_URL || `${RAW}/${BRANCH}`).trim().replace(/\/+$/, '');
}

/**
 * The commit the reader published last.
 *
 * The commit address can never change under us, which is why it is used
 * when it is known.  Looking it up costs a call to GitHub, and that call
 * has a limit, so the branch address is used when the lookup does not
 * answer - a copy that is a few minutes old is no older than the prices
 * themselves.
 */
async function headCommit(env = {}) {
  if (env.ARB_SNAPSHOT_URL) return null;
  const now = Date.now();
  if (head.sha && now - head.at <= HEAD_CACHE_MS) return head.sha;
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/commits?sha=${BRANCH}&per_page=1`, {
      headers: { 'User-Agent': 'BrymeArbScanner/1.0', Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return head.sha || null;
    const list = await response.json();
    const sha = Array.isArray(list) ? list[0]?.sha : null;
    if (sha) head = { sha, at: now };
    return sha || head.sha || null;
  } catch {
    return head.sha || null;
  }
}

/** How old a snapshot may be before the prices are treated as gone cold. */
export function snapshotMaxAgeSeconds(env = {}) {
  const value = Number(env.ARB_SNAPSHOT_MAX_AGE_SECONDS ?? DEFAULT_MAX_AGE_SECONDS);
  return Number.isFinite(value) && value >= 60 ? value : DEFAULT_MAX_AGE_SECONDS;
}

/**
 * Read one book's published file.
 *
 * @param {object} env  the Worker environment
 * @param {string} book the book's id
 * @returns {Promise<{capturedAt: string|null, text: string|null, error: Error|null}>}
 */
export async function readSnapshotBook(env = {}, book = '', { force = false } = {}) {
  const base = snapshotBase(env);
  if (!base || !book) return { capturedAt: null, text: null, error: null };

  const now = Date.now();
  const hit = cache.get(`${base}|${book}`);
  if (!force && hit && now - hit.at <= CACHE_MS) return hit.value;

  const sha = await headCommit(env);
  // The commit address can never change under us: it is always the file the
  // reader published last, never a copy the address has kept from an older
  // publish.  The branch address is the second try, for when the lookup of
  // the commit does not answer.
  const addresses = sha ? [`${RAW}/${sha}/${book}.json`, `${base}/${book}.json`] : [`${base}/${book}.json`];

  let value = { capturedAt: null, text: null, error: null };
  try {
    let response = null;
    let lastError = null;
    for (const address of addresses) {
      try {
        const answer = await fetch(address, {
          headers: { 'User-Agent': 'BrymeArbScanner/1.0', Accept: 'application/json' },
          redirect: 'follow',
        });
        if (answer.ok) { response = answer; break; }
        lastError = new Error(answer.status === 404
          ? 'the free reader has published no prices for this book yet'
          : `HTTP ${answer.status}`);
      } catch (error) {
        lastError = error;
      }
    }
    if (!response) throw lastError || new Error('the prices could not be read');
    if (!response.ok) {
      value = {
        capturedAt: null,
        text: null,
        error: new Error(`the free reader has published no prices for ${book} yet`),
      };
    } else {
      // the text is kept, not the prices: the prices are ten times the
      // size of the text, and the text is all that is needed to make them
      const text = await response.text();
      value = { capturedAt: capturedAtOf(text), text, error: null };
    }
  } catch (error) {
    value = { capturedAt: null, text: null, error };
  }

  cache.set(`${base}|${book}`, { at: now, value });
  return value;
}

/**
 * The moment the prices were read, taken from the text without reading the
 * whole of it.  The file begins with the moment, and a file that has gone
 * cold is refused before it is turned into prices at all.
 */
function capturedAtOf(text) {
  if (typeof text !== 'string') return null;
  const found = /"capturedAt"\s*:\s*"([^"]+)"/.exec(text.slice(0, 400));
  return found ? found[1] : null;
}

/**
 * Start the free reader.
 *
 * GitHub's own schedule is not always run - the times it is late or does not
 * fire at all are the times the prices go cold - so the reader is started
 * from here: by the Worker on its own clock, and by the scan when the
 * prices it has are too old to compare.
 *
 * @param {object} env the Worker environment
 * @returns {Promise<{dispatched: boolean, error: string|null}>}
 */
export async function dispatchReader(env = {}) {
  const token = String(env.ARB_GITHUB_TOKEN || '').trim();
  const repo = String(env.ARB_READER_REPO || REPO).trim();
  const workflow = String(env.ARB_READER_WORKFLOW || 'arb-reader.yml').trim();
  if (!token) return { dispatched: false, error: 'no token for the reader' };

  // Two readers at once ask the books twice as fast, and the books refuse
  // a burst.  A read that is still running is left to finish.
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/runs?per_page=1`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'BrymeArbScanner/1.0' },
    });
    if (response.ok) {
      const payload = await response.json();
      const latest = payload?.workflow_runs?.[0];
      const started = latest?.created_at ? new Date(latest.created_at).getTime() : NaN;
      const running = latest?.status === 'in_progress' || latest?.status === 'queued';
      const ageMinutes = Number.isFinite(started) ? (Date.now() - started) / 60000 : Infinity;
      if (running && ageMinutes < 20) {
        return { dispatched: false, error: 'a read is already running' };
      }
    }
  } catch { /* if the check cannot be made, carry on */ }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'BrymeArbScanner/1.0',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    });
    if (response.status === 204) return { dispatched: true, error: null };
    return { dispatched: false, error: `the reader was not started (HTTP ${response.status})` };
  } catch (error) {
    return { dispatched: false, error: error?.message || String(error) };
  }
}

/**
 * The small summary the reader publishes: when the prices were read, and
 * which books it read.
 */
export async function readSnapshotSummary(env = {}) {
  const base = snapshotBase(env);
  if (!base) return { capturedAt: null, books: {}, error: null };
  try {
    const response = await fetch(`${base}/latest.json`, {
      headers: { 'User-Agent': 'BrymeArbScanner/1.0', Accept: 'application/json' },
      redirect: 'follow',
    });
    if (!response.ok) return { capturedAt: null, books: {}, error: new Error(`HTTP ${response.status}`) };
    const payload = await response.json();
    return { capturedAt: payload?.capturedAt || null, books: payload?.books || {}, error: null };
  } catch (error) {
    return { capturedAt: null, books: {}, error };
  }
}

/**
 * Wait for the reader to publish fresh prices.
 *
 * The wait is a wait, not work: it costs the Worker nothing while it lasts.
 */
export async function waitForFreshReader(env = {}, { timeoutMs = 150000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    last = await readSnapshotSummary(env);
    if (last.capturedAt) {
      const ageSeconds = (Date.now() - new Date(last.capturedAt).getTime()) / 1000;
      if (Number.isFinite(ageSeconds) && ageSeconds <= 150) {
        return { ok: true, capturedAt: last.capturedAt, books: last.books };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 12000));
  }
  return { ok: false, capturedAt: last?.capturedAt || null, books: last?.books || {} };
}

/**
 * Put one published file through the book's own adapter, and keep only the
 * prices: a raw price tree is several megabytes, and the Worker holds one
 * book at a time.
 */
function flattenInto(value, book, env) {
  const capturedAt = value.capturedAt;
  if (!value.text || !capturedAt) return value;

  const captured = new Date(capturedAt);
  const ageSeconds = (Date.now() - captured.getTime()) / 1000;
  if (!Number.isFinite(ageSeconds) || ageSeconds > snapshotMaxAgeSeconds(env)) {
    value.quotes = [];
    value.error = new Error(`the prices read ${Math.round(ageSeconds / 60)} minutes ago are too old to compare`);
    value.text = null;
    return value;
  }

  // the time the prices were read is written on the prices themselves:
  // copying every price to add one field cost the Worker both time and
  // memory when a book publishes a full slate
  const stamp = (quotes) => {
    for (const quote of quotes) quote.fetchedAt = capturedAt;
    return quotes;
  };
  try {
    let quotes = [];
    const entry = JSON.parse(value.text);
    if (Array.isArray(entry.rows)) {
      quotes = expandRows(entry, book, capturedAt);
    } else if (Array.isArray(entry.quotes)) {
      quotes = entry.quotes;
    } else if (book === 'msport' && entry.payload) {
      quotes = flattenMsport(entry.payload, { bookmaker: 'msport', url: entry.url, now: capturedAt });
    } else if (book === 'betking' && Array.isArray(entry.payloads)) {
      for (const item of entry.payloads) {
        quotes.push(...flattenBetking(item.payload, { bookmaker: 'betking', url: item.url }));
      }
    } else if (book === 'sportybet' && Array.isArray(entry.payloads)) {
      for (const item of entry.payloads) {
        quotes.push(...flattenSportyBet(item.payload, { bookmaker: 'sportybet', now: capturedAt }));
      }
    }
    value.quotes = stamp(quotes);
    value.error = null;
  } catch (readError) {
    value.quotes = [];
    value.error = readError;
  }
  // the text is let go of: the prices are all that are needed from here
  value.text = null;
  return value;
}

/**
 * The quotes of one book, taken from the published snapshot.
 *
 * @param {object} env  the Worker environment
 * @param {string} book the book's id
 * @returns {Promise<{quotes: Array, error: Error|null, capturedAt: string|null}>}
 */
export async function snapshotQuotes(env = {}, book = '', options = {}) {
  const value = await readSnapshotBook(env, book, options);
  // the text is turned into prices here, and only here: the prices are
  // ten times the size of the text, and they are let go of as soon as the
  // scan has used them
  const filled = flattenInto({ capturedAt: value.capturedAt, text: value.text, quotes: [] }, book, env);
  return { quotes: filled.quotes || [], error: filled.error || null, capturedAt: value.capturedAt || null };
}

/**
 * When a book published its prices, without making them.
 *
 * The scan needs to know how old the prices are before it makes them: an
 * expired slate is worth nothing, and making six slates of tens of
 * thousands of prices only to find out they are too old is the work that
 * filled the Worker's memory.
 */
export async function snapshotAge(env = {}, book = '', options = {}) {
  const value = await readSnapshotBook(env, book, options);
  if (!value.text) return { capturedAt: value.capturedAt || null, error: value.error || null };
  const captured = new Date(value.capturedAt);
  const ageSeconds = (Date.now() - captured.getTime()) / 1000;
  if (!Number.isFinite(ageSeconds) || ageSeconds > snapshotMaxAgeSeconds(env)) {
    return {
      capturedAt: value.capturedAt || null,
      error: new Error(`the prices read ${Math.round(ageSeconds / 60)} minutes ago are too old to compare`),
    };
  }
  return { capturedAt: value.capturedAt || null, error: null };
}

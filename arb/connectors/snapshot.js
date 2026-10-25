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

const DEFAULT_BASE = 'https://raw.githubusercontent.com/ojeology/bryme-predictions/prices';
const CACHE_MS = 60_000;
const DEFAULT_MAX_AGE_SECONDS = 1800;

const cache = new Map();

function snapshotBase(env = {}) {
  return String(env.ARB_SNAPSHOT_URL || DEFAULT_BASE).trim().replace(/\/+$/, '');
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
 * @returns {Promise<{capturedAt: string|null, entry: object|null, error: Error|null}>}
 */
export async function readSnapshotBook(env = {}, book = '') {
  const base = snapshotBase(env);
  if (!base || !book) return { capturedAt: null, entry: null, error: null };

  const now = Date.now();
  const hit = cache.get(`${base}|${book}`);
  if (hit && now - hit.at <= CACHE_MS) return hit.value;

  let value = { capturedAt: null, entry: null, error: null };
  try {
    const response = await fetch(`${base}/${book}.json?t=${now}`, {
      headers: { 'User-Agent': 'BrymeArbScanner/1.0', Accept: 'application/json' },
      redirect: 'follow',
    });
    if (!response.ok) {
      value = { capturedAt: null, entry: null, error: new Error(`the free reader has no prices for ${book} yet (HTTP ${response.status})`) };
    } else {
      const payload = await response.json();
      value = { capturedAt: payload?.capturedAt || null, entry: payload || null, error: null };
    }
  } catch (error) {
    value = { capturedAt: null, entry: null, error };
  }

  cache.set(`${base}|${book}`, { at: now, value });
  return value;
}

/**
 * The quotes of one book, taken from the published snapshot.
 *
 * @param {object} env  the Worker environment
 * @param {string} book the book's id
 * @returns {Promise<{quotes: Array, error: Error|null, capturedAt: string|null}>}
 */
export async function snapshotQuotes(env = {}, book = '') {
  const { capturedAt, entry, error } = await readSnapshotBook(env, book);
  if (!entry || !capturedAt) return { quotes: [], error, capturedAt: null };

  const captured = new Date(capturedAt);
  const ageSeconds = (Date.now() - captured.getTime()) / 1000;
  if (!Number.isFinite(ageSeconds) || ageSeconds > snapshotMaxAgeSeconds(env)) {
    return {
      quotes: [],
      error: new Error(`the prices read ${Math.round(ageSeconds / 60)} minutes ago are too old to compare`),
      capturedAt,
    };
  }

  const stamp = (quotes) => quotes.map((quote) => ({ ...quote, fetchedAt: capturedAt }));

  try {
    // the reader publishes the prices already in comparable form
    if (Array.isArray(entry.quotes)) {
      return { quotes: stamp(entry.quotes), error: null, capturedAt };
    }
    if (book === 'msport' && entry.payload) {
      return { quotes: stamp(flattenMsport(entry.payload, { bookmaker: 'msport', url: entry.url, now: capturedAt })), error: null, capturedAt };
    }
    if (book === 'betking' && Array.isArray(entry.payloads)) {
      const quotes = [];
      for (const item of entry.payloads) {
        quotes.push(...flattenBetking(item.payload, { bookmaker: 'betking', url: item.url }));
      }
      return { quotes: stamp(quotes), error: null, capturedAt };
    }
    if (book === 'sportybet' && Array.isArray(entry.payloads)) {
      const quotes = [];
      for (const item of entry.payloads) {
        quotes.push(...flattenSportyBet(item.payload, { bookmaker: 'sportybet', now: capturedAt }));
      }
      return { quotes: stamp(quotes), error: null, capturedAt };
    }
  } catch (readError) {
    // a payload the adapter cannot read is left out rather than guessed at
    return { quotes: [], error: readError, capturedAt };
  }
  return { quotes: [], error: null, capturedAt };
}

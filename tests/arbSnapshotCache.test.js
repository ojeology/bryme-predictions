import test from 'node:test';
import assert from 'node:assert/strict';
import { readSnapshotBook, snapshotQuotes } from '../arb/connectors/snapshot.js';

/**
 * What the Worker keeps between two requests.
 *
 * A book publishes tens of thousands of prices.  Keeping them all, turned
 * into prices, between two requests is what filled the Worker's memory: the
 * next request began with the last request's prices still there, and the
 * Worker was refused for want of room before it had done any work at all.
 *
 * What is kept is the text the reader published, which is a third of the
 * size, and the prices are made only when a scan really needs them.
 */
// the prices have to be fresh: a file that has gone cold is refused
// before it is turned into prices at all
const CAPTURED = new Date().toISOString();

const PUBLISHED = {
  capturedAt: CAPTURED,
  book: 'sportybet',
  format: 'compact',
  fields: ['event', 'eventId', 'sport', 'competition', 'startsAt', 'market',
    'marketKey', 'rulesKey', 'way', 'outcome', 'label', 'odds', 'priceMovedAt'],
  words: ['Arsenal v Chelsea', 'sb:match:4242', 'Football', 'Premier League',
    '2026-10-31T15:00:00.000Z', '1X2', 'match-result-1x2', 'home', 'Arsenal'],
  rows: [
    [0, 1, 2, 3, 4, 5, 6, 6, 3, 7, 8, 1.85, 1793023714551],
    [0, 1, 2, 3, 4, 5, 6, 6, 3, 7, 8, 2.10, 1793023714551],
  ],
};

function fakeEnv(text) {
  return {
    ARB_SNAPSHOT_URL: 'https://example.invalid/prices',
  };
}

test('the published file is kept as text, not as prices', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(PUBLISHED),
  });
  try {
    const value = await readSnapshotBook(fakeEnv(), 'sportybet');
    assert.equal(value.capturedAt, PUBLISHED.capturedAt);
    assert.equal(typeof value.text, 'string');
    // the text is kept, and the prices are not
    assert.equal(value.quotes, undefined);
    assert.equal(value.entry, undefined);
  } finally {
    globalThis.fetch = original;
  }
});

test('the prices are made when a scan asks for them', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(PUBLISHED),
  });
  try {
    const result = await snapshotQuotes(fakeEnv(), 'sportybet');
    assert.equal(result.capturedAt, PUBLISHED.capturedAt);
    assert.equal(result.quotes.length, 2);
    assert.equal(result.quotes[0].event, 'Arsenal v Chelsea');
    assert.equal(result.quotes[0].bookmaker, 'sportybet');
    assert.equal(result.quotes[0].odds, 1.85);
    assert.equal(result.quotes[0].fetchedAt, PUBLISHED.capturedAt);
  } finally {
    globalThis.fetch = original;
  }
});

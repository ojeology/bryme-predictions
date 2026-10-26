/**
 * How old is a price, and when did the book last move it?
 *
 * A book that has not touched a price for a long time may have left it
 * behind, and a chance built on a price like that can be taken away the
 * moment the book wakes up.  These tests cover the arithmetic that decides
 * which leg of a chance is the one to check first.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  legFreshness,
  priceAgeSeconds,
  scanWithClusters,
} from '../src/lib/arbitrage.js';

const NOW = '2026-10-26T12:00:00.000Z';

test('a price with no stamp has no age', () => {
  assert.equal(priceAgeSeconds({}, new Date(NOW)), null);
  assert.equal(priceAgeSeconds({ priceMovedAt: null }, new Date(NOW)), null);
  assert.equal(priceAgeSeconds({ priceMovedAt: 'not a date' }, new Date(NOW)), null);
});

test('the age of a price is measured from the stamp the book gave', () => {
  const age = priceAgeSeconds({ priceMovedAt: '2026-10-26T11:30:00.000Z' }, new Date(NOW));
  assert.equal(age, 1800);
});

test('a price stamped in milliseconds is read the same way', () => {
  const age = priceAgeSeconds({ priceMovedAt: 1793009400000 }, new Date(NOW));
  assert.equal(typeof age, 'number');
  assert.ok(age >= 0);
});

test('a leg that moved long ago while the other moved just now is called out', () => {
  const freshness = legFreshness([
    { bookmaker: 'nairabet', priceMovedAt: '2026-10-26T11:55:00.000Z' },
    { bookmaker: 'sportybet', priceMovedAt: '2026-10-20T12:00:00.000Z' },
  ], new Date(NOW));
  assert.deepEqual(freshness.staleBookmakers, ['sportybet']);
  assert.equal(freshness.staleLegs.length, 1);
});

test('two prices that moved together are not called out', () => {
  const freshness = legFreshness([
    { bookmaker: 'nairabet', priceMovedAt: '2026-10-26T11:58:00.000Z' },
    { bookmaker: 'sportybet', priceMovedAt: '2026-10-26T11:59:00.000Z' },
  ], new Date(NOW));
  assert.deepEqual(freshness.staleBookmakers, []);
});

test('one book that says nothing about its prices is not treated as stale', () => {
  const freshness = legFreshness([
    { bookmaker: 'nairabet', priceMovedAt: null },
    { bookmaker: 'sportybet', priceMovedAt: '2026-10-20T12:00:00.000Z' },
  ], new Date(NOW));
  assert.deepEqual(freshness.staleBookmakers, []);
});

test('a chance carries the stamp of each leg so the phone can show it', () => {
  const quotes = [
    {
      event: 'Kaisar Kyzylorda v Zhenis Nur-Sultan',
      eventId: 'sr:match:1',
      sport: 'Football',
      competition: 'Kazakhstan Premier League',
      startsAt: '2026-10-31T10:00:00.000Z',
      market: 'Draw No Bet',
      marketKey: 'draw-no-bet',
      rules: 'If the teams draw, the selection will be voided.',
      rulesKey: 'draw-voided',
      way: 2,
      outcome: 'home',
      label: 'Home',
      bookmaker: 'nairabet',
      odds: 2.1,
      priceMovedAt: '2026-10-26T11:59:00.000Z',
      fetchedAt: NOW,
      normalised: true,
    },
    {
      event: 'Kaisar Kyzylorda v Zhenis Nur-Sultan',
      eventId: 'sr:match:1',
      sport: 'Football',
      competition: 'Kazakhstan Premier League',
      startsAt: '2026-10-31T10:00:00.000Z',
      market: 'Draw No Bet',
      marketKey: 'draw-no-bet',
      rules: 'If the teams draw, the selection will be voided.',
      rulesKey: 'draw-voided',
      way: 2,
      outcome: 'away',
      label: 'Away',
      bookmaker: 'sportybet',
      odds: 2.15,
      priceMovedAt: '2026-10-18T09:00:00.000Z',
      fetchedAt: NOW,
      normalised: true,
    },
  ];
  const { opportunities } = scanWithClusters(quotes, { now: new Date(NOW) });
  assert.equal(opportunities.length, 1);
  const chance = opportunities[0];
  assert.deepEqual(chance.staleBookmakers, ['sportybet']);
  const sportybetLeg = chance.legs.find((leg) => leg.bookmaker === 'sportybet');
  assert.equal(sportybetLeg.priceMovedAt, '2026-10-18T09:00:00.000Z');
});

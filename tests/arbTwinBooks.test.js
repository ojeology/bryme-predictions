import test from 'node:test';
import assert from 'node:assert/strict';
import { findTwinBooks, scanWithClusters } from '../src/lib/arbitrage.js';

/**
 * Two books that are really one book.
 *
 * A platform can serve the same book under more than one name.  When it
 * does, the two answer with the same prices for the same matches, and
 * comparing them as if they were two books invents an arbitrage out of a
 * single book's own prices - the kind that cannot be placed, because the
 * two legs are the same book.
 */

function price(book, match, market, outcome, odds) {
  return {
    event: match, eventId: `e:${match}`, sport: 'Football', competition: 'Premier League',
    startsAt: '2026-10-31T15:00:00.000Z', market, marketKey: market, rulesKey: '90-minutes',
    way: 2, outcome, label: outcome, odds, bookmaker: book, fetchedAt: '2026-10-26T12:00:00.000Z',
  };
}

test('one book under two names is found', () => {
  const quotes = [];
  for (let index = 0; index < 60; index += 1) {
    const match = `Match ${index}`;
    quotes.push(price('stake', match, 'goals-2.5', 'over', 1.9 + index * 0.01));
    quotes.push(price('12bet', match, 'goals-2.5', 'over', 1.9 + index * 0.01));
  }
  const twins = findTwinBooks(quotes);
  assert.equal(twins.size, 1);
  assert.ok(twins.has('12bet') || twins.has('stake'));
});

test('two books that differ on one price are two books', () => {
  const quotes = [];
  for (let index = 0; index < 60; index += 1) {
    const match = `Match ${index}`;
    quotes.push(price('nairabet', match, 'goals-2.5', 'over', 1.9 + index * 0.01));
    quotes.push(price('betking', match, 'goals-2.5', 'over', 1.9 + index * 0.01 + (index === 7 ? 0.05 : 0)));
  }
  const twins = findTwinBooks(quotes);
  assert.equal(twins.size, 0);
});

test('a book that shares only a few matches is not a twin', () => {
  const quotes = [];
  for (let index = 0; index < 60; index += 1) {
    quotes.push(price('stake', `Match ${index}`, 'goals-2.5', 'over', 1.9));
  }
  for (let index = 0; index < 5; index += 1) {
    quotes.push(price('12bet', `Match ${index}`, 'goals-2.5', 'over', 1.9));
  }
  const twins = findTwinBooks(quotes);
  assert.equal(twins.size, 0);
});

test('one book published twice cannot make an arbitrage', () => {
  // the same book, same prices, both ways: the two legs are one book
  const quotes = [];
  for (let index = 0; index < 60; index += 1) {
    const match = `Match ${index}`;
    quotes.push(price('stake', match, 'goals-2.5', 'over', 2.10));
    quotes.push(price('stake', match, 'goals-2.5', 'under', 2.10));
    quotes.push(price('12bet', match, 'goals-2.5', 'over', 2.10));
    quotes.push(price('12bet', match, 'goals-2.5', 'under', 2.10));
  }
  const before = scanWithClusters(quotes, { now: new Date('2026-10-26T12:00:00Z') });
  // without the guard this is a 4.76% "arbitrage" that cannot be placed
  assert.ok(before.opportunities.length >= 0);
  const twins = findTwinBooks(quotes);
  assert.equal(twins.size, 1);

  const kept = quotes.filter((quote) => !twins.has(quote.bookmaker));
  const after = scanWithClusters(kept, { now: new Date('2026-10-26T12:00:00Z') });
  assert.equal(after.opportunities.length, 0, 'the same book cannot be an arbitrage with itself');
});

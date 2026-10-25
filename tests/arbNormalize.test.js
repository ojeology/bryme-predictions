import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenBookPayload, canonicalMarketKey, canonicalOutcome, deriveRules, marketSummary } from '../arb/connectors/normalize.js';
import { scanOpportunities } from '../src/lib/arbitrage.js';

const START = '2026-10-26T14:00:00.000Z';
const FETCHED = '2026-10-25T13:00:00.000Z';
const NOW = '2026-10-25T13:00:00.000Z';

test('the same market described two ways lines up', () => {
  // one book says "Over 2.5" and calls it total_goals; the other says "Total 2.5 goals"
  assert.equal(canonicalMarketKey('Over 2.5', 'total_goals'), canonicalMarketKey('Total 2.5 goals'));
  assert.equal(canonicalMarketKey('Total 2.5 goals'), 'goals-2.5');
  assert.equal(canonicalMarketKey('Goals Over 2.5'), 'goals-2.5');
  assert.equal(canonicalMarketKey('Under 2.5 Goals'), 'goals-2.5');
  assert.equal(canonicalMarketKey('Over 1.5'), 'over-1.5');
  assert.equal(canonicalMarketKey('Over 1.5', '', 'goals'), 'goals-1.5');
  assert.equal(canonicalMarketKey('1X2'), 'match-result-1x2');
  assert.equal(canonicalMarketKey('Match Result'), 'match-result-1x2');
  // different lines must never collide
  assert.notEqual(canonicalMarketKey('Over 2.5', 'total_goals'), canonicalMarketKey('Over 3.5', 'total_goals'));
});

test('a book that only says "Over 2.5" needs a declared family', () => {
  // without a declared family an unknown market is left alone rather than guessed
  assert.notEqual(canonicalMarketKey('Over 2.5'), 'goals-2.5');
  // with one, it lines up with the other book
  assert.equal(canonicalMarketKey('Over 2.5', '', 'goals'), canonicalMarketKey('Total 2.5 goals'));
});

test('outcome wording is canonicalised', () => {
  assert.equal(canonicalOutcome('Home'), 'home');
  assert.equal(canonicalOutcome('1'), 'home');
  assert.equal(canonicalOutcome('Home Win'), 'home');
  assert.equal(canonicalOutcome('Draw'), 'draw');
  assert.equal(canonicalOutcome('X'), 'draw');
  assert.equal(canonicalOutcome('Away'), 'away');
  assert.equal(canonicalOutcome('Over'), 'over');
  assert.equal(canonicalOutcome('Under'), 'under');
});

test('settlement rules come from the wording, otherwise the book default', () => {
  assert.equal(deriveRules('Over 2.5 goals including overtime'), 'overtime-included');
  assert.equal(deriveRules('Match Result 90 minutes'), '90-minutes');
  assert.equal(deriveRules('Half Time Result'), 'half-time');
  assert.equal(deriveRules('Over 2.5 goals', '90-minutes'), '90-minutes');
  assert.equal(deriveRules('Over 2.5 goals', 'unspecified'), 'unspecified');
});

test('a nested sportsbook payload is flattened into quotes', () => {
  const payload = {
    leagues: [{
      name: 'Premier League',
      sport: 'Football',
      events: [{
        id: 'evt-1',
        name: 'Manchester United v AFC Bournemouth',
        startTime: START,
        markets: [{
          key: 'total_goals',
          name: 'Over 2.5',
          selections: [
            { name: 'Over 2.5', odds: 2.05 },
            { name: 'Under 2.5', odds: 1.85 },
          ],
        }],
      }],
    }],
  };
  const quotes = flattenBookPayload(payload, { bookmaker: 'sportybet', defaultRules: '90-minutes', now: FETCHED });
  assert.equal(quotes.length, 2);
  assert.equal(quotes[0].marketKey, 'goals-2.5');
  assert.equal(quotes[0].rules, '90-minutes');
  assert.equal(quotes[0].event, 'Manchester United v AFC Bournemouth');
  assert.equal(quotes[0].fetchedAt, FETCHED);
  const summary = marketSummary(quotes);
  assert.equal(summary.length, 1);
  assert.equal(summary[0].ways, 2);
});

test('a flat payload from a second book pairs with the first book', () => {
  const bookA = {
    leagues: [{
      name: 'Premier League', sport: 'Football',
      events: [{
        id: 'evt-1', name: 'Manchester United v AFC Bournemouth', startTime: START,
        markets: [{ key: 'total_goals', name: 'Over 2.5', selections: [
          { name: 'Over 2.5', odds: 2.05 }, { name: 'Under 2.5', odds: 1.85 }] }],
      }],
    }],
  };
  // same market, different wording, different team names, kick-off a minute apart
  const bookB = [{
    event: 'Man Utd vs Bournemouth',
    market: 'Total 2.5 goals',
    outcome: 'Over',
    odds: 2.25,
    startsAt: '2026-10-26T14:01:00.000Z',
    fetchedAt: FETCHED,
  }, {
    event: 'Man Utd vs Bournemouth',
    market: 'Total 2.5 goals',
    outcome: 'Under',
    odds: 1.90,
    startsAt: '2026-10-26T14:01:00.000Z',
    fetchedAt: FETCHED,
  }];

  const quotesA = flattenBookPayload(bookA, { bookmaker: 'sportybet', defaultRules: '90-minutes', now: FETCHED });
  const quotesB = flattenBookPayload(bookB, { bookmaker: '22bet', defaultRules: '90-minutes', now: FETCHED });
  assert.equal(quotesA.length, 2);
  assert.equal(quotesB.length, 2);
  // the two books agree on the market key despite the wording
  assert.equal(quotesA[0].marketKey, quotesB[0].marketKey);
  assert.equal(quotesA[0].rulesKey, quotesB[0].rulesKey);

  const found = scanOpportunities([...quotesA, ...quotesB], { now: NOW, totalStake: 100000, rounding: 100 });
  assert.equal(found.length, 1, 'the two books should be paired into one opportunity');
  assert.equal(found[0].legs.length, 2);
  assert.equal(new Set(found[0].legs.map((l) => l.bookmaker)).size, 2);
  assert.ok(found[0].theoreticalRoiPct > 0);
});

test('two books quoting the same market with the same wording are NOT an arbitrage', () => {
  const payload = [
    { event: 'Alpha v Beta', market: 'Over 2.5', outcome: 'Over', odds: 2.0, startsAt: START, fetchedAt: FETCHED },
    { event: 'Alpha v Beta', market: 'Over 2.5', outcome: 'Under', odds: 2.0, startsAt: START, fetchedAt: FETCHED },
  ];
  const quotes = flattenBookPayload(payload, { bookmaker: 'sportybet', now: FETCHED });
  const found = scanOpportunities(quotes, { now: NOW });
  assert.equal(found.length, 0);
});

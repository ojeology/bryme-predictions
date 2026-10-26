import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenNairaBet, isNairaBet } from '../arb/connectors/nairabet.js';
import { normalizeQuote } from '../src/lib/arbitrage.js';

/** A small stand-in for the platform's price tree. */
const PAYLOAD = {
  events: [
    {
      id: 17668279,
      extId: 'fp32_ar:match:679953',
      name: 'Chelsea vs. Manchester United',
      startDate: '2026-10-31T12:30:00Z',
      competitorIds: [43700, 43704],
      champId: 2936,
      catId: 497,
      sportId: 66,
      status: 0,
      marketIds: [101, 102, 103, 104, 105],
    },
  ],
  competitors: [
    { id: 43700, name: 'Chelsea', abbreviation: 'CHE' },
    { id: 43704, name: 'Manchester United', abbreviation: 'MUN' },
  ],
  champs: [{ id: 2936, name: 'Premier League' }],
  categories: [{ id: 497, name: 'England', champIds: [2936] }],
  markets: [
    { id: 101, name: '1x2', typeId: 1, sportMarketId: 70472, oddIds: [201, 202, 203] },
    { id: 102, name: 'Total', typeId: 18, sportMarketId: 70520, oddIds: [204, 205] },
    { id: 103, name: 'Both Teams To Score', typeId: 29, sportMarketId: 70545, oddIds: [206, 207] },
    { id: 104, name: 'Double chance', typeId: 10, sportMarketId: 70495, oddIds: [208, 209, 210] },
    { id: 105, name: 'Draw no bet', typeId: 11, sportMarketId: 70500, oddIds: [211, 212] },
  ],
  odds: [
    { id: 201, typeId: 1, price: 2.1, name: 'Chelsea', oddStatus: 0, isMB: false },
    { id: 202, typeId: 2, price: 3.3, name: 'X', oddStatus: 0, isMB: false },
    { id: 203, typeId: 3, price: 3.6, name: 'Manchester United', oddStatus: 0, isMB: false },
    { id: 204, typeId: 12, price: 1.8, name: 'Over 2.5', oddStatus: 0, isMB: true },
    { id: 205, typeId: 13, price: 2.0, name: 'Under 2.5', oddStatus: 0, isMB: true },
    { id: 206, typeId: 74, price: 1.75, name: 'Yes', oddStatus: 0, isMB: false },
    { id: 207, typeId: 76, name: 'No', price: 2.05, oddStatus: 0, isMB: false },
    { id: 208, typeId: 9, price: 1.25, name: 'Chelsea or draw', oddStatus: 0, isMB: false },
    { id: 209, typeId: 10, price: 1.27, name: 'Chelsea or Manchester United', oddStatus: 0, isMB: false },
    { id: 210, typeId: 11, price: 1.82, name: 'Draw or Manchester United', oddStatus: 0, isMB: false },
    { id: 211, typeId: 1, price: 1.4, name: 'Chelsea', oddStatus: 0, isMB: false },
    { id: 212, typeId: 3, price: 2.75, name: 'Manchester United', oddStatus: 0, isMB: false },
  ],
};

test('the NairaBet tree is recognised', () => {
  assert.equal(isNairaBet(PAYLOAD), true);
  assert.equal(isNairaBet({ events: [] }), false);
  assert.equal(isNairaBet(null), false);
});

test('the match, its league and its kick-off come through', () => {
  const quotes = flattenNairaBet(PAYLOAD, { bookmaker: 'nairabet', now: '2026-10-26T08:00:00Z' });
  assert.ok(quotes.length);
  for (const quote of quotes) {
    assert.equal(quote.event, 'Chelsea v Manchester United');
    assert.equal(quote.competition, 'Premier League');
    assert.equal(quote.startsAt, '2026-10-31T12:30:00Z');
    assert.equal(quote.bookmaker, 'nairabet');
    assert.equal(quote.rulesKey, '90-minutes');
  }
});

test('the prices land on the market keys the other books use', () => {
  const quotes = flattenNairaBet(PAYLOAD, { bookmaker: 'nairabet' });
  const byKey = {};
  for (const quote of quotes) {
    byKey[quote.marketKey] = byKey[quote.marketKey] || [];
    byKey[quote.marketKey].push(quote);
  }
  assert.deepEqual(Object.keys(byKey).sort(), [
    'both-teams-to-score', 'double-chance', 'draw-no-bet', 'match-result-1x2',
  ]);

  const oneXtwo = byKey['match-result-1x2'];
  assert.equal(oneXtwo.length, 3);
  assert.deepEqual(oneXtwo.map((q) => q.outcome).sort(), ['away', 'draw', 'home']);
  assert.equal(oneXtwo.find((q) => q.outcome === 'home').odds, 2.1);

  const btts = byKey['both-teams-to-score'];
  assert.deepEqual(btts.map((q) => q.outcome).sort(), ['no', 'yes']);

  const dnb = byKey['draw-no-bet'];
  assert.deepEqual(dnb.map((q) => q.outcome).sort(), ['away', 'home']);
});

test('a money-back price is left out, because it settles differently', () => {
  const quotes = flattenNairaBet(PAYLOAD, { bookmaker: 'nairabet' });
  assert.equal(quotes.some((quote) => quote.marketKey.startsWith('goals-')), false);
});

test('a suspended price is left out', () => {
  const closed = JSON.parse(JSON.stringify(PAYLOAD));
  closed.odds[0].oddStatus = 7;
  closed.odds[0].price = 0;
  const quotes = flattenNairaBet(closed, { bookmaker: 'nairabet' });
  assert.equal(quotes.some((quote) => quote.outcome === 'home' && quote.marketKey === 'match-result-1x2'), false);
});

test('every price the scanner keeps is one it can use', () => {
  const quotes = flattenNairaBet(PAYLOAD, { bookmaker: 'nairabet' });
  for (const quote of quotes) {
    const normalized = normalizeQuote(quote);
    assert.ok(normalized.odds > 1);
    assert.notEqual(normalized.rulesKey, 'unspecified');
    assert.ok(normalized.outcome);
    assert.ok(normalized.event);
  }
});

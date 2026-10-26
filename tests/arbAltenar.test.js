/**
 * The books on the Altenar/SB widget platform.
 *
 * The platform gives each book its own token, and with that token the same
 * endpoint answers with that book's own events and its own numbers.  These
 * tests cover the two things that are easy to get wrong: choosing the right
 * 1x2 market for a match, and keeping one match from carrying two 1x2
 * prices.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { ALTENAR_BOOKS, flattenNairaBet } from '../arb/connectors/nairabet.js';

/**
 * A small price tree in the shape the platform answers with.
 *
 * @param {object} options the markets each match should carry
 */
function tree(options = {}) {
  const competitors = [
    { id: 1, name: 'Chelsea' },
    { id: 2, name: 'Manchester United' },
  ];
  const champs = [{ id: 5, name: 'Premier League' }];
  const events = [];
  const markets = [];
  const odds = [];
  let nextMarket = 100;
  let nextOdd = 500;
  for (const event of options.events || []) {
    const marketIds = [];
    for (const market of event.markets || []) {
      const marketId = nextMarket++;
      marketIds.push(marketId);
      const oddIds = [];
      for (const odd of market.odds || []) {
        const oddId = nextOdd++;
        oddIds.push(oddId);
        odds.push({ id: oddId, typeId: odd.typeId, price: odd.price, isMB: !!odd.isMB, oddStatus: 0, competitorId: odd.competitorId, name: odd.name });
      }
      markets.push({ id: marketId, typeId: market.typeId, name: market.name, oddIds });
    }
    events.push({
      id: nextMarket,
      extId: event.extId || 'fp32_ar:match:1',
      name: event.name || 'Chelsea vs. Manchester United',
      startDate: '2026-10-31T12:30:00Z',
      champId: 5,
      competitorIds: [1, 2],
      marketIds,
    });
  }
  return { events, markets, odds, competitors, champs };
}

const HOME = { typeId: 1, price: 1.91, competitorId: 1, name: 'Chelsea' };
const DRAW = { typeId: 2, price: 3.96, competitorId: 0, name: 'X' };
const AWAY = { typeId: 3, price: 3.92, competitorId: 2, name: 'Manchester United' };

test('a match with the plain 1x2 is read', () => {
  const payload = tree({
    events: [{ markets: [{ typeId: 1, name: '1x2', odds: [HOME, DRAW, AWAY] }] }],
  });
  const quotes = flattenNairaBet(payload, { bookmaker: 'nairabet' });
  const oneXTwo = quotes.filter((quote) => quote.marketKey === 'match-result-1x2');
  assert.equal(oneXTwo.length, 3);
  assert.equal(oneXTwo.find((quote) => quote.outcome === 'home').odds, 1.91);
});

test('a match with only the better-priced 1x2 is read too', () => {
  // 223 of NairaBet's matches are listed with no plain 1x2 at all, and
  // leaving them out took their 1x2 prices away
  const payload = tree({
    events: [{ markets: [{ typeId: 1, name: '1x2 - Enhanced Prices', odds: [HOME, DRAW, AWAY] }] }],
  });
  const quotes = flattenNairaBet(payload, { bookmaker: 'nairabet' });
  const oneXTwo = quotes.filter((quote) => quote.marketKey === 'match-result-1x2');
  assert.equal(oneXTwo.length, 3);
  assert.equal(oneXTwo.find((quote) => quote.outcome === 'away').odds, 3.92);
});

test('a match with both 1x2 markets carries only one set of prices', () => {
  const payload = tree({
    events: [{
      markets: [
        { typeId: 1, name: '1x2', odds: [HOME, DRAW, AWAY] },
        { typeId: 1, name: '1x2 - Enhanced Prices', odds: [
          { ...HOME, price: 2.5 }, { ...DRAW, price: 4.5 }, { ...AWAY, price: 4.5 },
        ] },
      ],
    }],
  });
  const quotes = flattenNairaBet(payload, { bookmaker: 'nairabet' });
  const oneXTwo = quotes.filter((quote) => quote.marketKey === 'match-result-1x2');
  assert.equal(oneXTwo.length, 3);
  // the plain market is the one that is used
  assert.equal(oneXTwo.find((quote) => quote.outcome === 'home').odds, 1.91);
});

test('a market with a different rule is left alone', () => {
  const payload = tree({
    events: [{ markets: [{ typeId: 1, name: '1x2 0%', odds: [HOME, DRAW, AWAY] }] }],
  });
  const quotes = flattenNairaBet(payload, { bookmaker: 'nairabet' });
  assert.equal(quotes.filter((quote) => quote.marketKey === 'match-result-1x2').length, 0);
});

test('a money-back price is left out', () => {
  const payload = tree({
    events: [{ markets: [{ typeId: 1, name: '1x2', odds: [HOME, { ...DRAW, isMB: true }, AWAY] }] }],
  });
  const quotes = flattenNairaBet(payload, { bookmaker: 'nairabet' });
  assert.equal(quotes.filter((quote) => quote.marketKey === 'match-result-1x2').length, 2);
});

test('a closed price is left out', () => {
  const payload = tree({
    events: [{ markets: [{ typeId: 1, name: '1x2', odds: [HOME, DRAW, AWAY] }] }],
  });
  payload.odds[0].oddStatus = 1;
  const quotes = flattenNairaBet(payload, { bookmaker: 'nairabet' });
  assert.equal(quotes.filter((quote) => quote.marketKey === 'match-result-1x2').length, 2);
});

test('each book on the platform has its own token', () => {
  for (const [id, definition] of Object.entries(ALTENAR_BOOKS)) {
    assert.equal(definition.token, id);
    assert.ok(definition.label);
  }
  assert.ok(ALTENAR_BOOKS.nairabet);
  assert.ok(ALTENAR_BOOKS.betking);
  assert.ok(ALTENAR_BOOKS.jackpotbet);
});

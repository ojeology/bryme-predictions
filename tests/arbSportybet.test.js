import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenBookPayload } from '../arb/connectors/normalize.js';
import { isSportyBet, flattenSportyBet } from '../arb/connectors/sportybet.js';
import { KNOWN_FEEDS, candidatesForRound } from '../arb/discovery.js';

const PAYLOAD = {
  bizCode: 10000,
  data: [
    {
      id: 'sr:tournament:37',
      name: 'Eredivisie',
      events: [
        {
          eventId: 'sr:match:72041210',
          estimateStartTime: Date.now() + 3600_000,
          homeTeamName: 'Alkmaar',
          awayTeamName: 'FC Twente Enschede',
          sport: { name: 'Football' },
          markets: [
            {
              id: '1', name: '1X2', desc: '1X2', group: 'Main',
              marketGuide: 'Which team will win the match. Overtime not included.',
              outcomes: [
                { id: '1', odds: '2.39', desc: 'Home', isActive: 1 },
                { id: '2', odds: '3.90', desc: 'Draw', isActive: 1 },
                { id: '3', odds: '2.82', desc: 'Away', isActive: 1 },
              ],
            },
            {
              id: '4', name: 'Over/Under', desc: 'Over/Under', group: 'Main',
              outcomes: [
                { id: '1', odds: '1.52', desc: 'Over 2.5', isActive: 1 },
                { id: '2', odds: '2.30', desc: 'Under 2.5', isActive: 1 },
              ],
            },
            {
              id: '9', name: 'Player Goals', desc: 'Player goals (incl. overtime)', group: 'Players',
              outcomes: [{ id: '1', odds: '4.10', desc: 'Player A', isActive: 1 }],
            },
          ],
        },
      ],
    },
  ],
};

test('a SportyBet price tree is recognised', () => {
  assert.equal(isSportyBet(PAYLOAD), true);
  assert.equal(isSportyBet({ quotes: [] }), false);
  assert.equal(isSportyBet(null), false);
});

test('SportyBet prices become comparable quotes', () => {
  const quotes = flattenBookPayload(PAYLOAD, { bookmaker: 'sportybet', defaultRules: 'unspecified' });
  assert.equal(quotes.length, 5);
  const oneXtwo = quotes.filter((quote) => quote.marketKey === 'match-result-1x2');
  assert.equal(oneXtwo.length, 3);
  assert.deepEqual(oneXtwo.map((quote) => quote.outcome), ['home', 'draw', 'away']);
  assert.equal(oneXtwo[0].event, 'Alkmaar v FC Twente Enschede');
  assert.equal(oneXtwo[0].rulesKey, '90-minutes');
  assert.equal(oneXtwo[0].odds, 2.39);
  assert.equal(oneXtwo[0].competition, 'Eredivisie');
});

test('a SportyBet goal line keeps its line and its direction', () => {
  const quotes = flattenSportyBet(PAYLOAD, { bookmaker: 'sportybet' });
  const over = quotes.find((quote) => quote.marketKey === 'goals-2.5');
  assert.equal(over.outcome, 'over');
  assert.equal(over.odds, 1.52);
  assert.equal(over.rulesKey, '90-minutes');
  assert.equal(quotes.find((quote) => quote.marketKey === 'goals-2.5' && quote.outcome === 'under').odds, 2.30);
});

test('a market that settles differently from book to book is left out', () => {
  const quotes = flattenSportyBet(PAYLOAD, { bookmaker: 'sportybet' });
  assert.equal(quotes.some((quote) => /player/i.test(quote.market)), false);
});

test('a suspended price is never quoted', () => {
  const suspended = JSON.parse(JSON.stringify(PAYLOAD));
  suspended.data[0].events[0].markets[0].outcomes[0].isActive = 0;
  const quotes = flattenSportyBet(suspended, { bookmaker: 'sportybet' });
  assert.equal(quotes.filter((quote) => quote.marketKey === 'match-result-1x2').length, 2);
});

test('every quote has a rule the scanner can compare', () => {
  const quotes = flattenSportyBet(PAYLOAD, { bookmaker: 'sportybet' });
  assert.equal(quotes.every((quote) => quote.rulesKey && quote.rulesKey !== 'unspecified'), true);
  assert.equal(quotes.every((quote) => quote.odds > 1), true);
});

test('the discovery rounds split the candidates so no request is too big', () => {
  for (const book of Object.keys(KNOWN_FEEDS)) {
    const first = candidatesForRound(book, 1);
    const second = candidatesForRound(book, 2);
    assert.equal(first.length + second.length, KNOWN_FEEDS[book].length);
    assert.equal(new Set([...first, ...second]).size, KNOWN_FEEDS[book].length);
    assert.ok(first.length <= 8);
    assert.ok(second.length <= 8);
  }
});

test('SportyBet is looked for on the address the book proved', () => {
  assert.ok(KNOWN_FEEDS.sportybet.some((url) => url.includes('/api/ng/factsCenter/importantEvents')));
});

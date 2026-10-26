import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenSportyBet } from '../arb/connectors/sportybet.js';
import { flattenNairaBet } from '../arb/connectors/nairabet.js';
import { flattenMsport } from '../arb/connectors/msport.js';
import { normalizeQuote } from '../src/lib/arbitrage.js';

/**
 * The Draw No Bet market: a draw does not settle it, the stake comes back.
 *
 * SportyBet had the market all along and the reader was throwing it away.
 * It is only worth reading if both sides of the market are read the same
 * way, so the wording of the rule has to be the same in every book: one
 * book says "90-minutes" and another says "the draw is voided" and the two
 * prices are not the same market.
 */

/** A stand-in for one SportyBet event with a draw-no-bet market on it. */
const SPORTYBET = {
  data: [
    {
      name: 'Premier League',
      events: [
        {
          eventId: 'sb:match:9911',
          homeTeamName: 'Arsenal',
          awayTeamName: 'Chelsea',
          estimateStartTime: Date.parse('2026-10-31T15:00:00Z'),
          sport: { name: 'Football' },
          markets: [
            {
              id: '11',
              name: 'Draw No Bet',
              marketGuide: 'Predict the winner of the match. If the teams draw, the selection will be voided.',
              outcomes: [
                { id: '4', desc: 'Home', odds: '1.39', isActive: 1 },
                { id: '5', desc: 'Away', odds: '3.00', isActive: 1 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** A stand-in for the same market at NairaBet. */
const NAIRABET = {
  events: [
    {
      id: 1,
      extId: 'fp32_ar:match:9911',
      name: 'Arsenal vs. Chelsea',
      startDate: '2026-10-31T15:00:00Z',
      competitorIds: [10, 20],
      champId: 1,
      catId: 2,
      sportId: 66,
      status: 0,
      marketIds: [50],
    },
  ],
  competitors: [
    { id: 10, name: 'Arsenal' },
    { id: 20, name: 'Chelsea' },
  ],
  champs: [{ id: 1, name: 'Premier League' }],
  categories: [{ id: 2, name: 'England', champIds: [1] }],
  markets: [
    { id: 50, name: 'Draw no bet', typeId: 11, oddIds: [60, 61] },
  ],
  odds: [
    { id: 60, typeId: 1, price: 1.42, name: 'Arsenal', oddStatus: 0 },
    { id: 61, typeId: 3, price: 2.95, name: 'Chelsea', oddStatus: 0 },
  ],
};

test('SportyBet reads the draw-no-bet market', () => {
  const quotes = flattenSportyBet(SPORTYBET, { bookmaker: 'sportybet' });
  assert.equal(quotes.length, 2);
  for (const quote of quotes) {
    assert.equal(quote.marketKey, 'draw-no-bet');
    assert.equal(quote.rules, 'draw-voided');
    assert.equal(quote.rulesKey, 'draw-voided');
    assert.equal(quote.way, 2);
  }
  assert.deepEqual(quotes.map((quote) => quote.outcome).sort(), ['away', 'home']);
});

test('the same market reads the same way at NairaBet and SportyBet', () => {
  const naira = flattenNairaBet(NAIRABET, { bookmaker: 'nairabet' });
  const sporty = flattenSportyBet(SPORTYBET, { bookmaker: 'sportybet' });
  assert.equal(naira.length, 2);
  assert.equal(sporty.length, 2);
  const nairaKeys = new Set(naira.map((quote) => quote.rulesKey));
  const sportyKeys = new Set(sporty.map((quote) => quote.rulesKey));
  assert.deepEqual([...nairaKeys], ['draw-voided']);
  assert.deepEqual([...sportyKeys], ['draw-voided']);

  // and the two sides of the market must land in the same group, or the
  // scanner will never compare them
  const normalised = [...naira, ...sporty].map((quote) => normalizeQuote(quote));
  const groups = new Set(normalised.map((quote) => `${quote.marketKey}|${quote.rulesKey}`));
  assert.deepEqual([...groups], ['draw-no-bet|draw-voided']);
});

test('a market whose rule is unclear is left alone', () => {
  const odd = {
    data: [
      {
        name: 'Some Cup',
        events: [
          {
            eventId: 'sb:match:1',
            homeTeamName: 'A',
            awayTeamName: 'B',
            estimateStartTime: Date.parse('2026-10-31T15:00:00Z'),
            sport: { name: 'Football' },
            markets: [
              {
                id: '99',
                name: 'Correct Score',
                outcomes: [{ id: '1', desc: '1-0', odds: '7.00', isActive: 1 }],
              },
            ],
          },
        ],
      },
    ],
  };
  assert.equal(flattenSportyBet(odd, { bookmaker: 'sportybet' }).length, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenBookPayload } from '../arb/connectors/normalize.js';
import { isMsport, flattenMsport } from '../arb/connectors/msport.js';
import { normalizeQuote } from '../src/lib/arbitrage.js';

/**
 * A cut-down copy of the shape MSport's own endpoint returns:
 *   POST /api/ng/facts-center/query/frontend/sports-matches-list?sportId=sr:sport:1&timeslot=Today
 */
function payload({ status = 0 } = {}) {
  return {
    bizCode: 10000,
    data: {
      tournaments: [
        {
          tournament: 'LaLiga',
          category: 'Spain',
          events: [
            {
              eventId: 'sr:match:71945344',
              homeTeam: 'Barcelona',
              awayTeam: 'Real Madrid',
              sport: 'Soccer',
              startTime: Date.now() + 3600_000,
              status,
              markets: [
                {
                  id: 1,
                  name: '1x2',
                  group: 'Main',
                  specifiers: '',
                  outcomes: [
                    { description: 'Home', odds: '1.62', isActive: 1 },
                    { description: 'Draw', odds: '6.06', isActive: 1 },
                    { description: 'Away', odds: '4.18', isActive: 1 },
                  ],
                },
                {
                  id: 5,
                  name: 'Over/Under',
                  group: 'Main',
                  specifiers: 'total=2.5',
                  outcomes: [
                    { description: 'Over 2.5', odds: '1.20', isActive: 1 },
                    { description: 'Under 2.5', odds: '4.77', isActive: 1 },
                  ],
                },
                {
                  id: 7,
                  name: 'GG/NG',
                  group: 'Main',
                  specifiers: '',
                  outcomes: [
                    { description: 'Yes', odds: '1.29', isActive: 1 },
                    { description: 'No', odds: '3.60', isActive: 1 },
                  ],
                },
                {
                  id: 9,
                  name: 'Double Chance',
                  group: 'Main',
                  specifiers: '',
                  outcomes: [
                    { description: '1 X', odds: '1.25', isActive: 1 },
                    { description: '1 2', odds: '1.16', isActive: 1 },
                    { description: 'X 2', odds: '2.25', isActive: 1 },
                  ],
                },
                {
                  id: 11,
                  name: 'Next Goal',
                  group: 'Main',
                  specifiers: 'goalnr=1',
                  outcomes: [{ description: 'Home', odds: '2.74', isActive: 1 }],
                },
                {
                  id: 11,
                  name: '1x2 - 1UP',
                  group: 'Main',
                  specifiers: '',
                  outcomes: [
                    { description: 'Home', odds: '2.48', isActive: 1 },
                    { description: 'Draw', odds: '3.79', isActive: 1 },
                    { description: 'Away', odds: '1.41', isActive: 1 },
                  ],
                },
                {
                  id: 14,
                  name: 'Over/Under',
                  group: 'Main',
                  specifiers: 'total=3.5',
                  outcomes: [
                    { description: 'Over 3.5', odds: '3.90', isActive: 1 },
                    { description: 'Under 3.5', odds: '1.20', isActive: 0 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

test('MSport payloads are recognised', () => {
  assert.equal(isMsport(payload()), true);
  assert.equal(isMsport({ data: {} }), false);
  assert.equal(isMsport(null), false);
});

test('MSport prices become quotes with the same market keys as the other books', () => {
  const quotes = flattenMsport(payload(), { bookmaker: 'msport', now: '2026-10-25T19:00:00.000Z' });
  const byKey = new Map();
  for (const quote of quotes) byKey.set(`${quote.marketKey}|${quote.outcome}`, quote);

  assert.equal(byKey.get('match-result-1x2|home').odds, 1.62);
  assert.equal(byKey.get('match-result-1x2|draw').odds, 6.06);
  assert.equal(byKey.get('match-result-1x2|away').odds, 4.18);
  assert.equal(byKey.get('goals-2.5|over').odds, 1.20);
  assert.equal(byKey.get('goals-2.5|under').odds, 4.77);
  assert.equal(byKey.get('both-teams-to-score|yes').odds, 1.29);
  assert.equal(byKey.get('both-teams-to-score|no').odds, 3.60);

  const home = byKey.get('match-result-1x2|home');
  assert.equal(home.event, 'Barcelona v Real Madrid');
  assert.equal(home.eventId, 'sr:match:71945344');
  assert.equal(home.competition, 'LaLiga');
  assert.equal(home.bookmaker, 'msport');
  assert.equal(home.rules, '90-minutes');
  assert.equal(home.way, 3);
  // the book writes "Soccer"; every other book writes "Football"
  assert.equal(home.sport, 'Football');
});

test('MSport markets that settle differently are left out', () => {
  const quotes = flattenMsport(payload(), { bookmaker: 'msport' });
  assert.equal(quotes.some((quote) => quote.marketKey.startsWith('next-goal')), false);
  // "1x2 - 1UP" settles on a different rule, so it is left out
  assert.equal(quotes.filter((quote) => quote.market === '1X2').length, 3);
  // the book writes "1 X"; the shared normaliser turns that into the same
  // word every other book uses, so the two can be compared
  assert.equal(quotes.some((quote) => quote.outcome === '1x'), true);
  const normalised = normalizeQuote(quotes.find((quote) => quote.outcome === '1x'));
  assert.equal(normalised.outcome, 'home-or-draw');
  const fromOtherBook = normalizeQuote({
    bookmaker: 'livescorebet', event: 'Barcelona v Real Madrid', market: 'Double Chance',
    marketKey: 'double-chance', outcome: 'home-or-draw', odds: 1.21, rules: '90-minutes', way: 2,
  });
  assert.equal(fromOtherBook.outcome, normalised.outcome);
});

test('a suspended price is not offered', () => {
  const quotes = flattenMsport(payload(), { bookmaker: 'msport' });
  // the 3.5 line has its under price switched off
  const over35 = quotes.filter((quote) => quote.marketKey === 'goals-3.5');
  assert.equal(over35.length, 1);
  assert.equal(over35[0].outcome, 'over');
  assert.equal(over35[0].odds, 3.90);
});

test('a match that has started is left out', () => {
  const quotes = flattenMsport(payload({ status: 1 }), { bookmaker: 'msport' });
  assert.equal(quotes.length, 0);
});

test('the shared normaliser reads an MSport payload too', () => {
  const quotes = flattenBookPayload(payload(), { bookmaker: 'msport' });
  assert.equal(quotes.length, 11);
  assert.equal(quotes.every((quote) => quote.bookmaker === 'msport'), true);
});

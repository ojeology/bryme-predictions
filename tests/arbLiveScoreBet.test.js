import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenBookPayload } from '../arb/connectors/normalize.js';
import { isLiveScoreBet, flattenLiveScoreBet } from '../arb/connectors/livescorebet.js';
import { feedHeaders } from '../arb/connectors/feedHeaders.js';

const PAYLOAD = {
  header: { viewType: 'MatchesViewV3' },
  events: {
    categories: [
      {
        id: 'SBTC1_1',
        name: 'Football',
        childs: [
          {
            id: 'SBTC3_9916',
            name: 'Andorra - Super League',
            events: [
              {
                id: 'SBTE_2_1',
                name: 'FC Santa Coloma - Inter Club d Escalades',
                startTime: '2026-10-25 19:00:00',
                state: 'NOTSTARTED',
                participants: [
                  { name: 'FC Santa Coloma', venueRole: 'Home' },
                  { name: 'Inter Club d Escalades', venueRole: 'Away' },
                ],
                markets: [
                  {
                    name: 'Full Time', periodType: 'FT', marketKind: 'THREE_WAY',
                    selections: [
                      { name: 'FC Santa Coloma', odds: 2.88, suspended: false },
                      { name: 'Draw', odds: 3.15, suspended: false },
                      { name: 'Inter Club d Escalades', odds: 2.2, suspended: false },
                    ],
                  },
                  {
                    name: 'Total Goals', periodType: 'FT', marketKind: 'OVER_UNDER',
                    selections: [
                      { name: 'Over 2.5', odds: 1.68 },
                      { name: 'Under 2.5', odds: 2.05 },
                    ],
                  },
                  {
                    name: 'Both Teams To Score', periodType: 'FT',
                    selections: [{ name: 'Yes', odds: 1.58 }, { name: 'No', odds: 2.2 }],
                  },
                  {
                    name: 'Full Time - 2UP', periodType: 'FT',
                    selections: [{ name: 'FC Santa Coloma', odds: 2.7 }],
                  },
                  {
                    name: 'Total Goals - 1st Half', periodType: 'FH',
                    selections: [{ name: 'Over 1.5', odds: 2.38 }],
                  },
                ],
              },
              {
                id: 'SBTE_2_2', name: 'Live v Playing', startTime: '2026-10-25 18:00:00', state: 'INPLAY',
                participants: [{ name: 'Live', venueRole: 'Home' }, { name: 'Playing', venueRole: 'Away' }],
                markets: [{ name: 'Full Time', periodType: 'FT', selections: [{ name: 'Live', odds: 1.5 }] }],
              },
            ],
          },
        ],
      },
    ],
  },
};

test('a LiveScore Bet tree is recognised', () => {
  assert.equal(isLiveScoreBet(PAYLOAD), true);
  assert.equal(isLiveScoreBet({ quotes: [] }), false);
});

test('LiveScore Bet prices become comparable quotes', () => {
  const quotes = flattenBookPayload(PAYLOAD, { bookmaker: 'livescorebet', defaultRules: 'unspecified' });
  const oneXtwo = quotes.filter((quote) => quote.marketKey === 'match-result-1x2');
  assert.equal(oneXtwo.length, 3);
  assert.deepEqual(oneXtwo.map((quote) => quote.outcome), ['home', 'draw', 'away']);
  assert.equal(oneXtwo[0].event, 'FC Santa Coloma v Inter Club d Escalades');
  assert.equal(oneXtwo[0].rulesKey, '90-minutes');
  assert.equal(oneXtwo[0].startsAt, '2026-10-25T19:00:00.000Z');
  assert.equal(oneXtwo[0].competition, 'Andorra - Super League');
});

test('a goal line keeps its line and its direction', () => {
  const quotes = flattenLiveScoreBet(PAYLOAD, { bookmaker: 'livescorebet' });
  const over = quotes.find((quote) => quote.marketKey === 'goals-2.5' && quote.outcome === 'over');
  assert.equal(over.odds, 1.68);
  assert.equal(quotes.find((quote) => quote.marketKey === 'goals-2.5' && quote.outcome === 'under').odds, 2.05);
});

test('markets that settle differently are left out', () => {
  const quotes = flattenLiveScoreBet(PAYLOAD, { bookmaker: 'livescorebet' });
  assert.equal(quotes.some((quote) => /2UP/.test(quote.market)), false);
  assert.equal(quotes.some((quote) => /1st Half/.test(quote.market)), false);
});

test('a match already running is left out', () => {
  const quotes = flattenLiveScoreBet(PAYLOAD, { bookmaker: 'livescorebet' });
  assert.equal(quotes.some((quote) => quote.event.includes('Live v Playing')), false);
});

test('every quote has a rule the scanner can compare', () => {
  const quotes = flattenLiveScoreBet(PAYLOAD, { bookmaker: 'livescorebet' });
  assert.equal(quotes.every((quote) => quote.rulesKey && quote.rulesKey !== 'unspecified'), true);
});

test('the gateway is given the request id it asks for', () => {
  const headers = feedHeaders('https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/events/matches');
  assert.ok(headers['Request-Id']);
  assert.equal(Object.keys(feedHeaders('https://www.sportybet.com/api/ng/factsCenter/sportList')).length, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenBetking, isBetking } from '../arb/connectors/betking.js';
import { normalizeQuote } from '../src/lib/arbitrage.js';

function collection(marketName, entries) {
  return {
    OddCollectionID: 1,
    OddsType: { OddsTypeID: 110, OddsTypeName: marketName },
    MatchOdds: entries.map(([name, odd, code]) => ({
      SmartBetCode: code,
      OddAttribute: { OddTypeID: 4, OddName: name },
      Outcome: { OddOutcome: odd, ScheduleStatus: 0 },
    })),
  };
}

const PAYLOAD = [{
  AreaMatches: [{
    SportID: 1,
    SportName: 'Football',
    Area: { AreaID: 1, AreaName: 'General' },
    Items: [{
      ItemID: 1005499155,
      SmartBetCode: 499155,
      ItemName: 'Fleetwood - Arsenal',
      ItemDate: '2026-10-27T21:00:00+01:00',
      TournamentName: 'EFL Cup',
      CategoryName: 'England',
      OddsCollection: [
        collection('1X2', [['1', 19.0, 499155], ['X', 8.7, 499155], ['2', 1.11, 499155]]),
        collection('Double Chance', [['1X', 1.25, 499155], ['12', 1.05, 499155], ['X2', 1.3, 499155]]),
        collection('Total Goals 2.5', [['Over', 1.9, 499155], ['Under', 1.95, 499155]]),
        collection('GG/NG', [['GG', 1.8, 499155], ['NG', 2.0, 499155]]),
        collection('Draw No Bet', [['1 DNB', 1.4, 499155], ['2 DNB', 2.6, 499155]]),
        collection('1X2 - (1up)', [['1', 2.0, 499155], ['X', 3.0, 499155], ['2', 3.5, 499155]]),
      ],
    }],
  }],
}];

test('BetKing payload is recognised', () => {
  assert.equal(isBetking(PAYLOAD), true);
  assert.equal(isBetking({ data: {} }), false);
});

test('the untranslatable markets are left out', () => {
  const quotes = flattenBetking(PAYLOAD, { bookmaker: 'betking' });
  assert.equal(quotes.filter((q) => q.marketKey === 'match-result-1x2').length, 3);
  assert.equal(quotes.filter((q) => String(q.market).includes('1up')).length, 0);
});

test('the market keys match the other books', () => {
  const quotes = flattenBetking(PAYLOAD, { bookmaker: 'betking' });
  const keys = new Set(quotes.map((q) => `${q.marketKey}:${q.outcome}`));
  assert.ok(keys.has('match-result-1x2:home'));
  assert.ok(keys.has('match-result-1x2:draw'));
  assert.ok(keys.has('match-result-1x2:away'));
  assert.ok(keys.has('goals-2.5:over'));
  assert.ok(keys.has('goals-2.5:under'));
  assert.ok(keys.has('both-teams-to-score:yes'));
  assert.ok(keys.has('both-teams-to-score:no'));
  assert.ok(keys.has('draw-no-bet:home'));
  assert.ok(keys.has('draw-no-bet:away'));
});

test('double chance is worded the way the other books word it', () => {
  const quotes = flattenBetking(PAYLOAD, { bookmaker: 'betking' }).map((q) => normalizeQuote(q));
  const outcomes = quotes.filter((q) => q.marketKey === 'double-chance').map((q) => q.outcome);
  assert.deepEqual(outcomes.sort(), ['draw-or-away', 'home-or-away', 'home-or-draw']);
});

test('the fixture and the kick-off come through', () => {
  const quote = flattenBetking(PAYLOAD, { bookmaker: 'betking' })[0];
  assert.equal(quote.event, 'Fleetwood v Arsenal');
  assert.equal(quote.competition, 'EFL Cup');
  assert.equal(quote.sport, 'Football');
  assert.equal(quote.startsAt, new Date('2026-10-27T21:00:00+01:00').toISOString());
  assert.equal(quote.rulesKey, '90-minutes');
});

test('a price from another match is not attached to this one', () => {
  const mixed = JSON.parse(JSON.stringify(PAYLOAD));
  mixed[0].AreaMatches[0].Items[0].OddsCollection[0].MatchOdds.push({
    SmartBetCode: 999999,
    OddAttribute: { OddTypeID: 4, OddName: '1' },
    Outcome: { OddOutcome: 99.0, ScheduleStatus: 0 },
  });
  const quotes = flattenBetking(mixed, { bookmaker: 'betking' });
  assert.equal(quotes.filter((q) => q.odds === 99).length, 0);
});

test('a suspended price is refused', () => {
  const suspended = JSON.parse(JSON.stringify(PAYLOAD));
  suspended[0].AreaMatches[0].Items[0].OddsCollection[0].MatchOdds[0].Outcome.ScheduleStatus = 1;
  const quotes = flattenBetking(suspended, { bookmaker: 'betking' });
  assert.equal(quotes.filter((q) => q.marketKey === 'match-result-1x2').length, 2);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { packQuotes, expandRows, PUBLISH_FIELDS } from '../arb/connectors/published.js';
import { flattenSportyBet } from '../arb/connectors/sportybet.js';
import { normalizeQuote } from '../src/lib/arbitrage.js';

/**
 * The prices travel from the reader to the Worker as rows, not as objects.
 *
 * The point of the row form is that the Worker spends less time and memory
 * taking the prices in - it is the part of a scan that runs out of room
 * first.  The point that matters more is that the prices must come out the
 * other side exactly as they went in: the scanner must not be able to tell
 * which form it was given.
 */

const CAPTURED = '2026-10-26T12:00:00.000Z';

const SPORTYBET = {
  data: [
    {
      name: 'Premier League',
      events: [
        {
          eventId: 'sb:match:4242',
          homeTeamName: 'Arsenal',
          awayTeamName: 'Chelsea',
          estimateStartTime: Date.parse('2026-10-31T15:00:00Z'),
          sport: { name: 'Football' },
          markets: [
            {
              id: '1',
              name: '1X2',
              outcomes: [
                { id: '1', desc: 'Arsenal', odds: '1.85', isActive: 1 },
                { id: '2', desc: 'Draw', odds: '3.60', isActive: 1 },
                { id: '3', desc: 'Chelsea', odds: '4.20', isActive: 1 },
              ],
            },
            {
              id: '18',
              name: 'Over/Under',
              outcomes: [
                { id: '20', desc: 'Over 2.5', odds: '1.95', isActive: 1 },
                { id: '21', desc: 'Under 2.5', odds: '1.90', isActive: 1 },
              ],
            },
          ],
        },
      ],
    },
  ],
};

test('the prices survive the round trip unchanged', () => {
  const read = flattenSportyBet(SPORTYBET, { bookmaker: 'sportybet', now: CAPTURED });
  assert.ok(read.length > 0);
  const packed = packQuotes(read, 'sportybet', CAPTURED);
  const text = JSON.stringify(packed);
  const back = expandRows(JSON.parse(text), 'sportybet', CAPTURED);
  assert.equal(back.length, read.length);

  for (let index = 0; index < read.length; index += 1) {
    const before = normalizeQuote(read[index]);
    const after = back[index];
    for (const field of ['event', 'eventId', 'sport', 'competition', 'startsAt', 'market',
      'marketKey', 'rules', 'rulesKey', 'way', 'outcome', 'label', 'bookmaker', 'odds', 'fetchedAt']) {
      assert.deepEqual(after[field], before[field], `${field} differs at ${index}`);
    }
  }
});

test('the row form is smaller than the object form', () => {
  const read = flattenSportyBet(SPORTYBET, { bookmaker: 'sportybet', now: CAPTURED });
  const packed = packQuotes(read, 'sportybet', CAPTURED);
  const asRows = JSON.stringify(packed).length;
  const asObjects = JSON.stringify({
    capturedAt: CAPTURED,
    book: 'sportybet',
    quotes: read.map((quote) => ({ ...quote, bookmaker: 'sportybet', fetchedAt: CAPTURED })),
  }).length;
  assert.ok(asRows < asObjects, `rows ${asRows} should be smaller than objects ${asObjects}`);
});

test('a file written in another order is still read', () => {
  const read = flattenSportyBet(SPORTYBET, { bookmaker: 'sportybet', now: CAPTURED });
  const fields = [...PUBLISH_FIELDS].reverse();
  const rows = read.map((quote) => fields.map((field) => quote[field] ?? null));
  const back = expandRows({ fields, rows }, 'sportybet', CAPTURED);
  assert.equal(back.length, read.length);
  assert.equal(back[0].event, read[0].event);
  assert.equal(back[0].marketKey, read[0].marketKey);
  assert.equal(back[0].odds, read[0].odds);
  assert.equal(back[0].fetchedAt, CAPTURED);
});

test('the moment a book moved a price survives the journey', () => {
  // the stamp is a number of milliseconds, and it has to stay a number:
  // a string of digits is not a moment, and it was being thrown away
  const quote = {
    event: 'Arsenal v Chelsea',
    eventId: 'sb:match:4242',
    sport: 'Football',
    competition: 'Premier League',
    startsAt: '2026-10-31T15:00:00.000Z',
    market: '1X2',
    marketKey: 'match-result-1x2',
    rulesKey: 'match-result-1x2',
    way: 3,
    outcome: 'home',
    label: 'Arsenal',
    odds: 1.85,
    priceMovedAt: 1793023714551,
  };
  const packed = packQuotes([quote], 'sportybet', CAPTURED);
  assert.equal(packed.rows[0][12], 1793023714551);
  const back = expandRows(packed, 'sportybet', CAPTURED);
  assert.equal(back[0].priceMovedAt, 1793023714551);
});

test('a stamp given as text is still read as a moment', () => {
  const quote = {
    event: 'Arsenal v Chelsea',
    eventId: 'sb:match:4242',
    sport: 'Football',
    competition: 'Premier League',
    startsAt: '2026-10-31T15:00:00.000Z',
    market: '1X2',
    marketKey: 'match-result-1x2',
    rulesKey: 'match-result-1x2',
    way: 3,
    outcome: 'home',
    label: 'Arsenal',
    odds: 1.85,
    priceMovedAt: '2026-10-26T12:33:23.181Z',
  };
  const packed = packQuotes([quote], 'sportybet', CAPTURED);
  const back = expandRows(packed, 'sportybet', CAPTURED);
  assert.equal(back[0].priceMovedAt, Date.parse('2026-10-26T12:33:23.181Z'));
});

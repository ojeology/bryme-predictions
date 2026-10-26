import test from 'node:test';
import assert from 'node:assert/strict';
import { packQuotes, expandRows, PUBLISH_FIELDS, WORD_FIELDS } from '../arb/connectors/published.js';
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

test('a word is written once and numbered, so the file is much smaller', () => {
  // The same match, the same league and the same market are written over
  // and over - once for every price of every book.  Written out, every
  // price carried its own copy of every name, and the Worker ran out of
  // memory taking six books in at once.
  const quotes = [];
  for (let index = 0; index < 500; index += 1) {
    quotes.push({
      event: 'Arsenal v Chelsea',
      eventId: 'sb:match:4242',
      sport: 'Football',
      competition: 'Premier League',
      startsAt: '2026-10-31T15:00:00.000Z',
      market: '1X2',
      marketKey: 'match-result-1x2',
      rulesKey: 'match-result-1x2',
      way: 3,
      outcome: index % 3 === 0 ? 'home' : index % 3 === 1 ? 'draw' : 'away',
      label: 'Arsenal',
      odds: 1.85,
    });
  }
  const packed = packQuotes(quotes, 'sportybet', CAPTURED);
  assert.ok(Array.isArray(packed.words), 'the file should carry a list of words');
  assert.ok(packed.words.length < 30, `expected few words, got ${packed.words.length}`);
  // every word is a number in the rows
  for (const row of packed.rows) {
    assert.equal(typeof row[0], 'number', 'the match name should be a number');
    assert.equal(typeof row[10], 'number', 'the outcome should be a number');
    assert.equal(typeof row[11], 'number', 'the odds should still be a number');
  }
  const back = expandRows(packed, 'sportybet', CAPTURED);
  assert.equal(back.length, quotes.length);
  for (let index = 0; index < quotes.length; index += 1) {
    assert.equal(back[index].event, 'Arsenal v Chelsea');
    assert.equal(back[index].competition, 'Premier League');
    assert.equal(back[index].marketKey, 'match-result-1x2');
    assert.equal(back[index].startsAt, '2026-10-31T15:00:00.000Z');
    assert.equal(back[index].outcome, quotes[index].outcome);
    assert.equal(back[index].odds, quotes[index].odds);
  }
});

test('a file written before the words were numbered is still read', () => {
  // the reader publishes the new form, but a price file that was published
  // earlier is still out there, and it must still be read
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
  };
  const packed = packQuotes([quote], 'sportybet', CAPTURED);
  const old = { ...packed };
  delete old.words;
  for (const row of old.rows) {
    for (let index = 0; index < row.length; index += 1) {
      // only the words were numbered; the odds and the moment stay numbers
      if (WORD_FIELDS.has(PUBLISH_FIELDS[index])) row[index] = packed.words[row[index]];
    }
  }
  const back = expandRows(old, 'sportybet', CAPTURED);
  assert.equal(back.length, 1);
  assert.equal(back[0].event, 'Arsenal v Chelsea');
  assert.equal(back[0].odds, 1.85);
  assert.equal(back[0].outcome, 'home');
});

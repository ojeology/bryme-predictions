/**
 * The shape a book's prices are published in.
 *
 * The free reader writes the prices it read as rows rather than as
 * objects: the same prices travel in a third less space, and the Worker
 * spends less of its own time and memory taking them in.  That matters:
 * reading a full slate of five books is the part of a scan that runs out
 * of room first.
 *
 * Both sides of this file must agree on the order of the fields.
 */
import { bookmakerLabel } from '../../src/lib/arbitrage.js';

/**
 * The words a book writes, kept once and shared.
 *
 * A book sends tens of thousands of prices, and the same few thousand
 * names are written over and over: every price of a match carries the
 * match's name, its league and its market.  Read as they arrive, every
 * price carries its own copy of every name, and the Worker's memory runs
 * out before the scan does.  The names are kept once and shared instead.
 */
const stringPool = new Map();
const STRING_POOL_LIMIT = 20_000;

function intern(value) {
  if (value === null || value === undefined) return value;
  const text = String(value);
  const pooled = stringPool.get(text);
  if (pooled !== undefined) return pooled;
  if (stringPool.size < STRING_POOL_LIMIT) stringPool.set(text, text);
  return text;
}

export const PUBLISH_FIELDS = [
  'event', 'eventId', 'sport', 'competition', 'startsAt', 'market',
  'marketKey', 'rulesKey', 'way', 'outcome', 'label', 'odds', 'priceMovedAt',
];

/**
 * The fields of a price that are words rather than numbers.
 *
 * A word is written once in the file and numbered; the rows carry the
 * number.  A book sends tens of thousands of prices, and the same few
 * thousand names are written over and over - the name of the match, its
 * league, its market.  Written out, every price carried its own copy of
 * every name, and the Worker ran out of memory taking the prices in.
 */
export const WORD_FIELDS = new Set([
  'event', 'eventId', 'sport', 'competition', 'market', 'marketKey',
  'rulesKey', 'outcome', 'label', 'startsAt',
]);

/**
 * Pack a book's prices for publication.
 *
 * @param {object[]} quotes the prices, already in their final shape
 * @param {string} book which book they came from
 * @param {string} capturedAt the moment they were really read
 */
export function packQuotes(quotes, book, capturedAt) {
  const rows = [];
  const words = [];
  const wordNumbers = new Map();
  const numberOf = (value) => {
    const text = String(value);
    const known = wordNumbers.get(text);
    if (known !== undefined) return known;
    const number = words.length;
    words.push(text);
    wordNumbers.set(text, number);
    return number;
  };
  for (const quote of quotes || []) {
    const row = new Array(PUBLISH_FIELDS.length);
    for (let index = 0; index < PUBLISH_FIELDS.length; index += 1) {
      const field = PUBLISH_FIELDS[index];
      const value = quote[field];
      if (value === undefined) { row[index] = null; continue; }
      // the stamp is kept as a number of milliseconds: a row of prices is
      // written and read thousands of times a day, and four bytes of
      // digits are cheaper than twenty-four bytes of text
      if (field === 'priceMovedAt') {
        row[index] = stampToMillis(value);
        continue;
      }
      // a word is written once and numbered
      if (WORD_FIELDS.has(field)) {
        row[index] = value === null ? null : numberOf(value);
        continue;
      }
      row[index] = value;
    }
    rows.push(row);
  }
  return {
    capturedAt,
    book,
    format: 'compact',
    fields: PUBLISH_FIELDS,
    words,
    rows,
  };
}

/**
 * The moment a book last moved a price, as a number of milliseconds.
 *
 * The stamp travels as digits because a row of prices is written and read
 * thousands of times a day, and four bytes of digits are cheaper than
 * twenty-four bytes of text.  It stays as digits on this side too: turning
 * twenty thousand stamps into words cost the Worker more time and memory
 * than the whole of the rest of the scan.
 */
function stampToMillis(value) {
  if (value === null || value === undefined || value === '') return null;
  const millis = Number(value);
  if (Number.isFinite(millis) && millis > 0) return millis;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Take a published file of rows and make the prices out of them.
 *
 * The prices that come out are in the same shape as the ones the
 * normaliser makes, so the scanner cannot tell the difference.
 *
 * @param {object} entry the published file
 * @param {string} book which book the prices came from
 * @param {string} capturedAt the moment they were really read
 */
export function expandRows(entry, book, capturedAt) {
  const fields = Array.isArray(entry?.fields) ? entry.fields : [];
  const sameOrder = fields.length === PUBLISH_FIELDS.length
    && fields.every((field, index) => field === PUBLISH_FIELDS[index]);
  const label = bookmakerLabel(book);
  const quotes = [];
  const rows = Array.isArray(entry?.rows) ? entry.rows : [];
  // the words, each written once in the file
  const words = Array.isArray(entry?.words) ? entry.words : null;
  const wordOf = (value) => {
    if (words === null) return value;
    if (typeof value === 'number') return intern(words[value] ?? '');
    return value;
  };
  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    if (sameOrder) {
      const [event, eventId, sport, competition, startsAt, market, marketKey, rulesKey, way, outcome, outcomeLabel, odds, priceMovedAt] = row;
      quotes.push({
        event: intern(wordOf(event) ?? ''),
        eventId: intern(wordOf(eventId) ?? ''),
        sport: intern(wordOf(sport) ?? 'Football'),
        competition: intern(wordOf(competition) ?? ''),
        startsAt: intern(wordOf(startsAt) ?? null),
        market: intern(wordOf(market) ?? ''),
        marketKey: intern(wordOf(marketKey) ?? ''),
        rules: intern(wordOf(rulesKey) ?? 'unspecified'),
        rulesKey: intern(wordOf(rulesKey) ?? 'unspecified'),
        way: Number(way) || 2,
        outcome: intern(wordOf(outcome) ?? ''),
        label: intern(wordOf(outcomeLabel) ?? wordOf(outcome) ?? ''),
        bookmaker: book,
        bookmakerLabel: label,
        odds: Number(odds) || 0,
        minStake: null,
        url: '',
        // when the book last moved this price, if the book says
        priceMovedAt: stampToMillis(priceMovedAt),
        fetchedAt: capturedAt,
        // the prices came out of the reader already in this shape: there is
        // no need to build them a second time
        normalised: true,
      });
      continue;
    }
    // a file written in some other order is read the careful way
    const quote = {};
    for (let index = 0; index < fields.length; index += 1) {
      const field = fields[index];
      quote[field] = WORD_FIELDS.has(field) ? wordOf(row[index]) : row[index];
    }
    quote.bookmaker = book;
    quote.bookmakerLabel = label;
    quote.odds = Number(quote.odds) || 0;
    quote.way = Number(quote.way) || 2;
    quote.priceMovedAt = stampToMillis(quote.priceMovedAt);
    quote.fetchedAt = capturedAt;
    quote.rules = quote.rules || quote.rulesKey || 'unspecified';
    quote.rulesKey = quote.rulesKey || 'unspecified';
    quote.label = quote.label || quote.outcome || '';
    quote.normalised = true;
    quotes.push(quote);
  }
  return quotes;
}

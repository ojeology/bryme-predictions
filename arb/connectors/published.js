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

export const PUBLISH_FIELDS = [
  'event', 'eventId', 'sport', 'competition', 'startsAt', 'market',
  'marketKey', 'rulesKey', 'way', 'outcome', 'label', 'odds', 'priceMovedAt',
];

/**
 * Pack a book's prices for publication.
 *
 * @param {object[]} quotes the prices, already in their final shape
 * @param {string} book which book they came from
 * @param {string} capturedAt the moment they were really read
 */
export function packQuotes(quotes, book, capturedAt) {
  const rows = [];
  for (const quote of quotes || []) {
    const row = new Array(PUBLISH_FIELDS.length);
    for (let index = 0; index < PUBLISH_FIELDS.length; index += 1) {
      const field = PUBLISH_FIELDS[index];
      const value = quote[PUBLISH_FIELDS[index]];
      if (value === undefined) { row[index] = null; continue; }
      // the stamp is kept as a number of milliseconds: a row of prices is
      // written and read thousands of times a day, and four bytes of
      // digits are cheaper than twenty-four bytes of text
      if (field === 'priceMovedAt') {
        const millis = Date.parse(String(value));
        row[index] = Number.isFinite(millis) ? millis : null;
        continue;
      }
      row[index] = value;
    }
    rows.push(row);
  }
  return { capturedAt, book, format: 'compact', fields: PUBLISH_FIELDS, rows };
}

/**
 * The moment a book last moved a price, as an ISO moment.
 *
 * The stamp travels as a number of milliseconds because a row of prices is
 * written and read thousands of times a day, and four bytes of digits are
 * cheaper than twenty-four bytes of text.  It comes back as a moment in
 * words, because that is what the rest of the system speaks.
 */
function stampToIso(value) {
  if (value === null || value === undefined || value === '') return null;
  const millis = Number(value);
  if (Number.isFinite(millis) && millis > 0) {
    const date = new Date(millis);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
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
  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    if (sameOrder) {
      const [event, eventId, sport, competition, startsAt, market, marketKey, rulesKey, way, outcome, outcomeLabel, odds, priceMovedAt] = row;
      quotes.push({
        event: event ?? '',
        eventId: eventId ?? '',
        sport: sport ?? 'Football',
        competition: competition ?? '',
        startsAt: startsAt ?? null,
        market: market ?? '',
        marketKey: marketKey ?? '',
        rules: rulesKey ?? 'unspecified',
        rulesKey: rulesKey ?? 'unspecified',
        way: Number(way) || 2,
        outcome: outcome ?? '',
        label: outcomeLabel ?? outcome ?? '',
        bookmaker: book,
        bookmakerLabel: label,
        odds: Number(odds) || 0,
        minStake: null,
        url: '',
        // when the book last moved this price, if the book says
        priceMovedAt: stampToIso(priceMovedAt),
        fetchedAt: capturedAt,
        // the prices came out of the reader already in this shape: there is
        // no need to build them a second time
        normalised: true,
      });
      continue;
    }
    // a file written in some other order is read the careful way
    const quote = {};
    for (let index = 0; index < fields.length; index += 1) quote[fields[index]] = row[index];
    quote.bookmaker = book;
    quote.bookmakerLabel = label;
    quote.odds = Number(quote.odds) || 0;
    quote.way = Number(quote.way) || 2;
    quote.priceMovedAt = stampToIso(quote.priceMovedAt);
    quote.fetchedAt = capturedAt;
    quote.rules = quote.rules || quote.rulesKey || 'unspecified';
    quote.rulesKey = quote.rulesKey || 'unspecified';
    quote.label = quote.label || quote.outcome || '';
    quote.normalised = true;
    quotes.push(quote);
  }
  return quotes;
}

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
  'marketKey', 'rulesKey', 'way', 'outcome', 'label', 'odds',
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
      const value = quote[PUBLISH_FIELDS[index]];
      row[index] = value === undefined ? null : value;
    }
    rows.push(row);
  }
  return { capturedAt, book, format: 'compact', fields: PUBLISH_FIELDS, rows };
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
      const [event, eventId, sport, competition, startsAt, market, marketKey, rulesKey, way, outcome, outcomeLabel, odds] = row;
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
        fetchedAt: capturedAt,
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
    quote.fetchedAt = capturedAt;
    quote.rules = quote.rules || quote.rulesKey || 'unspecified';
    quote.rulesKey = quote.rulesKey || 'unspecified';
    quote.label = quote.label || quote.outcome || '';
    quotes.push(quote);
  }
  return quotes;
}

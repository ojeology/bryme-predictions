/**
 * NairaBet (the Altenar/SB widget platform that nairabet.com runs on).
 *
 * The book publishes its own prices as JSON:
 *   https://sb2frontend-altenar2.biahosted.com/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=nairabet&deviceType=desktop&sportId=66
 *
 * The answer is one tree of parallel lists:
 *   events[]        a match: name, startDate, competitorIds, champId, marketIds
 *   competitors[]   the two sides of a match
 *   champs[]        the competition (league) a match belongs to
 *   markets[]       a market of a match: name, typeId, oddIds
 *   odds[]          the price of one side of a market: price, typeId, name
 *
 * The market names come from the platform's own headers, so the wording is
 * the book's wording and not a guess:
 *   typeId 1  "1x2"                  Home / X / Away
 *   typeId 10 "Double chance"        1X / 12 / X2
 *   typeId 11 "Draw no bet"          Home / Away
 *   typeId 18 "Total"                Over X.5 / Under X.5
 *   typeId 29 "Both Teams To Score"  Yes / No
 *
 * Only the markets whose settlement rule is unambiguous are translated: the
 * scanner must never compare two prices that settle differently.  A price
 * marked "money back" settles differently from the plain market, so it is
 * left out rather than compared.
 */
import { slug } from './normalize.js';

/** The market and the rule it settles under, or nothing when it is unclear. */
function marketIdentity(market) {
  const name = String(market?.name || '').trim();
  const typeId = Number(market?.typeId);

  if (typeId === 1) {
    // "1x2 - Enhanced Prices" is the same market at a promotional price; the
    // plain one is used so that one match never carries two 1x2 prices
    if (/enhanced/i.test(name)) return null;
    return { key: 'match-result-1x2', name: '1X2', rules: '90-minutes', way: 3 };
  }
  if (typeId === 18) return { key: 'goals', name: 'Over/Under', rules: '90-minutes', way: 2 };
  if (typeId === 29) return { key: 'both-teams-to-score', name: 'Both Teams To Score', rules: '90-minutes', way: 2 };
  if (typeId === 10) return { key: 'double-chance', name: 'Double Chance', rules: '90-minutes', way: 2 };
  if (typeId === 11) return { key: 'draw-no-bet', name: 'Draw No Bet', rules: '90-minutes', way: 2 };
  // anything else (correct score, halves, player props, combos) settles
  // differently from book to book - it is left alone
  return null;
}

/** The line for a Total price: "Over 2.5" -> 2.5 */
function overUnderLine(label) {
  const match = String(label || '').match(/\b(\d+(?:\.\d+)?)\b/);
  return match ? match[1] : '';
}

/** The side of a 1x2 / draw-no-bet price. */
function sideOf(typeId) {
  if (Number(typeId) === 1) return 'home';
  if (Number(typeId) === 2) return 'draw';
  if (Number(typeId) === 3) return 'away';
  return '';
}

/** The side of a Both Teams To Score price. */
function bttsOf(typeId) {
  if (Number(typeId) === 74) return 'yes';
  if (Number(typeId) === 76) return 'no';
  return '';
}

/** The side of a Double Chance price. */
function doubleChanceOf(typeId) {
  if (Number(typeId) === 9) return '1x';
  if (Number(typeId) === 10) return '12';
  if (Number(typeId) === 11) return 'x2';
  return '';
}

export function isNairaBet(payload) {
  return Boolean(payload && Array.isArray(payload.events) && Array.isArray(payload.odds)
    && Array.isArray(payload.markets) && Array.isArray(payload.competitors));
}

/**
 * Turn NairaBet's price tree into the quotes the scanner compares.
 *
 * @param {object} payload the answer of the Widget/GetEvents endpoint
 * @param {object} options {bookmaker, now}
 * @returns {Array<object>} the quotes
 */
export function flattenNairaBet(payload, options = {}) {
  const bookmaker = options.bookmaker || 'nairabet';
  const now = options.now ? new Date(options.now) : new Date();
  const quotes = [];

  const competitors = new Map();
  for (const competitor of payload?.competitors || []) {
    if (competitor?.id != null) competitors.set(competitor.id, competitor);
  }
  const champs = new Map();
  for (const champ of payload?.champs || []) {
    if (champ?.id != null) champs.set(champ.id, champ);
  }
  const markets = new Map();
  for (const market of payload?.markets || []) {
    if (market?.id != null) markets.set(market.id, market);
  }
  const odds = new Map();
  for (const odd of payload?.odds || []) {
    if (odd?.id != null) odds.set(odd.id, odd);
  }

  for (const event of payload?.events || []) {
    const sides = (event?.competitorIds || []).map((id) => competitors.get(id));
    const home = sides[0];
    const away = sides[1];
    if (!home?.name || !away?.name) continue;

    const eventName = `${home.name} v ${away.name}`;
    const startsAt = event?.startDate || null;
    const competition = String(champs.get(event?.champId)?.name || '');

    for (const marketId of event?.marketIds || []) {
      const market = markets.get(marketId);
      if (!market) continue;
      const identity = marketIdentity(market);
      if (!identity) continue;

      for (const oddId of market?.oddIds || []) {
        const odd = odds.get(oddId);
        if (!odd) continue;
        // a price the book has closed or suspended is not a price
        if (odd.oddStatus != null && Number(odd.oddStatus) !== 0) continue;
        // a money-back price settles differently from the plain market
        if (odd.isMB) continue;
        const price = Number(odd.price);
        if (!Number.isFinite(price) || price <= 1) continue;

        const label = String(odd.name || '').trim();
        if (!label) continue;

        let marketKey = identity.key;
        let outcomeKey = '';
        let way = identity.way;

        if (identity.key === 'match-result-1x2') {
          outcomeKey = sideOf(odd.typeId);
          if (!outcomeKey) continue;
        } else if (identity.key === 'draw-no-bet') {
          outcomeKey = sideOf(odd.typeId);
          if (!outcomeKey || outcomeKey === 'draw') continue;
        } else if (identity.key === 'goals') {
          const line = overUnderLine(label);
          if (!line) continue;
          if (!/^over\b|^under\b/i.test(label)) continue;
          marketKey = `goals-${line}`;
          outcomeKey = /^over\b/i.test(label) ? 'over' : 'under';
        } else if (identity.key === 'both-teams-to-score') {
          outcomeKey = bttsOf(odd.typeId);
          if (!outcomeKey) continue;
        } else if (identity.key === 'double-chance') {
          outcomeKey = doubleChanceOf(odd.typeId);
          if (!outcomeKey) continue;
        }

        quotes.push({
          event: eventName,
          eventId: event?.extId || event?.id || slug(eventName),
          sport: 'Football',
          competition,
          startsAt,
          market: identity.name,
          marketKey,
          rules: identity.rules,
          rulesKey: identity.rules,
          way,
          outcome: outcomeKey,
          label: label || outcomeKey,
          bookmaker,
          odds: price,
          fetchedAt: now.toISOString(),
        });
      }
    }
  }

  return quotes;
}

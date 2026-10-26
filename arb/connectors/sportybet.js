/**
 * SportyBet NG (and the other SportyNet brands that share the platform).
 *
 * The book publishes its own prices as JSON:
 *   https://www.sportybet.com/api/ng/factsCenter/importantEvents?sportId=sr:sport:1
 *
 * The shape is:
 *   data[]                       a tournament
 *     events[]                   a match
 *       estimateStartTime         kick-off, milliseconds since the epoch
 *       homeTeamName/awayTeamName the two sides
 *       markets[]                 a market
 *         name                   "1X2", "Over/Under", ...
 *         marketGuide             the settlement wording
 *         outcomes[]              the prices
 *           desc                  "Home", "Draw", "Away", "Over 2.5", ...
 *           odds                   the price, as a string
 *
 * Only the markets whose settlement rule is unambiguous are translated: the
 * scanner must never compare two prices that settle differently. Anything
 * this adapter does not understand is left out rather than guessed at.
 */
import { canonicalOutcome, slug } from './normalize.js';

export function isSportyBet(payload) {
  if (!payload || typeof payload !== 'object') return false;
  const data = payload.data;
  if (!Array.isArray(data)) return false;
  return data.some((tournament) => Array.isArray(tournament?.events)
    && tournament.events.some((event) => Array.isArray(event?.markets)));
}

/** The market and the rule it settles under, or nothing when it is unclear. */
function marketIdentity(market) {
  const name = String(market?.name || market?.desc || '').trim();
  const guide = String(market?.marketGuide || '');
  const text = `${name} ${guide}`;

  if (/^1x2$/i.test(name)) {
    // the guide says outright that overtime is not included
    return { key: 'match-result-1x2', name: '1X2', rules: '90-minutes', way: 3 };
  }
  if (/^over\/under$/i.test(name)) {
    return { key: 'goals', name: 'Over/Under', rules: '90-minutes', way: 2 };
  }
  if (/both teams to score/i.test(name)) {
    return { key: 'both-teams-to-score', name: name, rules: '90-minutes', way: 2 };
  }
  if (/double chance/i.test(name)) {
    return { key: 'double-chance', name: name, rules: '90-minutes', way: 2 };
  }
  if (/^draw no bet$/i.test(name)) {
    // the book says it plainly: "If the teams draw, the selection will be
    // voided" - so the draw does not settle this market
    return { key: 'draw-no-bet', name: 'Draw No Bet', rules: 'draw-voided', way: 2 };
  }
  // anything else (player props, correct score, combos, half-time markets)
  // settles differently from book to book - it is left alone
  void text;
  return null;
}

/**
 * When the book last moved the price of a market.
 *
 * A price that has not moved for days may be one the book has left
 * behind, and a chance built on a price like that can be taken away the
 * moment the book wakes up.  The time is the book's own, not ours.
 */
function priceMovedAt(market) {
  const raw = Number(market?.lastOddsChangeTime);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  const millis = raw > 1e12 ? raw : raw * 1000;
  const date = new Date(millis);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

/** The line for an Over/Under price: "Over 2.5" -> 2.5 */
function overUnderLine(label) {
  const match = String(label || '').match(/\b(\d+(?:\.\d+)?)\b/);
  return match ? match[1] : '';
}

export function flattenSportyBet(payload, options = {}) {
  const bookmaker = options.bookmaker || 'sportybet';
  const now = options.now ? new Date(options.now) : new Date();
  const quotes = [];

  for (const tournament of payload?.data || []) {
    for (const event of tournament?.events || []) {
      const home = String(event?.homeTeamName || '').trim();
      const away = String(event?.awayTeamName || '').trim();
      if (!home || !away) continue;
      const eventName = `${home} v ${away}`;
      const startsAt = event?.estimateStartTime
        ? new Date(Number(event.estimateStartTime)).toISOString()
        : null;
      const competition = String(tournament?.name || '');

      for (const market of event?.markets || []) {
        const identity = marketIdentity(market);
        if (!identity) continue;
        for (const outcome of market?.outcomes || []) {
          if (outcome?.isActive === 0) continue;
          const odds = Number(outcome?.odds);
          if (!Number.isFinite(odds) || odds <= 1) continue;
          const label = String(outcome?.desc || '').trim();
          if (!label) continue;

          let marketKey = identity.key;
          let outcomeKey = canonicalOutcome(label, identity.key);
          let way = identity.way;

          if (identity.key === 'goals') {
            const line = overUnderLine(label);
            if (!line) continue;
            if (!/^over\b|^under\b/i.test(label)) continue;
            marketKey = `goals-${line}`;
          }
          if (identity.key === 'both-teams-to-score') {
            if (!/^yes\b|^no\b/i.test(label)) continue;
            outcomeKey = slug(label);
          }
          if (identity.key === 'double-chance') {
            if (!/^(1x|x2|12)\b/i.test(label)) continue;
            outcomeKey = slug(label.replace(/\s+/g, ''));
          }
          if (identity.key === 'match-result-1x2') {
            if (!['home', 'draw', 'away'].includes(outcomeKey)) continue;
          }
          if (identity.key === 'draw-no-bet') {
            if (!['home', 'away'].includes(outcomeKey)) continue;
          }

          quotes.push({
            event: eventName,
            eventId: event?.eventId || slug(eventName),
            sport: event?.sport?.name || 'Football',
            competition,
            startsAt,
            market: identity.name,
            marketKey,
            rules: identity.rules,
            rulesKey: slug(identity.rules),
            way,
            outcome: outcomeKey,
            label,
            bookmaker,
            odds,
            minStake: null,
            priceMovedAt: priceMovedAt(market),
            fetchedAt: now.toISOString(),
            url: options.url || '',
          });
        }
      }
    }
  }
  return quotes;
}

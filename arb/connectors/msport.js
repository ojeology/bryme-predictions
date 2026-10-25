/**
 * MSport (Nigeria).
 *
 * MSport sits on the same platform as SportyBet, so its price tree has the
 * same shape, and it is read the same way.
 *
 * The prices come from the book's own endpoint:
 *   POST https://www.msport.com/api/ng/facts-center/query/frontend/sports-matches-list?sportId=sr:sport:1&timeslot=Today
 *
 * That endpoint will not answer a plain server request - the book's edge
 * sends a bot check to anything that is not a real browser.  So the fetch
 * itself is done through a real browser, on the book's own page, which is
 * exactly what a person opening the site does.  No account is used, no
 * check is solved, no bet is placed.
 *
 * The answer is shaped like:
 *   data.tournaments[]            a competition
 *     tournament                  its name
 *     events[]                    a match
 *       eventId                   "sr:match:71945344"
 *       homeTeam/awayTeam         the two sides
 *       startTime                 kick-off, milliseconds since the epoch
 *       status                    0 = not started, 1 = running
 *       markets[]                 a market
 *         name                    "1x2", "Over/Under", "GG/NG", ...
 *         specifiers              "total=3.5", "goalnr=1", ...
 *         outcomes[]              the prices
 *           description            "Home", "Draw", "Over 3.5", ...
 *           odds                   the price, as a string
 *
 * Only markets whose settlement rule is unambiguous are translated.  The
 * scanner must never compare two prices that settle differently, so
 * anything this adapter does not understand is left out, not guessed at.
 */
import { canonicalOutcome, slug } from './normalize.js';

export function isMsport(payload) {
  const data = payload?.data;
  if (!data || typeof data !== 'object') return false;
  const tournaments = data.tournaments;
  if (!Array.isArray(tournaments)) return false;
  return tournaments.some((tournament) => Array.isArray(tournament?.events)
    && tournament.events.some((event) => Array.isArray(event?.markets)));
}

/** The market and the rule it settles under, or nothing when it is unclear. */
function marketIdentity(market) {
  const name = String(market?.name || '').trim();

  if (/^1x2$/i.test(name)) {
    return { key: 'match-result-1x2', name: '1X2', rules: '90-minutes', way: 3 };
  }
  if (/^over\/under$/i.test(name)) {
    return { key: 'goals', name: 'Over/Under', rules: '90-minutes', way: 2 };
  }
  if (/^gg\/ng$/i.test(name)) {
    return { key: 'both-teams-to-score', name: 'Both Teams To Score', rules: '90-minutes', way: 2 };
  }
  if (/^double chance$/i.test(name)) {
    return { key: 'double-chance', name: 'Double Chance', rules: '90-minutes', way: 2 };
  }
  if (/^(draw no bet|dnb)$/i.test(name)) {
    return { key: 'draw-no-bet', name: 'Draw No Bet', rules: '90-minutes', way: 2 };
  }
  // everything else (next goal, 1UP/2UP, half-time, player props, correct
  // score) settles differently from book to book - it is left alone
  return null;
}

/** The line for an Over/Under price: "Over 3.5" -> 3.5 */
function overUnderLine(label, market) {
  const fromLabel = String(label || '').match(/\b(\d+(?:\.\d+)?)\b/);
  if (fromLabel) return fromLabel[1];
  const fromSpecifier = String(market?.specifiers || '').match(/total=(\d+(?:\.\d+)?)/);
  return fromSpecifier ? fromSpecifier[1] : '';
}

/** MSport writes the sport as "Soccer"; every other book writes "Football". */
function sportName(value) {
  const raw = String(value || '').trim();
  if (/^soccer$/i.test(raw)) return 'Football';
  return raw || 'Football';
}

export function flattenMsport(payload, options = {}) {
  const bookmaker = options.bookmaker || 'msport';
  const now = options.now ? new Date(options.now) : new Date();
  const quotes = [];

  for (const tournament of payload?.data?.tournaments || []) {
    const competition = String(tournament?.tournament || tournament?.category || '');
    for (const event of tournament?.events || []) {
      // only matches that have not started: a running match cannot be laid
      // against a pre-match price, and its prices move
      if (event?.status !== 0) continue;

      const home = String(event?.homeTeam || '').trim();
      const away = String(event?.awayTeam || '').trim();
      if (!home || !away) continue;
      const eventName = `${home} v ${away}`;
      const startsAt = event?.startTime ? new Date(Number(event.startTime)).toISOString() : null;

      for (const market of event?.markets || []) {
        const identity = marketIdentity(market);
        if (!identity) continue;

        for (const outcome of market?.outcomes || []) {
          if (outcome?.isActive === 0) continue;
          const odds = Number(outcome?.odds);
          if (!Number.isFinite(odds) || odds <= 1) continue;
          const label = String(outcome?.description || '').trim();
          if (!label) continue;

          let marketKey = identity.key;
          let outcomeKey = canonicalOutcome(label, identity.key);

          if (identity.key === 'goals') {
            const line = overUnderLine(label, market);
            if (!line) continue;
            if (!/^over\b|^under\b/i.test(label)) continue;
            marketKey = `goals-${line}`;
          }
          if (identity.key === 'both-teams-to-score') {
            if (!/^yes\b|^no\b/i.test(label)) continue;
            outcomeKey = slug(label);
          }
          if (identity.key === 'double-chance') {
            const compact = label.replace(/\s+/g, '').toLowerCase();
            if (!/^(1x|12|x2)$/.test(compact)) continue;
            outcomeKey = compact;
          }
          if (identity.key === 'match-result-1x2') {
            if (!['home', 'draw', 'away'].includes(outcomeKey)) continue;
          }

          quotes.push({
            event: eventName,
            eventId: event?.eventId || slug(eventName),
            sport: sportName(event?.sport),
            competition,
            startsAt,
            market: identity.name,
            marketKey,
            rules: identity.rules,
            rulesKey: slug(identity.rules),
            way: identity.way,
            outcome: outcomeKey,
            label,
            bookmaker,
            odds,
            minStake: null,
            fetchedAt: now.toISOString(),
            url: options.url || '',
          });
        }
      }
    }
  }
  return quotes;
}

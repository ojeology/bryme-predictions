/**
 * LiveScore Bet NG.
 *
 * The book publishes its prices through its own gateway:
 *   https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/events/matches
 *     ?sportcategoryid=SBTC1_1&categoryid=SBTC1_1
 *
 * The shape is:
 *   events.categories[]        a sport (Football)
 *     childs[]                  a competition (a league)
 *       events[]                a match
 *         name                  "FC Santa Coloma - Inter Club d'Escalades"
 *         startTime             "2026-10-25 19:00:00" (UTC)
 *         state                 "NOTSTARTED" / "INPLAY"
 *         participants[]         {name, venueRole: "Home" | "Away"}
 *         markets[]
 *           name                "Full Time", "Total Goals", ...
 *           periodType          "FT" (full time) / "FH" (first half)
 *           selections[]
 *             name               the team name, "Draw", "Over 2.5", ...
 *             odds               the price
 *
 * Only the full-time markets whose settlement rule is unambiguous are
 * translated. Everything else - the "1UP"/"2UP" variants, the first-half
 * totals, the combined bets - settles differently from book to book, so it is
 * left out rather than compared wrongly.
 */
import { canonicalOutcome, slug } from './normalize.js';

export function isLiveScoreBet(payload) {
  if (!payload || typeof payload !== 'object') return false;
  const categories = payload?.events?.categories;
  if (!Array.isArray(categories)) return false;
  // the gateway nests its matches three ways; any of them means this is the
  // book's own tree
  return categories.some((category) => (
    (Array.isArray(category?.childs) && category.childs.some((child) => Array.isArray(child?.events)))
    || Array.isArray(category?.events)
    || (Array.isArray(category?.eventGroups) && category.eventGroups.some((group) => Array.isArray(group?.events)))
  ));
}

/** "2026-10-25 19:00:00" -> an ISO instant. The book writes UTC. */
function parseStartTime(value) {
  if (!value) return null;
  const text = String(value).trim();
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)
    ? `${text.replace(' ', 'T')}.000Z`
    : text;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** "Over 2.5" -> 2.5 */
function lineFrom(label) {
  const match = String(label || '').match(/\b(\d+(?:\.\d+)?)\b/);
  return match ? match[1] : '';
}

/**
 * When the book last moved the price of a selection.
 *
 * The book stamps every price with the moment it last changed, written as
 * YYYYMMDDHHMMSSmmm.  A price that has not moved for days may be one the
 * book has left behind.
 */
function priceMovedAt(selection) {
  const raw = String(selection?.version || '').trim();
  if (!/^\d{17}$/.test(raw)) return null;
  // YYYYMMDDHHMMSSmmm read as digits, and turned into a moment by hand:
  // the arithmetic is cheap, and building a Date for every price in a
  // full slate is not
  const millis = Date.UTC(
    Number(raw.slice(0, 4)), Number(raw.slice(4, 6)) - 1, Number(raw.slice(6, 8)),
    Number(raw.slice(8, 10)), Number(raw.slice(10, 12)), Number(raw.slice(12, 14)),
    Number(raw.slice(14, 17)),
  );
  return Number.isFinite(millis) ? millis : null;
}

function marketIdentity(market) {
  const name = String(market?.name || '').trim();
  const period = String(market?.periodType || '').toUpperCase();
  if (period && period !== 'FT') return null; // half-time and other periods settle differently
  if (name === 'Full Time') return { key: 'match-result-1x2', name: 'Full Time', rules: '90-minutes', way: 3 };
  if (name === 'Total Goals') return { key: 'goals', name: 'Total Goals', rules: '90-minutes', way: 2 };
  if (name === 'Both Teams To Score') return { key: 'both-teams-to-score', name, rules: '90-minutes', way: 2 };
  if (name === 'Double Chance') return { key: 'double-chance', name, rules: '90-minutes', way: 2 };
  return null;
}

/** Which side a selection belongs to. */
function outcomeFor(label, { home, away }, marketKey) {
  const text = String(label || '').trim();
  if (marketKey === 'match-result-1x2') {
    if (home && text === home) return 'home';
    if (away && text === away) return 'away';
    if (/^draw$/i.test(text)) return 'draw';
    return null;
  }
  if (marketKey === 'goals') {
    if (/^over\b/i.test(text)) return 'over';
    if (/^under\b/i.test(text)) return 'under';
    return null;
  }
  if (marketKey === 'both-teams-to-score') {
    if (/^yes$/i.test(text)) return 'yes';
    if (/^no$/i.test(text)) return 'no';
    return null;
  }
  if (marketKey === 'double-chance') {
    const parts = text.split(/\s+or\s+/i);
    if (parts.length !== 2) return null;
    const side = (part) => {
      if (home && part === home) return 'home';
      if (away && part === away) return 'away';
      if (/^draw$/i.test(part)) return 'draw';
      return null;
    };
    const one = side(parts[0]);
    const two = side(parts[1]);
    if (!one || !two) return null;
    return `${one}-or-${two}`;
  }
  return canonicalOutcome(text, marketKey);
}

/**
 * The book nests its matches three ways: under the sport (one competition
 * each), under a competition, or under a group inside a competition. All
 * three are read the same way.
 */
function collectEvents(category) {
  const found = [];
  const push = (event, competition, sport) => {
    if (event && typeof event === 'object') found.push({ event, competition, sport });
  };
  const sportName = category?.type === 'Sport' ? category?.name : 'Football';
  for (const child of category?.childs || []) {
    for (const event of child?.events || []) push(event, child?.name || category?.name, sportName);
    for (const group of child?.eventGroups || []) {
      for (const event of group?.events || []) push(event, child?.name || category?.name, sportName);
    }
  }
  for (const group of category?.eventGroups || []) {
    for (const event of group?.events || []) push(event, category?.name, sportName);
  }
  for (const event of category?.events || []) push(event, category?.name, sportName);
  return found;
}

export function flattenLiveScoreBet(payload, options = {}) {
  const bookmaker = options.bookmaker || 'livescorebet';
  const now = options.now ? new Date(options.now) : new Date();
  const quotes = [];

  for (const category of payload?.events?.categories || []) {
    for (const { event, competition: competitionName, sport: sportName } of collectEvents(category)) {
      {
        if (event?.state && event.state !== 'NOTSTARTED') continue;
        const participants = event?.participants || [];
        const home = String(participants.find((p) => p?.venueRole === 'Home')?.name || '').trim();
        const away = String(participants.find((p) => p?.venueRole === 'Away')?.name || '').trim();
        const name = String(event?.name || '').trim();
        const eventName = home && away ? `${home} v ${away}` : name.replace(/\s+-\s+/, ' v ');
        const startsAt = parseStartTime(event?.startTime);
        const competition = competitionName
          || String((event?.categories || []).find((c) => c?.type === 'Competition')?.name || '');

        for (const market of event?.markets || []) {
          const identity = marketIdentity(market);
          if (!identity) continue;
          if (market?.suspended) continue;
          for (const selection of market?.selections || []) {
            if (selection?.suspended) continue;
            const odds = Number(selection?.odds);
            if (!Number.isFinite(odds) || odds <= 1) continue;
            const label = String(selection?.name || '').trim();
            let marketKey = identity.key;
            let outcome = outcomeFor(label, { home, away }, identity.key);
            if (!outcome) continue;
            if (identity.key === 'goals') {
              const line = lineFrom(label);
              if (!line) continue;
              marketKey = `goals-${line}`;
            }
            quotes.push({
              event: eventName,
              eventId: event?.id || slug(eventName),
              sport: sportName || category?.name || 'Football',
              competition: competition || '',
              startsAt,
              market: identity.name,
              marketKey,
              rules: identity.rules,
              rulesKey: slug(identity.rules),
              way: identity.way,
              outcome,
              label,
              bookmaker,
              odds,
              minStake: null,
              priceMovedAt: priceMovedAt(selection),
              fetchedAt: now.toISOString(),
              url: options.url || '',
            });
          }
        }
      }
    }
  }
  return quotes;
}

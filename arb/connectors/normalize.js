/**
 * Turning a bookmaker's own JSON into the normalized quote shape.
 *
 * The scanner needs every book to describe the SAME market the SAME way, or
 * two books will never be compared.  Books say "Over 2.5", "Total 2.5" and
 * "Goals Over 2.5" for the same thing, and they say "Match Result", "1X2" and
 * "Full Time Result" for the same thing.  This module derives a canonical
 * market key and a canonical outcome key from the wording, so the scanner
 * can pair a SportyBet price with a 22Bet price without a human renaming
 * every market by hand.
 *
 * It also derives the settlement rule.  The scanner refuses any quote whose
 * rule is unspecified, because "Over 2.5 goals" with overtime and "Over 2.5
 * goals" in 90 minutes are not the same bet.  When the market wording does
 * not say, the operator's declared default for that book is used.
 */

import { flattenLineFeed, isLineFeed } from './linefeed.js';
import { flattenSportyBet, isSportyBet } from './sportybet.js';

const STOP = new Set(['total', 'goals', 'goal', 'over', 'under', 'more', 'less', 'the', 'a', 'an', 'of', 'and']);

export function slug(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * "Over 2.5", "Total 2.5 goals", "Goals Over 2.5" -> one key.
 *
 * The key names the MARKET (family + line).  The direction lives in the
 * outcome key, never here: "Total 2.5" and "Over 2.5" are the same market,
 * and if the direction were baked into the market key the two books could
 * never be compared.
 */
export function canonicalMarketKey(marketName, explicitKey, defaultFamily = '') {
  const name = String(marketName ?? '');
  // Read the family and the line from BOTH the wording and the book's own
  // market key: one book says "Over 2.5" and calls it "total_goals", the
  // other says "Total 2.5 goals".  Either source alone is enough to find
  // the family and the line - together they always line the two books up.
  const lower = name.toLowerCase();
  const haystack = `${name} ${explicitKey || ''}`.toLowerCase();
  const line = (haystack.match(/(\d+(?:\.\d+)?)/) || [])[1] || '';

  let family = '';
  if (/match result|1x2|full ?time result|who will win|winner|to qualify/.test(haystack)) family = 'match-result';
  else if (/goal/.test(haystack)) family = 'goals';
  else if (/point/.test(haystack)) family = 'points';
  else if (/card/.test(haystack)) family = 'cards';
  else if (/corner/.test(haystack)) family = 'corners';
  else if (/foul/.test(haystack)) family = 'fouls';
  else if (/shot/.test(haystack)) family = 'shots';
  else if (/booking/.test(haystack)) family = 'bookings';
  if (!family) family = String(defaultFamily || '').toLowerCase().replace(/[^a-z]/g, '');

  if (family === 'match-result') return 'match-result-1x2';
  if (family && line) return `${family}-${line}`;
  if (family) return family;
  if (explicitKey) return slug(explicitKey);
  // Unknown family: keep the wording, but the number must survive so that
  // "Over 2.5" and "Over 3.5" can never collide.
  const words = lower.replace(/[^a-z0-9.]+/g, ' ').trim().split(/\s+/)
    .filter((w) => w && !['the', 'a', 'an', 'of', 'and'].includes(w));
  return slug(words.join('-')) || 'market';
}

/** Canonical outcome key: "Home", "1", "Home Win" -> "home". */
export function canonicalOutcome(label, marketKey = '') {
  const raw = String(label ?? '').trim().toLowerCase();
  if (/^(home|1|home win|home team)\b/.test(raw) || raw === '1') return 'home';
  if (/^(draw|x|tie)\b/.test(raw) || raw === 'x') return 'draw';
  if (/^(away|2|away win|away team)\b/.test(raw) || raw === '2') return 'away';
  if (/(^|\b)over\b/.test(raw)) return 'over';
  if (/(^|\b)under\b/.test(raw)) return 'under';
  if (/both teams to score/.test(raw)) return 'btts';
  if (/clean sheet/.test(raw)) return 'clean-sheet';
  if (/draw no bet/.test(raw)) return 'dnb';
  return slug(raw) || `outcome-${marketKey}`;
}

/**
 * Settlement rule. The wording wins; otherwise the book's declared default.
 * Returning 'unspecified' makes the scanner refuse the quote on purpose.
 */
export function deriveRules(marketName, fallback = 'unspecified') {
  const lower = String(marketName ?? '').toLowerCase();
  if (/overtime|extra time|including ot|\bot included\b/.test(lower)) return 'overtime-included';
  if (/90 minutes|regulation only|full time result|1x2|match result/.test(lower)) return '90-minutes';
  if (/half time|first half/.test(lower)) return 'half-time';
  return fallback;
}

function firstNumber(value) {
  const m = String(value ?? '').match(/(\d+(?:\.\d+)?)/);
  return m ? m[1] : null;
}

function pick(obj, keys) {
  for (const key of keys) {
    if (obj == null) continue;
    const v = obj[key];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

/** Home team / away team from the many shapes books use. */
function splitTeams(event, home, away) {
  if (home && away) return [String(home), String(away)];
  const name = String(event ?? '');
  const parts = name.split(/\s+(?:v|vs|x|versus|[-–—])\s+/i).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts[parts.length - 1]];
  return [name, name];
}

/**
 * Flatten any book payload into normalized quotes.
 * Accepts: a flat quote array, {quotes|data:[]}, {leagues:[{events:[...]}]},
 * {events:[...]}, {matches:[...]} - and per event, markets with selections.
 */
export function flattenBookPayload(payload, options = {}) {
  // The 1xBet/22Bet family speaks its own dialect (capitalised fields, string
  // odds, unix start times); it gets its own adapter.
  if (isLineFeed(payload)) return flattenLineFeed(payload, options);
  // SportyBet publishes its own price tree
  if (isSportyBet(payload)) return flattenSportyBet(payload, options);
  const bookmaker = options.bookmaker;
  const defaultRules = options.defaultRules || 'unspecified';
  const defaultFamily = options.defaultFamily || '';
  const now = options.now ? new Date(options.now) : new Date();
  const quotes = [];

  const pushQuote = (q) => {
    if (!q) return;
    const odds = Number(q.odds);
    if (!Number.isFinite(odds) || odds <= 1) return;
    const marketName = q.marketName || '';
    const marketKey = canonicalMarketKey(marketName, q.marketKey, options.defaultFamily);
    const outcome = canonicalOutcome(q.outcomeLabel, marketKey);
    const rules = q.rules || deriveRules(marketName, defaultRules);
    const rawEvent = q.event ?? q.eventName ?? '';
    const [home, away] = splitTeams(rawEvent, q.home, q.away);
    const eventName = rawEvent && rawEvent.includes(' v ') ? rawEvent : `${home} v ${away}`;
    const startsAt = q.startsAt || null;
    quotes.push({
      event: eventName,
      eventId: q.eventId || slug(eventName),
      sport: q.sport || 'Football',
      competition: q.competition || '',
      startsAt,
      market: marketName,
      marketKey,
      rules,
      rulesKey: slug(rules),
      way: q.way || 2,
      outcome,
      label: q.outcomeLabel || outcome,
      bookmaker,
      odds,
      minStake: q.minStake ?? options.minStake ?? null,
      fetchedAt: q.fetchedAt || now.toISOString(),
      url: q.url || '',
    });
  };

  // ---- flat quote lists
  const flat = Array.isArray(payload) ? payload
    : (payload?.quotes || payload?.data || payload?.odds || null);
  if (Array.isArray(flat)) {
    for (const item of flat) {
      if (!item || typeof item !== 'object') continue;
      const marketName = String(pick(item, ['market', 'marketLabel', 'marketName', 'name']) ?? '');
      const marketKey = pick(item, ['marketKey', 'market_key']);
      const outcomeLabel = pick(item, ['outcome', 'selection', 'label', 'outcomeLabel', 'name']);
      const eventName = pick(item, ['event', 'match', 'eventName', 'fixture', 'title']);
      const home = pick(item, ['home', 'homeTeam', 'home_name', 'homeTeamName']);
      const away = pick(item, ['away', 'awayTeam', 'away_name', 'awayTeamName']);
      const startsAt = pick(item, ['startsAt', 'startTime', 'start', 'kickoff', 'eventStart', 'matchTime']);
      const odds = pick(item, ['odds', 'price', 'decimalOdds', 'oddsDecimal']);
      if (!marketName || !outcomeLabel || !eventName || odds === undefined) continue;
      pushQuote({
        event: eventName, eventId: pick(item, ['eventId', 'event_id', 'matchId']), home, away,
        startsAt, marketName, marketKey, outcomeLabel, odds,
        rules: pick(item, ['rules', 'rulesKey', 'settlement']),
        way: pick(item, ['way', 'outcomeCount']),
        fetchedAt: pick(item, ['fetchedAt', 'timestamp', 'updatedAt']),
        url: pick(item, ['url', 'link']),
        sport: pick(item, ['sport', 'sportName']), competition: pick(item, ['competition', 'league', 'leagueName']),
      });
    }
    return quotes;
  }

  // ---- nested sportsbook shape
  const containers = [];
  const pushContainer = (node, inherited = {}) => {
    if (!node || typeof node !== 'object') return;
    const league = pick(node, ['league', 'leagueName', 'tournament', 'group']) ?? inherited.competition;
    const sport = pick(node, ['sport', 'sportName', 'sportKey']) ?? inherited.sport ?? 'Football';
    const events = pick(node, ['events', 'matches', 'fixtures', 'games']);
    if (Array.isArray(events)) for (const ev of events) pushEvent(ev, { competition: league, sport });
    const markets = pick(node, ['markets']);
    if (Array.isArray(markets)) for (const m of markets) pushMarket(m, inherited);
  };

  const pushEvent = (ev, inherited) => {
    if (!ev || typeof ev !== 'object') return;
    const eventId = pick(ev, ['id', 'eventId', 'matchId', 'fixtureId']);
    const eventName = pick(ev, ['name', 'eventName', 'title', 'event']) ?? '';
    const home = pick(ev, ['home', 'homeTeam', 'homeTeamName', 'participants', 'home_name']);
    const away = pick(ev, ['away', 'awayTeam', 'awayTeamName', 'home_away', 'away_name']);
    const startsAt = pick(ev, ['startsAt', 'startTime', 'start', 'kickoff', 'eventStart', 'date', 'matchDate']);
    const competition = pick(ev, ['competition', 'league', 'leagueName', 'tournament']) ?? inherited.competition;
    const sport = pick(ev, ['sport', 'sportName']) ?? inherited.sport ?? 'Football';
    const markets = pick(ev, ['markets', 'bets', 'outcomes', 'odds']);
    if (!Array.isArray(markets)) return;
    for (const m of markets) pushMarket(m, { eventId, eventName, home, away, startsAt, competition, sport });
  };

  const pushMarket = (m, inherited) => {
    if (!m || typeof m !== 'object') return;
    const marketName = String(pick(m, ['name', 'marketName', 'market', 'title', 'key']) ?? '');
    if (!marketName) return;
    const explicitKey = pick(m, ['marketKey', 'key', 'id']);
    const rules = pick(m, ['rules', 'settlement', 'rulesKey']);
    const selections = pick(m, ['selections', 'outcomes', 'prices', 'choices', 'selectionsDetail']);
    const list = Array.isArray(selections) ? selections : [];
    const oddsList = Array.isArray(m) ? m : null;
    if (list.length) {
      const labels = list.map((s) => String(pick(s, ['name', 'label', 'outcome', 'selection', 'title']) ?? ''));
      const way = labels.length;
      for (const s of list) {
        const label = String(pick(s, ['name', 'label', 'outcome', 'selection', 'title']) ?? '');
        const odds = pick(s, ['odds', 'price', 'decimalOdds', 'oddsDecimal']);
        if (odds === undefined) continue;
        pushQuote({
          ...inherited, marketName, marketKey: explicitKey, outcomeLabel: label, odds,
          rules, way, url: pick(s, ['url', 'link']),
        });
      }
    } else if (oddsList) {
      for (const s of oddsList) {
        if (!s || typeof s !== 'object') continue;
        const label = String(pick(s, ['name', 'label', 'outcome', 'selection', 'title']) ?? '');
        const odds = pick(s, ['odds', 'price', 'decimalOdds', 'oddsDecimal']);
        if (odds === undefined || !label) continue;
        pushQuote({ ...inherited, marketName, marketKey: explicitKey, outcomeLabel: label, odds, rules });
      }
    }
  };

  const roots = pick(payload, ['leagues', 'sports', 'events', 'matches', 'fixtures', 'data', 'categories']);
  if (Array.isArray(roots)) {
    for (const node of roots) pushContainer(node);
  } else if (payload && typeof payload === 'object') {
    pushContainer(payload);
  }
  return quotes;
}

/** Distinct (event, market, rules) groups and how many outcomes each has. */
export function marketSummary(quotes) {
  const groups = new Map();
  for (const q of quotes) {
    const key = `${q.eventId}|${q.marketKey}|${q.rulesKey}`;
    if (!groups.has(key)) groups.set(key, { key, event: q.event, market: q.market, rules: q.rules, outcomes: new Set(), quotes: 0 });
    groups.get(key).outcomes.add(q.outcome);
    groups.get(key).quotes += 1;
  }
  return [...groups.values()].map((g) => ({ ...g, ways: g.outcomes.size, outcomes: [...g.outcomes] }));
}

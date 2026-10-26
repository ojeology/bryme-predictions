export const BOOKMAKERS = [
  { id: 'sportybet', label: 'SportyBet NG' },
  { id: 'nairabet', label: 'NairaBet' },
  { id: '22bet', label: '22Bet NG' },
  { id: '1xbet', label: '1xBet' },
  { id: 'livescorebet', label: 'LiveScore Bet NG' },
  { id: 'msport', label: 'MSport' },
  { id: 'other', label: 'Other' },
];

export const DEFAULT_STAKE = 100000;
export const DEFAULT_ROUNDING = 100;

/** How far apart two books' kick-off times may be and still be the same fixture. */
export const TIME_WINDOW_MINUTES = 120;

export function toFiniteNumber(value) {
  const number = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(number) ? number : NaN;
}

/**
 * Strict odds parser.  A price must never be guessed: a comma-decimal price
 * such as "2,10" must NOT become 210 (that would manufacture a 10,000% ROI
 * out of nothing), and the ambiguous "1,850" is rejected rather than guessed
 * either way.  A missing price is harmless.  A wrong price is not.
 */
export function parseOdds(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const raw = String(value ?? '').trim().replace(/\s+/g, '');
  if (!raw) return NaN;
  if (/^\d+(\.\d+)?$/.test(raw)) return Number(raw);          // 2.10
  if (/^\d+,\d{1,2}$/.test(raw)) return Number(raw.replace(',', '.')); // 2,10 -> 2.10
  return NaN;                                                  // "1,850" and anything else: rejected
}

export function normalizeBookmaker(value) {
  const raw = String(value || '').trim().toLowerCase();
  const compact = raw.replace(/[^a-z0-9]/g, '');
  const aliases = {
    sportybet: 'sportybet',
    sportybetng: 'sportybet',
    nairabet: 'nairabet',
    '22bet': '22bet',
    '22betng': '22bet',
    '1xbet': '1xbet',
    livescorebet: 'livescorebet',
    livescorebetng: 'livescorebet',
  };
  return aliases[compact] || compact;
}

export function bookmakerLabel(id, fallback = '') {
  return BOOKMAKERS.find((book) => book.id === id)?.label || fallback || id || 'Unknown book';
}

export function impliedSum(legs) {
  return legs.reduce((sum, leg) => sum + 1 / toFiniteNumber(leg.odds), 0);
}

function distributeRoundedStakes(exactStakes, totalStake, rounding) {
  if (rounding <= 1) return exactStakes.map((stake) => Math.round(stake * 100) / 100);

  const units = Math.round(totalStake / rounding);
  if (Math.abs(units * rounding - totalStake) > 0.0001) {
    return exactStakes.map((stake) => Math.round(stake * 100) / 100);
  }

  const rawUnits = exactStakes.map((stake) => stake / rounding);
  const allocated = rawUnits.map((value) => Math.floor(value));
  let remaining = units - allocated.reduce((sum, value) => sum + value, 0);

  const order = rawUnits
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  let cursor = 0;
  while (remaining > 0 && order.length) {
    allocated[order[cursor % order.length].index] += 1;
    remaining -= 1;
    cursor += 1;
  }
  while (remaining < 0 && order.length) {
    const index = order[cursor % order.length].index;
    if (allocated[index] > 0) {
      allocated[index] -= 1;
      remaining += 1;
    }
    cursor += 1;
  }

  return allocated.map((value) => value * rounding);
}

/**
 * Calculate a two- or three-way arbitrage and its practical rounded stakes.
 * This function never implies that a bookmaker will accept or honour a price.
 */
export function calculateArbitrage(legs, options = {}) {
  const totalStake = toFiniteNumber(options.totalStake ?? DEFAULT_STAKE);
  const rounding = toFiniteNumber(options.rounding ?? DEFAULT_ROUNDING);
  const errors = [];
  const warnings = [];

  if (!Array.isArray(legs) || legs.length < 2 || legs.length > 3) {
    errors.push('Enter two or three outcomes for one market.');
  }
  if (!Number.isFinite(totalStake) || totalStake <= 0) errors.push('Total stake must be greater than zero.');
  if (!Number.isFinite(rounding) || rounding < 0) errors.push('Stake rounding cannot be negative.');

  const cleanLegs = (Array.isArray(legs) ? legs : []).map((leg, index) => {
    const odds = parseOdds(leg.odds);
    const bookmaker = normalizeBookmaker(leg.bookmaker) || 'other';
    if (!Number.isFinite(odds) || odds <= 1) errors.push(`Outcome ${index + 1}: decimal odds must be greater than 1.00.`);
    const minStake = leg.minStake ?? leg.bookMinStake ?? null;
    return {
      ...leg,
      id: leg.id || `leg-${index + 1}`,
      outcome: leg.outcome || `outcome-${index + 1}`,
      label: String(leg.label || leg.outcomeLabel || `Outcome ${index + 1}`).trim(),
      bookmaker,
      bookmakerLabel: bookmakerLabel(bookmaker, leg.bookmakerLabel || leg.bookmaker),
      minStake: Number.isFinite(Number(minStake)) && Number(minStake) > 0 ? Number(minStake) : null,
      odds,
    };
  });

  const outcomeKeys = new Set(cleanLegs.map((leg) => leg.outcome));
  if (outcomeKeys.size !== cleanLegs.length) errors.push('Each leg must cover a different outcome.');
  if (new Set(cleanLegs.map((leg) => leg.bookmaker)).size === 1 && cleanLegs.length > 1) {
    warnings.push('All legs use one bookmaker. Check that you have not combined different markets by mistake.');
  }

  if (errors.length) {
    return {
      valid: false,
      isArb: false,
      errors: [...new Set(errors)],
      warnings,
      legs: cleanLegs,
      totalStake,
      rounding,
    };
  }

  const sum = impliedSum(cleanLegs);
  const exactStakes = cleanLegs.map((leg) => totalStake * (1 / leg.odds) / sum);
  const roundedStakes = distributeRoundedStakes(exactStakes, totalStake, rounding);
  const calculatedLegs = cleanLegs.map((leg, index) => {
    const exactReturn = exactStakes[index] * leg.odds;
    const roundedReturn = roundedStakes[index] * leg.odds;
    return {
      ...leg,
      impliedProbability: 1 / leg.odds,
      exactStake: exactStakes[index],
      stake: roundedStakes[index],
      exactReturn,
      returnAmount: roundedReturn,
      profit: roundedReturn - totalStake,
    };
  });

  const exactReturn = totalStake / sum;
  const minReturn = Math.min(...calculatedLegs.map((leg) => leg.returnAmount));
  const maxReturn = Math.max(...calculatedLegs.map((leg) => leg.returnAmount));
  const isArb = sum < 1 - 1e-10;
  const hasZeroStake = calculatedLegs.some((leg) => leg.stake <= 0);
  // A leg under the bookmaker's minimum stake cannot be placed, so the whole
  // arbitrage is not executable no matter how good the price looks.
  const belowMinStake = calculatedLegs.some((leg) => leg.minStake != null && leg.stake < leg.minStake);

  if (hasZeroStake) warnings.push('The rounding increment leaves at least one outcome with a zero stake. Use a larger bankroll or smaller increment.');
  if (belowMinStake) warnings.push('At least one stake is below the bookmaker minimum stake, so it cannot be placed.');
  if (isArb && minReturn < totalStake) warnings.push('Rounded stakes remove the theoretical edge at this bankroll. Adjust the bankroll or rounding increment.');
  if (rounding > 1 && Math.abs(maxReturn - minReturn) > rounding) warnings.push('Returns differ because of stake rounding. The lowest return is shown as the conservative figure.');

  return {
    valid: true,
    isArb,
    impliedSum: sum,
    overroundPct: (sum - 1) * 100,
    theoreticalRoiPct: (1 / sum - 1) * 100,
    exactReturn,
    theoreticalProfit: exactReturn - totalStake,
    minReturn,
    minProfit: minReturn - totalStake,
    minRoiPct: (minReturn / totalStake - 1) * 100,
    maxReturn,
    totalStake,
    rounding,
    legs: calculatedLegs,
    errors: [],
    warnings,
    executableInTheory: isArb && !hasZeroStake && !belowMinStake && minReturn >= totalStake,
  };
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

/** Books do not use the same words for the same thing. */
function canonicalOutcomeKey(outcome, marketKey) {
  const raw = String(outcome || '').trim().toLowerCase();
  if (marketKey === 'double-chance') {
    if (/^(1x|home-or-draw|home\/draw)$/.test(raw)) return 'home-or-draw';
    if (/^(12|home-or-away|home\/away)$/.test(raw)) return 'home-or-away';
    if (/^(x2|draw-or-away|draw\/away)$/.test(raw)) return 'draw-or-away';
  }
  return outcome;
}

/** "Soccer" and "Football" mean the same sport to a punter. */
function canonicalSport(value) {
  const raw = String(value || '').trim();
  if (/^soccer$/i.test(raw)) return 'Football';
  return raw || 'other';
}

export function normalizeQuote(quote, index = 0) {
  const odds = parseOdds(quote.odds ?? quote.price);
  const bookmaker = normalizeBookmaker(quote.bookmaker || quote.book);
  const event = String(quote.event || quote.match || '').trim();
  const market = String(quote.market || quote.marketLabel || '').trim();
  const rules = String(quote.rules || quote.rulesKey || quote.settlement || 'unspecified').trim();
  const outcome = String(quote.outcome || quote.selection || '').trim();
  const way = Number(quote.way || quote.outcomeCount || 2);
  const minStake = Number(quote.minStake ?? quote.bookMinStake);
  return {
    ...quote,
    id: quote.id || `quote-${index + 1}`,
    eventId: String(quote.eventId || normalizeText(event).replace(/ /g, '-')).trim(),
    event,
    sport: String(quote.sport || 'other').trim(),
    competition: String(quote.competition || quote.league || '').trim(),
    startsAt: quote.startsAt || quote.kickoff || null,
    marketKey: String(quote.marketKey || normalizeText(market).replace(/ /g, '-')).trim(),
    market,
    rulesKey: normalizeText(rules).replace(/ /g, '-') || 'unspecified',
    rules,
    sport: canonicalSport(quote.sport || 'other'),
    bookmaker,
    bookmakerLabel: bookmakerLabel(bookmaker, quote.bookmakerLabel || quote.bookmaker),
    outcome: canonicalOutcomeKey(outcome, String(quote.marketKey || normalizeText(market).replace(/ /g, '-')).trim()),
    label: String(quote.label || quote.outcomeLabel || outcome).trim(),
    odds,
    way,
    minStake: Number.isFinite(minStake) && minStake > 0 ? minStake : null,
    url: quote.url || '',
    fetchedAt: quote.fetchedAt || quote.timestamp || null,
  };
}

/* ------------------------------------------------------------------ *
 * CROSS-BOOK MATCHING
 * Two books rarely write the same fixture the same way: "Manchester
 * United v AFC Bournemouth" vs "Man Utd vs Bournemouth", and one feed
 * may hand back a kick-off in UTC while another uses West Africa Time.
 * Matching on the raw string and the exact minute means the scanner
 * finds nothing in the real world.  These helpers match the fixture
 * itself, inside a time window, instead of the label.
 * ------------------------------------------------------------------ */

function splitFixture(event) {
  const parts = String(event || '')
    .split(/\s+(?:v|vs|x|versus|[-–—])\s+/i)
    .filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts[parts.length - 1]];
  return [String(event || ''), ''];
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    // "Cordoba" and "C\u00f3rdoba" are the same club: strip the accents
    // before anything else, or the two spellings never line up
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Two tokens name the same thing when they are the same word, or when one is
 * the beginning of the other ("manchester" and "man", "united" and "unite").
 *
 * A token that appears somewhere inside another word is NOT the same thing:
 * "enschede" contains "sc", and treating those as a match put
 * "Excelsior Rotterdam v FC Twente Enschede" and "SC Telstar v FC Utrecht" in
 * the same fixture, which invented arbs that did not exist.
 */
/** The short names one book uses for a club the other spells out. */
const TOKEN_ALIASES = {
  utd: 'united',
  spurs: 'tottenham',
  hotspur: 'tottenham',
  weds: 'wednesday',
};

function tokenSimilar(a, b) {
  if (a === b) return true;
  const left = TOKEN_ALIASES[a] || a;
  const right = TOKEN_ALIASES[b] || b;
  if (left === right) return true;
  if (left.length >= 3 && right.length >= 3 && (left.startsWith(right) || right.startsWith(left))) return true;
  return false;
}

/**
 * Words that say nothing about which club is meant. "FC", "SC", "Club",
 * "Deportivo" style prefixes are shared by thousands of teams, so they never
 * count as a match on their own.
 */
const NOISE_TOKENS = new Set([
  'fc', 'sc', 'ac', 'afc', 'cf', 'cd', 'ca', 'sa', 'sd', 'ss', 'as', 'us', 'un',
  'cd', 'ud', 'rc', 'club', 'clube', 'clubes', 'futebol', 'football', 'sports',
  'sport', 'de', 'da', 'do', 'dos', 'das', 'la', 'el', 'the', 'and', 'of',
  'calcio', 'ssc', 'cff', 'ffc', 'if', 'sk', 'bk', 'aik', 'ff', 'fs', 'sir',
]);

/** The tokens that actually carry the club's identity. */
function meaningful(tokens) {
  return tokens.filter((token) => token.length >= 3 && !NOISE_TOKENS.has(token));
}

/**
 * Words that appear in thousands of club names and so cannot tell two clubs
 * apart on their own.  A book may write "Deportes Tolima" where another
 * writes "CD Tolima": the extra word is noise, not a different club.  These
 * words are allowed to be extra on ONE side only - "Independiente Santa Fe"
 * and "Independiente del Valle" are different clubs, and the shared word
 * "independiente" must never carry a match on its own.
 */
const GENERIC_CLUB_WORDS = new Set([
  'deportivo', 'deportes', 'atletico', 'atletica', 'america', 'independiente',
  'sporting', 'sociedad', 'liga', 'league', 'futbol', 'futebol', 'athletic',
  'rc', 'club', 'cd', 'ad', 'ca', 'sd', 'sa', 'fc', 'cf', 'sc', 'ac',
]);

/**
 * Do these two sides name the same club?
 *
 * Every word of one side must be matched by a word of the other. The other
 * side may carry extra words, but only words that say nothing about which
 * club is meant ("CD Tolima" and "Deportes Tolima" are the same club; the
 * first has an abbreviation the second spells out).
 */
function sideMatches(aTokens, bTokens) {
  const left = meaningful(aTokens);
  const right = meaningful(bTokens);
  if (!left.length || !right.length) return false;
  const leftCovers = left.every((x) => right.some((y) => tokenSimilar(x, y)));
  const rightCovers = right.every((x) => left.some((y) => tokenSimilar(x, y)));
  if (leftCovers && rightCovers) return true;

  // one side may be the fuller spelling of the same name
  const extraLeft = left.filter((x) => !right.some((y) => tokenSimilar(x, y)));
  const extraRight = right.filter((x) => !left.some((y) => tokenSimilar(x, y)));
  if (rightCovers && extraRight.every((word) => GENERIC_CLUB_WORDS.has(word))) return true;
  if (leftCovers && extraLeft.every((word) => GENERIC_CLUB_WORDS.has(word))) return true;
  return false;
}


/**
 * The words that carry a club's name, in every form they might match.
 *
 * Two names match when one word starts with the other ("Man United" and
 * "Manchester United"), so every word is filed under each of its beginnings
 * as well as under itself.  A file can then be found by any of those
 * beginnings, and no match is lost.
 */
const fixtureWordsCache = new WeakMap();

function fixtureWords(quote) {
  const cached = fixtureWordsCache.get(quote);
  if (cached) return cached;
  const sides = fixtureSides(quote);
  const words = new Set();
  // only the home side is used: two prices are the same match when the home
  // team matches the home team, and the home names are the words that tell
  // one club from another
  for (const token of sides.home) {
    const word = TOKEN_ALIASES[token] || token;
    if (word.length < 3) continue;
    words.add(word);
    for (let length = 3; length < word.length; length += 1) words.add(word.slice(0, length));
  }
  fixtureWordsCache.set(quote, words);
  return words;
}

/** File a cluster under each of the words it carries. */
function indexWords(byWord, words, index) {
  for (const word of words) {
    const bucket = byWord.get(word);
    if (bucket) {
      if (bucket[bucket.length - 1] !== index) bucket.push(index);
    } else {
      byWord.set(word, [index]);
    }
  }
}

/** Are these two quotes about the same fixture? */
/**
 * The two sides of a fixture, taken apart once and kept.
 *
 * A scan compares every price with every price of the same market, and each
 * comparison used to take the names apart again - which, with a few thousand
 * prices, meant millions of short-lived lists of words and the Worker ran
 * out of memory.  The names are now taken apart once each.
 */
const fixtureSidesCache = new WeakMap();

function fixtureSides(quote) {
  let sides = fixtureSidesCache.get(quote);
  if (!sides) {
    const [home, away] = splitFixture(quote?.event);
    sides = { home: tokenize(home), away: tokenize(away) };
    fixtureSidesCache.set(quote, sides);
  }
  return sides;
}

export function sameFixture(a, b) {
  const ta = new Date(a.startsAt || '').getTime();
  const tb = new Date(b.startsAt || '').getTime();
  if (Number.isFinite(ta) && Number.isFinite(tb)
      && Math.abs(ta - tb) > TIME_WINDOW_MINUTES * 60000) return false;
  if (a.eventId && b.eventId && a.eventId === b.eventId) return true;

  const ah = fixtureSides(a);
  const bh = fixtureSides(b);
  // home must match home and away must match away: a book that lists the
  // sides the other way round is a different price, not the same fixture
  return sideMatches(ah.home, bh.home) && sideMatches(ah.away, bh.away);
}

function combinations(items, limit = 5000) {
  let output = [[]];
  for (const group of items) {
    const next = [];
    for (const prefix of output) {
      for (const item of group) {
        next.push([...prefix, item]);
        if (next.length >= limit) return next;
      }
    }
    output = next;
  }
  return output;
}

/** The kick-off of a price, in milliseconds. No kick-off sorts last. */
function startTime(quote) {
  const time = new Date(quote?.startsAt || '').getTime();
  return Number.isFinite(time) ? time : Infinity;
}

/**
 * Cluster quotes that belong to the same fixture.
 *
 * The quotes are looked at in the order they start, and a cluster that
 * starts long before the price being placed is left alone: two prices can
 * only be the same fixture when they start within the same window.  That
 * keeps the answer the same and keeps the work small when a book sends
 * thousands of prices.
 */
export function clusterFixtures(quotes) {
  const clusters = [];
  // The kick-off of every price is worked out once, not once per
  // comparison.  Sorting thousands of prices used to build a fresh date for
  // every comparison, and that alone was most of the work of a scan.
  const clusterWhen = [];
  const ordered = quotes
    .map((quote) => ({ quote, when: startTime(quote) }))
    .sort((a, b) => a.when - b.when);
  // A price can only belong to a match whose name shares a word with it, so
  // the clusters are kept in a list by word.  Without this every price was
  // compared with every other price of its market, and a book that sends a
  // full slate of five thousand prices used up the Worker's whole time.
  const byWord = new Map();
  for (const { quote, when } of ordered) {
    const words = fixtureWords(quote);
    const candidates = new Set();
    for (const word of words) {
      const bucket = byWord.get(word);
      if (!bucket) continue;
      for (const index of bucket) candidates.add(index);
    }
    let placed = false;
    let best = -1;
    // the newest cluster that holds this match wins, exactly as when every
    // cluster was checked one by one
    for (const index of candidates) {
      if (index <= best) continue;
      const cluster = clusters[index];
      const started = clusterWhen[index];
      if (Number.isFinite(when) && Number.isFinite(started)
          && when - started > TIME_WINDOW_MINUTES * 60000) continue;
      if (sameFixture(cluster[0], quote)) best = index;
    }
    if (best >= 0) {
      clusters[best].push(quote);
      indexWords(byWord, words, best);
      placed = true;
    }
    if (!placed) {
      clusters.push([quote]);
      clusterWhen.push(when);
      indexWords(byWord, words, clusters.length - 1);
    }
  }
  return clusters;
}

/**
 * Scan normalized quotes. Only exact market + settlement-rule groups are
 * compared, and the fixture itself is matched across books rather than by
 * label.  A match that has already started is never returned.
 */
export function scanOpportunities(rawQuotes, options = {}) {
  return scanWithClusters(rawQuotes, options).opportunities;
}

/**
 * The same scan, and the fixtures it grouped, so that the same grouping is
 * not worked out a second time by the report that follows it.
 */
export function scanWithClusters(rawQuotes, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const list = Array.isArray(rawQuotes) ? rawQuotes : [];
  // prices that have already been through the normaliser are used as they
  // are: with thousands of prices, a second copy of each one is what runs
  // the Worker out of memory
  const quotes = (options.alreadyNormalized ? list : list.map(normalizeQuote))
    .filter((quote) => quote.event && quote.market && quote.outcome && quote.bookmaker
      && quote.rulesKey !== 'unspecified' && Number.isFinite(quote.odds) && quote.odds > 1)
    // never offer a match that has already kicked off
    .filter((quote) => {
      if (!quote.startsAt) return true;
      const start = new Date(quote.startsAt).getTime();
      return !Number.isFinite(start) || start > now.getTime();
    });

  const maxQuoteAgeSeconds = Number(options.maxQuoteAgeSeconds || 0);
  const freshQuotes = maxQuoteAgeSeconds > 0
    ? quotes.filter((quote) => {
        if (!quote.fetchedAt) return false;
        const age = (now.getTime() - new Date(quote.fetchedAt).getTime()) / 1000;
        return Number.isFinite(age) && age >= -30 && age <= maxQuoteAgeSeconds;
      })
    : quotes;

  const groups = new Map();
  const rejected = [];
  for (const quote of freshQuotes) {
    const key = `${normalizeText(quote.sport)}|${quote.marketKey}|${quote.rulesKey}|${quote.way}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(quote);
  }

  const opportunities = [];
  const clustersByGroup = new Map();
  let rejectedCount = 0;
  for (const [groupKey, groupQuotes] of groups) {
    const fixtures = clusterFixtures(groupQuotes);
    clustersByGroup.set(groupKey, fixtures);
    for (const fixture of fixtures) {
      const outcomes = new Map();
      for (const quote of fixture) {
        if (!outcomes.has(quote.outcome)) outcomes.set(quote.outcome, []);
        outcomes.get(quote.outcome).push(quote);
      }
      // a match only one book lists cannot be compared with itself
      const booksHere = new Set(fixture.map((quote) => quote.bookmaker));
      if (booksHere.size < 2) {
        if (rejected.length < 200) {
          rejected.push({
            reason: 'only one book lists this match',
            market: fixture[0].market,
            event: fixture[0].event,
            outcomes: outcomes.size,
            way: fixture[0].way,
          });
        }
        rejectedCount += 1;
        continue;
      }

      const way = fixture[0].way;
      if (outcomes.size !== way || way < 2 || way > 3) {
        rejected.push({
          reason: outcomes.size > way ? 'more outcome keys than the market has ways' : 'market is not complete',
          market: fixture[0].market,
          event: fixture[0].event,
          outcomes: outcomes.size,
          way,
        });
        rejectedCount += 1;
        continue;
      }

      const perOutcome = [...outcomes.values()].map((outcomeQuotes) => {
        const unique = new Map();
        for (const quote of outcomeQuotes.sort((a, b) => b.odds - a.odds)) {
          const key = `${quote.bookmaker}|${quote.odds}`;
          if (!unique.has(key)) unique.set(key, quote);
        }
        return [...unique.values()].slice(0, 5);
      });

      let best = null;
      for (const legs of combinations(perOutcome)) {
        if (new Set(legs.map((leg) => leg.bookmaker)).size < 2) continue;
        // The prices are added up first.  Building the whole arbitrage -
        // the stakes, the returns, the warnings - for every combination of
        // every match was most of the work of a scan, and all of it was
        // thrown away unless the prices added up to less than one.
        const sum = legs.reduce((total, leg) => total + 1 / leg.odds, 0);
        if (sum >= 1 - 1e-10) continue;
        const result = calculateArbitrage(legs, {
          totalStake: options.totalStake || DEFAULT_STAKE,
          rounding: options.rounding ?? DEFAULT_ROUNDING,
        });
        if (!result.valid || !result.isArb || !result.executableInTheory) continue;
        if (!best || result.theoreticalRoiPct > best.theoreticalRoiPct) best = result;
      }
      if (best) {
        const first = fixture[0];
        opportunities.push({
          ...best,
          id: `${first.eventId}|${first.startsAt || 'unknown'}|${first.marketKey}|${first.rulesKey}`,
          eventId: first.eventId,
          event: first.event,
          sport: first.sport,
          competition: first.competition,
          startsAt: first.startsAt,
          market: first.market,
          marketKey: first.marketKey,
          rules: first.rules,
          rulesKey: first.rulesKey,
          way: first.way,
          quoteCount: fixture.length,
          latestQuoteAt: fixture.map((quote) => quote.fetchedAt).filter(Boolean).sort().at(-1) || null,
        });
      }
    }
  }

  opportunities.sort((a, b) => b.theoreticalRoiPct - a.theoreticalRoiPct);
  opportunities.rejectedGroups = rejected;
  opportunities.rejectedGroupCount = rejectedCount;
  return { opportunities, clustersByGroup };
}

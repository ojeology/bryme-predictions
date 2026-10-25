export const BOOKMAKERS = [
  { id: 'sportybet', label: 'SportyBet NG' },
  { id: 'nairabet', label: 'NairaBet' },
  { id: '22bet', label: '22Bet NG' },
  { id: '1xbet', label: '1xBet' },
  { id: 'livescorebet', label: 'LiveScore Bet NG' },
  { id: 'other', label: 'Other' },
];

export const DEFAULT_STAKE = 100000;
export const DEFAULT_ROUNDING = 100;

export function toFiniteNumber(value) {
  const number = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(number) ? number : NaN;
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
    const odds = toFiniteNumber(leg.odds);
    const bookmaker = normalizeBookmaker(leg.bookmaker) || 'other';
    if (!Number.isFinite(odds) || odds <= 1) errors.push(`Outcome ${index + 1}: decimal odds must be greater than 1.00.`);
    return {
      ...leg,
      id: leg.id || `leg-${index + 1}`,
      outcome: leg.outcome || `outcome-${index + 1}`,
      label: String(leg.label || leg.outcomeLabel || `Outcome ${index + 1}`).trim(),
      bookmaker,
      bookmakerLabel: bookmakerLabel(bookmaker, leg.bookmakerLabel || leg.bookmaker),
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

  if (hasZeroStake) warnings.push('The rounding increment leaves at least one outcome with a zero stake. Use a larger bankroll or smaller increment.');
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
    executableInTheory: isArb && !hasZeroStake && minReturn >= totalStake,
  };
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function normalizeQuote(quote, index = 0) {
  const odds = toFiniteNumber(quote.odds ?? quote.price);
  const bookmaker = normalizeBookmaker(quote.bookmaker || quote.book);
  const event = String(quote.event || quote.match || '').trim();
  const market = String(quote.market || quote.marketLabel || '').trim();
  const rules = String(quote.rules || quote.rulesKey || quote.settlement || 'unspecified').trim();
  const outcome = String(quote.outcome || quote.selection || '').trim();
  const way = Number(quote.way || quote.outcomeCount || 2);
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
    bookmaker,
    bookmakerLabel: bookmakerLabel(bookmaker, quote.bookmakerLabel || quote.bookmaker),
    outcome,
    label: String(quote.label || quote.outcomeLabel || outcome).trim(),
    odds,
    way,
    url: quote.url || '',
    fetchedAt: quote.fetchedAt || quote.timestamp || null,
  };
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

/** Scan normalized quotes. Only exact event + market + settlement-rule groups are compared. */
export function scanOpportunities(rawQuotes, options = {}) {
  const quotes = (Array.isArray(rawQuotes) ? rawQuotes : [])
    .map(normalizeQuote)
    .filter((quote) => quote.event && quote.market && quote.outcome && quote.bookmaker && quote.rulesKey !== 'unspecified' && Number.isFinite(quote.odds) && quote.odds > 1);
  const maxQuoteAgeSeconds = Number(options.maxQuoteAgeSeconds || 0);
  const now = options.now ? new Date(options.now) : new Date();
  const freshQuotes = maxQuoteAgeSeconds > 0
    ? quotes.filter((quote) => {
        if (!quote.fetchedAt) return false;
        const age = (now.getTime() - new Date(quote.fetchedAt).getTime()) / 1000;
        return Number.isFinite(age) && age >= -30 && age <= maxQuoteAgeSeconds;
      })
    : quotes;

  const groups = new Map();
  for (const quote of freshQuotes) {
    const startTime = new Date(quote.startsAt || '').getTime();
    const startKey = Number.isFinite(startTime) ? new Date(Math.floor(startTime / 60000) * 60000).toISOString() : 'unknown';
    const key = `${quote.eventId}|${normalizeText(quote.sport)}|${startKey}|${quote.marketKey}|${quote.rulesKey}|${quote.way}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(quote);
  }

  const opportunities = [];
  for (const group of groups.values()) {
    const outcomes = new Map();
    for (const quote of group) {
      if (!outcomes.has(quote.outcome)) outcomes.set(quote.outcome, []);
      outcomes.get(quote.outcome).push(quote);
    }
    const way = group[0].way;
    if (outcomes.size !== way || way < 2 || way > 3) continue;

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
      const result = calculateArbitrage(legs, {
        totalStake: options.totalStake || DEFAULT_STAKE,
        rounding: options.rounding ?? DEFAULT_ROUNDING,
      });
      if (!result.valid || !result.isArb || !result.executableInTheory) continue;
      if (!best || result.theoreticalRoiPct > best.theoreticalRoiPct) best = result;
    }
    if (best) {
      const first = group[0];
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
        quoteCount: group.length,
        latestQuoteAt: group.map((quote) => quote.fetchedAt).filter(Boolean).sort().at(-1) || null,
      });
    }
  }

  return opportunities.sort((a, b) => b.theoreticalRoiPct - a.theoreticalRoiPct);
}

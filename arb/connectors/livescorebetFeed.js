/**
 * Reading LiveScore Bet's gateway without exhausting the Worker.
 *
 * The gateway can hand over the whole football slate in one answer - but that
 * answer is nearly ten megabytes of JSON, and turning it into quotes needs
 * more memory than a Worker is given. So the book is read in pieces instead:
 *
 *   1. the league list, which says how many matches each competition has;
 *   2. the busiest competitions, one at a time, each a small answer.
 *
 * The pieces are released one by one, so only one of them is ever in memory.
 */
import { feedHeaders } from './feedHeaders.js';
import { flattenLiveScoreBet } from './livescorebet.js';

const FOOTBALL = 'SBTC1_1';

/**
 * The competitions that carry the games people actually bet on.
 *
 * The gateway's league list is ordered by how many matches each competition
 * has, and that puts the big reserve and lower divisions ahead of the
 * Premier League - so a slate built from the biggest competitions is full of
 * next month's football and misses the matches the other books are showing
 * today.  These are read first, and the rest of the budget is spent on the
 * largest remaining slates.
 */
const MAJOR_LEAGUES = [
  'England - Premier League', 'Spain - La Liga', 'Italy - Serie A', 'Germany - 1.Bundesliga',
  'France - Ligue 1', 'Champions League', 'Europa League', 'Conference League',
  'UEFA Nations League', 'Netherlands - Eredivisie', 'Portugal - Primeira Liga',
  'Belgium - First Division A', 'Turkey - Super League', 'Scotland - Premiership',
  'Switzerland - Super League', 'Austria - Bundesliga', 'Czech Republic - First League',
  'Croatia - 1.HNL', 'Serbia - SuperLiga', 'Poland - Ekstraklasa', 'Greece - Super League',
  'Israel - Premier League', 'Norway - Eliteserien', 'Sweden - Allsvenskan',
  'Denmark - Superligaen', 'Russia - Premier League', 'Ukraine - Premier League',
  'USA - MLS', 'Brazil - Serie A', 'Argentina - Liga Profesional', 'Mexico - Liga MX',
  'Chile - Primera League', 'Colombia - Primera', 'Ecuador - Liga Pro', 'Peru - Liga 1',
  'Paraguay - Primera Div', 'Uruguay - Primera Div', 'Japan - J1 League',
  'South Korea - K League 1', 'Australia - A-League', 'Saudi Arabia - Premier',
  'Nigeria - NPFL', 'South Africa - Premier Division', 'Ivory Coast - Ligue 1',
  'Egypt - Premier', 'Morocco - Botola', 'Canada - Premier League', 'Romania - Liga 1',
  'Slovakia - Nik', 'Hungary - OTP', 'Algeria - Ligue 1', 'Vietnam - V.League',
];

/** The major competitions first, then the biggest of the rest. */
function orderCompetitions(competitions) {
  const rank = new Map(MAJOR_LEAGUES.map((name, index) => [name.toLowerCase(), index]));
  const major = [];
  const rest = [];
  for (const competition of competitions) {
    const name = String(competition?.name || '').toLowerCase();
    const exact = rank.get(name);
    const partial = MAJOR_LEAGUES.findIndex((entry) => name.includes(entry.toLowerCase()));
    const position = exact ?? (partial >= 0 ? partial : -1);
    if (position >= 0) major.push({ competition, position });
    else rest.push(competition);
  }
  major.sort((a, b) => a.position - b.position);
  rest.sort((a, b) => (b?.counters?.totalNotStarted || 0) - (a?.counters?.totalNotStarted || 0));
  return [...major.map((entry) => entry.competition), ...rest];
}

async function getJson(url, { timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', ...feedHeaders(url) },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (text.length > 4_000_000) throw new Error('answer too large');
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

/** The gateway base, taken from whatever address was configured. */
export function gatewayBase(url) {
  const match = String(url || '').match(/^(https:\/\/[^/]+\/sportsbook\/gateway)/i);
  return match ? match[1] : String(url || '').replace(/\/view\/.*$/, '');
}

export function isLiveScoreBetGateway(url = '') {
  return /gateway-ng\.livescorebet\.com/i.test(String(url));
}

/**
 * @returns {Promise<{quotes: Array, competitions: number, error: Error|null}>}
 */
export async function fetchLiveScoreBetQuotes(url, { maxCompetitions = 28, timeoutMs = 12000 } = {}) {
  const base = gatewayBase(url);
  try {
    const leagues = await getJson(`${base}/v1/view/sport/leagues?sportcategoryid=${FOOTBALL}`, { timeoutMs });
    const competitions = orderCompetitions(
      (leagues?.competitions || [])
        .flatMap((category) => category?.childs || [])
        .filter((competition) => (competition?.counters?.totalNotStarted || 0) > 0),
    ).slice(0, maxCompetitions);

    const quotes = [];
    for (const competition of competitions) {
      let payload = null;
      try {
        payload = await getJson(
          `${base}/v3/view/events/matches?sportcategoryid=${FOOTBALL}&categoryid=${encodeURIComponent(competition.id)}`,
          { timeoutMs },
        );
        quotes.push(...flattenLiveScoreBet(payload, { bookmaker: 'livescorebet' }));
      } catch {
        // one competition that will not answer does not stop the others
      }
      payload = null;
    }
    return { quotes, competitions: competitions.length, error: null };
  } catch (error) {
    return { quotes: [], competitions: 0, error };
  }
}

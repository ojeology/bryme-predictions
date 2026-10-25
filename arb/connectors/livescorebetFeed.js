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
export async function fetchLiveScoreBetQuotes(url, { maxCompetitions = 20, timeoutMs = 12000 } = {}) {
  const base = gatewayBase(url);
  try {
    const leagues = await getJson(`${base}/v1/view/sport/leagues?sportcategoryid=${FOOTBALL}`, { timeoutMs });
    const competitions = (leagues?.competitions || [])
      .flatMap((category) => category?.childs || [])
      .filter((competition) => (competition?.counters?.totalNotStarted || 0) > 0)
      .sort((a, b) => (b.counters?.totalNotStarted || 0) - (a.counters?.totalNotStarted || 0))
      .slice(0, maxCompetitions);

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

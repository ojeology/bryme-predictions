/**
 * The 1xBet / 22Bet family "LineFeed" payload.
 *
 * A lot of sportsbooks (1xBet, 22Bet and their clones) publish their pre-match
 * prices through one JSON endpoint whose payload looks like this:
 *
 *   { "Sports": [ { "Name": "Soccer",
 *       "Competitions": [ { "Name": "England - Premier League",
 *           "Participants": [ { "Id": 1, "Name": "Arsenal" } ],
 *           "Events": [ { "Id": 9, "StartTime": 1760000000, "Home": 1, "Away": 2,
 *               "Outcomes": [ { "O": "Arsenal", "Od": "1.85" },
 *                             { "O": "Draw",   "Od": "3.40" } ] } ] } ] } ] }
 *
 * The field names are capitalised, the odds are strings, the start time is a
 * unix timestamp and the outcomes are named after the teams - so the generic
 * normaliser cannot read it. This adapter turns it into the same flat quote
 * list every other book produces.
 */
import { canonicalMarketKey } from './normalize.js';

export function isLineFeed(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  if (Array.isArray(payload.Sports)) {
    return payload.Sports.some((sport) => Array.isArray(sport?.Competitions));
  }
  return false;
}

function participantName(competition, id) {
  if (id === undefined || id === null) return '';
  const list = Array.isArray(competition?.Participants) ? competition.Participants : [];
  const found = list.find((participant) => String(participant?.Id) === String(id));
  return String(found?.Name || '');
}

function isoFromUnix(value) {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const millis = seconds > 1e12 ? seconds : seconds * 1000;
  const date = new Date(millis);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Outcome label -> the canonical side, so two books can be compared. */
function sideFor(label, homeName, awayName) {
  const raw = String(label || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw === 'draw' || raw === 'x' || raw === 'tie') return 'draw';
  if (homeName && raw === homeName.trim().toLowerCase()) return 'home';
  if (awayName && raw === awayName.trim().toLowerCase()) return 'away';
  return '';
}

export function flattenLineFeed(payload, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const quotes = [];

  const pushEvent = (event, competition, sport) => {
    if (!event || typeof event !== 'object') return;
    const outcomes = Array.isArray(event.Outcomes) ? event.Outcomes : [];
    if (!outcomes.length) return;
    const homeName = participantName(competition, event.Home);
    const awayName = participantName(competition, event.Away);
    if (!homeName || !awayName) return;
    const eventName = `${homeName} v ${awayName}`;
    const startsAt = isoFromUnix(event.StartTime ?? event.StartTimeUTC ?? event.ScheduledStartTime);
    const marketName = 'Match Result';

    for (const outcome of outcomes) {
      const odds = Number(outcome?.Od ?? outcome?.Odds ?? outcome?.odds);
      if (!Number.isFinite(odds) || odds <= 1) return;
      const side = sideFor(outcome?.O, homeName, awayName);
      if (!side) continue;
      quotes.push({
        event: eventName,
        eventId: String(event.Id ?? eventName),
        sport: sport?.Name || 'Football',
        competition: competition?.Name || '',
        startsAt,
        market: marketName,
        marketKey: canonicalMarketKey(marketName, 'match_result'),
        rules: '90-minutes',
        rulesKey: '90-minutes',
        way: 3,
        outcome: side,
        label: side === 'home' ? homeName : side === 'away' ? awayName : 'Draw',
        bookmaker: options.bookmaker,
        odds,
        minStake: options.minStake ?? null,
        fetchedAt: now.toISOString(),
        url: '',
      });
    }
  };

  for (const sport of (Array.isArray(payload?.Sports) ? payload.Sports : [])) {
    for (const competition of (Array.isArray(sport?.Competitions) ? sport.Competitions : [])) {
      for (const event of (Array.isArray(competition?.Events) ? competition.Events : [])) {
        pushEvent(event, competition, sport);
      }
    }
  }
  return quotes;
}

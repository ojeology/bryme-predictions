/**
 * BetKing (Nigeria).
 *
 * BetKing runs on the Betagy sportsbook platform, with prices fed by
 * Sportradar.  Its own web app asks its own price service for the day's
 * matches; the answer is shaped like:
 *
 *   [ {
 *       AreaMatches: [
 *         {
 *           SportID, SportName,
 *           Area: { AreaID, AreaName },
 *           Items: [                      a match
 *             {
 *               ItemID, SmartBetCode,
 *               ItemName: "Fleetwood - Arsenal",
 *               ItemDate: "2026-10-27T21:00:00+01:00",
 *               TournamentName, CategoryName,
 *               Teams: [],
 *               OddsCollection: [        a market
 *                 {
 *                   OddsType: { OddsTypeID, OddsTypeName: "1X2" },
 *                   MatchOdds: [          a price
 *                     {
 *                       SmartBetCode,               which match it belongs to
 *                       OddAttribute: { OddTypeID, OddName: "1" },
 *                       Outcome: { OddOutcome: 1.62, ScheduleStatus: 0 }
 *                     }
 *                   ]
 *                 }
 *               ]
 *             }
 *           ]
 *         }
 *       ]
 *     } ]
 *
 * Only markets whose settlement rule is unambiguous are translated.  The
 * scanner must never compare two prices that settle differently, so
 * "1X2 - (1up)", "1X2 - Half-Time UP" and friends are left out, not
 * guessed at.
 */
import { canonicalOutcome, slug } from './normalize.js';

export function isBetking(payload) {
  const root = Array.isArray(payload) ? payload[0] : payload;
  if (!root || typeof root !== 'object') return false;
  if (!Array.isArray(root?.AreaMatches)) return false;
  return root.AreaMatches.some((area) => Array.isArray(area?.Items)
    && area.Items.some((item) => Array.isArray(item?.OddsCollection)));
}

/** The market and the rule it settles under, or nothing when it is unclear. */
function marketIdentity(name) {
  const raw = String(name || '').trim();

  if (/^1x2$/i.test(raw)) {
    return { key: 'match-result-1x2', name: '1X2', rules: '90-minutes', way: 3 };
  }
  if (/^double chance$/i.test(raw)) {
    return { key: 'double-chance', name: 'Double Chance', rules: '90-minutes', way: 2 };
  }
  if (/^total goals ([\d.]+)$/i.test(raw)) {
    return { key: 'goals', name: raw, line: raw.replace(/^total goals /i, ''), rules: '90-minutes', way: 2 };
  }
  if (/^gg\/ng$/i.test(raw)) {
    return { key: 'both-teams-to-score', name: 'Both Teams To Score', rules: '90-minutes', way: 2 };
  }
  if (/^draw no bet$/i.test(raw)) {
    return { key: 'draw-no-bet', name: 'Draw No Bet', rules: '90-minutes', way: 2 };
  }
  // everything else (1up / 2up, half-time, player props, correct score)
  // settles differently from book to book - it is left alone
  return null;
}

/** "Fleetwood - Arsenal" -> ["Fleetwood", "Arsenal"] */
function splitTeams(name) {
  const raw = String(name || '').trim();
  const parts = raw.split(/\s+-\s+/).filter(Boolean);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(' - ')];
  return [raw, ''];
}

/** BetKing writes "GG" and "NG"; every other book writes Yes and No. */
function bttsOutcome(label) {
  const raw = String(label || '').trim().toLowerCase();
  if (raw === 'gg' || raw === 'yes') return 'yes';
  if (raw === 'ng' || raw === 'no') return 'no';
  return null;
}

export function flattenBetking(payload, options = {}) {
  const bookmaker = options.bookmaker || 'betking';
  const now = options.now ? new Date(options.now) : new Date();
  const quotes = [];
  const root = Array.isArray(payload) ? payload[0] : payload;

  for (const area of root?.AreaMatches || []) {
    const sport = String(area?.SportName || 'Football');
    for (const item of area?.Items || []) {
      const [home, away] = splitTeams(item?.ItemName);
      if (!home || !away) continue;

      const startsAt = item?.ItemDate ? new Date(item.ItemDate).toISOString() : null;
      const eventName = `${home} v ${away}`;
      const competition = String(item?.TournamentName || item?.CategoryName || '');
      const eventCode = item?.SmartBetCode;

      for (const collection of item?.OddsCollection || []) {
        const identity = marketIdentity(collection?.OddsType?.OddsTypeName);
        if (!identity) continue;

        for (const price of collection?.MatchOdds || []) {
          // a collection holds prices for several matches; keep only the
          // ones that belong to this match
          if (eventCode !== undefined && price?.SmartBetCode !== undefined
            && price.SmartBetCode !== eventCode) continue;

          const outcome = price?.Outcome || {};
          if (outcome?.ScheduleStatus === 1) continue;
          const odds = Number(outcome?.OddOutcome);
          if (!Number.isFinite(odds) || odds <= 1) continue;

          const label = String(price?.OddAttribute?.OddName || '').trim();
          if (!label) continue;

          let marketKey = identity.key;
          let outcomeKey = null;

          if (identity.key === 'match-result-1x2') {
            outcomeKey = canonicalOutcome(label, identity.key);
            if (!['home', 'draw', 'away'].includes(outcomeKey)) continue;
          } else if (identity.key === 'double-chance') {
            const compact = label.replace(/\s+/g, '').toLowerCase();
            if (!/^(1x|12|x2)$/.test(compact)) continue;
            outcomeKey = compact;
          } else if (identity.key === 'goals') {
            if (!/^over$|^under$/i.test(label)) continue;
            if (!identity.line) continue;
            outcomeKey = /^over$/i.test(label) ? 'over' : 'under';
            marketKey = `goals-${identity.line}`;
          } else if (identity.key === 'both-teams-to-score') {
            outcomeKey = bttsOutcome(label);
            if (!outcomeKey) continue;
          } else if (identity.key === 'draw-no-bet') {
            const compact = label.replace(/\s+/g, ' ').toLowerCase();
            if (/^1\b/.test(compact)) outcomeKey = 'home';
            else if (/^2\b/.test(compact)) outcomeKey = 'away';
            else continue;
          }
          if (!outcomeKey) continue;

          quotes.push({
            event: eventName,
            eventId: item?.ItemID ? `bk-${item.ItemID}` : slug(eventName),
            sport,
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

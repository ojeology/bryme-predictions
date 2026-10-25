import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateArbitrage, normalizeBookmaker, scanOpportunities } from '../src/lib/arbitrage.js';

const closeTo = (actual, expected, tolerance = 0.01) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} was not within ${tolerance} of ${expected}`);
};

test('two-way NGN example preserves the bankroll and a positive rounded edge', () => {
  const result = calculateArbitrage([
    { outcome: 'over', label: 'Over 154.5', bookmaker: 'sportybet', odds: 2.25 },
    { outcome: 'under', label: 'Under 154.5', bookmaker: 'nairabet', odds: 1.8334 },
  ], { totalStake: 100000, rounding: 100 });
  assert.equal(result.valid, true);
  assert.equal(result.isArb, true);
  assert.equal(result.legs.reduce((sum, leg) => sum + leg.stake, 0), 100000);
  assert.ok(result.theoreticalRoiPct > 1 && result.theoreticalRoiPct < 1.1);
  assert.ok(result.minProfit > 0);
  assert.ok(result.legs.every((leg) => leg.stake % 100 === 0));
});

test('a normal bookmaker margin is not reported as arbitrage', () => {
  const result = calculateArbitrage([
    { outcome: 'home', bookmaker: 'sportybet', odds: 1.8 },
    { outcome: 'away', bookmaker: 'nairabet', odds: 1.9 },
  ]);
  assert.equal(result.valid, true);
  assert.equal(result.isArb, false);
  assert.ok(result.impliedSum > 1);
  assert.ok(result.theoreticalProfit < 0);
});

test('three-way 1X2 calculates three stakes and conservative rounded return', () => {
  const result = calculateArbitrage([
    { outcome: 'home', bookmaker: 'sportybet', odds: 4.2 },
    { outcome: 'draw', bookmaker: 'nairabet', odds: 4.0 },
    { outcome: 'away', bookmaker: '22bet', odds: 4.5 },
  ], { totalStake: 50000, rounding: 50 });
  assert.equal(result.isArb, true);
  assert.equal(result.legs.length, 3);
  assert.equal(result.legs.reduce((sum, leg) => sum + leg.stake, 0), 50000);
  closeTo(result.minReturn, Math.min(...result.legs.map((leg) => leg.returnAmount)));
});

test('invalid odds and duplicate outcomes are rejected', () => {
  const invalidOdds = calculateArbitrage([{ outcome: 'a', odds: 1 }, { outcome: 'b', odds: 2 }]);
  assert.equal(invalidOdds.valid, false);
  const duplicate = calculateArbitrage([{ outcome: 'a', odds: 2.1 }, { outcome: 'a', odds: 2.2 }]);
  assert.equal(duplicate.valid, false);
});

test('rounding cannot silently change the requested total stake', () => {
  const result = calculateArbitrage([
    { outcome: 'a', bookmaker: 'sportybet', odds: 2.2 },
    { outcome: 'b', bookmaker: 'nairabet', odds: 2.0 },
  ], { totalStake: 10000, rounding: 1000 });
  assert.equal(result.legs.reduce((sum, leg) => sum + leg.stake, 0), 10000);
  assert.ok(result.legs.every((leg) => leg.stake % 1000 === 0));
});

test('an edge destroyed by rounding is not executable or returned by the scanner', () => {
  const legs = [
    { outcome: 'home', label: 'Alpha', bookmaker: 'sportybet', odds: 2.2 },
    { outcome: 'away', label: 'Beta', bookmaker: 'nairabet', odds: 2.0 },
  ];
  const result = calculateArbitrage(legs, { totalStake: 100, rounding: 100 });
  assert.equal(result.isArb, true);
  assert.equal(result.executableInTheory, false);
  assert.ok(result.minProfit < 0);
  const opportunities = scanOpportunities([
    quote({ ...legs[0] }),
    quote({ ...legs[1] }),
  ], { now, totalStake: 100, rounding: 100 });
  assert.equal(opportunities.length, 0);
});

const future = '2027-01-15T15:00:00.000Z';
const now = '2027-01-15T12:00:00.000Z';
const quote = (patch = {}) => ({
  event: 'Alpha vs Beta',
  sport: 'Football',
  startsAt: future,
  market: '1X2',
  way: 2,
  rules: '90 minutes',
  fetchedAt: now,
  ...patch,
});

test('scanner finds the best cross-book two-way combination', () => {
  const opportunities = scanOpportunities([
    quote({ outcome: 'home', label: 'Alpha', bookmaker: 'sportybet', odds: 2.2 }),
    quote({ outcome: 'away', label: 'Beta', bookmaker: 'nairabet', odds: 2.0 }),
    quote({ outcome: 'away', label: 'Beta', bookmaker: '22bet', odds: 1.8 }),
  ], { now, totalStake: 100000, rounding: 100 });
  assert.equal(opportunities.length, 1);
  assert.equal(opportunities[0].legs.length, 2);
  assert.equal(opportunities[0].legs.find((leg) => leg.outcome === 'away').bookmaker, 'nairabet');
});

test('scanner refuses mismatched settlement rules', () => {
  const opportunities = scanOpportunities([
    quote({ outcome: 'over', market: 'Total 2.5', bookmaker: 'sportybet', odds: 2.2, rules: 'includes overtime' }),
    quote({ outcome: 'under', market: 'Total 2.5', bookmaker: 'nairabet', odds: 2.0, rules: 'regulation only' }),
  ], { now });
  assert.equal(opportunities.length, 0);
});

test('scanner refuses quotes with unspecified rules', () => {
  const opportunities = scanOpportunities([
    quote({ outcome: 'over', bookmaker: 'sportybet', odds: 2.2, rules: undefined }),
    quote({ outcome: 'under', bookmaker: 'nairabet', odds: 2.0, rules: undefined }),
  ], { now });
  assert.equal(opportunities.length, 0);
});

test('scanner does not mix different lines or incomplete markets', () => {
  assert.equal(scanOpportunities([
    quote({ outcome: 'over', market: 'Total 2.5', bookmaker: 'sportybet', odds: 2.2 }),
    quote({ outcome: 'under', market: 'Total 3.5', bookmaker: 'nairabet', odds: 2.0 }),
  ], { now }).length, 0);
  assert.equal(scanOpportunities([
    quote({ outcome: 'over', bookmaker: 'sportybet', odds: 2.2 }),
  ], { now }).length, 0);
});

test('scanner rejects stale quotes when a freshness limit is requested', () => {
  const opportunities = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2, fetchedAt: '2027-01-15T11:50:00.000Z' }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0, fetchedAt: '2027-01-15T11:50:00.000Z' }),
  ], { now, maxQuoteAgeSeconds: 300 });
  assert.equal(opportunities.length, 0);
});

test('scanner requires at least two bookmakers and all outcomes', () => {
  const opportunities = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2 }),
    quote({ outcome: 'away', bookmaker: 'sportybet', odds: 2.0 }),
  ], { now });
  assert.equal(opportunities.length, 0);
});

test('scanner separates identical event names on different dates', () => {
  const opportunities = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2 }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0, startsAt: '2027-01-16T15:00:00.000Z' }),
  ], { now });
  assert.equal(opportunities.length, 0);
});

test('unknown feed bookmakers keep distinct identities', () => {
  assert.equal(normalizeBookmaker('My Local Book'), 'mylocalbook');
  assert.equal(normalizeBookmaker('SportyBet NG'), 'sportybet');
  assert.equal(normalizeBookmaker('22Bet NG'), '22bet');
});

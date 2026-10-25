import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateArbitrage, parseOdds, scanOpportunities, sameFixture } from '../src/lib/arbitrage.js';

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

/* ---- regression tests for the six issues found in the review ---- */

test('a comma-decimal price is read as a decimal, not as a huge number', () => {
  assert.equal(parseOdds('2,10'), 2.1);
  assert.equal(parseOdds('2.10'), 2.1);
  assert.equal(parseOdds(2.1), 2.1);
  // ambiguous three-digit comma form is rejected rather than guessed
  assert.ok(Number.isNaN(parseOdds('1,850')));
});

test('a comma-decimal price can never manufacture an arbitrage', () => {
  const result = calculateArbitrage([
    { outcome: 'home', bookmaker: 'sportybet', odds: '2,10' },
    { outcome: 'away', bookmaker: 'nairabet', odds: '2,05' },
  ]);
  // the price must be read as 2.10, not as 210: the edge is a few percent,
  // never the 10,000% that the old comma-stripping produced
  assert.equal(result.legs[0].odds, 2.1);
  assert.ok(result.theoreticalRoiPct < 5, `roi was ${result.theoreticalRoiPct}`);
});

test('an ambiguous price is dropped instead of scanned as a quote', () => {
  const opportunities = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: '1,850' }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0 }),
  ], { now });
  assert.equal(opportunities.length, 0);
});

test('a match that has already started is never returned', () => {
  const started = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2, startsAt: '2026-01-01T15:00:00.000Z' }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0, startsAt: '2026-01-01T15:00:00.000Z' }),
  ], { now });
  assert.equal(started.length, 0);
});

test('two books that quote kick-off one minute apart are still paired', () => {
  const drift = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2, startsAt: '2027-01-15T15:00:00.000Z' }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0, startsAt: '2027-01-15T15:01:00.000Z' }),
  ], { now });
  assert.equal(drift.length, 1);
});

test('two books in different timezones are still paired', () => {
  const tz = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2, startsAt: '2027-01-15T16:00:00.000Z' }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0, startsAt: '2027-01-15T15:00:00.000Z' }),
  ], { now });
  assert.equal(tz.length, 1);
});

test('two books that name the fixture differently are still paired', () => {
  const named = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2, event: 'Manchester United v AFC Bournemouth' }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0, event: 'Man Utd vs Bournemouth' }),
  ], { now });
  assert.equal(named.length, 1);
});

test('different fixtures on the same day are never paired', () => {
  const different = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2, event: 'Alpha vs Beta' }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0, event: 'Gamma vs Delta' }),
  ], { now });
  assert.equal(different.length, 0);
});

test('the same fixture on a different date is never paired', () => {
  const nextDay = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2 }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0, startsAt: '2027-01-16T15:00:00.000Z' }),
  ], { now });
  assert.equal(nextDay.length, 0);
});

test('a stake under the bookmaker minimum is not executable', () => {
  const result = calculateArbitrage([
    { outcome: 'home', bookmaker: 'sportybet', odds: 2.2, minStake: 5000 },
    { outcome: 'away', bookmaker: 'nairabet', odds: 2.0, minStake: 5000 },
  ], { totalStake: 1000, rounding: 100 });
  assert.equal(result.isArb, true);
  assert.equal(result.executableInTheory, false);
  assert.ok(result.warnings.some((w) => /minimum stake/i.test(w)));
});

test('a market with a stray third outcome key is reported, not silently dropped', () => {
  const opportunities = scanOpportunities([
    quote({ outcome: 'home', bookmaker: 'sportybet', odds: 2.2 }),
    quote({ outcome: 'away', bookmaker: 'nairabet', odds: 2.0 }),
    quote({ outcome: 'half-time', bookmaker: '22bet', odds: 3.0 }),
  ], { now });
  assert.equal(opportunities.length, 0);
  assert.ok(opportunities.rejectedGroupCount >= 1);
});

test('the fixture matcher rejects two clearly different teams', () => {
  assert.equal(sameFixture(
    { event: 'Manchester United v AFC Bournemouth', startsAt: future },
    { event: 'Liverpool v Chelsea', startsAt: future },
  ), false);
});

test('a club prefix never makes two different fixtures match', () => {
  // "FC", "SC" and a two-letter fragment inside a longer word used to be
  // enough to put two unrelated matches in one fixture - which invented arbs
  assert.equal(sameFixture(
    { event: 'Excelsior Rotterdam v FC Twente Enschede', startsAt: future },
    { event: 'SC Telstar v FC Utrecht', startsAt: future },
  ), false);
  assert.equal(sameFixture(
    { event: 'FC Santa Coloma v Inter Club d Escalades', startsAt: future },
    { event: 'Alkmaar v FC Twente Enschede', startsAt: future },
  ), false);
  assert.equal(sameFixture(
    { event: 'Jaguares de Cordoba v Llaneros F.C.', startsAt: future },
    { event: 'Club Bolivar v FC Universitario de Vinto', startsAt: future },
  ), false);
});

test('the same fixture written two ways still matches', () => {
  assert.equal(sameFixture(
    { event: 'Alkmaar v FC Twente Enschede', startsAt: future },
    { event: 'AZ Alkmaar v FC Twente Enschede', startsAt: future },
  ), true);
  assert.equal(sameFixture(
    { event: 'Manchester United v Liverpool', startsAt: future },
    { event: 'Man Utd v Liverpool FC', startsAt: future },
  ), true);
  assert.equal(sameFixture(
    { event: 'Tottenham Hotspur v Arsenal', startsAt: future },
    { event: 'Spurs v Arsenal', startsAt: future },
  ), true);
});

test('one side matching is never enough', () => {
  assert.equal(sameFixture(
    { event: 'Real Madrid v Barcelona', startsAt: future },
    { event: 'Real Madrid v Atletico Madrid', startsAt: future },
  ), false);
  assert.equal(sameFixture(
    { event: 'Ajax v Feyenoord', startsAt: future },
    { event: 'Ajax v PSV', startsAt: future },
  ), false);
});

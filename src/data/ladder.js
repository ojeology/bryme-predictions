/**
 * BRYME Bot Lab — Official 3.00x Pure OVER Rollover Challenge (v6)
 *
 * Strategy Mathematics (Why 3.00x Beats 2.00x):
 * - Daily Stake: ₦1,000
 * - Monthly Risk Cap (30 tries × ₦1,000): ₦30,000
 * - 4 Consecutive ~3.00x Pure OVER Wins:
 *     Step 1 (Fri 23 Oct LIVE): ₦1,000 × 3.036 = ₦3,036
 *     Step 2 (Sat 24 Oct):      ₦3,036 × 3.000 = ₦9,108
 *     Step 3 (Sun 25 Oct):      ₦9,108 × 3.000 = ₦27,324
 *     Step 4 (Target Goal):    ₦27,324 × 3.000 = ₦81,972  --> Covers ENTIRE ₦30,000 month + ₦51,972 NET PROFIT!
 *     Optional Step 5:         ₦81,972 × 3.000 = ₦245,916
 *     Optional Step 6:        ₦245,916 × 3.000 = ₦737,748
 *
 * Standing Rules:
 * - STRICT PURE OVER BEHAVIOUR ONLY (Corners Over, Fouls Over, Tackles Over, Cards Over, Shots/SOT Over)
 * - ZERO Under markets, ZERO Goal / BTTS markets
 * - ONLY Real Published Bookmaker Lines (22Bet Primary + SportyBet Secondary)
 */

export const LADDER_CONFIG = {
  version: '3odds-pure-over-v6',
  startingStake: 1000,
  currency: 'NGN',
  currencySymbol: '₦',
  targetGoal: 81972,
  extendedGoalStep6: 737748,
  dailyTargetOdds: 3.00,
  bankingMilestoneDay: 4,
  bankingPercentage: 100,
  theoreticalWinsNeededRaw: 4,
  rulesSummary: [
    'Starts at Step 1 (Friday 23 Oct 2026) with ₦1,000 stake on our verified 6-Leg 22Bet 3.036x Pure OVER Ticket.',
    '4 consecutive ~3.00x wins turn ₦1,000 → ₦3,036 → ₦9,108 → ₦27,324 → ₦81,972 (covering 30 days × ₦1,000 = ₦30,000 + ₦51,972 pure net profit with 1 four-streak all month!).',
    'STRICT OVER-ONLY RULE: Zero Under markets and Zero Goal markets — only 90%–100% Two-Team OVER Corners, Fouls, Cards, Tackles & SOT floors.',
    'REAL BOOKMAKER LINE RULE: Every leg is audited against actual live 22Bet / SportyBet lines prior to kick-off (all theoretical low-line traps rejected).',
    'At Step 4 (₦81,972), bank full monthly profit or optionally roll a fraction into Step 5 (₦245,916) & Step 6 (₦737,748).'
  ]
};

export const ACTIVE_CHALLENGE = {
  version: '3odds-pure-over-v6',
  challengeNumber: 1,
  challengeType: '3.00x Pure OVER Rollover',
  status: 'active',
  startDate: '2026-10-23',
  currentDay: 1,
  totalSteps: 4,
  startingStake: 1000,
  currentBalance: 1000,
  nextPotentialBalance: 3036,
  step4GoalBalance: 81972,
  bankedAmount: 0,
  todaysCode: '22BET-6LEG-3.036X',
  bookmaker: '22Bet (Official Placed Ticket) / SportyBet 3.17x Alt',
  sportyCode: 'SPORTY-4LEG-3.17X',
  footballCode: 'SPORTY-4LEG-3.17X',
  dailyOdds: 3.036,
  selections: [
    {
      match: 'Elfsborg vs Malmö FF',
      league: 'Sweden Allsvenskan',
      kickoff: '18:00 WAT',
      market: 'Corners — Total 2: Over 2.5',
      pick: 'Malmö FF (Away) Over 2.5 Corners — Model: 5 (14/14 = 100% Malmö | 25/27 = 92.6% 2-Team)',
      odds: 1.12,
      status: 'pending'
    },
    {
      match: 'Go Ahead Eagles vs Telstar',
      league: 'Netherlands Eredivisie',
      kickoff: '19:00 WAT',
      market: 'Corners — Total 1: Over 4.5',
      pick: 'Go Ahead Eagles (Home) Over 4.5 Corners — Model: 8 (8/8 = 100% Two-Sided Venue | Telstar 8.75 ag/g)',
      odds: 1.20,
      status: 'pending'
    },
    {
      match: 'Granada vs Real Valladolid',
      league: 'Spain La Liga 2',
      kickoff: '19:30 WAT',
      market: 'Yellow Cards — Total 2: Over 1.5',
      pick: 'Real Valladolid (Away) Over 1.5 Yellow Cards — Model: 4 (10/10 = 100% Season + Ref Marta Huerta 3/3 = 100% Away 3+ Cards)',
      odds: 1.24,
      status: 'pending'
    },
    {
      match: 'VfB Stuttgart vs Borussia Mönchengladbach',
      league: 'Germany Bundesliga',
      kickoff: '19:30 WAT',
      market: 'Fouls — Total: Over 18.5',
      pick: 'Match Total Fouls Over 18.5 — Model: 23 (13/13 = 100% since Sept 5 [min 21] | 14/15 = 93.3% Season)',
      odds: 1.31,
      status: 'pending'
    },
    {
      match: 'Empoli vs Vicenza Calcio',
      league: 'Italy Serie B',
      kickoff: '19:30 WAT',
      market: 'Corners — Total 2: Over 2.5',
      pick: 'Vicenza Calcio (Away) Over 2.5 Corners — Model: 6 (7/7 = 100% Venue | 8/8 = 100% Vicenza Season)',
      odds: 1.15,
      status: 'pending'
    },
    {
      match: 'Torino vs Monza 1912',
      league: 'Italy Serie A',
      kickoff: '19:45 WAT',
      market: 'Corners — Total 2: Over 2.5',
      pick: 'Monza 1912 (Away) Over 2.5 Corners — Model: 5 (10/10 = 100% Venue + Won 8 Corners at Torino Sept 1!)',
      odds: 1.21,
      status: 'pending'
    }
  ],
  daysHistory: [
    {
      day: 1,
      date: '2026-10-23 (LIVE TONIGHT)',
      stake: 1000,
      payout: 3036,
      result: 'pending',
      summary: '22Bet 6-Leg Pure OVER Ticket @ 3.036x (18:00–19:45 WAT) — FT Auto-Grade at 21:45 WAT'
    }
  ]
};

export const PAST_CHALLENGES = [
  {
    challengeNumber: 0,
    startDate: '2026-10-22',
    endDate: '2026-10-22',
    dayReached: 1,
    startingStake: 1000,
    bankedAmount: 2310,
    outcome: 'milestone-secured',
    fatalMatch: 'Thursday UEFA 2.31x 3/3 WON ✅ — Upgraded to 3.00x Pure OVER System on 23 Oct'
  }
];

export const LADDER_AGGREGATE_STATS = {
  challengesStarted: 1,
  completedChallenges: 0,
  milestonesSecuredDay6: 1,
  averageDayReached: 'Day 1 Live (3.036x)',
  longestStreak: 'Thursday 4/4 Slips WON + Day 1 3.036x Live',
  totalStakedNGN: 1000,
  totalBankedNGN: 0,
  netProfitLossDemo: 'Day 1 Live (₦1,000 → ₦3,036 Tonight)',
  daysDistribution: [
    { dayLabel: 'Step 1 (₦3,036)', count: 1, percentage: 100 },
    { dayLabel: 'Step 2 (₦9,108)', count: 0, percentage: 0 },
    { dayLabel: 'Step 3 (₦27,324)', count: 0, percentage: 0 },
    { dayLabel: 'Step 4 Goal (₦81,972)', count: 0, percentage: 0 }
  ]
};

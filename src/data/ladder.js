/**
 * BRYME Predictions - The Ladder Rollover Challenge
 * 
 * Signature feature specifications:
 * - Starting stake: 1,000 NGN
 * - Target: 1,000,000 NGN
 * - Daily target odds: ~1.50
 * - Milestone rule: On Day 6 win, bank 50% of current accumulated purse and roll remaining 50%.
 * - On loss: Challenge terminates; next numbered challenge starts immediately.
 * 
 * CRITICAL TRANSPARENCY REQUIREMENT:
 * Reaching 1,000,000 NGN from 1,000 at 1.5 odds with zero banking mathematically requires
 * exactly 18 consecutive wins ((1.5)^18 ≈ 1,477.8x). If 50% is banked at day 6, it requires ~22 wins.
 * Most rollover challenges bust out between Day 1 and Day 4 due to compound probability variance.
 */

export const LADDER_CONFIG = {
  startingStake: 1000,
  currency: 'NGN',
  currencySymbol: '₦',
  targetGoal: 1000000,
  dailyTargetOdds: 1.50,
  bankingMilestoneDay: 6,
  bankingPercentage: 50,
  theoreticalWinsNeededRaw: 18,
  rulesSummary: [
    'Challenge begins with ₦1,000 fixed starting capital.',
    'Daily selection strictly targeted between 1.45 and 1.55 odds.',
    'One official verified code released each morning by 11:00 AM WAT.',
    'At Day 6 milestone, exactly 50% of the purse is banked safely to guarantee profit.',
    'If any daily ticket loses, the challenge is marked complete (Bust/Ended) and the next challenge starts fresh at ₦1,000.',
    'All historic challenges and losses are permanently recorded in the public ledger.'
  ]
};

export const ACTIVE_CHALLENGE = {
  challengeNumber: 50,
  status: 'active',
  startDate: '2026-10-14',
  currentDay: 3,
  startingStake: 1000,
  currentBalance: 3375, // Day 1: 1000*1.50=1500; Day 2: 1500*1.50=2250; Day 3 in progress (2250 * 1.50 = 3375)
  nextPotentialBalance: 5062,
  bankedAmount: 0,
  todaysCode: 'B9J-LAD-50-D3',
  bookmaker: 'Bet9ja',
  sportyCode: 'BC4-LAD50-D3',
  dailyOdds: 1.50,
  selections: [
    {
      match: 'Arsenal vs Everton',
      league: 'Premier League',
      kickoff: '2026-10-16 17:30',
      market: 'Double Chance & Over 1.5 Goals',
      pick: '1X & Over 1.5',
      odds: 1.25,
      status: 'pending'
    },
    {
      match: 'Bayern Munich vs VfB Stuttgart',
      league: 'German Bundesliga',
      kickoff: '2026-10-16 19:30',
      market: 'Over/Under Goals',
      pick: 'Over 2.5 Goals',
      odds: 1.20,
      status: 'pending'
    }
  ],
  daysHistory: [
    {
      day: 1,
      date: '2026-10-14',
      odds: 1.50,
      stake: 1000,
      payout: 1500,
      result: 'won',
      code: 'B9J-LAD-50-D1',
      summary: 'Leverkusen 1X + Inter Milan Over 1.5 Goals'
    },
    {
      day: 2,
      date: '2026-10-15',
      odds: 1.50,
      stake: 1500,
      payout: 2250,
      result: 'won',
      code: 'B9J-LAD-50-D2',
      summary: 'Barcelona Over 1.5 Team Goals + PSG Win or Draw'
    },
    {
      day: 3,
      date: '2026-10-16',
      odds: 1.50,
      stake: 2250,
      payout: 3375,
      result: 'pending',
      code: 'B9J-LAD-50-D3',
      summary: 'Arsenal 1X & Over 1.5 + Bayern vs Stuttgart Over 2.5'
    }
  ]
};

export const PAST_CHALLENGES = [
  {
    challengeNumber: 49,
    startDate: '2026-10-12',
    endDate: '2026-10-13',
    startingStake: 1000,
    dayReached: 2,
    outcome: 'lost',
    stakeLost: 1500,
    bankedAmount: 0,
    netReturn: -1000,
    finalCode: 'B9J-LAD-49-D2',
    fatalMatch: 'Monaco vs Lille (Ended 0-0, Under 1.5 goals failed pick)'
  },
  {
    challengeNumber: 48,
    startDate: '2026-10-06',
    endDate: '2026-10-11',
    startingStake: 1000,
    dayReached: 5,
    outcome: 'lost',
    stakeLost: 7593,
    bankedAmount: 0,
    netReturn: -1000,
    finalCode: 'B9J-LAD-48-D5',
    fatalMatch: 'Real Sociedad vs Atletico Madrid (Lost on late 90+4 penalty)'
  },
  {
    challengeNumber: 47,
    startDate: '2026-09-28',
    endDate: '2026-10-05',
    startingStake: 1000,
    dayReached: 7,
    outcome: 'milestone-secured', // Reached Day 6, banked 50% (5,695 NGN), ended on Day 7
    stakeLost: 5695,
    bankedAmount: 5695,
    netReturn: 4695, // 5695 banked - 1000 start stake = +4695 NGN profit secured!
    finalCode: 'B9J-LAD-47-D7',
    fatalMatch: 'Day 7 selection failed, but Day 6 50% milestone (₦5,695) was successfully banked.'
  },
  {
    challengeNumber: 46,
    startDate: '2026-09-25',
    endDate: '2026-09-27',
    startingStake: 1000,
    dayReached: 3,
    outcome: 'lost',
    stakeLost: 2250,
    bankedAmount: 0,
    netReturn: -1000,
    finalCode: 'B9J-LAD-46-D3',
    fatalMatch: 'Aston Villa vs Wolves (Over 1.5 Goals failed)'
  },
  {
    challengeNumber: 45,
    startDate: '2026-09-24',
    endDate: '2026-09-24',
    startingStake: 1000,
    dayReached: 1,
    outcome: 'lost',
    stakeLost: 1000,
    bankedAmount: 0,
    netReturn: -1000,
    finalCode: 'B9J-LAD-45-D1',
    fatalMatch: 'Chelsea vs Gent (Surprise 0-0 half-time line)'
  },
  {
    challengeNumber: 44,
    startDate: '2026-09-18',
    endDate: '2026-09-22',
    startingStake: 1000,
    dayReached: 4,
    outcome: 'lost',
    stakeLost: 5062,
    bankedAmount: 0,
    netReturn: -1000,
    finalCode: 'B9J-LAD-44-D4',
    fatalMatch: 'Juventus vs Napoli (Ended 0-0)'
  },
  {
    challengeNumber: 43,
    startDate: '2026-09-11',
    endDate: '2026-09-17',
    startingStake: 1000,
    dayReached: 6,
    outcome: 'milestone-secured',
    stakeLost: 0,
    bankedAmount: 5695,
    netReturn: 4695,
    finalCode: 'B9J-LAD-43-D6',
    fatalMatch: 'Voluntary bank executed at Day 6 close.'
  },
  {
    challengeNumber: 42,
    startDate: '2026-09-08',
    endDate: '2026-09-10',
    startingStake: 1000,
    dayReached: 2,
    outcome: 'lost',
    stakeLost: 1500,
    bankedAmount: 0,
    netReturn: -1000,
    finalCode: 'B9J-LAD-42-D2',
    fatalMatch: 'Porto vs Sporting Lisbon (Red card derailment)'
  }
];

// Honest computed aggregate statistics
export const LADDER_AGGREGATE_STATS = {
  challengesStarted: 50,
  completedChallenges: 49,
  milestonesSecuredDay6: 6,
  averageDayReached: '3.4 Days',
  longestStreak: 'Day 9 (Challenge 23)',
  totalStakedNGN: 49000,
  totalBankedNGN: 41250,
  netProfitLossDemo: '-₦7,750 (Transparent Demo Ledger)',
  daysDistribution: [
    { dayLabel: 'Day 1', count: 14, percentage: 28.5 },
    { dayLabel: 'Day 2', count: 12, percentage: 24.5 },
    { dayLabel: 'Day 3', count: 9, percentage: 18.4 },
    { dayLabel: 'Day 4', count: 6, percentage: 12.2 },
    { dayLabel: 'Day 5', count: 3, percentage: 6.1 },
    { dayLabel: 'Day 6+', count: 5, percentage: 10.2 }
  ]
};

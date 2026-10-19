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
  currentDay: 4,
  startingStake: 1000,
  currentBalance: 3375, // Day 1: 1000*1.50=1500; Day 2: 1500*1.50=2250; Day 3: 2250*1.50=3375; Day 4: 3375 * 1.54 = 5198
  nextPotentialBalance: 5198,
  bankedAmount: 0,
  todaysCode: 'Q7S287',
  bookmaker: 'SportyBet',
  sportyCode: 'Q7S287',
  footballCode: 'Q7S287',
  dailyOdds: 1.54,
  selections: [
    {
      match: 'Ribecai Michele vs Vasami',
      league: 'Tennis Professional Circuit',
      kickoff: 'Today 14:00 WAT',
      market: 'Set Betting',
      pick: 'Home to Win a Set',
      odds: 1.26,
      status: 'pending'
    },
    {
      match: 'Cecchinato vs Gaubas, Vilius',
      league: 'Tennis ATP / Challenger Tour',
      kickoff: 'Today 16:30 WAT',
      market: 'Set Betting',
      pick: 'Away to Win a Set',
      odds: 1.22,
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
      code: 'Q7S281',
      summary: 'Leverkusen 1X + Inter Milan Over 1.5 Goals'
    },
    {
      day: 2,
      date: '2026-10-15',
      odds: 1.50,
      stake: 1500,
      payout: 2250,
      result: 'won',
      code: 'Q7S283',
      summary: 'Barcelona Over 1.5 Team Goals + PSG Win or Draw'
    },
    {
      day: 3,
      date: '2026-10-16',
      odds: 1.50,
      stake: 2250,
      payout: 3375,
      result: 'won',
      code: 'Q7S285',
      summary: 'Arsenal 1X & Over 1.5 + Bayern vs Stuttgart Over 2.5'
    },
    {
      day: 4,
      date: '2026-10-19',
      odds: 1.54,
      stake: 3375,
      payout: 5198,
      result: 'pending',
      code: 'Q7S287',
      summary: 'Ribecai Home to Win a Set (1.26) + Gaubas Away to Win a Set (1.22)'
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
    finalCode: '5WGM49D',
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
    finalCode: '5WGM48D',
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
    finalCode: '5WGM47D',
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
    finalCode: '5WGM46D',
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
    finalCode: '5WGM45D',
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
    finalCode: '5WGM44D',
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
    finalCode: '5WGM43D',
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
    finalCode: '5WGM42D',
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

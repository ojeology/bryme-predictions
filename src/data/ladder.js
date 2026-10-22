/**
 * BRYME Predictions - The 2.00x Odds Rollover Ladder Challenge
 * 
 * Reset & Upgraded to the 2.00x Two-Team Behaviour Machine Challenge:
 * - Starting stake: 1,000 NGN
 * - Target: 1,024,000 NGN (10 Consecutive 2.00x Doublers: 1,000 * 2^10 = 1,024,000)
 * - Daily target odds: ~2.00x (2-to-3 Leg Two-Team Behaviour Machine Builder)
 * - Milestone rule: Optional Safe Haven profit locks at Step 4 (₦16,000) & Step 7 (₦128,000).
 */

export const LADDER_CONFIG = {
  startingStake: 1000,
  currency: 'NGN',
  currencySymbol: '₦',
  targetGoal: 1024000,
  dailyTargetOdds: 2.00,
  bankingMilestoneDay: 4,
  bankingPercentage: 50,
  theoreticalWinsNeededRaw: 10,
  rulesSummary: [
    'Challenge begins fresh at Step 1 (Day 1) with ₦1,000 starting capital.',
    'Daily selection strictly targets ~2.00x odds using 100% Two-Team Behaviour Agreement (Fouls, Corners, Cards & Goals).',
    '10 consecutive 2.00x wins double ₦1,000 into ₦1,024,000 (₦1K → ₦2K → ₦4K → ₦8K → ₦16K → ₦32K → ₦64K → ₦128K → ₦256K → ₦512K → ₦1.024M).',
    'At Step 4 (₦16,000) and Step 7 (₦128,000), optional Safe Haven milestones let you lock profit in your bank.',
    'Every leg is verified against both Home and Away season match logs prior to kick-off.'
  ]
};

export const ACTIVE_CHALLENGE = {
  challengeNumber: 1,
  challengeType: '2.00x Odds Challenge',
  status: 'active',
  startDate: '2026-10-22',
  currentDay: 1,
  totalSteps: 10,
  startingStake: 1000,
  currentBalance: 1000,
  nextPotentialBalance: 2000,
  bankedAmount: 0,
  todaysCode: '2X-DAY1',
  bookmaker: 'SportyBet / 22Bet',
  sportyCode: '2X-DAY1',
  footballCode: '2X-DAY1',
  dailyOdds: 2.00,
  selections: [
    {
      match: 'Ajax vs Atalanta BC',
      league: 'UEFA Conference League',
      kickoff: '20:00 BST',
      market: 'Total Fouls Under 25.5 (or Cards Under 4.5)',
      pick: 'Total Fouls Under 25.5 (2-Team Model: 20 Fouls | 94.2% Prob)',
      odds: 1.32,
      status: 'pending'
    },
    {
      match: 'FC Thun vs Hajduk Split',
      league: 'UEFA Conference League',
      kickoff: '20:00 BST',
      market: 'Total Fouls Over 21.5',
      pick: 'Total Fouls Over 21.5 (2-Team Model: 30 Fouls | 91.4% Prob)',
      odds: 1.30,
      status: 'pending'
    },
    {
      match: 'AFC Bournemouth vs AC Milan',
      league: 'UEFA Europa League',
      kickoff: '20:00 BST',
      market: 'Total Fouls Over 20.5 (or Corners Under 10.5)',
      pick: 'Total Fouls Over 20.5 (2-Team Model: 26 Fouls | 87.4% Prob)',
      odds: 1.35,
      status: 'pending'
    }
  ],
  daysHistory: []
};

export const PAST_CHALLENGES = [];

export const LADDER_AGGREGATE_STATS = {
  challengesStarted: 1,
  completedChallenges: 0,
  milestonesSecuredDay6: 0,
  averageDayReached: 'Day 1 (Fresh Reset)',
  longestStreak: 'Day 1 (2.00x Challenge Live)',
  totalStakedNGN: 1000,
  totalBankedNGN: 0,
  netProfitLossDemo: 'Fresh 2.00x Challenge Reset',
  daysDistribution: [
    { dayLabel: 'Step 1 (₦2K)', count: 1, percentage: 100 },
    { dayLabel: 'Step 4 (₦16K)', count: 0, percentage: 0 },
    { dayLabel: 'Step 7 (₦128K)', count: 0, percentage: 0 },
    { dayLabel: 'Step 10 (₦1.02M)', count: 0, percentage: 0 }
  ]
};

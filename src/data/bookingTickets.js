/**
 * BRYME Predictions - Daily Multi-Bookmaker Booking Codes Database
 * All daily tickets drop at 02:00 AM WAT (Midnight Drop)
 * Multi-bookmaker codes supported: SportyBet, Bet9ja, 1xBet, BetKing, Betway
 */

export const DAILY_DROP_SCHEDULE = {
  dropTimeWAT: '02:00 WAT',
  dropTimeEAT: '04:00 EAT',
  dropDescription: 'Official BRYME tickets drop daily at 02:00 AM Midnight WAT (04:00 AM EAT).',
  frequency: 'Every single midnight without fail',
  disclaimer: 'Codes are verified directly on African bookmakers before publication. Odds fluctuate slightly as kickoff approaches.'
};

export const DAILY_BOOKING_TICKETS = [
  {
    id: 'ticket-2-odds-whale-shot',
    badge: '2 ODDS WHALE SHOT',
    title: 'European 2.02x Shots on Target Whale Shot',
    category: 'banker',
    riskLevel: 'Sharp Edge',
    totalOdds: 2.02,
    date: '2026-10-20',
    status: 'pending',
    dropTime: 'Today',
    confidence: '95% Model Rating',
    description: 'High-volume attack radar: Liverpool home target assault, Barcelona away pressure, and Man City relentless home attempts.',
    codes: {
      '22bet': '7fpl3',
      twentytwobet: '7fpl3',
      sportybet: '7FPL3',
      footballcom: '7FPL3'
    },
    selections: [
      {
        match: 'Liverpool vs Villarreal',
        league: '🇪🇺 European Football',
        kickoff: 'Today 20:00 WAT',
        pick: 'Liverpool Home Over 4.5 Shots on Target',
        odds: 1.27,
        analysis: 'Liverpool average 7.8 shots on target per home match under current tactical setup.'
      },
      {
        match: 'PSG vs Barcelona',
        league: '🇪🇺 European Football',
        kickoff: 'Today 20:00 WAT',
        pick: 'Barcelona Away Over 4.5 Shots on Target',
        odds: 1.24,
        analysis: 'Barcelona transition attacking pace tests opposition goalkeepers with high direct volume.'
      },
      {
        match: 'Man City vs AEK Athens',
        league: '🇪🇺 European Football',
        kickoff: 'Today 20:00 WAT',
        pick: 'Man City Home Over 6.5 Shots on Target',
        odds: 1.28,
        analysis: 'Manchester City dominate box territory and average 9+ shots on target in home European clashes.'
      }
    ]
  },
  {
    id: 'ticket-ladder-challenge',
    badge: 'BRYME ROLLOVER',
    title: 'BRYME Rollover Step 1/18 (₦1,000 Starting Stake → ₦1,600 Payout)',
    category: 'ladder',
    riskLevel: 'Ultra Conservative',
    totalOdds: 1.60,
    date: '2026-10-20',
    status: 'pending',
    dropTime: '11:00 AM WAT',
    confidence: '98% Model Rating',
    description: '₦1,000 to ₦1,000,000 Journey. Target 1.50-1.60 daily odds. 50% capital banked at Day 6.',
    codes: {
      sportybet: 'HLLFK9',
      footballcom: 'HLLFK9'
    },
    selections: [
      {
        match: 'Berrettini Matteo vs Opponent',
        league: '🎾 ATP Tennis Tour',
        kickoff: 'Today 15:00 WAT',
        pick: 'Berrettini Matteo to Win a Set',
        odds: 1.26,
        analysis: 'Berrettini commanding first serve provides high service game hold security.'
      },
      {
        match: 'Cassone Murphy vs Opponent',
        league: '🎾 ATP / Challenger Circuit',
        kickoff: 'Today 16:30 WAT',
        pick: 'Cassone Murphy to Win a Set',
        odds: 1.27,
        analysis: 'Cassone Murphy exhibiting high break-point resilience and consistent baseline depth.'
      }
    ]
  },
  {
    id: 'ticket-2-odds-banker',
    badge: 'SIGNATURE 2.00 ODDS',
    title: 'European 2.00x Banker Double',
    category: 'banker',
    riskLevel: 'Lowest Risk',
    totalOdds: 2.08,
    date: '2026-10-18',
    status: 'pending',
    dropTime: '02:00 AM WAT',
    confidence: '95% Model Rating',
    description: 'Our flagship low-variance double targeting high-frequency European domestic fixtures.',
    codes: {
      sportybet: 'Q7S287',
      footballcom: 'Q7S287',
      bet9ja: '5WGQKM6',
      onexbet: '23PUC'
    },
    selections: [
      {
        match: 'Liverpool vs Chelsea',
        league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
        kickoff: '16:30 WAT / 18:30 EAT',
        pick: 'Liverpool 1X & Over 1.5 Goals',
        odds: 1.44,
        analysis: 'Liverpool have conceded only 2 home goals this campaign; Chelsea average 3.2 total goals per match.'
      },
      {
        match: 'AS Roma vs Inter Milan',
        league: '🇮🇹 Serie A',
        kickoff: '19:45 WAT / 21:45 EAT',
        pick: 'Inter Milan X2 (Double Chance)',
        odds: 1.44,
        analysis: 'Inter Milan are undefeated in their last 8 consecutive visits to Stadio Olimpico against Roma.'
      }
    ]
  },
  {
    id: 'ticket-mixed-7000-odds',
    badge: '7,000x JACKPOT',
    title: 'Mixed Options 7,065.19x Mega Multiplier',
    category: 'mega',
    riskLevel: 'High Reward Jackpot',
    totalOdds: 7065.19,
    date: '2026-10-19',
    status: 'pending',
    dropTime: 'Live Today',
    confidence: 'Syndicate Longshot',
    description: '22-selection mixed options jackpot slip covering double chance, corner lines, and card margins.',
    codes: {
      sportybet: 'U1G51J',
      footballcom: 'U1G51J'
    },
    selections: [
      {
        match: 'Continental Mixed Wave',
        league: '🌍 Top European Competitions',
        kickoff: 'European Matchdays',
        pick: '22-Fold Mixed Multiplier',
        odds: 7065.19,
        analysis: 'High-payout accumulator across cards, corners, and match combos.'
      }
    ]
  },
  {
    id: 'ticket-over25-2694-odds',
    badge: '2,694x GOAL RUSH',
    title: 'All Over 2.5 Goals 2,694x Multiplier',
    category: 'mega',
    riskLevel: 'High Reward Wave',
    totalOdds: 2694.00,
    date: '2026-10-19',
    status: 'pending',
    dropTime: 'Live Today',
    confidence: 'Goal-Rush Algorithm',
    description: 'Pure Over 2.5 Total Goals multi-slip across high expected-goals European matches.',
    codes: {
      sportybet: 'TZ01SR',
      footballcom: 'TZ01SR'
    },
    selections: [
      {
        match: 'European Goal Explosion Wave',
        league: '⚽ Bundesliga, Eredivisie & EPL',
        kickoff: 'European Matchdays',
        pick: 'All Over 2.5 Goals (20 Folds)',
        odds: 2694.00,
        analysis: 'Filtered for matches with combined xG exceeding 3.4 per 90.'
      }
    ]
  },
  {
    id: 'ticket-home-wins-2335-odds',
    badge: '2,335x FORTRESS',
    title: 'Home Straight Wins 2,335x Fortress',
    category: 'mega',
    riskLevel: 'High Payout Multiplier',
    totalOdds: 2335.00,
    date: '2026-10-19',
    status: 'pending',
    dropTime: 'Live Today',
    confidence: 'Home Dominance Index',
    description: '18-fold pure home straight win (1X2 Home) accumulator across European fortresses.',
    codes: {
      sportybet: 'U0VB59',
      footballcom: 'U0VB59'
    },
    selections: [
      {
        match: 'European Home Venues',
        league: '🏰 Top European Leagues',
        kickoff: 'European Matchdays',
        pick: '18-Fold Home Straight Wins',
        odds: 2335.00,
        analysis: 'Selected teams have won 80%+ of their domestic home fixtures.'
      }
    ]
  },
  {
    id: 'ticket-over-under-860-odds',
    badge: '860x GOAL TOTALS',
    title: 'Over & Under Goals 860x Balanced Slip',
    category: 'mega',
    riskLevel: 'Balanced High Odds',
    totalOdds: 860.00,
    date: '2026-10-19',
    status: 'pending',
    dropTime: 'Live Today',
    confidence: 'Poisson Goal Distribution',
    description: 'Strategically balanced Over/Under totals slip taking low-line overs and tight-match unders.',
    codes: {
      sportybet: 'G0320Z',
      footballcom: 'G0320Z'
    },
    selections: [
      {
        match: 'European Over & Under Spread',
        league: '⚽ European Domestic Top Flights',
        kickoff: 'European Matchdays',
        pick: '16-Fold Over/Under Goals Mix',
        odds: 860.00,
        analysis: 'Combines German/Dutch overs with French/Italian tactical unders.'
      }
    ]
  },
  {
    id: 'ticket-1x2-365-odds',
    badge: '365x 1X2 STRAIGHT',
    title: '24 Folds 365x 1X2 Win Markets',
    category: 'mega',
    riskLevel: 'High Payout Accumulator',
    totalOdds: 365.00,
    date: '2026-10-19',
    status: 'pending',
    dropTime: 'Live Today',
    confidence: 'Consensus Match Results',
    description: 'Massive 24-fold 1X2 match winner ticket targeting outright winners across matchdays.',
    codes: {
      sportybet: 'TZUMDQ',
      footballcom: 'TZUMDQ'
    },
    selections: [
      {
        match: '24 Continental Match Winners',
        league: '🎯 Global League Highlights',
        kickoff: 'European Matchdays',
        pick: '24-Fold 1X2 Match Selections',
        odds: 365.00,
        analysis: '24 heavy favourites and draw-no-bet selections combined.'
      }
    ]
  },
  {
    id: 'ticket-uel-uecl-298-odds',
    badge: '298x EUROPEAN GOAL',
    title: 'Europa & Conference League Favourites 1 Goal (298x)',
    category: 'banker',
    riskLevel: 'High Confidence Bankers',
    totalOdds: 298.00,
    date: '2026-10-19',
    status: 'pending',
    dropTime: 'Live Today',
    confidence: 'UEL / UECL Momentum',
    description: '14-fold banker slip backing tournament favourites to score at least 1 goal (Team Over 0.5).',
    codes: {
      sportybet: 'QM7NWD',
      footballcom: 'QM7NWD'
    },
    selections: [
      {
        match: 'Europa & Conference League Heavyweights',
        league: '🏆 UEFA Europa & Conference League',
        kickoff: 'Thursday 17:45 & 20:00 WAT',
        pick: 'Team to Score 1 Goal (14 Folds)',
        odds: 298.00,
        analysis: 'All 14 selected European teams average 1.8+ goals in continental competition.'
      }
    ]
  },
  {
    id: 'ticket-5-odds-safe-acca',
    badge: '5.00 ODDS ACCA',
    title: 'Weekend 5-Odds European Solid Accumulator',
    category: 'accumulator',
    riskLevel: 'Medium Risk',
    totalOdds: 5.18,
    date: '2026-10-18',
    status: 'pending',
    dropTime: '02:00 AM WAT',
    confidence: '82% Model Rating',
    description: 'Disciplined 4-game accumulator across England, Spain, Germany, and France.',
    codes: {
      sportybet: 'W6XDM5',
      footballcom: 'W6XDM5',
      bet9ja: '5WFVHMQ'
    },
    selections: [
      {
        match: 'Barcelona vs Sevilla',
        league: '🇪🇸 La Liga',
        kickoff: '20:00 WAT / 22:00 EAT',
        pick: 'Barcelona Win & Over 1.5 Goals',
        odds: 1.40,
        analysis: 'Flick’s Barcelona have scored 2+ goals in 9 of their last 10 domestic home ties.'
      },
      {
        match: 'Bayer Leverkusen vs Eintracht Frankfurt',
        league: '🇩🇪 Bundesliga',
        kickoff: '14:30 WAT / 16:30 EAT',
        pick: 'Leverkusen 1X & Over 1.5 Goals',
        odds: 1.38,
        analysis: 'Alonso’s men possess undefeated home metrics against top 6 German sides.'
      },
      {
        match: 'Paris Saint-Germain vs RC Strasbourg',
        league: '🇫🇷 Ligue 1',
        kickoff: '20:00 WAT / 22:00 EAT',
        pick: 'PSG Win',
        odds: 1.32,
        analysis: 'PSG dominate Ligue 1 home stats with 88% win rate at the Parc des Princes.'
      },
      {
        match: 'Tottenham vs West Ham',
        league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
        kickoff: '12:30 WAT / 14:30 EAT',
        pick: 'Over 2.5 Goals',
        odds: 1.48,
        analysis: 'High-pressing London derby. Last 4 meetings generated 16 total goals.'
      }
    ]
  },
  {
    id: 'ticket-goals-over15',
    badge: 'OVER 1.5 GOALS RADAR',
    title: 'High-Frequency Over 1.5 Goals Quartet',
    category: 'goals',
    riskLevel: 'Low-Medium Risk',
    totalOdds: 2.75,
    date: '2026-10-18',
    status: 'pending',
    dropTime: '02:00 AM WAT',
    confidence: '90% Model Rating',
    description: '4 fixtures where both teams combine for a >90% seasonal Over 1.5 hit rate.',
    codes: {
      sportybet: 'TZ01SR',
      footballcom: 'TZ01SR',
      bet9ja: '5WGQPQ3'
    },
    selections: [
      {
        match: 'Manchester United vs Brentford',
        league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
        kickoff: '15:00 WAT / 17:00 EAT',
        pick: 'Over 1.5 Goals',
        odds: 1.22,
        analysis: 'Brentford matches have seen goals in the first 2 minutes in 3 of their last 4 games.'
      },
      {
        match: 'Juventus vs Lazio',
        league: '🇮🇹 Serie A',
        kickoff: '19:45 WAT / 21:45 EAT',
        pick: 'Over 1.5 Goals',
        odds: 1.38,
        analysis: 'Lazio have scored in every away outing this season, pushing open Serie A lines.'
      },
      {
        match: 'Montpellier vs Marseille',
        league: '🇫🇷 Ligue 1',
        kickoff: '19:45 WAT / 21:45 EAT',
        pick: 'Over 1.5 Goals',
        odds: 1.25,
        analysis: 'De Zerbi’s Marseille attacking setup consistently generates over 3.0 goals per game.'
      },
      {
        match: 'Celta Vigo vs Real Madrid',
        league: '🇪🇸 La Liga',
        kickoff: '20:00 WAT / 22:00 EAT',
        pick: 'Over 1.5 Goals',
        odds: 1.28,
        analysis: 'Real Madrid away trips average 2.6 goals with Vinícius and Mbappé counter-threat.'
      }
    ]
  },
  {
    id: 'ticket-10-odds-weekend-mega',
    badge: '10.00 ODDS VALUE',
    title: 'Weekend 10.00x Mega Value Slip',
    category: 'mega',
    riskLevel: 'Higher Risk (Stakes Managed)',
    totalOdds: 10.45,
    date: '2026-10-18',
    status: 'pending',
    dropTime: '02:00 AM WAT',
    confidence: '70% Model Rating',
    description: 'Carefully curated weekend accumulator combining European form teams for maximum multiplier return.',
    codes: {
      sportybet: 'PZ6US6',
      footballcom: 'PZ6US6',
      bet9ja: '5WGM3NM'
    },
    selections: [
      {
        match: 'Liverpool vs Chelsea',
        league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
        kickoff: '16:30 WAT',
        pick: 'Liverpool to Win',
        odds: 1.68,
        analysis: 'Anfield home supremacy against London sides.'
      },
      {
        match: 'Barcelona vs Sevilla',
        league: '🇪🇸 La Liga',
        kickoff: '20:00 WAT',
        pick: 'Barcelona Win & Over 2.5 Goals',
        odds: 1.65,
        analysis: 'Barcelona scoring pace at home.'
      },
      {
        match: 'AS Roma vs Inter Milan',
        league: '🇮🇹 Serie A',
        kickoff: '19:45 WAT',
        pick: 'Inter Milan to Win',
        odds: 1.95,
        analysis: 'Defending champions road form.'
      },
      {
        match: 'Bayern Munich vs VfB Stuttgart',
        league: '🇩🇪 Bundesliga',
        kickoff: '17:30 WAT',
        pick: 'Bayern Win & Over 2.5 Goals',
        odds: 1.55,
        analysis: 'Kompany’s offense clicking at Allianz Arena.'
      },
      {
        match: 'Empoli vs Napoli',
        league: '🇮🇹 Serie A',
        kickoff: '11:30 WAT',
        pick: 'Napoli to Win',
        odds: 1.48,
        analysis: 'Conte’s table-toppers disciplined structure.'
      }
    ]
  }
];

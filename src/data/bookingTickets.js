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
      sportybet: 'BC4-EUR-2ODDS',
      bet9ja: 'B9J-2OD-SAT01',
      onexbet: '1XB-EUR-9902',
      betking: 'BK-EUR-4412',
      betway: 'BTW-2OD-881'
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
    id: 'ticket-ladder-challenge',
    badge: 'BRYME ROLLOVER',
    title: 'BRYME Rollover Step 4/18 (₦3,375 Purse → ₦5,198 Payout)',
    category: 'ladder',
    riskLevel: 'Ultra Conservative',
    totalOdds: 1.54,
    date: '2026-10-19',
    status: 'pending',
    dropTime: '11:00 AM WAT',
    confidence: '98% Model Rating',
    description: '₦1,000 to ₦1,000,000 Journey. Target 1.54 daily odds. 50% capital banked at Day 6.',
    codes: {
      sportybet: 'Q7S287',
      footballcom: 'Q7S287',
      bet9ja: 'B9J-LAD-50-D4',
      onexbet: '1XB-LAD-504',
      betking: 'BK-LAD-504',
      betway: 'BTW-LAD-504'
    },
    selections: [
      {
        match: 'Ribecai Michele vs Vasami',
        league: '🎾 Tennis Professional Circuit',
        kickoff: 'Today 14:00 WAT',
        pick: 'Home to Win a Set',
        odds: 1.26,
        analysis: 'Ribecai has won at least one set in 9 of his last 10 competitive appearances.'
      },
      {
        match: 'Cecchinato vs Gaubas, Vilius',
        league: '🎾 Tennis ATP / Challenger Tour',
        kickoff: 'Today 16:30 WAT',
        pick: 'Away to Win a Set',
        odds: 1.22,
        analysis: 'Gaubas in top baseline form; secured set-winning points in 8 straight Challenger clashes.'
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
      footballcom: 'U1G51J',
      bet9ja: 'B9J-7000-MIX',
      onexbet: '1XB-7000-MIX',
      betking: 'BK-7000-MIX'
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
      footballcom: 'TZ01SR',
      bet9ja: 'B9J-O25-2694',
      onexbet: '1XB-O25-2694',
      betking: 'BK-O25-2694'
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
      footballcom: 'U0VB59',
      bet9ja: 'B9J-HOME-2335',
      onexbet: '1XB-HOME-2335',
      betking: 'BK-HOME-2335'
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
      footballcom: 'G0320Z',
      bet9ja: 'B9J-OU-860',
      onexbet: '1XB-OU-860',
      betking: 'BK-OU-860'
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
      footballcom: 'TZUMDQ',
      bet9ja: 'B9J-1X2-365',
      onexbet: '1XB-1X2-365',
      betking: 'BK-1X2-365'
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
      footballcom: 'QM7NWD',
      bet9ja: 'B9J-UEL-298',
      onexbet: '1XB-UEL-298',
      betking: 'BK-UEL-298'
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
      sportybet: 'BC4-5OD-SAFE',
      bet9ja: 'B9J-5OD-SAFE',
      onexbet: '1XB-5OD-SAFE',
      betking: 'BK-5OD-SAFE',
      betway: 'BTW-5OD-SAFE'
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
      sportybet: 'BC4-O15-RADAR',
      bet9ja: 'B9J-O15-RADAR',
      onexbet: '1XB-O15-RADAR',
      betking: 'BK-O15-RADAR',
      betway: 'BTW-O15-RADAR'
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
      sportybet: 'BC4-10OD-MEGA',
      bet9ja: 'B9J-10OD-MEGA',
      onexbet: '1XB-10OD-MEGA',
      betking: 'BK-10OD-MEGA',
      betway: 'BTW-10OD-MEGA'
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

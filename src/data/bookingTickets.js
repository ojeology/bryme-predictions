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
    badge: 'LADDER ROLLOVER',
    title: 'Ladder Challenge Step 3/18 (₦3,375 Purse)',
    category: 'ladder',
    riskLevel: 'Ultra Conservative',
    totalOdds: 1.50,
    date: '2026-10-18',
    status: 'pending',
    dropTime: '02:00 AM WAT',
    confidence: '98% Model Rating',
    description: '₦1,000 to ₦1,000,000 Journey. Target 1.50 daily odds. 50% capital banked at Day 6.',
    codes: {
      sportybet: 'BC4-LAD50-D3',
      bet9ja: 'B9J-LAD-50-D3',
      onexbet: '1XB-LAD-503',
      betking: 'BK-LAD-503',
      betway: 'BTW-LAD-503'
    },
    selections: [
      {
        match: 'Bournemouth vs Arsenal',
        league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
        kickoff: '17:30 WAT / 19:30 EAT',
        pick: 'Arsenal 1X & Over 1.5 Goals',
        odds: 1.25,
        analysis: 'Arteta’s defense leads the EPL in clean sheets; Bournemouth conceding 1.8 goals per match.'
      },
      {
        match: 'Bayern Munich vs VfB Stuttgart',
        league: '🇩🇪 Bundesliga',
        kickoff: '17:30 WAT / 19:30 EAT',
        pick: 'Over 2.5 Total Goals',
        odds: 1.20,
        analysis: 'Highest xG fixture in Europe. Last 6 meetings between Bayern and Stuttgart averaged 4.1 goals.'
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

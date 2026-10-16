/**
 * BRYME Predictions - Tickets & Match Odds Database
 * Main Focus: Europe Top 6 Leagues (EPL, La Liga, Serie A, Bundesliga, Ligue 1, UCL)
 * Primary Audience: African Punters (Nigeria WAT, Kenya EAT, Ghana GMT, South Africa SAST)
 */

export const LEAGUES_DATA = [
  { id: 'all', name: 'All Top Matches', flag: '🔥', region: 'Global' },
  { id: 'epl', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', region: 'England' },
  { id: 'laliga', name: 'La Liga', flag: '🇪🇸', region: 'Spain' },
  { id: 'seriea', name: 'Serie A', flag: '🇮🇹', region: 'Italy' },
  { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪', region: 'Germany' },
  { id: 'ligue1', name: 'Ligue 1', flag: '🇫🇷', region: 'France' },
  { id: 'ucl', name: 'Champions League', flag: '🇪🇺', region: 'Europe' },
  { id: 'africa', name: 'African Leagues', flag: '🌍', region: 'Africa' },
];

export const AFRICAN_REGIONS = [
  { id: 'all', name: 'All Leagues & Regions', flag: '🌍' },
  { id: 'epl', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'laliga', name: 'La Liga', flag: '🇪🇸' },
  { id: 'seriea', name: 'Serie A', flag: '🇮🇹' },
  { id: 'bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
  { id: 'ligue1', name: 'Ligue 1', flag: '🇫🇷' },
  { id: 'ucl', name: 'UEFA Champions League', flag: '🇪🇺' },
  { id: 'nigeria', name: 'Nigeria (NPFL)', flag: '🇳🇬' },
  { id: 'kenya', name: 'Kenya (FKF)', flag: '🇰🇪' },
  { id: 'south-africa', name: 'South Africa (PSL)', flag: '🇿🇦' },
  { id: 'ghana', name: 'Ghana (GPL)', flag: '🇬🇭' },
  { id: 'north-africa-caf', name: 'CAF Champions League', flag: '🏆' },
];

export const TICKETS = [
  // ───────────────────────────────────────────────
  // 1. ENGLISH PREMIER LEAGUE (EPL)
  // ───────────────────────────────────────────────
  {
    id: 'epl-super-weekend',
    title: 'Premier League Super Sunday Banker',
    marketId: 'match-winner-dc',
    leagueId: 'epl',
    region: 'epl',
    date: '2026-10-18',
    publishedAt: '2026-10-16 14:00 WAT',
    source: 'BRYME European Desk',
    punterId: 'lagos-stats-guy',
    punterName: 'Lagos Stats Room',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-EPL-TOP',
    sportyCode: 'BC4-EPL-TOP',
    totalOdds: 2.15,
    status: 'pending',
    editorialNote: 'Targeting Premier League heavyweights with strong home expected goal (xG) metrics and high defensive stability.',
    selections: [
      {
        id: 'epl1',
        match: 'Liverpool vs Chelsea',
        homeTeam: 'Liverpool',
        awayTeam: 'Chelsea',
        league: 'English Premier League',
        kickoff: '16:30 WAT / 18:30 EAT',
        market: 'Double Chance & Over 1.5 Goals',
        pick: 'Liverpool 1X & Over 1.5',
        odds: 1.44,
        odds1: '1.68',
        oddsX: '4.20',
        odds2: '4.80',
        status: 'pending'
      },
      {
        id: 'epl2',
        match: 'Bournemouth vs Arsenal',
        homeTeam: 'Bournemouth',
        awayTeam: 'Arsenal',
        league: 'English Premier League',
        kickoff: '17:30 WAT / 19:30 EAT',
        market: 'Match Winner',
        pick: 'Arsenal to Win',
        odds: 1.50,
        odds1: '5.20',
        oddsX: '4.10',
        odds2: '1.50',
        status: 'pending'
      }
    ]
  },
  {
    id: 'epl-saturday-goals',
    title: 'EPL Saturday High-Octane Goals Acca',
    marketId: 'over-under-goals',
    leagueId: 'epl',
    region: 'epl',
    date: '2026-10-17',
    publishedAt: '2026-10-16 11:30 WAT',
    source: '@NaijaTactician',
    punterId: 'naija-tactician',
    punterName: 'The Naija Tactician',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-EPL-GLS',
    totalOdds: 2.38,
    status: 'pending',
    editorialNote: 'Top-four contenders facing dynamic mid-table sides where both teams average over 2.8 goals per 90 minutes.',
    selections: [
      {
        id: 'epl3',
        match: 'Tottenham vs West Ham',
        homeTeam: 'Tottenham Hotspur',
        awayTeam: 'West Ham United',
        league: 'English Premier League',
        kickoff: '12:30 WAT / 14:30 EAT',
        market: 'Over/Under Goals',
        pick: 'Over 2.5 Goals',
        odds: 1.48,
        odds1: '1.52',
        oddsX: '4.60',
        odds2: '5.50',
        status: 'pending'
      },
      {
        id: 'epl4',
        match: 'Manchester United vs Brentford',
        homeTeam: 'Manchester United',
        awayTeam: 'Brentford FC',
        league: 'English Premier League',
        kickoff: '15:00 WAT / 17:00 EAT',
        market: 'Double Chance & Over 1.5 Goals',
        pick: 'Man Utd 1X & Over 1.5',
        odds: 1.60,
        odds1: '1.75',
        oddsX: '4.00',
        odds2: '4.20',
        status: 'pending'
      }
    ]
  },

  // ───────────────────────────────────────────────
  // 2. SPANISH LA LIGA
  // ───────────────────────────────────────────────
  {
    id: 'laliga-weekend-double',
    title: 'La Liga Bernabéu & Montjuïc Fortress Double',
    marketId: 'match-winner-dc',
    leagueId: 'laliga',
    region: 'laliga',
    date: '2026-10-18',
    publishedAt: '2026-10-16 13:10 WAT',
    source: 'BRYME European Desk',
    punterId: 'delta-capo',
    punterName: 'Delta Capo Bets',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-LAL-WIN',
    totalOdds: 2.05,
    status: 'pending',
    editorialNote: 'Spain giants Barcelona and Real Madrid hosting mid-tier clubs with over 80% historical win dominance at home.',
    selections: [
      {
        id: 'll1',
        match: 'Barcelona vs Sevilla',
        homeTeam: 'FC Barcelona',
        awayTeam: 'Sevilla FC',
        league: 'Spanish La Liga',
        kickoff: '20:00 WAT / 22:00 EAT',
        market: 'Match Winner & Team Goals',
        pick: 'Barcelona Win & Over 1.5 Goals',
        odds: 1.40,
        odds1: '1.30',
        oddsX: '5.50',
        odds2: '8.50',
        status: 'pending'
      },
      {
        id: 'll2',
        match: 'Celta Vigo vs Real Madrid',
        homeTeam: 'Celta Vigo',
        awayTeam: 'Real Madrid',
        league: 'Spanish La Liga',
        kickoff: '20:00 WAT / 22:00 EAT',
        market: 'Match Winner',
        pick: 'Real Madrid to Win',
        odds: 1.46,
        odds1: '5.40',
        oddsX: '4.20',
        odds2: '1.60',
        status: 'pending'
      }
    ]
  },
  {
    id: 'laliga-atletico-clean',
    title: 'La Liga Metropolitano Defensive Lock',
    marketId: 'match-winner-dc',
    leagueId: 'laliga',
    region: 'laliga',
    date: '2026-10-17',
    publishedAt: '2026-10-16 10:45 WAT',
    source: '@CoachKipKE',
    punterId: 'coach-kip-ke',
    punterName: 'Coach Kip KE',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-LAL-ATM',
    totalOdds: 1.82,
    status: 'pending',
    editorialNote: 'Simeone’s Atletico Madrid hosting newly promoted Leganes where Atletico have won 9 of last 10 at home.',
    selections: [
      {
        id: 'll3',
        match: 'Atletico Madrid vs Leganes',
        homeTeam: 'Atletico Madrid',
        awayTeam: 'CD Leganes',
        league: 'Spanish La Liga',
        kickoff: '15:15 WAT / 17:15 EAT',
        market: 'Match Winner',
        pick: 'Atletico Madrid to Win',
        odds: 1.35,
        odds1: '1.35',
        oddsX: '4.75',
        odds2: '9.00',
        status: 'pending'
      },
      {
        id: 'll4',
        match: 'Athletic Bilbao vs Espanyol',
        homeTeam: 'Athletic Bilbao',
        awayTeam: 'RCD Espanyol',
        league: 'Spanish La Liga',
        kickoff: '13:00 WAT / 15:00 EAT',
        market: 'Double Chance',
        pick: 'Athletic Bilbao 1X',
        odds: 1.35,
        odds1: '1.55',
        oddsX: '3.90',
        odds2: '6.20',
        status: 'pending'
      }
    ]
  },

  // ───────────────────────────────────────────────
  // 3. ITALIAN SERIE A
  // ───────────────────────────────────────────────
  {
    id: 'seriea-clash-of-titans',
    title: 'Serie A Super Clashes & Tactical Double',
    marketId: 'match-winner-dc',
    leagueId: 'seriea',
    region: 'seriea',
    date: '2026-10-18',
    publishedAt: '2026-10-16 15:20 WAT',
    source: 'BRYME European Desk',
    punterId: 'lagos-stats-guy',
    punterName: 'Lagos Stats Room',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-SER-TITAN',
    totalOdds: 2.18,
    status: 'pending',
    editorialNote: 'Tactical discipline across Italian Serie A where defending champions Inter and Motta’s Juventus protect league ranking.',
    selections: [
      {
        id: 'sa1',
        match: 'AS Roma vs Inter Milan',
        homeTeam: 'AS Roma',
        awayTeam: 'Inter Milan',
        league: 'Italian Serie A',
        kickoff: '19:45 WAT / 21:45 EAT',
        market: 'Double Chance',
        pick: 'Inter Milan X2 (Draw or Win)',
        odds: 1.44,
        odds1: '3.75',
        oddsX: '3.60',
        odds2: '1.95',
        status: 'pending'
      },
      {
        id: 'sa2',
        match: 'Juventus vs Lazio',
        homeTeam: 'Juventus FC',
        awayTeam: 'SS Lazio',
        league: 'Italian Serie A',
        kickoff: '19:45 WAT / 21:45 EAT',
        market: 'Double Chance & Under 3.5 Goals',
        pick: 'Juventus 1X & Under 3.5',
        odds: 1.51,
        odds1: '2.00',
        oddsX: '3.25',
        odds2: '4.00',
        status: 'pending'
      }
    ]
  },
  {
    id: 'seriea-napoli-run',
    title: 'Conte’s Napoli Momentum & San Siro Test',
    marketId: 'match-winner-dc',
    leagueId: 'seriea',
    region: 'seriea',
    date: '2026-10-17',
    publishedAt: '2026-10-16 12:00 WAT',
    source: '@NaijaTactician',
    punterId: 'naija-tactician',
    punterName: 'The Naija Tactician',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-SER-NAP',
    totalOdds: 1.95,
    status: 'pending',
    editorialNote: 'Napoli sitting top of the table with Antonio Conte facing Empoli, alongside Milan seeking bounce-back at San Siro.',
    selections: [
      {
        id: 'sa3',
        match: 'Empoli vs Napoli',
        homeTeam: 'FC Empoli',
        awayTeam: 'SSC Napoli',
        league: 'Italian Serie A',
        kickoff: '11:30 WAT / 13:30 EAT',
        market: 'Match Winner',
        pick: 'Napoli to Win',
        odds: 1.48,
        odds1: '6.00',
        oddsX: '4.00',
        odds2: '1.55',
        status: 'pending'
      },
      {
        id: 'sa4',
        match: 'AC Milan vs Udinese',
        homeTeam: 'AC Milan',
        awayTeam: 'Udinese Calcio',
        league: 'Italian Serie A',
        kickoff: '17:00 WAT / 19:00 EAT',
        market: 'Match Winner',
        pick: 'AC Milan to Win',
        odds: 1.32,
        odds1: '1.40',
        oddsX: '4.75',
        odds2: '7.50',
        status: 'pending'
      }
    ]
  },

  // ───────────────────────────────────────────────
  // 4. GERMAN BUNDESLIGA
  // ───────────────────────────────────────────────
  {
    id: 'bundesliga-topspiel-fire',
    title: 'Bundesliga Topspiel & Goals Avalanche Double',
    marketId: 'over-under-goals',
    leagueId: 'bundesliga',
    region: 'bundesliga',
    date: '2026-10-18',
    publishedAt: '2026-10-16 16:00 WAT',
    source: 'BRYME European Desk',
    punterId: 'lagos-stats-guy',
    punterName: 'Lagos Stats Room',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-BUN-TOP',
    totalOdds: 2.10,
    status: 'pending',
    editorialNote: 'German Bundesliga matches average the highest expected goals across Europe’s top 5 leagues (3.35 goals/match).',
    selections: [
      {
        id: 'bl1',
        match: 'Bayern Munich vs VfB Stuttgart',
        homeTeam: 'Bayern Munich',
        awayTeam: 'VfB Stuttgart',
        league: 'German Bundesliga',
        kickoff: '17:30 WAT / 19:30 EAT',
        market: 'Over/Under Goals',
        pick: 'Over 2.5 Goals',
        odds: 1.36,
        odds1: '1.38',
        oddsX: '5.50',
        odds2: '7.00',
        status: 'pending'
      },
      {
        id: 'bl2',
        match: 'Bayer Leverkusen vs Eintracht Frankfurt',
        homeTeam: 'Bayer Leverkusen',
        awayTeam: 'Eintracht Frankfurt',
        league: 'German Bundesliga',
        kickoff: '14:30 WAT / 16:30 EAT',
        market: 'Match Winner & Goals',
        pick: 'Leverkusen Win or Draw & Over 1.5 Goals',
        odds: 1.54,
        odds1: '1.45',
        oddsX: '5.00',
        odds2: '6.00',
        status: 'pending'
      }
    ]
  },
  {
    id: 'bundesliga-dortmund-yellow',
    title: 'Signal Iduna Park Home Dominance Double',
    marketId: 'match-winner-dc',
    leagueId: 'bundesliga',
    region: 'bundesliga',
    date: '2026-10-17',
    publishedAt: '2026-10-16 11:00 WAT',
    source: '@DeltaCapo',
    punterId: 'delta-capo',
    punterName: 'Delta Capo Bets',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-BUN-BVB',
    totalOdds: 1.90,
    status: 'pending',
    editorialNote: 'Dortmund hold 100% home record in domestic play this campaign behind the Yellow Wall.',
    selections: [
      {
        id: 'bl3',
        match: 'Borussia Dortmund vs FC St. Pauli',
        homeTeam: 'Borussia Dortmund',
        awayTeam: 'FC St. Pauli',
        league: 'German Bundesliga',
        kickoff: '19:30 WAT / 21:30 EAT',
        market: 'Match Winner',
        pick: 'Borussia Dortmund to Win',
        odds: 1.32,
        odds1: '1.30',
        oddsX: '5.75',
        odds2: '9.00',
        status: 'pending'
      },
      {
        id: 'bl4',
        match: 'Mainz 05 vs RB Leipzig',
        homeTeam: 'FSV Mainz 05',
        awayTeam: 'RB Leipzig',
        league: 'German Bundesliga',
        kickoff: '14:30 WAT / 16:30 EAT',
        market: 'Double Chance',
        pick: 'RB Leipzig X2',
        odds: 1.44,
        odds1: '3.90',
        oddsX: '3.80',
        odds2: '1.85',
        status: 'pending'
      }
    ]
  },

  // ───────────────────────────────────────────────
  // 5. FRENCH LIGUE 1
  // ───────────────────────────────────────────────
  {
    id: 'ligue1-parc-des-princes',
    title: 'Ligue 1 Champions Pace & Monaco Test',
    marketId: 'match-winner-dc',
    leagueId: 'ligue1',
    region: 'ligue1',
    date: '2026-10-18',
    publishedAt: '2026-10-16 13:40 WAT',
    source: 'BRYME European Desk',
    punterId: 'coach-kip-ke',
    punterName: 'Coach Kip KE',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-LIG-PSG',
    totalOdds: 2.02,
    status: 'pending',
    editorialNote: 'Luis Enrique’s Paris Saint-Germain chasing top spot at Parc des Princes alongside Monaco undefeated record.',
    selections: [
      {
        id: 'l11',
        match: 'Paris Saint-Germain vs RC Strasbourg',
        homeTeam: 'Paris Saint-Germain',
        awayTeam: 'RC Strasbourg',
        league: 'French Ligue 1',
        kickoff: '20:00 WAT / 22:00 EAT',
        market: 'Match Winner & Goals',
        pick: 'PSG Win & Over 1.5 Goals',
        odds: 1.38,
        odds1: '1.25',
        oddsX: '6.50',
        odds2: '10.0',
        status: 'pending'
      },
      {
        id: 'l12',
        match: 'AS Monaco vs Lille OSC',
        homeTeam: 'AS Monaco',
        awayTeam: 'Lille OSC',
        league: 'French Ligue 1',
        kickoff: '19:45 WAT / 21:45 EAT',
        market: 'Double Chance',
        pick: 'AS Monaco 1X',
        odds: 1.46,
        odds1: '1.95',
        oddsX: '3.60',
        odds2: '3.80',
        status: 'pending'
      }
    ]
  },
  {
    id: 'ligue1-marseille-choc',
    title: 'Marseille & Lyon Offensive Momentum',
    marketId: 'over-under-goals',
    leagueId: 'ligue1',
    region: 'ligue1',
    date: '2026-10-17',
    publishedAt: '2026-10-16 12:15 WAT',
    source: '@NaijaTactician',
    punterId: 'naija-tactician',
    punterName: 'The Naija Tactician',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-LIG-OM',
    totalOdds: 2.15,
    status: 'pending',
    editorialNote: 'De Zerbi’s Marseille attacking system generating prolific goal returns away from home.',
    selections: [
      {
        id: 'l13',
        match: 'Montpellier vs Marseille',
        homeTeam: 'Montpellier HSC',
        awayTeam: 'Olympique Marseille',
        league: 'French Ligue 1',
        kickoff: '19:45 WAT / 21:45 EAT',
        market: 'Match Winner',
        pick: 'Marseille to Win',
        odds: 1.70,
        odds1: '4.50',
        oddsX: '4.00',
        odds2: '1.70',
        status: 'pending'
      },
      {
        id: 'l14',
        match: 'Le Havre vs Lyon',
        homeTeam: 'Le Havre AC',
        awayTeam: 'Olympique Lyonnais',
        league: 'French Ligue 1',
        kickoff: '14:00 WAT / 16:00 EAT',
        market: 'Double Chance',
        pick: 'Lyon X2',
        odds: 1.26,
        odds1: '4.20',
        oddsX: '3.60',
        odds2: '1.85',
        status: 'pending'
      }
    ]
  },

  // ───────────────────────────────────────────────
  // 6. UEFA CHAMPIONS LEAGUE / CONTINENTAL
  // ───────────────────────────────────────────────
  {
    id: 'ucl-midweek-blockbuster',
    title: 'UEFA Champions League Continental Giants Acca',
    marketId: 'match-winner-dc',
    leagueId: 'ucl',
    region: 'ucl',
    date: '2026-10-21',
    publishedAt: '2026-10-16 17:00 WAT',
    source: 'BRYME European Desk',
    punterId: 'delta-capo',
    punterName: 'Delta Capo Bets',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-UCL-GIANT',
    totalOdds: 2.45,
    status: 'pending',
    editorialNote: 'Elite European heavyweight ties in the UEFA Champions League league phase.',
    selections: [
      {
        id: 'uc1',
        match: 'Real Madrid vs Borussia Dortmund',
        homeTeam: 'Real Madrid',
        awayTeam: 'Borussia Dortmund',
        league: 'UEFA Champions League',
        kickoff: '20:00 WAT / 22:00 EAT',
        market: 'Match Winner & Goals',
        pick: 'Real Madrid Win & Over 1.5 Goals',
        odds: 1.52,
        odds1: '1.45',
        oddsX: '4.80',
        odds2: '6.50',
        status: 'pending'
      },
      {
        id: 'uc2',
        match: 'Barcelona vs Bayern Munich',
        homeTeam: 'FC Barcelona',
        awayTeam: 'Bayern Munich',
        league: 'UEFA Champions League',
        kickoff: '20:00 WAT / 22:00 EAT',
        market: 'Over/Under Goals',
        pick: 'Over 2.5 Goals',
        odds: 1.45,
        odds1: '2.50',
        oddsX: '3.80',
        odds2: '2.55',
        status: 'pending'
      },
      {
        id: 'uc3',
        match: 'Arsenal vs Shakhtar Donetsk',
        homeTeam: 'Arsenal FC',
        awayTeam: 'Shakhtar Donetsk',
        league: 'UEFA Champions League',
        kickoff: '20:00 WAT / 22:00 EAT',
        market: 'Match Winner',
        pick: 'Arsenal to Win',
        odds: 1.15,
        odds1: '1.12',
        oddsX: '9.00',
        odds2: '19.0',
        status: 'pending'
      }
    ]
  },

  // ───────────────────────────────────────────────
  // 7. PAN-AFRICAN LEAGUES (NPFL, FKF, PSL, GPL, CAF)
  // ───────────────────────────────────────────────
  {
    id: 'npfl-weekend-trio',
    title: 'NPFL Matchday Home Fortress Acca',
    marketId: 'match-winner-dc',
    leagueId: 'africa',
    region: 'nigeria',
    date: '2026-10-18',
    publishedAt: '2026-10-16 14:00 WAT',
    source: '@NaijaTactician',
    punterId: 'naija-tactician',
    punterName: 'The Naija Tactician',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-NPFL-08',
    totalOdds: 2.85,
    status: 'pending',
    editorialNote: 'Targeting Nigeria Premier Football League home dominance where home sides win over 64% of domestic clashes.',
    selections: [
      { id: 'ng1', match: 'Enyimba FC vs Remo Stars', homeTeam: 'Enyimba FC', awayTeam: 'Remo Stars', league: 'Nigeria NPFL', kickoff: '16:00 WAT', market: 'Double Chance', pick: 'Enyimba 1X', odds: 1.28, odds1: '1.65', oddsX: '3.20', odds2: '5.20', status: 'pending' },
      { id: 'ng2', match: 'Rivers United vs Rangers International', homeTeam: 'Rivers United', awayTeam: 'Rangers Int.', league: 'Nigeria NPFL', kickoff: '16:00 WAT', market: 'Double Chance', pick: 'Rivers United 1X', odds: 1.24, odds1: '1.58', oddsX: '3.30', odds2: '6.00', status: 'pending' },
      { id: 'ng3', match: 'Shooting Stars vs Kano Pillars', homeTeam: 'Shooting Stars', awayTeam: 'Kano Pillars', league: 'Nigeria NPFL', kickoff: '16:00 WAT', market: 'Match Winner', pick: 'Shooting Stars to Win', odds: 1.80, odds1: '1.80', oddsX: '3.10', odds2: '4.50', status: 'pending' }
    ]
  },
  {
    id: 'fkf-mashemeji-special',
    title: 'Mashemeji Derby & FKF Premier League Double',
    marketId: 'match-winner-dc',
    leagueId: 'africa',
    region: 'kenya',
    date: '2026-10-18',
    publishedAt: '2026-10-16 12:15 EAT',
    source: '@CoachKipKE',
    punterId: 'coach-kip-ke',
    punterName: 'Coach Kip KE',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-FKF-DERBY',
    totalOdds: 2.15,
    status: 'pending',
    editorialNote: 'Gor Mahia defense has conceded only 1 goal in their last 6 domestic outings at Nyayo Stadium.',
    selections: [
      { id: 'ke1', match: 'Gor Mahia vs Tusker FC', homeTeam: 'Gor Mahia', awayTeam: 'Tusker FC', league: 'Kenya FKF Premier League', kickoff: '15:00 EAT', market: 'Double Chance', pick: 'Gor Mahia 1X', odds: 1.30, odds1: '1.75', oddsX: '3.20', odds2: '4.80', status: 'pending' },
      { id: 'ke2', match: 'AFC Leopards vs Bandari FC', homeTeam: 'AFC Leopards', awayTeam: 'Bandari FC', league: 'Kenya FKF Premier League', kickoff: '15:00 EAT', market: 'Match Winner', pick: 'AFC Leopards to Win', odds: 1.65, odds1: '1.65', oddsX: '3.15', odds2: '5.10', status: 'pending' }
    ]
  },
  {
    id: 'psl-soweto-double',
    title: 'South Africa PSL Soweto Giants Weekend',
    marketId: 'match-winner-dc',
    leagueId: 'africa',
    region: 'south-africa',
    date: '2026-10-17',
    publishedAt: '2026-10-16 11:00 SAST',
    source: 'BRYME African Desk',
    punterId: 'lagos-stats-guy',
    punterName: 'Lagos Stats Room',
    bookmaker: 'Betway',
    bookingCode: 'BTW-PSL-SOW',
    totalOdds: 2.22,
    status: 'pending',
    editorialNote: 'Mamelodi Sundowns and Orlando Pirates showing relentless domestic form in the PSL.',
    selections: [
      { id: 'za1', match: 'Mamelodi Sundowns vs Cape Town City', homeTeam: 'Sundowns', awayTeam: 'Cape Town City', league: 'South Africa PSL', kickoff: '15:30 SAST', market: 'Match Winner', pick: 'Sundowns to Win', odds: 1.35, odds1: '1.35', oddsX: '4.50', odds2: '8.00', status: 'pending' },
      { id: 'za2', match: 'Orlando Pirates vs Stellenbosch FC', homeTeam: 'Orlando Pirates', awayTeam: 'Stellenbosch FC', league: 'South Africa PSL', kickoff: '18:00 SAST', market: 'Double Chance', pick: 'Pirates 1X', odds: 1.25, odds1: '1.62', oddsX: '3.40', odds2: '5.50', status: 'pending' }
    ]
  }
];

export function getTicketsByRegion(region) {
  if (!region || region === 'all') return TICKETS;
  return TICKETS.filter(t => t.region === region || t.leagueId === region);
}

export function getTicketsByMarket(marketId) {
  if (!marketId || marketId === 'all') return TICKETS;
  return TICKETS.filter(t => t.marketId === marketId);
}

export function getTicketsByPunter(punterId) {
  if (!punterId) return TICKETS;
  return TICKETS.filter(t => t.punterId === punterId);
}

export function getTicketsByStatus(status) {
  if (!status || status === 'all') return TICKETS;
  return TICKETS.filter(t => t.status === status);
}

export function getTicketById(id) {
  return TICKETS.find(t => t.id === id);
}

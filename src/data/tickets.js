/**
 * BRYME Predictions - Pan-African Tickets & Results Database
 * Covering all African football regions + European top flights:
 * - West Africa: Nigeria (NPFL), Ghana (GPL)
 * - East Africa: Kenya (FKF), Uganda (UPL), Tanzania (NBC Premier League)
 * - Southern Africa: South Africa (PSL), Zambia
 * - North Africa & Continental: CAF Champions League, Egypt, Morocco, Tunisia
 * - European Top Flights: Premier League, Champions League, La Liga
 */

export const AFRICAN_REGIONS = [
  { id: 'all', name: 'All African & Global', flag: '🌍' },
  { id: 'nigeria', name: 'Nigeria (NPFL)', flag: '🇳🇬' },
  { id: 'kenya', name: 'Kenya (FKF)', flag: '🇰🇪' },
  { id: 'ghana', name: 'Ghana (GPL)', flag: '🇬🇭' },
  { id: 'south-africa', name: 'South Africa (PSL)', flag: '🇿🇦' },
  { id: 'east-africa', name: 'East Africa (UG/TZ)', flag: '🇺🇬' },
  { id: 'north-africa-caf', name: 'CAF & North Africa', flag: '🏆' },
  { id: 'europe', name: 'Europe Top Flights', flag: '🇪🇺' },
];

export const TICKETS = [
  // ── 1. NIGERIA (NPFL) TICKETS ──
  {
    id: 'npfl-weekend-trio',
    title: 'NPFL Matchday 8 Home Fortress Acca',
    marketId: 'match-winner-dc',
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
      { id: 'ng1', match: 'Enyimba FC vs Remo Stars', homeTeam: 'Enyimba FC', awayTeam: 'Remo Stars', league: 'Nigeria NPFL', kickoff: '16:00 WAT', market: 'Double Chance', pick: 'Enyimba 1X (Home or Draw)', odds: 1.28, status: 'pending' },
      { id: 'ng2', match: 'Rivers United vs Rangers International', homeTeam: 'Rivers United', awayTeam: 'Rangers Int.', league: 'Nigeria NPFL', kickoff: '16:00 WAT', market: 'Double Chance', pick: 'Rivers United 1X', odds: 1.24, status: 'pending' },
      { id: 'ng3', match: 'Shooting Stars vs Kano Pillars', homeTeam: 'Shooting Stars (3SC)', awayTeam: 'Kano Pillars', league: 'Nigeria NPFL', kickoff: '16:00 WAT', market: 'Match Winner', pick: 'Shooting Stars to Win', odds: 1.80, status: 'pending' }
    ]
  },
  {
    id: 'npfl-goals-slip',
    title: 'NPFL Low-Variance Under Goals Double',
    marketId: 'over-under-goals',
    region: 'nigeria',
    date: '2026-10-18',
    publishedAt: '2026-10-16 11:30 WAT',
    source: '@LagosStatsGuy',
    punterId: 'lagos-stats-guy',
    punterName: 'Lagos Stats Room',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-NPFL-UN',
    totalOdds: 1.95,
    status: 'pending',
    editorialNote: 'NPFL away fixtures heavily trend toward tactical low-scoring ties (Under 2.5 Goals hit rate: 71%).',
    selections: [
      { id: 'ng4', match: 'Bendel Insurance vs Plateau United', homeTeam: 'Bendel Insurance', awayTeam: 'Plateau United', league: 'Nigeria NPFL', kickoff: '16:00 WAT', market: 'Over/Under', pick: 'Under 2.5 Goals', odds: 1.40, status: 'pending' },
      { id: 'ng5', match: 'Kwara United vs Sunshine Stars', homeTeam: 'Kwara United', awayTeam: 'Sunshine Stars', league: 'Nigeria NPFL', kickoff: '16:00 WAT', market: 'Over/Under', pick: 'Under 2.5 Goals', odds: 1.39, status: 'pending' }
    ]
  },

  // ── 2. KENYA (FKF) TICKETS ──
  {
    id: 'fkf-mashemeji-special',
    title: 'Mashemeji Derby & FKF Premier League Double',
    marketId: 'match-winner-dc',
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
    editorialNote: 'Nairobi Mashemeji Derby special featuring Kenya record champions Gor Mahia against AFC Leopards.',
    selections: [
      { id: 'ke1', match: 'Gor Mahia vs AFC Leopards', homeTeam: 'Gor Mahia', awayTeam: 'AFC Leopards', league: 'Kenya FKF Premier League', kickoff: '15:00 EAT', market: 'Double Chance', pick: 'Gor Mahia 1X', odds: 1.32, status: 'pending' },
      { id: 'ke2', match: 'Tusker FC vs Kenya Police FC', homeTeam: 'Tusker FC', awayTeam: 'Kenya Police', league: 'Kenya FKF Premier League', kickoff: '15:00 EAT', market: 'Double Chance', pick: '12 (Either Team Wins)', odds: 1.38, status: 'pending' }
    ]
  },
  {
    id: 'fkf-coastal-goals',
    title: 'FKF East African Over 1.5 Goals Slip',
    marketId: 'over-under-goals',
    region: 'kenya',
    date: '2026-10-18',
    publishedAt: '2026-10-16 10:00 EAT',
    source: '@NairobiPunter',
    punterId: 'nairobi-punter',
    punterName: 'Nairobi Corner & Cards',
    bookmaker: 'MozzartBet',
    bookingCode: 'MZ-FKF-O15',
    totalOdds: 2.45,
    status: 'pending',
    editorialNote: 'Over 1.5 Goals double backed by attacking flank conversion metrics in Mombasa and Machakos.',
    selections: [
      { id: 'ke3', match: 'Bandari FC vs Kakamega Homeboyz', homeTeam: 'Bandari FC', awayTeam: 'Kakamega Homeboyz', league: 'Kenya FKF Premier League', kickoff: '15:00 EAT', market: 'Over/Under', pick: 'Over 1.5 Goals', odds: 1.48, status: 'pending' },
      { id: 'ke4', match: 'Ulinzi Stars vs KCB FC', homeTeam: 'Ulinzi Stars', awayTeam: 'KCB FC', league: 'Kenya FKF Premier League', kickoff: '15:00 EAT', market: 'Over/Under', pick: 'Over 1.5 Goals', odds: 1.52, status: 'pending' }
    ]
  },

  // ── 3. GHANA (GPL) TICKETS ──
  {
    id: 'ghana-gpl-super-clash',
    title: 'Ghana Premier League Super Clash Ticket',
    marketId: 'match-winner-dc',
    region: 'ghana',
    date: '2026-10-18',
    publishedAt: '2026-10-16 13:00 GMT',
    source: 'BRYME Editorial',
    punterId: 'naija-tactician',
    punterName: 'The Naija Tactician',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-GPL-CLASH',
    totalOdds: 2.22,
    status: 'pending',
    editorialNote: 'Kumasi and Accra giants clash: Asante Kotoko host Accra Hearts of Oak at Baba Yara Stadium.',
    selections: [
      { id: 'gh1', match: 'Asante Kotoko vs Hearts of Oak', homeTeam: 'Asante Kotoko', awayTeam: 'Hearts of Oak', league: 'Ghana Premier League', kickoff: '15:00 GMT', market: 'Double Chance', pick: 'Asante Kotoko 1X', odds: 1.30, status: 'pending' },
      { id: 'gh2', match: 'Medeama SC vs Aduana Stars', homeTeam: 'Medeama SC', awayTeam: 'Aduana Stars', league: 'Ghana Premier League', kickoff: '15:00 GMT', market: 'Double Chance', pick: 'Medeama 1X', odds: 1.25, status: 'pending' }
    ]
  },

  // ── 4. SOUTH AFRICA (PSL) TICKETS ──
  {
    id: 'psl-sundowns-pirates',
    title: 'South Africa PSL Heavyweights 3-Fold',
    marketId: 'match-winner-dc',
    region: 'south-africa',
    date: '2026-10-17',
    publishedAt: '2026-10-16 15:30 SAST',
    source: 'BRYME Editorial',
    punterId: 'lagos-stats-guy',
    punterName: 'Lagos Stats Room',
    bookmaker: 'BetKing',
    bookingCode: 'BK-PSL-SAF3',
    totalOdds: 2.68,
    status: 'pending',
    editorialNote: 'South Africa Betway Premiership showdown: Mamelodi Sundowns host Orlando Pirates in Pretoria.',
    selections: [
      { id: 'za1', match: 'Mamelodi Sundowns vs Orlando Pirates', homeTeam: 'Sundowns', awayTeam: 'Orlando Pirates', league: 'South Africa PSL', kickoff: '15:30 SAST', market: 'Double Chance', pick: 'Sundowns 1X', odds: 1.26, status: 'pending' },
      { id: 'za2', match: 'Kaizer Chiefs vs SuperSport United', homeTeam: 'Kaizer Chiefs', awayTeam: 'SuperSport United', league: 'South Africa PSL', kickoff: '17:30 SAST', market: 'Double Chance', pick: '12 (Either Win)', odds: 1.36, status: 'pending' },
      { id: 'za3', match: 'Stellenbosch FC vs Cape Town City', homeTeam: 'Stellenbosch', awayTeam: 'Cape Town City', league: 'South Africa PSL', kickoff: '15:00 SAST', market: 'Double Chance', pick: 'Stellenbosch 1X', odds: 1.30, status: 'pending' }
    ]
  },

  // ── 5. EAST AFRICA (UGANDA & TANZANIA) ──
  {
    id: 'east-africa-kariakoo-kampala',
    title: 'Kariakoo & Kampala Derby Weekend Combo',
    marketId: 'btts',
    region: 'east-africa',
    date: '2026-10-17',
    publishedAt: '2026-10-16 14:45 EAT',
    source: '@CoachKipKE',
    punterId: 'coach-kip-ke',
    punterName: 'Coach Kip KE',
    bookmaker: 'Fortebet',
    bookingCode: 'FT-EAF-DERBY',
    totalOdds: 3.10,
    status: 'pending',
    editorialNote: 'Tanzania Kariakoo Derby (Simba vs Yanga) plus Uganda Premier League title clash (Vipers vs KCCA).',
    selections: [
      { id: 'ea1', match: 'Simba SC vs Young Africans (Yanga)', homeTeam: 'Simba SC', awayTeam: 'Young Africans', league: 'Tanzania NBC Premier League', kickoff: '17:00 EAT', market: 'BTTS', pick: 'Both Teams to Score (GG)', odds: 1.82, status: 'pending' },
      { id: 'ea2', match: 'Vipers SC vs KCCA FC', homeTeam: 'Vipers SC', awayTeam: 'KCCA FC', league: 'Uganda Premier League', kickoff: '16:00 EAT', market: 'Double Chance', pick: 'Vipers SC 1X', odds: 1.32, status: 'pending' }
    ]
  },

  // ── 6. CAF CHAMPIONS LEAGUE & NORTH AFRICA ──
  {
    id: 'caf-continental-titans',
    title: 'CAF Champions League Continental Titans Slip',
    marketId: 'match-winner-dc',
    region: 'north-africa-caf',
    date: '2026-10-18',
    publishedAt: '2026-10-16 16:00 WAT',
    source: 'BRYME Editorial',
    punterId: 'delta-capo',
    punterName: 'Delta Capo Bets',
    bookmaker: '1xBet',
    bookingCode: '1X-CAF-TITANS',
    totalOdds: 3.40,
    status: 'pending',
    editorialNote: 'Africa premier club competition: Record 12-time kings Al Ahly take on South African champions Sundowns.',
    selections: [
      { id: 'caf1', match: 'Al Ahly vs Mamelodi Sundowns', homeTeam: 'Al Ahly', awayTeam: 'Mamelodi Sundowns', league: 'CAF Champions League', kickoff: '19:00 Cairo', market: 'Double Chance', pick: 'Al Ahly 1X', odds: 1.35, status: 'pending' },
      { id: 'caf2', match: 'Esperance de Tunis vs Pyramids FC', homeTeam: 'Esperance', awayTeam: 'Pyramids FC', league: 'CAF Champions League', kickoff: '20:00 Tunis', market: 'Double Chance', pick: 'Esperance 1X', odds: 1.38, status: 'pending' },
      { id: 'caf3', match: 'Raja Casablanca vs AS FAR Rabat', homeTeam: 'Raja Casablanca', awayTeam: 'AS FAR Rabat', league: 'Morocco Botola Pro', kickoff: '20:30 WAT', market: 'Double Chance', pick: '12 (Either Win)', odds: 1.36, status: 'pending' }
    ]
  },

  // ── 7. ANYBODY-WIN (12) TICKETS ──
  {
    id: 'anybody-win-20-sat',
    title: 'Weekend 20-Match Anybody-Win Mega Ticket',
    marketId: 'anybody-win',
    region: 'europe',
    anybodyWinTab: '20-selections',
    date: '2026-10-17',
    publishedAt: '2026-10-16 14:00 WAT',
    source: 'BRYME Editorial',
    punterId: 'delta-capo',
    punterName: 'Delta Capo Bets',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-AW20-OCT',
    totalOdds: 8.42,
    status: 'pending',
    editorialNote: 'Carefully vetted 20 fixtures where both teams play high-tempo football with negligible draw likelihood.',
    selections: [
      { id: 's1', match: 'Tottenham vs West Ham', homeTeam: 'Tottenham', awayTeam: 'West Ham', league: 'Premier League', kickoff: '12:30 WAT', market: 'Double Chance', pick: '12 (Either Team Wins)', odds: 1.18, status: 'pending' },
      { id: 's2', match: 'Fulham vs Aston Villa', homeTeam: 'Fulham', awayTeam: 'Aston Villa', league: 'Premier League', kickoff: '15:00 WAT', market: 'Double Chance', pick: '12 (Either Team Wins)', odds: 1.25, status: 'pending' },
      { id: 's3', match: 'Manchester United vs Brentford', homeTeam: 'Man United', awayTeam: 'Brentford', league: 'Premier League', kickoff: '15:00 WAT', market: 'Double Chance', pick: '12 (Either Team Wins)', odds: 1.22, status: 'pending' },
      { id: 's4', match: 'Bayer Leverkusen vs Frankfurt', homeTeam: 'Leverkusen', awayTeam: 'Frankfurt', league: 'Bundesliga', kickoff: '14:30 WAT', market: 'Double Chance', pick: '12 (Either Team Wins)', odds: 1.15, status: 'pending' }
    ]
  },

  // ── 8. COMPLETED HISTORICAL RESULTS (ACROSS AFRICA) ──
  {
    id: 'result-npfl-derby-won',
    title: 'NPFL Matchday 7 Oriental Derby (WON)',
    marketId: 'match-winner-dc',
    region: 'nigeria',
    date: '2026-10-13',
    publishedAt: '2026-10-13 18:30 WAT',
    source: '@NaijaTactician',
    punterId: 'naija-tactician',
    punterName: 'The Naija Tactician',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-ORIENT-WON',
    totalOdds: 2.10,
    status: 'won',
    editorialNote: 'FT: Enyimba 2 - 1 Remo Stars & Rangers 1 - 0 Kwara United. Clean home double in Aba and Enugu!',
    selections: [
      { id: 'rn1', match: 'Enyimba FC vs Remo Stars', homeTeam: 'Enyimba FC', awayTeam: 'Remo Stars', league: 'Nigeria NPFL', kickoff: 'FT: 2-1', market: 'Double Chance', pick: 'Enyimba 1X', odds: 1.28, status: 'won' },
      { id: 'rn2', match: 'Rangers Int. vs Kwara United', homeTeam: 'Rangers Int.', awayTeam: 'Kwara United', league: 'Nigeria NPFL', kickoff: 'FT: 1-0', market: 'Match Winner', pick: 'Rangers Int. to Win', odds: 1.64, status: 'won' }
    ]
  },
  {
    id: 'result-fkf-gor-won',
    title: 'Kenya FKF Nyayo Stadium Banker (WON)',
    marketId: 'match-winner-dc',
    region: 'kenya',
    date: '2026-10-12',
    publishedAt: '2026-10-12 17:15 EAT',
    source: '@CoachKipKE',
    punterId: 'coach-kip-ke',
    punterName: 'Coach Kip KE',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-GOR-WON',
    totalOdds: 1.75,
    status: 'won',
    editorialNote: 'FT: Gor Mahia 2 - 0 Shabana FC at Nyayo Stadium. Clean sheet and 3 points secured.',
    selections: [
      { id: 'rk1', match: 'Gor Mahia vs Shabana FC', homeTeam: 'Gor Mahia', awayTeam: 'Shabana FC', league: 'Kenya FKF Premier League', kickoff: 'FT: 2-0', market: 'Match Winner', pick: 'Gor Mahia to Win', odds: 1.42, status: 'won' },
      { id: 'rk2', match: 'Tusker FC vs Murang’a Seal', homeTeam: 'Tusker FC', awayTeam: 'Murang’a Seal', league: 'Kenya FKF Premier League', kickoff: 'FT: 1-1', market: 'Double Chance', pick: 'Tusker 1X', odds: 1.23, status: 'won' }
    ]
  },
  {
    id: 'result-psl-sundowns-won',
    title: 'South Africa PSL Loftus Versfeld Double (WON)',
    marketId: 'over-under-goals',
    region: 'south-africa',
    date: '2026-10-14',
    publishedAt: '2026-10-14 21:30 SAST',
    source: 'BRYME Editorial',
    punterId: 'lagos-stats-guy',
    punterName: 'Lagos Stats Room',
    bookmaker: 'BetKing',
    bookingCode: 'BK-SUN-WON',
    totalOdds: 2.30,
    status: 'won',
    editorialNote: 'FT: Mamelodi Sundowns 3 - 0 Marumo Gallants & Pirates 2 - 1 Polokwane City.',
    selections: [
      { id: 'rz1', match: 'Mamelodi Sundowns vs Marumo Gallants', homeTeam: 'Sundowns', awayTeam: 'Marumo Gallants', league: 'South Africa PSL', kickoff: 'FT: 3-0', market: 'Match Winner', pick: 'Sundowns to Win', odds: 1.38, status: 'won' },
      { id: 'rz2', match: 'Orlando Pirates vs Polokwane City', homeTeam: 'Orlando Pirates', awayTeam: 'Polokwane City', league: 'South Africa PSL', kickoff: 'FT: 2-1', market: 'Over/Under', pick: 'Over 1.5 Goals', odds: 1.40, status: 'won' }
    ]
  },
  {
    id: 'result-caf-ahly-won',
    title: 'CAF Champions League Cairo Night (WON)',
    marketId: 'match-winner-dc',
    region: 'north-africa-caf',
    date: '2026-10-11',
    publishedAt: '2026-10-11 22:00 Cairo',
    source: 'BRYME Editorial',
    punterId: 'delta-capo',
    punterName: 'Delta Capo Bets',
    bookmaker: '1xBet',
    bookingCode: '1X-AHLY-WON',
    totalOdds: 1.90,
    status: 'won',
    editorialNote: 'FT: Al Ahly 3 - 0 Gor Mahia in CAF Champions League preliminary tie at Cairo International Stadium.',
    selections: [
      { id: 'rc1', match: 'Al Ahly vs Gor Mahia', homeTeam: 'Al Ahly', awayTeam: 'Gor Mahia', league: 'CAF Champions League', kickoff: 'FT: 3-0', market: 'Match Winner', pick: 'Al Ahly to Win', odds: 1.25, status: 'won' },
      { id: 'rc2', match: 'Esperance vs Dekedaha', homeTeam: 'Esperance', awayTeam: 'Dekedaha', league: 'CAF Champions League', kickoff: 'FT: 4-0', market: 'Over/Under', pick: 'Over 2.5 Goals', odds: 1.45, status: 'won' }
    ]
  },
  {
    id: 'result-gpl-hearts-lost',
    title: 'Ghana Premier League Away Trip (LOST)',
    marketId: 'match-winner-dc',
    region: 'ghana',
    date: '2026-10-10',
    publishedAt: '2026-10-10 18:00 GMT',
    source: '@NaijaTactician',
    punterId: 'naija-tactician',
    punterName: 'The Naija Tactician',
    bookmaker: 'SportyBet',
    bookingCode: 'BC4-HEARTS-LOST',
    totalOdds: 2.80,
    status: 'lost',
    editorialNote: 'Honest permanent record: Hearts of Oak suffered a surprise 1-0 away defeat at Bibiani Gold Stars.',
    selections: [
      { id: 'rg1', match: 'Gold Stars vs Hearts of Oak', homeTeam: 'Gold Stars', awayTeam: 'Hearts of Oak', league: 'Ghana Premier League', kickoff: 'FT: 1-0', market: 'Double Chance', pick: 'Hearts of Oak X2', odds: 1.45, status: 'lost' },
      { id: 'rg2', match: 'Asante Kotoko vs Nations FC', homeTeam: 'Asante Kotoko', awayTeam: 'Nations FC', league: 'Ghana Premier League', kickoff: 'FT: 2-0', market: 'Match Winner', pick: 'Kotoko to Win', odds: 1.62, status: 'won' }
    ]
  },
  {
    id: 'result-ucl-madrid-won',
    title: 'European Champions League 4-Fold (WON)',
    marketId: 'over-under-goals',
    region: 'europe',
    date: '2026-10-14',
    publishedAt: '2026-10-14 22:30 WAT',
    source: '@CoachKipKE',
    punterId: 'coach-kip-ke',
    punterName: 'Coach Kip KE',
    bookmaker: 'Bet9ja',
    bookingCode: 'B9J-UCL-WON4',
    totalOdds: 2.12,
    status: 'won',
    editorialNote: 'Real Madrid vs Dortmund 5-2 goal feast, and Aston Villa 2-0 Bologna.',
    selections: [
      { id: 'eu1', match: 'Real Madrid vs Dortmund', homeTeam: 'Real Madrid', awayTeam: 'Dortmund', league: 'Champions League', kickoff: 'FT: 5-2', market: 'Over/Under', pick: 'Over 2.5 Goals', odds: 1.48, status: 'won' },
      { id: 'eu2', match: 'Aston Villa vs Bologna', homeTeam: 'Aston Villa', awayTeam: 'Bologna', league: 'Champions League', kickoff: 'FT: 2-0', market: 'Match Winner', pick: 'Aston Villa to Win', odds: 1.43, status: 'won' }
    ]
  }
];

export function getTicketsByRegion(region) {
  if (!region || region === 'all') return TICKETS;
  return TICKETS.filter(t => t.region === region);
}

export function getTicketsByMarket(marketId) {
  return TICKETS.filter(t => t.marketId === marketId);
}

export function getTicketsByPunter(punterId) {
  return TICKETS.filter(t => t.punterId === punterId);
}

export function getTicketsByStatus(status) {
  return TICKETS.filter(t => t.status === status);
}

export function getTicketById(id) {
  return TICKETS.find(t => t.id === id);
}

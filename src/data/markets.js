export const MARKETS = [
  {
    id: 'anybody-win',
    slug: 'anybody-win',
    name: 'Anybody-Win Market',
    shortName: 'Anybody-Win',
    badge: 'High Frequency',
    description: 'Selections where either team winning pays out (12 / Double Chance No Draw), popular for extensive accumulators across high-scoring leagues.',
    tacticalTip: 'Ideal for matches between aggressive attacking teams with low draw historical probability (<18%).',
    presets: ['20 Selections', '40 Selections', '50 Selections', "Today's Picks", 'Long Shots']
  },
  {
    id: 'over-under-goals',
    slug: 'over-under-goals',
    name: 'Over/Under Goals',
    shortName: 'Over/Under',
    badge: 'Goals',
    description: 'Goal line markets focusing on total match goals (Over 1.5, Over 2.5, Under 3.5) based on xG trends and team attacking metrics.',
    tacticalTip: 'Over 1.5 offers stability in multi-game tickets when pairing top European leagues like Bundesliga and Eredivisie.',
    presets: ['Over 1.5 Goals', 'Over 2.5 Goals', 'Under 3.5 Goals']
  },
  {
    id: 'btts',
    slug: 'btts',
    name: 'Both Teams to Score (GG/NG)',
    shortName: 'BTTS / GG',
    badge: 'Popular',
    description: 'Predicting whether both teams will find the back of the net (Goal-Goal) or at least one team will keep a clean sheet (No-Goal).',
    tacticalTip: 'Look for teams with high defensive vulnerability on away turf combined with strong home offensive form.',
    presets: ['BTTS Yes (GG)', 'BTTS No (NG)']
  },
  {
    id: 'match-winner-dc',
    slug: 'match-winner-dc',
    name: 'Match Winner / Double Chance',
    shortName: '1X2 / DC',
    badge: 'Core',
    description: 'Classic three-way outright winner (1X2) and safer two-outcome coverage (1X Home or Draw, X2 Away or Draw, 12 Either Team).',
    tacticalTip: 'Double Chance is standard risk reduction for away favorites facing stubborn mid-table hosts.',
    presets: ['Home Win (1)', 'Double Chance (1X)', 'Away Win (2)', 'Double Chance (X2)']
  },
  {
    id: 'first-half-goals',
    slug: 'first-half-goals',
    name: 'First Half Goals',
    shortName: '1st Half Goals',
    badge: 'Early Action',
    description: 'Action decided within the first 45 minutes plus stoppage time. Popular lines include Over 0.5 1H and 1H BTTS.',
    tacticalTip: 'Teams that press high from kickoff often score or concede in the opening 30 minutes.',
    presets: ['Over 0.5 1H', 'Under 1.5 1H']
  },
  {
    id: 'second-half-goals',
    slug: 'second-half-goals',
    name: 'Second Half Goals',
    shortName: '2nd Half Goals',
    badge: 'In-Play Trends',
    description: 'Markets focusing on late-game stamina, second-half substitutions, and highest-scoring half patterns.',
    tacticalTip: 'Statistically, over 58% of European league goals occur in the second 45 minutes.',
    presets: ['Over 0.5 2H', '2nd Half Most Goals']
  },
  {
    id: 'corners',
    slug: 'corners',
    name: 'Corners Market',
    shortName: 'Corners',
    badge: 'Set Pieces',
    description: 'Total match corners (Over 8.5, Over 9.5) and team corner handicaps driven by wing-play width and shot conversion rates.',
    tacticalTip: 'Teams using traditional inverted wingers and overlapping fullbacks consistently generate high corner counts.',
    presets: ['Over 8.5 Corners', 'Over 9.5 Corners', 'Team Corners Over 4.5']
  },
  {
    id: 'accumulators',
    slug: 'accumulators',
    name: 'Accumulator Tickets',
    shortName: 'Accas / Multis',
    badge: 'Combos',
    description: 'Multi-selection tickets combining multiple low-risk selections into composite odds ranging from 3.00 to 15.00+.',
    tacticalTip: 'Every additional selection multiplies the house margin. Keep accumulators within disciplined limits.',
    presets: ['3-Fold Combo', '5-Fold Acca', 'Weekend Mega Acca']
  },
  {
    id: 'long-shots',
    slug: 'long-shots',
    name: 'Long Shots of the Weekend',
    shortName: 'Long Shots',
    badge: 'High Odds',
    description: 'Speculative high-odds slips (25.00+ odds) created for recreational stakes, openly labeled as high variance.',
    tacticalTip: 'Treat strictly as entertainment. Never allocate more than 1% of a recreational bankroll to long-shot tickets.',
    presets: ['50+ Odds Weekend Flyer', 'Draw Specialist Ticket']
  }
];

export const ANYBODY_WIN_TABS = [
  { id: '20-selections', label: '20 Selections', count: 2 },
  { id: '40-selections', label: '40 Selections', count: 1 },
  { id: '50-selections', label: '50 Selections', count: 1 },
  { id: 'todays-picks', label: "Today's Selections", count: 3 },
  { id: 'long-shots', label: 'Long Shots', count: 2 }
];

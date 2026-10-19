/**
 * BRYME Predictions - Tracked African Punters & Daily Booking Codes
 * Independent tracking of recognized analysts across Nigeria and Africa.
 * Pinned at top: Mr banks 📌
 */

export const INITIAL_PUNTERS = [
  {
    id: 'punter-mrbanks',
    displayName: 'Mr banks',
    handle: '@MrBanks',
    pinned: true,
    isPinned: true,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'MB',
    specialty: 'High-Roller Banker 2 Odds & Whale Syndicate Slips',
    bio: 'Renowned high-conviction analyst. Focuses on heavy-stake banker doubles, European giants, and disciplined bankroll execution.',
    winStreak: '11 Wins',
    hitRate: '86%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-mb-01',
        bookmaker: 'sportybet',
        code: 'BC4-BANKS-2OD',
        marketType: 'Whale Banker 2-Odds (Double Chance & Over 1.5)',
        gamesCount: 2,
        totalOdds: 2.15,
        status: 'active',
        dropTime: '02:00 AM WAT'
      },
      {
        id: 'pcode-mb-02',
        bookmaker: 'bet9ja',
        code: 'B9J-BANKS-2OD',
        marketType: 'Whale Banker 2-Odds (Double Chance & Over 1.5)',
        gamesCount: 2,
        totalOdds: 2.10,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-tallman',
    displayName: 'Tall man',
    handle: '@TallManPunter',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'TM',
    specialty: 'Over 1.5 & Over 2.5 High-Frequency Goals Radar',
    bio: 'Specialist in European goal markets (Bundesliga, Eredivisie, EPL) tracking xG metrics for early and late goal surges.',
    winStreak: '7 Wins',
    hitRate: '81%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-tm-01',
        bookmaker: 'sportybet',
        code: 'BC4-TALL-O15',
        marketType: 'Over 1.5 Goals High-Frequency Radar',
        gamesCount: 4,
        totalOdds: 2.45,
        status: 'active',
        dropTime: '02:00 AM WAT'
      },
      {
        id: 'pcode-tm-02',
        bookmaker: 'bet9ja',
        code: 'B9J-TALL-O15',
        marketType: 'Over 1.5 Goals High-Frequency Radar',
        gamesCount: 4,
        totalOdds: 2.40,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-bosstips',
    displayName: 'Boss Tips',
    handle: '@BossTipsHQ',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'BT',
    specialty: 'European League Combinations & Straight Wins',
    bio: 'Disciplined match previewer analyzing team news, tactical form, and home fortress records across the Top 5 leagues.',
    winStreak: '5 Wins',
    hitRate: '79%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-bt-01',
        bookmaker: 'sportybet',
        code: 'BC4-BOSS-COMBO',
        marketType: 'Straight Wins & 1X Combos',
        gamesCount: 3,
        totalOdds: 2.80,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-drzeh',
    displayName: 'Dr zeh',
    handle: '@DrZehPunter',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'DZ',
    specialty: 'Corner Markets & Goal Interval Strategy',
    bio: 'Statistical deep-diver on alternative betting markets: Over 8.5 Corners, Cards, and first-half goal momentum.',
    winStreak: '8 Wins',
    hitRate: '82%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-dz-01',
        bookmaker: 'sportybet',
        code: 'BC4-ZEH-CORN',
        marketType: 'Total Corners Over 8.5 & 9.5 Radar',
        gamesCount: 3,
        totalOdds: 2.65,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-bossolamilekan',
    displayName: 'Bossolamilekan',
    handle: '@BossOlamilekan',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'BO',
    specialty: 'Double Chance Banker Accumulators',
    bio: 'Specialist in low-variance safety picks. Focuses on unbeaten home streaks in Spain, Italy, and England.',
    winStreak: '6 Wins',
    hitRate: '84%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-bo-01',
        bookmaker: 'sportybet',
        code: 'BC4-BOSSO-1X',
        marketType: 'Double Chance (1X/X2) Fortress Acca',
        gamesCount: 3,
        totalOdds: 2.10,
        status: 'active',
        dropTime: '02:00 AM WAT'
      },
      {
        id: 'pcode-bo-02',
        bookmaker: 'bet9ja',
        code: 'B9J-BOSSO-1X',
        marketType: 'Double Chance (1X/X2) Fortress Acca',
        gamesCount: 3,
        totalOdds: 2.05,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-lightbet',
    displayName: 'Lightbet',
    handle: '@LightBetPicks',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'LB',
    specialty: 'Weekend 3-Odds & UCL Midweek Specials',
    bio: 'Picks focused on European continental nights and high-value Saturday afternoon fixtures.',
    winStreak: '4 Wins',
    hitRate: '77%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-lb-01',
        bookmaker: 'sportybet',
        code: 'BC4-LIGHT-3OD',
        marketType: 'Midweek & Weekend 3-Odds Booster',
        gamesCount: 3,
        totalOdds: 3.15,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-mostwanted',
    displayName: 'Most wanted punter',
    handle: '@MostWantedPunter',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'MW',
    specialty: 'High-Conviction Overround Value Slips',
    bio: 'Tracking bookmaker odds discrepancies and sharp betting syndicate movements in European football.',
    winStreak: '9 Wins',
    hitRate: '83%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-mw-01',
        bookmaker: 'sportybet',
        code: 'BC4-WANTED-VAL',
        marketType: 'Value Odds Exploitation (Draw No Bet & Goals)',
        gamesCount: 3,
        totalOdds: 2.50,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-theonlyjayfund',
    displayName: 'Theonlyjayfund',
    handle: '@TheOnlyJayFund',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'JF',
    specialty: 'Rollover Compounding & Safe Haven Lines',
    bio: 'Advocate of mathematical compounding, capital preservation, and safe haven cashouts.',
    winStreak: '10 Wins',
    hitRate: '85%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-jf-01',
        bookmaker: 'sportybet',
        code: 'BC4-JAY-ROLL',
        marketType: 'Rollover Banker 1.50x Edge',
        gamesCount: 2,
        totalOdds: 1.55,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-mrbayo',
    displayName: 'Mr bayo',
    handle: '@MrBayoBets',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'MB',
    specialty: 'EPL & La Liga Both Teams to Score (GG)',
    bio: 'Focus on defensive vulnerabilities and high attacking conversion rates across European top flights.',
    winStreak: '5 Wins',
    hitRate: '78%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-mbayo-01',
        bookmaker: 'sportybet',
        code: 'BC4-BAYO-BTTS',
        marketType: 'Both Teams to Score (BTTS / GG)',
        gamesCount: 2,
        totalOdds: 2.25,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-talentedfight',
    displayName: 'Talented fight',
    handle: '@TalentedFight',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'TF',
    specialty: 'Asian Handicap & Draw No Bet Specials',
    bio: 'Eliminating the draw with quarter handicaps (+0.25, -0.75) and push-refund protections.',
    winStreak: '6 Wins',
    hitRate: '80%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-tf-01',
        bookmaker: 'sportybet',
        code: 'BC4-FIGHT-AH',
        marketType: 'Asian Handicap & DNB Safe Shield',
        gamesCount: 2,
        totalOdds: 2.05,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-39billion',
    displayName: '39billion',
    handle: '@39BillionPunts',
    pinned: false,
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: '39',
    specialty: 'Mega Multi-Slips & Weekend Long Shots',
    bio: 'Speculative long-odds accumulators (10x to 50x) with minimal stakes and maximum upside.',
    winStreak: '4 Wins',
    hitRate: '74%',
    verified: true,
    dailyCodes: [
      {
        id: 'pcode-39b-01',
        bookmaker: 'sportybet',
        code: 'BC4-39B-MEGA',
        marketType: 'Weekend Long-Shot Value Acca',
        gamesCount: 6,
        totalOdds: 12.80,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  }
];

export const PUNTERS = INITIAL_PUNTERS;
export const AFRICAN_PUNTERS = INITIAL_PUNTERS;


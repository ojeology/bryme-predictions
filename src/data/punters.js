/**
 * BRYME Predictions - Tracked African Punters & Daily Booking Codes
 * Independent tracking of recognized analysts across Nigeria, Kenya, Ghana, and South Africa.
 * Transparent: zero arbitrary win amounts. Punters and their daily booking codes are managed via Admin.
 */

export const INITIAL_PUNTERS = [
  {
    id: 'punter-femi',
    displayName: 'Chief Punter Femi',
    handle: '@femipicks_ng',
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'CF',
    specialty: 'European 2.00x Banker Doubles & Double Chance',
    bio: 'Disciplined statistical analyst focusing on low-variance European top flights.',
    dailyCodes: [
      {
        id: 'pcode-01',
        bookmaker: 'sportybet',
        code: 'BC4-FEMI-2OD',
        marketType: 'Double Chance & Over 1.5 Goals',
        gamesCount: 2,
        totalOdds: 2.08,
        status: 'active',
        dropTime: '02:00 AM WAT'
      },
      {
        id: 'pcode-02',
        bookmaker: 'bet9ja',
        code: 'B9J-FEMI-2OD',
        marketType: 'Double Chance & Over 1.5 Goals',
        gamesCount: 2,
        totalOdds: 2.05,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-coach-dan',
    displayName: 'Coach Dan Goals Radar',
    handle: '@coachdan_goals',
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'CD',
    specialty: 'Over 1.5 & Over 2.5 High-Frequency Goals Radar',
    bio: 'Tracking Bundesliga, Eredivisie & EPL xG metrics for early-goal and high-scoring matches.',
    dailyCodes: [
      {
        id: 'pcode-03',
        bookmaker: 'sportybet',
        code: 'BC4-DAN-O15',
        marketType: 'Over 1.5 Goals Radar',
        gamesCount: 4,
        totalOdds: 2.75,
        status: 'active',
        dropTime: '02:00 AM WAT'
      },
      {
        id: 'pcode-04',
        bookmaker: 'bet9ja',
        code: 'B9J-DAN-O15',
        marketType: 'Over 1.5 Goals Radar',
        gamesCount: 4,
        totalOdds: 2.70,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-coach-kip',
    displayName: 'Coach Kip KE',
    handle: '@coachkip_ke',
    region: 'Kenya',
    countryCode: 'KE',
    avatar: 'CK',
    specialty: 'Both Teams to Score (GG) & Scandinavian Leagues',
    bio: 'Kenyan football analyst breaking down European leagues and African domestic clashes.',
    dailyCodes: [
      {
        id: 'pcode-05',
        bookmaker: 'sportybet',
        code: 'BC4-KIP-GG',
        marketType: 'Both Teams to Score (GG)',
        gamesCount: 3,
        totalOdds: 3.45,
        status: 'active',
        dropTime: '02:00 AM WAT'
      },
      {
        id: 'pcode-06',
        bookmaker: '1xbet',
        code: '1XB-KIP-GG',
        marketType: 'Both Teams to Score (GG)',
        gamesCount: 3,
        totalOdds: 3.52,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-baba-tunde',
    displayName: 'Baba Tunde Accas',
    handle: '@babatunde_accas',
    region: 'Nigeria',
    countryCode: 'NG',
    avatar: 'BT',
    specialty: 'Weekend 5.00x Solid Accumulators',
    bio: 'Curates balanced 4-to-6 game accumulators across the European Top 5 leagues.',
    dailyCodes: [
      {
        id: 'pcode-07',
        bookmaker: 'sportybet',
        code: 'BC4-BT-ACCA5',
        marketType: 'European Solid Accumulator',
        gamesCount: 4,
        totalOdds: 5.18,
        status: 'active',
        dropTime: '02:00 AM WAT'
      },
      {
        id: 'pcode-08',
        bookmaker: 'betking',
        code: 'BK-BT-ACCA5',
        marketType: 'European Solid Accumulator',
        gamesCount: 4,
        totalOdds: 5.25,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  },
  {
    id: 'punter-sipho',
    displayName: 'Sipho Ndlovu Longshots',
    handle: '@sipho_longshots',
    region: 'South Africa',
    countryCode: 'ZA',
    avatar: 'SN',
    specialty: 'Weekend 10.00x - 25.00x Speculative Value Flyers',
    bio: 'Small stakes recreational accas targeting high multiplier payouts.',
    dailyCodes: [
      {
        id: 'pcode-09',
        bookmaker: 'sportybet',
        code: 'BC4-SN-MEGA10',
        marketType: 'Weekend Mega Longshot',
        gamesCount: 6,
        totalOdds: 10.45,
        status: 'active',
        dropTime: '02:00 AM WAT'
      }
    ]
  }
];

export const PUNTERS = INITIAL_PUNTERS;

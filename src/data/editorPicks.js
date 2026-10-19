export const EDITOR_PICKS = {
  trackedRecord: {
    totalPicks: 64,
    won: 41,
    lost: 21,
    void: 2,
    demoNotice: 'Demonstration sample tracking. No outcome is ever guaranteed.'
  },
  disclaimer: 'Lower odds mean lower risk, not no risk. Betting is never guaranteed. Always manage stakes responsibly.',
  saturdayPick: {
    id: 'editor-sat-best',
    title: "Saturday Editor's Best Pick",
    day: 'Saturday',
    targetOdds: 2.08,
    status: 'pending',
    date: '2026-10-17',
    bookmaker: 'Bet9ja',
    bookingCode: '5WFVHMQ',
    confidenceTag: 'Lowest-Risk Selections',
    selections: [
      {
        match: 'Bayer Leverkusen vs Eintracht Frankfurt',
        league: 'German Bundesliga',
        kickoff: '15:30 WAT',
        market: 'Over/Under Goals',
        pick: 'Over 2.5 Goals',
        odds: 1.44,
        reasoning: 'Form & Head-to-Head: Leverkusen have generated over 2.4 expected goals (xG) at home in 8 consecutive fixtures. The last 5 meetings between these clubs averaged 3.8 goals per match.'
      },
      {
        match: 'Liverpool vs Chelsea',
        league: 'English Premier League',
        kickoff: '17:30 WAT',
        market: 'Double Chance & Total Goals',
        pick: 'Liverpool 1X & Over 1.5 Goals',
        odds: 1.44,
        reasoning: 'Form: Liverpool have remained unbeaten in their last 14 league home ties against London sides, with Chelsea conceding in 7 of their last 8 away trips.'
      }
    ],
    summaryNote: 'Combined combined odds 2.08 across two high-frequency European domestic fixtures.'
  },
  sundayPick: {
    id: 'editor-sun-best',
    title: "Sunday Editor's Best Pick",
    day: 'Sunday',
    targetOdds: 2.02,
    status: 'pending',
    date: '2026-10-18',
    bookmaker: 'SportyBet',
    bookingCode: 'Q7S287',
    confidenceTag: 'Lowest-Risk Selections',
    selections: [
      {
        match: 'Barcelona vs Sevilla',
        league: 'Spanish La Liga',
        kickoff: '20:00 WAT',
        market: 'Match Winner & Team Goals',
        pick: 'Barcelona Win & Over 1.5 Goals',
        odds: 1.40,
        reasoning: 'Head-to-Head: Barcelona have won 5 of the last 6 league meetings against Sevilla at home, scoring 2+ goals in each victory.'
      },
      {
        match: 'AS Roma vs Inter Milan',
        league: 'Italian Serie A',
        kickoff: '19:45 WAT',
        market: 'Double Chance',
        pick: 'Inter Milan X2 (Draw or Away Win)',
        odds: 1.44,
        reasoning: 'Tactical Form: Inter have suffered only one away defeat in the last 12 calendar months in domestic league play.'
      }
    ],
    summaryNote: 'Target 2.02 odds leveraging away favorite stability and proven home goal metrics.'
  }
};

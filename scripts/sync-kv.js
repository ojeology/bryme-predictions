import { INITIAL_PUNTERS } from '../src/data/punters.js';
import { INITIAL_CODE_CATALOGUE } from '../src/data/catalogueCodes.js';
import { DAILY_BOOKING_TICKETS } from '../src/data/bookingTickets.js';
import { ACTIVE_CHALLENGE } from '../src/data/ladder.js';
import { MARKETS } from '../src/data/markets.js';
import { SYNDICATE_ARCHIVE } from '../src/data/syndicateArchive.js';

const DEFAULT_WHALE_SLIP = {
  id: 'whale-2-odds-today',
  title: "Today's Whale 2-Odds Syndicate Lock",
  staker: 'Lagos VIP Syndicate #04',
  stakeAmount: '₦500,000',
  totalOdds: 2.18,
  potentialReturn: '₦1,090,000',
  confidence: '94%',
  status: 'won', // WON & CASHED OUT
  payoutStatus: 'PAID OUT (₦1,090,000 CASHED)',
  sportyCode: 'BC4-WHALE',
  bet9jaCode: 'B9J-WHALE',
  kickoffTime: 'Settled & Won (Full Time)',
  punterCount: 4210,
  volumeStaked: '₦18,450,000',
  intel: 'SYNDICATE BET WON & PAID OUT! Both Real Madrid Over 1.5 Team Goals (2-1 FT) and Bayern Munich vs RB Leipzig Over 2.5 Goals (3-2 FT) cashed cleanly before full time delivering ₦1,090,000 total payout. Next Whale 2-Odds game drops for the next match cycle.',
  matches: [
    {
      id: 'm1',
      match: 'Real Madrid vs Sevilla (2-1 FT)',
      league: 'Spanish La Liga',
      kickoff: 'Full Time',
      pick: 'Real Madrid Over 1.5 Team Goals',
      odds: 1.45,
      status: 'won',
      resultScore: '2-1 FT (WON)',
      analysis: 'Madrid dominated with 18 shots; 2-1 final score crossed the 1.5 team goal mark in minute 64.'
    },
    {
      id: 'm2',
      match: 'Bayern Munich vs RB Leipzig (3-2 FT)',
      league: 'German Bundesliga',
      kickoff: 'Full Time',
      pick: 'Over 2.5 Total Goals',
      odds: 1.50,
      status: 'won',
      resultScore: '3-2 FT (WON)',
      analysis: 'Explosive 5-goal thriller sealed the Over 2.5 line by the 52nd minute.'
    }
  ]
};

async function syncKV() {
  const payload = {
    ladder: ACTIVE_CHALLENGE,
    tickets: DAILY_BOOKING_TICKETS,
    codeCatalogue: INITIAL_CODE_CATALOGUE,
    punters: INITIAL_PUNTERS,
    markets: MARKETS,
    whaleSlip: DEFAULT_WHALE_SLIP,
    syndicateArchive: SYNDICATE_ARCHIVE,
    adSettings: {
      monetagScript: '',
      adsterraTopBanner: '',
      adsterraInFeedBanner: '',
      adsterraPopunder: '',
      sportyAffiliateUrl: 'https://www.sportybet.com/',
      bet9jaAffiliateUrl: 'https://register.bet9ja.com/',
      oneXBetAffiliateUrl: 'https://1xbet.ng/',
      msportAffiliateUrl: 'https://www.msport.com/',
      betkingAffiliateUrl: 'https://www.betking.com/',
      twentyTwoBetAffiliateUrl: 'https://che.fluxbrox.com/redirect.aspx?pid=199669&bid=1488&lpid=25'
    },
    announcements: {
      tickerText: '★ TUESDAY UCL SPECIAL: Real Madrid vs Dortmund • 2.45x Banker Live',
      dropTimeWAT: '02:00 AM WAT',
      showUclBanner: true
    }
  };

  console.log('Syncing clean state to https://predictions.thebryme.com/api/state...');
  const res = await fetch('https://predictions.thebryme.com/api/state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Pin': 'bryme2026'
    },
    body: JSON.stringify(payload)
  });

  const json = await res.json();
  console.log('Result:', json);
}

syncKV().catch(console.error);

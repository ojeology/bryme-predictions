import { INITIAL_PUNTERS } from '../src/data/punters.js';
import { INITIAL_CODE_CATALOGUE } from '../src/data/catalogueCodes.js';
import { DAILY_BOOKING_TICKETS } from '../src/data/bookingTickets.js';
import { ACTIVE_CHALLENGE } from '../src/data/ladder.js';
import { MARKETS } from '../src/data/markets.js';

async function syncKV() {
  const payload = {
    ladder: ACTIVE_CHALLENGE,
    tickets: DAILY_BOOKING_TICKETS,
    codeCatalogue: INITIAL_CODE_CATALOGUE,
    punters: INITIAL_PUNTERS,
    markets: MARKETS,
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

import { GROUND_ZERO } from '../src/data/groundZeroData.js';

async function syncKV() {
  const payload = {
    version: 'ground-zero-v7',
    updatedAt: GROUND_ZERO.generatedAt,
    counts: GROUND_ZERO.counts,
    rollover: GROUND_ZERO.rollover,
    retrainingSchedule: GROUND_ZERO.retrainingSchedule,
  };

  try {
    console.log('Syncing Ground Zero v7 state to https://predictions.thebryme.com/api/state...');
    const res = await fetch('https://predictions.thebryme.com/api/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Pin': 'bryme2026',
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    console.log('Ground Zero KV Sync Result:', json);
  } catch (err) {
    console.warn('Non-fatal KV sync warning during build:', err?.message || err);
  }
}

syncKV();

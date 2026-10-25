import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { handleArbRequest } from '../arb/service.js';

const quotes = [
  {
    event: 'Alpha vs Beta', sport: 'Football', startsAt: '2027-01-15T15:00:00.000Z',
    market: 'Match winner', way: 2, rules: '90 minutes', outcome: 'home', label: 'Alpha',
    bookmaker: 'sportybet', odds: 2.2, fetchedAt: '2027-01-15T12:00:00.000Z',
  },
  {
    event: 'Alpha vs Beta', sport: 'Football', startsAt: '2027-01-15T15:00:00.000Z',
    market: 'Match winner', way: 2, rules: '90 minutes', outcome: 'away', label: 'Beta',
    bookmaker: 'nairabet', odds: 2.0, fetchedAt: '2027-01-15T12:00:00.000Z',
  },
];

test('status route is honest when no automatic feed is configured', async () => {
  const response = await handleArbRequest(new Request('http://local/api/arbs/status'), {});
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.mode, 'manual');
  assert.equal(data.connectors.length, 3);
  assert.ok(data.connectors.every((connector) => connector.status === 'not_configured'));
});

test('GET scanner returns no invented opportunities in manual mode', async () => {
  const response = await handleArbRequest(new Request('http://local/api/arbs?totalStake=100000'), {});
  const data = await response.json();
  assert.equal(data.mode, 'manual');
  assert.deepEqual(data.opportunities, []);
  assert.equal(data.quoteCount, 0);
});

test('POST scans only the normalized quotes supplied by the caller', async () => {
  const response = await handleArbRequest(new Request('http://local/api/arbs/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quotes, totalStake: 100000, rounding: 100 }),
  }), {});
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.mode, 'manual');
  assert.equal(data.opportunities.length, 1);
  assert.equal(data.opportunities[0].legs.reduce((sum, leg) => sum + leg.stake, 0), 100000);
  assert.match(data.notice, /Verify current prices/);
});

test('POST rejects malformed input and unrelated API paths pass through', async () => {
  const malformed = await handleArbRequest(new Request('http://local/api/arbs/scan', {
    method: 'POST', body: '{not-json',
  }), {});
  assert.equal(malformed.status, 400);
  const unrelated = await handleArbRequest(new Request('http://local/api/health'), {});
  assert.equal(unrelated, null);
});

test('configured combined feed scans fresh pre-match quotes and rejects stale prices', async () => {
  const generatedAt = Date.now();
  const liveQuotes = quotes.map((quote) => ({
    ...quote,
    startsAt: new Date(generatedAt + 60 * 60 * 1000).toISOString(),
    fetchedAt: new Date(generatedAt).toISOString(),
  }));
  const server = createServer((request, response) => {
    const stale = request.url === '/stale';
    const payload = liveQuotes.map((quote) => ({
      ...quote,
      fetchedAt: new Date(generatedAt - (stale ? 10 * 60 * 1000 : 0)).toISOString(),
    }));
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ quotes: payload }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const freshResponse = await handleArbRequest(new Request('http://local/api/arbs'), {
      ARB_FEED_URL: `http://127.0.0.1:${port}/fresh`,
    });
    const fresh = await freshResponse.json();
    assert.equal(fresh.mode, 'feed');
    assert.equal(fresh.quoteCount, 2);
    assert.equal(fresh.freshQuoteCount, 2);
    assert.equal(fresh.opportunities.length, 1);
    assert.equal(fresh.connectors.find((connector) => connector.id === 'sportybet').status, 'connected');

    const staleResponse = await handleArbRequest(new Request('http://local/api/arbs'), {
      ARB_FEED_URL: `http://127.0.0.1:${port}/stale`,
    });
    const stale = await staleResponse.json();
    assert.equal(stale.quoteCount, 2);
    assert.equal(stale.freshQuoteCount, 0);
    assert.equal(stale.opportunities.length, 0);
    assert.ok(stale.errors.some((error) => error.includes('freshness checks')));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

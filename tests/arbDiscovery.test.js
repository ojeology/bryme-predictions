import test from 'node:test';
import assert from 'node:assert/strict';
import { flattenBookPayload } from '../arb/connectors/normalize.js';
import { isLineFeed, flattenLineFeed } from '../arb/connectors/linefeed.js';
import { extractApiPaths, proveFeed } from '../arb/discovery.js';

const LINEFEED = {
  Sports: [
    {
      Id: 1,
      Name: 'Soccer',
      Competitions: [
        {
          Id: 11,
          Name: 'England - Premier League',
          Participants: [{ Id: 1, Name: 'Arsenal' }, { Id: 2, Name: 'Chelsea' }],
          Events: [
            {
              Id: 9,
              StartTime: Math.floor(Date.now() / 1000) + 3600,
              Home: 1,
              Away: 2,
              Outcomes: [
                { O: 'Arsenal', Od: '1.85' },
                { O: 'Draw', Od: '3.40' },
                { O: 'Chelsea', Od: '4.10' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

test('the 1xBet family payload is recognised', () => {
  assert.equal(isLineFeed(LINEFEED), true);
  assert.equal(isLineFeed({ quotes: [] }), false);
  assert.equal(isLineFeed(null), false);
});

test('a LineFeed event becomes three comparable quotes', () => {
  const quotes = flattenLineFeed(LINEFEED, { bookmaker: '1xbet' });
  assert.equal(quotes.length, 3);
  assert.deepEqual(quotes.map((quote) => quote.outcome), ['home', 'draw', 'away']);
  assert.equal(quotes[0].event, 'Arsenal v Chelsea');
  assert.equal(quotes[0].marketKey, 'match-result-1x2');
  assert.equal(quotes[0].rulesKey, '90-minutes');
  assert.equal(quotes[0].odds, 1.85);
  assert.ok(quotes[0].startsAt && !Number.isNaN(Date.parse(quotes[0].startsAt)));
});

test('the generic normaliser routes LineFeed through the same adapter', () => {
  const quotes = flattenBookPayload(LINEFEED, { bookmaker: '22bet' });
  assert.equal(quotes.length, 3);
  assert.equal(quotes[2].bookmaker, '22bet');
});

test('an outcome that is neither side nor draw is left out, not guessed', () => {
  const odd = JSON.parse(JSON.stringify(LINEFEED));
  odd.Sports[0].Competitions[0].Events[0].Outcomes = [{ O: 'Arsenal or Draw', Od: '1.20' }];
  const quotes = flattenLineFeed(odd, { bookmaker: '1xbet' });
  assert.equal(quotes.length, 0);
});

test('a price that is not above 1 is refused', () => {
  const odd = JSON.parse(JSON.stringify(LINEFEED));
  odd.Sports[0].Competitions[0].Events[0].Outcomes = [{ O: 'Arsenal', Od: '1.00' }];
  assert.equal(flattenLineFeed(odd, { bookmaker: '1xbet' }).length, 0);
});

test('API paths are pulled out of a page and its scripts', () => {
  const html = '<html><script src="/_next/static/chunks/main.js"></script>'
    + '<script src="https://cdn.example.com/app.js"></script></html>';
  const scripts = ['fetch("/api/v1/sports/football?lang=en");const w="wss://push.example.com/live";'];
  const { scriptUrls, candidates } = extractApiPaths(html, 'https://nairabet.com/sports/football', scripts);
  assert.ok(scriptUrls.some((url) => url.includes('/_next/static/chunks/main.js')));
  assert.ok(candidates.some((url) => url.includes('/api/v1/sports/football')));
  assert.ok(candidates.every((url) => url.startsWith('http')));
});

test('image and script paths are not treated as feeds', () => {
  const { candidates } = extractApiPaths('', 'https://x.com/', ['"https://x.com/assets/logo.png"']);
  assert.equal(candidates.length, 0);
});

test('a candidate that returns no prices is not accepted as a feed', async () => {
  const result = await proveFeed('data:text/plain,not-json', '1xbet');
  assert.equal(result.ok, false);
  assert.ok(result.reason);
});

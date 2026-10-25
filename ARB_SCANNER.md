# Pre-match Arbitrage Scanner

Route: **`#/arbs`** (for example, `https://predictions.thebryme.com/#/arbs`).

This feature calculates and tracks manually placed arbitrage bets. It does **not** log in to bookmakers, place bets, move funds, solve browser challenges, or describe sample prices as live odds.

## Included

- Two-outcome and three-outcome arbitrage calculations.
- Exact event/start-time, market/line, settlement-rule and outcome matching.
- NGN stake splitting with configurable rounding and the lowest post-rounding return shown separately from the ideal mathematical profit.
- Optional bookmaker verification links and a four-item manual verification gate.
- A local placement ledger with per-leg placed markers, actual-return settlement and CSV export. Records are not deleted by the UI.
- A shared Web Request API for Cloudflare Workers and Vite development/preview.
- Modular connector definitions for SportyBet, MSport, LiveScore Bet, NairaBet, 22Bet and 1xBet.
  **SportyBet, MSport and LiveScore Bet are connected and live**; the other three are **not
  configured** (their books block or are down - see `ARB_ODDS_SOURCING.md`).
- A five-minute default stale-price cutoff for configured feeds, plus rejection of missing timestamps and matches that have already started.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:5173/#/arbs
```

Run tests and the production build:

```bash
npm test
npm run build
```

Without feed environment variables, `/api/arbs/status` reports `manual` mode. This is expected. The NGN calculator, labelled training example and device ledger still work; the Opportunities tab remains empty.

## How prices are read

Prices are parsed strictly. A price is either a plain decimal (`2.10`) or a
comma decimal (`2,10`, read as `2.10`). The ambiguous three-digit comma form
(`1,850`) is **rejected**, never guessed, and a price that cannot be read is
dropped from the scan. A missing price costs you an opportunity; a mis-read
price would invent one.

## How two books are matched to the same fixture

Real books do not write the same fixture the same way. `Manchester United v
AFC Bournemouth` on one book is `Man Utd vs Bournemouth` on another, and one
feed may hand back the kick-off in UTC while another uses West Africa Time.
The scanner therefore matches the **fixture**, not the label:

- kick-off times may differ by up to **120 minutes** and still be the same fixture;
- team names are compared token by token, so short forms still match;
- a fixture on a different date, or with different teams, is never paired;
- an exact `eventId` in the feed always wins.

Market, line and settlement rules must still match exactly. A match that has
already kicked off is never returned, in either feed mode or manual mode.

## Bookmaker minimum stakes

A quote may carry `minStake` (the bookmaker's minimum stake for that market).
If the rounded stake on a leg falls below it, the leg cannot be placed, so the
whole arbitrage is reported as **not executable** rather than as a clean edge.

## Incomplete markets

A market group is only compared when it holds every outcome the market has.
A group with extra outcome keys (for example a stray half-time price on a
90-minute market) is refused and counted in `rejectedGroupCount` instead of
disappearing without a trace. It is never resolved by picking a subset: in a
three-way market, home and away can both lose, so a subset is not an
arbitrage.

## Calculation

For decimal odds `odds[i]`:

```text
S = Σ(1 / odds[i])
arbitrage when S < 1
theoretical ROI = 1 / S - 1
exact stake[i] = totalStake × (1 / odds[i]) / S
exact gross return = totalStake / S
```

Rounded stakes preserve the requested total. Because rounding changes individual returns, the interface displays the **minimum rounded return/profit**, which can be lower than the theoretical figure. Bookmaker acceptance, limits, void rules and a failed second leg are outside the calculation.

## Automatic feed configuration

Static GitHub Pages cannot provide the server-side scanner API. Deploy `worker.js` through Cloudflare for automatic mode, or run the Vite server locally.

The included connector adapters accept operator-configured JSON feeds. Configure only data sources you are permitted to use:

| Variable | Purpose |
| --- | --- |
| `ARB_FEED_URL` | One combined feed containing quotes for multiple bookmakers |
| `SPORTYBET_FEED_URL` | SportyBet-specific normalized JSON feed |
| `MSPORT_FEED_URL` | MSport's own price endpoint (read through a real browser) |
| `BETKING_FEED_URL` | BetKing's public price feeds, comma separated (read through a real browser) |
| `LSCB_FEED_URL` | LiveScore Bet gateway address |
| `NAIRABET_FEED_URL` | NairaBet-specific normalized JSON feed |
| `BET22_FEED_URL` | 22Bet-specific normalized JSON feed |
| `ARB_MAX_QUOTE_AGE_SECONDS` | Optional freshness limit, 30–3600 seconds; default 300 |

Specific feeds force their configured bookmaker identity. Combined feeds use each quote's `bookmaker` field. Supported aliases include `sportybet`, `nairabet`, `22bet`, `1xbet`, and `livescorebet`; other feed bookmaker names retain a normalized unique identity.

For local development, copy `.env.example` to `.env` and fill only the feeds you have. For Cloudflare, set the same variables in the Worker environment or dashboard, then deploy:

```bash
npm run build
npx wrangler deploy
```

Do not commit feed credentials. If a feed URL contains a secret, configure it as a Worker secret rather than in `wrangler.jsonc`.

## Normalized quote schema

A feed can be a JSON array or an object with a `quotes` (or `data`) array. Each quote should contain:

| Field | Required | Meaning |
| --- | --- | --- |
| `event` | yes | Full event/match name |
| `eventId` | recommended | Stable cross-book event ID; a normalized event name is the fallback |
| `sport` | yes | Sport name; used in exact grouping |
| `competition` | no | League/tournament display name |
| `startsAt` | yes for automatic feeds | ISO 8601 scheduled start; past/started events are rejected |
| `market` | yes | Full market and line, such as `Total points 154.5` |
| `marketKey` | recommended | Stable canonical market+line ID across books |
| `rules` | yes | Explicit settlement rules, such as `90 minutes` or `overtime included` |
| `way` | yes | `2` or `3`; the scan requires all outcomes |
| `outcome` | yes | Canonical outcome key shared across books, such as `home`, `draw`, `over` |
| `label` | recommended | Human-readable outcome label |
| `bookmaker` | yes in combined feeds | Bookmaker ID/name |
| `odds` | yes | Decimal odds greater than 1.00 (`2.10` or `2,10`) |
| `minStake` | no | The bookmaker's minimum stake for that market, in the stake currency |
| `fetchedAt` | yes for automatic feeds | ISO 8601 time when this price was obtained |
| `url` | no | HTTP(S) event page for manual verification |

The following is a **schema example only**, not a current betting opportunity:

```json
{
  "quotes": [
    {
      "event": "Example Alpha vs Example Beta",
      "eventId": "example-event-001",
      "sport": "Football",
      "startsAt": "2027-01-15T15:00:00.000Z",
      "market": "Match winner",
      "marketKey": "match-winner",
      "rules": "90 minutes",
      "way": 2,
      "outcome": "home",
      "label": "Example Alpha",
      "bookmaker": "sportybet",
      "odds": 2.2,
      "fetchedAt": "2027-01-15T12:00:00.000Z",
      "url": "https://example.com/alpha-beta"
    },
    {
      "event": "Example Alpha vs Example Beta",
      "eventId": "example-event-001",
      "sport": "Football",
      "startsAt": "2027-01-15T15:00:00.000Z",
      "market": "Match winner",
      "marketKey": "match-winner",
      "rules": "90 minutes",
      "way": 2,
      "outcome": "away",
      "label": "Example Beta",
      "bookmaker": "nairabet",
      "odds": 2.0,
      "fetchedAt": "2027-01-15T12:00:00.000Z",
      "url": "https://example.com/alpha-beta"
    }
  ]
}
```

Feeds are limited to 2 MB and 5,000 quotes. Feed URLs come from server configuration only; browsers cannot supply an arbitrary fetch URL.

## API

### `GET /api/arbs/status`

Reports `manual` or `feed` mode and connector configuration without claiming that a configured feed has already been verified.

### `GET /api/arbs?totalStake=100000&rounding=100`

Fetches configured feeds, rejects stale/incomplete/pre-match-ineligible quotes, and returns matched opportunities plus connector statuses and rejected-quote counts.

### `POST /api/arbs/scan`

Scans caller-supplied normalized quotes without fetching a bookmaker. Body:

```json
{
  "quotes": [],
  "totalStake": 100000,
  "rounding": 100,
  "maxQuoteAgeSeconds": 300
}
```

`maxQuoteAgeSeconds` is optional for this manual endpoint. When omitted, submitted quotes are calculated as supplied and the response still instructs the user to verify current prices. The endpoint accepts at most 2,000 quotes and a 512 KB request body.

## Adding a book-specific connector

1. Review the bookmaker's terms and permitted data-access method. Do not bypass geo-blocks, CAPTCHAs, WAFs, rate limits or authentication.
2. Add a module under `arb/connectors/` that obtains public/licensed pre-match data server-side.
3. Convert it to the schema above without inventing missing start times, fetch times or settlement rules.
4. Register it in `arb/connectors/index.js`, retaining per-connector errors so one failed book does not fabricate or corrupt another book's data.
5. Add tests for event mapping, market/line mapping, overtime/void rules, malformed responses and stale prices.

## Ledger storage

The manual ledger uses browser `localStorage` key `bryme.arbPlacementLedger.v1`. It is device/browser-specific, is not a cloud backup and does not transmit bets. Export CSV for an external record. Actual settlement is appended to the saved calculation rather than replacing its expected figures.

## Risk and compliance

A positive calculated ROI is not a guarantee of filled bets or profit. Odds can move, stakes can be limited, markets can be voided and settlement rules can differ. Users must manually re-check every leg before and during placement. 18+ only.

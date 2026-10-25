# BRYME — Pre-match Arbitrage Scanner

A pre-match arbitrage scanner for Nigerian bookmakers. Press **RUN** and the
server downloads the live prices from every book you have connected, matches
them market by market, and shows only the opportunities that are real.

**It never places a bet, never logs in, never moves money, never invents a
price and never solves a challenge.** It reads prices you are allowed to see,
does the arithmetic, and shows you the stake split. You place every bet
yourself, after you verify it.

---

## What it does

- **RUN** — one button downloads every connected book's pre-match prices and
  returns the live opportunities, with a summary of what was downloaded and
  from where.
- **Exact matching** — two books are only compared when the fixture, the
  market, the line and the settlement rule are the same. "Over 2.5" with
  overtime is never paired with "Over 2.5" in 90 minutes.
- **Canonical markets** — `Over 2.5` (book key `total_goals`) and
  `Total 2.5 goals` are the same market; `Man Utd vs Bournemouth` and
  `Manchester United v AFC Bournemouth` are the same fixture.
- **Honest stakes** — the stake split is shown with the **lowest** rounded
  return, and an opportunity is only marked executable when that return
  still covers the bankroll and every stake clears the bookmaker's minimum.
- **NGN calculator** — work out a split from prices you have verified
  yourself.
- **Placement ledger** — a device-local record of what you placed and what it
  returned. Records are appended, never overwritten, and can be exported.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:5173/#/arbs
npm test             # 38 tests
npm run build
```

The site works without any feed configured: the calculator and the ledger are
always available, and the Opportunities tab stays empty rather than filling
with invented odds.

---

## Connecting the books

See **[ARB_ODDS_SOURCING.md](./ARB_ODDS_SOURCING.md)** for the full picture.
In short:

```bash
npm install -D playwright && npx playwright install --with-deps chromium
node arb/discover.mjs          # opens each book, finds the prices it loads
```

Put the addresses it finds in `.env`:

```bash
SPORTYBET_FEED_URL=https://...
NAIRABET_FEED_URL=https://...
BET22_FEED_URL=https://...
```

Then press **RUN** in the app, or check it from the terminal:

```bash
node arb/probe.mjs          # what can we read right now?
node arb/probe.mjs --scan   # and what arbitrage is live across the books?
```

Run these from your own connection. The books geo-target and rate-limit by
IP, so a server outside Nigeria will be served a challenge instead of prices.

---

## Layout

```
arb/
  service.js              the API (shared by the Cloudflare Worker and Vite)
  vitePlugin.js           the same API during npm run dev
  probe.mjs               "what can we actually read right now?"
  discover.mjs            finds each book's price feed in a real browser
  connectors/
    httpBook.js           reads a book's own JSON endpoint
    browserBook.js        reads the page in a headless browser (fallback)
    normalize.js          any book payload -> the scanner's quote shape
src/
  arbs/ArbScannerView.jsx the scanner UI (RUN, calculator, ledger)
  lib/arbitrage.js        the maths and the matching
  App.jsx                 the shell
tests/                    38 tests
worker.js                 Cloudflare Worker (API + site)
```

## Deploying

```bash
npm run build
npx wrangler deploy
```

The feed URLs live in the Worker environment (or as Worker secrets) — never in
the browser and never in the repository.

---

## The rules

1. No automatic betting, no account access, no challenge solving, no
   geo-blocking or rate-limit evasion.
2. No invented odds. Every price carries the time it was fetched; stale
   prices and matches that have already kicked off are refused.
3. Verify before you place. A calculated edge is not a filled bet.
4. Respect each book's terms. If a book blocks us, stop.
5. Keep the feed server-side. We do not republish a book's prices.
6. 18+ only.

## Responsible gambling

Betting involves risk and you can lose money. Only bet what you can afford to
lose. Support in Nigeria: GambleAlert (+234 915 767 7777) and the National
Lottery Regulatory Commission (nlrc.gov.ng).

# BRYME LAB — Pre-match Arbitrage Scanner

Your private arbitrage lab for the Nigerian books. Press **RUN** and the server
downloads the live prices from every book you have connected, matches them
market by market, and shows only the opportunities that are real.

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

Three ways, in the order you probably want them:

**1. On your own machine (best for scanning).** The books geo-target by IP, so
the scanner has to run from your own Nigerian connection. This also means the
prices really come down.

```bash
npm install
npm run lab          # binds 0.0.0.0 → http://localhost:5173
```

Open it on your phone on the same Wi-Fi at `http://<your-computer-ip>:5173`.

**2. On the domain** (needs your Cloudflare login, once):

```bash
npx wrangler@4 login
npm run deploy       # publishes the new build and the worker
```

**3. On GitHub Pages** (static only — no scanner API, calculator and ledger
still work):

```bash
git push origin main
```

```bash
npm test             # 38 tests
npm run build
```

The site works without any feed configured: the calculator and the ledger are
always available, and the Opportunities tab stays empty rather than filling
with invented odds.

---

## Connecting the books (without a terminal)

The Worker can find the books' feeds itself:

- **FIND FEEDS** in the console makes the server open each book, read the
  JavaScript it loads and work out which address carries the prices. Every
  candidate is *proven* before it is accepted — it is fetched and run through
  the same normaliser the scanner uses, and it only counts if it produces real
  quotes. The request leaves from the Cloudflare point of presence nearest
  you, which is what the books require.
- **RUN** does the same hunt automatically when no address has been pinned.

So on a phone there is nothing to install: open the site, press **FIND FEEDS**,
then **RUN**.

To pin the addresses instead (server-side, survives restarts), run the local
discovery and put the results in the Worker environment:

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
    browserFeed.js        a real browser on the server (Cloudflare Browser
                           Rendering) - opens a book's page, watches what it
                           asks for, and fetches price addresses from inside it
    msport.js/msportFeed.js   MSport: the price tree and the browser read
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

The feed URLs live in the Worker environment — never in the browser and never
in the repository:

```bash
npx wrangler secret put SPORTYBET_FEED_URL
npx wrangler secret put NAIRABET_FEED_URL
npx wrangler secret put BET22_FEED_URL
```

(`ARB_FEED_URL` is also accepted, as one address that returns every book's
quotes.) After the secrets are in place, press RUN in the app and the Worker
downloads the prices on demand.

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

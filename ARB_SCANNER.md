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
  **SportyBet, MSport, LiveScore Bet, BetKing and NairaBet are connected and live**; 22Bet and 1xBet are **not
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

## The free reader (how five books are read without a browser or a paid plan)

Two of the books answer only a client that looks like an ordinary browser on
an ordinary connection. The Worker is refused outright — not because of what
it asks for, but because of where it comes from: the address a Worker calls
from is on the edge's own list of machines. The same request from an ordinary
machine is answered with prices.

So the reading is done by **GitHub's runners**, which are free for a public
repository and are exactly that kind of ordinary machine:

| step | what happens |
| --- | --- |
| `.github/workflows/arb-reader.yml` | runs every fifteen minutes, and on demand |
| `scripts/arb-read.mjs` | reads the books: MSport, LiveScore Bet and SportyBet over plain HTTP, BetKing and NairaBet in the runner's own Chrome |
| the `prices` branch | the prices are published there, one file per book, already in comparable form |
| `arb/connectors/snapshot.js` | the Worker reads the published file for the commit that is current, so a cached copy can never be mistaken for fresh prices |

Nothing is bought, nothing is signed into, and no browser time is spent:
Cloudflare's free ten minutes a day is left alone. The prices carry the time
they were really read, so the usual freshness check still holds them to
account — a snapshot that has gone cold is refused exactly like a feed that
has gone cold.

`GET /api/arbs/snapshot` says what the reader published, book by book.

Each book still has its own way of being read inside the Worker, and that way
is used if the reader has not published anything yet.

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

## The books that are live now

| Book | How it is read | Prices in the last scan |
|---|---|---|
| SportyBet NG | plain HTTP, the whole football slate (12 pages) | 15,703 |
| NairaBet | the widget's price tree, with NairaBet's own token | 11,154 |
| JackpotBet | the same widget, with JackpotBet's own token | 10,977 |
| BetKing | the same widget, with BetKing's own token | 11,710 |
| LiveScore Bet | plain HTTP (a `Request-Id` header is required) | 5,948 |
| MSport | plain HTTP | 970 |
| 22Bet NG | **not connected** - the feed refuses this country's address | 0 |
| 1xBet | **not connected** - the feed refuses this country's address | 0 |

**NairaBet, JackpotBet and BetKing all run on the same platform.**  The
platform gives each book its own token, and with that token the same
endpoint answers with that book's own events and its own numbers, so one
adapter reads all three.  They are genuinely different books: on the prices
they share, NairaBet and BetKing differ on roughly one price in five, and
NairaBet and JackpotBet on one in thirteen.  A book that agreed with
another book on every price could never make an arbitrage with it.

**BetKing used to be read from its own edge**, which answers only a real
browser and carries only 35 matches.  The platform route carries 1,257
matches for the same book, over plain HTTP, for nothing.

## Working inside the Worker's time

The Worker is allowed about two seconds of computing per request, so the
scan has to stay small.  Three things keep it small:

- the free reader publishes only the prices of the matches that at least two
  books are showing, so the Worker's files hold the shared part of the slate
  and nothing else;
- the prices are grouped by the words of the home team's name, so a price is
  only ever compared with the prices of the matches it could possibly be -
  the result is the same as comparing every price with every other price,
  and it takes a third of the time;
- the report reuses the groups the scan has already worked out, instead of
  grouping the same prices a second time.

## When did the book last move this price?

Two of the books publish the moment they last changed a price: SportyBet
as a number, and LiveScore Bet as a stamp on the price itself.  That
stamp travels with the price all the way to the phone, so the phone can
say **"moved 3h ago"** under each price.

That matters because a price that has not moved for a long time may be one
the book has left behind.  When two books disagree and one of them has not
touched its price for a day while the other keeps moving, that is the leg
that will change first - the card says so, and names the book.

The rule is deliberately narrow.  A price that has not moved is not
automatically wrong: most prices sit still until something happens near
the match.  A leg is only called out when it has stood still for more than
a day **while another book has been moving its own price**.

## How the prices stay fresh

Three clocks keep the prices new, so the phone never shows a price that
has gone cold:

1. **the Worker's own clock** - a trigger on the Worker starts the free
   reader every ten minutes (`triggers.crons` in `wrangler.jsonc`, and the
   `scheduled` handler in `worker.js`);
2. **GitHub's own schedule** - the same workflow also carries a fifteen
   minute schedule, though GitHub does not always run it;
3. **the phone itself** - a scan whose prices are more than five minutes old
   starts a read and keeps looking until the new prices arrive, so the
   button never hands back a stale price without saying so.

The scan tells the truth about its age: `priceAgeSeconds` is how old the
oldest price in the answer is, and `refreshing` says a read is under way.

## What changed on 26 October, and why the scan is fast

**The prices travel as rows.** The reader writes each book's prices as
rows of twelve values rather than as objects with fourteen named fields.
The same prices in the same file take a third less space, and the Worker
spends less of its own time and memory taking them in. Reading a full
slate of five books is the part of a scan that runs out of room first, so
this is what buys the room for the next market and the next book.

**The kick-off of every price is worked out once.** The prices used to be
sorted with a fresh date built for every comparison — over two hundred
thousand dates for one book. Now each price's kick-off is worked out once
and carried along.

**The prices are added up before the arbitrage is built.** For every
match, every combination of the best prices was being turned into a full
arbitrage — stakes, returns, warnings — and all of it was thrown away
unless the prices added up to less than one. Now the sum is worked out
first, and the rest is only built when there is something there.

**The same prices are only worked out once.** The phone asks for a fresh
scan every half minute. The answer only changes when the books publish new
prices, so the answer is kept while the prices are the same.

Together these took the scan from about 2,000 milliseconds of the Worker's
time — which is more than the Worker is allowed, so the scan failed — to
roughly 750 milliseconds in the steady state and about 1,500 milliseconds on
the first scan after the books publish.

**The Draw No Bet market is read.** SportyBet had it all along and the
reader was throwing it away. It is only worth reading if both sides of
the market are read the same way, so every book now says the same thing
about how it settles: `draw-voided`, because the draw does not settle that
market.

**The books' edge refuses a burst.** When two reads ran at once, the books
refused the runner and the largest book went missing for a whole cycle.
The reader now asks for one page at a time with a pause between the
pages, rests a minute and tries again when a call is refused, and the
Worker will not start a read while another one is running.

## What changed on 26 October, in the evening: the Worker ran out of room

Six books could be read, and the scan found real arbitrages, but the Worker
was sometimes refusing the scan outright — with no explanation the phone
could show, just a failure. The cause was memory.

**The same names were written over and over.** A book sends tens of
thousands of prices, and every price of a match carried the match's name,
its league and its market, written out in full. The names are now written
once in the file and numbered; the rows carry the number. The six files
fell from 10.1 MB to 3.4 MB, and the heap after a scan from 43.6 MB to
27.0 MB. A file published before this change is still read.

**The prices were kept between requests.** The Worker kept each book's
whole expanded slate — tens of thousands of prices — for a minute after
every scan, so that the next request began with the last request's prices
still in the room. The next request was then refused for want of memory
before it had done any work at all. The scans that failed did so in a
tenth of a second, which is the signature of this: the request never
started. What is kept now is the text the reader published, which is a
third of the size, and the prices are made only when a scan asks for them.

**Two slates were held at once.** When the prices had expired, the Worker
read all six books, found them too old, started a fresh read, waited for
it, and read all six books again — holding both slates at once. The
expired prices are now let go of before the wait.

**How old a book is published is known before its prices are made.** An
expired slate is worth nothing, and making six slates of tens of thousands
of prices only to find out they are too old is the work that filled the
Worker's memory.

After all of this the scan holds about 58,000 prices from six books and
comes back in under four seconds, and a test that had failed seven times
out of twelve now passes twelve times out of twelve.

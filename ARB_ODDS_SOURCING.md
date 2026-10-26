# GETTING ODDS FROM DIFFERENT BOOKS

The scanner is only as good as the prices it can read. This is the honest
picture of where those prices can come from, what each route costs, and the
order to build them in.

---

## THE THREE ROUTES

| Route | What it is | Speed | Completeness | Fragility | Cost |
|---|---|---|---|---|---|
| **A. The book's own JSON endpoint** | the same API the book's web app calls | fast (one request per book) | every market | breaks when they change it | free |
| **B. Headless browser** | Playwright/Chromium opens the page and reads the rendered prices | slow | only what is on screen | breaks on every redesign | free, heavy |
| **C. Licensed data feed** | Sportradar, Betradar, Genius Sports | fast | everything, with settlement rules attached | stable | paid |

**Build in the order A → B → C.** Route A is the foundation and will carry
most of the value. Route B is the fallback for the books that will not give
you A. Route C is what "taking arbitrage seriously at scale" actually means —
it is also the only route that comes with *permission* and with the rules
attached (overtime, void, postponement) instead of you guessing them.

### Can we use a headless browser?

Yes, and it is worth having — but it is a fallback, not the foundation.

**Use it when:**
- the book renders prices into the page and exposes no plain JSON;
- the JSON endpoint needs a session cookie or a token the page mints;
- the book blocks plain server requests but serves a real browser;
- **you are still learning a book** — a browser lets you watch the real
  network requests the app makes, which is how you find route A for that book
  in the first place. This is the single most useful thing a browser does here.

**Do not use it when the book has a JSON endpoint**, because:
- it is 10–100× heavier (a Chromium process per book per scan);
- it only sees the markets on screen, not the full book;
- it breaks every time the site redesigns its markup;
- it is the most obvious automation, so it is the first thing that gets blocked.

Both are implemented behind one interface, so they are interchangeable:

- `arb/connectors/httpBook.js` — route A
- `arb/connectors/browserBook.js` — route B (Playwright, lazily imported, so
  the app still runs on a machine without it)
- `arb/connectors/normalize.js` — turns either into the scanner's quote shape

---

## WHAT THE BROWSER ACTUALLY SOLVED (25 Oct 2026)

Cloudflare's **Browser Rendering** is enabled on this account
(`"browser": { "binding": "browser" }` in `wrangler.jsonc`), so the server can
open a real browser. That turned out to be the answer for the books whose
edge refuses plain server requests:

| Book | Plain request from the Worker | In a real browser | Why |
|---|---|---|---|
| **MSport** | HTTP 403 (Cloudflare bot check) | **works** | the edge wants a real browser signature |
| **SportyBet** | works | works | no check |
| **LiveScore Bet** | works | works | no check |
| 1xBet / 22Bet (`.ng`) | HTTP 403 (error 1010) on 1xBet; the line feed is HTTP 500 at their origin | HTTP 403 + "prohibited in the USA" | the browser runs from a US data centre and both books block US addresses; their own price service is down |
| NairaBet | HTTP 530 / 1016 (origin dead) | the page loads, the data host does not | their origin is down |

So the browser is not a fallback here — it is the **only** way in for MSport.

`arb/browserFeed.js` opens the book's own page, watches what the page asks
for, and can then ask the page to fetch a price address for us (same origin,
the page's own session). `arb/connectors/msportFeed.js` uses it to read:

```
POST https://www.msport.com/api/ng/facts-center/query/frontend/sports-matches-list?sportId=sr:sport:1&timeslot=Today
headers: operid: 2, deviceId: <uuid>, ApiLevel: 2, devMem: 2, network: 4g,
         screenWH: 412x900, clientid: WEB, platform: WEB
body:    []
```

MSport runs on the same platform as SportyBet, so the price tree has the same
shape (`data.tournaments[].events[].markets[].outcomes[]`) and the adapter
(`arb/connectors/msport.js`) reads it the same way.

**The one thing to remember:** the browser runs where Cloudflare runs it, not
where the reader is. A book that blocks that country will not answer, no
matter how real the browser is. For a Nigerian book that blocks US traffic,
only a Nigerian exit will do — and Cloudflare Browser Rendering does not
offer one.

---

## WHAT WAS VERIFIED FROM THIS MACHINE (25 Oct 2026)

| Host | Result |
|---|---|
| `sportybetonline.ng` | an **affiliate landing page**, not the book. The real app is `sportybet.com/ng/` (redirected from `sportybet.ng`) |
| `football55.com` | an affiliate mirror of 22Bet, not the book |
| `nairabet.com` | the real book — a Next.js app on the twoup platform |
| `22bet.ng` / `22bet.com` | served **HTTP 203** from `Angie` and set `ua=deleted` / `user_id_hash=deleted` cookies — the platform's bot/IP flagging |

**This machine exits from a Google Cloud IP in Oregon, USA.** Nigerian books
geo-target and rate-limit by IP, so from here 22Bet serves a challenge rather
than prices. That is not a bug in the connector — it is the reason the
scanner must run **from your own Nigerian connection**, or from a worker with
a Nigerian exit, not from a generic cloud sandbox.

Playwright's Chromium downloads fine, but this sandbox image lacks the shared
libraries (`playwright install --with-deps` fails on apt packages). On a normal
machine `npx playwright install chromium` is enough.

---

## THE PART THAT ACTUALLY MATTERS: MAKING TWO BOOKS COMPARABLE

Two books never describe the same market the same way. If you compare them
naively you will find nothing — or worse, pair two different bets.

`arb/connectors/normalize.js` solves this:

| Book A says | Book B says | Normalised |
|---|---|---|
| `Over 2.5` (market key `total_goals`) | `Total 2.5 goals` | market `goals-2.5` |
| `Over` / `Under` selections | `Over 2.5` / `Under 2.5` selections | outcomes `over` / `under` |
| `Manchester United v AFC Bournemouth` | `Man Utd vs Bournemouth` | the same fixture (token match, 120-minute window) |
| `90 minutes` | `Full Time Result` | rules `90-minutes` |
| `including overtime` | `90 minutes` | **never paired** — different bet |

The direction (`over` / `under`) lives in the **outcome**, not in the market
key. That is the detail that makes "Total 2.5" and "Over 2.5" the same
market instead of two dead ends.

When a book only says "Over 2.5" with no market key and no family word, the
normaliser will **not guess** that it means goals. Declare it once:

```bash
SPORTYBET_DEFAULT_FAMILY=goals
```

---

## CONFIGURATION

Copy `.env.example` to `.env`. Nothing here is ever sent to a book that is
not configured, and the browser can never supply a URL.

```bash
# route A — the book's own JSON endpoint
SPORTYBET_FEED_URL=https://...
MSPORT_FEED_URL=https://...
NAIRABET_FEED_URL=https://...
BET22_FEED_URL=https://...
BET1X_FEED_URL=https://...
LSCB_FEED_URL=https://...

# how many LiveScore Bet competitions to read in one scan (default 28)
LSB_MAX_COMPETITIONS=28

# route B — read the page in a real browser
BROWSER_BOOK_URL=https://...
BROWSER_BOOK_ROWS={"row":".market-row","event":".event","market":".market","outcome":".sel","odds":".odds"}
BROWSER_BOOK_COOKIE=session=...      # optional

# per-book declarations
SPORTYBET_DEFAULT_RULES=90-minutes  # what "Over 2.5" settles on, if the book does not say
SPORTYBET_DEFAULT_FAMILY=goals
SPORTYBET_MIN_STAKE=500
ARB_MAX_QUOTE_AGE_SECONDS=300
```

### Probe before you trust

```bash
node arb/probe.mjs          # what can we read right now, from this machine?
node arb/probe.mjs --scan   # and what arbitrage is live across the books?
```

The probe reports, per book: reachable, latency, how many quotes, how many
markets, the kick-off range, and — for a blocked book — what came back
instead of prices. Run it from your own connection.

---

## THE RULES THAT STAY

1. **No automatic betting.** The app never places a bet, never logs in, never
   moves money, never solves a challenge, and never bypasses geo-blocks or
   rate limits. It reads prices you are allowed to see and does arithmetic.
2. **No invented odds.** Every price carries the time it was fetched; the
   scanner refuses anything older than the freshness window, and any match
   that has already kicked off is refused outright.
3. **Verify before you place.** The manual verification gate stays. A
   calculated edge is not a filled bet.
4. **Respect the books' terms.** Most books prohibit automated collection and
   will block the IP. If a book blocks us, the answer is to stop, not to
   evade. Route C (a licensed feed) is the route where this question does not
   arise.
5. **Keep the feed server-side.** Reading prices for your own account is one
   thing; republishing a book's price feed on a public site is a different
   question about data licensing. The connectors run on the server; the
   browser only ever receives the scanner's own results.
6. **18+ only**, as everywhere else in this project.

---

## WHAT TO DO NEXT, IN ORDER

1. Run `node arb/probe.mjs` from your own machine with one book's endpoint
   set. Find out which of the three books will talk to you at all.
2. For a book that will not, open it in a browser, watch the network tab,
   and write down the JSON endpoint and the market keys it uses. That is how
   route A is discovered.
3. Set the per-book defaults (`DEFAULT_RULES`, `DEFAULT_FAMILY`) from what the
   book actually says on the page.
4. Only when the three books are readable: measure how often a scanned
   opportunity actually held at the book (the `minReturn >= totalStake` gate
   already protects you, but measure it).
5. Then, and only then, talk about licensed data.

## Two feeds that are now PROVEN (25 Oct 2026)

**SportyBet NG** publishes its own price tree:

```
https://www.sportybet.com/api/ng/factsCenter/importantEvents?sportId=sr:sport:1
```

`data[]` is a tournament, `events[]` a match (`estimateStartTime` in ms,
`homeTeamName` / `awayTeamName`), `markets[]` a market (`name`, `marketGuide`)
and `outcomes[]` the prices (`desc` = "Home"/"Draw"/"Away"/"Over 2.5", `odds` a
string). `liveOrPrematchEvents?sportId=sr:sport:1` returns the in-play events;
`importantEvents` is the pre-match list. Adapter: `arb/connectors/sportybet.js`.

**LiveScore Bet NG** publishes through its own gateway:

```
https://gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/events/matches
  ?sportcategoryid=SBTC1_1&categoryid=SBTC1_1
```

It needs a `Request-Id` header (any UUID) and answers with
`events.categories[]` -> `childs[]` -> `events[]` -> `markets[]` ->
`selections[]`. The whole football slate in one answer is nearly ten megabytes,
which is more than a Worker can hold, so the book is read in pieces instead:
the league list first, then the busiest competitions one at a time
(`arb/connectors/livescorebetFeed.js`). Adapter:
`arb/connectors/livescorebet.js`.

Both are pinned as Worker secrets (`SPORTYBET_FEED_URL`, `LSCB_FEED_URL`), so
RUN works without any discovery step.

## The third book, and the slate that finally lines up (25 Oct 2026)

**MSport** (see above) is pinned as `MSPORT_FEED_URL` and read through the
browser. Three books now answer:

| Book | Prices in a scan |
|---|---|
| SportyBet NG | ~670 |
| LiveScore Bet NG | ~3,760 |
| MSport | ~520 |

**The slate has to line up.** LiveScore Bet's gateway hands over the whole
football season in one answer (nearly ten megabytes - more than a Worker can
hold), so it is read competition by competition. Picking the competitions
with the *most* matches fills the slate with next month's reserve football
and misses the matches the other books are showing today, so the popular
leagues are read first and the biggest of the rest fill the remaining budget
(`arb/connectors/livescorebetFeed.js`, `LSB_MAX_COMPETITIONS`).

With that fixed, a scan reports how much the books actually share:

```
quotes 4943 | fresh 4943 | 19 shared fixtures
7 markets compared across all three books | 113 across two
```

A scan that finds no arbitrage now says **why**: either the books are not
offering the same matches, or they are, and the prices do not add up to more
than 100%.

## BetKing: the fourth book, found by reading their own page

BetKing (Nigeria) runs on the **Betagy sportsbook API**, with prices fed by
Sportradar.  Its edge answers a plain server request with a "Just a moment"
challenge page - on the book domain *and* on the price service - so it is
read through a real browser, the same way MSport is.

The recipe was found by opening the book's own sports page in a browser and
reading the addresses the page asks for.  Those addresses are public, and the
book asks them itself:

```
GET https://sportsapicdn-desktop.betking.com/api/feeds/prematch/info
GET https://sportsapicdn-desktop.betking.com/api/feeds/prematch/matches/custommenu/en/4
GET https://sportsapicdn-desktop.betking.com/api/feeds/prematch/mostpopularsports/en/1/7/3/
GET https://sportsapicdn-desktop.betking.com/api/feeds/prematch/lastminute/en/1/15/
GET https://sportsapicdn-desktop.betking.com/api/feeds/live
```

The two lists that carry prices are `mostpopularsports` (790 KB) and
`lastminute` (347 KB).  Their shape:

```
[ { AreaMatches: [ {
      SportID, SportName, Area: { AreaID, AreaName },
      Items: [ {
        ItemID, SmartBetCode,
        ItemName: "Fleetwood - Arsenal",
        ItemDate: "2026-10-27T21:00:00+01:00",
        TournamentName, CategoryName,
        OddsCollection: [ {
          OddsType: { OddsTypeID, OddsTypeName: "1X2" },
          MatchOdds: [ {
            SmartBetCode,                       which match the price belongs to
            OddAttribute: { OddTypeID, OddName: "1" },
            Outcome: { OddOutcome: 1.62, ScheduleStatus: 0 }
          } ]
        } ]
      } ] } ] } ]
```

Read it like this: a market holds prices for **several matches**, so the
price belongs to the match whose `SmartBetCode` matches the item's.  A price
whose `ScheduleStatus` is not 0 is suspended and is left out.  The markets
that are translated are 1X2, Double Chance, Total Goals (the line is in the
market name), GG/NG and Draw No Bet; "1X2 - (1up)", "1X2 - (2up)" and the
half-time variants settle differently and are left alone.

BetKing writes GG and NG where the other books write Yes and No; the adapter
translates, so the four books can be compared without a human renaming
anything.

## The browser budget, in plain words

Cloudflare's free plan allows **ten minutes of browser time a day** and **one
new browser instance every twenty seconds**.  Two books (MSport, BetKing) can
only be read in a browser, so the scan now:

- opens **one** browser for the whole scan and gives each book its own tab;
- keeps the prices it read for ninety seconds, so a second press of RUN does
  not spend more of the daily budget (the quotes keep the time they were
  really fetched, so the freshness check still applies);
- says plainly when the budget is gone, instead of showing an error code.

A Workers Paid plan removes the ten-minute cap and allows three browser
instances a second.  That is the difference between a scanner that runs all
day and one that runs for a few minutes a day.

## HOW TO ADD THE NEXT BOOK - the repeatable method

Four steps, in this order, and they work every time.  BetKing was found with
these four steps in one sitting.

**1. Read the book's own front-end code.**  Open the book's sports page in a
browser, and read the addresses the page asks for.  That is where the API
base, the endpoint, the headers and the parameters come from - not from
guessing.  This is how MSport's `/api/ng/facts-center/...` recipe and
BetKing's `/api/feeds/...` recipe were both found, and it is how the 1xBet
and 22Bet header scheme (`x-language`, `x-referral`, `x-group`, `x-whence`,
`x-fcountry`) was confirmed.

**2. Try the mobile and API hosts.**  The web host is the one that puts the
bot check in front; the mobile and API hosts often are not, and some are bare
IPs with no edge at all.  Hosts tested from the Nigerian Worker on 25 Oct:

| host | what it answered |
| --- | --- |
| `m.22bet.ng` | a redirector: every path 301s to the same path on 22bet.ng |
| `m.msport.ng` | redirects to www.msport.com (same bot check) |
| `api.msport.ng` | Cloudflare bot check (403) |
| `api.merrybet.ng`, `mobile.merrybet.ng` | 525 - the origin is down, not blocked |
| `api.bet9ja.com`, `sports.bet9ja.com` | Akamai 403 "Access Denied" |
| `api.betking.com` | 530 / error 1016 (origin down) |
| `sportsapicdn-desktop.betking.com` | Cloudflare challenge, then prices |
| `betking.com` | Cloudflare challenge, then the page |

**3. If the edge serves a browser, use a browser.**  A real browser passes
Cloudflare's challenge, so any book whose edge is challenge-based can be
read - as long as the book does not geo-block the browser's country.  Two
things follow from where the browser runs:
- Browser Run's egress is **US**: 1xBet answers "prohibited in the USA" and
  22Bet says the site is restricted, so those two cannot be read this way.
- MSport and BetKing do not care, and both work.

**4. A book can answer and still refuse.**  22Bet and 1xBet share one price
service, and its line-feed answers are found in the app's own code (see
below).  Asked from an address the book does not serve, that service
answers **HTTP 406 NotAcceptable** - it is not broken, it is refusing the
country.  The same call with the parameters the app sends answers **400
with the exact parameter that is wrong**, so the endpoint and the
parameters are right; what is left is the country of the caller.

**5. Some books are not blocked - they are broken.**  Merrybet's address
answers 525.  These are outages at the book.  No amount of reading,
probing or browsing will produce a price from a service that is returning
an error, so the right move is to wait and keep the recipe ready.

**What is left, and what it would take:**

| book | state | what is needed |
| --- | --- | --- |
| SportyBet | live, whole football slate | - |
| LiveScore Bet | live | - |
| MSport | live (browser) | - |
| BetKing | live (browser) | - |
| NairaBet | live | - |
| Bet9ja | untried in a browser | Akamai blocks the Worker; a real browser may pass it |
| 22Bet | country refused (406) | an address the book serves (Nigeria) |
| 1xBet | country refused (406) | an address the book serves (Nigeria) |

The honest truth about adding books: more books only help if they price the
same fixture.  Three books agreeing on a match is the normal case and is
not an arbitrage; an arbitrage appears when one book prices a market
differently from the others.  A fourth and fifth book raise the chance of
finding that difference, and BetKing, MSport and SportyBet all feed from the
same Sportradar/SportyNet family, so they will often agree - which is a
fact about the odds, not a defect in the reader.

## The addresses that are known to work

| book | address | how it is read |
| --- | --- | --- |
| SportyBet | `GET /api/ng/factsCenter/pcUpcomingEvents?sportId=sr:sport:1&marketId=1,18,10,29,11,26,36,14,60100&pageSize=100&pageNum=N&option=1` | the site's own call, twelve pages, the whole football slate (1,154 matches) |
| SportyBet | `GET /api/ng/factsCenter/wapConfigurableNewHighlightEvents?sportId=sr:sport:1` | fifty matches with every market, the top list |
| SportyBet | `GET /api/ng/factsCenter/sportList?timeline=24&productId=3&option=3` | the tournament list, with how many matches each holds |
| LiveScore Bet | `GET gateway-ng.livescorebet.com/sportsbook/gateway/v3/view/events/matches?sportcategoryid=SBTC1_1&categoryid=SBTC3_<id>` | one competition at a time, header `Request-Id` needed |
| MSport | `POST /api/ng/facts-center/query/frontend/sports-matches-list?sportId=sr:sport:1&timeslot=Today` | the book's own headers, no browser needed off a Cloudflare address |
| BetKing | `GET sportsapicdn-desktop.betking.com/api/feeds/prematch/mostpopularsports/en/1/7/3/` | only from a real browser |
| NairaBet | `GET sb2frontend-altenar2.biahosted.com/api/Widget/GetEvents?culture=en-GB&timezoneOffset=0&integration=nairabet&deviceType=desktop&sportId=66` | the platform answers a plain request from the Worker, but refuses the free runner's address (403), so the reader takes it from the page |
| 22Bet / 1xBet | `GET /service-api/LineFeed/GetSportsShortZip?sports=1&lng=en&tf=0&tz=0&afterDays=0&country=0&partner=0&gr=0&top=false&virtualSports=false&cyberFlag=0&sportCategoriesFlag=0&minOffset=0&countryOnly=false&isPartner=false&withCountries=false&groupChamps=false&filterSports=0&fcountry=0` | the answer is 406 from an address the book does not serve |

### How the 22Bet / 1xBet path was found

Both books run the same platform.  The app that serves 22Bet.ng loads its
code from `v2l.traincdn.com`, and the chunk names are listed in the app
bundle.  Four of the chunks carry the price calls, and they name the
whole feed catalogue:

```
/service-api/LineFeed/GetSportsShortZip
/service-api/LineFeed/GetChampZip
/service-api/LineFeed/Get1x2_VZip
/service-api/LiveFeed/GetSportsShortZip
...
```

The bundle also holds the type and default of every parameter the app
sends, so the request can be written exactly as the app writes it.  The
service answers with the parameter it did not like, which is a short way
to a working call - and then answers 406, because the address it was
asked from is not one the book serves.  Reading them would need an
address in Nigeria; faking one is not something this lab does.

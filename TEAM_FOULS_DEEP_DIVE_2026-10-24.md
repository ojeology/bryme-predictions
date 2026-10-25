# Team Fouls — deep dive
**Saturday 24 October 2026 — 07:55 WAT**

---

## 1. The verdict, in one paragraph

We dug into team fouls properly and the answer is not what the old ledger said.
**Total fouls at ~1.32 is NOT a verified edge** — our own walk-forward model rates those legs
at **60.3%** against a break-even of **75.8%**, so the mean EV at the real prices we have
graded is **−20.4%**. The old "13/14 on Total Fouls Over 21.5" was a selection effect from a
model with wrong European baselines, on a sample of 14, and we cannot reproduce it with a
correctly specified model. **But team fouls is a genuinely better market to hunt**, because a
team's own foul rate is a real and persistent signal (Paris Saint-Germain average **6.6
fouls a game**, Orenburg **17.6**), and the book prices team fouls off a generic league
baseline rather than off the team. That is the inefficiency worth attacking — and it is
untested on real prices, because we have only ever priced **one** team-fouls leg.

---

## 2. The ledger is not clean. Here is what the box scores say.

`bot-engine/data/real_book_prices_ledger.json` copies a multi-leg market's grade onto each of
its legs, and it counts a line twice when the same line appears in both `primary_market` and
`alt_market`. The FotMob cache (`bot-engine/data/fotmob_2627_exact_api_cache.json`, 1,952
matches) carries **per-team fouls, corners and cards**, so every line can be graded from
truth instead.

| Fouls line | Old ledger | Rebuilt from the box score | Avg price | EV |
|---|---|---|---|---|
| Match Total Fouls **O21.5** | 14/16 = 87.5% | **13/14 = 92.9%** | 1.32 | **+22.4%** |
| Match Total Fouls **O20.5** | 5/7 = 71.4% | 5/6 = 83.3% (one was a duplicate) | 1.29 | +7.3% |
| Match Total Fouls **U23.5 / U24.5 / U25.5** | present | 3/4, 3/4, 1/2 | 1.33–1.35 | — |

* The old grades were **not wrong on the rows they had** (0 of 20 checked) — the problem was
  the inflated denominator and the fact that a paired-market loss could not be attributed to a
  leg.
* **6 duplicate rows** were in the ledger.
* **The ledger contains UNDER lines** (Fouls Under 23.5 / 24.5 / 25.5). That breaks our
  standing **Pure OVER, zero unders** rule. They stay in the history as a record, but they
  must never go on a slip again.

---

## 3. Fouls are a COMPETITION market, and that is why the old model worked

Measured from the box scores, the share of matches going over 21.5 fouls:

| Competition | Fouls per team | Over 21.5 |
|---|---|---|
| Serie A | 10.89 | **47.1%** |
| Eredivisie | 10.74 | 43.2% |
| UEFA Champions League | 11.10 | 53.7% |
| Premier League | 11.53 | 62.9% |
| La Liga | 12.20 | 66.7% |
| **Pooled league average** | **12.18** | **67.9%** |
| UEFA Europa League | 12.64 | 74.1% |
| Süper Lig | 12.94 | 80.6% |
| UEFA Conference League | 13.19 | 86.1% |
| Russian Premier League | 13.99 | 88.8% |

A 42-point spread. **The old engine used per-competition baselines** (Champions League 10.10,
Europa 11.80, Conference 11.20) — all *too low* against what actually happens. That made the
European fouls lines look far more likely than they were. It hit 13/14 anyway, because those
14 matches sat in the two highest-fouling competitions.

Two hard conclusions:

1. **A naive bettor LOSES on Total Fouls O21.5 at 1.32.** The pooled base rate is 67.9%;
   1.32 needs 75.8%. The book is not giving this away.
2. **Never quote a fouls price without the competition.** Serie A at 21.5 and Conference
   League at 21.5 are two different products.

---

## 4. The new model (walk-forward, no hindsight)

`bot-engine/src/fouls_model.py`

* **Referee average from PRIOR matches only** — the stored `referee.avg_fouls` in the cache is
  a cumulative figure that includes the match being predicted. The Jöllenbeck rule applies:
  recomputed, never read off the row.
* **Competition baseline** from prior matches in that competition (≥10 to count).
* **Team foul rate** = half the team's own prior fouls-for, half the opponent's prior
  fouls-conceded, both shrunk toward the competition baseline.
* **Negative binomial** on the count (fouls are over-dispersed: 12.18 mean, sd ≈ 4.0).
* Count pmf `C(k+r−1,k)·p^r·(1−p)^k` computed in **log space** — the naive form underflows to
  1e-37 and silently returns 100% for every line. (Three real bugs found and fixed on the
  way: the pmf exponents were swapped, the log-space sum, and the K&R fit.)

### Walk-forward result, 1,528 matches (3 Jul – 23 Oct 2026)

| Line | Naive rate | Model | Actual | Brier naive | Brier model |
|---|---|---|---|---|---|
| Match Total Fouls O20.5 | 74.7% | 71.7% | 74.7% | 0.1888 | **0.1852** |
| Match Total Fouls O21.5 | 67.9% | 65.7% | 67.9% | 0.2178 | **0.2095** |
| Match Total Fouls O24.5 | 46.8% | 46.6% | 46.8% | 0.2490 | **0.2368** |
| Match Total Fouls O26.5 | 34.4% | 34.7% | 34.4% | 0.2255 | **0.2172** |
| Team Fouls O11.5 | 54.4% | 53.5% | 54.4% | 0.2480 | **0.2451** |
| Team Fouls O13.5 | 34.4% | 35.1% | 34.4% | 0.2255 | **0.2223** |

**Honest holdout** (calibration fitted on the first 60% of the season, tested on the last 40%
= 612 unseen matches): the calibrated model beats the league-rate bettor on **9 of 11** total
fouls lines and **6 of 8** team fouls lines, with the calibration gap under 5 points on every
line. The skill is real but modest — the same order of magnitude as the tennis games model.

---

## 5. The real-price test — the number that decides it

Every fouls leg we have ever paid a real price for, scored by the model:

| | |
|---|---|
| Legs | 24 |
| Model average probability | **61.7%** |
| Actual hit rate | **79.2%** |
| **Mean EV at the real prices** | **−18.5%** |
| Break-even price at the model's probability | **1.621** |

| Line | Model | Break-even | Price needed for a 5% edge | Prices actually seen |
|---|---|---|---|---|
| Total Fouls **O21.5** | 68.9% | 1.452 | **1.525** | 1.28, 1.30, 1.32, 1.33, 1.35 |
| Total Fouls **O20.5** | 72.2% | 1.385 | **1.455** | 1.24, 1.28, 1.35, 1.40 |
| Total Fouls **O23.5** | 47.1% | 2.123 | 2.230 | 1.35 |
| Total Fouls **O24.5** | 44.9% | 2.226 | 2.338 | 1.33, 1.35 |
| Total Fouls **O25.5** | 22.8% | 4.380 | 4.599 | 1.32, 1.33 |

**Every real price we ever paid on total fouls was below the model's break-even.** The old
13/14 run was not something the model could reproduce — the model was *under*-predicting
these European matches (61.7% said vs 79.2% realised), because most of those referee averages
rested on **1 to 9 prior games** in our cache.

**Rule for total fouls from now on: take O21.5 only at 1.53+, O20.5 only at 1.46+.** Below
that, skip.

### The referee-average trap, caught twice more (24 Oct, later)

This model was wrong twice in one day, both times the same way.

1. The cache's stored `referee.avg_fouls` is a **cumulative** figure that includes the match
   being predicted. We recompute it prior-only.
2. Then we recomputed it, but from a **six-game sample**. Chris Kavanagh's six cached
   matches averaged 27.67 fouls; Sportmonks has him at **23.03 over 34 games**. Our estimate
   was 4.6 fouls too high, which turned a 53% line into a 77% one — and we were about to
   take Chelsea–Tottenham fouls over 23.5 at 1.41 on that number. **The book was right and
   we were wrong.**

The fix: the spread *between* referees is only **2.29 fouls** (Sportmonks, 142 referees with
8+ games), and a six-game sample carries **±2.36 fouls** of sampling noise. A six-game
estimate is therefore barely better than no estimate, and must be shrunk toward the
competition baseline. We now blend the two referee sources by games and apply a proper
Bayesian shrinkage:

    w = (n/33.5) / (n/33.5 + 1/2.29²)
    ref_avg = w x observed + (1 - w) x competition_baseline

**The fix made the model better, not worse.** After shrinkage the model beats the
league-rate bettor on **11 of 11** total-fouls lines (was 10 of 11) with larger Brier gains
(O23.5: 0.2482 → **0.2321**; O21.5 holdout: 0.2214 → **0.2016**), and the gap between
predicted and actual stays under 2.5 points on every line.

**The rule this teaches: never trust a referee average built on fewer than about 20 games.**
Our cache only holds 3.5 months of matches, so for most fixtures it holds 1–7. The
Sportmonks figures in the manifest cover up to 35 games and are the ones to use.

---

## 6. Why TEAM fouls is the better market

A team's own prior foul rate is a genuine, persistent signal:

| Prior games | n | Correlation with actual fouls | MAE naive | MAE team prior |
|---|---|---|---|---|
| ≥1 | 2,682 | +0.235 | 3.16 | 3.34 |
| ≥3 | 1,975 | +0.274 | 3.16 | 3.18 |
| ≥5 | 1,347 | +0.286 | 3.29 | **3.23** |
| ≥8 | 496 | **+0.313** | 3.28 | **3.17** |

The overall correlation looks modest only because most teams cluster near 12. **In the tails
the spread is enormous:**

| Cleanest | fouls/g | n | | Dirtiest | fouls/g | n |
|---|---|---|---|---|---|---|
| **Paris Saint-Germain** | **6.56** | 9 | | Real Sociedad B | 17.76 | 9 |
| Lommel | 7.05 | 7 | | Córdoba | 17.73 | 8 |
| Everton | 7.33 | 6 | | FC Orenburg | 17.63 | 11 |
| Go Ahead Eagles | 7.37 | 8 | | FC Andorra | 17.38 | 9 |
| Inter | 7.76 | 9 | | Espanyol | 17.23 | 8 |
| Chelsea | 8.33 | 6 | | Malmö FF | 16.41 | 14 |

**The book's team-fouls price is built off a generic baseline of ~11–12 fouls per team, not
off the team.** So a team averaging 17 is priced like a team averaging 11, and the OVER side
is systematically under-priced on dirty teams. That is the inefficiency, and unlike total
fouls it does not need the referee to work.

Caveat, stated plainly: teams mean-revert. Brentford's prior rate was 16.0 and it then
averaged 7.0; Stoke City 15.6 → 9.4. The model shrinks hard toward the competition baseline
for exactly this reason, and the honest read is that the team effect is **real but noisy** —
use it to tilt, not to bet blind.

**We have priced exactly one team-fouls leg in our whole history: Sunderland Team Fouls Over
11.5 @ 2.18 — WON.** One data point is not a track record. This market needs prices.

---

## 7. Today's board

`bot-engine/data/TEAM_FOULS_BOARD_2026-10-24.md` — every fixture, the dirtier side, and a
ladder of Over lines with the minimum acceptable price.

**Read these first (highest model probability with a plausible price):**

| Fixture | KO | Dirty side | Line | Model | TAKE AT | their fouls/g | n | ref fouls/g | ref n |
|---|---|---|---|---|---|---|---|---|---|
| Lecce v Juventus | 17:00 | **Juventus** | O10.5 | 85.7% | **1.23+** | 13.2 | 10 | 28.8 | 4 ⚠ |
| Chelsea v Tottenham | 17:30 | **Tottenham** | O10.5 | 84.6% | **1.24+** | 13.9 | 7 | 27.7 | 6 ⚠ |
| Marseille v Le Havre | 16:15 | **Le Havre** | O10.5 | 83.1% | **1.26+** | 14.6 | 7 | 26.8 | 4 ⚠ |
| Sunderland v Leeds | 16:30 | **Sunderland** | O10.5 | 80.0% | **1.31+** | 12.6 | 10 | 26.8 | 4 ⚠ |
| Paderborn v Hamburger | 14:30 | **Hamburger** | O10.5 | 80.0% | **1.32+** | 14.3 | 6 | 26.3 | 3 ⚠ |
| Hull City v Brentford | 14:00 | **Brentford** | O10.5 | 79.0% | **1.33+** | 14.7 | 7 | 27.6 | 7 ⚠ |
| Man United v Bournemouth | 14:00 | **Bournemouth** | O10.5 | 78.0% | **1.35+** | 13.3 | 10 | 25.7 | 7 ⚠ |
| Catanzaro v Ascoli | 16:15 | **Ascoli** | O10.5 | 81.0% | **1.30+** | 10.7 | 7 | — | — |
| Racing v Espanyol | 15:15 | **Racing** | O10.5 | 74.0% | **1.43+** | 13.8 | 9 | — | — |
| Toulouse v Troyes | 16:15 | **Toulouse** | O10.5 | 72.0% | **1.46+** | 15.6 | 7 | — | — |

> ⚠ **The referee leg is thin almost everywhere today.** Our cache only covers 3.5 months of
> the season, so most referees have 1–7 prior games against our own v2 floor of 8. The board
> flags them. **Where the flag is up, either demand a bigger price than the TAKE AT column,
> or skip** — the team's own rate is the reliable part, not the referee.

**What to do:** open 22Bet, find the team-fouls market on 3–4 of these, read the price, and
paste it back. If a line comes back at or above its TAKE AT, it goes on the slip.

---

## 8. What changed in the code

| File | What it does |
|---|---|
| `bot-engine/src/fouls_audit.py` | Rebuilds every graded fouls line from the FotMob box scores; finds duplicates and unresolvable grades |
| `bot-engine/src/fouls_model.py` | The walk-forward model: competition baseline, team rate, prior-only referee average, negative binomial, holdout test |
| `bot-engine/src/fouls_board.py` | The real-price test + today's team-fouls board |
| `bot-engine/data/fouls_audit_legs.json` | Every leg with its grade, referee evidence and actual stat |
| `bot-engine/data/fouls_walkforward.json` | 1,528 walk-forward predictions |
| `bot-engine/data/fouls_holdout.json` | The holdout calibration maps |
| `bot-engine/data/TEAM_FOULS_BOARD_2026-10-24.md` | Today's board |
| `bot-engine/src/football_price_check.py` | Now also prices the fouls board — paste fouls prices in the same sheet |

*Sources: `bot-engine/data/fotmob_2627_exact_api_cache.json` (1,952 exact matchIds with
per-team fouls, corners, cards, shots, tackles and referee averages);
`bot-engine/data/model_evaluation_ledger.csv` (54 graded matches);
`bot-engine/data/real_book_prices_ledger.json` (49 priced rows).*

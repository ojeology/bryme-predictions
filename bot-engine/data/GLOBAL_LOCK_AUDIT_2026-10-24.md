# AUDIT — the "100% vault" is mostly luck, and its one usable lock is 72%, not 92%

**Date:** 24 Oct 2026 · **Source:** `bot-engine/src/global_lock_backtest.py`

## Why this was checked

The question was "what are our best 100% markets today". The only artefact in
the workspace claiming 100% records is `locked_100_percent_specialist_vault.json`
(107 "perfect" club locks + 5 rule-based global locks). It had never been
walk-forward tested. It has now been.

## Part 1 — the per-club "100% locks" are mined, and mostly luck

The vault tested **48 market checks per club** (corners, fouls, tackles, cards,
home team / away team / opponent / total) and kept every one that went perfect.

| Club | Games | "100%" locks |
|---|---|---|
| BRAGA | 8 | **19** |
| ZVEZDA | 8 | **20** |
| LECH | 11 | 8 |
| PALACE | 8 | 8 |
| GETAFE | 7 | 8 |
| ATALANTA | 8 | 4 |
| ... 11 more clubs | 7–10 | 1–6 |

**Chance of at least one perfect 8/8 record by pure luck, at 48 checks:**
- 8 games: **17.1% per club**
- 10 games: 4.6% per club
- 12 games: 1.2% per club

Across 18 clubs, **~3 clubs are expected to show a perfect streak from luck
alone.** We recorded 107 perfect locks — but BRAGA's 19 and ZVEZDA's 20 locks
are the same underlying behaviour counted many times over on 8 games.

**Verdict: the per-club vault cannot be used as a pick source.** A "100%"
record over 8 games means nothing.

## Part 2 — the GLOBAL locks are pre-specified rules, so they CAN be tested

`GLOBAL_LOCK_04`: *(Away OR Odds > 1.85) AND pre-fouls >= 12.2/g -> Team Fouls Over 10.5*
— vault claims **11/12 = 91.7%**

Rebuilt walk-forward across the 18 clubs' own match logs (153 matches,
17 Aug – 20 Oct 2026), with the team's foul rate computed from **previous games
only** (zero future leakage):

| Arm | n | hits | rate | 95% CI | break-even price |
|---|---|---|---|---|---|
| Away only (exact rule arm) | 23 | 16 | **69.6%** | 51–88% | 1.44 |
| Rate >= 12.2, any venue | 54 | 41 | **75.9%** | 65–87% | 1.32 |
| **Full rule (away OR odds>1.85)** | **25** | **18** | **72.0%** | — | **1.389** |

**The vault's 91.7% does not survive.** The gap is explained by the sample:
the vault's own 12 cases were the ones that worked, chosen from a mine.

The rule is still **real and usable** — 72% with a 1.389 break-even means the
book must quote above 1.39 for it to be worth taking. It is just a
**~72% rule, not a ~92% rule.**

### Misses, so you can see the failure mode
```
MISS 2026-10-11 CELTIC     v Motherwell    prior 14.6/g  fouls  4
MISS 2026-10-11 JUVENTUS   v Cagliari      prior 14.6/g  fouls  8
MISS 2026-10-15 CELTIC     v Benfica       prior 12.8/g  fouls  7
MISS 2026-10-18 SUNDERLAND v Bournemouth   prior 13.4/g  fouls  7
```
All four are **teams whose prior rate was inflated by 1-2 games** and then
mean-reverted. A team with a genuine 13-14 fouls/g rate does not drop to 4-8.

## Part 3 — what this means for TODAY (Sat 24 Oct)

**13 of Saturday's fixtures satisfy the GLOBAL_LOCK_04 condition.** Ranked by the
model's own probability on the lock line (Team Fouls Over 10.5):

| Fixture | Side | Pre-fouls | n | Model on O10.5 | Take-at | Condition |
|---|---|---|---|---|---|---|
| Cagliari v Bologna | AWAY | 12.7/g | 7 | **73.8%** | 1.42 | AWAY ✓ |
| Racing Santander v Espanyol | HOME | 13.8/g | 9 | **73.6%** | 1.43 | needs odds > 1.85 |
| Arezzo v Benevento | HOME | 12.7/g | 7 | **72.2%** | 1.45 | needs odds > 1.85 |
| Napoli v Roma | AWAY | 12.8/g | 10 | **71.0%** | 1.48 | AWAY ✓ (already placed) |
| Chelsea v Tottenham | AWAY | 13.9/g | 7 | **70.4%** | 1.49 | AWAY ✓ |
| Cremonese v Juve Stabia | AWAY | 12.9/g | 7 | 68.3% | 1.54 | AWAY ✓ |
| Lincoln City v Burnley | HOME | 13.1/g | 11 | 68.3% | 1.54 | needs odds > 1.85 |
| Virtus Entella v Mantova | AWAY | 13.3/g | 7 | 67.5% | 1.56 | AWAY ✓ |
| Paderborn v Hamburger | AWAY | 14.3/g | 6 | 66.0% | 1.59 | AWAY ✓ |
| RC Lens v Paris FC | AWAY | 13.6/g | 7 | 63.6% | 1.65 | AWAY ✓ |
| Südtirol v Sampdoria | HOME | 13.9/g | 7 | 65.7% | 1.60 | needs odds > 1.85 |
| Charlton v Norwich | HOME | 12.9/g | 11 | 57.7% | 1.82 | needs odds > 1.85 |
| Stoke City v Bristol City | HOME | 13.8/g | 11 | 52.6% | 2.00 | needs odds > 1.85 |

**The AWAY-only arm is the trustworthy one** (69.6% walk-forward, 1.44
break-even). Seven Saturday fixtures qualify on the away side alone.

**Cagliari v Bologna — Bologna AWAY, 12.7/g over 7 games, model 73.8% on O10.5,
take-at 1.42** is the cleanest instance of the rule in today's list.

**Caution:** every one of these teams has only 6-11 prior games. The audit
above shows the failure mode is exactly a 1-2 game prior inflating the rate.
Prefer the ones with the **deepest** prior: Napoli-Roma (10 games), Cagliari
(7), Chelsea (7).

## Bottom line

* The **"100% vault" is not a 100% source.** 107 per-club locks on 7-12 game
  samples, mined from 48 checks each — mostly luck.
* The one lock that matters for today's markets (GLOBAL_LOCK_04) is **72%
  walk-forward, not 92%**, with a break-even price of **1.389**.
* Use it as a **72% filter**, and take it only when the book quotes **above
  1.39-1.44**.

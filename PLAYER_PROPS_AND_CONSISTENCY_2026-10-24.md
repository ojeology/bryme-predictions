# Player Behaviour Engine + Market Consistency Audit
### Weekend 24–25 Oct 2026 | Top 5 European Leagues | Pure `OVER` behaviour only

**New data source:** FotMob `matchDetails` → `content.playerStats` (per-player **Fouls committed, Tackles, Total shots, Duels won/lost, Was fouled, Interceptions, Blocks, Clearances, Minutes played**) + `content.lineup` (**confirmed starters/subs**).
**Harvested:** `332` matches → `579` player records across `34` club-sides for this weekend.
**Files:** `bot-engine/data/player_behaviour_targeted.json` · `bot-engine/data/player_props_2026-10-24.json`
**Engine:** `bot-engine/src/player_behaviour_engine.py` (strictly forward-in-time, zero future leakage)

---

## 1. WHAT IS ACTUALLY CONSISTENT (season walk-forward, Top-5, out-of-sample)

Every line the model would have played, using **only matches before the one being predicted**:

| Market | Placed | Won | Actual hit rate |
| :--- | ---: | ---: | ---: |
| **Cards Over 2.5** | 19 | 18 | **`94.7%`** ⭐ |
| **Shots Over 22.5** | 67 | 59 | **`88.1%`** ⭐ |
| **Fouls Over 19.5** | 39 | 34 | **`87.2%`** |
| Shots Over 23.5 | 46 | 39 | `84.8%` |
| Corners Over 8.5 | 11 | 9 | `81.8%` |
| **Corners Over 7.5** | 31 | 25 | **`80.6%`** ⚠️ |
| Fouls Over 20.5 | 21 | 16 | `76.2%` ⚠️ |
| **TOTAL** | **234** | **200** | **`85.5%`** |

**54-match UEFA ledger, by market type:**

| Market | Record | Rate |
| :--- | :--- | :-: |
| **Shots (primary)** | `13/14` | **`92.9%`** ⭐ |
| Corners (alternate) | `14/16` | `87.5%` |
| Cards (alternate) | `13/15` | `86.7%` |
| Cards (primary) | `5/6` | `83.3%` |
| Fouls (primary) | `16/20` | `80.0%` |
| **Corners (primary)** | `7/12` | **`58.3%`** ⚠️ |

### 🚨 THE CALIBRATION WARNING (read this before trusting any "100%")

| Pre-match estimate | Placed | Won | **Actual** |
| :--- | ---: | ---: | ---: |
| `90–95%` | 110 | 92 | **`83.6%`** |
| `100%+` | 124 | 108 | **`87.1%`** |

> **A line labelled "100% season record" is really about `87%` out of sample.** Our slip labels have been optimistic by roughly `13` points. Two rules that always win:
> 1. **Pushing the line higher destroys it** — Fouls `O19.5` = `87.2%` → `O20.5` = `76.2%`.
> 2. **Corners is our weakest market** (`80.6%` walk-forward, `58.3%` as a UEFA primary).

**→ Recommendation for tomorrow: build the rollover on `Shots` + `Cards` + `Fouls`. Keep corners to ONE short-priced anchor only.**

---

## 2. PLAYER PROPS — THE VERDICT

**Yes, run them — but in the LONGSHOT, not the `3.00x` rollover.**

### Book availability (checked)

| Player market | 22Bet | SportyBet | Notes |
| :--- | :--- | :--- | :--- |
| Player **Fouls** committed | ✅ | ✅ (selected) | Best supported by our data |
| Player **Shots** / SOT | ✅ | ✅ (selected) | Most widely offered prop |
| Player **Tackles** | ❌ **NOT OFFERED** | ✅ (selected) | **Tackles = SportyBet only** |
| Player **to be Booked** | ✅ | ✅ + Booking Points (10/yellow, 25/red, 35 for 2Y+R) | ⚠️ we lack per-player card data (FotMob match payload has **team-level** cards only) — data gap |
| Player props in-play | — | ❌ | **Pre-match only on SportyBet, no cashout** |

### The decisive rule for player props

> **Player props require a CONFIRMED START.** FotMob publishes lineups ~`60` minutes before kickoff, so a player-prop slip **cannot be built tonight** — it must be built on the day at `T-60min` against our lineup verification. Most books **void** player props if the player doesn't start.

### Calibration for player props

A player with a `100%` foul record over `6` appearances is **not** a 100% event. Applying the same walk-forward calibration: expect **`~85%`**, not `100%`. So:

- At a `1.25` price (implied `80%`) → edge of only **`+5%`** → **skip**.
- At a `1.95` price (implied `51%`) against our `100%` → edge of **`+49%`** → **play**.

> **→ Put player props on the `1.5+` lines where the price is real. Use the `0.5` "must-happen" lines only as cheap anchors, never as the value.**

---

## 3. THE MUST-HAPPEN PLAYERS (walk-forward, strictly prior matches only)

### FOULS — the best player market we have

| Player | Fixture | Apps | Starts | Foul ≥1 | Foul ≥2 | Avg | Last 5 |
| :--- | :--- | :-: | :-: | :-: | :-: | :-: | :--- |
| **Marco Friedl** | Bremen @ Mainz | 6 | 100% | **`100%`** | `50%` | 1.67 | 1,2,3,1,1 |
| **Jan Paul van Hecke** | Spurs @ Chelsea | 7 | 100% | **`100%`** | `42.9%` | 1.43 | 1,2,1,2,1 |
| **Tyrhys Dolan** | Espanyol @ Racing | 7 | 86% | **`100%`** | `42.9%` | 1.43 | 1,1,2,1,1 |
| **Soufian El-Faouzi** | Schalke @ Köln | 6 | 100% | **`100%`** | `33.3%` | 1.33 | 1,1,2,2,1 |
| **Pablo Pagis** | Paris FC @ Lens | 7 | 100% | **`100%`** | `14.3%` | 1.14 | 2,1,1,1,1 |
| **Ezechiel Banzuzi** | RB Leipzig | 8 | 88% | **`100%`** | `50%` | 1.75 | 3,1,1,3,1 |
| **Marvin Pieringer** | Paderborn | 6 | 83% | **`100%`** | **`66.7%`** | 2.33 | 3,2,1,4,1 |
| **Loic Badé** | Leverkusen *(Sun)* | 5 | 80% | **`100%`** | `60%` | **2.40** | 1,1,3,2,5 |
| **Marco Grüll** | Werder Bremen | 6 | 100% | **`100%`** | `33.3%` | 1.33 | 1,2,2,1,1 |
| **Giorgio Scalvini** | Atalanta *(Sun)* | 6 | 100% | **`100%`** | `33.3%` | 1.33 | 2,1,1,1,2 |
| **Antonio Raimondo** | Frosinone *(Sun)* | 7 | 100% | **`100%`** | `57.1%` | 1.86 | 2,1,3,1,3 |
| **Santi Comesaña** | Villarreal | 11 | 91% | `90.9%` | `27.3%` | 1.45 | 1,1,1,1,0 |
| **Nico Paz** | Como | 10 | 100% | `90%` | `60%` | **2.00** | 0,1,3,3,2 |

### TACKLES — SportyBet only (22Bet does not carry them)

| Player | Fixture | Apps | Starts | Tkl ≥1 | Tkl ≥2 | Avg | Last 5 |
| :--- | :--- | :-: | :-: | :-: | :-: | :-: | :--- |
| **Hasan Kuruçay** | Schalke @ Köln | 6 | 100% | **`100%`** | **`100%`** | **3.83** | 4,4,8,3,2 |
| **Youri Regeer** | Bremen @ Mainz | 5 | 100% | **`100%`** | **`100%`** | 2.80 | 2,2,4,3,3 |
| **Guido Rodríguez** | Valencia | 6 | 100% | **`100%`** | `83.3%` | **3.67** | 3,5,4,6,3 |
| **Nicolás Capaldo** | Hamburger SV | 6 | 100% | **`100%`** | `66.7%` | 3.00 | 4,1,4,5,1 |
| **Lukas Petkov** | Elversberg | 6 | 100% | **`100%`** | `83.3%` | 3.33 | 4,4,5,1,4 |
| **Ismaëlo Ganiou** | Lens | 7 | 100% | **`100%`** | `71.4%` | 2.29 | 3,3,4,2,1 |
| **Jan Paul van Hecke** | Spurs @ Chelsea | 7 | 100% | **`100%`** | `71.4%` | 2.00 | 1,2,3,1,3 |
| **Olivier Deman** | Bremen @ Mainz | 6 | 100% | **`100%`** | `66.7%` | 3.33 | 10,3,1,3,2 |
| **Nico Paz** | Como | 10 | 100% | `90%` | **`90%`** | 3.20 | 2,0,3,3,2 |
| **Darío Bakola** | Sassuolo | 6 | 83% | **`100%`** | `66.7%` | 3.17 | 1,1,7,2,3 |

### SHOTS — the highest-value player market

| Player | Fixture | Apps | Starts | Shot ≥1 | Shot ≥2 | Shot ≥3 | Avg | Last 5 |
| :--- | :--- | :-: | :-: | :-: | :-: | :-: | :-: | :--- |
| **Nico Paz** | Como | 10 | 100% | **`100%`** | **`100%`** | **`100%`** | **4.50** | 10,4,3,4,4 |
| **Erling Haaland** | Man City @ Villa | 9 | 100% | **`100%`** | **`100%`** | `77.8%` | **4.56** | 2,4,2,8,5 |
| **Roberto Fernández** | Espanyol @ Racing | 9 | 100% | **`100%`** | **`100%`** | `33.3%` | 2.44 | 2,2,3,4,2 |
| **Morgan Rogers** | Chelsea | 7 | 100% | **`100%`** | **`100%`** | `57.1%` | 2.71 | 3,2,4,2,2 |
| **Serhou Guirassy** | Dortmund | 9 | 89% | **`100%`** | `88.9%` | `66.7%` | 3.67 | 3,2,1,3,8 |
| **Niclas Füllkrug** | Bremen @ Mainz | 6 | 100% | **`100%`** | `83.3%` | `33.3%` | 3.17 | 1,2,6,2,6 |
| **Antonio Raimondo** | Frosinone *(Sun)* | 7 | 100% | **`100%`** | `71.4%` | `57.1%` | 1.86 | 2,1,3,1,3 |
| **Anastasios Douvikas** | Como | 10 | 80% | **`100%`** | `80%` | `60%` | 2.50 | 2,3,2,3,3 |
| **Enzo Fernández** | Man City @ Villa | 8 | 88% | **`100%`** | `75%` | — | 2.00 | 1,1,3,2,2 |
| **Pablo Pagis** | Paris FC @ Lens | 7 | 100% | `85.7%` | `71.4%` | `42.9%` | — | — |
| **João Pedro** | Chelsea | 6 | 100% | **`100%`** | `66.7%` | — | 2.67 | 5,1,1,2,3 |
| **Antonio Nusa** | RB Leipzig | 9 | 100% | **`100%`** | `88.9%` | — | 2.44 | 2,2,3,1,2 |

---

## 4. THE PROPOSED PLAYER-PROP SLIPS

### PLAYER ANCHOR — `~3.00x` (5 legs, 5 DIFFERENT matches, all `Over 0.5` fouls)

| # | KO | Player | Fixture | Our rate | Est. px |
| :- | :-: | :--- | :--- | :-: | :-: |
| 1 | `14:30` | **Marco Friedl** | Bremen @ Mainz | `6/6` `100%` | `~1.25` |
| 2 | `17:30` | **Jan Paul van Hecke** | Spurs @ Chelsea | `7/7` `100%` | `~1.30` |
| 3 | `15:15` | **Tyrhys Dolan** | Espanyol @ Racing | `7/7` `100%` | `~1.25` |
| 4 | `14:30` | **Soufian El-Faouzi** | Schalke @ Köln | `6/6` `100%` | `~1.23` |
| 5 | `19:45` | **Pablo Pagis** | Paris FC @ Lens | `7/7` `100%` | `~1.20` |

**`1.25 × 1.30 × 1.25 × 1.23 × 1.20` = `~3.00x`** → `₦1,000 → ~₦3,000`
⚠️ **Honest note:** at these prices the book implies `80%`. Our walk-forward calibration says a `100%` small-sample record is really `~85%`. **This slip is a *structure*, not an edge** — the real money is in the longshot below.

### PLAYER LONGSHOT — `~13.3x` (4 legs, 4 different matches, ALL `22Bet`-legal — shots only)

| # | KO | Player | Fixture | Pure `OVER` | Our rate | Est. px | Edge vs implied |
| :- | :-: | :--- | :--- | :--- | :-: | :-: | :-: |
| 1 | `14:00` | **Nico Paz** | Como vs Sassuolo | Over `2.5` **Shots** | `10/10` `100%` | `~1.95` | `+49%` |
| 2 | `12:30` | **Erling Haaland** | Man City @ Aston Villa | Over `2.5` **Shots** | `7/9` `77.8%` | `~2.30` | `+35%` |
| 3 | `17:30` | **Morgan Rogers** | Chelsea vs Spurs | Over `1.5` **Shots** | `7/7` `100%` | `~1.70` | `+41%` |
| 4 | `15:15` | **Roberto Fernández** | Espanyol @ Racing | Over `1.5` **Shots** | `9/9` `100%` | `~1.75` | `+43%` |

**`1.95 × 2.30 × 1.70 × 1.75` = `~13.3x`** → `₦1,000 → ~₦13,340`
**Add a 5th** for `~32x`: **Marvin Pieringer** (Paderborn) Over `1.5` **Fouls** — `4/6` `66.7%` @ `~2.40`.

### SPORTYBET-ONLY VARIANT (adds tackles, ~`35.7x`)
Replace leg 5 with **Hasan Kuruçay** (Schalke @ Köln) Over `1.5` **Tackles** — `6/6` `100%` @ `~1.95` → `2.30 × 1.95 × 1.70 × 1.75 × 1.95` = **`~35.7x`**.

---

## 5. EXECUTION RULES FOR PLAYER PROPS

1. **Build on the day, not tonight.** Wait for FotMob lineups (`T-60min`), then confirm the player is in `starters`.
2. **One leg per match** in an accumulator (different players from the same match are usually allowed, but confirm on the book).
3. **22Bet has no tackles** → tackles legs must be a SportyBet-only slip.
4. **SportyBet player props are pre-match only** — no in-play, no cashout.
5. **Do not use the `0.5` lines for value** — only as cheap anchors. The edge lives at `1.5+`.
6. **Booking markets are not yet modelable** — FotMob's match payload gives team-level cards only. Per-player card data needs the player-profile endpoint or an event feed.

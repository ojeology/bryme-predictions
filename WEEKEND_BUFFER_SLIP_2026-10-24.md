# Weekend Buffer Slip v2 — Saturday 24 Oct → Sunday 25 Oct 2026
### With the **REFEREE GATE** added after Friday's live post-mortem

**Catalogue:** `41` Top-5-League fixtures (`24` Sat + `17` Sun) • `1,952` exact `matchId` box scores • `360` clubs.
**Markets:** Pure `OVER` behaviour only (`Corners`, `Fouls`, `Shots`, `Yellow Cards`) — ZERO goals, ZERO `1X2`, ZERO Unders.

---

## 0. WHAT FRIDAY TAUGHT US (live post-mortem, 23 Oct)

Friday's Top-5 slate at `21:05 WAT`:

| League | Fixture | Live | Corners | Fouls | Cards | Shots | Referee (card avg) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Bundesliga | Stuttgart vs Gladbach | `60'` | **T5 (proj 7.5)** ⚠️ | T15 (proj 22.5) ✅ | T5 ✅ | T20 ✅ | Jöllenbeck `3.94` |
| La Liga | Alavés vs Málaga | `HT` | T4 (proj 8.0) | T15 (proj 30) ✅ | T1 ⚠️ | T9 (proj 18) | Muñiz Muñoz `3.75` |
| Ligue 1 | Brest vs Nice | `49'` | T6 (proj 11) ✅ | T10 | T0 ⚠️ | T14 ✅ | Paradis `3.68` |
| Premier League | Ipswich vs Forest | `HT` | **T2 (proj 4.0)** ❌ | T9 | T0 ⚠️ | T12 ✅ | Bramall `4.25` |
| Serie A | Torino vs Monza | `46'` | T5 (proj 10) ✅ | T8 | T1 ⚠️ | T7 (proj 14) | Marchetti `3.36` |

**The lesson that matters (CORRECTED after the walk-forward re-run):** `Stuttgart vs Gladbach — Over 8.5 Corners` died — but **not** because the referee was corner-poor. An earlier draft of this report claimed Jöllenbeck averaged `8.33` corners/g, *below* the line. **That figure was hindsight** — it was computed from 3 matches *including the very match it was supposed to predict* (Friday's game produced only `4` corners, dragging the average down). The true **pre-match** figure was **`10.50` corners/g from just `2` prior matches**.

> The real failure was **data coverage, not referee quality.** We had almost no history on that whistle-blower.
>
> ### NEW RULE (v2): MARKET-MARGIN GATE + SAMPLE FLOOR
> Every line must pass **all four**:
> 1. **Floor > line** — the worst game in the sample still wins.
> 2. **Referee market average ≥ line + margin** — corners/shots `+4`, fouls `+5`, cards `+2`.
> 3. **Referee sample floor** — `≥3` prior matches in the database for corner/shot lines, `≥8` for foul/card lines.
> 4. **Season ≥ 93.5%** and **Venue ≥ 88%**.
>
> **Result: `198` referee-approved zero-loss lines across the weekend** (up from `11` before the gate).

**Also proven:** the cold card environment was **entirely referee-driven**. The three games with `0–1` cards at half-time were run by the three most lenient men on the list (Paradis `3.68`, Marchetti `3.36`, Muñiz `3.75`). Saturday's Racing–Espanyol referee is **Jesús Gil Manzano at `5.40` cards/g** — the card leg survives untouched.

---

## 1. THE THREE FINAL SLIPS

### SLIP A — "DEEP BUFFER" `~3.03x` (Saturday only, 4 games) ⭐ RECOMMENDED

| # | KO | Fixture | Pure `OVER` Pick | Model | Season | Venue | Floor | Buf | Referee avg | Est. px |
| :- | :-: | :--- | :--- | :-: | :-: | :-: | :-: | :-: | :--- | :-: |
| 1 | `17:30` | **Chelsea vs Tottenham** | Match Over `3.5` **Corners** | `11` | `14/14` `100%` | `6/6` `100%` | **`8`** | `+4.5` | Kavanagh `10.67` crn | `~1.18` |
| 2 | `15:15` | **Racing Santander vs Espanyol** | Match Over `16.5` **Fouls** | `28` | `18/18` `100%` | `8/8` `100%` | `19` | `+2.5` | Manzano `28.40` foul | `~1.35` |
| 3 | `14:30` | **RB Leipzig vs Elversberg** | Match Over `18.5` **Shots** | `33` | `15/15` `100%` | `7/7` `100%` | **`24`** | **`+5.5`** | Dankert `29.00` shot | `~1.38` |
| 4 | `14:30` | **Paderborn vs Hamburger SV** | Match Over `18.5` **Shots** | `32` | `12/12` `100%` | `6/6` `100%` | **`24`** | **`+5.5`** | Petersen `28.67` shot | `~1.38` |

**`1.18 × 1.35 × 1.38 × 1.38` = `~3.03x`** → `₦1,000 → ~₦3,030`
**Buffer story:** every game in both shots legs had `24+` shots — **not one game in `27` combined matches has ever come within `5` shots of the line.** A 19-shot game would still win legs 3 and 4.

---

### SLIP B — "DEEP BUFFER + ANCHOR" `~3.40x` (Saturday only, 5 games)

| # | KO | Fixture | Pure `OVER` Pick | Season | Venue | Floor | Buf | Referee avg | Est. px |
| :- | :-: | :--- | :--- | :-: | :-: | :-: | :-: | :--- | :-: |
| 1 | `17:30` | **Chelsea vs Tottenham** | Match Over `3.5` Corners | `14/14` | `6/6` | `8` | `+4.5` | Kavanagh `10.67` crn | `~1.18` |
| 2 | `15:15` | **Racing Santander vs Espanyol** | Match Over `16.5` Fouls | `18/18` | `8/8` | `19` | `+2.5` | Manzano `28.40` foul | `~1.35` |
| 3 | `14:30` | **RB Leipzig vs Elversberg** | Match Over `18.5` Shots | `15/15` | `7/7` | `24` | `+5.5` | Dankert `29.00` shot | `~1.38` |
| 4 | `14:30` | **Paderborn vs Hamburger SV** | Match Over `18.5` Shots | `12/12` | `6/6` | `24` | `+5.5` | Petersen `28.67` shot | `~1.38` |
| 5 | `14:30` | **1. FC Köln vs Schalke 04** | Match Over `2.5` Corners | `12/12` | `6/6` | `5` | `+2.5` | Osmers `10.83` crn | `~1.12` |

**`3.03 × 1.12` = `~3.40x`** → `₦1,000 → ~₦3,400`
**Adds a fifth game** for `₦0` of extra risk (the `2.5` corner line needs only 3 corners and Köln–Schalke has never seen fewer than `5`).

---

### SLIP C — "FULL WEEKEND, BIGGEST SAMPLES" `~3.12x` (Sat + Sun)

| # | Day | KO | Fixture | Pure `OVER` Pick | Season | Venue | Floor | Buf | Referee avg | Est. px |
| :- | :-: | :-: | :--- | :--- | :-: | :-: | :-: | :-: | :--- | :-: |
| 1 | Sat | `17:30` | **Chelsea vs Tottenham** | Match Over `3.5` Corners | `14/14` | `6/6` | `8` | `+4.5` | Kavanagh `10.67` crn | `~1.18` |
| 2 | Sat | `15:15` | **Racing Santander vs Espanyol** | Match Over `16.5` Fouls | `18/18` | `8/8` | `19` | `+2.5` | Manzano `28.40` foul | `~1.35` |
| 3 | Sat | `14:30` | **RB Leipzig vs Elversberg** | Match Over `18.5` Shots | `15/15` | `7/7` | `24` | `+5.5` | Dankert `29.00` shot | `~1.38` |
| 4 | **Sun** | `15:00` | **Liverpool vs Brighton** | Match Over `18.5` Shots | **`19/19`** | `10/10` | `21` | `+2.5` | Barrott `27.33` shot | `~1.42` |

**`1.18 × 1.35 × 1.38 × 1.42` = `~3.12x`** → `₦1,000 → ~₦3,120`
**Leg 4 is the single biggest sample on the board** — `19` games, `19` wins, never fewer than `21` shots.

---

## 2. THE FULL REF-GATED SWAP POOL (zero-loss, deep buffer)

| Fixture | Line | Season | Venue | Floor | Buf | Referee avg | px |
| :--- | :--- | :-: | :-: | :-: | :-: | :--- | :-: |
| Chelsea vs Tottenham | Match Over `4.5` Corners | `14/14` | `6/6` | `8` | `+3.5` | `10.67` crn | `~1.32` |
| Chelsea vs Tottenham | Match Over `5.5` Corners | `14/14` | `6/6` | `8` | `+2.5` | `10.67` crn | `~1.45` |
| RB Leipzig vs Elversberg | Match Over `19.5` Shots | `15/15` | `7/7` | `24` | `+4.5` | `29.00` shot | `~1.50` |
| RB Leipzig vs Elversberg | **RB Leipzig** Over `10.5` Shots | `15/15` | `7/7` | `11` | `+0.5` | `29.00` shot | `~1.65` |
| Paderborn vs HSV | Match Over `19.5` Shots | `12/12` | `6/6` | `24` | `+4.5` | `28.67` shot | `~1.50` |
| Racing vs Espanyol | Match Over `17.5` Fouls | `18/18` | `8/8` | `19` | `+1.5` | `28.40` foul | `~1.55` |
| Racing vs Espanyol | **Espanyol** Over `9.5` Fouls | `18/18` | `8/8` | `10` | `+0.5` | `28.40` foul | `~1.32` |
| Racing vs Espanyol | Match Over `2.5` Yellow Cards | `18/18` | `8/8` | `3` | `+0.5` | **`5.40` crd** | `~1.25` |
| 1. FC Köln vs Schalke 04 | Match Over `3.5` Corners | `12/12` | `6/6` | `5` | `+1.5` | `10.83` crn | `~1.22` |
| Hoffenheim vs Leverkusen *(Sun)* | Match Over `18.5` Shots | `18/18` | `10/10` | `22` | `+3.5` | `32.60` shot | `~1.42` |
| Hoffenheim vs Leverkusen *(Sun)* | **Leverkusen** Over `8.5` Shots | `18/18` | `10/10` | `12` | `+3.5` | `32.60` shot | `~1.48` |
| Liverpool vs Brighton *(Sun)* | Match Over `19.5` Shots | `19/19` | `10/10` | `21` | `+1.5` | `27.33` shot | `~1.58` |
| Sunderland vs Leeds *(Sun)* | Match Over `18.5` Shots | `17/17` | `10/10` | `21` | `+2.5` | `32.00` shot | `~1.42` |
| Toulouse vs Troyes *(Sun)* | Match Over `16.5` Fouls | `14/14` | `6/6` | `20` | `+3.5` | `27.50` foul | `~1.38` |
| Atalanta vs Frosinone *(Sun)* | Match Over `18.5` Shots | `15/16` `93.8%` | `7/8` `87.5%` | `22` | `+3.5` | `29.25` shot | `~1.42` |
| Aston Villa vs Man City | Match Over `2.5` Corners | `20/20` | `10/10` | `4` | `+1.5` | `13.00` crn | `~1.10` |
| Como vs Sassuolo | Match Over `18.5` Shots | `17/17` | `8/8` | `21` | `+2.5` | `30.00` shot | `~1.38` |
| Mainz 05 vs Werder Bremen | Match Over `18.5` Shots | `12/12` | `6/6` | `19` | `+0.5` | `31.60` shot | `~1.38` |

---

## 3. NEW REJECTS ADDED BY THE REFEREE GATE

| Game | Verdict | Reason |
| :--- | :--- | :--- |
| **Inter vs Fiorentina** *(Sun)* — Shots | ❌ **REJECT** | Referee **Maurizio Mariani averages only `17.00` shots/g** — the line sat ABOVE the referee's average. `REF FAIL`. |
| **RB Leipzig vs Elversberg** — Corners | ❌ **REJECT** | Referee **Dankert averages only `5.50` corners/g**. Corners are OUT for this game even though both teams are corner-heavy — which is exactly why we take **shots** here instead. |
| **Cagliari vs Bologna** — Cards | ❌ REJECT | Referee **Kevin Bonacina: `0.50` cards/g** (2 games). Cards are dead. |
| **Borussia Dortmund vs Eintracht Frankfurt** — Cards | ❌ REJECT | Referee **Jablonski: `2.17` cards/g**, `Over 2.5` in only `33%` of his games. (His **shot** average is `35.33` — the highest on the board — so shots are fine.) |
| **Mainz 05 vs Werder Bremen** — Cards | ❌ REJECT | Referee **Badstübner: `3.20` cards/g**. Use his `31.60` shot average instead. |
| **RC Lens vs Paris FC** | ⚠️ HOLD | Venue `7/7` but new manager **Yannick Cahuzac** — first-match variance. Ref Vernice `9.50` crn supports corners. |

---

## 4. LONGSHOT SLIP — UPGRADES FROM THE REFEREE GATE

| Fixture | Line | Season | Venue | Referee avg | Edge |
| :--- | :--- | :-: | :-: | :--- | :--- |
| **Borussia Dortmund vs Eintracht Frankfurt** | Match Over `26.5` Shots | `13/15` `86.7%` | `7/7` `100%` | **Jablonski `35.33` shot** | Ref average is `8.8` above the line — the strongest ref support in the Bundesliga slate. |
| **Liverpool vs Brighton** *(Sun)* | Match Over `24.5` Shots | `17/19` `89.5%` | `10/10` `100%` | Barrott `27.33` shot | `19`-game sample, never below `21`. |
| **Sunderland vs Leeds** *(Sun)* | Match Over `19.5` Shots | `16/17` `94.1%` | `7/7` `100%` | Attwell `32.00` shot | Ref average `12.5` above the line. |
| **Hoffenheim vs Leverkusen** *(Sun)* | Match Over `21.5` Shots | `18/18` `100%` | `10/10` `100%` | Siebert `32.60` shot | Zero-loss + huge ref support. |
| **Chelsea vs Tottenham** | Match Over `10.5` Corners | `10/14` `71.4%` | `6/6` `100%` | Kavanagh `10.67` crn | Ref average is `0.17` above the line — **weaker** than the `Over 7.5` version. |

---

## 5. HONEST RISK NOTE

- `Floor > line` describes the sample we have seen, not a promise. `6–21` games per club means a new worst case is possible.
- **The shots legs are the strongest in the set** — `0` danger games across `27` combined matches on legs 3 and 4 of Slip A.
- **Corners legs are the weakest** — `Chelsea–Spurs` has `4` games at exactly `8` corners on the `Over 7.5` line; `Leverkusen` has `5` games at exactly `3`.
- **One early red card** destroys a fouls/shots line but only removes cards from a cards line.
- `Elversberg`, `Paderborn`, `HSV` are newly promoted — `6` games each.
- Prices are typical `22Bet` / `SportyBet` bands; **confirm every price on the book before placing.**

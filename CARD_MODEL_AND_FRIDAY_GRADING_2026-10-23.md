# CARD MODEL + FRIDAY 23 OCT GRADING
### Referee-led yellow-card engine | built 23 Oct 2026, 21:45 WAT

**Engine:** `bot-engine/src/card_board.py` · **Board:** `bot-engine/data/card_board_2026-10-24.json` (`50` fixtures)

---

## 1. THE EPL MATCH WE PREDICTED EARLIER — Ipswich Town v Nottingham Forest (20:00 WAT)

Pre-match card pick, from Friday's audit (`friday_23_oct_all_leagues_overs_audit.json`, `audit[17]`):

| Field | Value |
| :--- | :--- |
| **Pick** | **Nottingham Forest (Away) yellowcards OVER 0.5** |
| Two-sided 2026-27 | **16/17 (94.1%)** — Forest `8/8` (For), Ipswich conceded `8/9` (OppAg) |
| Venue 2026-27 | `7/8 (87.5%)` |
| Forest's own card sequence | `1, 4, 2, 0, 1, 3, 1, 2, 3` |
| **Live odds found** | **NONE** → never priced, so **it did not go on the 3.036x slip** |

**RESULT: Forest booked 1 yellow card → WON.** ✅
Live state at grading: `1-1`, 2nd half, **2 yellows total (h1 / a1)**, 5 corners, 13 fouls, 21 shots.
Referee **Thomas Bramall** — `4.25` Y/g, `Over 3.5` in `50%` of his games.

---

## 2. THE FRIDAY SLIP'S CARD LEG — WON

`Granada vs Real Valladolid` (19:30 WAT) — **Real Valladolid (Away) Over 1.5 Yellow Cards @ 22Bet 1.24**
→ **Valladolid booked 4 yellows** (Granada 1, Valladolid 4; 5 total) → **WON** ✅

---

## 3. EVERY FRIDAY CARD LOCK, GRADED — 8 / 9 WON (88.9%)

| KO | Match | Pick | Line | Two-sided | Venue | ACTUAL | Verdict |
| :-: | :--- | :--- | :-: | :--- | :--- | :-: | :-: |
| 18:00 | Elfsborg v Malmö FF | Malmö (Away) cards O0.5 | 0.5 | 26/27 (96.3%) | 91.7% | 2 | **WON** |
| 17:00 | Motor Lublin v Zagłębie Lubin | Zagłębie (Away) cards O0.5 | 0.5 | 21/22 (95.5%) | 90.9% | 2 | **WON** |
| 20:00 | Alavés v Málaga | Málaga (Away) cards O0.5 | 0.5 | **18/18 (100%)** | **100%** | **0** | **LOST** ❌ |
| 19:30 | Granada v Real Valladolid | **Match Total** cards O2.5 | 2.5 | 18/20 (90.0%) | 88.9% | 5 | **WON** |
| 19:30 | Granada v Real Valladolid | Granada (Home) cards O0.5 | 0.5 | 20/20 (100%) | 100% | 1 | **WON** |
| 19:30 | Granada v Real Valladolid | Valladolid (Away) cards O0.5 | 0.5 | 20/20 (100%) | 100% | 4 | **WON** |
| 19:30 | Granada v Real Valladolid | **Valladolid (Away) cards O1.5** | 1.5 | 18/20 (90.0%) | 88.9% | 4 | **WON** |
| 19:45 | Brest v Nice | Nice (Away) cards O0.5 | 0.5 | 14/14 (100%) | 100% | 4 | **WON** (live) |
| 20:00 | Ipswich Town v Nottingham Forest | **Forest (Away) cards O0.5** | 0.5 | 16/17 (94.1%) | 87.5% | 1 | **WON** (live) |

**Split:** AWAY O0.5 `5/6` · AWAY O1.5 `1/1` · HOME O0.5 `1/1` · TOTAL O2.5 `1/1`

> ### ⚠️ THE ONE MISS IS THE MOST IMPORTANT ROW IN THIS TABLE
> **Málaga (Away) yellowcards Over 0.5 at Alavés** — two-sided **18/18 = 100%**, venue **9/9 = 100%** — and it still **LOST** (Málaga 0, Alavés 2).
> A "100%" pre-match record is not a guarantee. It is the same lesson as the UEFA `Cards O3.5 @ 1.77` loss (Lech Poznań v Sunderland). **Never let a 100% label override the price.**

---

## 4. THE NEW CARD MODEL — AND THE BIG STRUCTURAL FINDING

Cards were modelled three ways and scored walk-forward on `1,404` matches across `20` competitions (Brier score, lower = better):

| Model | Over 2.5 Brier | Over 3.5 Brier |
| :--- | :-: | :-: |
| **Referee alone** | **`0.1480`** | — |
| Teams + referee | `0.1607` | `0.1818` |
| League base rate | `0.1968` | `0.2357` |

> ### 🔑 CARDS ARE A REFEREE MARKET, NOT A TEAM MARKET
> **Adding each team's own card history made the forecast WORSE.** The referee alone is the best predictor of yellow cards. Team card data is noise here — unlike fouls/shots/corners, where team identity drives the number.

**Final model (referee-led):**
- `P(>3.5)` = the referee's own deep-sample `Over 3.5` rate (Sportmonks, `12–35` games; FotMob, `37–54` games)
- `P(>2.5) = 40.9 + 0.605 × P(>3.5)`  → **R² = 0.548**
- `P(>4.5) = −3.6 + 0.737 × P(>3.5)`  → **R² = 0.616**
- League base 2026-27: `3.75` cards/match · `P(>2.5) 70.9%` · `P(>3.5) 51.8%` · `P(>4.5) 34.0%`

**Calibration (walk-forward, `P(>2.5)` bucket → actual):**
`50-59% → 59.4%` · `60-69% → 63.8%` · `70-79% → 73.3%` · `80-89% → 78.7%` · `100-109% → 95.7%`

---

## 5. FRIDAY 23 OCT — PREDICTION vs ACTUAL (all 19 fixtures)

| KO | Match | Referee (n prior) | Model PRED | P>2.5 | P>3.5 | ACTUAL | h/a | Grade |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :-: | :-: |
| 16:00 | Motor Lublin v Zagłębie Lubin | Jenda (97) | 4.0 | 66.1% | 53.4% | 4 | 2/2 | **WON** |
| 16:30 | Bochum v Wolfsburg | Weisbach (4) | 5.0 | 100.0% | 74.6% | 2 | 0/2 | **LOST** ❌ |
| 16:30 | Darmstadt v St. Pauli | Gansloweit (72) | 5.0 | 93.8% | 80.8% | 7 | 3/4 | **WON** |
| 16:30 | Akhmat v Orenburg | Cheban (88) | 4.0 | 68.0% | 52.1% | 3 | 1/2 | **WON** |
| 17:00 | Elfsborg v Malmö FF | Maqedonci (8) | 3.0 | 75.5% | 38.8% | 5 | 3/2 | **WON** |
| 17:00 | Västerås v Halmstad | Nyberg (8) | 3.0 | 63.2% | 37.7% | 1 | 0/1 | **LOST** ❌ |
| 17:00 | Alanyaspor v Kocaelispor | Şansalan (72) | 4.0 | 74.9% | 58.2% | 7 | 3/4 | **WON** |
| 18:00 | Go Ahead Eagles v Telstar | Hensgens (5) | 3.0 | 59.1% | 0.0% | 2 | 1/1 | **LOST** ❌ |
| 18:30 | Stuttgart v Gladbach | Jöllenbeck (54) | 4.0 | 75.0% | 58.5% | 6 | 2/4 | **WON** |
| 18:30 | Widzew v Górnik | Arys (6) | 1.0 | 33.7% | 33.7% | 3 | 2/1 | **WON** |
| 18:30 | Granada v Real Valladolid | Huerta de Aza (110) | 5.0 | 100.0% | 83.9% | 5 | 1/4 | **WON** |
| 18:30 | Empoli v LR Vicenza | — (70) | 3.0 | 100.0% | 49.3% | 3 | 1/2 | **WON** |
| 18:45 | Brest v Nice | Paradis (4) | 3.0 | 51.0% | 25.5% | 7 | 3/4 | LIVE — **IN** |
| 18:45 | Torino v Monza | Zanotti (70) | 4.0 | 74.8% | 50.2% | 1 | 1/0 | LIVE — **OUT** |
| 19:00 | Bolton v Middlesbrough | Hooper (35) | — | — | — | 1 | 0/1 | LIVE — **OUT** |
| 19:00 | Alavés v Málaga | Muñiz Muñoz (39) | — | — | — | 2 | 2/0 | LIVE — **OUT** |
| 19:00 | **Ipswich v Nottingham Forest** | **Bramall (37)** | — | — | — | **2** | **1/1** | LIVE — **IN** ✅ |
| 19:45 | Vitória Guimarães v Marítimo | Rosa (8) | — | — | — | 5 | 3/2 | 1H — **IN** ✅ |
| 19:45 | Kortrijk v Mechelen | van Driessche (3) | — | — | — | not started | — | — |

**Summary:** Over 2.5 cards — `9/12` full-time matches won (`75.0%`); where the model said `≥60%` → `8/10` (`80.0%`); where it said `≥70%` → `6/7` (`85.7%`). Mean predicted `3.67` vs mean actual `4.00`.

---

## 6. STILL LIVE TONIGHT

| KO | Match | Card position |
| :-: | :--- | :--- |
| 19:45 | **Kortrijk v Mechelen** | Ref **Bram van Driessche** `5.33` Y/g over `3` (n=3, thin) · Belgian league `3.19` Y/g, `P(>3.5) 38%` · audit lock **Kortrijk (Home) cards O0.5** two-sided `14/16 (87.5%)`, venue `6/8 (75.0%)` → **playable but not a slam** |
| 20:45 | **Vitória Guimarães v Marítimo** | Ref **Diogo Rosa** `6.13` Y/g over `8` · **5 cards already at HT (h3 / a2)** → audit locks *Vitória (Home) O0.5* and *Marítimo (Away) O0.5* **both already won** |

---

## 7. TOMORROW'S CARD BOARD (Sat 24 / Sun 25 Oct)

| Date | KO | Match | Referee | Y/g | O3.5 (n) | P>2.5 | P>3.5 | **Min px O2.5** | **Min px O3.5** |
| :--- | :-: | :--- | :--- | :-: | :-: | :-: | :-: | :-: | :-: |
| Sat 14:00 | Entella v Mantova *(S.B)* | Paride Tremolada | 5.75 | 100% (4) | 100% | 100% | **1.05** | **1.05** |
| **Sun 16:30** | **Sunderland v Leeds** | **Stuart Attwell** | 4.93 | 79% (29) | 88.7% | 79.0% | **1.18** | **1.33** |
| **Sun 14:00** | **Monaco v Lille** | **François Letexier** | 4.27 | 77% (22) | 87.5% | 77.0% | **1.20** | **1.36** |
| Sat 14:30 | Paderborn v Hamburger SV | Martin Petersen | 4.42 | 75% (12) | 86.3% | 75.0% | **1.22** | **1.40** |
| Sat 12:30 | Sheffield Utd v Derby | Stephen Martin | 4.79 | 75% (28) | 86.3% | 75.0% | **1.22** | **1.40** |
| Sat 14:30 | Köln v Schalke 04 | Harm Osmers | 4.33 | 73% (15) | 85.0% | 73.0% | **1.23** | **1.44** |
| Sat 14:30 | Augsburg v Union Berlin | Robin Braun | 4.18 | 73% (11) | 85.0% | 73.0% | **1.23** | **1.44** |
| Sun 17:00 | Lecce v Juventus | Fabio Maresca | 4.73 | 73% (15) | 85.0% | 73.0% | **1.23** | **1.44** |
| **Sat 17:30** | **Chelsea v Tottenham** | **Chris Kavanagh** | **4.24** (54g) | **71% (34)** | **83.8%** | **71.0%** | **1.25** | **1.48** |
| Sat 17:00 | Napoli v Roma | Andrea Colombo | 4.19 | 69% (16) | 82.6% | 69.0% | 1.27 | 1.52 |
| Sat 15:15 | **Racing Santander v Espanyol** | **Jesús Gil Manzano** | **4.90** (40g) | **83% (24)** | **91.1%** | **83.0%** | **1.15** | **1.27** |
| Sat 17:30 | **Valencia v Villarreal** | **Alejandro Quintero González** | **4.32** (37g) | **78% (23)** | **88.1%** | **78.0%** | **1.19** | **1.35** |
| Sun 14:00 | Inter v Fiorentina | Maurizio Mariani | 3.94 | 65% (17) | 80.2% | 65.0% | 1.31 | 1.62 |
| Sun 14:00 | Genoa v Venezia | Simone Sozza | 3.89 | 63% (19) | 79.0% | 63.0% | 1.33 | 1.67 |
| Sun 19:45 | Udinese v AC Milan | Matteo Marcenaro | 4.07 | 67% (15) | 81.4% | 67.0% | 1.29 | 1.57 |
| Sun 17:30 | **Paris Saint-Germain v Lyon** | **Jérôme Brisard** | **4.25** (20) | **65% (20)** | 80.2% | 65.0% | 1.31 | 1.62 |
| Sun 16:15 | Freiburg v Bayern | Felix Zwayer | 4.20 | 60% (20) | 77.2% | 60.0% | 1.36 | 1.75 |
| Sun 14:00 | Liverpool v Brighton | Samuel Barrott | 3.64 | 64% (28) | 79.6% | 64.0% | 1.32 | 1.64 |

### ❌ AVOID (referee too lenient for a card line)
| Match | Referee | Y/g | O3.5 |
| :--- | :--- | :-: | :-: |
| Mainz v Werder Bremen | Florian Badstübner | 2.28 | 28% |
| Dortmund v Eintracht Frankfurt | Sven Jablonski | 2.75 | 30% |
| Como v Sassuolo | Davide Di Marco | 3.00 | 25% |
| Hoffenheim v Bayer Leverkusen | Daniel Siebert | 3.21 | 42% |
| RB Leipzig v Elversberg | Bastian Dankert | 3.13 | 50% |
| Aston Villa v Man City | Peter Bankes | 3.92 | 50% |

---

## 8. THE PRICE RULE FOR CARDS (from the 54-match UEFA ledger, real book prices)

| Market | Line | n | Won | Hit | Real price | Implied | **EDGE** |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **Cards** | **Over 3.5** | 8 | 7 | **87.5%** | **1.60** (1.27–1.77) | 62.4% | **`+25.1%`** ⭐ |
| Cards | Over 2.5 | 94 | 78 | 83.0% | ~1.24 | 80.6% | `+2.3%` ⚠️ |

> **Cards `Over 2.5` at ~`1.24` is a value trap. Cards `Over 3.5` at `1.60+` is the best edge we hold.**
> The book pays `+36%` more when you push the cards line up, while our probability barely drops — the opposite of fouls/shots, where pushing up costs more than it pays.

**Therefore: prefer `Over 3.5` card lines on strict referees, and only take them at `1.60` or better.** Use `Over 2.5` as a cheap anchor only.

#!/usr/bin/env python3
"""CARD BOARD v3 — referee-led, calibrated on deep samples.

P(>3.5) comes straight from the refereer's own deep-sample O3.5 rate (manifest,
Sportmonks, 12-35 games). P(>2.5) and P(>4.5) are learned from the 2026-27 cache
by regressing the refereer's realised over-rate on the same quantity.
"""
import json, collections, statistics as st, math, re, unicodedata

with open('bot-engine/data/fotmob_2627_exact_api_cache.json') as f:
    cache = json.load(f)
with open('bot-engine/data/ground_zero_manifest.json') as f:
    man = json.load(f)

ref_cards = collections.defaultdict(list)
league = []
for mid, m in cache.items():
    y = m.get('yellows') or []
    if len(y) != 2:
        continue
    d = (m.get('utcTime') or '')[:10]
    league.append(y[0] + y[1])
    r = (m.get('referee') or {}).get('name')
    if r and d < '2026-10-23':
        ref_cards[r].append(y[0] + y[1])

# ---- learn the P(>2.5) / P(>4.5) mapping from realised referee over-rates ----
pts = []
for r, v in ref_cards.items():
    if len(v) < 4:
        continue
    pts.append((100 * sum(1 for x in v if x > 3.5) / len(v),
                100 * sum(1 for x in v if x > 2.5) / len(v),
                100 * sum(1 for x in v if x > 4.5) / len(v)))
print(f"calibration set: {len(pts)} referees (>=4 prior 2026-27 matches)")
print(f"league baseline: mean {st.mean(league):.2f} cards, "
      f"P>2.5 {100*sum(1 for x in league if x>2.5)/len(league):.1f}%, "
      f"P>3.5 {100*sum(1 for x in league if x>3.5)/len(league):.1f}%, "
      f"P>4.5 {100*sum(1 for x in league if x>4.5)/len(league):.1f}%")


def fit(xs, ys):
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
    a = my - b * mx
    ss = sum((y - my) ** 2 for y in ys)
    r2 = 1 - sum((y - (a + b * x)) ** 2 for x, y in zip(xs, ys)) / ss
    return a, b, r2


p35s = [p[0] for p in pts]
a2, b2, r22 = fit(p35s, [p[1] for p in pts])
a4, b4, r24 = fit(p35s, [p[2] for p in pts])
print(f"P(>2.5) = {a2:.1f} + {b2:.3f} x P(>3.5)   R2={r22:.3f}")
print(f"P(>4.5) = {a4:.1f} + {b4:.3f} x P(>3.5)   R2={r24:.3f}")


def p2_from(p35):
    return max(0.0, min(1.0, (a2 + b2 * p35) / 100))


def p4_from(p35):
    return max(0.0, min(1.0, (a4 + b4 * p35) / 100))


refman = {r['name']: r for r in man['referees']}
board = []
print("\n=== CARD BOARD — SAT 24 / SUN 25 OCT (Top-5 + Championship + UCL/UEL) ===")
print(f"{'DATE':>10s} {'KO':>5s} {'MATCH':40s} {'REFEREE':24s} {'n':>4s} {'Y/g':>5s} {'O3.5':>5s} | "
      f"{'P>2.5':>7s} {'P>3.5':>7s} {'P>4.5':>7s} | {'MIN2.5':>7s} {'MIN3.5':>7s} | VERDICT")
for f in man['weekend_fixtures']:
    if f.get('date') not in ('2026-10-24', '2026-10-25'):
        continue
    ref = (f.get('referee') or {}).get('name')
    r = refman.get(ref) or {}
    mu, o35, games = r.get('avg_yellows'), r.get('over_3_5'), r.get('games')
    if mu is None or o35 is None:
        continue
    if o35 <= 0: o35 = 1
    p3 = o35 / 100
    p2, p4 = p2_from(p35=100 * p3), p4_from(p35=100 * p3)
    pick = []
    if p2 <= 0: p2 = 0.01
    if p4 <= 0: p4 = 0.01
    if p2 >= 0.60:
        pick.append(f"O2.5 @ >={100/(p2*100)*1.05:.2f}")
    if p3 >= 0.55:
        pick.append(f"O3.5 @ >={100/(p3*100)*1.05:.2f}")
    verdict = ' | '.join(pick) if pick else 'PASS'
    print(f"{f['date']:>10s} {f['kickoff_time']:>5s} {(f['home_name'][:18]+' v '+f['away_name'][:18]):40s} "
          f"{(ref or '?')[:24]:24s} {games:>4} {mu:>5} {o35:>4}% | "
          f"{p2*100:6.1f}% {p3*100:6.1f}% {p4*100:6.1f}% | "
          f"{100/(p2*100)*1.05:7.2f} {100/(p3*100)*1.05:7.2f} | {verdict}")
    board.append(dict(date=f['date'], ko=f['kickoff_time'], home=f['home_name'], away=f['away_name'],
                      comp=f.get('comp_name'), ref=ref, ref_games=games, ref_ypg=mu, ref_o35=o35,
                      strictness=r.get('strictness'),
                      p2=round(p2 * 100, 1), p3=round(p3 * 100, 1), p4=round(p4 * 100, 1),
                      min2_5=round(100 / (p2 * 100) * 1.05, 2), min3_5=round(100 / (p3 * 100) * 1.05, 2),
                      pick=verdict))
json.dump(board, open('bot-engine/data/card_board_2026-10-24.json', 'w'), indent=1)
print(f"\nwrote bot-engine/data/card_board_2026-10-24.json ({len(board)} fixtures)")
best = sorted(board, key=lambda b: -b['p3'])[:12]
print("\n=== TOP 12 CARD TARGETS BY REFEREE O3.5 RATE ===")
for b in best:
    print(f"  {b['date']} {b['ko']} {b['home']:22s} v {b['away']:22s} | {b['ref'][:24]:24s} "
          f"Y/g {b['ref_ypg']:<5} O3.5 {b['ref_o35']:>3}% (n={b['ref_games']}) | "
          f"P>2.5 {b['p2']}% P>3.5 {b['p3']}% | min px {b['min2_5']} / {b['min3_5']}")

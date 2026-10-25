#!/usr/bin/env python3
"""
BUFFER vs NO BUFFER — what does the buffer actually cost in multiplier?
=============================================================
The buffer raises the hit rate per leg (Saturday: 63% -> 89% on cards) but
each buffered leg pays LESS, so building a N100,000 ticket needs MORE legs.
Sunday has only 19 fixtures, so there is a hard ceiling.

This runs the Sunday board TWICE — once with the buffer, once without — and
compares the whole shape ladder side by side, plus the real-price EV impact.
"""
import json, collections, statistics as st, math, re, unicodedata, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
DATE = '2026-10-25'
sys.path.insert(0, HERE)

import importlib.util
spec = importlib.util.spec_from_file_location('sun_atk', os.path.join(HERE, 'sunday_attack_2026_10_25.py'))
# we can't import the module (it runs at import), so re-implement the builder here
import fouls_board as FB

cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
ref_cards = collections.defaultdict(list)
league = []
for mid, m in cache.items():
    y = m.get('yellows') or []
    if len(y) != 2:
        continue
    league.append(y[0] + y[1])
    r = (m.get('referee') or {}).get('name')
    if r and (m.get('utcTime') or '')[:10] < '2026-10-24':
        ref_cards[r].append(y[0] + y[1])
THRESH = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]


def fit(xs, ys):
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den if den else 0
    return my - b * mx, b


pts = []
for r, v in ref_cards.items():
    if len(v) < 4:
        continue
    pts.append((100 * sum(1 for x in v if x > 3.5) / len(v),
                [100 * sum(1 for x in v if x > t) / len(v) for t in THRESH]))
p35s = [p[0] for p in pts]
REG = {t: fit(p35s, [p[1][i] for p in pts]) for i, t in enumerate(THRESH)}
LEAG = {t: sum(1 for x in league if x > t) / len(league) for t in THRESH}


def card_prob(thr, p35):
    if p35 is None:
        return LEAG[thr]
    a, b = REG[thr]
    return max(0.0, min(1.0, (a + b * p35) / 100.0))


_ms = []
for _mid, _m in cache.items():
    _f = _m.get('fouls') or []
    if len(_f) == 2:
        _ms.append({'fh': _f[0], 'fa': _f[1]})
SIZE_MATCH = FB.fit_size([x['fh'] + x['fa'] for x in _ms])
SIZE_TEAM = FB.fit_size([v for x in _ms for v in (x['fh'], x['fa'])])
fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
refman = {r['name']: r for r in man['referees']}


def build(buffered):
    legs = []
    for f in man['weekend_fixtures']:
        if f.get('date') != DATE:
            continue
        ref = (f.get('referee') or {}).get('name')
        r = refman.get(ref) or {}
        mu, o35, games = r.get('avg_yellows'), r.get('over_3_5'), r.get('games')
        if mu is None or o35 is None:
            continue
        if o35 <= 0:
            o35 = 1
        probs = {t: card_prob(t, o35) for t in THRESH}
        ml = None
        for t in [3.5, 2.5, 1.5, 0.5]:
            if probs[t] >= 0.55:
                ml = t
                break
        if ml is None:
            continue
        ln = ml - 1.0 if buffered else ml
        if ln < 0.5:
            continue
        p = probs[ln]
        if p < 0.55:
            continue
        q = max(0.05, p - 0.014)
        legs.append(dict(market='Cards', line=f'O{ln}', fx=f"{f.get('home_name')} v {f.get('away_name')}",
                         ko=f.get('kickoff_time'), prob=p,
                         plan=round(max(1.02, min(1 / q, 1 / p * 1.6)), 2),
                         model_line=ml))
    MATCH_BY_FX = {m['fx']: m for m in fb['matches']}
    for m in fb['matches']:
        if m['date'] != DATE:
            continue
        full = {}
        for ln in [x * 0.5 + 0.5 for x in range(29, 60)]:
            pp = FB.over_pmf(m['lam_m'], SIZE_MATCH, ln)
            full[ln] = pp
        ml = None
        for ln in sorted(full):
            if full[ln] >= 0.62:
                ml = ln
        if ml is None:
            continue
        ln = ml - 1.0 if buffered else ml
        if ln < 15.5:
            continue
        p = full[ln]
        if p < 0.55:
            continue
        q = max(0.05, p + 0.015)
        legs.append(dict(market='Fouls (total)', line=f'O{ln}', fx=m['fx'], ko=m['ko'],
                         prob=p, plan=round(max(1.02, min(1 / q, 1 / p * 1.6)), 2),
                         model_line=ml))
    for m in fb['team_fouls']:
        if m['date'] != DATE:
            continue
        _mr = MATCH_BY_FX.get(m['fx']) or {}
        side = m['side']
        lam = _mr.get('lam_a') if side == 'AWAY' else _mr.get('lam_h')
        if lam is None:
            continue
        full = {ln: FB.over_pmf(lam, SIZE_TEAM, ln)
                for ln in [x * 0.5 + 0.5 for x in range(13, 34)]}
        ml = None
        for ln in sorted(full):
            if full[ln] >= 0.62:
                ml = ln
        if ml is None:
            continue
        ln = ml - 1.0 if buffered else ml
        if ln < 5.5:
            continue
        p = full[ln]
        if p < 0.55:
            continue
        q = max(0.05, p + 0.015)
        legs.append(dict(market='Fouls (team)', line=f'O{ln} {side}', fx=m['fx'], ko=m['ko'],
                         prob=p, plan=round(max(1.02, min(1 / q, 1 / p * 1.6)), 2),
                         model_line=ml))
    return legs


from model_only_slip import solve_targets

TARGETS = [3.0, 5.0, 10.0, 25.0, 50.0, 100.0, 200.0, 300.0]
print('=' * 78)
print('SUNDAY 25 OCT — BUFFERED vs UNBUFFERED, the whole ladder')
print('=' * 78)
print(f"{'target':>7s} | {'BUFFERED':>34s} | {'NO BUFFER':>34s}")
print(f"{'':>7s} | {'legs':>4s} {'product':>8s} {'joint':>8s} {'payout':>9s} | "
      f"{'legs':>4s} {'product':>8s} {'joint':>8s} {'payout':>9s}")
rb = solve_targets(build(True), TARGETS, max_prod=900.0)
rn = solve_targets(build(False), TARGETS, max_prod=900.0)
for t in TARGETS:
    a = rb.get(t); b = rn.get(t)
    sa = (f'{len(a[1]):4d} {a[2]:7.2f}x {a[0]*100:7.3f}% N{500*a[2]:8,.0f}' if a else ' '*34)
    sb = (f'{len(b[1]):4d} {b[2]:7.2f}x {b[0]*100:7.3f}% N{500*b[2]:8,.0f}' if b else ' '*34)
    print(f'{t:6.0f}x | {sa} | {sb}')

print()
print('=' * 78)
print('THE TRADE, IN ONE LINE EACH')
print('=' * 78)
lb, ln_ = build(True), build(False)
mb = st.mean([x['prob'] for x in lb]); mn = st.mean([x['prob'] for x in ln_])
pb = math.exp(sum(math.log(x['plan']) for x in lb)); pn = math.exp(sum(math.log(x['plan']) for x in ln_))
print(f'  mean probability per leg :  buffered {mb*100:.1f}%   unbuffered {mn*100:.1f}%')
print(f'  full-board multiplier    :  buffered {pb:,.1f}x   unbuffered {pn:,.1f}x')
print(f'  available fixtures       :  {len(set(x["fx"] for x in lb))}')
print()
a = rb.get(200.0); b = rn.get(200.0)
if a and b:
    print(f'  At the N100,000 target:')
    print(f'    BUFFERED   {len(a[1])} legs, {a[2]:.2f}x, lands {a[0]*100:.3f}% (1 in {1/a[0]:,.0f})')
    print(f'    NO BUFFER  {len(b[1])} legs, {b[2]:.2f}x, lands {b[0]*100:.3f}% (1 in {1/b[0]:,.0f})')
print()
print('  ** With only 19 fixtures, the buffered N100,000 ticket is capped at 19 legs.')
print('     The buffer buys per-leg safety but spends the multiplier needed to')
print('     reach 200x — so for the N100,000 goal the buffer can actually LOSE')
print('     you the hit rate. Where the buffer clearly wins is the SMALLER')
print('     targets, where leg count is not the binding constraint. **')

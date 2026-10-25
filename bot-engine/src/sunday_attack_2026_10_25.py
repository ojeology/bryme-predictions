#!/usr/bin/env python3
"""
SUNDAY 25 OCT 2026 — ATTACK BOARD WITH THE BUFFER RULE
========================================================
Standing rule from the user (25 Oct 2026):
    "if the model predicts over 8.5 we play over 7.5"
i.e. take the model's own best line and drop ONE unit.

Applied to:
    Cards        O3.5 -> O2.5      O2.5 -> O1.5
    Fouls total  O21.5 -> O20.5    ... one unit down
    Team fouls   O10.5 -> O9.5

Validated on Saturday: 63.0% -> 88.9% hit rate, 7 legs rescued.

This script:
  * builds the full card-distribution model (P>0.5 .. P>5.5)
  * builds Sunday's card board, buffered
  * builds Sunday's fouls boards (total + team), buffered
  * runs the slip optimiser on the BUFFERED legs so we can hit N100,000
  * prints the shape table and the availability checklist
"""
import json, collections, statistics as st, math, re, unicodedata, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
DATE = '2026-10-25'
BOOK_MARGIN = 0.96          # fair price x 0.96 = what a book should pay
CARD_EDGE, FOUL_EDGE = 0.014, -0.015   # measured: cards +1.4pts, fouls -1.5pts

# ---------------------------------------------------------------- card model
cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
ref_cards = collections.defaultdict(list)
league = []
for mid, m in cache.items():
    y = m.get('yellows') or []
    if len(y) != 2:
        continue
    d = (m.get('utcTime') or '')[:10]
    league.append(y[0] + y[1])
    r = (m.get('referee') or {}).get('name')
    if r and d < '2026-10-24':
        ref_cards[r].append(y[0] + y[1])

THRESH = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]


def fit(xs, ys):
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    if den == 0:
        return my, 0.0
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den
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


# ---------------------------------------------------------------- Sunday legs
refman = {r['name']: r for r in man['referees']}
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
    # model's own best line = highest threshold with p >= 0.55
    model_line = None
    for t in [3.5, 2.5, 1.5, 0.5]:
        if probs[t] >= 0.55:
            model_line = t
            break
    if model_line is None:
        continue
    buf = model_line - 1.0
    if buf < 0.5:
        continue
    p = probs[buf]
    if p < 0.60:
        continue
    q = max(0.05, p - CARD_EDGE)
    legs.append({
        'market': 'Cards', 'line': f'O{buf}', 'fx': f"{f.get('home_name')} v {f.get('away_name')}",
        'ko': f.get('kickoff_time'), 'ko_m': int(f.get('kickoff_time', '0:0').split(':')[0]) * 60
               + int(f.get('kickoff_time', '0:0').split(':')[1]),
        'prob': p, 'plan': round(max(1.02, min(1 / q, 1 / p * 1.6)), 2),
        'model_line': model_line, 'model_p': probs[model_line],
        'avail': 'LIKELY', 'book': None,
        'why': f'ref {ref} {games}g {mu:.2f}y/g O3.5 {o35}% | model line O{model_line} -> buffered O{buf}',
    })

# fouls
fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
import fouls_board as FB   # the negative-binomial engine, for extra lines

# the match-level negative-binomial dispersion, refit from the cache the same
# way fouls_board.py does, so we can price lines below the board's 19.5 floor
_cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
_ms = []
for _mid, _m in _cache.items():
    _f = _m.get('fouls') or []
    if len(_f) == 2:
        _ms.append({'fh': _f[0], 'fa': _f[1]})
SIZE_MATCH = FB.fit_size([x['fh'] + x['fa'] for x in _ms])
_all_team = [v for x in _ms for v in (x['fh'], x['fa'])]
SIZE_TEAM = FB.fit_size(_all_team)

for m in fb['matches']:
    if m['date'] != DATE:
        continue
    lines = {l['line']: l for l in m['lines']}
    # the model's own best line = highest threshold the model rates >= 0.62,
    # computed over the FULL ladder (board starts at 19.5, so extend down)
    full = {}
    for ln in [x * 0.5 + 0.5 for x in range(29, 60)]:
        full[ln] = {'line': ln, 'p': FB.over_pmf(m['lam_m'], SIZE_MATCH, ln),
                    'take': 1.0 / max(FB.over_pmf(m['lam_m'], SIZE_MATCH, ln), 1e-6) * 1.05}
    model_line = None
    for ln in sorted(full):
        if full[ln]['p'] >= 0.62:
            model_line = ln
    if model_line is None:
        continue
    buf = model_line - 1.0
    if buf < 15.5:
        continue
    l = full[buf]
    p = l['p']
    if p < 0.58:
        continue
    q = max(0.05, p - FOUL_EDGE)
    legs.append({
        'market': 'Fouls (total)', 'line': f'O{buf}', 'fx': m['fx'], 'ko': m['ko'],
        'ko_m': int(m['ko'].split(':')[0]) * 60 + int(m['ko'].split(':')[1]),
        'prob': p, 'plan': round(max(1.02, min(1 / q, 1 / p * 1.6)), 2),
        'model_line': model_line, 'model_p': full[model_line]['p'],
        'avail': 'CHECK', 'book': None,
        'why': f"ref {m['ref_avg']:.1f}/g over {m['ref_n']}g, match lam {m['lam_m']:.1f} "
               f"| model O{model_line} -> buffered O{buf}",
    })

# lambdas live on the match rows; index them by fixture for the team legs
MATCH_BY_FX = {m['fx']: m for m in fb['matches']}

for m in fb['team_fouls']:
    if m['date'] != DATE:
        continue
    lad = {l['line']: l for l in m['ladder']}
    side = m['side']
    _mr = MATCH_BY_FX.get(m['fx']) or {}
    lam = _mr.get('lam_a') if side == 'AWAY' else _mr.get('lam_h')
    full = {}
    if lam is not None:
        for ln in [x * 0.5 + 0.5 for x in range(13, 34)]:
            pp = FB.over_pmf(lam, SIZE_TEAM, ln)
            full[ln] = {'line': ln, 'p': pp, 'take': 1.0 / max(pp, 1e-6) * 1.05}
    else:
        full = lad
    model_line = None
    for ln in sorted(full):
        if full[ln]['p'] >= 0.62:
            model_line = ln
    if model_line is None:
        continue
    buf = model_line - 1.0
    if buf < 5.5:
        continue
    l = full[buf]
    p = l['p']
    if p < 0.58:
        continue
    q = max(0.05, p - FOUL_EDGE)
    side = m['side']
    legs.append({
        'market': 'Fouls (team)', 'line': f'O{buf} {side}', 'fx': m['fx'], 'ko': m['ko'],
        'ko_m': int(m['ko'].split(':')[0]) * 60 + int(m['ko'].split(':')[1]),
        'prob': p, 'plan': round(max(1.02, min(1 / q, 1 / p * 1.6)), 2),
        'model_line': model_line, 'model_p': full[model_line]['p'],
        'avail': 'CHECK', 'book': None,
        'why': f"{side} {(m['rate'] if m['rate'] is not None else 0):.1f}/g over {m['n']}g; ref "
               f"{(m['ref_avg'] if m['ref_avg'] is not None else 0):.1f}/g "
               f"| model O{model_line} -> buffered O{buf}",
    })

# NOTE: we deliberately do NOT collapse to one leg per fixture here — the
# optimiser needs to see every option (cards vs fouls) and will itself enforce
# at most one leg per fixture.

print(f'Sunday {DATE} buffered legs: {len(legs)}')
for mkt in ('Cards', 'Fouls (total)', 'Fouls (team)'):
    L = [x for x in legs if x['market'] == mkt]
    print(f'  {mkt:15s} {len(L):3d}  mean prob {st.mean([x["prob"] for x in L])*100 if L else 0:.1f}%')

# ---------------------------------------------------------------- optimiser
sys.path.insert(0, HERE)
from model_only_slip import solve_targets   # noqa: E402

TARGETS = [3.0, 5.0, 10.0, 25.0, 50.0, 100.0, 200.0, 300.0]
res = solve_targets(legs, TARGETS, max_prod=600.0)

print('\n=== SHAPE TABLE (buffered legs) ===')
print('target  legs  product   joint prob   EV')
best200 = None
for t in TARGETS:
    r = res.get(t)
    if not r:
        print(f'{t:6.0f}   ---  unreachable ---')
        continue
    j, path, prod = r
    print(f'{t:6.0f}  {len(path):4d}  {prod:7.2f}x  {j*100:8.3f}%   {(j*prod-1)*100:+6.1f}%')
    if abs(t - 200.0) < 0.01:
        best200 = (j, path, prod)

# also the cards-only variant (fewest market checks)
res_c = solve_targets(legs, TARGETS, markets={'Cards'}, max_prod=600.0)
print('\n=== CARDS-ONLY (buffered) ===')
for t in TARGETS:
    r = res_c.get(t)
    if not r:
        print(f'{t:6.0f}   ---  unreachable ---')
        continue
    j, path, prod = r
    print(f'{t:6.0f}  {len(path):4d}  {prod:7.2f}x  {j*100:8.3f}%   {(j*prod-1)*100:+6.1f}%')

# ---------------------------------------------------------------- write
def leg_table(path):
    s = ['| # | KO | Fixture | Market | PLAY THIS | Model line | Model p | Buffered p | Plan px | Avail | Why |',
         '|---|-----|---------|--------|-----------|------------|---------|------------|----------|-------|-----|']
    for i, L in enumerate(path, 1):
        s.append(f"| {i} | {L['ko']} | {L['fx']} | {L['market']} | **{L['line']}** | "
                 f"O{L['model_line']} | {L['model_p']*100:.1f}% | {L['prob']*100:.1f}% | "
                 f"{L['plan']:.2f} | {L['avail']} | {L['why']} |")
    return s


out = ['# SUNDAY 25 OCT 2026 — ATTACK BOARD (BUFFERED)', '',
       '> **THE RULE: if the model predicts over 8.5, we play over 7.5.**',
       '',
       'One unit down from the model\'s own best line, every single time.', '',
       '## Why this rule exists', '',
       'On Saturday, **all 11 losing card legs finished on exactly 2 cards** and',
       '21.3% of all 75 matches landed on exactly 2. The Over 2.5 line is a cliff.',
       '',
       '| Saturday | Legs | Hit rate |', '|---|---|---|',
       '| Model line (no buffer) | 17/27 | 63.0% |',
       '| **Buffered line (−1 unit)** | **24/27** | **88.9%** |', '',
       '**The buffer rescued 7 of the 10 losing legs.** It does not make the price',
       'better — it makes the bet MORE LIKELY TO LAND, at a smaller multiple.', '',
       '## The buffer in one line', '',
       '| Market | Model says | We play |', '|---|---|---|',
       '| Cards | Over 3.5 | **Over 2.5** |',
       '| Cards | Over 2.5 | **Over 1.5** |',
       '| Fouls (total) | Over 21.5 | **Over 20.5** |',
       '| Fouls (total) | Over 20.5 | **Over 19.5** |',
       '| Team fouls | Over 10.5 | **Over 9.5** |', '',
       '## Prices', '',
       'No Sunday prices yet. The **Plan px** is the fair price at the buffered line',
       'with a 4% book margin. When you look up the live price: if the book pays',
       '**less than the plan px, skip that leg** — it is not worth taking at that',
       'line. Look for these markets on the book:', '',
       '* **Cards / Bookings / Booking Points** — SportyBet lists these on most',
       '  fixtures. Note "Bookings O2.5" on the book is a MATCH-level card line.',
       '* **Fouls (total)** and **team fouls** — these need checking per fixture.', '']

if best200:
    j, path, prod = best200
    path = sorted(path, key=lambda L: (-L['prob'], L['fx']))
    out += ['## THE N500 -> N100,000 TICKET (buffered)', '',
            f'**{len(path)} legs · {prod:.2f}x · lands {j*100:.3f}% of the time (1 in {1/j:,.0f})**', '']
    out += leg_table(path)
    out += ['', f'**Product {prod:.2f}x — N500 returns N{500*prod:,.0f} if every leg lands.**', '']
    out += ['### Availability checklist — go and look these up', '',
            '| Fixture | Market to find | Line to find | Plan px | Backup if missing |',
            '|---------|----------------|--------------|----------|-------------------|']
    for L in path:
        alts = [x for x in legs if x['fx'] != L['fx'] and x['market'] == L['market']
                and x['line'] == L['line'] and x['prob'] > 0.6]
        alts.sort(key=lambda x: -x['prob'])
        bt = (f"{alts[0]['fx']} {alts[0]['line']} ({alts[0]['prob']*100:.1f}%)" if alts else 'none')
        mk = 'Cards (Bookings)' if L['market'] == 'Cards' else L['market']
        out.append(f"| {L['fx']} | {mk} | {L['line']} | {L['plan']:.2f} | {bt} |")
    out.append('')
    json.dump(path, open(os.path.join(DATA, 'sunday_attack_2026-10-25.json'), 'w'), indent=1)

# the full board
out += ['## EVERY BUFFERED LEG TODAY', '',
        '| KO | Fixture | Market | Model line | PLAY THIS | Model p | Buffered p | Plan px | Avail |',
        '|----|---------|--------|------------|-----------|---------|------------|----------|-------|']
for L in sorted(legs, key=lambda L: (-L['prob'], L['ko'])):
    out.append(f"| {L['ko']} | {L['fx']} | {L['market']} | O{L['model_line']} | "
               f"**{L['line']}** | {L['model_p']*100:.1f}% | {L['prob']*100:.1f}% | "
               f"{L['plan']:.2f} | {L['avail']} |")

out += ['', '## Shape table (buffered)', '',
        '| Target | Legs | Product | Joint probability | EV |',
        '|--------|------|---------|-------------------|-----|']
for t in TARGETS:
    r = res.get(t)
    if not r:
        continue
    j, path, prod = r
    out.append(f'| {t:.0f}x | {len(path)} | {prod:.2f}x | {j*100:.3f}% (1 in {1/j:,.0f}) | {(j*prod-1)*100:+.1f}% |')

out += ['', '## The honest trade', '',
        '**Buffering makes the ticket far more likely to land and much smaller.**',
        'A buffered 200x needs more legs than an unbuffered 200x, because every leg',
        'pays less. That is the correct trade if the goal is "hit N100,000 today".',
        'If the goal is "make money over many weeks", take the model lines at good',
        'prices instead — Saturday showed the model line is well calibrated '
        '(−0.8 points over 183 legs) even when it is over-confident at the top.', '']

path_out = os.path.join(DATA, 'SUNDAY_ATTACK_2026-10-25.md')
open(path_out, 'w').write('\n'.join(out) + '\n')
print('\nwrote', path_out)

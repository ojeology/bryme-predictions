#!/usr/bin/env python3
"""Diagnostics: why did the richer form feature sets collapse, and does an
explicit HOT-AWAY x COLD-HOME interaction term calibrate the subset?"""
import json, os, math, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
sys.path.insert(0, HERE)
from form_1x2_model import (load_matches, build_rows, fv, dcvec, label, fit_lr,
                            score3, HOT_THR)

ms = load_matches()
rows, _, _ = build_rows(ms)
preds = json.load(open(os.path.join(DATA, 'goals_walkforward_preds.json')))
dc = {(p['m']['home'], p['m']['away'], p['m']['date']): p for p in preds}
half = len(rows) // 2
tr = [r for r in rows if r['idx'] < half and dcvec(r, dc)]
te = [r for r in rows if r['idx'] >= half and dcvec(r, dc)]
ytr = [label(r) for r in tr]; yte = [label(r) for r in te]

print('=== hold-out log loss, every feature set x penalty ===')
for fs in ('A', 'G', 'H', 'I', 'J', 'K', 'L'):
    line = []
    for C in (0.05, 0.1, 0.3, 1.0, 3.0, 10.0):
        pipe = fit_lr([fv(r, fs) for r in tr], ytr, C=C)
        s = score3(pipe.predict_proba([fv(r, fs) for r in te]), yte)
        line.append(f'C={C:<5g} ll {s["logloss"]:.4f} acc {s["acc"]:.3f}')
    print(f'  fs {fs}: ' + ' | '.join(line))

print('\n=== rating model alone on the same hold-out ===')
P1 = np.array([[dc[(r['home'], r['away'], r['date'])]['home'],
                dc[(r['home'], r['away'], r['date'])]['draw'],
                dc[(r['home'], r['away'], r['date'])]['away']] for r in te])
s = score3(P1, yte)
print(f'  M1 rating: log loss {s["logloss"]:.4f}  Brier {s["brier"]:.4f}  acc {s["acc"]:.3f}')

# --------- explicit interaction: hot away x cold home
def fv2(r):
    hf, af = r['hf'], r['af']
    hl5 = hf['l5'] or 0.0
    al5 = af['l5'] or 0.0
    hot = 1.0 if al5 >= HOT_THR else 0.0
    cold = 1.0 if hl5 <= 1.0 else 0.0
    return [al5, hl5, hot, cold, hot * cold]


def is_hot(r, side, thr=HOT_THR):
    v = (r['hf'] if side == 'h' else r['af'])['l5']
    return v is not None and v >= thr


def is_bottom(r, side, frac=2 / 3, min_games=4):
    f = r['hf'] if side == 'h' else r['af']
    pos, nt, lg = f.get('pos'), f.get('nt'), f.get('league_g')
    if not pos or not nt or (lg or 0) < min_games:
        return False
    return pos > frac * nt


print('\n=== rating + form + HOT-AWAY x COLD-HOME interaction ===')
for C in (0.05, 0.1, 0.3, 1.0, 3.0):
    Xtr = [dcvec(r, dc) + fv2(r) for r in tr]
    Xte = [dcvec(r, dc) + fv2(r) for r in te]
    pipe = fit_lr(Xtr, ytr, C=C)
    P = pipe.predict_proba(Xte)
    s = score3(P, yte)
    sub = [(P[i], r) for i, r in enumerate(te) if is_hot(r, 'a') and is_bottom(r, 'h')]
    if sub:
        mp = sum(p[2] for p, r in sub) / len(sub)
        mx = sum(p[1] + p[2] for p, r in sub) / len(sub)
        aw = sum(1 for p, r in sub if r['hs'] < r['as_']) / len(sub)
        x2 = sum(1 for p, r in sub if r['hs'] <= r['as_']) / len(sub)
        print(f'  C={C:<5g} log loss {s["logloss"]:.4f} acc {s["acc"]:.3f} | subset n={len(sub)} '
              f'model P(away) {mp:.1%} model P(X2) {mx:.1%} | ACTUAL away {aw:.1%} X2 {x2:.1%}')

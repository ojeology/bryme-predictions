#!/usr/bin/env python3
"""Blend weight between the rating model and the rating+form model.
Hold-out scored; also checks calibration on the hot-away/bottom-home subset."""
import json, os, math, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); DATA = os.path.join(HERE, '..', 'data')
sys.path.insert(0, HERE)
from form_1x2_model import (load_matches, build_rows, dcvec, label, fit_lr, score3,
                            HOT_THR, BOTTOM_FRAC, NEUTRAL_PPG)
from form_1x2_board import final_vec

ms = load_matches(); rows, _, _ = build_rows(ms)
preds = json.load(open(os.path.join(DATA, 'goals_walkforward_preds.json')))
dc = {(p['m']['home'], p['m']['away'], p['m']['date']): p for p in preds}
half = len(rows) // 2
tr = [r for r in rows if r['idx'] < half and dcvec(r, dc)]
te = [r for r in rows if r['idx'] >= half and dcvec(r, dc)]
ytr = [label(r) for r in tr]; yte = [label(r) for r in te]

def hot(r, side):
    v = (r['hf'] if side == 'h' else r['af'])['l5']
    return v is not None and v >= HOT_THR
def bottom(r, side):
    f = r['hf'] if side == 'h' else r['af']
    pos, nt, lg = f.get('pos'), f.get('nt'), f.get('league_g')
    if not pos or not nt or (lg or 0) < 4: return False
    return pos > BOTTOM_FRAC * nt

P1 = np.array([[dc[(r['home'], r['away'], r['date'])]['home'],
                dc[(r['home'], r['away'], r['date'])]['draw'],
                dc[(r['home'], r['away'], r['date'])]['away']] for r in te])
print(f'{"C":>6} {"w":>5} {"logloss":>8} {"acc":>6} | subset n  model/actual P(away)  model/actual X2')
for C in (0.02, 0.05, 0.2, 1.0):
    pipe = fit_lr([final_vec(r, dc[(r['home'], r['away'], r['date'])]) for r in tr], ytr, C=C)
    PF = pipe.predict_proba([final_vec(r, dc[(r['home'], r['away'], r['date'])]) for r in te])
    for w in (0.0, 0.25, 0.5, 0.75, 1.0):
        P = (1 - w) * P1 + w * PF
        s = score3(P, yte)
        idx = [i for i, r in enumerate(te) if hot(r, 'a') and bottom(r, 'h')]
        if idx:
            mp = sum(P[i][2] for i in idx) / len(idx)
            mx = sum(P[i][1] + P[i][2] for i in idx) / len(idx)
            aw = sum(1 for i in idx if yte[i] == 2) / len(idx)
            x2 = sum(1 for i in idx if yte[i] in (1, 2)) / len(idx)
            txt = f'| {len(idx):4d}  {mp:.1%}/{aw:.1%}  {mx:.1%}/{x2:.1%}'
        else:
            txt = ''
        print(f'{C:6g} {w:5g} {s["logloss"]:8.4f} {s["acc"]:6.3f} {txt}')

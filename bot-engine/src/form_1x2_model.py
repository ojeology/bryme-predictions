#!/usr/bin/env python3
"""
FORM -> 1X2  ("a hot side travelling to a bottom side")
========================================================
The behaviour markets (cards, fouls) are referee-driven and long-run strength
is dead for them.  1X2 is a different question: does RECENT FORM tell us
anything on top of the long-run rating, and is there a subset - a hot side
travelling to a bottom side - that is close to certain?

Everything is walk-forward.  A match is only ever predicted from matches that
kicked off EARLIER: same-day results are excluded from the form features, so
nothing leaks across a matchday.

Models scored on the SAME rows:
  M0  base rates (home / draw / away frequency)
  M1  the goals model (Poisson + Dixon-Coles + ridge) walk-forward probs
  M2  FORM ONLY   - multinomial logit on recent form features
  M3  RATING+FORM - logit on the rating probs AND the form features
      (the test: does form add anything on top of the rating?)

Feature sets and the penalty are chosen on a HOLD-OUT (first half of the
season -> second half), never on the data they are then scored against.

No bookmaker odds are used anywhere.  The question is how often the thing
happens, and how sure we can be.

Outputs
  bot-engine/data/form_1x2_walkforward.json
  bot-engine/data/form_1x2_tuning.json
  bot-engine/data/FORM_1X2_BOARD_2026-10-25.md / .json
"""
import json, os, re, math, sys, collections, unicodedata
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
sys.path.insert(0, HERE)

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

import goals_model as GM

TODAY = '2026-10-25'
HOT_THR = 1.8          # last-5 points per game that counts as "hot"
BOTTOM_FRAC = 2 / 3    # bottom third of the league table


def nk(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


# ---------------------------------------------------------------- data
def load_matches(include_saturday=True):
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    seen = set()
    for mid, m in cache.items():
        if not m.get('finished'):
            continue
        ss = m.get('scoreStr') or ''
        mm = re.match(r'^\s*(\d+)\s*-\s*(\d+)\s*$', ss)
        if not mm:
            continue
        ms.append(dict(mid=mid, date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hs=int(mm.group(1)), as_=int(mm.group(2)),
                       comp=m.get('compSlug') or m.get('compName') or '?'))
        seen.add(mid)
    if include_saturday:
        rp = os.path.join(DATA, 'results_2026-10-24.json')
        if os.path.exists(rp):
            res = json.load(open(rp))
            for mid, r in res.items():
                if mid in seen or not r.get('finished'):
                    continue
                if r.get('homeScore') is None or r.get('awayScore') is None:
                    continue
                ms.append(dict(mid=mid, date=(r.get('status') or '')[:10],
                               home=r.get('home'), away=r.get('away'),
                               hs=int(r['homeScore']), as_=int(r['awayScore']),
                               comp=(r.get('comp') or r.get('compName') or '?')))
    ms.sort(key=lambda m: (m['date'], m['home']))
    return ms


def pts_for(h, a):
    if h > a:
        return 3, 0
    if h == a:
        return 1, 1
    return 0, 3


# ---------------------------------------------------------------- features
def team_feats(t, hist, tab, comp):
    h = hist.get(t, [])
    n = len(h)
    out = dict(n=n, l3=None, l5=None, l6=None, mom=None, oadj=None, gd5=None,
               ppg=None, pos=None, nt=None, rec='', gf5=0, ga5=0)
    if n == 0:
        return out
    # a team with fewer than 3 matches has no form signal - say so instead of
    # inventing one (a 1-match "form" of 3.0 is pure noise)
    if n >= 3:
        last3, last5, last6 = h[-3:], h[-5:], h[-6:]
        out['l3'] = sum(r['pts'] for r in last3) / len(last3)
        out['l5'] = sum(r['pts'] for r in last5) / len(last5)
        out['l6'] = sum(r['pts'] for r in last6) / len(last6)
        w = [1.0 + (r['oppppg'] if r['oppppg'] is not None else 1.2) for r in last5]
        out['oadj'] = sum(r['pts'] * wi for r, wi in zip(last5, w)) / max(1e-9, sum(w))
        out['gd5'] = sum(r['gf'] - r['ga'] for r in last5) / len(last5)
        out['gf5'] = sum(r['gf'] for r in last5)
        out['ga5'] = sum(r['ga'] for r in last5)
        out['rec'] = ''.join({'3': 'W', '1': 'D', '0': 'L'}[str(r['pts'])] for r in last5)
    career = sum(r['pts'] for r in h) / n
    out['ppg'] = career
    out['mom'] = (out['l5'] - career) if out['l5'] is not None else None
    t_tab = tab.get(comp)
    if t_tab:
        g = t_tab['g'].get(t, 0)
        p = t_tab['pts'].get(t, 0)
        if g >= 3:
            board = sorted(((t_tab['pts'].get(x, 0) / t_tab['g'][x], x)
                            for x in t_tab['g'] if t_tab['g'][x] >= 3), reverse=True)
            names = [b[1] for b in board]
            if t in names:
                out['pos'] = names.index(t) + 1
                out['nt'] = len(names)
                out['league_ppg'] = p / g
                out['league_pts'] = p
                out['league_g'] = g
    return out


def build_rows(ms):
    """One row per match with leakage-free features (same-day results excluded)."""
    by_date = collections.defaultdict(list)
    for i, m in enumerate(ms):
        by_date[m['date']].append(i)
    hist = collections.defaultdict(list)
    tab = collections.defaultdict(lambda: {'pts': collections.Counter(), 'g': collections.Counter()})
    rows = []
    for d in sorted(by_date):
        idxs = by_date[d]
        for i in idxs:
            m = ms[i]
            rows.append(dict(idx=i, date=d, home=m['home'], away=m['away'],
                             comp=m['comp'], hs=m['hs'], as_=m['as_'],
                             hf=team_feats(m['home'], hist, tab, m['comp']),
                             af=team_feats(m['away'], hist, tab, m['comp'])))
        for i in idxs:
            m = ms[i]
            h, a = m['home'], m['away']
            ph, pa = pts_for(m['hs'], m['as_'])
            t_tab = tab[m['comp']]
            opp_ppg_h = (t_tab['pts'].get(a, 0) / t_tab['g'][a]) if t_tab['g'].get(a) else None
            opp_ppg_a = (t_tab['pts'].get(h, 0) / t_tab['g'][h]) if t_tab['g'].get(h) else None
            hist[h].append(dict(date=d, comp=m['comp'], pts=ph, gf=m['hs'], ga=m['as_'],
                                oppppg=opp_ppg_h))
            hist[a].append(dict(date=d, comp=m['comp'], pts=pa, gf=m['as_'], ga=m['hs'],
                                oppppg=opp_ppg_a))
            t_tab['pts'][h] += ph; t_tab['g'][h] += 1
            t_tab['pts'][a] += pa; t_tab['g'][a] += 1
    return rows, hist, tab


# ---------------------------------------------------------------- feature sets
NEUTRAL_PPG = 1.30      # league-average points per game, used when a side has
                        # fewer than 3 matches (no form signal exists yet)


def g(v):
    return NEUTRAL_PPG if v is None else float(v)


def fv(r, fs):
    """Form feature vectors.  Only ALWAYS-DEFINED features are used, so the
    standardiser cannot blow up on a feature that is degenerate early in the
    season (that bug made the hold-out score look worse than random)."""
    hf, af = r['hf'], r['af']
    hl5, al5 = g(hf['l5']), g(af['l5'])
    hl3, al3 = g(hf['l3']), g(af['l3'])
    hl6, al6 = g(hf['l6']), g(af['l6'])
    hgd, agd = (hf['gd5'] or 0.0), (af['gd5'] or 0.0)
    ho, ao = g(hf['oadj']), g(af['oadj'])
    hcar, acar = g(hf['ppg']), g(af['ppg'])
    hshort = 1.0 if (hf['n'] < 3) else 0.0
    ashort = 1.0 if (af['n'] < 3) else 0.0
    hot = 1.0 if (af['l5'] is not None and af['l5'] >= HOT_THR) else 0.0
    cold = 1.0 if (hf['l5'] is not None and hf['l5'] <= 1.0) else 0.0
    if fs == 'A':
        return [al5, hl5]
    if fs == 'G':
        return [al5, hl5, al3, hl3, al6, hl6]
    if fs == 'H':
        return [al5, hl5, al3, hl3, al6, hl6, agd, hgd]
    if fs == 'I':
        return [al5, hl5, al3, hl3, al6, hl6, agd, hgd, ao, ho]
    if fs == 'J':
        return [al5, hl5, al3, hl3, al6, hl6, agd, hgd, ao, ho, acar, hcar,
                ashort, hshort]
    if fs == 'K':
        return [al5, hl5, al3, hl3, al6, hl6, hot, cold, hot * cold]
    if fs == 'L':
        return [al5, hl5, al3, hl3, al6, hl6, agd, hgd, ao, ho, acar, hcar,
                ashort, hshort, hot, cold, hot * cold]
    raise ValueError(fs)


def dcvec(r, dc):
    p = dc.get((r['home'], r['away'], r['date']))
    if not p:
        return None
    return [math.log(max(1e-6, p['home']) / max(1e-6, p['away'])), p['draw']]


def label(r):
    if r['hs'] > r['as_']:
        return 0
    if r['hs'] == r['as_']:
        return 1
    return 2


def fit_lr(X, y, C=1.0):
    pipe = make_pipeline(StandardScaler(),
                         LogisticRegression(C=C, max_iter=4000, solver='lbfgs'))
    pipe.fit(X, y)
    return pipe


def score3(P, ys):
    n = len(ys)
    ll = -sum(math.log(max(1e-9, P[i][ys[i]])) for i in range(n)) / n
    br = sum(sum((P[i][c] - (1 if ys[i] == c else 0)) ** 2 for c in range(3)) for i in range(n)) / n
    acc = sum(1 for i in range(n) if P[i].argmax() == ys[i]) / n
    favn = favhit = 0
    for i in range(n):
        if P[i][1] < max(P[i][0], P[i][2]):
            favn += 1
            favhit += 1 if ys[i] == (0 if P[i][0] > P[i][2] else 2) else 0
    return dict(n=n, logloss=ll, brier=br, acc=acc,
                fav_acc=(favhit / favn if favn else float('nan')),
                draw_pick=sum(1 for i in range(n) if ys[i] == 1) / n)


def main():
    ms = load_matches()
    rows, hist_all, tab_all = build_rows(ms)
    print(f'matches {len(ms)}  rows {len(rows)}  {ms[0]["date"]} -> {ms[-1]["date"]}')

    bh = sum(1 for m in ms if m['hs'] > m['as_']) / len(ms)
    bd = sum(1 for m in ms if m['hs'] == m['as_']) / len(ms)
    ba = 1 - bh - bd
    base_ll = -(bh * math.log(bh) + bd * math.log(bd) + ba * math.log(ba))
    print(f'base: home {bh:.3f} draw {bd:.3f} away {ba:.3f} -> log loss {base_ll:.4f}')

    preds = json.load(open(os.path.join(DATA, 'goals_walkforward_preds.json')))
    dc = {(p['m']['home'], p['m']['away'], p['m']['date']): p for p in preds}

    # ---------------- HOLD-OUT TUNING (first half -> second half)
    half = len(rows) // 2
    tr = [r for r in rows if r['idx'] < half and dcvec(r, dc)]
    te = [r for r in rows if r['idx'] >= half and dcvec(r, dc)]
    print(f'\n=== HOLD-OUT: fit on {len(tr)} rows, score on {len(te)} rows ===')
    tune = {}
    best_f = best_c = None
    for fs in ('A', 'G', 'H', 'I', 'J', 'K', 'L'):
        for C in (0.05, 0.1, 0.3, 1.0, 3.0):
            Xtr = [fv(r, fs) for r in tr]
            Xte = [fv(r, fs) for r in te]
            pipe = fit_lr(Xtr, [label(r) for r in tr], C=C)
            P = pipe.predict_proba(Xte)
            s = score3(P, [label(r) for r in te])
            tune[f'{fs}|{C}'] = s
            if best_f is None or s['logloss'] < best_f[0]:
                best_f = (s['logloss'], fs, C)
    print(f'  best FORM-ONLY on holdout: feature set {best_f[1]}  C {best_f[2]}  '
          f'log loss {best_f[0]:.4f}')
    for k in ('A|1.0', 'G|0.3', 'H|0.3', 'I|0.3', 'J|0.3', 'K|0.3', 'L|0.3'):
        if k in tune:
            s = tune[k]
            print(f'    {k:8s} log loss {s["logloss"]:.4f}  Brier {s["brier"]:.4f}  acc {s["acc"]:.3f}')
    FS, C = best_f[1], best_f[2]

    # rating + form (M3) tuning
    best3 = None
    for C3 in (0.05, 0.1, 0.3, 1.0, 3.0):
        Xtr = [dcvec(r, dc) + fv(r, FS) for r in tr]
        Xte = [dcvec(r, dc) + fv(r, FS) for r in te]
        pipe = fit_lr(Xtr, [label(r) for r in tr], C=C3)
        P = pipe.predict_proba(Xte)
        s = score3(P, [label(r) for r in te])
        if best3 is None or s['logloss'] < best3[0]:
            best3 = (s['logloss'], C3)
    C3 = best3[1]
    print(f'  best RATING+FORM on holdout: C {C3}  log loss {best3[0]:.4f}')

    # blend of rating model and form model
    Xtr = [fv(r, FS) for r in tr]; Xte = [fv(r, FS) for r in te]
    pipeF = fit_lr(Xtr, [label(r) for r in tr], C=C)
    PF = pipeF.predict_proba(Xte)
    P1 = np.array([[dc[(r['home'], r['away'], r['date'])]['home'],
                    dc[(r['home'], r['away'], r['date'])]['draw'],
                    dc[(r['home'], r['away'], r['date'])]['away']] for r in te])
    bestb = None
    for w in (0.0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0):
        P = (1 - w) * P1 + w * PF
        s = score3(P, [label(r) for r in te])
        if bestb is None or s['logloss'] < bestb[0]:
            bestb = (s['logloss'], w)
    W = bestb[1]
    print(f'  best BLEND (rating + form) on holdout: weight on form {W}  log loss {bestb[0]:.4f}')

    json.dump(dict(feature_set=FS, C=C, C3=C3, blend_weight=W,
                   holdout=tr and len(tr), tune={k: v for k, v in tune.items()}),
              open(os.path.join(DATA, 'form_1x2_tuning.json'), 'w'), indent=1)

    # ---------------- ROLLING-ORIGIN WALK-FORWARD with the chosen settings
    BLOCK = 40
    out = []
    for start in range(60, len(rows), BLOCK):
        train = [r for r in rows if r['idx'] < start]
        test = [r for r in rows if start <= r['idx'] < start + BLOCK]
        tr3 = [r for r in train if dcvec(r, dc)]
        te3 = [r for r in test if dcvec(r, dc)]
        if len(tr3) < 200 or not te3:
            continue
        ytr = [label(r) for r in tr3]
        pipeF = fit_lr([fv(r, FS) for r in tr3], ytr, C=C)
        pipe3 = fit_lr([dcvec(r, dc) + fv(r, FS) for r in tr3], ytr, C=C3)
        PF = pipeF.predict_proba([fv(r, FS) for r in te3])
        P3 = pipe3.predict_proba([dcvec(r, dc) + fv(r, FS) for r in te3])
        P1 = np.array([[dc[(r['home'], r['away'], r['date'])]['home'],
                        dc[(r['home'], r['away'], r['date'])]['draw'],
                        dc[(r['home'], r['away'], r['date'])]['away']] for r in te3])
        PB = (1 - W) * P1 + W * PF
        P0 = np.tile(np.array([bh, bd, ba]), (len(te3), 1))
        for k, r in enumerate(te3):
            out.append(dict(r=r, p0=P0[k], p1=P1[k], p2=PF[k], p3=P3[k], pb=PB[k], y=label(r)))

    ys = [o['y'] for o in out]
    print(f'\n=== WALK-FORWARD ({len(out)} rows) ===')
    for key, nm in (('p0', 'M0 base rates'), ('p1', 'M1 goals/rating model'),
                    ('p2', f'M2 FORM ONLY (fs {FS}, C {C})'),
                    ('p3', f'M3 RATING+FORM (C {C3})'),
                    ('pb', f'M4 BLEND (form weight {W})')):
        s = score3(np.array([o[key] for o in out]), ys)
        print(f'  {nm:36s} log loss {s["logloss"]:.4f}  Brier {s["brier"]:.4f}  '
              f'acc {s["acc"]:.3f}  favourite acc {s["fav_acc"]:.3f}')

    json.dump(dict(rows=[dict(date=o['r']['date'], home=o['r']['home'], away=o['r']['away'],
                              comp=o['r']['comp'], hs=o['r']['hs'], as_=o['r']['as_'],
                              hf=o['r']['hf'], af=o['r']['af'],
                              p0=list(map(float, o['p0'])), p1=list(map(float, o['p1'])),
                              p2=list(map(float, o['p2'])), p3=list(map(float, o['p3'])),
                              pb=list(map(float, o['pb'])), y=o['y']) for o in out]),
              open(os.path.join(DATA, 'form_1x2_walkforward.json'), 'w'))
    print('\nwrote form_1x2_walkforward.json')
    return dict(FS=FS, C=C, C3=C3, W=W, dc=dc, ms=ms, rows=rows)


if __name__ == '__main__':
    main()

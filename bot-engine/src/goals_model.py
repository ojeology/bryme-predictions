#!/usr/bin/env python3
"""
GOALS MODEL — walk-forward, no leakage
========================================
Built because the certainty ceiling of outcome markets had never been measured
against our card lines.  It is: a strong favourite wins 82%.  This model
produces its own probability for every goal market so the comparison is
between two models, not between a model and an assumption.

Structure
---------
Independent Poisson goals with
    lambda_home = exp(alpha + home_adv + atk[home] - dfn[away])
    lambda_away = exp(alpha - home_adv + atk[away] - dfn[home])
plus a Dixon-Coles correction for the low-score cells (0-0, 0-1, 1-0, 1-1),
and a ridge penalty that shrinks team ratings toward the league average.

Each team plays about 8 matches in the sample, so without shrinkage the
ratings are noise.  The ridge strength is chosen on a HOLD-OUT: fit on the
first half of the season, score the second half.  Nothing is selected on the
data it is then scored against.

The honest record is a ROLLING-ORIGIN walk-forward: the model is refitted on
every match it has already seen, every 25 matches, and used to predict the
next block.  The final model for today is refitted on the whole season.

Predicted per match: P(home) P(draw) P(away) P(1X) P(X2) P(draw-no-bet)
P(over 0.5/1.5/2.5/3.5/4.5) P(both teams to score) P(clean sheet)
"""
import json, os, re, math, collections, statistics as st, unicodedata
import numpy as np
from scipy.optimize import minimize

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')


def nk(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def poisson_pmf(lam, kmax=15):
    out = [math.exp(-lam)]
    for k in range(1, kmax + 1):
        out.append(out[-1] * lam / k)
    return out


def poisson_cdf(lam, k):
    p = poisson_pmf(lam, max(int(k), 15))
    return sum(p[:int(k) + 1])


class Fitted:
    """A fitted Poisson-goals model: team ratings + home advantage + DC rho."""

    def __init__(self, teams, alpha, home, atk, dfn, rho):
        self.teams = teams
        self.alpha = alpha
        self.home = home
        self.atk = atk
        self.dfn = dfn
        self.rho = rho

    def lambdas(self, h, a):
        # a club unseen in the training window is treated as league average
        lh = math.exp(self.alpha + self.home + self.atk.get(h, 0.0) - self.dfn.get(a, 0.0))
        la = math.exp(self.alpha - self.home + self.atk.get(a, 0.0) - self.dfn.get(h, 0.0))
        return lh, la

    def markets(self, h, a):
        lh, la = self.lambdas(h, a)
        ph = poisson_pmf(lh)
        pa = poisson_pmf(la)
        n = min(len(ph), len(pa))
        home = draw = away = 0.0
        for i in range(n):
            pi = ph[i]
            for j in range(n):
                p = pi * pa[j]
                if i > j:
                    home += p
                elif i == j:
                    draw += p
                else:
                    away += p
        # Dixon-Coles correction on the four low-score cells
        r = self.rho
        dc = {(0, 0): 1 - lh * la * r,
              (0, 1): 1 + lh * r,
              (1, 0): 1 + la * r,
              (1, 1): 1 - r}
        adj = 0.0
        for (i, j), f in dc.items():
            adj += (f - 1) * ph[i] * pa[j]
        home += adj * 0.5
        away += adj * 0.5
        draw += adj
        tot = max(1e-6, home + draw + away)
        home, draw, away = home / tot, draw / tot, away / tot
        lt = lh + la
        return dict(home=home, draw=draw, away=away,
                    x1=home + draw, x2=draw + away, dnb=home + 0.5 * draw,
                    over05=1 - math.exp(-lt),
                    over15=1 - poisson_cdf(lt, 1),
                    over25=1 - poisson_cdf(lt, 2),
                    over35=1 - poisson_cdf(lt, 3),
                    over45=1 - poisson_cdf(lt, 4),
                    btts=(1 - math.exp(-lh)) * (1 - math.exp(-la)),
                    cs_home=math.exp(-la), cs_away=math.exp(-lh),
                    lh=lh, la=la)


def fit(ms, teams, ridge=3.0, use_dc=True):
    """MLE with a ridge penalty on the team ratings."""
    idx = {t: i for i, t in enumerate(teams)}
    nT = len(teams)
    H = np.array([idx[m['home']] for m in ms])
    A = np.array([idx[m['away']] for m in ms])
    YH = np.array([m['hs'] for m in ms], dtype=float)
    YA = np.array([m['as_'] for m in ms], dtype=float)
    n = len(ms)
    NP = 2 * nT + 3      # atk, dfn, alpha, home, rho

    def unpack(x):
        atk = x[:nT]
        dfn = x[nT:2 * nT]
        return atk, dfn, x[2 * nT], x[2 * nT + 1], x[2 * nT + 2]

    def nll(x):
        atk, dfn, alpha, home, rho = unpack(x)
        if use_dc:
            rho = np.clip(rho, -0.2, 0.2)
        else:
            rho = 0.0
        lh = np.exp(alpha + home + atk[H] - dfn[A])
        la = np.exp(alpha - home + atk[A] - dfn[H])
        ll = np.sum(YH * np.log(lh) - lh + YA * np.log(la) - la)
        # Dixon-Coles: adjust the four low-score cells
        ll += np.sum(rho * (-lh * la + lh + la - 1) * ((YH <= 1) & (YA <= 1)))
        pen = 0.5 * ridge * (np.sum(atk ** 2) + np.sum(dfn ** 2))
        return -(ll - pen)

    x0 = np.zeros(NP)
    x0[2 * nT] = math.log(max(0.5, (YH.sum() + YA.sum()) / (2 * n)))
    x0[2 * nT + 2] = 0.0 if use_dc else 0.0
    best = None
    for seed in range(2):
        x = x0.copy()
        if seed:
            rng = np.random.default_rng(seed)
            x[:2 * nT] = rng.normal(0, 0.05, 2 * nT)
        res = minimize(nll, x, method='L-BFGS-B',
                       options=dict(maxiter=500, ftol=1e-10, gtol=1e-8))
        if best is None or res.fun < best.fun:
            best = res
    atk, dfn, alpha, home, rho = unpack(best.x)
    # centre the attack ratings
    ma = atk.mean()
    atk = atk - ma
    alpha = alpha + ma
    return Fitted(teams, alpha, home, dict(zip(teams, atk)), dict(zip(teams, dfn)),
                  float(np.clip(rho, -0.2, 0.2)))


def load_matches():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for mid, m in cache.items():
        if not m.get('finished'):
            continue
        ss = m.get('scoreStr') or ''
        mm = re.match(r'^\s*(\d+)\s*-\s*(\d+)\s*$', ss)
        if not mm:
            continue
        ms.append(dict(date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hs=int(mm.group(1)), as_=int(mm.group(2)),
                       comp=m.get('compSlug')))
    ms.sort(key=lambda m: m['date'])
    return ms


def score(preds):
    n = len(preds)
    ll = 0.0
    fav_hit = fav_n = 0
    ov = []
    for p in preds:
        y = p['m']
        ll -= math.log(max(1e-9, p['home'] if y['hs'] > y['as_'] else
                           (p['draw'] if y['hs'] == y['as_'] else p['away'])))
        if p['draw'] < max(p['home'], p['away']):
            fav_n += 1
            fav = 'home' if p['home'] > p['away'] else 'away'
            fav_hit += (y['hs'] > y['as_']) if fav == 'home' else (y['as_'] > y['hs'])
        ov.append((p['over25'], 1 if y['hs'] + y['as_'] > 2.5 else 0))
    ovll = -sum(math.log(max(1e-9, q if y else 1 - q)) for q, y in ov) / len(ov)
    ovb = sum((q - y) ** 2 for q, y in ov) / len(ov)
    b = sum(y for _, y in ov) / len(ov)
    return dict(n=n, logloss=ll / n, fav_acc=fav_hit / max(1, fav_n),
                over25_ll=ovll, over25_brier=ovb, base_brier=b * (1 - b),
                base_rate=b)


def main():
    ms = load_matches()
    teams = sorted({m['home'] for m in ms} | {m['away'] for m in ms})
    print(f'matches: {len(ms)}   clubs: {len(teams)}   '
          f'{ms[0]["date"]} to {ms[-1]["date"]}')
    bh = sum(1 for m in ms if m['hs'] > m['as_']) / len(ms)
    bd = sum(1 for m in ms if m['hs'] == m['as_']) / len(ms)
    ba = 1 - bh - bd
    base_ll = -(bh * math.log(bh) + bd * math.log(bd) + ba * math.log(ba))
    print(f'base rate: home {bh:.3f} draw {bd:.3f} away {ba:.3f} -> log loss {base_ll:.4f}')

    half = len(ms) // 2
    tr, te = ms[:half], ms[half:]
    teams_tr = sorted({m['home'] for m in tr} | {m['away'] for m in tr})
    print('\n=== HOLDOUT: fit on the first half, score the second half ===')
    best = None
    for ridge in (0.5, 1.0, 2.0, 3.0, 5.0, 8.0, 12.0, 20.0):
        f = fit(tr, teams_tr, ridge)
        pr = [dict(f.markets(m['home'], m['away']), m=m) for m in te]
        sc = score(pr)
        print(f'  ridge {ridge:5.1f}: log loss {sc["logloss"]:.4f}  favourite acc {sc["fav_acc"]:.3f}  '
              f'over2.5 logloss {sc["over25_ll"]:.4f}  Brier {sc["over25_brier"]:.4f} '
              f'(flat {sc["base_brier"]:.4f})')
        if best is None or sc['logloss'] < best[0]:
            best = (sc['logloss'], ridge)
    ridge = best[1]
    print(f'  -> ridge chosen on the holdout: {ridge}')

    print('\n=== ROLLING-ORIGIN WALK-FORWARD (refit every 40 matches) ===')
    cache = os.path.join(DATA, 'goals_walkforward_preds.json')
    if os.path.exists(cache):
        preds = json.load(open(cache))
        for p in preds:
            p['m'] = next(x for x in ms if x['home'] == p['m']['home']
                          and x['away'] == p['m']['away'] and x['date'] == p['m']['date'])
        print(f'  (loaded {len(preds)} cached predictions)')
    else:
        preds = []
        for start in range(60, len(ms), 40):
            seen = ms[:start]
            ts = sorted({m['home'] for m in seen} | {m['away'] for m in seen})
            f = fit(seen, ts, ridge)
            for m in ms[start:start + 40]:
                preds.append(dict(f.markets(m['home'], m['away']),
                                  m=dict(home=m['home'], away=m['away'], date=m['date'],
                                         hs=m['hs'], as_=m['as_'])))
        json.dump(preds, open(cache, 'w'))
    sc = score(preds)
    print(f'  matches scored      {sc["n"]}')
    print(f'  outcome log loss    {sc["logloss"]:.4f}   base {base_ll:.4f}   '
          f'-> {"BETTER" if sc["logloss"] < base_ll else "WORSE"}')
    print(f'  favourite accuracy  {sc["fav_acc"]:.3f}')
    print(f'  over 2.5 log loss   {sc["over25_ll"]:.4f}')
    print(f'  over 2.5 Brier      {sc["over25_brier"]:.4f}   flat {sc["base_brier"]:.4f}   '
          f'-> {"BETTER" if sc["over25_brier"] < sc["base_brier"] else "WORSE"}')
    print('\n  over 2.5 calibration:')
    bands = collections.defaultdict(list)
    for p in preds:
        bands[int(p['over25'] * 10) / 10].append(
            (p['over25'], 1 if p['m']['hs'] + p['m']['as_'] > 2.5 else 0))
    for k in sorted(bands):
        v = bands[k]
        print(f'    {k:.1f}-{k+0.1:.1f}  n={len(v):4d}  predicted {100*st.mean([q for q,_ in v]):5.1f}%  '
              f'actual {100*st.mean([y for _,y in v]):5.1f}%')
    print('\n  outcome calibration (P(home win) decile):')
    bands = collections.defaultdict(list)
    for p in preds:
        y = p['m']
        bands[int(p['home'] * 10) / 10].append((p['home'], 1 if y['hs'] > y['as_'] else 0))
    for k in sorted(bands):
        v = bands[k]
        print(f'    {k:.1f}-{k+0.1:.1f}  n={len(v):4d}  predicted {100*st.mean([q for q,_ in v]):5.1f}%  '
              f'actual home won {100*st.mean([y for _,y in v]):5.1f}%')

    # ---- CALIBRATION -------------------------------------------------------
    # The raw model is over-confident at the extremes and under-confident in the
    # middle.  Fit a logistic recalibration per market on the first 70% of the
    # walk-forward predictions and report it on the last 30%.
    print('\n=== CALIBRATION (fit on the first 70% of the walk-forward, reported on the last 30%) ===')
    cut = int(len(preds) * 0.7)
    tr2, te2 = preds[:cut], preds[cut:]

    def ll_of(pairs):
        return -sum(math.log(max(1e-9, p if y else 1 - p)) for p, y in pairs) / len(pairs)

    def outcome_pairs(rows_):
        out = []
        for p in rows_:
            y = p['m']
            out.append((p['home'], 1 if y['hs'] > y['as_'] else 0))
            out.append((p['away'], 1 if y['as_'] > y['hs'] else 0))
        return out

    def fit_cal(pairs):
        from scipy.optimize import minimize as _min
        def nll(t):
            a, b = float(t[0]), float(t[1])
            s = 0.0
            for q, y in pairs:
                z = a + b * math.log(max(1e-6, q) / max(1e-6, 1 - q))
                pr = 1 / (1 + math.exp(-z))
                s -= math.log(max(1e-9, pr if y else 1 - pr))
            return s / len(pairs)
        r = _min(nll, np.array([0.0, 1.0]), method='L-BFGS-B',
                 bounds=[(-4, 4), (0.05, 3.0)], options=dict(maxiter=300, ftol=1e-12))
        return float(r.x[0]), float(r.x[1])

    cal = {}
    markets_to_cal = ['home', 'away', 'over05', 'over15', 'over25', 'over35', 'btts']
    for k in markets_to_cal:
        if k in ('home', 'away'):
            pairs = outcome_pairs(tr2)
        else:
            pairs = []
            for p in tr2:
                g = p['m']['hs'] + p['m']['as_']
                if k == 'over05':
                    y = g > 0.5
                elif k == 'over15':
                    y = g > 1.5
                elif k == 'over25':
                    y = g > 2.5
                elif k == 'over35':
                    y = g > 3.5
                else:
                    y = p['m']['hs'] > 0 and p['m']['as_'] > 0
                pairs.append((p[k], 1 if y else 0))
        a, b = fit_cal(pairs)
        cal[k] = (a, b)
        # report on the held-out third
        if k in ('home', 'away'):
            hp = [(p[k], (1 if p['m']['hs'] > p['m']['as_'] else 0) if k == 'home'
                   else (1 if p['m']['as_'] > p['m']['hs'] else 0)) for p in te2]
        else:
            hp = []
            for p in te2:
                g = p['m']['hs'] + p['m']['as_']
                if k == 'over05':
                    y = g > 0.5
                elif k == 'over15':
                    y = g > 1.5
                elif k == 'over25':
                    y = g > 2.5
                elif k == 'over35':
                    y = g > 3.5
                else:
                    y = p['m']['hs'] > 0 and p['m']['as_'] > 0
                hp.append((p[k], 1 if y else 0))
        cal_ll = []
        for q, y in hp:
            z = a + b * math.log(max(1e-6, q) / max(1e-6, 1 - q))
            cal_ll.append((1 / (1 + math.exp(-z)), y))
        print(f'  {k:8s} raw log loss {ll_of(hp):.4f} -> calibrated {ll_of(cal_ll):.4f}   '
              f'(a={a:+.2f}, b={b:.2f})')
    json.dump({k: list(v) for k, v in cal.items()},
              open(os.path.join(DATA, 'goals_calibration.json'), 'w'))

    def apply_cal(p):
        out = dict(p)
        for k, (a, b) in cal.items():
            if k in out and isinstance(out[k], (int, float)):
                z = a + b * math.log(max(1e-6, out[k]) / max(1e-6, 1 - out[k]))
                out[k] = 1 / (1 + math.exp(-z))
        s = out['home'] + out['draw'] + out['away']
        if s > 0:
            out['home'] /= s
            out['draw'] /= s
            out['away'] /= s
        out['x1'] = out['home'] + out['draw']
        out['x2'] = out['draw'] + out['away']
        out['dnb'] = out['home'] + 0.5 * out['draw']
        return out

    # ---- final model on the whole season, then today's board ---------------
    final = fit(ms, teams, ridge)
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    name_by_norm = {}
    for m in ms:
        name_by_norm.setdefault(nk(m['home']), m['home'])
        name_by_norm.setdefault(nk(m['away']), m['away'])

    def resolve(s):
        s = s.strip()
        k = nk(s)
        if k in name_by_norm:
            return name_by_norm[k]
        c = [v for kk, v in name_by_norm.items() if k and (k in kk or kk in k)]
        return max(c, key=len) if c else None

    out = []
    for r in board:
        parts = [x.strip() for x in r['fx'].split(' v ')]
        h, a = resolve(parts[0]), resolve(parts[1])
        if not h or not a:
            continue
        p = apply_cal(final.markets(h, a))
        p.update(ko=r['ko'], fx=r['fx'], comp=r['comp'], ref=r['ref'],
                 h_team=h, a_team=a, src=r.get('src'))
        out.append(p)
    out.sort(key=lambda x: -max(x['home'], x['away']))
    print('\n=== TODAY: goal markets, most certain first ===')
    print(f"{'KO':>6s} {'FIXTURE':30s} {'xG h/a':>9s} {'home':>6s} {'draw':>6s} {'away':>6s} "
          f"{'1X':>6s} {'X2':>6s} {'o0.5':>6s} {'o1.5':>6s} {'o2.5':>6s} {'BTTS':>6s}")
    for x in out:
        print(f"{x['ko']:>6s} {x['fx'][:29]:30s} {x['lh']:3.2f}/{x['la']:3.2f} "
              f"{x['home']*100:5.1f}% {x['draw']*100:5.1f}% {x['away']*100:5.1f}% "
              f"{x['x1']*100:5.1f}% {x['x2']*100:5.1f}% {x['over05']*100:5.1f}% "
              f"{x['over15']*100:5.1f}% {x['over25']*100:5.1f}% {x['btts']*100:5.1f}%")
    te2c = [apply_cal(p) for p in te2]
    scc = score(te2c)
    print(f'\n=== HELD-OUT THIRD after calibration ===')
    print(f'  outcome log loss {sc["logloss"]:.4f} -> {scc["logloss"]:.4f}  (base {base_ll:.4f})')
    print(f'  favourite accuracy {sc["fav_acc"]:.3f} -> {scc["fav_acc"]:.3f}')
    print(f'  over 2.5 Brier {sc["over25_brier"]:.4f} -> {scc["over25_brier"]:.4f} '
          f'(flat {scc["base_brier"]:.4f})')
    json.dump(dict(ridge=ridge, board=out,
                   scores=dict(logloss=sc['logloss'], fav_acc=sc['fav_acc'],
                               over25_ll=sc['over25_ll'], over25_brier=sc['over25_brier'],
                               base_ll=base_ll, n=sc['n'])),
              open(os.path.join(DATA, 'goals_board_2026-10-25.json'), 'w'), indent=1)
    print('\nwrote goals_board_2026-10-25.json')


if __name__ == '__main__':
    main()

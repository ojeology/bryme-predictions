#!/usr/bin/env python3
"""
CARD MODEL v4 — negative binomial on the referee's own record
===============================================================
The v3 model fed a single number (the referee's over-3.5 rate) into a linear
regression and threw the rest away.  The book, meanwhile, prices Cards O2.5
at a flat 77-88% implied no matter who the referee is (correlation with the
referee's card rate across 9 real prices: +0.18, i.e. none).

Sportmonks gives us TWO independent facts per referee over 15-40 matches:
    avg_yellows   -> the mean number of cards per match
    over_3_5      -> the share of their matches that went over 3.5 cards
Fitting a negative binomial to both pins down the whole card distribution,
and therefore P(over 2.5) and P(over 1.5) directly.  No linear compression.

Validation is out-of-sample: the fit uses Sportmonks only, and is then scored
against the FotMob match cache, which it has never seen.
"""
import json, os, math, collections, statistics as st

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')


def lgamma(x):
    return math.lgamma(x)


def nb_pmf(x, mu, r):
    """P(X = x) for X ~ NegBin(mean mu, dispersion r)."""
    p = r / (r + mu)
    q = 1 - p
    return math.exp(lgamma(r + x) - lgamma(r) - lgamma(x + 1)
                    + r * math.log(p) + x * math.log(q))


def nb_cdf(k, mu, r):
    """P(X <= k) for X ~ NegBin(mean mu, dispersion r)."""
    if k < 0:
        return 0.0
    p = r / (r + mu)
    q = 1 - p
    term = p ** r          # P(X = 0)
    s = term
    for x in range(1, int(k) + 1):
        term *= ((r + x - 1) / x) * q
        s += term
    return min(1.0, s)


def solve_r(mu, target, thr=3.5):
    """Find the dispersion r so that P(X > thr) == target, for a fixed mean mu."""
    k = int(math.floor(thr))
    lo, hi = 0.02, 20.0
    for _ in range(80):
        mid = (lo + hi) / 2
        p = 1 - nb_cdf(k, mu, mid)
        if p > target:
            lo = mid      # more dispersion -> lower P(>thr)
        else:
            hi = mid
    r = (lo + hi) / 2
    return r


def fit_referee(mu, o35_pct, games, base_o35=None, base_games=None, K=15):
    """Referee -> P(cards over 2.5) and P(cards over 1.5), with shrinkage."""
    mu = max(0.8, float(mu))
    o = o35_pct / 100.0
    if base_o35 is not None and base_games is not None:
        w = games / (games + K)
        o = w * o + (1 - w) * (base_o35 / 100.0)
    r = solve_r(mu, o)
    p25 = 1 - nb_cdf(2, mu, r)
    p15 = 1 - nb_cdf(1, mu, r)
    p35 = 1 - nb_cdf(3, mu, r)
    return dict(mu=mu, o35=o, r=r, p15=p15, p25=p25, p35=p35, games=games)


def main():
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refs = [r for r in man['referees']
            if r.get('games', 0) >= 8 and r.get('avg_yellows') and r.get('over_3_5') is not None]
    tg = sum(r['games'] for r in refs)
    base_o35 = sum(r['over_3_5'] * r['games'] for r in refs) / tg
    print(f'referees with 8+ games: {len(refs)}   matches behind them: {tg}')
    print(f'league average cards per match: '
          f'{sum(r["avg_yellows"]*r["games"] for r in refs)/tg:.3f}   '
          f'league over-3.5 rate: {base_o35:.1f}%')

    table = {}
    for r in refs:
        f = fit_referee(r['avg_yellows'], r['over_3_5'], r['games'], base_o35, tg)
        table[r['name']] = f

    # ---- out-of-sample validation against the FotMob cache -----------------
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    hits25 = n25 = 0
    hits15 = n15 = 0
    brier25 = 0.0
    n_ref_seen = 0
    per_ref = collections.defaultdict(lambda: [0, 0])
    for mid, m in cache.items():
        if not m.get('finished'):
            continue
        y = m.get('yellows') or []
        if len(y) != 2:
            continue
        t = y[0] + y[1]
        ref = (m.get('referee') or {}).get('name')
        f = table.get(ref)
        if not f:
            continue
        n_ref_seen += 1
        p25 = f['p25']
        p15 = f['p15']
        hits25 += (t > 2.5) == (p25 > 0.5)
        hits15 += (t > 1.5) == (p15 > 0.5)
        brier25 += (p25 - (1 if t > 2.5 else 0)) ** 2
        n25 += 1
        n15 += 1
        per_ref[ref][0] += 1
        per_ref[ref][1] += (t > 2.5)
    if n25:
        print(f'\nOUT-OF-SAMPLE vs FotMob cache ({n_ref_seen} matches, {len(per_ref)} referees):')
        print(f'  over 2.5 : accuracy {100*hits25/n25:.1f}%   Brier {brier25/n25:.4f}')
        print(f'  over 1.5 : accuracy {100*hits15/n15:.1f}%')
        # compare with v3 linear model on the same matches
        CM = json.load(open(os.path.join(DATA, 'card_model_v3.json')))
        CAL = {float(k): [(a, b, n) for a, b, n in v] for k, v in CM['CAL'].items()}
        FINAL = {float(k): v for k, v in CM['FINAL'].items()}

        def apply_cal(L, pred):
            pts = CAL.get(L) or []
            if not pts:
                return pred
            if pred <= pts[0][0]:
                return pts[0][1]
            if pred >= pts[-1][0]:
                return pts[-1][1]
            for i in range(len(pts) - 1):
                x0, y0, _ = pts[i]
                x1, y1, _ = pts[i + 1]
                if x0 <= pred <= x1:
                    return y0 if x1 == x0 else y0 + (y1 - y0) * (pred - x0) / (x1 - x0)
            return pred

        h3 = n3 = 0
        br3 = 0.0
        for mid, m in cache.items():
            if not m.get('finished'):
                continue
            y = m.get('yellows') or []
            if len(y) != 2:
                continue
            t = y[0] + y[1]
            ref = (m.get('referee') or {}).get('name')
            f = table.get(ref)
            rm = next((r for r in man['referees'] if r['name'] == ref), None)
            if not f or not rm or rm.get('over_3_5') is None:
                continue
            o = rm['over_3_5']
            a, b, _ = FINAL[2.5]
            raw = max(0., min(1., (a + b * o) / 100.))
            p3 = apply_cal(2.5, raw)
            h3 += (t > 2.5) == (p3 > 0.5)
            br3 += (p3 - (1 if t > 2.5 else 0)) ** 2
            n3 += 1
        print(f'  v3 linear model on the same matches: accuracy {100*h3/n3:.1f}%  '
              f'Brier {br3/n3:.4f}   (n={n3})')

    # ---- today's board -----------------------------------------------------
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    print('\n' + '=' * 88)
    print('CARD MODEL v4 — today, priced off each referee own record')
    print('=' * 88)
    print(f"{'KO':>6s} {'FIXTURE':34s} {'referee':22s} {'g':>3s} {'avgY':>5s} {'o35':>4s} "
          f"| {'P O1.5':>7s} {'FAIR':>6s} | {'P O2.5':>7s} {'FAIR':>6s} | {'P O3.5':>7s} {'FAIR':>6s}")
    out = []
    for r in sorted(board, key=lambda r: (r['ko'], r['fx'])):
        f = table.get(r['ref'])
        if not f:
            continue
        out.append(dict(r, p15=f['p15'], p25=f['p25'], p35=f['p35'], mu=f['mu'],
                        o35=f['o35'] * 100, g=f['games'],
                        fair15=1 / f['p15'], fair25=1 / f['p25'], fair35=1 / f['p35']))
        print(f"{r['ko']:>6s} {r['fx'][:33]:34s} {r['ref'][:21]:22s} {f['games']:3d} {f['mu']:5.2f} "
              f"{f['o35']*100:4.0f} | {f['p15']*100:6.1f}% {1/f['p15']:6.2f} | "
              f"{f['p25']*100:6.1f}% {1/f['p25']:6.2f} | {f['p35']*100:6.1f}% {1/f['p35']:6.2f}")
    json.dump({k: {kk: vv for kk, vv in v.items()} for k, v in table.items()},
              open(os.path.join(DATA, 'card_model_v4_referees.json'), 'w'), indent=1)
    json.dump(out, open(os.path.join(DATA, 'card_model_v4_board_2026-10-25.json'), 'w'), indent=1)
    print('\nwrote card_model_v4_referees.json + card_model_v4_board_2026-10-25.json')


if __name__ == '__main__':
    main()

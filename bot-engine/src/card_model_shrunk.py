#!/usr/bin/env python3
"""
CARD MODEL v2 — SHRUNK
=======================
Saturday showed the card model is over-confident exactly where we leaned on it:
    model p2 band 71-100%  ->  model said 80.2%, actual 70.6%   (-9.6 pts)
    model p2 band  51-70%  ->  model said 62.8%, actual 77.8%   (+15.0 pts)

That is the classic signature of passing a NOISY SAMPLE RATE straight through
as a probability.  Two separate problems, both fixed here:

  1. THE REFEREE'S RATE IS NOISY.
     A referee with 4 games at 100% over-3.5 is not a strict referee; it is a
     4-game coin flip.  We shrink each referee's realised over-3.5 rate toward
     the league mean with an empirical-Bayes weight based on how many games
     they have and how much referees genuinely differ from each other.

  2. THE REGRESSION IS NOT PERFECT.
     The mapping referee-rate -> P(over a line) has R2 around 0.55, so 45% of
     the variance is unexplained.  We therefore shrink the regression output
     toward the league baseline by exactly that unexplained share.

Both shrinks are estimated from the 2026-27 cache with NO Saturday data, then
validated on Saturday as a true holdout.
"""
import json, collections, statistics as st, math, os, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
LINES = [0.5, 1.5, 2.5, 3.5, 4.5]


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def fit(xs, ys):
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den if den else 0.0
    a = my - b * mx
    ss = sum((y - my) ** 2 for y in ys)
    r2 = 1 - sum((y - (a + b * x)) ** 2 for x, y in zip(xs, ys)) / ss if ss else 0.0
    return a, b, r2


def build():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    per_ref = collections.defaultdict(list)
    league = []
    for mid, m in cache.items():
        y = m.get('yellows') or []
        if len(y) != 2:
            continue
        d = (m.get('utcTime') or '')[:10]
        league.append(y[0] + y[1])
        r = (m.get('referee') or {}).get('name')
        if r and d < '2026-10-24':
            per_ref[r].append(y[0] + y[1])

    LEAG = {L: sum(1 for x in league if x > L) / len(league) for L in LINES}
    league_o35 = LEAG[3.5]

    # ---- 1. empirical-Bayes shrinkage of each referee's over-3.5 rate -------
    stats = {}
    for r, v in per_ref.items():
        n = len(v)
        if n < 3:
            continue
        rate = sum(1 for x in v if x > 3.5) / n
        stats[r] = {'n': n, 'rate': rate}
    rates = [s['rate'] for s in stats.values()]
    mu = st.mean(rates)
    var_between = st.variance(rates) if len(rates) > 1 else 0.0
    # binomial noise of a single referee at the average sample size
    nbar = st.mean([s['n'] for s in stats.values()])
    var_binom = mu * (1 - mu) / max(nbar, 1)
    tau2 = max(0.0, var_between - var_binom)          # true between-referee var
    K = tau2 / max(var_binom, 1e-9)                    # pseudo-count (prior weight)
    print(f'league baseline P(>3.5) = {league_o35*100:.1f}%')
    print(f'between-referee variance: total {var_between*100:.2f}pts^2, '
          f'binomial {var_binom*100:.2f}pts^2 -> true spread {tau2*100:.2f}pts^2')
    print(f'empirical-Bayes pseudo-count K = {K:.1f} games '
          f'(a {nbar:.0f}-game referee is worth K={K:.0f} games of league average)')

    def shrink_rate(rate, n):
        return (n * rate + K * league_o35) / (n + K)

    # ---- 2. regression + shrink toward league baseline by (1 - R2) --------
    pts = []
    for r, s in stats.items():
        v = per_ref[r]
        sr = shrink_rate(s['rate'], s['n'])
        pts.append((100 * sr,
                    [100 * sum(1 for x in v if x > L) / len(v) for L in LINES]))
    xs = [p[0] for p in pts]
    REG = {}
    for i, L in enumerate(LINES):
        a, b, r2 = fit(xs, [p[1][i] for p in pts])
        REG[L] = (a, b, r2)
        print(f'  P(>{L}) = {a:6.2f} + {b:.3f} * shrunk_rate   R2={r2:.3f}')

    def predict(line, ref_games, ref_o35):
        if ref_o35 is None:
            return LEAG[line]
        sr = shrink_rate(ref_o35 / 100.0, ref_games)
        a, b, r2 = REG[line]
        raw = max(0.0, min(1.0, (a + b * 100 * sr) / 100.0))
        return max(0.0, min(1.0, r2 * raw + (1 - r2) * LEAG[line]))

    return dict(predict=predict, LEAG=LEAG, K=K, REG={k: v for k, v in REG.items()},
                stats=stats, league_o35=league_o35)


def validate(M):
    res = json.load(open(os.path.join(DATA, 'results_2026-10-24.json')))
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    idx = {}
    for mid, r in res.items():
        idx[(norm(r.get('home')), norm(r.get('away')))] = r
    refman = {r['name']: r for r in man['referees']}
    print('\n=== SATURDAY HOLDOUT — old model vs shrunk model ===')
    old_pts = {}
    for line in LINES:
        hits = n = 0
        preds = []
        for f in man['weekend_fixtures']:
            if f.get('date') != '2026-10-24':
                continue
            ref = (f.get('referee') or {}).get('name')
            r = refman.get(ref) or {}
            o35 = r.get('over_3_5')
            g = r.get('games')
            if o35 is None:
                continue
            if o35 <= 0:
                o35 = 1
            m = idx.get((norm(f.get('home_name')), norm(f.get('away_name'))))
            if not m:
                continue
            h = m['stats'].get('home', {})
            a = m['stats'].get('away', {})
            yv = (h.get('yellow_cards') or 0) + (a.get('yellow_cards') or 0)
            n += 1
            hits += (yv > line)
            preds.append(M['predict'](line, g, o35))
        print(f'  Over {line}: actual {hits}/{n} = {100*hits/n:5.1f}%   '
              f'shrunk model mean {st.mean(preds)*100:5.1f}%   '
              f'gap {100*hits/n - st.mean(preds)*100:+5.1f}')

    # calibration curve on the shrunk model
    print('\n  shrunk-model calibration on Saturday:')
    for lo, hi in ((0, 60), (60, 75), (75, 100)):
        sub = []
        for f in man['weekend_fixtures']:
            if f.get('date') != '2026-10-24':
                continue
            ref = (f.get('referee') or {}).get('name')
            r = refman.get(ref) or {}
            o35 = r.get('over_3_5')
            g = r.get('games')
            if o35 is None:
                continue
            if o35 <= 0:
                o35 = 1
            p = M['predict'](2.5, g, o35)
            if not (lo <= p * 100 <= hi):
                continue
            m = idx.get((norm(f.get('home_name')), norm(f.get('away_name'))))
            if not m:
                continue
            h = m['stats'].get('home', {})
            a = m['stats'].get('away', {})
            yv = (h.get('yellow_cards') or 0) + (a.get('yellow_cards') or 0)
            sub.append((p, yv > 2.5))
        if sub:
            print(f'    shrunk p2 {lo}-{hi}% (n={len(sub):2d}): model {st.mean([s[0] for s in sub])*100:5.1f}%  '
                  f'actual {100*sum(1 for s in sub if s[1])/len(sub):5.1f}%  '
                  f'gap {100*sum(1 for s in sub if s[1])/len(sub) - st.mean([s[0] for s in sub])*100:+5.1f}')


if __name__ == '__main__':
    M = build()
    validate(M)
    json.dump({'K': M['K'], 'LEAG': M['LEAG'],
               'REG': {str(k): list(v) for k, v in M['REG'].items()},
               'league_o35': M['league_o35']},
              open(os.path.join(DATA, 'card_model_v2.json'), 'w'), indent=1)
    print('\nwrote card_model_v2.json')

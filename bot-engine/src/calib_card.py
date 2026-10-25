#!/usr/bin/env python3
"""
CARD MODEL v3 — LEAVE-ONE-OUT CALIBRATION CURVE
===============================================
The regression (referee over-3.5 rate -> P(match over a card line)) explains
only ~55% of the variance, and the old model passed its OUTPUT straight through
as a probability.  Saturday showed exactly what that costs:

    model p2 band 71-100%  ->  model 80.2%  actual 70.6%   (-9.6 pts)
    model p2 band  51-70%  ->  model 62.8%  actual 77.8%   (+15.0 pts)

The fix is a CALIBRATION CURVE fitted out-of-sample: for every referee with
enough prior games, predict their card probability from the OTHER referees'
regression (leave-one-out), then measure what actually happened to them.
Bin those and we learn the true mapping from "model says X%" to "happens Y%".

Saturday is then used purely as a holdout to check the curve was not fitted to
it.
"""
import json, collections, statistics as st, math, os, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
LINES = [0.5, 1.5, 2.5, 3.5, 4.5]
MIN_GAMES = 8          # a referee needs history before we can score them


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
    scored = {}
    for r, v in per_ref.items():
        if len(v) < MIN_GAMES:
            continue
        scored[r] = {'n': len(v), 'rate': sum(1 for x in v if x > 3.5) / len(v),
                     'lines': {L: sum(1 for x in v if x > L) / len(v) for L in LINES}}
    names = sorted(scored)
    print(f'league baseline: ' + ' '.join(f'P>{L} {100*LEAG[L]:.1f}%' for L in LINES))
    print(f'referees with >= {MIN_GAMES} prior matches (calibration set): {len(names)}')

    # ---- leave-one-out regression + calibration bins -----------------------
    EDGES = [0.0, 0.40, 0.50, 0.60, 0.70, 0.80, 1.01]
    CAL = {}
    for L in LINES:
        pts = []
        for r in names:
            # leave-one-out: fit on everybody else
            xs = [100 * scored[o]['rate'] for o in names if o != r]
            ys = [100 * scored[o]['lines'][L] for o in names if o != r]
            a, b, r2 = fit(xs, ys)
            sr = 100 * scored[r]['rate']
            pred = max(0.0, min(1.0, (a + b * sr) / 100.0))
            pts.append((pred, scored[r]['lines'][L]))
        # bin and average
        bins = collections.defaultdict(list)
        for pred, act in pts:
            bi = 0
            for i in range(len(EDGES) - 1):
                if EDGES[i] <= pred < EDGES[i + 1]:
                    bi = i
                    break
            bins[bi].append((pred, act))
        CAL[L] = {}
        for bi, v in bins.items():
            if len(v) < 4:
                continue
            CAL[L][bi] = (st.mean([x[0] for x in v]), st.mean([x[1] for x in v]), len(v))
        # print
        print(f'\n  P(>{L}) calibration (leave-one-out):')
        for bi in sorted(CAL[L]):
            mp, ma, n = CAL[L][bi]
            print(f'    model {mp*100:5.1f}%  ->  actual {ma*100:5.1f}%   '
                  f'(n={n:3d}, gap {(ma-mp)*100:+5.1f})')

    def apply_cal(L, pred):
        """Map a raw regression output through the calibration curve."""
        if L not in CAL or not CAL[L]:
            return pred
        pts = sorted(CAL[L].values())
        lo = pts[0]
        hi = pts[-1]
        if pred <= lo[0]:
            return lo[1]
        if pred >= hi[0]:
            return hi[1]
        for i in range(len(pts) - 1):
            x0, y0, _ = pts[i]
            x1, y1, _ = pts[i + 1]
            if x0 <= pred <= x1:
                if x1 == x0:
                    return y0
                return y0 + (y1 - y0) * (pred - x0) / (x1 - x0)
        return pred

    # final prediction for a fixture: Sportmonks referee o35 + games
    def predict(line, ref_games, ref_o35):
        if ref_o35 is None:
            return LEAG[line]
        xs = [100 * scored[o]['rate'] for o in names]
        ys = [100 * scored[o]['lines'][line] for o in names]
        a, b, r2 = fit(xs, ys)
        raw = max(0.0, min(1.0, (a + b * ref_o35) / 100.0))
        return max(0.0, min(1.0, apply_cal(line, raw)))

    return dict(predict=predict, LEAG=LEAG, CAL={str(k): {str(i): v for i, v in c.items()}
                                                for k, c in CAL.items()},
                names=names, scored=scored)


def validate(M):
    res = json.load(open(os.path.join(DATA, 'results_2026-10-24.json')))
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    idx = {}
    for mid, r in res.items():
        idx[(norm(r.get('home')), norm(r.get('away')))] = r
    refman = {r['name']: r for r in man['referees']}
    print('\n' + '=' * 74)
    print('SATURDAY HOLDOUT — calibrated card model')
    print('=' * 74)
    for L in LINES:
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
            hits += (yv > L)
            preds.append(M['predict'](L, g, o35))
        print(f'  Over {L}: actual {hits}/{n} = {100*hits/n:5.1f}%   '
              f'calibrated model {st.mean(preds)*100:5.1f}%   '
              f'gap {100*hits/n - st.mean(preds)*100:+5.1f} pts')

    print('\n  calibration on Saturday, by predicted band:')
    for L in (2.5, 3.5):
        for lo, hi in ((0, 60), (60, 72), (72, 82), (82, 100)):
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
                p = M['predict'](L, g, o35)
                if not (lo <= p * 100 <= hi):
                    continue
                m = idx.get((norm(f.get('home_name')), norm(f.get('away_name'))))
                if not m:
                    continue
                h = m['stats'].get('home', {})
                a = m['stats'].get('away', {})
                yv = (h.get('yellow_cards') or 0) + (a.get('yellow_cards') or 0)
                sub.append((p, yv > L))
            if sub:
                mp = st.mean([s[0] for s in sub]) * 100
                ar = 100 * sum(1 for s in sub if s[1]) / len(sub)
                print(f'    O{L} band {lo}-{hi}% (n={len(sub):2d}): model {mp:5.1f}%  '
                      f'actual {ar:5.1f}%  gap {ar-mp:+5.1f}')


if __name__ == '__main__':
    M = build()
    validate(M)
    json.dump({'LEAG': M['LEAG'],
               'CAL': {str(k): {str(i): list(v) for i, v in c.items()} for k, c in M['CAL'].items()},
               'names': M['names'],
               'scored': {k: {'n': v['n'], 'rate': v['rate']} for k, v in M['scored'].items()}},
              open(os.path.join(DATA, 'card_model_v3.json'), 'w'), indent=1)
    print('\nwrote card_model_v3.json')

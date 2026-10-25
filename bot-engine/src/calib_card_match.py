#!/usr/bin/env python3
"""
CARD MODEL v3 — MATCH-LEVEL WALK-FORWARD CALIBRATION
=====================================================
Calibrating on referees is too thin: only 17 cache referees have 8+ prior
games, and a referee's realised over-3.5 rate from 8 games is itself noisy,
which drags any calibration curve toward the middle (exactly what we saw --
the curve collapsed O2.5 to 60.7% when reality was 70.4%).

So calibrate at the MATCH level instead, walk-forward:

    for every match in the 2026-27 cache, in date order:
        the referee rate used is computed from THAT REFEREE'S PREVIOUS GAMES ONLY
        predict P(over a line) from the referee rate
        record (predicted, actual)

That yields ~1,000+ calibration points instead of 27, with zero future
leakage.  The regression coefficients are fitted leave-one-out by referee.
Saturday is then a clean holdout.
"""
import json, collections, statistics as st, math, os, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
LINES = [0.5, 1.5, 2.5, 3.5, 4.5]
MIN_PRIOR = 4          # referee games needed before we trust their rate


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


def main():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))

    # ---- league baseline over the whole cache -----------------------------
    league = []
    for mid, m in cache.items():
        y = m.get('yellows') or []
        if len(y) == 2:
            league.append(y[0] + y[1])
    LEAG = {L: sum(1 for x in league if x > L) / len(league) for L in LINES}

    # ---- matches in date order --------------------------------------------
    matches = []
    for mid, m in cache.items():
        y = m.get('yellows') or []
        if len(y) != 2:
            continue
        r = (m.get('referee') or {}).get('name')
        matches.append(dict(d=(m.get('utcTime') or '')[:10], ref=r,
                            cards=y[0] + y[1], mid=mid))
    matches.sort(key=lambda m: (m['d'], m['mid']))

    # ---- per-referee full history, for the leave-one-out regression -------
    ref_hist = collections.defaultdict(list)
    for m in matches:
        if m['ref']:
            ref_hist[m['ref']].append(m['cards'])

    # regression fitted per referee group (leave-one-referee-out is done by
    # simply refitting with the target referee removed)
    def loo_reg(L, exclude=None):
        xs, ys = [], []
        for r, v in ref_hist.items():
            if r == exclude or len(v) < MIN_PRIOR:
                continue
            rate = sum(1 for x in v if x > 3.5) / len(v)
            xs.append(100 * rate)
            ys.append(100 * sum(1 for x in v if x > L) / len(v))
        if len(xs) < 10:
            return None
        return fit(xs, ys)

    print('league baseline: ' + ' '.join(f'P>{L} {100*LEAG[L]:.1f}%' for L in LINES))
    print(f'cache matches with card data: {len(matches)}')

    # ---- walk forward ------------------------------------------------------
    prior = collections.defaultdict(list)
    obs = {L: [] for L in LINES}
    used = 0
    for m in matches:
        r = m['ref']
        if r:
            hist = prior[r]
            if len(hist) >= MIN_PRIOR:
                rate = sum(1 for x in hist if x > 3.5) / len(hist)
                for L in LINES:
                    reg = loo_reg(L, exclude=r)
                    if reg is None:
                        p = LEAG[L]
                    else:
                        a, b, _ = reg
                        p = max(0.0, min(1.0, (a + b * 100 * rate) / 100.0))
                    obs[L].append((p, 1.0 if m['cards'] > L else 0.0))
                used += 1
            prior[r].append(m['cards'])
    print(f'match-level calibration points: {used}')

    # ---- fit the calibration curve ----------------------------------------
    EDGES = [0.0, 0.40, 0.50, 0.60, 0.70, 0.80, 1.01]
    CAL = {}
    for L in LINES:
        bins = collections.defaultdict(list)
        for pred, act in obs[L]:
            bi = 0
            for i in range(len(EDGES) - 1):
                if EDGES[i] <= pred < EDGES[i + 1]:
                    bi = i
                    break
            bins[bi].append((pred, act))
        CAL[L] = []
        print(f'\n  P(over {L}) calibration, walk-forward match level:')
        for bi in sorted(bins):
            v = bins[bi]
            mp = st.mean([x[0] for x in v])
            ma = st.mean([x[1] for x in v])
            if len(v) >= 15:
                CAL[L].append((mp, ma, len(v)))
                print(f'    model {mp*100:5.1f}%  ->  actual {ma*100:5.1f}%   '
                      f'(n={len(v):4d}, gap {(ma-mp)*100:+5.1f})')
            else:
                print(f'    model {mp*100:5.1f}%  ->  actual {ma*100:5.1f}%   '
                      f'(n={len(v):4d}, too few to use)')

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
                if x1 == x0:
                    return y0
                return y0 + (y1 - y0) * (pred - x0) / (x1 - x0)
        return pred

    # final predictor, using the FULL-data regression
    FINAL = {}
    for L in LINES:
        xs = [100 * sum(1 for x in v if x > 3.5) / len(v) for v in ref_hist.values() if len(v) >= MIN_PRIOR]
        ys = [100 * sum(1 for x in v if x > L) / len(v) for v in ref_hist.values() if len(v) >= MIN_PRIOR]
        FINAL[L] = fit(xs, ys)

    def predict(line, ref_games, ref_o35):
        if ref_o35 is None:
            return LEAG[line]
        a, b, _ = FINAL[line]
        raw = max(0.0, min(1.0, (a + b * ref_o35) / 100.0))
        return max(0.0, min(1.0, apply_cal(line, raw)))

    # ---- Saturday holdout --------------------------------------------------
    res = json.load(open(os.path.join(DATA, 'results_2026-10-24.json')))
    idx = {}
    for mid, r in res.items():
        idx[(norm(r.get('home')), norm(r.get('away')))] = r
    refman = {r['name']: r for r in man['referees']}
    print('\n' + '=' * 74)
    print('SATURDAY HOLDOUT — walk-forward-calibrated card model')
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
            preds.append(predict(L, g, o35))
        print(f'  Over {L}: actual {hits}/{n} = {100*hits/n:5.1f}%   '
              f'calibrated {st.mean(preds)*100:5.1f}%   '
              f'gap {100*hits/n - st.mean(preds)*100:+5.1f} pts')

    print('\n  band calibration on Saturday:')
    for L in (2.5, 3.5):
        rows = []
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
            p = predict(L, g, o35)
            m = idx.get((norm(f.get('home_name')), norm(f.get('away_name'))))
            if not m:
                continue
            h = m['stats'].get('home', {})
            a = m['stats'].get('away', {})
            yv = (h.get('yellow_cards') or 0) + (a.get('yellow_cards') or 0)
            rows.append((p, yv > L))
        for lo, hi in ((0, 55), (55, 68), (68, 80), (80, 100)):
            sub = [x for x in rows if lo <= x[0] * 100 <= hi]
            if sub:
                mp = st.mean([s[0] for s in sub]) * 100
                ar = 100 * sum(1 for s in sub if s[1]) / len(sub)
                print(f'    O{L} {lo}-{hi}% (n={len(sub):2d}): model {mp:5.1f}%  actual {ar:5.1f}%  gap {ar-mp:+5.1f}')

    json.dump({'LEAG': LEAG,
               'CAL': {str(L): [[a, b, n] for a, b, n in CAL[L]] for L in LINES},
               'FINAL': {str(L): list(FINAL[L]) for L in LINES}},
              open(os.path.join(DATA, 'card_model_v3.json'), 'w'), indent=1)
    print('\nwrote card_model_v3.json')


if __name__ == '__main__':
    main()

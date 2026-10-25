#!/usr/bin/env python3
"""
BOOKINGS-EXACT CARD MODEL
==========================
Saturday's grading used yellow cards only.  But SportyBet's Total Bookings
market settles:
      Yellow Card = 1 booking
      Red Card   = 2 bookings
      (a second yellow leading to a red counts as the red only)

So the market the user actually plays is BOOKINGS, not yellows.  Our model was
computing yellows-only probabilities, which under-states the bookings
probability whenever a red card appears (16% of Saturday's matches).

This rebuilds the card model on the JOINT (yellows, reds) distribution per
referee, from the cache, and produces P(bookings > L) for every line:
      L = 0.5, 1.5, 2.5, 3.5, 4.5
using the referee over-3.5 rate as the driver, exactly like the old model, but
fitted on bookings instead of yellows.
"""
import json, collections, statistics as st, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
LINES = [0.5, 1.5, 2.5, 3.5, 4.5]


def load():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    per_ref = collections.defaultdict(list)
    league = []
    for mid, m in cache.items():
        y = m.get('yellows') or []
        rd = m.get('reds') or []
        if len(y) != 2:
            continue
        d = (m.get('utcTime') or '')[:10]
        yv = y[0] + y[1]
        rv = (rd[0] + rd[1]) if len(rd) == 2 else 0
        book = yv + 2 * rv          # SportyBet: yellow=1 booking, red=2 bookings
        league.append(book)
        r = (m.get('referee') or {}).get('name')
        if r and d < '2026-10-24':
            per_ref[r].append(book)
    return per_ref, league


def fit(xs, ys):
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den if den else 0.0
    a = my - b * mx
    ss = sum((y - my) ** 2 for y in ys)
    r2 = 1 - sum((y - (a + b * x)) ** 2 for x, y in zip(xs, ys)) / ss if ss else 0.0
    return a, b, r2


def main():
    per_ref, league = load()
    print(f'league baseline (bookings): mean {st.mean(league):.2f} | ' +
          ' '.join(f'P>{L} {100*sum(1 for x in league if x>L)/len(league):.1f}%' for L in LINES))

    pts = []
    for r, v in per_ref.items():
        if len(v) < 4:
            continue
        pts.append((100 * sum(1 for x in v if x > 3.5) / len(v),
                    [100 * sum(1 for x in v if x > L) / len(v) for L in LINES]))
    print(f'calibration referees: {len(pts)}')

    xs = [p[0] for p in pts]
    REG = {}
    for i, L in enumerate(LINES):
        a, b, r2 = fit(xs, [p[1][i] for p in pts])
        REG[L] = (a, b, r2)
        print(f'  P(bookings>{L}) = {a:6.2f} + {b:.3f} * P(>3.5)   R2={r2:.3f}')

    LEAG = {L: sum(1 for x in league if x > L) / len(league) for L in LINES}

    # ---- validate on Saturday's real results -------------------------------
    try:
        res = json.load(open(os.path.join(DATA, 'results_2026-10-24.json')))
        man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
        import re, unicodedata

        def norm(s):
            s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
            return re.sub(r'[^a-z0-9]', '', s.lower())
        idx = {}
        for mid, r in res.items():
            idx[(norm(r.get('home')), norm(r.get('away')))] = r
        refman = {r['name']: r for r in man['referees']}
        print('\n=== VALIDATION ON SATURDAY (bookings vs yellows) ===')
        for L in LINES:
            hits_y = hits_b = n = 0
            for f in man['weekend_fixtures']:
                if f.get('date') != '2026-10-24':
                    continue
                ref = (f.get('referee') or {}).get('name')
                r = refman.get(ref) or {}
                o35 = r.get('over_3_5')
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
                rv = (h.get('red_cards') or 0) + (a.get('red_cards') or 0)
                book = yv + 2 * rv
                n += 1
                hits_y += (yv > L)
                hits_b += (book > L)
            if n:
                print(f'  Over {L}:  yellows-only {hits_y}/{n} = {100*hits_y/n:5.1f}%   '
                      f'BOOKINGS {hits_b}/{n} = {100*hits_b/n:5.1f}%')
        print()
        for L in LINES:
            a, b, r2 = REG[L]
            preds = [max(0.0, min(1.0, (a + b * (r.get('over_3_5') or 50)) / 100))
                     for r in refman.values() if r.get('over_3_5')]
            print(f'  model P(>{L}) mean over the referee pool: {st.mean(preds)*100:.1f}%')
    except FileNotFoundError:
        pass

    out = {'REG': {str(k): v for k, v in REG.items()},
           'LEAG': {str(k): v for k, v in LEAG.items()},
           'league_mean_bookings': st.mean(league)}
    json.dump(out, open(os.path.join(DATA, 'bookings_model.json'), 'w'), indent=1)
    print('\nwrote bookings_model.json')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
EVERY SUNDAY MATCH — including the 21 with no referee assigned
==============================================================
Only 19 of Sunday's 40 fixtures have a referee with Sportmonks history, so
the first board missed 21 matches — including Barcelona v Real Madrid.

For the rest we fall back to the COMPETITION baseline: every competition's own
card distribution, computed from the 2026-27 cache, shrunk toward the global
league baseline when the competition has a thin sample.  Same regression and
same calibration curve as the referee-led model, just a worse (and clearly
labelled) driver.
"""
import json, collections, statistics as st, math, os, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
DATE = '2026-10-25'
CARD_LINES = [0.5, 1.5, 2.5, 3.5, 4.5]

CM = json.load(open(os.path.join(DATA, 'card_model_v3.json')))
CAL = {float(k): [(a, b, n) for a, b, n in v] for k, v in CM['CAL'].items()}
FINAL = {float(k): v for k, v in CM['FINAL'].items()}
LEAG = CM['LEAG']


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


def card_prob(line, o35):
    a, b, _ = FINAL[line]
    raw = max(0.0, min(1.0, (a + b * o35) / 100.0))
    return max(0.0, min(1.0, apply_cal(line, raw)))


def main():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refman = {r['name']: r for r in man['referees']}

    # ---- per-competition card baselines from the cache --------------------
    comp = collections.defaultdict(list)
    for mid, m in cache.items():
        y = m.get('yellows') or []
        if len(y) != 2:
            continue
        comp[m.get('compSlug') or 'other'].append(y[0] + y[1])
    glob = [x for v in comp.values() for x in v]
    gb = {L: sum(1 for x in glob if x > L) / len(glob) for L in CARD_LINES}
    glob_o35 = gb[3.5]
    print(f'global cache card baseline: mean {st.mean(glob):.2f}  '
          + ' '.join(f'P>{L} {100*gb[L]:.1f}%' for L in CARD_LINES))

    # shrink each competition's over-3.5 rate toward the global rate
    CB = {}
    for slug, v in comp.items():
        n = len(v)
        rate = sum(1 for x in v if x > 3.5) / n
        K = 20          # pseudo-count of global matches
        sr = (n * rate + K * glob_o35) / (n + K)
        CB[slug] = {'n': n, 'rate': rate, 'shrunk': sr}
    print(f'competition baselines: {len(CB)}  '
          + ', '.join(f"{k}:{100*v['rate']:.0f}%(n={v['n']})" for k, v in
                      sorted(CB.items(), key=lambda kv: -kv[1]['n'])[:10]))

    rows = []
    for f in man['weekend_fixtures']:
        if f.get('date') != DATE:
            continue
        ref = (f.get('referee') or {}).get('name')
        r = refman.get(ref) or {}
        o35 = r.get('over_3_5')
        games = r.get('games')
        mu = r.get('avg_yellows')
        src = 'REF'
        if o35 is None or o35 <= 0:
            cb = CB.get(f.get('comp_slug'))
            if cb is None:
                continue
            o35 = round(cb['shrunk'] * 100, 1)
            games = cb['n']
            mu = st.mean(comp[f.get('comp_slug')])
            src = 'COMP'
        probs = {L: card_prob(L, o35) for L in CARD_LINES}
        ml = None
        for L in [3.5, 2.5, 1.5, 0.5]:
            if probs[L] >= 0.55:
                ml = L
                break
        if ml is None:
            continue
        buf = ml - 1.0
        pb = probs[buf] if buf >= 0.5 else None
        rows.append(dict(ko=f.get('kickoff_time'), comp=f.get('comp_name'),
                         fx=f"{f.get('home_name')} v {f.get('away_name')}",
                         ref=ref, games=games, mu=mu, o35=o35, src=src,
                         model_line=ml, model_p=probs[ml], buf=buf, buf_p=pb))

    rows.sort(key=lambda r: (r['ko'], r['fx']))
    print(f'\nSunday fixtures with a card line: {len(rows)}')
    out = ['# EVERY SUNDAY 25 OCT 2026 MATCH — with the buffer line', '',
           '**Rule: if the model predicts over 8.5, we play over 7.5.**', '',
           '`REF` = the line comes from that referee\'s own history.',
           '`COMP` = no referee with history, so the line comes from that competition\'s',
           'own card record (weaker evidence — use these as fillers, not as anchors).',
           '', '| KO | Competition | Match | Model line | Model p | PLAY THIS | Buffered p | Driver | Referee |',
           '|----|-----------|-------|------------|---------|-----------|------------|--------|---------|']
    for r in rows:
        play = f"**Cards O{r['buf']}**" + (f" ({r['buf_p']*100:.1f}%)" if r['buf_p'] else '')
        out.append(f"| {r['ko']} | {r['comp']} | {r['fx']} | Cards O{r['model_line']} | "
                   f"{r['model_p']*100:.1f}% | {play} | "
                   f"{(f'{r[chr(98)+chr(117)+chr(102)+chr(95)+chr(112)]*100:.1f}%' if r['buf_p'] else '—')} | "
                   f"{r['src']} | {(r['ref'] or '—')} |")
    out += ['', '## Fixtures with NO card line', '']
    covered = {r['fx'] for r in rows}
    miss = [f for f in man['weekend_fixtures']
            if f.get('date') == DATE and f"{f.get('home_name')} v {f.get('away_name')}" not in covered]
    if miss:
        out.append('| KO | Competition | Match | Why |')
        out.append('|----|-----------|-------|-----|')
        for f in sorted(miss, key=lambda f: f.get('kickoff_time')):
            why = 'no referee' if not (f.get('referee') or {}).get('name') else 'competition not in cache'
            out.append(f"| {f.get('kickoff_time')} | {f.get('comp_name')} | "
                       f"{f.get('home_name')} v {f.get('away_name')} | {why} |")
    else:
        out.append('None — every Sunday fixture has a line.')
    p = os.path.join(DATA, 'SUNDAY_ALL_MATCHES_2026-10-25.md')
    open(p, 'w').write('\n'.join(out) + '\n')
    json.dump(rows, open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json'), 'w'), indent=1)
    print('wrote', p)
    print(f'  REF-driven: {sum(1 for r in rows if r["src"]=="REF")}   '
          f'COMP-driven: {sum(1 for r in rows if r["src"]=="COMP")}')


if __name__ == '__main__':
    main()

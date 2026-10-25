#!/usr/bin/env python3
"""
THE SUBSET TEST: "a hot side travelling to a bottom side"
=========================================================
Reads the walk-forward rows (form_1x2_walkforward.json) and asks, on past
matches only: when the AWAY side is in hot form and the HOME side is
bottom of its league, how often does the away side actually win / avoid
losing?  And what did the models say at the time?

No odds are used anywhere in this file.  The question is purely about how
often the thing happens.
"""
import json, os, math, collections

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
D = json.load(open(os.path.join(DATA, 'form_1x2_walkforward.json')))['rows']


def blk(r):
    return r['y']  # 0 home, 1 draw, 2 away


def rate(rows, pred):
    if not rows:
        return None
    n = len(rows)
    win = sum(1 for r in rows if pred(r)) / n
    return dict(n=n, rate=win)


def pkey_of(r):
    return r.get('p_final') or r.get('p3') or r.get('pb')


def show(name, rows, pkey):
    if not rows:
        print(f'{name:52s} n=0')
        return
    n = len(rows)
    aw = sum(1 for r in rows if r['y'] == 2) / n
    hw = sum(1 for r in rows if r['y'] == 0) / n
    dr = sum(1 for r in rows if r['y'] == 1) / n
    x2 = sum(1 for r in rows if r['y'] in (1, 2)) / n
    mp = sum(pkey_of(r)[2] for r in rows) / n
    m2 = sum(pkey_of(r)[1] + pkey_of(r)[2] for r in rows) / n
    print(f'{name:52s} n={n:4d}  away win {aw:6.1%}  draw {dr:5.1%}  home win {hw:6.1%}  '
          f'| X2 {x2:6.1%} | model P(away) {mp:6.1%}  model P(X2) {m2:6.1%}')


def l5(r, side):
    return (r['hf'] if side == 'h' else r['af'])['l5']


def is_hot(r, side, thr):
    v = l5(r, side)
    return v is not None and v >= thr


def is_bottom(r, side, frac=2 / 3, min_games=4):
    f = r['hf'] if side == 'h' else r['af']
    pos, nt, lg = f.get('pos'), f.get('nt'), f.get('league_g')
    if not pos or not nt or (lg or 0) < min_games:
        return False
    return pos > frac * nt


def main():
    print(f'walk-forward rows: {len(D)}\n')
    print('=== BASELINE (all rows) ===')
    show('all matches', D, 'p3')
    print()
    print('=== FORM ALONE ===')
    for thr in (1.6, 1.8, 2.0, 2.2):
        show(f'away side HOT (last5 ppg >= {thr})', [r for r in D if is_hot(r, 'a', thr)], 'p3')
        show(f'home side HOT (last5 ppg >= {thr})', [r for r in D if is_hot(r, 'h', thr)], 'p3')
    print()
    print('=== BOTTOM SIDE ALONE ===')
    show('home side BOTTOM third of its league', [r for r in D if is_bottom(r, 'h')], 'p3')
    show('away side BOTTOM third of its league', [r for r in D if is_bottom(r, 'a')], 'p3')
    print()
    print('=== THE USER\'S CASE: HOT side TRAVELLING to a BOTTOM side ===')
    for thr in (1.6, 1.8, 2.0, 2.2):
        sub = [r for r in D if is_hot(r, 'a', thr) and is_bottom(r, 'h')]
        show(f'AWAY hot (>={thr}) + HOME bottom third', sub, 'p3')
        sub2 = [r for r in D if is_hot(r, 'h', thr) and is_bottom(r, 'a')]
        show(f'HOME hot (>={thr}) + AWAY bottom third', sub2, 'p3')
    print()
    print('=== CONTROL: bottom home, away NOT hot (isolates the form effect) ===')
    for thr in (1.8, 2.0):
        show(f'HOME bottom + away NOT hot (>{thr})',
             [r for r in D if is_bottom(r, 'h') and not is_hot(r, 'a', thr)], 'p3')
    print()
    print('=== WHAT THE MODELS SAID vs WHAT HAPPENED (away hot 2.0 + home bottom) ===')
    sub = [r for r in D if is_hot(r, 'a', 2.0) and is_bottom(r, 'h')]
    for key, nm in (('p_rating', 'rating model alone'), ('p_final', 'rating+form (final)')):
        if sub:
            mp = sum(r[key][2] for r in sub) / len(sub)
            mx = sum(r[key][1] + r[key][2] for r in sub) / len(sub)
            print(f'  {nm:22s} mean P(away) {mp:6.1%}   mean P(X2) {mx:6.1%}')
    if sub:
        print(f'  {"ACTUAL":22s} away win {sum(1 for r in sub if r["y"]==2)/len(sub):6.1%}   '
              f'X2 {sum(1 for r in sub if r["y"] in (1,2))/len(sub):6.1%}   (n={len(sub)})')
    print()
    print('=== HOT AWAY, HOME NOT BOTTOM (for contrast) ===')
    show('away hot 2.0, home NOT bottom',
         [r for r in D if is_hot(r, 'a', 2.0) and not is_bottom(r, 'h')], 'p3')


if __name__ == '__main__':
    main()

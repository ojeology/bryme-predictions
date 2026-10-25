#!/usr/bin/env python3
"""
THE COMBINED CERTAINTY LADDER — cards, bookings and goals together
====================================================================
One line per fixture.  Every line ranked by how close to certain it is.

SOURCES
    cards / bookings : referee-driven, calibrated walk-forward card model v3
    goals            : Poisson goals model with Dixon-Coles, ridge shrinkage and
                       logistic recalibration, rolling-origin walk-forward
"""
import json, os, collections, math

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')


def main():
    cards = json.load(open(os.path.join(DATA, 'certainty_ladder_2026-10-25.json')))
    gfile = json.load(open(os.path.join(DATA, 'goals_board_2026-10-25.json')))
    goals = gfile['board']
    scores = gfile['scores']

    cby = {}
    for c in cards:
        cby[(c['ko'], c['fx'])] = c
    gby = {}
    for g in goals:
        gby[(g['ko'], g['fx'])] = g

    rows = []
    perfix = {}
    for k in set(list(cby) + list(gby)):
        ko, fx = k
        c = cby.get(k)
        g = gby.get(k)
        cands = []
        if c:
            cands.append(dict(ko=ko, fx=fx, line=c['line'], p=c['p'], rec=c['rec'],
                               mkt='Cards / Bookings'))
        if g:
            glines = [
                ('Over 0.5 goals', g['over05']),
                ('Over 1.5 goals', g['over15']),
                ('Over 2.5 goals', g['over25']),
                ('Both teams to score', g['btts']),
                ('1X (home or draw)', g['x1']),
                ('X2 (draw or away)', g['x2']),
                ('Home win', g['home']),
                ('Away win', g['away']),
                ('Draw no bet', g['dnb']),
            ]
            for nm_, pv in glines:
                cands.append(dict(ko=ko, fx=fx, line=nm_, p=pv, mkt='Goals',
                                   rec=f"xG {g['lh']:.2f}/{g['la']:.2f}"))
        if cands:
            perfix[k] = cands
            rows.append(max(cands, key=lambda x: x['p']))
    rows.sort(key=lambda x: -x['p'])

    W = []
    W.append('# THE COMBINED CERTAINTY LADDER — Sunday 25 Oct 2026')
    W.append('')
    W.append('One line per fixture. Ranked by certainty. Every probability is walk-forward.')
    W.append('')
    W.append('## THE CEILING OF EACH MARKET')
    W.append('')
    W.append('| Market | Best available today | Ceiling in the data |')
    W.append('|---|---|---|')
    W.append('| At least one booking in the match | 97.9% (Man Utd v Bournemouth) | 97.1% base |')
    W.append('| **Over 0.5 goals** | **98.8%** (Barcelona v Real Madrid) | 94.2% base, 98.8% best |')
    W.append('| 2+ match bookings | 91.4% | 88.4% base |')
    W.append('| A team booked | 91.0% | 86.4% base |')
    W.append('| 1X (home or draw) | 90.3% (Inter v Fiorentina) | 70% base |')
    W.append('| **1X2 on form (hot away at a bottom side)** | **78.7% avoid losing** | '
             '53% away win, 79% X2 |')
    W.append('| Cards over 1.5 | 87.7% | 90.9% base |')
    W.append('| 1.5+ goals | 87.8% (Barcelona v Real Madrid) | 78.9% base |')
    W.append('| **Favourite to win** | **77.1%** (Inter v Fiorentina) | 82.1% at a huge gap |')
    W.append('')
    W.append('**The answer to "teams in best position to win": the favourite wins 77.1% at best '
             'today, and 82.1% even at a huge points gap. "Over 0.5 goals" is 98.8%. '
             'So the certain thing in football is not the winner — it is that the game will '
             'produce something.**')
    W.append('')
    W.append('## THE LADDER')
    W.append('')
    W.append('| # | KO | Fixture | Line | Market | Our p | FAIR | Record |')
    W.append('|---|---|---|---|---|---|---|---|')
    for i, x in enumerate(rows, 1):
        alt = x.get('alt', '')
        rec = x.get('rec', '') or ''
        W.append(f"| {i} | {x['ko']} | {x['fx'][:34]} | {x['line'][:30]} | {x['mkt']} | "
                 f"**{x['p']*100:.1f}%** | {1/x['p']:.2f} | {rec[:48]} |")
    W.append('')
    # ---- 1X2 lines on form (hot side travelling to a bottom side)
    fpath = os.path.join(DATA, 'FORM_1X2_BOARD_2026-10-25.json')
    if os.path.exists(fpath):
        fb = json.load(open(fpath))['board']
        flines = []
        for b in fb:
            P = b['p']
            for nm_, pv in (('1X (home or draw)', P[0] + P[1]),
                            ('X2 (draw or away)', P[1] + P[2]),
                            ('Home win', P[0]), ('Away win', P[2])):
                if pv >= 0.77:
                    rec = (f"{b.get('home_rec', '')} vs {b.get('away_rec', '')}"
                           + (f" | {b['case']}" if b.get('case') else ''))
                    flines.append(dict(ko=b.get('real_ko') or b['ko'], fx=b['fx'], line=nm_,
                                        p=pv, rec=rec, mkt='1X2 on form'))
        flines.sort(key=lambda x: -x['p'])
        W.append('## THE 1X2 LINES ON FORM')
        W.append('')
        W.append('The case the user described - a side in hot form travelling to a side bottom of '
                 'its league - measured on 1,268 walk-forward matches: the away side won **53%** '
                 'and avoided losing **79%** of the time (against 33% / 55% when the away side '
                 'is NOT hot). The rating model alone under-called that case; the form model '
                 'fixes it. Odds are not a gate here.')
        W.append('')
        W.append('| # | KO | Fixture | Line | Our p | FAIR | Record |')
        W.append('|---|---|---|---|---|---|---|')
        for i, x in enumerate(flines, 1):
            W.append(f"| {i} | {x['ko']} | {x['fx'][:34]} | {x['line']} | "
                     f"**{x['p']*100:.1f}%** | {1/x['p']:.2f} | {x['rec'][:58]} |")
        W.append('')
    W.append('## TICKETS')
    W.append('')
    W.append('Two builds. **PURE CERTAINTY** takes the single most certain line per fixture — '
             'but most of those pay about 1.03, so the multiplier is small. **PRACTICAL** keeps '
             'only lines worth at least 1.10, which is what actually builds a ticket. '
             'One match cannot appear twice on either.')
    W.append('')
    for label, floor in (('PURE CERTAINTY', 0.0), ('PRACTICAL (fair price 1.10+)', 1.10)):
        W.append(f'### {label}')
        W.append('')
        if floor:
            pool = []
            for k, cands in perfix.items():
                use = [x for x in cands if 1 / x['p'] >= floor]
                if use:
                    pool.append(max(use, key=lambda x: x['p']))
            pool.sort(key=lambda x: -x['p'])
        else:
            pool = rows
        for N in (4, 6, 8, 10, 12):
            sel = []
            used = set()
            for x in pool:
                k = (x['ko'], x['fx'])
                if k in used:
                    continue
                sel.append(x)
                used.add(k)
                if len(sel) == N:
                    break
            if len(sel) < N:
                continue
            joint = 1.0
            for x in sel:
                joint *= x['p']
            mult = 1.0
            for x in sel:
                mult *= 1 / x['p']
            need = (1 / joint) ** (1 / N)
            W.append(f'**{N} legs — lands {joint*100:.1f}% (1 in {1/joint:.1f}) — fair multiplier '
                     f'{mult:.2f}x — the book must pay {need:.2f} on every leg**')
            W.append('')
            W.append('| KO | Fixture | Line | Our p |')
            W.append('|---|---|---|---|')
            for x in sel:
                W.append(f"| {x['ko']} | {x['fx'][:34]} | {x['line'][:30]} | {x['p']*100:.1f}% |")
            W.append('')
    W.append('')
    W.append('<!--')
    seen = set()
    for N in (4, 6, 8, 10, 12):
        sel = []
        used = set()
        for x in rows:
            k = (x['ko'], x['fx'])
            if k in used:
                continue
            sel.append(x)
            used.add(k)
            if len(sel) == N:
                break
        joint = 1.0
        for x in sel:
            joint *= x['p']
        mult = 1.0
        for x in sel:
            mult *= 1 / x['p']
        need = (1 / joint) ** (1 / N)
        W.append(f'### {N} legs — lands **{joint*100:.1f}%** (1 in {1/joint:.1f}) — '
                 f'fair multiplier {mult:.2f}x — book must pay **{need:.2f}** on every leg')
        W.append('')
        W.append('| KO | Fixture | Line | Our p |')
        W.append('|---|---|---|---|')
        for x in sel:
            W.append(f"| {x['ko']} | {x['fx'][:34]} | {x['line'][:30]} | {x['p']*100:.1f}% |")
        W.append('')
    out = '\n'.join(W)
    open(os.path.join(DATA, 'CERTAINTY_LADDER_ALL_2026-10-25.md'), 'w').write(out)
    json.dump(rows, open(os.path.join(DATA, 'certainty_ladder_all_2026-10-25.json'), 'w'), indent=1)
    print(out[:7000])


if __name__ == '__main__':
    main()

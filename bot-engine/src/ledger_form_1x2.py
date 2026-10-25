#!/usr/bin/env python3
"""
Log the 1X2-on-form lines to the permanent ledger.

The board we publish is the one that goes in - append only, probability
recorded at publication time, so it can be graded after the matches.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
sys.path.insert(0, HERE)
import ledger

THRESH = 0.77          # publish a line only if the model is this sure
MODEL_VER = 'form_1x2 v1 (goals rating + last-5 form blend, walk-forward)'


def main():
    board = json.load(open(os.path.join(DATA, 'FORM_1X2_BOARD_2026-10-25.json')))
    rows = []
    for b in board['board']:
        P = b['p']
        cands = [('1X', P[0] + P[1]), ('X2', P[1] + P[2])]
        best = max(cands, key=lambda x: x[1])
        if best[1] < THRESH:
            continue
        r = ledger.add_pick(
            date=b.get('real_date') or '2026-10-25', ko=b.get('real_ko') or b.get('ko'),
            home=b['home'], away=b['away'], comp=b.get('comp'),
            market='Goals', line=best[0], prob=best[1],
            model_line=best[0], model_prob=best[1],
            plan=round(1.0 / best[1], 3), buffered=False,
            referee=None, ref_games=0, driver='FORM',
            src='FORM_1X2', created='2026-10-25T16:00:00Z')
        r['model_ver'] = MODEL_VER
        rows.append(r)
    added, dup = ledger.add_rows(rows)
    print(f'logged {added} new 1X2 form lines to the ledger ({dup} already there)')
    for r in rows:
        print(f"  {r['date']} {r['ko']} {r['home']} v {r['away']:28s} {r['line']:3s} "
              f"{r['prob']:.3f}  fair {r['plan']}")


if __name__ == '__main__':
    main()

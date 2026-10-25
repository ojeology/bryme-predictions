#!/usr/bin/env python3
"""
LEDGER RECALIBRATION — 25 Oct 2026
===================================
The Sunday card rows were written to the ledger with the RAW regression
probability (e.g. Sunderland v Leeds O2.5 stored at 88.7%).  Everything we
publish and price on is the CALIBRATED probability (79.6% for the same leg).
Two different numbers for the same pick is exactly the sort of thing that
breaks an audit trail, so the ledger is corrected.

Nothing here changes WHICH pick was made, or WHEN.  Only the probability
attached to it moves, and the old value is kept in `prob_raw` so the change is
visible and reversible.  The correction is written to LEDGER_CORRECTIONS.jsonl.

Team-card rows are corrected for a different reason: they were priced off the
team's own card record, which a split-half test over 242 teams showed is
noise (first-half rate vs second-half rate, r = +0.13 for over 0.5).  They are
re-priced off the referee, which does carry signal.
"""
import json, os, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
sys.path.insert(0, HERE)

LEDGER = os.path.join(DATA, 'LEDGER.jsonl')
CORR = os.path.join(DATA, 'LEDGER_CORRECTIONS.jsonl')

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


def main():
    rows = [json.loads(l) for l in open(LEDGER)]
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refman = {r['name']: r for r in man['referees']}
    teamref = json.load(open(os.path.join(DATA, 'team_cards_referee_model.json')))
    base05 = teamref['0.5']['base']
    tbl05 = teamref['0.5']['table']

    n_card = n_team = 0
    for r in rows:
        if r.get('date') != '2026-10-25':
            continue
        mkt = r.get('market')
        line = str(r.get('line', ''))
        if mkt == 'Cards' and r.get('referee') in refman:
            o35 = refman[r['referee']].get('over_3_5')
            if o35 is None:
                continue
            thr = float(''.join(ch for ch in line if ch.isdigit() or ch == '.') or 2.5)
            a, b, _ = FINAL[thr]
            raw = max(0., min(1., (a + b * o35) / 100.))
            cal = apply_cal(thr, raw)
            if r.get('prob_raw') is None:
                r['prob_raw'] = r['prob']
                r['prob'] = round(cal, 4)
                r['model_prob'] = round(cal, 4)
                r['prob_note'] = 'recalibrated 2026-10-25: raw regression -> calibrated curve'
                n_card += 1
        elif mkt == 'Cards (team)':
            ref = r.get('referee')
            rv = tbl05.get(ref)
            eff = rv['eff'] if rv else 0.0
            p = max(0.02, min(0.98, base05 + eff))
            if abs(p - r['prob']) > 0.005:
                r['prob_raw'] = r['prob']
                r['prob'] = round(p, 4)
                r['model_prob'] = round(p, 4)
                r['prob_note'] = ('repriced 2026-10-25: team card record shown to be noise '
                                   '(split-half r=+0.13); priced off the referee instead')
                n_team += 1

    with open(LEDGER, 'w') as f:
        for r in rows:
            f.write(json.dumps(r) + '\n')

    with open(CORR, 'a') as f:
        f.write(json.dumps(dict(
            date='2026-10-25', when='2026-10-25T12:30:00Z',
            what=f'{n_card} Sunday card rows recalibrated, {n_team} team-card rows repriced off the referee',
            why=('the published board and the ledger disagreed: the board showed the calibrated '
                 'probability, the ledger stored the raw regression value. Team-card rows were '
                 'priced off the team own record, which does not predict.'),
            picks_changed='probability only - no pick was added, removed or moved')) + '\n')

    print(f'recalibrated {n_card} Sunday card rows, repriced {n_team} team-card rows')
    print(f'correction logged to {CORR}')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
PRICE SCREEN — which of today's card lines are worth taking at the book's price
==============================================================================
The book prices Cards O2.5 in a FLAT band (1.15 - 1.30 on every fixture we
priced on Saturday) regardless of who the referee is.  We price it off the
referee.  So the same 1.20 is a good price on a loud-referee fixture and a
bad price on a quiet one.

This screen prints, for every Sunday fixture:
  * our model probability for the buffered line and the model line
  * the fair price for each
  * what the book has to pay for the line to be worth taking

Then it checks the ONE thing the user can settle in 60 seconds: what does
SportyBet actually pay on a quiet-referee fixture vs a loud-referee one?
"""
import json, os, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
sys.path.insert(0, HERE)
from ledger import read_jsonl, add_rows, add_pick

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


def cp(line, o35):
    a, b, _ = FINAL[line]
    raw = max(0., min(1., (a + b * o35) / 100.))
    return max(0., min(1., apply_cal(line, raw)))


def main():
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refman = {r['name']: r for r in man['referees']}

    print('=' * 92)
    print('PRICE SCREEN — what the book must pay for each line to be worth taking')
    print('=' * 92)
    print(f"{'KO':>6s} {'FIXTURE':36s} {'ref':20s} {'o35':>4s} | "
          f"{'buf line':>8s} {'p':>6s} {'FAIR':>6s} | {'model line':>10s} {'p':>6s} {'FAIR':>6s}")
    rows = []
    for r in sorted(board, key=lambda r: (r['ko'], r['fx'])):
        ref = r['ref']
        rm = refman.get(ref) or {}
        o35 = rm.get('over_3_5')
        if o35 is None:
            o35 = 0
        if o35 <= 0:
            o35 = 1
        probs = {L: cp(L, o35) for L in (1.5, 2.5, 3.5)}
        ml = r['model_line']
        buf = r['buf']
        fm = 1.0 / probs[ml]
        fb = 1.0 / probs[buf] if buf in probs else None
        rows.append((r, o35, probs, ml, buf, fm, fb))
        print(f"{r['ko']:>6s} {r['fx'][:35]:36s} {(ref or '—')[:19]:20s} {o35:4d} | "
              f"{('O'+str(buf)):>8s} {probs[buf]*100:5.1f}% {fb:6.2f} | "
              f"{('O'+str(ml)):>10s} {probs[ml]*100:5.1f}% {fm:6.2f}")

    # the 60-second test
    print('\n' + '=' * 92)
    print('THE TEST TO RUN: does the book pay MORE on a loud referee than a quiet one?')
    print('=' * 92)
    loud = sorted([x for x in rows if x[1] >= 65 and x[0].get('ref')], key=lambda x: -x[1])[:4]
    quiet = sorted([x for x in rows if 30 <= x[1] <= 50 and x[0].get('ref')],
                    key=lambda x: x[1])[:4]
    print('\nLOUD referees (over-3.5 rate 65%+): look up Cards O2.5')
    for r, o35, pr, ml, buf, fm, fb in loud:
        print(f"   {r['ko']}  {r['fx'][:38]:40s} {(r.get('ref') or '—')[:18]:20s} o35 {o35:3d}%  "
              f"our p {pr[ml]*100:.1f}%  fair {fm:.2f}")
    print('\nQUIET referees (over-3.5 rate 45%-): look up Cards O2.5')
    for r, o35, pr, ml, buf, fm, fb in quiet:
        print(f"   {r['ko']}  {r['fx'][:38]:40s} {(r.get('ref') or '—')[:18]:20s} o35 {o35:3d}%  "
              f"our p {pr[ml]*100:.1f}%  fair {fm:.2f}")
    print("""
If the book pays about the SAME on both lists, the book prices cards off a
league average and ignores the referee.  Then:
  * loud-referee card lines are worth taking (the book underprices them)
  * quiet-referee card lines are a trap (the book overprices them)
On Saturday all 7 priced lines were loud-referee fixtures and 6 of 7 won.
""")

    # ---- log the team-cards market into the ledger ------------------------
    tc = json.load(open(os.path.join(DATA, 'team_cards_o05_2026-10-25.json')))
    trows = []
    for r in tc:
        if r['p'] < 0.85:
            continue
        parts = [x.strip() for x in r['fx'].split(' v ')]
        home, away = parts[0], parts[1]
        trows.append(add_pick(
            date='2026-10-25', ko=r['ko'], home=home, away=away, comp=r['comp'],
            market='Cards (team)', line=f"O0.5 {r['side']}", prob=r['p'],
            model_line='O0.5', model_prob=r['p'], buffered=False,
            referee=r['ref'], ref_games=r['ref_n'], driver=r['driver'],
            src='SUNDAY_TEAM_CARDS_O05', created='2026-10-25T10:00:00Z'))
    n, dup = add_rows(trows)
    print(f'\nlogged {n} team-cards over-0.5 lines into the ledger ({dup} duplicates)')


if __name__ == '__main__':
    main()

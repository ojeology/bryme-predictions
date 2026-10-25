#!/usr/bin/env python3
"""
REAL PRICES — append-only book prices, joined to the ledger
============================================================
The picks file records what we said.  This file records what the book actually
paid.  Keeping prices in their own append-only file means a pick can never be
quietly edited after the fact, and every line can be scored on what it
actually returned.

A price row: date, home, away, market, line, odds, side (optional), source.
"""
import json, os, sys, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
LEDGER = os.path.join(DATA, 'LEDGER.jsonl')
PRICES = os.path.join(DATA, 'LEDGER_PRICES.jsonl')


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def read_jsonl(p):
    if not os.path.exists(p):
        return []
    return [json.loads(l) for l in open(p) if l.strip()]


def add(date, home, away, market, line, odds, side='', source='user'):
    row = dict(date=date, home=home, away=away, market=market, line=line,
               odds=round(float(odds), 4), side=side, source=source,
               recorded='2026-10-25T12:00:00Z')
    row['id'] = f"{date}|{norm(home)}|norm{''}|{norm(away)}|{market}|{norm(line)}|{norm(side)}|{row['odds']}"
    rows = read_jsonl(PRICES)
    if any(r['id'] == row['id'] for r in rows):
        return 'duplicate'
    with open(PRICES, 'a') as f:
        f.write(json.dumps(row) + '\n')
    return 'added'


def report():
    picks = read_jsonl(LEDGER)
    prices = read_jsonl(PRICES)
    results = {r['id']: r for r in read_jsonl(os.path.join(DATA, 'LEDGER_RESULTS.jsonl'))}
    # pick index by (date, home, away, market, line-ish)
    idx = {}
    for p in picks:
        key = (p['date'], norm(p['home']), norm(p['away']), p.get('market'), )
        idx.setdefault(key, []).append(p)
    print('=' * 84)
    print('REAL PRICES vs OUR FAIR PRICE')
    print('=' * 84)
    print(f"{'date':11s} {'fixture':34s} {'market':14s} {'line':14s} {'odds':>5s} "
          f"{'our p':>7s} {'FAIR':>6s} {'EV':>8s} {'result':>8s}")
    for pr in sorted(prices, key=lambda r: (r['date'], r['home'])):
        cands = idx.get((pr['date'], norm(pr['home']), norm(pr['away']), pr['market']), [])
        best = None
        for c in cands:
            cl = c.get('line', '').lower()
            ll = pr['line'].lower()
            if ll in cl or cl in ll or ll.replace('.', '') in cl.replace('.', '') \
               or cl.replace('.', '') in ll.replace('.', ''):
                best = c
                break
        if best is None and cands:
            best = cands[0]
        if best is None:
            print(f"{pr['date']:11s} {pr['home'][:18]+' v '+pr['away'][:14]:34s} "
                  f"{pr['market']:14s} {pr['line']:14s} {pr['odds']:5.2f}  (no ledger pick)")
            continue
        p = best.get('prob') or best.get('model_prob') or 0
        fair = 1 / p if p > 0 else 0
        ev = p * pr['odds'] - 1
        res = results.get(best['id'])
        out = 'WIN' if (res and res['won']) else ('lose' if res else 'pending')
        print(f"{pr['date']:11s} {pr['home'][:18]+' v '+pr['away'][:14]:34s} {pr['market']:14s} "
              f"{pr['line']:14s} {pr['odds']:5.2f} {p*100:6.1f}% {fair:6.2f} "
              f"{ev*100:+7.1f}% {out:>8s}")
        print(f"{'':11s}   our pick: {best['market']} {best['line']}  model p "
              f"{(best.get('model_prob') or p)*100:.1f}%  ref {best.get('referee')}")


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == 'add':
        a = sys.argv[2:]
        print(add(a[0], a[1], a[2], a[3], a[4], a[5], a[6] if len(a) > 6 else ''))
    else:
        report()

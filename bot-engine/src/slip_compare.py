#!/usr/bin/env python3
"""
SLIP SHAPE TEST — is six card legs the right slip, or are fouls or corners better?

The current 6-leg is six Cards Over 2.5 legs on six different matches.  That
diversifies the MATCH risk but not the MARKET risk: all six are priced by the
same referee->cards map, so if that map is wrong they all die together.

This script builds the alternative shapes and compares them on:
  * the multiplier
  * the joint probability of the slip winning
  * the expected value (joint x product - 1)
  * how many different markets are stacked

Saturday only.
"""
import json, os, re, itertools, collections, math, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')
TARGET = 3.00
SATURDAY = '2026-10-24'
MIN_PX = 1.12


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', s)


def toks(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    t = set(re.findall(r'[a-z]+', s)) - {'fc', 'cf', 'sc', 'ac', 'afc', 'tsg', 'sk', 'fk',
                                         'cd', 'sd', 'ud', 'rc', 'club', 'de', 'of', 'the',
                                         'us', 'ss', 'as', 'nk', 'if', 'ca'}
    return t or set(re.findall(r'[a-z]+', s))


def fx_key(fx):
    s = re.sub(r'\s+(v|vs|versus)\s+', '|', fx, flags=re.I)
    parts = sorted(re.sub(r'[^a-z0-9]', '', x.lower())
                   for x in unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().split('|'))
    # strip a leading list number ('1. FC Koln') and match on the first 4
    # letters, so 'Manchester City' and 'Man City' are the same club
    return '|'.join(re.sub(r'^[0-9]+', '', x)[:4] for x in parts)


def main():
    # ---------------------------------------------------------------- candidates
    board = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
    cands = []
    for r in board:
        if r.get('date') != SATURDAY:
            continue
        fx = f"{r['home']} v {r['away']}"
        for pk, tk, pn in (('p2', 'min2_5', 'O2.5'), ('p3', 'min3_5', 'O3.5')):
            p, take = r.get(pk), r.get(tk)
            if not p or not take or take < MIN_PX:
                continue
            cands.append(dict(fx=fx, ko=r.get('ko'), market='Cards', line=pn,
                               prob=p / 100, take=take, src='card board',
                               note=f"{r['ref']} {r['ref_games']}g {r['ref_ypg']}/g"))
    for m in fb.get('matches', []):
        if m.get('date') != SATURDAY:
            continue
        for l in m.get('lines', []):
            if l.get('take', 0) < MIN_PX:
                continue
            cands.append(dict(fx=m['fx'], ko=m.get('ko'), market='Fouls (total)',
                               line=f"O{l['line']}", prob=l['p'], take=l['take'],
                               src='fouls board',
                               note=f"ref {(m.get('ref_avg') or 0):.1f}/g over {m.get('ref_n')}g"))
    for m in fb.get('team_fouls', []):
        if m.get('date') != SATURDAY:
            continue
        for l in m.get('ladder', []):
            if l.get('take', 0) < MIN_PX:
                continue
            cands.append(dict(fx=m['fx'], ko=m.get('ko'), market='Fouls (team)',
                               line=f"O{l['line']}", prob=l['p'], take=l['take'],
                               src='team fouls board',
                               note=f"{m.get('side')} {(m.get('rate') or 0):.1f}/g over {m.get('n')}g"))
    # corners / shots out of the weekend slip (Saturday rows only)
    board_dates = {}
    for r in board:
        board_dates[fx_key(f"{r['home']} v {r['away']}")] = r.get('date')
    slip_path = os.path.join(ROOT, 'WEEKEND_BUFFER_SLIP_2026-10-24.md')
    if os.path.exists(slip_path):
        for raw in open(slip_path):
            raw = raw.strip()
            if not raw.startswith('|'):
                continue
            cells = [c.strip() for c in raw.strip('|').split('|')]
            if len(cells) < 6:
                continue
            # the main slip table: | # | KO | **Fixture** | Pick | Model | ... | ~1.xx |
            mkt = None
            for cc in cells:
                mm = re.search(r'(Corners|Fouls|Shots|Cards|Yellow Cards)', cc, re.I)
                if mm:
                    mkt = mm.group(1).title()
                    break
            if not mkt:
                continue
            if not re.search(r'Over\s+[`\d]', ' '.join(cells)):
                continue
            lm = re.search(r'Over\s+[`\s]*([0-9]+\.[0-9]+)', ' '.join(cells))
            pm = re.search(r'~([0-9]+\.[0-9]+)', raw)
            if not lm or not pm:
                continue
            fx = None
            for cc in cells:
                cc2 = cc.replace('**', '').strip()
                if ' v ' in cc2 or ' vs ' in cc2.lower():
                    fx = cc2
                    break
            if not fx:
                continue
            px = float(pm.group(1))
            prob = 1.0 / px
            if prob > 0.995:
                continue
            day = board_dates.get(fx_key(fx))
            if day is None:
                # the main slip table is the Saturday slip; the day-tagged table
                # tells us the rest
                if re.search(r'\|\s*Sun\s*\|', raw):
                    day = '2026-10-25'
                elif re.search(r'\|\s*Sat\s*\|', raw):
                    day = '2026-10-24'
                else:
                    day = SATURDAY
            if '(sun' in fx.lower() or '(sat' in fx.lower():
                continue
            if day != SATURDAY:
                continue
            cands.append(dict(fx=fx, ko=None, market=mkt, line=f"O{lm.group(1)}",
                               prob=prob, take=round(px * 1.05, 3), src='weekend slip',
                               note='old engine fair price'))

    # real prices
    try:
        prices = json.load(open(os.path.join(DATA, 'football_prices_in.json')))
    except Exception:
        prices = []
    SY = {'booking': 'Cards', 'bookings': 'Cards', 'booking points': 'Cards',
          'cards': 'Cards', 'yellow cards': 'Cards', 'corners': 'Corners',
          'shots': 'Shots', 'fouls': 'Fouls'}
    real = {}
    for d in prices:
        m = (d.get('market') or '').strip().lower()
        mk = SY.get(m) or next((v for k, v in SY.items() if k in m), d.get('market'))
        ln = float(d.get('line'))
        if 'point' in m and ln >= 10:
            ln = math.floor(ln / 10 * 2) / 2
        real[(fx_key(d['fixture']), mk, round(ln, 2))] = float(d['price'])

    for c in cands:
        c['price'] = real.get((fx_key(c['fx']), c['market'].split(' ')[0],
                                float(c['line'].replace('O', ''))))
        if c['price'] is None:
            c['price'] = c['take']
            c['booked'] = False
        else:
            c['booked'] = True
        c['ev'] = c['prob'] * c['price'] - 1

    booked = [c for c in cands if c['booked']]
    print(f'Saturday candidates: {len(cands)} | legs with a real book price: {len(booked)}')
    print(f'{"market":16s} {"n":>4s} {"best leg":>46s} {"p":>7s} {"price":>7s} {"EV":>7s}')
    bym = collections.defaultdict(list)
    for c in cands:
        bym[c['market']].append(c)
    for mk, v in sorted(bym.items()):
        b = max(v, key=lambda c: c['ev'])
        print(f'{mk:16s} {len(v):4d} {b["fx"][:46]:46s} {b["prob"]*100:6.1f}% '
              f'{b["price"]:7.2f} {b["ev"]*100:+6.1f}%')
    print()

    # ---------------------------------------------------------------- shapes
    def build(name, legs, min_markets=None, max_markets=None, n=None):
        pool = legs
        best = None
        for combo in itertools.combinations(pool, n):
            if len({fx_key(c['fx']) for c in combo}) < n:
                continue
            mk = {c['market'] for c in combo}
            if min_markets and len(mk) < min_markets:
                continue
            if max_markets and len(mk) > max_markets:
                continue
            prod = 1.0
            joint = 1.0
            for c in combo:
                prod *= c['price']
                joint *= c['prob']
            if prod < TARGET or prod > 3.40:
                continue
            ev = joint * prod - 1
            key = (round(joint, 5), round(ev, 5))
            if best is None or key > best[0]:
                best = (key, combo, prod, joint, ev)
        print(f'--- {name} ---')
        if not best:
            print('   no slip found')
            return None
        _, combo, prod, joint, ev = best
        print(f'   {prod:.3f}x | joint {joint*100:.1f}% | EV {ev*100:+.1f}% | '
              f'{len({c["market"] for c in combo})} market(s)')
        for c in sorted(combo, key=lambda c: -c['ev']):
            print(f'      {c["fx"][:30]:30s} {c["ko"] or "":>5s} {c["market"]:14s} '
                  f'{c["line"]:>6s} p={c["prob"]*100:5.1f}% px={c["price"]:.2f} '
                  f'{"(book)" if c["booked"] else ""} EV={c["ev"]*100:+.1f}%')
        print()
        return best

    # keep the pool small so the search finishes
    keep = []
    for mk, v in bym.items():
        v.sort(key=lambda c: -c['ev'])
        keep += v[:7]
    # plus every booked leg
    keep += booked
    seen = set()
    pool = []
    for c in keep:
        k = (fx_key(c['fx']), c['market'], c['line'])
        if k in seen:
            continue
        seen.add(k)
        pool.append(c)

    print('=' * 96)
    print('SLIP SHAPES — all Saturday')
    print('=' * 96)
    build('A. Six card legs (what you have priced)', pool, max_markets=1, n=6)
    build('B. Four card legs only', pool, max_markets=1, n=4)
    build('C. Mixed: cards + fouls (2+ markets)', pool, min_markets=2, n=4)
    build('D. Mixed: cards + fouls (2+ markets), 5 legs', pool, min_markets=2, n=5)
    build('E. Mixed: 3 markets, 5 legs', pool, min_markets=3, n=5)
    # and the shapes that avoid the corners lines entirely — corners come from
    # the old engine and the only measured corners record we have is negative
    nocorner = [c for c in pool if c['market'] != 'Corners']
    build('F. Cards + fouls only, 4 legs (NO corners)', nocorner, min_markets=2, n=4)
    build('G. Cards + fouls only, 5 legs (NO corners)', nocorner, min_markets=2, n=5)
    build('H. Cards only, 5 legs', nocorner, max_markets=1, n=5)
    # TRUSTED pool only: the referee card board and the NEW walk-forward fouls
    # model.  No old-engine corners, no old-engine shots, no old-engine fouls.
    trusted = [c for c in pool if c['market'] in ('Cards', 'Fouls (total)', 'Fouls (team)')]
    print('   [trusted pool = card board + new walk-forward fouls model; '
          'corners/shots/old-engine fouls excluded]')
    build('I. TRUSTED: cards + new-model fouls, 4 legs', trusted, min_markets=2, n=4)
    build('J. TRUSTED: cards + new-model fouls, 5 legs', trusted, min_markets=2, n=5)
    build('K. TRUSTED: cards only, 4 legs', trusted, max_markets=1, n=4)

    print('=' * 96)
    print('WHAT THE MEASURED REAL PRICES SAY ABOUT EACH MARKET')
    print('=' * 96)
    led = json.load(open(os.path.join(DATA, 'real_book_prices_ledger.json')))
    agg = collections.defaultdict(lambda: [0, 0, 0.0])
    for r in led:
        k = (r.get('mk'), r.get('line'))
        agg[k][0] += 1 if r['won'] else 0
        agg[k][1] += 1
        agg[k][2] += r.get('px') or 0
    for k in sorted(agg, key=lambda k: -(agg[k][0] / agg[k][1] * agg[k][2] / agg[k][1])):
        w, n, sp = agg[k]
        ap = sp / n
        print(f'  {k[0]:8s} O{k[1]:<5} n={n:3d} hit={w:3d} ({100*w/n:5.1f}%) avg px {ap:.2f} '
              f'EV {100*(w/n*ap-1):+6.1f}%')


if __name__ == '__main__':
    main()

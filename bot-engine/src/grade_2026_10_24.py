#!/usr/bin/env python3
"""
GRADE EVERY PUBLISHED PICK FOR SATURDAY 24 OCT 2026
=====================================================
Grades:
  * Tier A / B / C legs from BEST_MARKETS_TODAY_2026-10-24.md
  * the Option A one-shot 200x ticket
  * the Option A3 cards-only ticket
  * the chain (LADDER_3X)
  * the BACKABLE_NOW priced sheet (the 9 real prices)
  * the user's placed leg: Napoli v Roma team fouls O10.5 @ 1.43
  * every leg on the model board, for a calibration read

Ground truth = FotMob match stats (fouls, yellow cards) fetched after the
matches.  A card line is graded on MATCH cards (home + away yellows), because
"Bookings O2.5" was proved to be a match-level card line.
"""
import json, os, re, math, unicodedata, collections, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
SAT = '2026-10-24'


def norm(s):
    if not s:
        return ''
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def key_home_away(h, a):
    return norm(h), norm(a)


def load_results():
    res = json.load(open(os.path.join(DATA, 'results_2026-10-24.json')))
    idx = {}
    for mid, r in res.items():
        h = norm(r.get('home'))
        a = norm(r.get('away'))
        idx[(h, a)] = r
        idx[(a, h)] = r          # reversed (shouldn't happen but be safe)
    return idx


def grade_leg(L, idx):
    """Return (won:bool|None, detail:str, actual:dict)."""
    fx = L['fx']
    parts = [p.strip() for p in re.split(r'\s+v\s+|\s+vs\s+', fx)]
    if len(parts) != 2:
        return None, 'could not split fixture', None
    h, a = key_home_away(parts[0], parts[1])
    r = idx.get((h, a))
    if r is None:
        # try fuzzy: match on distinctive tokens
        for (rh, ra), rr in idx.items():
            if rh in h or h in rh:
                if ra in a or a in ra:
                    r = rr
                    break
    if r is None:
        return None, 'no result found', None
    hs = r['stats'].get('home', {})
    as_ = r['stats'].get('away', {})
    hf = hs.get('fouls')
    af = as_.get('fouls')
    hy = hs.get('yellow_cards')
    ay = as_.get('yellow_cards')
    tot_f = (hf + af) if (hf is not None and af is not None) else None
    tot_y = (hy + ay) if (hy is not None and ay is not None) else None
    mkt = L['market']
    line = L['line']
    if mkt == 'Cards':
        if tot_y is None:
            return None, 'no card data', None
        thr = float(str(line).replace('O', '').replace('Over', '').strip())
        won = tot_y > thr
        return won, f'match cards {tot_y} (line {thr})', {'cards': tot_y, 'h': hy, 'a': ay}
    if mkt == 'Fouls (total)':
        if tot_f is None:
            return None, 'no foul data', None
        thr = float(str(line).replace('O', '').strip())
        won = tot_f > thr
        return won, f'match fouls {tot_f} (line {thr})', {'fouls': tot_f, 'h': hf, 'a': af}
    if mkt == 'Fouls (team)':
        side = 'AWAY' if 'AWAY' in str(line) else 'HOME'
        tf = af if side == 'AWAY' else hf
        thr = float(re.sub(r'[^0-9.]', '', str(line)))
        if tf is None:
            return None, 'no foul data', None
        won = tf > thr
        return won, f'{side} team fouls {tf} (line {thr})', {'tf': tf, 'side': side}
    return None, 'unknown market', None


def main():
    sys.path.insert(0, HERE)
    from model_only_slip import build_legs
    idx = load_results()
    legs = build_legs(SAT)

    # ---------- 1. every leg on the board ----------
    graded = []
    for L in legs:
        won, detail, act = grade_leg(L, idx)
        L['_won'] = won
        L['_detail'] = detail
        L['_act'] = act
        if won is not None:
            graded.append(L)

    by_mkt = collections.defaultdict(list)
    for L in graded:
        by_mkt[L['market']].append(L)

    print('=' * 78)
    print('SATURDAY 24 OCT 2026 — EVERY MODEL LEG GRADED AGAINST FOTMOB RESULTS')
    print('=' * 78)
    for mkt, Ls in sorted(by_mkt.items()):
        hits = sum(1 for x in Ls if x['_won'])
        print(f'\n{mkt:16s} {hits}/{len(Ls)} = {100*hits/len(Ls):.1f}% hit rate')
        # calibration by probability bucket
        buckets = collections.defaultdict(lambda: [0, 0])
        for x in Ls:
            b = round(x['prob'] * 20) * 5
            buckets[b][0] += 1
            buckets[b][1] += 1 if x['_won'] else 0
        for b in sorted(buckets):
            n, h = buckets[b]
            print(f'    model {b:3.0f}% band: {h:3d}/{n:3d} = {100*h/n:5.1f}%')

    # ---------- 2. the published tiers ----------
    board = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    rgmap = {f"{r['home']} v {r['away']}": r.get('ref_games') for r in board}
    fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
    refn = {m['fx']: (m.get('ref_n') or 0) for m in fb.get('matches', [])}
    for m in fb.get('team_fouls', []):
        refn.setdefault(m['fx'], m.get('ref_n') or 0)
    tnmap = {(m['fx'], m.get('side')): (m.get('n') or 0) for m in fb.get('team_fouls', [])}

    def tier_of(L):
        p = L['prob']
        if L['market'] == 'Cards':
            ok = (rgmap.get(L['fx']) or 0) >= 12
        elif L['market'] == 'Fouls (total)':
            ok = refn.get(L['fx'], 0) >= 12
        else:
            side = 'AWAY' if 'AWAY' in L['line'] else 'HOME'
            ok = tnmap.get((L['fx'], side), 0) >= 7
        if p >= 0.84 and ok:
            return 'A'
        if p >= 0.80 and ok:
            return 'B'
        if p >= 0.84:
            return 'C'
        if p >= 0.78:
            return 'D'
        return 'E'

    tiers = collections.defaultdict(list)
    for L in graded:
        tiers[tier_of(L)].append(L)

    print('\n' + '=' * 78)
    print('TIER RESULTS (the BEST_MARKETS_TODAY board)')
    print('=' * 78)
    for t in ('A', 'B', 'C', 'D'):
        Ls = tiers.get(t, [])
        if not Ls:
            continue
        hits = sum(1 for x in Ls if x['_won'])
        print(f'\nTIER {t}: {hits}/{len(Ls)} = {100*hits/len(Ls):.1f}%')
        for L in sorted(Ls, key=lambda x: -x['prob']):
            m = 'WIN ' if L['_won'] else 'LOSS'
            print(f"  {m} {L['prob']*100:5.1f}%  {L['fx'][:30]:32s} {L['market'][:13]:15s} "
                  f"{L['line']:12s} {L['_detail']}")

    # ---------- 3. the shipped tickets ----------
    def ticket_report(name, path):
        if not os.path.exists(path):
            return None
        rows = json.load(open(path))
        if not isinstance(rows, list):
            return None
        wins = []
        for L in rows:
            won, detail, act = grade_leg(L, idx)
            wins.append((L, won, detail))
        n = len(wins)
        w = sum(1 for _, x, _ in wins if x is True)
        unknown = sum(1 for _, x, _ in wins if x is None)
        print(f'\n--- {name}: {w}/{n} legs landed' + (f' ({unknown} ungraded)' if unknown else ''))
        for L, won, detail in wins:
            m = 'WIN ' if won else ('LOSS' if won is False else '??  ')
            print(f"  {m} {L['fx'][:30]:32s} {L['market'][:13]:15s} {L['line']:12s} {detail}")
        return wins

    print('\n' + '=' * 78)
    print('THE SHIPPED TICKETS')
    print('=' * 78)
    ticket_report('OPTION A — one-shot 200x',
                  os.path.join(DATA, 'mega_slip_100k_2026-10-24.json'))

    # ---------- 4. the priced sheet ----------
    print('\n' + '=' * 78)
    print('THE 9 REAL PRICES (BACKABLE_NOW)')
    print('=' * 78)
    priced = [L for L in legs if L.get('book')]
    tot_ev = 0.0
    for L in priced:
        won, detail, act = grade_leg(L, idx)
        ev = (L['prob'] * L['book'] - 1) if won is not None else None
        m = 'WIN ' if won else ('LOSS' if won is False else '??  ')
        print(f"  {m} {L['fx'][:30]:32s} {L['market'][:13]:15s} {L['line']:12s} "
              f"px {L['book']:.2f}  model {L['prob']*100:.1f}%  {detail}")
    # actual EV at real prices
    real = []
    for L in priced:
        won, detail, act = grade_leg(L, idx)
        if won is None:
            continue
        real.append((L, won))
    if real:
        hits = sum(1 for _, w in real if w)
        avg_px = sum(L['book'] for L, _ in real) / len(real)
        act_ev = hits / len(real) * avg_px - 1
        mdl_ev = sum(L['prob'] * L['book'] - 1 for L, _ in real) / len(real)
        print(f'\n  real-price sheet: {hits}/{len(real)} hit, avg px {avg_px:.3f}')
        print(f'  ACTUAL EV at those prices: {act_ev*100:+.1f}%')
        print(f'  MODEL said EV would be:    {mdl_ev*100:+.1f}%')
        print(f'  calibration gap:           {(act_ev-mdl_ev)*100:+.1f} pts')

    # ---------- 5. the user's placed leg ----------
    print('\n' + '=' * 78)
    print("THE USER'S PLACED LEG")
    print('=' * 78)
    placed = None
    for L in legs:
        if (L['fx'] == 'Napoli v Roma' and L['market'] == 'Fouls (team)'
                and 'AWAY' in str(L['line']) and str(L['line']).startswith('O10.5')):
            placed = L
            break
    if placed:
        won, detail, act = grade_leg(placed, idx)
        m = 'WON' if won else ('LOST' if won is False else '?')
        print(f"  Napoli v Roma  Team Fouls OVER 10.5 (AWAY/Roma) @ 1.43  ->  {m}")
        print(f"  {detail}")
        print(f"  Roma committed {act.get('tf')} team fouls; the line needed 11+")

    # the user's actual completed slip: 6 legs, ~4.213x
    print('\n  --- the 6-leg slip the user placed (4.213x) ---')
    want = [
        ('Paderborn v Hamburger SV', 'Cards', 'O2.5'),
        ('FC Augsburg v FC Union Berlin', 'Cards', 'O2.5'),
        ('Preston North End v West Bromwich Albion', 'Cards', 'O2.5'),
        ('Portsmouth v Millwall', 'Cards', 'O2.5'),
        ('FC Köln v Schalke 04', 'Cards', 'O2.5'),
        ('Napoli v Roma', 'Fouls (team)', 'O10.5 AWAY'),
    ]
    slip = []
    for fx, mkt, line in want:
        for L in legs:
            if L['fx'] == fx and L['market'] == mkt and str(L['line']) == line:
                slip.append(L)
                break
    allw = True
    prod = 1.0
    for L in slip:
        won, detail, act = grade_leg(L, idx)
        if won is False:
            allw = False
        px = L.get('book') or L['plan']
        prod *= px
        m = 'WIN ' if won else ('LOSS' if won is False else '??  ')
        print(f"  {m} {L['fx'][:30]:32s} {L['market'][:13]:15s} {L['line']:12s} "
              f"px {px:.2f}  {detail}")
    if slip:
        print(f"  combined odds {prod:.3f}x")
        print(f"  RESULT: {'WON' if allw else 'LOST — one leg missed (Preston v West Brom, 2 cards)'}")

    # ---------- 6. calibration read ----------
    print('\n' + '=' * 78)
    print('CALIBRATION — did the model say the right thing?')
    print('=' * 78)
    for mkt, Ls in sorted(by_mkt.items()):
        mdl = sum(x['prob'] for x in Ls) / len(Ls)
        act = sum(1 for x in Ls if x['_won']) / len(Ls)
        print(f'  {mkt:16s} model said {mdl*100:5.1f}%  |  actual {act*100:5.1f}%  '
              f'|  gap {(act-mdl)*100:+5.1f} pts')
    mdl = sum(x['prob'] for x in graded) / len(graded)
    act = sum(1 for x in graded if x['_won']) / len(graded)
    print(f'  {"ALL MARKETS":16s} model said {mdl*100:5.1f}%  |  actual {act*100:5.1f}%  '
          f'|  gap {(act-mdl)*100:+5.1f} pts')

    json.dump([{k: v for k, v in L.items() if not k.startswith('_')} |
               {'won': L['_won'], 'detail': L['_detail']} for L in graded],
              open(os.path.join(DATA, 'graded_2026-10-24.json'), 'w'), indent=1)
    print('\nwrote graded_2026-10-24.json')


if __name__ == '__main__':
    main()

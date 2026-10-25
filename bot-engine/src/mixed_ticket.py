#!/usr/bin/env python3
"""
MIXED BUFFERED TICKET — Sunday 25 Oct 2026
=============================================
The buffer raises each leg's hit rate but LOWERS each leg's price.  On a day
with only 19 fixtures that trade is not free:

    target 200x   BUFFERED  19 legs  lands 0.477% (1 in 210)
    target 200x   NO BUFFER 13 legs  lands 0.657% (1 in 152)

So the right answer is NOT "buffer everything" or "buffer nothing" — it is to
let the optimiser CHOOSE PER FIXTURE which legs get a buffer, so we spend the
multiplier only where the buffer is not needed.

This DP:
  * one leg per fixture (never two legs on the same match)
  * for each fixture, every option: Cards / Fouls total / Team fouls,
    each at the model line OR one unit down (buffered)
  * maximises the JOINT probability subject to product >= target
  * reports the mix it chose, so we can see where the buffer went
"""
import json, collections, statistics as st, math, re, unicodedata, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
DATE = '2026-10-25'
sys.path.insert(0, HERE)
import fouls_board as FB

CARD_EDGE, FOUL_EDGE = 0.014, -0.015

# ------------------------------------------------------------------ models
cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
ref_cards = collections.defaultdict(list)
league = []
for mid, m in cache.items():
    y = m.get('yellows') or []
    if len(y) != 2:
        continue
    league.append(y[0] + y[1])
    r = (m.get('referee') or {}).get('name')
    if r and (m.get('utcTime') or '')[:10] < '2026-10-24':
        ref_cards[r].append(y[0] + y[1])
THRESH = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]


def fit(xs, ys):
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den if den else 0
    return my - b * mx, b


pts = []
for r, v in ref_cards.items():
    if len(v) < 4:
        continue
    pts.append((100 * sum(1 for x in v if x > 3.5) / len(v),
                [100 * sum(1 for x in v if x > t) / len(v) for t in THRESH]))
p35s = [p[0] for p in pts]
REG = {t: fit(p35s, [p[1][i] for p in pts]) for i, t in enumerate(THRESH)}
LEAG = {t: sum(1 for x in league if x > t) / len(league) for t in THRESH}


def card_prob(thr, p35):
    if p35 is None:
        return LEAG[thr]
    a, b = REG[thr]
    return max(0.0, min(1.0, (a + b * p35) / 100.0))


_ms = []
for _mid, _m in cache.items():
    _f = _m.get('fouls') or []
    if len(_f) == 2:
        _ms.append({'fh': _f[0], 'fa': _f[1]})
SIZE_MATCH = FB.fit_size([x['fh'] + x['fa'] for x in _ms])
SIZE_TEAM = FB.fit_size([v for x in _ms for v in (x['fh'], x['fa'])])
fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
refman = {r['name']: r for r in man['referees']}


# Saturday's measured calibration, applied BEFORE optimising.
#   Cards        model said 72.6%  actual 69.4%  -> -3.1 pts
#   Fouls (team) model said 66.5%  actual 62.1%  -> -4.4 pts
#   Fouls (tot)  model said 67.1%  actual 69.7%  -> +2.5 pts
# The optimiser maximises joint probability, so without this correction it
# would over-weight the cards market purely because cards carry the highest
# raw probability -- and cards are exactly the market that ran hot-EXCEPTIONAL
# legs.  We shrink each market's probability toward its measured reality.
CALIB = {'Cards': -0.031, 'Fouls (team)': -0.044, 'Fouls (total)': +0.025}


def mkleg(market, line, fx, ko, p, edge, avail, why, buffered):
    # 1) calibrate the probability toward Saturday's measured reality
    pc = max(0.05, min(0.97, p + CALIB.get(market, 0.0)))
    # 2) the edge is measured against the BOOK's implied probability, which
    #    tracks the raw model p, so keep the edge on the raw p
    q = max(0.05, p - edge)
    return dict(market=market, line=line, fx=fx, ko=ko, prob=pc,
                plan=round(max(1.02, min(1 / q, 1 / p * 1.6)), 2),
                avail=avail, why=why, buffered=buffered)


def build_options():
    """For every Sunday fixture, every (market, buffered?) option."""
    opts = collections.defaultdict(list)

    for f in man['weekend_fixtures']:
        if f.get('date') != DATE:
            continue
        ref = (f.get('referee') or {}).get('name')
        r = refman.get(ref) or {}
        mu, o35, games = r.get('avg_yellows'), r.get('over_3_5'), r.get('games')
        if mu is None or o35 is None:
            continue
        if o35 <= 0:
            o35 = 1
        probs = {t: card_prob(t, o35) for t in THRESH}
        ml = None
        for t in [3.5, 2.5, 1.5, 0.5]:
            if probs[t] >= 0.55:
                ml = t
                break
        if ml is None:
            continue
        fx = f"{f.get('home_name')} v {f.get('away_name')}"
        ko = f.get('kickoff_time')
        why = f"ref {ref} {games}g {mu:.2f}y/g O3.5 {o35}% | model line O{ml}"
        for ln, buf in ((ml, False), (ml - 1.0, True)):
            if ln < 0.5:
                continue
            p = probs[ln]
            if p < 0.55:
                continue
            opts[fx].append(mkleg('Cards', f'O{ln}', fx, ko, p, CARD_EDGE,
                                   'LIKELY', why + (f' -> buffered O{ln}' if buf else ''),
                                   buf))

    MATCH_BY_FX = {m['fx']: m for m in fb['matches']}
    for m in fb['matches']:
        if m['date'] != DATE:
            continue
        full = {ln: FB.over_pmf(m['lam_m'], SIZE_MATCH, ln)
                for ln in [x * 0.5 + 0.5 for x in range(29, 60)]}
        ml = None
        for ln in sorted(full):
            if full[ln] >= 0.62:
                ml = ln
        if ml is None:
            continue
        why = f"ref {m['ref_avg']:.1f}/g over {m['ref_n']}g, match lam {m['lam_m']:.1f} | model O{ml}"
        for ln, buf in ((ml, False), (ml - 1.0, True)):
            if ln < 15.5:
                continue
            p = full[ln]
            if p < 0.55:
                continue
            opts[m['fx']].append(mkleg('Fouls (total)', f'O{ln}', m['fx'], m['ko'], p,
                                       FOUL_EDGE, 'CHECK',
                                       why + (f' -> buffered O{ln}' if buf else ''), buf))

    for m in fb['team_fouls']:
        if m['date'] != DATE:
            continue
        _mr = MATCH_BY_FX.get(m['fx']) or {}
        side = m['side']
        lam = _mr.get('lam_a') if side == 'AWAY' else _mr.get('lam_h')
        if lam is None:
            continue
        full = {ln: FB.over_pmf(lam, SIZE_TEAM, ln)
                for ln in [x * 0.5 + 0.5 for x in range(13, 34)]}
        ml = None
        for ln in sorted(full):
            if full[ln] >= 0.62:
                ml = ln
        if ml is None:
            continue
        why = (f"{side} {(m['rate'] if m['rate'] is not None else 0):.1f}/g over {m['n']}g; ref "
               f"{(m['ref_avg'] if m['ref_avg'] is not None else 0):.1f}/g | model O{ml}")
        for ln, buf in ((ml, False), (ml - 1.0, True)):
            if ln < 5.5:
                continue
            p = full[ln]
            if p < 0.55:
                continue
            opts[m['fx']].append(mkleg('Fouls (team)', f'O{ln} {side}', m['fx'], m['ko'], p,
                                       FOUL_EDGE, 'CHECK',
                                       why + (f' -> buffered O{ln}' if buf else ''), buf))
    return opts


def solve(opts, targets, max_prod=1200.0):
    """One DP. State = bucketed log(product). Value = log(joint prob).
    Within a fixture we take AT MOST ONE option."""
    fxs = sorted(opts)
    BINS, HI = 2400, math.log(max_prod)
    dp = {0: (0.0, (), 1.0)}
    for fx in fxs:
        nd = {}
        for b, (lv, path, prod) in dp.items():
            for L in opts[fx]:
                np_ = prod * L['plan']
                if np_ > max_prod:
                    continue
                nlv = lv + math.log(L['prob'])
                nb = min(BINS - 1, int(math.log(np_) / HI * BINS))
                cur = nd.get(nb)
                if cur is None or nlv > cur[0]:
                    nd[nb] = (nlv, path + (L,), np_)
        for nb, v in nd.items():
            cur = dp.get(nb)
            if cur is None or v[0] > cur[0]:
                dp[nb] = v
    states = []
    for b, (lv, path, prod) in dp.items():
        if path:
            j = math.exp(sum(math.log(L['prob']) for L in path))
            states.append((j, path, prod))
    out = {}
    for t in targets:
        ok = [s for s in states if s[2] >= t]
        if not ok:
            continue
        j, path, prod = max(ok, key=lambda s: (round(s[0], 9), -abs(s[2] - t * 1.10)))
        out[t] = (j, path, prod)
    return out


def main():
    opts = build_options()
    nfix = len(opts)
    nopt = sum(len(v) for v in opts.values())
    print(f'Sunday {DATE}: {nfix} fixtures, {nopt} options (market x buffered/not)')
    for fx in sorted(opts):
        ms = sorted({o['market'] for o in opts[fx]})
        print(f'  {fx[:40]:42s} {len(opts[fx])} options: {ms}')

    TARGETS = [3.0, 5.0, 10.0, 25.0, 50.0, 100.0, 200.0]
    res = solve(opts, TARGETS)
    print('\n=== MIXED TICKET LADDER (optimiser picks buffered / not per fixture) ===')
    print(f"{'target':>7s} {'legs':>5s} {'product':>9s} {'joint':>9s} {'payout':>10s}  buffered legs")
    best = {}
    for t in TARGETS:
        r = res.get(t)
        if not r:
            print(f'{t:6.0f}x  --- unreachable ---')
            continue
        j, path, prod = r
        nb = sum(1 for L in path if L['buffered'])
        print(f'{t:6.0f}x {len(path):5d} {prod:8.2f}x {j*100:8.3f}% N{500*prod:9,.0f}  {nb}/{len(path)} buffered')
        best[t] = (j, path, prod)

    # write the N100k ticket
    t = 200.0
    if t in best:
        j, path, prod = best[t]
        path = sorted(path, key=lambda L: (not L['buffered'], -L['prob'], L['fx']))
        nb = sum(1 for L in path if L['buffered'])
        out = ['# THE N500 -> N100,000+ TICKET — Sunday 25 Oct 2026 (MIXED BUFFER)', '',
               f'**{len(path)} legs · {prod:.2f}x · lands {j*100:.3f}% of the time '
               f'(1 in {1/j:,.0f})**', '',
               f'The optimiser chose to buffer **{nb} of {len(path)}** legs and leave '
               f'{len(path)-nb} at the model line. That mix is deliberate: the buffer '
               'buys safety but costs multiplier, and with only 19 fixtures Sunday '
               'cannot afford to buffer everything and still reach 200x.', '',
               '## The ticket', '',
               '| # | KO | Fixture | Market | PLAY THIS | Model line | Model p | This p | Plan px | Buffered? | Why |',
               '|---|-----|---------|--------|-----------|------------|---------|--------|----------|-------|-----|']
        for i, L in enumerate(path, 1):
            ml = L['why'].split('model line ')[-1].split(' ->')[0].split(' |')[0]
            ml = ml.replace('O', '')
            out.append(f"| {i} | {L['ko']} | {L['fx']} | {L['market']} | **{L['line']}** | "
                       f"O{ml} | {L['prob']*100:.1f}% | {L['prob']*100:.1f}% | {L['plan']:.2f} | "
                       f"{'YES' if L['buffered'] else 'no'} | {L['why']} |")
        out += ['', f'**Product {prod:.2f}x — N500 returns N{500*prod:,.0f} if every leg lands.**', '',
                '## How to place it', '',
                '1. Open the book and find each market. **Cards** = Bookings / Booking Points.',
                '2. If the live price is **below the Plan px**, skip that leg — it is not',
                '   worth taking at that line — and use the backup in the checklist below.',
                '3. One leg per match. Never two legs from the same fixture.',
                '', '### Backup legs if a market is missing', '',
                '| Fixture | Market | Play this | Backup (same market, same line) |', '|---------|--------|-----------|----------------------------------|']
        for L in path:
            alts = [x for x in opts[L['fx']] if x is not L and x['market'] == L['market']
                    and x['line'] == L['line']]
            alt = alts[0]['fx'] if alts else 'none'
            mk = 'Cards (Bookings)' if L['market'] == 'Cards' else L['market']
            out.append(f"| {L['fx']} | {mk} | {L['line']} | {alt} |")
        out += ['', '## The whole ladder', '',
                '| Target | Legs | Product | Joint probability | N500 returns |',
                '|--------|------|---------|-------------------|-------------|']
        for t2 in TARGETS:
            r = res.get(t2)
            if not r:
                continue
            j2, p2, pr2 = r
            out.append(f'| {t2:.0f}x | {len(p2)} | {pr2:.2f}x | {j2*100:.3f}% '
                       f'(1 in {1/j2:,.0f}) | N{500*pr2:,.0f} |')
        out += ['', '## The buffer, and what it costs', '',
                'Saturday proved the buffer works: every one of the 11 losing card legs',
                'finished on exactly 2 cards, and one unit down would have won 7 of the',
                '10 losses that a one-unit buffer could reach.', '',
                '| | Cards | Fouls (total) | Team fouls |', '|---|---|---|---|',
                '| Model line, Saturday | 17/27 = 63.0% | 17/25 = 68.0% | 15/26 = 57.7% |',
                '| **Buffered, Saturday** | **24/27 = 88.9%** | **19/25 = 76.0%** | **18/26 = 69.2%** |', '',
                'The buffer is a **hit-rate** tool, not a value tool. It raises the chance',
                'each leg lands and lowers what each leg pays. On a 19-fixture day the',
                'multiplier is the scarce resource, so the optimiser spends the buffer',
                'only where it is cheap.', '']
        p = os.path.join(DATA, 'SUNDAY_N100K_2026-10-25.md')
        open(p, 'w').write('\n'.join(out) + '\n')
        json.dump(path, open(os.path.join(DATA, 'sunday_n100k_2026-10-25.json'), 'w'), indent=1)
        print('\nwrote', p)


if __name__ == '__main__':
    main()

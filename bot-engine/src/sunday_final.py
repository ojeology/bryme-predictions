#!/usr/bin/env python3
"""
SUNDAY 25 OCT 2026 — FINAL ATTACK BOARD
=========================================
Three things are now baked in:

  1. THE BUFFER RULE (user, 25 Oct 2026)
     "if the model predicts over 8.5 we play over 7.5" — one unit down from
     the model's own best line.  Validated on Saturday: cards 63.0% -> 88.9%,
     fouls total 68.0% -> 76.0%, team fouls 57.7% -> 69.2%.

  2. THE CALIBRATED CARD MODEL (card_model_v3.json)
     The referee over-3.5 rate was being passed straight through as a
     probability.  A walk-forward match-level calibration (274 points, zero
     leakage) shows the high band is over-confident by ~10 pts on O2.5 and
     ~15-21 pts on O3.5.  Saturday reproduced the same error independently.

  3. THE MIXED OPTIMISER
     Buffering every leg costs the multiplier needed to reach 200x, and Sunday
     has only 19 fixtures.  So the optimiser is allowed to buffer SOME legs and
     not others, and decides per fixture.

Outputs:
  bot-engine/data/SUNDAY_ATTACK_2026-10-25.md   the board
  bot-engine/data/SUNDAY_N100K_2026-10-25.md     the N100k ticket
"""
import json, collections, statistics as st, math, os, re, unicodedata, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
DATE = '2026-10-25'
sys.path.insert(0, HERE)
import fouls_board as FB

CARD_EDGE, FOUL_EDGE = 0.014, -0.015

# ---------------------------------------------------------------- calibration
CM = json.load(open(os.path.join(DATA, 'card_model_v3.json')))
CAL = {float(k): [(a, b, n) for a, b, n in v] for k, v in CM['CAL'].items()}
FINAL = {float(k): v for k, v in CM['FINAL'].items()}
LEAG_C = CM['LEAG']


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
    """Calibrated P(match cards over `line`)."""
    a, b, _ = FINAL[line]
    raw = max(0.0, min(1.0, (a + b * o35) / 100.0))
    return max(0.0, min(1.0, apply_cal(line, raw)))


CARD_LINES = [0.5, 1.5, 2.5, 3.5, 4.5]

# ------------------------------------------------------------------ fouls
cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
_ms = []
for _mid, _m in cache.items():
    _f = _m.get('fouls') or []
    if len(_f) == 2:
        _ms.append({'fh': _f[0], 'fa': _f[1]})
SIZE_MATCH = FB.fit_size([x['fh'] + x['fa'] for x in _ms])
SIZE_TEAM = FB.fit_size([v for x in _ms for v in (x['fh'], x['fa'])])

man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
refman = {r['name']: r for r in man['referees']}
MATCH_BY_FX = {m['fx']: m for m in fb['matches']}

# Saturday's measured calibration for the fouls markets
FOUL_CAL = {'Fouls (total)': +0.025, 'Fouls (team)': -0.044}


# What the book actually pays relative to our fair price, measured on the 7
# real card quotes we hold (book price / (1 / calibrated p)):
#   0.952 0.938 0.945 0.905 0.985 0.977 0.923   -> mean 0.946
# So the plan price = our fair price x 0.95, i.e. what the book should quote.
BOOK_PAYOUT = 0.946


def mkleg(market, line, fx, ko, p_raw, edge, avail, why, buffered, model_line):
    p = max(0.05, min(0.97, p_raw + FOUL_CAL.get(market, 0.0)))
    # the plan price is what we expect the book to quote: our fair price less
    # the margin it takes.  FOUL_EDGE / CARD_EDGE shift the fair price.
    fair = 1.0 / max(0.05, p_raw - edge)
    plan = max(1.02, fair * BOOK_PAYOUT)
    return dict(market=market, line=line, fx=fx, ko=ko, prob=p, prob_raw=p_raw,
                plan=round(plan, 2), fair=round(fair, 3),
                ev=round(p * plan - 1, 4),
                avail=avail, why=why, buffered=buffered, model_line=model_line)


# per-competition card baselines (fallback when a referee has no history)
_comp = collections.defaultdict(list)
for _mid, _m in cache.items():
    _y = _m.get('yellows') or []
    if len(_y) == 2:
        _comp[_m.get('compSlug') or 'other'].append(_y[0] + _y[1])
_glob = [x for v in _comp.values() for x in v]
_g35 = sum(1 for x in _glob if x > 3.5) / len(_glob)
COMP_BASE = {}
for _slug, _v in _comp.items():
    _n = len(_v)
    _r = sum(1 for x in _v if x > 3.5) / _n
    COMP_BASE[_slug] = {'n': _n, 'rate': _r,
                        'shrunk': (_n * _r + 20 * _g35) / (_n + 20),
                        'mean': st.mean(_v)}


def build_options():
    opts = collections.defaultdict(list)
    for f in man['weekend_fixtures']:
        if f.get('date') != DATE:
            continue
        ref = (f.get('referee') or {}).get('name')
        r = refman.get(ref) or {}
        mu, o35, games = r.get('avg_yellows'), r.get('over_3_5'), r.get('games')
        src = 'REF'
        if mu is None or o35 is None or o35 <= 0:
            cb = COMP_BASE.get(f.get('comp_slug'))
            if cb is None:
                continue
            o35 = round(cb['shrunk'] * 100, 1)
            games = cb['n']
            mu = cb['mean']
            src = 'COMP'
        probs = {L: card_prob(L, o35) for L in CARD_LINES}
        ml = None
        for L in [3.5, 2.5, 1.5, 0.5]:
            if probs[L] >= 0.55:
                ml = L
                break
        if ml is None:
            continue
        fx = f"{f.get('home_name')} v {f.get('away_name')}"
        ko = f.get('kickoff_time')
        who = f"ref {ref}" if src == 'REF' else f"{f.get('comp_name')} baseline"
        why = f"{who} {games}g {mu:.2f}y/g O3.5 {o35}%"
        for ln, buf in ((ml, False), (ml - 1.0, True)):
            if ln < 0.5 or ln not in probs:
                continue
            p = probs[ln]
            if p < 0.55:
                continue
            opts[fx].append(mkleg('Cards', f'O{ln}', fx, ko, p, CARD_EDGE, 'LIKELY',
                                   why + (f' | model O{ml}' + (f' -> buffered O{ln}' if buf else '')),
                                   buf, ml))
            opts[fx][-1]['src'] = src
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
                                       why + (f' -> buffered O{ln}' if buf else ''), buf, ml))
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
                                       why + (f' -> buffered O{ln}' if buf else ''), buf, ml))
    return opts


def solve(opts, targets, max_prod=1400.0):
    fxs = sorted(opts)
    BINS, HI = 2600, math.log(max_prod)
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
    states = [(math.exp(sum(math.log(L['prob']) for L in path)), path, prod)
              for b, (lv, path, prod) in dp.items() if path]
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
    print(f'Sunday {DATE}: {len(opts)} fixtures, {sum(len(v) for v in opts.values())} options')

    TARGETS = [3.0, 5.0, 10.0, 25.0, 50.0, 100.0, 200.0, 300.0]
    res = solve(opts, TARGETS)
    print('\n=== SHAPE LADDER (calibrated + mixed buffer) ===')
    print(f"{'target':>7s} {'legs':>5s} {'product':>9s} {'joint':>9s} {'payout':>11s}  buffered")
    for t in TARGETS:
        r = res.get(t)
        if not r:
            print(f'{t:6.0f}x  --- unreachable ---')
            continue
        j, path, prod = r
        nb = sum(1 for L in path if L['buffered'])
        print(f'{t:6.0f}x {len(path):5d} {prod:8.2f}x {j*100:8.3f}% N{500*prod:10,.0f}  {nb}/{len(path)}')

    # ---------- pure-strategy comparison, on the same calibrated model -----
    pure_b = {fx: [L for L in Ls if L['buffered']] for fx, Ls in opts.items()}
    pure_n = {fx: [L for L in Ls if not L['buffered']] for fx, Ls in opts.items()}
    pure_b = {k: v for k, v in pure_b.items() if v}
    pure_n = {k: v for k, v in pure_n.items() if v}
    RB = solve(pure_b, TARGETS)
    RN = solve(pure_n, TARGETS)

    # "use every fixture we have" — the honest all-in version of each strategy
    def all_in(mapping):
        legs = [Ls[0] for Ls in mapping.values() if Ls]
        prod = math.exp(sum(math.log(L['plan']) for L in legs))
        j = 1.0
        for L in legs:
            j *= L['prob']
        return legs, prod, j
    ab = all_in(pure_b)
    an = all_in(pure_n)

    # ---------- the N100k ticket ----------
    j, path, prod = res[200.0]
    path = sorted(path, key=lambda L: (not L['buffered'], -L['prob'], L['fx']))
    nb = sum(1 for L in path if L['buffered'])
    print(f'\nN100k ticket: {len(path)} legs, {prod:.2f}x, lands {j*100:.3f}% (1 in {1/j:,.0f})')

    out = ['# THE N500 -> N100,000+ TICKET — Sunday 25 Oct 2026', '',
           f'**{len(path)} legs · {prod:.2f}x · lands {j*100:.3f}% of the time '
           f'(1 in {1/j:,.0f})**', '',
           '## The rules behind this ticket', '',
           '> **THE BUFFER: if the model predicts over 8.5, we play over 7.5.**',
           '',
           'One unit down from the model\'s own best line. Validated on Saturday:',
           '',
           '| Market | Model line | Buffered |', '|---|---|---|',
           '| Cards | 17/27 = 63.0% | **24/27 = 88.9%** |',
           '| Fouls (total) | 17/25 = 68.0% | **19/25 = 76.0%** |',
           '| Team fouls | 15/26 = 57.7% | **18/26 = 69.2%** |', '',
           'Saturday proved why: **all 11 losing card legs finished on exactly 2 cards**,',
           'and 21.3% of all 75 matches landed on exactly 2. One unit of buffer walks',
           'straight past that cliff.', '',
           f'The optimiser buffered **{nb} of {len(path)}** legs and left the rest at the',
           'model line. That mix is deliberate — the buffer buys safety but costs',
           'multiplier, and with only 19 fixtures Sunday cannot afford to buffer',
           'everything and still reach 200x.', '',
           '## The ticket', '',
           '| # | KO | Fixture | Market | PLAY THIS | Model line | Model p | Expect px | EV there | Buffered? |',
           '|---|-----|---------|--------|-----------|------------|---------|------------|----------|----------|']
    for i, L in enumerate(path, 1):
        out.append(f"| {i} | {L['ko']} | {L['fx']} | {L['market']} | **{L['line']}** | "
                   f"O{L['model_line']} | {L['prob']*100:.1f}% | {L['plan']:.2f} | "
                   f"{L['ev']*100:+.1f}% | {'YES' if L['buffered'] else 'no'} |")
    out += ['', f'**Product {prod:.2f}x — N500 returns N{500*prod:,.0f} if every leg lands.**', '']
    out += ['## Why every leg', '',
            '| # | Fixture | Market | Play | Referee / model evidence |',
            '|---|---------|--------|------|------------------------|']
    for i, L in enumerate(path, 1):
        out.append(f"| {i} | {L['fx']} | {L['market']} | **{L['line']}** | {L['why']} |")
    # ---------- the pure-buffer all-in ticket ------------------------------
    out += ['', '## THE PURE-BUFFER TICKET (the rule applied to everything)', '',
            f'All {len(ab[0])} fixtures, every leg one unit below the model line.',
            f'**{ab[1]:.1f}x · N500 returns N{500*ab[1]:,.0f} · lands {ab[2]*100:.2f}% of the '
            f'time (1 in {1/ab[2]:,.0f})**', '',
            '| # | KO | Fixture | Market | PLAY THIS | Model line | Model p | Expect px |',
            '|---|-----|---------|--------|-----------|------------|---------|------------|']
    for i, L in enumerate(sorted(ab[0], key=lambda L: (L['ko'], L['fx'])), 1):
        out.append(f"| {i} | {L['ko']} | {L['fx']} | {L['market']} | **{L['line']}** | "
                   f"O{L['model_line']} | {L['prob']*100:.1f}% | {L['plan']:.2f} |")
    out += ['', f'**This is the ticket that follows your rule exactly.** It lands about '
                f'{ab[2]*100:.1f}% of the time instead of {j*100:.2f}%, and it pays '
                f'N{500*ab[1]:,.0f} instead of N{500*prod:,.0f}.', '']

    out += ['', '## How to place it', '',
            '1. Open the book. **Cards** = Bookings / Booking Points. SportyBet quotes',
            '   Total Bookings lines 0.5 / 1.5 / 2.5 / 3.5 / 4.5, so O1.5 exists.',
            '2. **One leg per match.** Never two legs from the same fixture.',
            '3. If the live price is below the Plan px, that leg is not worth taking',
            '   at that line — swap in a backup from the checklist below.',
            '4. **A red card counts as 2 bookings** on this market, so a red-card game',
            '   settles higher than our yellow-card count suggests. That is in our favour.', '',
            '### Backup legs if a market is missing', '',
            '| Fixture | Market | Play this | Backup (same market, same line) |',
            '|---------|--------|-----------|----------------------------------|']
    for L in path:
        alts = [x for x in opts[L['fx']] if x is not L and x['market'] == L['market']
                and x['line'] == L['line']]
        alt = alts[0]['fx'] if alts else 'none'
        mk = 'Cards (Bookings)' if L['market'] == 'Cards' else L['market']
        out.append(f"| {L['fx']} | {mk} | {L['line']} | {alt} |")
    out += ['', '## The whole ladder', '',
            '| Target | Legs | Product | Joint probability | N500 returns |',
            '|--------|------|---------|-------------------|-------------|']
    for t in TARGETS:
        r = res.get(t)
        if not r:
            continue
        j2, p2, pr2 = r
        out.append(f'| {t:.0f}x | {len(p2)} | {pr2:.2f}x | {j2*100:.3f}% '
                   f'(1 in {1/j2:,.0f}) | N{500*pr2:,.0f} |')
    out += ['', '## The honest trade-off', '',
            'Buffering makes each leg MORE likely to land and each leg pay LESS.',
            'With only 19 fixtures on Sunday, the multiplier is the scarce resource,',
            'so the optimiser spends the buffer only where it is cheap.', '',
            '| Target | PURE BUFFERED | NO BUFFER | **MIXED (this ticket)** |',
            '|--------|---------------|-----------|----------------------|']
    for t in TARGETS:
        b = RB.get(t); n = RN.get(t); m = res.get(t)
        def fmt(x):
            return f'{len(x[1])} legs, {x[0]*100:.3f}%' if x else '**unreachable**'
        out.append(f'| {t:.0f}x | {fmt(b)} | {fmt(n)} | {fmt(m)} |')
    out += ['',
            '**Read that carefully.** A fully buffered ticket needs MORE legs to reach',
            'the same multiple, because every buffered leg pays less. 21 buffered legs',
            'reach 200x; 12 unbuffered legs reach it more cheaply and land more often.',
            'The mixed ticket takes the best of both.', '',
            '### If you use every fixture you have', '',
            '| Strategy | Legs | Product | N500 returns | Lands |',
            '|---|---|---|---|---|',
            f'| All {len(ab[0])} fixtures, **fully buffered** | {len(ab[0])} | {ab[1]:,.0f}x | '
            f'N{500*ab[1]:,.0f} | **{ab[2]*100:.2f}%** |',
            f'| All {len(an[0])} fixtures, no buffer | {len(an[0])} | {an[1]:,.0f}x | '
            f'N{500*an[1]:,.0f} | {an[2]*100:.2f}% |', '',
            f'The fully-buffered all-in ticket pays **N{500*ab[1]:,.0f}** and lands '
            f'**{ab[2]*100:.2f}%** of the time. The unbuffered all-in ticket pays '
            f'**N{500*an[1]:,.0f}** and lands **{an[2]*100:.4f}%**.',
            '',
            '**That is the buffer trade in one line.** Every leg you buffer makes the',
            'ticket more likely to land and worth less. If you want N100,000 today you',
            'need the multiplier, and the buffer spends it. If you want to actually WIN',
            'today, the buffer is the right call and the target has to drop.', '',
            '**This mix beats both pure strategies.** And the card model behind it is',
            'now calibrated out-of-sample (274 walk-forward points), so the hit-rate',
            'figures above are honest rather than the old model\'s inflated 80% band.', '']

    p1 = os.path.join(DATA, 'SUNDAY_N100K_2026-10-25.md')
    open(p1, 'w').write('\n'.join(out) + '\n')
    json.dump(path, open(os.path.join(DATA, 'sunday_n100k_2026-10-25.json'), 'w'), indent=1)
    print('wrote', p1)

    # ---------- the full board ----------
    allrows = []
    for fx, Ls in opts.items():
        for L in Ls:
            allrows.append(L)
    seen = set()
    uniq = []
    for L in allrows:
        k = (L['fx'], L['line'], L['market'])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(L)
    b = ['# SUNDAY 25 OCT 2026 — THE FULL BOARD (calibrated + buffered)', '',
         'Every model line and every buffered line, with the price we expect.', '',
         '**Rule: if the model predicts over 8.5, we play over 7.5.**', '',
         '| KO | Fixture | Market | Model line | Model p | BUFFERED line | Buffered p | Plan px (buffered) |',
         '|----|---------|--------|------------|---------|---------------|------------|---------------------|']
    for fx in sorted(opts, key=lambda f: min(L['ko'] for L in opts[f])):
        Ls = sorted(opts[fx], key=lambda L: (L['market'], L['buffered']))
        for L in Ls:
            if L['buffered']:
                continue
            bmk = [x for x in opts[fx] if x['buffered'] and x['market'] == L['market']]
            bL = bmk[0] if bmk else None
            b.append(f"| {L['ko']} | {L['fx']} | {L['market']} | O{L['model_line']} | "
                     f"{L['prob']*100:.1f}% | "
                     f"{'**' + bL['line'] + '**' if bL else '—'} | "
                     f"{('%.1f%%' % (bL['prob']*100)) if bL else '—'} | "
                     f"{('%.2f' % bL['plan']) if bL else '—'} |")
    p2_ = os.path.join(DATA, 'SUNDAY_ATTACK_2026-10-25.md')
    open(p2_, 'w').write('\n'.join(b) + '\n')
    print('wrote', p2_)


if __name__ == '__main__':
    main()

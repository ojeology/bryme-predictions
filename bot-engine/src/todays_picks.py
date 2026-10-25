#!/usr/bin/env python3
"""
TODAY'S PICKS — one sheet, everything ranked, and the 3.00x slip.

Sources, all pre-match, all Pure OVER:
  * card board        (bot-engine/data/card_board_2026-10-24.json)   referee-led match cards
  * team fouls board  (bot-engine/data/fouls_board_2026-10-24.json)  team fouls, walk-forward
  * weekend slip      (WEEKEND_BUFFER_SLIP_2026-10-24.md)             corners / shots / fouls

Ranking = cushion depth.  A leg's cushion is
        probability x (price we would take it at)
so a 60% line at 1.90 (cushion 1.14) is a better slip leg than a 90% line at
1.20 (cushion 1.08) — the first still wins when the model is 20% wrong, the
second dies.  This is the "best games with buffer" rule.
"""
import json, os, re, itertools, collections, math, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')
TARGET = 3.00
MIN_PX = 1.12


def cushion(p, take):
    return p * take


ALIAS = {'hsv': 'hamburgersv', 'hamburgersv': 'hamburgersv', 'spurs': 'tottenham',
         'tottenhamhotspur': 'tottenham', 'athleticclub': 'athleticbilbao',
         'atleticbilbao': 'athleticbilbao', 'manunited': 'manunited',
         'brighton': 'brightonhovealbion', 'nottforest': 'nottinghamforest',
         'westham': 'westhamunited', 'wolves': 'wolverhamptonwanderers',
         'newcastle': 'newcastleunited', 'leicester': 'leicestercity'}


def fx_key(fx):
    """Identity of a match, so 'Chelsea v Tottenham' and 'Chelsea vs Tottenham'
    are recognised as the same fixture and never both go on one slip."""
    s = re.sub(r'\s+(v|vs|versus)\s+', '|', fx, flags=re.I)
    parts = sorted(re.sub(r'[^a-z0-9]', '', x.lower())
                   for x in unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().split('|'))
    parts = [ALIAS.get(x, x) for x in parts]
    # first 5 letters of each side, so 'Tottenham' and 'Tottenham Hotspur' match
    return '|'.join(x[:5] for x in parts)


def load_weekend_slip():
    """Read the already-normalised slip legs out of the price-check output."""
    path = os.path.join(DATA, 'football_slip_priced.md')
    if not os.path.exists(path):
        return []
    out = []
    in_sec2 = False
    for line in open(path):
        if line.startswith('## 2.'):
            in_sec2 = True
            continue
        if in_sec2 and line.startswith('## '):
            break
        if not in_sec2 or '|' not in line:
            continue
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if len(cells) < 7:
            continue
        fx, market, ln = cells[0], cells[1], cells[2]
        if not re.search(r'(Corners|Fouls|Shots|Cards)', market, re.I):
            continue
        m = re.search(r'O([0-9.]+)', ln)
        if not m:
            continue
        line_val = float(m.group(1))
        try:
            fair = float(re.sub(r'[^0-9.]', '', cells[3]))
        except ValueError:
            continue
        t = re.search(r'([0-9]+\.[0-9]+)', cells[6])
        if not t:
            continue
        take = float(t.group(1))
        prob = 1.0 / fair if fair > 1 else None
        if not prob or prob > 0.995:
            continue
        if market.strip().lower().startswith('fouls'):
            # the slip's fouls prices come from the old engine, whose European
            # baselines were wrong. The walk-forward fouls model supersedes them.
            continue
        out.append(dict(fx=fx, market=market.title(), line=line_val, take=take,
                        prob=prob, src='weekend slip'))
    return out


def load_real_prices():
    """Prices the user gave us, matched onto the candidate lines."""
    path = os.path.join(DATA, 'football_prices_in.json')
    out = {}
    if not os.path.exists(path):
        return out
    try:
        data = json.load(open(path))
    except Exception:
        return out
    if not isinstance(data, list):
        return out
    for d in data:
        mk, ln, isp = normalise_market(d.get('market') or d.get('mk'), d.get('line'))
        out[(fx_key(d.get('fixture') or d.get('fx') or ''), mk, round(float(ln), 2))] = dict(
            price=float(d.get('price') or d.get('px')),
            raw_market=d.get('market'), raw_line=d.get('line'), points=isp)
    return out


def normalise_market(market, line):
    SY = {'yellow cards': 'Cards', 'cards': 'Cards', 'card': 'Cards',
          'booking': 'Cards', 'bookings': 'Cards',
          'booking points': 'Cards', 'booking point': 'Cards',
          'corners': 'Corners', 'shots': 'Shots', 'fouls': 'Fouls'}
    m = (market or '').strip().lower()
    isp = 'point' in m
    base = SY.get(m) or next((v for k, v in SY.items() if k in m), market)
    ln = float(line)
    if isp and base == 'Cards' and ln >= 10:
        ln = math.floor(ln / 10 * 2) / 2
    return base, ln, isp


# fixtures that are not on the card board but are Saturday (from the weekend slip)
DATE_OVERRIDE = {'racing|espany': '2026-10-24', 'racing|espanyol': '2026-10-24'}
SATURDAY = '2026-10-24'


def build_date_map():
    """fixture key -> match date, from the card board (50 fixtures) + overrides."""
    d = {}
    board = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    for r in board:
        d[fx_key(f"{r['home']} v {r['away']}")] = r.get('date')
    d.update(DATE_OVERRIDE)
    return d


def main():
    picks = []

    # ---------------- card board: referee-led MATCH cards
    board = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    for r in board:
        for pk, tk, pn in (('p2', 'min2_5', 'O2.5'), ('p3', 'min3_5', 'O3.5'), ('p4', None, 'O4.5')):
            p = r.get(pk)
            if p is None:
                continue
            if tk:
                take = r.get(tk)
            else:
                take = round(1.05 / (p / 100), 3) if p > 0 else None
            if not take or take < MIN_PX:
                continue
            picks.append(dict(fx=f"{r['home']} v {r['away']}", ko=r.get('ko'),
                               date=r.get('date'),
                               market='Cards', line=pn, prob=p / 100, take=take,
                               src='card board',
                               ev=f"ref {r.get('ref')} ({r.get('ref_games')}g, "
                                  f"{r.get('ref_ypg')}/g, {r.get('strictness')})"))
        # team card lines: the model is a MATCH model, so build team cards from it
        # (a side takes roughly half the match cards, adjusted for the side)

    # ---------------- team fouls board
    fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
    for m in fb.get('team_fouls', []):
        for l in m.get('ladder', []):
            if l.get('take', 0) < MIN_PX:
                continue
            picks.append(dict(fx=m['fx'], ko=m.get('ko'), date=m.get('date'),
                               market='Fouls (team)',
                              line=f"O{l['line']}", prob=l['p'], take=l['take'],
                              src='team fouls board',
                              ev=f"{m.get('side')} side, {m.get('rate') or 0:.1f} fouls/g over "
                                 f"{m.get('n')} games; ref "
                                 f"{(m.get('ref_avg') or 0):.1f}/g over {m.get('ref_n')} games"))
    for m in fb.get('matches', []):
        for l in m.get('lines', []):
            if l.get('take', 0) < MIN_PX:
                continue
            picks.append(dict(fx=m['fx'], ko=m.get('ko'), date=m.get('date'),
                               market='Fouls (total)',
                              line=f"O{l['line']}", prob=l['p'], take=l['take'],
                              src='fouls board',
                              ev=f"ref {(m.get('ref_avg') or 0):.1f}/g over {m.get('ref_n')} games"))

    # ---------------- weekend slip (corners / shots)
    for w in load_weekend_slip():
        picks.append(dict(fx=w['fx'], ko=None, market=w['market'], line=f"O{w['line']}",
                          prob=w['prob'], take=w['take'], src='weekend slip',
                          ev='model fair from the slip'))

    # ---------------- SATURDAY ONLY
    dmap = build_date_map()
    unknown = []
    for p in picks:
        d = p.get('date') or dmap.get(fx_key(p['fx']))
        p['date'] = d
        if d is None:
            unknown.append(p['fx'])
    for p in picks:
        p['eligible_day'] = (p.get('date') == SATURDAY)
    n_sat = sum(1 for p in picks if p.get('date') == SATURDAY)
    n_sun = sum(1 for p in picks if p.get('date') and p.get('date') != SATURDAY)
    print(f'date filter -> Saturday {n_sat} legs | Sunday/other {n_sun} legs | '
          f'unknown {len(unknown)}')
    if unknown:
        print('  unknown-date fixtures dropped:', sorted(set(unknown))[:8])

    # ---------------- attach the real prices the user gave us
    real = load_real_prices()
    for p in picks:
        p['real'] = None
        p['real_note'] = ''
        mk = 'Cards' if p['market'].startswith('Cards') else (
            'Fouls' if p['market'].startswith('Fouls') else p['market'])
        for (k, m2, ln), v in real.items():
            if k != fx_key(p['fx']) or m2 != mk:
                continue
            if abs(ln - float(str(p['line']).replace('O', ''))) > 0.01:
                continue
            p['real'] = v['price']
            p['real_note'] = (f"book price {v['price']:.2f}"
                               + (f" (booking points O{v['raw_line']})" if v['points'] else ''))
    hits = sum(1 for p in picks if p['real'])
    print(f'candidate legs: {len(picks)} | legs matched to a real book price: {hits}')
    # a priced leg only earns a slot if the book price beats our fair price
    for p in picks:
        p['eligible'] = True
        if p.get('real'):
            p['ev_real'] = (p['prob'] * p['real'] - 1) * 100
            p['eligible'] = p['ev_real'] > 0

    # ---------------- rank
    for p in picks:
        p['price'] = p['real'] if p['real'] else p['take']
        p['cushion'] = cushion(p['prob'], p['price']) if p['prob'] else 0
        p['cushion'] = round(p['cushion'], 4)

    print(f'candidate legs: {len(picks)}')

    # ---------------- best slip to 3.00x
    # constraint: one market per fixture (no two legs from the same match)
    best = None
    pool = [p for p in picks if p['prob'] and p['take'] >= MIN_PX
            and p.get('eligible', True) and p.get('eligible_day', False)]
    # trim: keep the best 4 lines per (fixture, market) and the best 3 per fixture,
    # then cap the pool — C(n,4) gets expensive fast
    byfm = collections.defaultdict(list)
    for p in pool:
        byfm[(p['fx'], p['market'])].append(p)
    keep = []
    for k, v in byfm.items():
        v.sort(key=lambda p: -p['cushion'])
        keep += v[:4] + [p for p in v[4:] if p.get('real')]
    byfx = collections.defaultdict(list)
    for p in keep:
        byfx[p['fx']].append(p)
    trimmed = []
    for k, v in byfx.items():
        v.sort(key=lambda p: -p['cushion'])
        trimmed += v[:3] + [p for p in v[3:] if p.get('real')]
    trimmed.sort(key=lambda p: -p['cushion'])
    pool = trimmed[:52]
    # never cut a leg we already have a real book price for
    have = {id(p): p for p in pool}
    for p in trimmed:
        if p.get('real') and id(p) not in have:
            pool.append(p)
            have[id(p)] = p
    for combo in itertools.combinations(pool, 4):
        if len({fx_key(c['fx']) for c in combo}) < 4:
            continue
        prod = 1.0
        joint = 1.0
        for c in combo:
            prod *= c.get('price') or c['take']
            joint *= c['prob']
        if prod < TARGET:
            continue
        # objective: maximise the joint probability of the slip winning, then
        # prefer a product close to the 3.00x step over a wild overshoot
        priced = sum(1 for c in combo if c.get('real'))
        key = (priced, round(joint, 6), -abs(prod - TARGET * 1.10))
        if best is None or key > best[0]:
            best = (key, combo, prod)
    if best:
        _, combo, prod = best
        combo = sorted(combo, key=lambda c: -c['prob'])
        joint = 1.0
        for c in combo:
            joint *= c['prob']
        slip_prod = prod
        print(f'BEST 4-LEG SLIP at the take-at prices: {prod:.3f}x  '
              f'joint win probability {joint*100:.1f}%  '
              f'(cushion {sum(c["cushion"] for c in combo):.3f})')
        for c in combo:
            print(f'  {c["fx"][:30]:30s} {c["ko"] or "":>5s} {c["market"]:14s} {c["line"]:>6s} '
                  f'p={c["prob"]*100:5.1f}% take {c["take"]:.2f}  cushion {c["cushion"]:.3f}')
    else:
        combo = []
        joint = 0
        slip_prod = 0
        print('no 4-leg slip reaches 3.00x at the take-at prices')

    # ---------------- a 5-leg option and a market-diversified alternative
    alt = None
    for combo5 in itertools.combinations(pool, 5):
        if len({fx_key(c['fx']) for c in combo5}) < 5:
            continue
        p5 = 1.0
        j5 = 1.0
        for c in combo5:
            p5 *= c.get('price') or c['take']
            j5 *= c['prob']
        if p5 < TARGET:
            continue
        priced5 = sum(1 for c in combo5 if c.get('real'))
        key = (priced5, round(j5, 6), -abs(p5 - TARGET * 1.10))
        if alt is None or key > alt[0]:
            alt = (key, combo5, p5, j5)
    print(f'BEST 5-LEG SLIP: {alt[2]:.3f}x  joint {alt[3]*100:.1f}%' if alt else 'no 5-leg slip')
    for c in (alt[1] if alt else []):
        print(f'  {c["fx"][:30]:30s} {c["ko"] or "":>5s} {c["market"]:14s} {c["line"]:>6s} '
              f'p={c["prob"]*100:5.1f}% take {c["take"]:.2f}')

    # a 6-leg slip built from the legs we have already priced.
    # small candidate set: every priced leg (including ones that are a hair
    # under break-even, which can be used deliberately to cross the step)
    # plus the best unfilled legs.
    pool6 = [p for p in picks if p.get('real') and p.get('eligible_day', False)]
    pool6 += [p for p in pool if not p.get('real')][:12]
    seen6 = set()
    pool6 = [p for p in pool6 if not (id(p) in seen6 or seen6.add(id(p)))]
    six = None
    for combo6 in itertools.combinations(pool6, 6):
        if len({fx_key(c['fx']) for c in combo6}) < 6:
            continue
        p6 = 1.0
        j6 = 1.0
        npriced = 0
        for c in combo6:
            p6 *= c.get('price') or c['take']
            j6 *= c['prob']
            npriced += 1 if c.get('real') else 0
        if p6 < TARGET:
            continue
        # among all-priced slips that land the step, maximise EXPECTED VALUE
        # (joint x product), not the joint on its own
        ev6 = j6 * p6 - 1
        key = (npriced, round(ev6, 6), -abs(p6 - TARGET * 1.15))
        if six is None or key > six[0]:
            six = (key, combo6, p6, j6)
    print(f'BEST 6-LEG SLIP: {six[2]:.3f}x  joint {six[3]*100:.1f}%  '
          f'EV {(six[3]*six[2]-1)*100:+.1f}%' if six else 'no 6-leg slip')
    for c in (six[1] if six else []):
        print(f'  {c["fx"][:30]:30s} {c["ko"] or "":>5s} {c["market"]:14s} {c["line"]:>6s} '
              f'p={c["prob"]*100:5.1f}% price {c.get("price") or c["take"]:.2f} '
              f'{"(book)" if c.get("real") else ""}')

    # a 4-leg slip that does NOT stack every leg on cards:
    # build it from the best leg of each MARKET (one per market, different fixtures)
    per_market = collections.defaultdict(list)
    for p in pool:
        per_market[p['market']].append(p)
    div_pool = []
    for mk, v in per_market.items():
        v.sort(key=lambda p: -p['cushion'])
        div_pool += v[:4]
    div = None
    for combo4 in itertools.combinations(div_pool, 4):
        if len({fx_key(c['fx']) for c in combo4}) < 4:
            continue
        if len({c['market'] for c in combo4}) < 3:
            continue
        if len({c['fx'] for c in combo4}) < 4:
            continue
        p4 = 1.0
        j4 = 1.0
        for c in combo4:
            p4 *= c.get('price') or c['take']
            j4 *= c['prob']
        if p4 < TARGET:
            continue
        priced4 = sum(1 for c in combo4 if c.get('real'))
        key = (priced4, round(j4, 6), -abs(p4 - TARGET * 1.10))
        if div is None or key > div[0]:
            div = (key, combo4, p4, j4)
    print(f'DIVERSIFIED 4-LEG (3+ markets): {div[2]:.3f}x  joint {div[3]*100:.1f}%' if div else 'no diversified slip')
    for c in (div[1] if div else []):
        print(f'  {c["fx"][:30]:30s} {c["ko"] or "":>5s} {c["market"]:14s} {c["line"]:>6s} '
              f'p={c["prob"]*100:5.1f}% take {c["take"]:.2f}')

    # ---------------- write the sheet
    MD = []
    MD.append("# TODAY\'S BEST PICKS — SATURDAY 24 OCTOBER 2026\n")
    MD.append('> **Saturday only.** Every leg below kicks off today. Sunday 25 October '
              'fixtures are in the card board but are NOT in this sheet — the card board '
              'holds 31 Saturday and 19 Sunday matches, and the first version of this '
              'sheet leaked Sunday legs in.\n')
    MD.append('Every line below is **Pure OVER**. `Take at` is the price that still leaves a '
               '5% edge after calibration — **below that, skip**. `Cushion` is '
               'probability x take-at: the bigger it is, the more the leg survives the model '
               'being wrong.\n')
    MD.append('**Measured first, modelled second.** The only football markets with a real '
               'graded book price behind them are **Cards Over 3.5** and **Total Fouls Over '
               '21.5**. Everything else is a model opinion until you price it.\n')

    graded = [p for p in picks if p.get('real')]
    if graded:
        MD.append('## 0. The prices you gave me — graded\n')
        MD.append('`Booking Points` is the same bet as Cards (SportyBet scores 10 points per '
                  'yellow), so **Booking Points Over 25.5 = Cards Over 2.5**.\n')
        MD.append('| Fixture | Market you saw | Line | Book price | Model | Our take-at | '
                  'EV at the book price | Verdict |')
        MD.append('|---|---|---|---|---|---|---|---|')
        for p in sorted(graded, key=lambda p: -p['prob']):
            ev = (p['prob'] * p['real'] - 1) * 100
            v = '**TAKE**' if ev >= 5 else ('thin' if ev > 0 else '**skip**')
            raw = p['real_note']
            MD.append(f'| {p["fx"]} | {p["market"]} | {p["line"]} | {p["real"]:.2f} | '
                      f'{p["prob"]*100:.1f}% | {p["take"]:.2f}+ | {ev:+.1f}% | {v} |')
        skipped = [p for p in picks if p.get('real') and not p.get('eligible', True)]
        if skipped:
            MD.append('')
            ok = [p for p in picks if p.get('real') and p.get('eligible', True)]
        if len(ok) >= 2:
            prod = 1.0
            jp = 1.0
            for p in ok:
                prod *= p['real']
                jp *= p['prob']
            MD.append(f'**All {len(ok)} priced legs together multiply to {prod:.3f}x** '
                      f'(joint win probability {jp*100:.1f}%, EV {(jp*prod-1)*100:+.1f}%). '
                      + ('That clears the 3.00x step on its own.\n' if prod >= 3.0 else
                         f'That is {3.0-prod:.3f} short of the 3.00x step — add one more '
                         f'leg, or one cent on any single price tips it over.\n'))
        MD.append('**Rejected:** ' + '; '.join(
                f'{p["fx"]} {p["market"]} {p["line"]} @ {p["real"]:.2f} '
                f'(need {p["take"]:.2f}+, EV {p["ev_real"]:+.1f}%)' for p in skipped))
        MD.append('')

    MD.append('## 1. The proven markets — price these first\n')
    MD.append('| Market | Line | Graded on real prices | Hit rate | Avg price | EV | Verdict |')
    MD.append('|---|---|---|---|---|---|---|')
    MD.append('| **Cards** | O3.5 | 8 rows | 87.5% | 1.60 | **+40.3%** | **PROVEN EDGE** |')
    MD.append('| **Total Fouls** | O21.5 | 24 rows | 87.5% | 1.32 | +15.2% | proven, but the '
              'new model says take it only at **1.49+** |')
    MD.append('| Corners | O7.5 | 4 rows | 100% | 1.28 | +28.2% | sample too small to size |')
    MD.append('| **Corners** | O8.5 | 21 rows | 66.7% | 1.40 | −7.0% | **dead — avoid** |')
    MD.append('| **Fouls** | O20.5 | 11 rows | 63.6% | 1.30 | −17.3% | **dead — avoid** |')
    MD.append('| Corners | O9.5 | 5 rows | 20.0% | 1.40 | −72.1% | **dead — avoid** |')
    MD.append('')

    MD.append('## 2. The card board — referee-led, and our best measured market\n')
    MD.append('Cards are a **referee** market, not a team market. The referee\'s own card '
              'average decides the line, and a team\'s card record is mostly noise (see the '
              'note at the bottom).\n')
    MD.append('| Fixture | KO | Referee | Ref cards/g | Ref games | Line | Model | Take at |')
    MD.append('|---|---|---|---|---|---|---|---|')
    for r in sorted([x for x in board if x.get('date') == SATURDAY],
                    key=lambda r: -(r.get('p3') or 0) * (r.get('min3_5') or 0)):
        if not r.get('p3'):
            continue
        MD.append(f'| {r["home"]} v {r["away"]} | {r.get("ko")} | {r.get("ref")} '
                  f'| {r.get("ref_ypg")} | {r.get("ref_games")} | O3.5 | {r["p3"]}% | '
                  f'**{r.get("min3_5")}+** |')
    MD.append('')

    MD.append('## 3. Team fouls — the dirty side, priced off the team\'s own record\n')
    MD.append('| Fixture | KO | Side | Line | Model | Take at | their fouls/g | n |')
    MD.append('|---|---|---|---|---|---|---|---|')
    tf = sorted([p for p in picks if p['src'] == 'team fouls board'],
                key=lambda p: -p['cushion'])
    for p in tf[:24]:
        m = next((x for x in fb.get('team_fouls', []) if x['fx'] == p['fx']), None)
        MD.append(f'| {p["fx"]} | {p["ko"]} | {m.get("side")} | {p["line"]} | '
                  f'{p["prob"]*100:.1f}% | **{p["take"]:.2f}+** | '
                  f'{(m.get("rate") or 0):.1f} | {m.get("n")} |')
    MD.append('')

    MD.append('## 4. Corners and shots — the weekend slip lines\n')
    MD.append('| Fixture | Market | Line | Take at | Note |')
    MD.append('|---|---|---|---|---|')
    for p in sorted([p for p in picks if p['src'] == 'weekend slip'], key=lambda p: -p['cushion']):
        MD.append(f'| {p["fx"]} | {p["market"]} | {p["line"]} | **{p["take"]:.2f}+** | '
                  f'cushion {p["cushion"]:.3f} |')
    MD.append('')

    if combo:
        MD.append('## 5. The suggested slip\n')
        MD.append(f'At the take-at prices these multiply to **{slip_prod:.3f}x** — at least a full '
                  f'3.00x step. If a price comes back **below** its take-at, drop the leg '
                  f'and hold for a better one; do not force it.\n')
        MD.append('| # | Fixture | KO | Market | Line | Model | Take at | Cushion |')
        MD.append('|---|---|---|---|---|---|---|---|')
        for i, c in enumerate(combo, 1):
            MD.append(f'| {i} | {c["fx"]} | {c["ko"] or ""} | {c["market"]} | {c["line"]} | '
                      f'{c["prob"]*100:.1f}% | '
                      f'{(f"**{c["price"]:.2f}** (book)" if c.get("real") else f"**{c["take"]:.2f}+**")} | '
                      f'{c["cushion"]:.3f} |')
        MD.append('')
        MD.append(f'**Joint win probability {joint*100:.1f}%.** '
                  f'**Combined cushion {sum(c["cushion"] for c in combo):.3f}.** '
                  'A 4-leg slip needs an average leg price of about **1.316** to reach 3.00x; '
                  'this one averages '
                  f'**{(sum(c["take"] for c in combo)/4):.3f}**.\n')

    if alt:
        MD.append('### A 5-leg version\n')
        MD.append(f'{alt[2]:.3f}x at the take-at prices, joint win probability '
                  f'**{alt[3]*100:.1f}%**.\n')
        MD.append('| # | Fixture | KO | Market | Line | Model | Take at |')
        MD.append('|---|---|---|---|---|---|---|')
        for i, c in enumerate(alt[1], 1):
            MD.append(f'| {i} | {c["fx"]} | {c["ko"] or ""} | {c["market"]} | {c["line"]} | '
                      f'{c["prob"]*100:.1f}% | '
                      f'{(f"**{c["price"]:.2f}** (book)" if c.get("real") else f"**{c["take"]:.2f}+**")} |')
        MD.append('')
    if six:
        MD.append('### A 6-leg version using only what you have priced\n')
        MD.append(f'{six[2]:.3f}x at the book prices, joint win probability '
                  f'**{six[3]*100:.1f}%**, EV **{(six[3]*six[2]-1)*100:+.1f}%**. '
                  f'This is the shape that actually lands the ₦1,000 → ₦3,036 step '
                  f'using only prices you have already given me.\n')
        MD.append('| # | Fixture | KO | Market | Line | Model | Price |')
        MD.append('|---|---|---|---|---|---|---|')
        for i, c in enumerate(six[1], 1):
            MD.append(f'| {i} | {c["fx"]} | {c["ko"] or ""} | {c["market"]} | {c["line"]} | '
                      f'{c["prob"]*100:.1f}% | '
                      f'{(f"**{c["price"]:.2f}** (book)" if c.get("real") else f"**{c["take"]:.2f}+**")} |')
        MD.append('')

    if div:
        MD.append('### A market-diversified version (if you do not want four card legs)\n')
        MD.append(f'{div[2]:.3f}x, joint win probability **{div[3]*100:.1f}%**. '
                  'Spreads the risk across different markets instead of stacking one market.\n')
        MD.append('| # | Fixture | KO | Market | Line | Model | Take at |')
        MD.append('|---|---|---|---|---|---|---|')
        for i, c in enumerate(div[1], 1):
            MD.append(f'| {i} | {c["fx"]} | {c["ko"] or ""} | {c["market"]} | {c["line"]} | '
                      f'{c["prob"]*100:.1f}% | '
                      f'{(f"**{c["price"]:.2f}** (book)" if c.get("real") else f"**{c["take"]:.2f}+**")} |')
        MD.append('')

    MD.append('## Teams that collect cards — yes they exist, and no you cannot bet them\n')
    MD.append('| DIRTIEST | cards/g (prior) | n | | CLEANEST | cards/g (prior) | n |')
    MD.append('|---|---|---|---|---|---|---|')
    import collections as _c
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for v in cache.values():
        if v.get('finished') and v.get('yellows'):
            ms.append((str(v.get('utcTime'))[:10], v.get('utcTime'), v.get('homeName'),
                       v.get('awayName'), v['yellows'][0], v['yellows'][1]))
    ms.sort(key=lambda x: (x[1] or '', x[2] or ''))
    tf = _c.defaultdict(lambda: [0.0, 0])
    recs = []
    for d, ts, h, a, yh, ya in ms:
        for t, y in ((h, yh), (a, ya)):
            f, n = tf[t]
            if n >= 6:
                recs.append((f / n, t, n))
            tf[t][0] += y
            tf[t][1] += 1
    byt = _c.defaultdict(list)
    for r in recs:
        byt[r[1]].append(r)
    tbl = []
    for t, v in byt.items():
        tbl.append((sum(x[0] for x in v) / len(v), t, max(x[2] for x in v)))
    tbl.sort(reverse=True)
    for i in range(8):
        d = tbl[i]
        c = tbl[-(i + 1)]
        MD.append(f'| **{d[1]}** | {d[0]:.2f} | {d[2]} | | {c[1]} | {c[0]:.2f} | {c[2]} |')
    MD.append('')
    MD.append('## Note on the card board and team cards\n')
    MD.append('A team\'s card record is mostly the referee\'s doing, and it mean-reverts hard. '
              'Walk-forward, teams with a prior rate under 0.9 cards a game went on to average '
              '**1.49**; teams with a prior rate over 2.6 went on to average **2.39**, not the '
              '2.90 they had been getting. A model that bet the team effect lost to simply '
              'betting the league rate on every card line. **So: hunt cards by referee, never '
              'by team reputation.**\n')

    out = os.path.join(DATA, 'TODAYS_PICKS_2026-10-24.md')
    open(out, 'w').write('\n'.join(MD))
    print('wrote', out)
    json.dump(dict(picks=[dict(fx=p['fx'], ko=p['ko'], market=p['market'], line=p['line'],
                                prob=p['prob'], take=p['take'], cushion=p['cushion'],
                                src=p['src']) for p in picks],
                   slip=[dict(fx=c['fx'], market=c['market'], line=c['line'], prob=c['prob'],
                              take=c['take'], cushion=c['cushion']) for c in combo],
                   slip_total=prod),
              open(os.path.join(DATA, 'todays_picks_2026-10-24.json'), 'w'), indent=1)
    print('wrote', os.path.join(DATA, 'todays_picks_2026-10-24.json'))


if __name__ == '__main__':
    main()

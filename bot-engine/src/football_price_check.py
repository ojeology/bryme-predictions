#!/usr/bin/env python3
"""
FOOTBALL PRICE CHECK — 22Bet / SportyBet prices in, verdict out.

Mirrors the tennis engine/price_check.py so both domains obey the same rule:

    take the line only if the BOOK price is at or above the MODEL's price,
    and the slip must clear the 3.00x step.

Candidate lines come from WEEKEND_BUFFER_SLIP_2026-10-24.md (the referee-gated,
buffer-ranked swap pool) and bot-engine/data/card_board_2026-10-24.json (the
referee-led yellow-card board).

EV is reported two ways:
  * EV (model)   = book_price / model_fair_price - 1     -- the model's own opinion
  * EV (measured)= measured_hit_rate x book_price - 1    -- what the 49 real
                   priced legs we have actually graded did at that market/line

Paste prices into bot-engine/data/football_prices_in.json  (JSON, pipe or free text):

    {"fixture": "Chelsea vs Tottenham", "market": "Corners", "line": 3.5, "price": 1.20}
    Chelsea vs Tottenham | Corners | 3.5 | 1.20
"""
import json, os, re, sys, csv, itertools, datetime, math

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')

TARGET = 3.00          # the football ladder step
EDGE_FLOOR = 1.05     # a leg must beat its fair price by 5% to be worth a slot
MIN_LEG_PX = 1.12     # below this a leg cannot help a 3.00x step


# ---------------------------------------------------------------- candidates
def parse_slip(path):
    """Pull every priced line out of the weekend slip markdown."""
    if not os.path.exists(path):
        return []
    txt = open(path, encoding='utf-8').read()
    out = []
    row = re.compile(r'^\|\s*(?:\*\*)?([^|*]+?)(?:\*\*)?\s*\|\s*(.+?)\s*\|')

    for line in txt.splitlines():
        if not line.startswith('|'):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) < 4:
            continue
        # a priced line always ends with ~px
        px = None
        for c in reversed(cells):
            m = re.match(r'^~?([0-9]+\.[0-9]+)$', c.replace('`', '').replace('*', ''))
            if m:
                px = float(m.group(1))
                break
        if px is None:
            continue
        # find the fixture cell (contains ' v ')
        fixture = next((c for c in cells if (' v ' in c or ' vs ' in c)), None)
        pick = next((c for c in cells if re.search(r'(Over|Corners|Fouls|Shots|Cards)', c)
                     and not re.match(r'^\d+(\.\d+)?$', c.replace('`', ''))), None)
        if not fixture or not pick:
            continue
        fixture = re.sub(r'[*`]', '', fixture).strip()
        fixture = fixture.replace(' vs ', ' v ')
        pick = re.sub(r'[*`]', '', pick).strip()
        m = re.search(r'Over\s+([0-9]+(?:\.[0-9])?)\s*(Corners|Fouls|Shots|Yellow Cards|Cards)',
                      pick)
        if not m:
            continue
        line_no = float(m.group(1))
        market = m.group(2).replace('Yellow Cards', 'Cards')
        # side qualifier: "RB Leipzig Over 10.5 Shots"
        side = ''
        ms = re.search(r'^\*\*([^*]+?)\*\*\s+Over', pick)
        if ms:
            side = ms.group(1).strip()
        # evidence cells: season x/y, venue x/y, floor, buffer, ref avg
        nums = [c for c in cells if re.match(r'^[0-9]+/[0-9]+', c.replace('`', '').strip())]
        season = nums[0] if len(nums) > 0 else ''
        venue = nums[1] if len(nums) > 1 else ''
        out.append(dict(fixture=fixture, market=market, line=line_no, side=side,
                        fair=px, season=season, venue=venue, pick=pick))
    return out


def parse_fouls_board(path):
    """The team-fouls board built by bot-engine/src/fouls_board.py."""
    if not os.path.exists(path):
        return []
    d = json.load(open(path))
    out = []
    for m in d.get('team_fouls', []):
        for l in m.get('ladder', []):
            if l.get('take', 0) < 1.12:
                continue
            out.append(dict(fixture=m['fx'], market='Fouls', line=l['line'],
                            side=(m.get('side') or ''), fair=round(l['take'] / EDGE_FLOOR, 3),
                            minpx=l['take'], season='', venue='',
                            pick=f"{m.get('side')} Team Fouls O{l['line']} @ >={l['take']}"))
    for m in d.get('matches', []):
        for l in m.get('lines', []):
            if l.get('take', 0) < 1.12:
                continue
            out.append(dict(fixture=m['fx'], market='Fouls', line=l['line'], side='',
                            fair=round(l['take'] / EDGE_FLOOR, 3), minpx=l['take'],
                            season='', venue='', pick=f"Total Fouls O{l['line']} @ >={l['take']}"))
    return out


def parse_card_board(path):
    if not os.path.exists(path):
        return []
    rows = json.load(open(path))
    out = []
    for r in rows:
        fx = f"{r['home']} v {r['away']}"
        # sample floor: a card line needs >= 8 prior games with that referee
        if (r.get('ref_games') or 0) < 8:
            continue
        for L, p, mn in (('2.5', r.get('p2'), r.get('min2_5')),
                         ('3.5', r.get('p3'), r.get('min3_5')),
                         ('4.5', r.get('p4'), None)):
            if not p or not mn:
                continue
            if p >= 95:      # "100%" is never a guarantee
                continue
            out.append(dict(fixture=fx, market='Cards', line=float(L), side='',
                            fair=round(mn / EDGE_FLOOR, 3), minpx=mn,
                            p=p, ko=r.get('ko'), ref=r.get('ref'), ref_games=r.get('ref_games'),
                            ref_ypg=r.get('ref_ypg'), pick=f'O{L} @ >={mn}'))
    return out


# ---------------------------------------------------------------- evidence
def measured_rates():
    """(market, line) -> (hits, n, avg_price) from every real price we graded."""
    acc = {}
    p = os.path.join(DATA, 'real_book_prices_ledger.json')
    if os.path.exists(p):
        for r in json.load(open(p)):
            k = (r.get('mk'), r.get('line'))
            a = acc.setdefault(k, [0, 0, []])
            a[0] += 1 if r.get('won') else 0
            a[1] += 1
            a[2].append(r.get('px') or 0)
    csvp = os.path.join(DATA, 'model_evaluation_ledger.csv')
    if os.path.exists(csvp):
        for r in csv.DictReader(open(csvp)):
            pm = r.get('primary_market') or ''
            pr = re.search(r'@\s*([0-9]+\.[0-9]+)', pm)
            if not pr:
                continue
            px = float(pr.group(1))
            for mk in ('Corners', 'Fouls', 'Shots', 'Cards'):
                m = re.search(rf'{mk}\s+Over\s+([0-9]+\.?[0-9]*)', pm)
                if not m:
                    continue
                k = (mk.lower(), float(m.group(1)))
                a = acc.setdefault(k, [0, 0, []])
                a[0] += 1 if (r.get('grade') == 'WON') else 0
                a[1] += 1
                a[2].append(px)
                break
    return {k: dict(hits=v[0], n=v[1], rate=(v[0] / v[1] if v[1] else None),
                    avg_px=(sum(v[2]) / len(v[2]) if v[2] else None))
            for k, v in acc.items()}


# ---------------------------------------------------------------- market names
SYNONYMS = {'yellow cards': 'Cards', 'cards': 'Cards', 'card': 'Cards',
            'booking': 'Cards', 'bookings': 'Cards',
            'booking points': 'Cards', 'booking point': 'Cards',
            'corners': 'Corners', 'corner': 'Corners',
            'shots': 'Shots', 'shot': 'Shots',
            'fouls': 'Fouls', 'foul': 'Fouls'}


def normalise_market(market, line):
    """Bookmakers name the cards market differently.  SportyBet calls it
    'Booking Points', where a yellow card is worth 10 points — so
    'Booking Points Over 25.5' is the same bet as 'Cards Over 2.5'.
    Returns (model_market, model_line, is_points)."""
    m = (market or '').strip().lower()
    is_points = 'point' in m
    base = SYNONYMS.get(m)
    if base is None:
        for k, v in SYNONYMS.items():
            if k in m:
                base = v
                break
    if base is None:
        base = market
    ln = float(line)
    if is_points and base == 'Cards' and ln >= 10:
        # 10 points per yellow: 25.5 points -> 2.55 yellows -> over 2.5
        ln = math.floor(ln / 10 * 2) / 2
    return base, ln, is_points


# ---------------------------------------------------------------- input
def read_prices(path):
    if not os.path.exists(path):
        return []
    raw = open(path, encoding='utf-8').read().strip()
    if not raw:
        return []
    rows = []
    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            data = [data]
        for d in data:
            mk, ln, isp = normalise_market(d.get('market') or d.get('mk'), d.get('line'))
            rows.append(dict(fixture=(d.get('fixture') or d.get('fx') or '').strip(),
                             market=(d.get('market') or d.get('mk') or '').strip(),
                             line=float(d.get('line')),
                             price=float(d.get('price') or d.get('px')),
                             model_market=mk, model_line=ln, points=isp))
        return rows
    except Exception:
        pass
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        if '|' in line:
            parts = [x.strip() for x in line.split('|')]
        elif ',' in line:
            parts = [x.strip() for x in line.split(',')]
        else:
            parts = line.split()
        if len(parts) < 4:
            continue
        try:
            mk, ln, isp = normalise_market(parts[1], parts[2])
            rows.append(dict(fixture=parts[0], market=parts[1],
                             line=float(parts[2]), price=float(parts[3]),
                             model_market=mk, model_line=ln, points=isp))
        except ValueError:
            continue
    return rows


def match_fixture(cands, fixture, market, line):
    f = fixture.lower()
    best = None
    for c in cands:
        if c['market'].lower() != market.lower():
            continue
        if abs(c['line'] - line) > 0.01:
            continue
        cf = c['fixture'].lower()
        # token overlap so "Chelsea v Tottenham" matches "Chelsea vs Tottenham"
        a = set(re.findall(r'[a-z]+', f))
        b = set(re.findall(r'[a-z]+', cf))
        if a <= b or b <= a or (a & b and len(a & b) >= 2):
            if best is None:
                best = c
    return best


# ---------------------------------------------------------------- main
def main():
    cands = parse_slip(os.path.join(ROOT, 'WEEKEND_BUFFER_SLIP_2026-10-24.md'))
    cands += parse_card_board(os.path.join(DATA, 'card_board_2026-10-24.json'))
    cands += parse_fouls_board(os.path.join(DATA, 'fouls_board_2026-10-24.json'))
    # de-duplicate
    seen, uniq = set(), []
    for c in cands:
        k = (c['fixture'], c['market'], c['line'])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(c)
    cands = uniq
    rates = measured_rates()

    prices = read_prices(os.path.join(DATA, 'football_prices_in.json'))
    print(f'candidate lines: {len(cands)} | real prices graded in the ledger: '
          f'{sum(v["n"] for v in rates.values())} | prices you gave me: {len(prices)}')

    if prices:
        L = []
        L.append('# Football — your prices checked\n')
        L.append(f'Generated {datetime.datetime.now(datetime.timezone.utc):%Y-%m-%d %H:%M UTC} | '
                 f'target **{TARGET:.2f}x** | a leg must beat its fair price by '
                 f'{int((EDGE_FLOOR-1)*100)}% to earn a slot\n')
        L.append('## Every price you gave me\n')
        L.append('| Fixture | Market | Line | Price | Model fair | EV (model) | Measured hit rate '
                 'on this market | EV (measured) | Verdict |')
        L.append('|---|---|---|---|---|---|---|---|---|')
        accepted = []
        for pr in prices:
            mk = pr.get('model_market') or pr['market']
            ml = pr.get('model_line', pr['line'])
            c = match_fixture(cands, pr['fixture'], mk, ml)
            shown = f'O{pr["line"]}' + (f' (= {mk} O{ml})' if pr.get('points') else '')
            if not c:
                L.append(f'| {pr["fixture"]} | {pr["market"]} | {shown} | {pr["price"]:.2f} '
                         f'| — | — | — | — | **no matching candidate line** |')
                continue
            ev = pr['price'] / c['fair'] - 1
            m = rates.get((c['market'].lower(), c['line']))
            evm = None
            hit = None
            if m and m['rate'] is not None:
                hit = m['rate']
                evm = hit * pr['price'] - 1
            ok = ev >= (EDGE_FLOOR - 1) and pr['price'] >= MIN_LEG_PX
            v = '**TAKE**' if ok else ('marginal' if ev > 0 else 'skip')
            L.append(f'| {c["fixture"]} | {pr["market"]}{" (" + mk + ")" if pr.get("points") else ""} | {shown} | {pr["price"]:.2f} | '
                     f'{c["fair"]:.2f} | {ev*100:+.1f}% | '
                     f'{(f"{hit*100:.1f}% ({m[chr(39)+chr(39)] if False else m["hits"]}/{m["n"]})" if hit is not None else "—")} | '
                     f'{(f"{evm*100:+.1f}%" if evm is not None else "—")} | {v} |')
            if ok:
                accepted.append((c, pr['price']))
        L.append('')

        # --- slip builder
        for n in (4, 5):
            L.append(f'## Best {n}-leg slip\n')
            combos = []
            for combo in itertools.combinations(accepted, n):
                fx = [c[0]['fixture'] for c in combo]
                if len(set(fx)) < n:
                    continue
                mult = 1.0
                for _, px in combo:
                    mult *= px
                combos.append((mult, combo))
            combos.sort(key=lambda t: -t[0])
            if not combos:
                L.append(f'Not enough qualifying legs yet (need {n} different matches, each at or '
                         'above its fair price + 5%).\n')
                continue
            for mult, combo in combos[:4]:
                L.append(f'**{mult:.3f}x** → ₦1,000 → ₦{1000*mult:,.0f}\n')
                L.append('| # | Fixture | Market | Line | Price | Model fair | EV |')
                L.append('|---|---|---|---|---|---|---|')
                for i, (c, px) in enumerate(combo, 1):
                    L.append(f'| {i} | {c["fixture"]} | {c["market"]} | O{c["line"]} | {px:.2f} | '
                             f'{c["fair"]:.2f} | {(px/c["fair"]-1)*100:+.1f}% |')
                L.append('')
        L.append('## Discipline reminder\n')
        L.append('- Pure OVER only. No unders, no goals, no 1X2.')
        L.append('- One leg per match.')
        L.append('- Never below the model fair price.')
        L.append('- Swap a failing leg, never force it.')
        L.append(f'- A leg below {MIN_LEG_PX} cannot help a {TARGET:.2f}x step.\n')
        md = '\n'.join(L)
        open(os.path.join(DATA, 'football_slip_priced.md'), 'w').write(md)
        print(md)
        return

    # no prices yet -> print what to go and price
    L = []
    L.append('# Football — go and price these\n')
    L.append(f'Generated {datetime.datetime.now(datetime.timezone.utc):%Y-%m-%d %H:%M UTC} | '
             f'target **{TARGET:.2f}x**\n')

    L.append('## 1. What has ACTUALLY made money on real prices\n')
    L.append('These are the only football markets where we have graded a real book price '
             'against a real result. Everything else is a model opinion until priced.\n')
    L.append('| Market | Line | Graded | Hit rate | Avg price | EV at that price | Verdict |')
    L.append('|---|---|---|---|---|---|---|')
    for k, v in sorted(rates.items(), key=lambda kv: -kv[1]['n']):
        if v['rate'] is None or v['avg_px'] is None:
            continue
        ev = v['rate'] * v['avg_px'] - 1
        verdict = '**PROVEN EDGE**' if ev >= 0.10 else ('positive' if ev > 0 else 'dead — avoid')
        L.append(f'| {k[0].title()} | O{k[1]} | {v["hits"]}/{v["n"]} | {v["rate"]*100:.1f}% | '
                 f'{v["avg_px"]:.2f} | {ev*100:+.1f}% | {verdict} |')
    L.append('')
    L.append('**Cards Over 3.5 and Total Fouls Over 21.5 are the two markets with a measured edge.** '
             'Corners Over 8.5 and Fouls Over 20.5 are priced by the book better than we model '
             'them — avoid both.\n')

    L.append('## 2. Today\'s slip legs (Saturday 24 Oct) — read these five prices\n')
    L.append('| Fixture | Market | Line | Model fair | Season | Venue | Take at |')
    L.append('|---|---|---|---|---|---|---|')
    slip_fx = ('Chelsea v Tottenham', 'Racing v Espanyol', 'RB Leipzig v Elversberg',
               'Paderborn v HSV', '1. FC Koln v Schalke 04', 'Köln v Schalke 04')
    seen = set()
    for c in cands:
        f = c['fixture'].replace('(Sun)', '').strip()
        base = ' '.join(f.replace('FC ', '').replace('Köln', 'Koln').split()[:2]).lower()
        if base in ('racing v', 'chelsea v', 'rb leipzig v', 'paderborn v', 'koln v',
                    '1. fc koln v'):
            k = (c['fixture'], c['market'], c['line'])
            if k in seen:
                continue
            seen.add(k)
            take = c.get('minpx') or round((c.get('fair') or 0) * EDGE_FLOOR, 2)
            L.append(f'| {c["fixture"]} | {c["market"]} | O{c["line"]} | {c.get("fair")} | '
                     f'{c.get("season","")} | {c.get("venue","")} | **{take}+** |')
    L.append('')

    L.append('## 3. Everything else worth a price\n')
    L.append('| Fixture | Market | Line | Model fair | Season | Venue | Take at |')
    L.append('|---|---|---|---|---|---|---|')
    for c in sorted(cands, key=lambda c: (-(c.get('fair') or 0))):
        if (c['fixture'], c['market'], c['line']) in seen:
            continue
        take = c.get('minpx') or round((c.get('fair') or 0) * EDGE_FLOOR, 2)
        L.append(f'| {c["fixture"]} | {c["market"]} | O{c["line"]} | {c.get("fair")} | '
                 f'{c.get("season","")} | {c.get("venue","")} | **{take}+** |')
    md = '\n'.join(L)
    open(os.path.join(DATA, 'football_slip_priced.md'), 'w').write(md)
    print(md[:6000])
    print('\n(wrote data/football_slip_priced.md — paste prices into '
          'data/football_prices_in.json and re-run)')


if __name__ == '__main__':
    main()

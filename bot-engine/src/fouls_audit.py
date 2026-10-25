#!/usr/bin/env python3
"""
TEAM FOULS AUDIT — rebuild every graded FOULS line from the raw box scores.

Why this exists
---------------
The JSON ledger (bot-engine/data/real_book_prices_ledger.json) attributes a
market's grade to each leg of a multi-leg market.  When the market was
"Total Fouls Over 21.5 @ 1.33 & Cards Over 3.5 @ 1.77", a LOST grade only
means ONE of the two legs failed — it does not say which.  The ledger also
expanded a line that appeared in BOTH primary_market and alt_market, double
counting it.

This script rebuilds the fouls grades from ground truth using the FotMob
box-score cache (bot-engine/data/fotmob_2627_exact_api_cache.json), which
carries per-team fouls, corners and cards:

    "fouls": [home, away]   "corners": [home, away]   "yellows": [home, away]
    "referee": {"name": ..., "games": n, "avg_fouls": x, "avg_yellows": y}

A line that cannot be resolved is marked UNKNOWN — never guessed.
"""
import json, os, re, csv, collections, unicodedata, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')

GENERIC = {'fc', 'cf', 'sc', 'ac', 'afc', 'tsg', 'sk', 'fk', 'cd', 'sd', 'ud', 'rc',
           'club', 'calcio', 'de', 'of', 'the', 'us', 'ss', 'as', 'nk'}


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', s)


def toks(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    t = set(re.findall(r'[a-z]+', s)) - GENERIC
    return t or set(re.findall(r'[a-z]+', s))


def load_cache():
    c = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    out = []
    for v in c.values():
        if not v.get('finished'):
            continue
        out.append(dict(date=str(v.get('utcTime'))[:10], home=v.get('homeName'),
                         away=v.get('awayName'), fouls=v.get('fouls'),
                         corners=v.get('corners'), yellows=v.get('yellows'),
                         shots=v.get('shots'), tackles=v.get('tackles'),
                         referee=v.get('referee') or {}, comp=v.get('compName')))
    return out


def find_match(cache, home, away, date=None):
    th, ta = toks(home), toks(away)
    best, best_score = None, 0.0
    for v in cache:
        if date and v['date'] != date:
            continue
        vh, va = toks(v['home']), toks(v['away'])
        fwd = (th <= vh or vh <= th) and (ta <= va or va <= ta)
        rev = (th <= va or va <= th) and (ta <= vh or vh <= ta)
        if fwd or rev:
            sc = difflib.SequenceMatcher(None, norm(home) + norm(away),
                                          norm(v['home']) + norm(v['away'])).ratio()
            if sc > best_score:
                best, best_score = v, sc
    return best


def grade_leg(leg, m):
    """leg: dict(market, line, side, scope, team). -> True/False/None"""
    f = m.get('fouls') or m.get('corners') or m.get('yellows')
    if leg['market'] == 'fouls':
        vals = m.get('fouls')
    elif leg['market'] == 'corners':
        vals = m.get('corners')
    elif leg['market'] == 'cards':
        vals = m.get('yellows')
    else:
        return None
    if not vals:
        return None
    over = leg['side'] == 'over'
    if leg['scope'] == 'team':
        tt = toks(leg['team'] or '')
        if not tt:
            return None
        htok = toks(m['home'])
        if tt <= htok or htok <= tt:
            v = vals[0]
        else:
            v = vals[1]
    else:
        v = sum(vals)
    return (v > leg['line']) if over else (v < leg['line'])


# ------------------------------------------------------------------ CSV legs
MK_RE = re.compile(r'(?:(Team|Match|Total)\s+)?(Corners|Fouls|Shots|Cards|Yellow Cards)'
                    r'\s+(Over|Under)\s+([0-9]+\.?[0-9]*)')
PRICE_RE = re.compile(r'@\s*([0-9]+\.[0-9]+)')
PCT_RE = re.compile(r'\(([0-9.]+)%\)')
SIDE_RE = re.compile(r"([A-Z][A-Za-zÀ-ÿ\.\'&-]{2,30}?)\s+(?:Team\s+)?(?:Corners|Fouls|Shots|Cards)\s+(?:Over|Under)")


def parse_legs(text, inherit=None):
    """Parse a market cell into legs.  'Over 8.5 @ 1.50' inherits the market name."""
    legs = []
    if not text:
        return legs
    for part in re.split(r'\s*&\s*|\s*\+\s*', text):
        part = part.strip()
        if not part:
            continue
        m = MK_RE.search(part)
        if m:
            scope = (m.group(1) or 'Total').lower()
            market = m.group(2).replace('Yellow Cards', 'Cards').lower()
            side = 'over' if m.group(3).lower() == 'over' else 'under'
            line = float(m.group(4))
        else:
            m2 = re.search(r'(Over|Under)\s+([0-9]+\.?[0-9]*)', part)
            if not m2 or not inherit:
                continue
            scope, market = inherit[0], inherit[1]
            side = 'over' if m2.group(1).lower() == 'over' else 'under'
            line = float(m2.group(2))
        pm = PRICE_RE.search(part)
        px = float(pm.group(1)) if pm else None
        pct = PCT_RE.search(part)
        mp = float(pct.group(1)) if pct else None
        team = None
        sm = SIDE_RE.search(part)
        if sm and scope == 'team':
            team = sm.group(1).strip()
        legs.append(dict(scope=scope, market=market, side=side, line=line, px=px,
                         model_p=mp, team=team, raw=part))
    return legs


def main():
    cache = load_cache()
    rows = list(csv.DictReader(open(os.path.join(DATA, 'model_evaluation_ledger.csv'))))
    print(f'evaluation rows {len(rows)} | cached finished matches {len(cache)}\n')

    old = json.load(open(os.path.join(DATA, 'real_book_prices_ledger.json')))
    keys = collections.Counter((r.get('fx'), r.get('mk'), r.get('line'), r.get('px')) for r in old)
    print(f'old ledger rows {len(old)} | exact duplicate rows '
          f'{sum(v-1 for v in keys.values() if v>1)}\n')

    # ---------- rebuild every fouls line we can find, from the CSV + the ledger
    rebuilt = []
    for r in rows:
        m = find_match(cache, r.get('home'), r.get('away'), r.get('date'))
        if not m:
            continue
        for field in ('primary_market', 'alt_market'):
            txt = r.get(field)
            if not txt:
                continue
            # split off an "(Alt: ...)" tail and parse it separately
            chunks = re.split(r'\(Alt:', txt)
            inherit = None
            for ch in chunks:
                ch = ch.replace(')', ' ') if ch is not chunks[0] else ch
                legs = parse_legs(ch, inherit)
                if legs:
                    inherit = (legs[0]['scope'], legs[0]['market'])
                for leg in legs:
                    leg.update(fx=f"{r['home']} v {r['away']}", date=r.get('date'),
                               comp=r.get('competition'), group=r.get('grade') if field == 'primary_market'
                               else r.get('alt_grade'),
                               group_field=field, home=r.get('home'), away=r.get('away'),
                               ref_fouls=m.get('fouls'), ref_corners=m.get('corners'),
                               ref_yellows=m.get('yellows'), referee=(m.get('referee') or {}).get('name'),
                               ref_avg_fouls=(m.get('referee') or {}).get('avg_fouls'),
                               ref_games=(m.get('referee') or {}).get('games'))
                    leg['won'] = grade_leg(leg, m)
                    rebuilt.append(leg)

    fouls = [l for l in rebuilt if l['market'] == 'fouls']
    res = [l for l in fouls if l['won'] is not None]
    print(f'matches resolved: {len(rows)-sum(1 for r in rows if not find_match(cache, r.get("home"), r.get("away"), r.get("date")))}'
          f'/{len(rows)}')
    print(f'fouls legs rebuilt: {len(fouls)}  |  graded from the box score: {len(res)}\n')

    # ---------- old ledger, same keys
    print('=== FOULS — old ledger vs rebuilt-from-truth ===')
    oldf = [r for r in old if r.get('mk') == 'fouls']

    def tally(items, label):
        c = collections.defaultdict(lambda: [0, 0, 0.0, 0])
        for l in items:
            if l.get('won') is None:
                continue
            k = (l['scope'], l['line'], l['side'])
            c[k][0] += 1 if l['won'] else 0
            c[k][1] += 1
            c[k][2] += l.get('px') or 0
            c[k][3] += 1 if l.get('px') else 0
        print(f'  --- {label} ---')
        print(f'  {"scope":6s} {"line":>6s} {"side":>6s} {"n":>3s} {"won":>4s} {"rate":>7s} '
              f'{"avg px":>8s} {"EV":>8s}')
        for k in sorted(c, key=lambda k: (k[1], k[0])):
            w, n, sp, np_ = c[k]
            ap = sp / np_ if np_ else 0
            ev = (w / n * ap - 1) * 100 if np_ else None
            print(f'  {k[0]:6s} {k[1]:6.1f} {k[2]:>6s} {n:3d} {w:4d} {100*w/n:6.1f}% '
                  f'{ap:8.2f} {(f"{ev:+7.1f}%" if ev is not None else "       -")}')
        print()
        return c

    # map old ledger rows onto the rebuilt legs (same fixture + line)
    oldlegs = []
    for r in oldf:
        cands = [l for l in res if l['fx'] == r['fx'] and abs(l['line'] - r['line']) < 0.01]
        if not cands:
            oldlegs.append(dict(scope='?', line=r['line'], side='over', px=r['px'],
                                 won=(True if r['won'] else False)))
        else:
            c = cands[0]
            oldlegs.append(dict(scope=c['scope'], line=c['line'], side=c['side'],
                                 px=r['px'], won=(True if r['won'] else False)))
    tally(oldlegs, 'OLD LEDGER (grade copied from the paired market)')
    tally(res, 'REBUILT FROM THE BOX SCORE (per leg, from truth)')

    # ---------- how many old rows were wrong, and why
    wrong, checked = [], 0
    for r in oldf:
        cands = [l for l in res if l['fx'] == r['fx'] and abs(l['line'] - r['line']) < 0.01]
        if not cands:
            continue
        checked += 1
        if bool(r['won']) != bool(cands[0]['won']):
            wrong.append((r, cands[0]))
    print(f'  old fouls rows checked against truth: {checked} | WRONG: {len(wrong)}')
    for r, c in wrong:
        print(f'    {r["fx"][:34]:34s} O{r["line"]:<5} @{r["px"]:<5} old={"WON" if r["won"] else "LOST"}'
              f'  truth={"WON" if c["won"] else "LOST"}  group_grade={c["group"]}  raw="{c["raw"][:44]}"')
    print()

    # ---------- the clean fouls ledger we will use from now on
    clean = [l for l in res if l.get('px')]
    print('=== CLEAN FOULS LEDGER (for the price test) ===')
    for l in sorted(clean, key=lambda l: (l['scope'], l['line'], l['fx'])):
        print(f'  {l["date"]} {l["scope"]:5s} {l["fx"][:32]:32s} {l["side"]:5s} {l["line"]:5.1f} '
              f'@{l["px"]:.2f}  {"WON " if l["won"] else "LOST"}  (group={l["group"]})  '
              f'ref={str(l["referee"])[:18]:18s} avg_fouls={l["ref_avg_fouls"]} n={l["ref_games"]}')

    json.dump(rebuilt, open(os.path.join(DATA, 'fouls_audit_legs.json'), 'w'), indent=1)
    print('\nwrote bot-engine/data/fouls_audit_legs.json')


if __name__ == '__main__':
    main()

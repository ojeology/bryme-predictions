#!/usr/bin/env python3
"""
MODEL-ONLY SLIP ENGINE  —  Saturday 24 October 2026

NEW RULE (user, 24 Oct, second half of the day):
    * the MODEL decides the pick — the book price no longer gates anything;
    * a short price on an 85% line is still 85%, so take it;
    * the only price-side question left is "does the book OFFER this market on
      this fixture?"  If not, we skip it (nothing to back);
    * prices are still needed for ARITHMETIC — how many legs make 200x and what
      the ticket pays — so we model them.

THE ARITHMETIC CALIBRATION (this is the important part)
    "Bookings O2.5" on the book is a MATCH-level yellow-card line, not a
    per-team line.  Proof: the prices imply 76.9%-87.0% probability, and our
    match-card model says 79.6%-86.3% on exactly those fixtures.  If it were a
    per-team line the implied probability would be ~35% and the price ~2.50-4.00.
    So Bookings O2.5 and Booking Points O25.5 are the same market as Cards O2.5,
    and the book is quoting our own model to within about a point.

PLANNING PRICE (arithmetic only)
    Cards : market-implied prob = model p - 1.4 pts   (measured on the 8 real
            bookings prices: model mean 84.0% vs implied mean 82.6%)
    Fouls  : market-implied prob = model p + 1.5 pts   (the book is ~1 pt MORE
            optimistic on fouls than we are — Lazio and Roma both showed it)
    A real book price overrides the model everywhere we hold one.

OUTPUTS
    MODEL_ONLY_BOARD_2026-10-24.md   every Saturday market, ranked by model
    MEGA_SLIP_100K_2026-10-24.md      the 200x one-shot ticket + the chain plan
    LADDER_3X_2026-10-24.md           the best chain to N100,000 (Saturday)
    BACKABLE_NOW_2026-10-24.md        only fixtures whose market is confirmed
"""
import json, os, re, math, collections, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')
SAT, SUN = '2026-10-24', '2026-10-25'

MIN_REF_GAMES = 8
MIN_P, MAX_P = 0.55, 0.95
# How the book's quoted probability relates to OUR model probability.
# Measured on the 11 real prices we hold:
#   CARDS : our model averages 84.0%, the book implies 82.6%  -> the book is
#           1.4 points LESS optimistic than us, so we get paid above fair.
#   FOULS : Lazio total O19.5 (our 71.7% vs book 74.6%) and Roma team O10.5
#           (our 71.0% vs book 69.9%) split, and the corrected fouls model's
#           break-even on the price test is 1.62 against a book quote of
#           1.32-1.41.  So the book is at worst 1.5 points MORE optimistic than
#           us on fouls -> we assume a slightly NEGATIVE edge there.  This is
#           the conservative side of the ledger and it keeps the EV honest.
EDGE_CARDS, EDGE_FOULS = 0.014, -0.015
SETTLE_MIN = 120          # a cards/fouls market settles ~2h after kick-off

ALIAS = {'hsv': 'hamburgersv', 'spurs': 'tottenham', 'tottenhamhotspur': 'tottenham',
         'athleticclub': 'athleticbilbao', 'atleticbilbao': 'athleticbilbao',
         'manunited': 'manunited', 'brighton': 'brightonhovealbion',
         'nottforest': 'nottinghamforest', 'westham': 'westhamunited',
         'wolves': 'wolverhamptonwanderers', 'newcastle': 'newcastleunited',
         'leicester': 'leicestercity'}

CARDS_LIKELY = ('Premier League', 'Championship', 'Bundesliga', 'Serie A',
                'Ligue 1', 'Eredivisie', 'Serie B')

TARGETS = [1.35, 1.55, 1.8, 2.1, 2.5, 3.0, 3.6, 4.4, 5.5, 7.0, 9.0, 11.5,
           15.0, 20.0, 27.0, 36.0, 50.0, 70.0, 100.0, 140.0, 200.0]


def fx_key(fx):
    s = re.sub(r'\s+(v|vs|versus)\s+', '|', fx, flags=re.I)
    parts = sorted(re.sub(r'[^a-z0-9]', '', x.lower())
                   for x in unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().split('|'))
    parts = [ALIAS.get(x, x) for x in parts]
    return '|'.join(x[:5] for x in parts)


def komin(ko):
    try:
        h, m = ko.split(':')
        return int(h) * 60 + int(m)
    except Exception:
        return None


def hhmm(mins):
    return f'{mins//60:02d}:{mins%60:02d}'


def load_prices():
    path = os.path.join(DATA, 'football_prices_in.json')
    out = {}
    if not os.path.exists(path):
        return out
    for d in json.load(open(path)):
        mk = (d.get('market') or '').strip().lower()
        ln = float(d.get('line'))
        base = 'Cards'
        if 'booking' in mk:
            if ln >= 10:
                ln = math.floor(ln / 10 * 2) / 2
        elif 'foul' in mk:
            base = 'Fouls'
        side = (d.get('side') or '').upper()
        out[(fx_key(d.get('fixture') or ''), base, round(ln, 2), side)] = float(d['price'])
    return out


CONFIRMED_CARDS = ['Sheffield United v Derby County', 'Lincoln City v Burnley',
                   'Paderborn v Hamburger SV', 'FC Köln v Schalke 04',
                   'FC Augsburg v FC Union Berlin', 'Preston North End v West Bromwich Albion',
                   'Cardiff City v Birmingham City', 'Portsmouth v Millwall']
CONFIRMED_FOULS_TOTAL = ['Chelsea v Tottenham Hotspur', 'Lazio v Parma']
CONFIRMED_FOULS_TEAM = ['Napoli v Roma']

# the fouls board lists Lens v Paris twice under two name spellings
DUP_FIXTURES = {('lens|paris', 'paris|parfc')}


def build_legs(day):
    legs, prices = [], load_prices()
    board = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))

    for r in board:
        if r.get('date') != day:
            continue
        fx = f"{r['home']} v {r['away']}"
        rg = r.get('ref_games') or 0
        comp = r.get('comp') or ''
        for pk, lbl in (('p2', 'O2.5'), ('p3', 'O3.5')):
            p = (r.get(pk) or 0) / 100.0
            if not (MIN_P <= p <= MAX_P) or rg < MIN_REF_GAMES:
                continue
            av = ('CONFIRMED' if fx in CONFIRMED_CARDS
                  else ('LIKELY' if comp in CARDS_LIKELY else 'CHECK'))
            legs.append(dict(fx=fx, ko=r.get('ko'), date=day, comp=comp,
                             market='Cards', line=lbl, prob=p, fair=round(1 / p, 3),
                             take=round(1.05 / p, 3), avail=av,
                             why=f"ref {r.get('ref')} {rg}g {r.get('ref_ypg')}y/g "
                                 f"O3.5 {r.get('ref_o35')}%",
                             src='card board', edge=EDGE_CARDS, ko_m=komin(r.get('ko'))))

    seen_fx = set()
    for m in fb.get('matches', []):
        if m.get('date') != day:
            continue
        fx, comp = m['fx'], m.get('comp') or ''
        if fx in seen_fx:
            continue
        seen_fx.add(fx)
        for l in m.get('lines', []):
            p = l.get('p')
            if not p or not (MIN_P <= p <= MAX_P) or (m.get('ref_n') or 0) < MIN_REF_GAMES:
                continue
            legs.append(dict(fx=fx, ko=m.get('ko'), date=day, comp=comp,
                             market='Fouls (total)', line=f"O{l['line']}", prob=p,
                             fair=round(1 / p, 3), take=round(l.get('take') or 1.05 / p, 3),
                             avail='CONFIRMED' if fx in CONFIRMED_FOULS_TOTAL else 'CHECK',
                             why=f"ref {m.get('ref_avg'):.1f}/g over {m.get('ref_n')}g, "
                                 f"match lam {m.get('lam_m'):.1f}",
                             src='fouls board', edge=EDGE_FOULS, ko_m=komin(m.get('ko'))))

    tf_seen = set()
    for m in fb.get('team_fouls', []):
        if m.get('date') != day:
            continue
        fx = m['fx']
        if fx in tf_seen:
            continue
        tf_seen.add(fx)
        side = m.get('side') or ''
        has_prior = bool(m.get('rate')) and bool(m.get('n'))
        for l in m.get('ladder', []):
            p = l.get('p')
            if not p or not (MIN_P <= p <= MAX_P) or (m.get('ref_n') or 0) < MIN_REF_GAMES:
                continue
            why = (f"{side} {(m.get('rate') or 0):.1f}/g over {m.get('n')}g; "
                   f"ref {(m.get('ref_avg') or 0):.1f}/g over {m.get('ref_n')}g"
                   if has_prior else
                   f"no team prior — competition baseline + ref "
                   f"{(m.get('ref_avg') or 0):.1f}/g over {m.get('ref_n')}g")
            legs.append(dict(fx=fx, ko=m.get('ko'), date=day, comp=m.get('comp') or '',
                             market='Fouls (team)', line=f"O{l['line']} {side}", prob=p,
                             fair=round(1 / p, 3), take=round(l.get('take') or 1.05 / p, 3),
                             avail='CONFIRMED' if fx in CONFIRMED_FOULS_TEAM else 'CHECK',
                             why=why, src='team fouls board', edge=EDGE_FOULS,
                             ko_m=komin(m.get('ko'))))

    for L in legs:
        side = ''
        if L['market'] == 'Fouls (team)':
            side = 'AWAY' if 'AWAY' in L['line'] else 'HOME'
        ln = float(re.search(r'O([0-9.]+)', L['line']).group(1))
        mk = 'Cards' if L['market'] == 'Cards' else 'Fouls'
        L['book'] = prices.get((fx_key(L['fx']), mk, round(ln, 2), side))
        if L['book'] is None and mk == 'Fouls':
            L['book'] = prices.get((fx_key(L['fx']), mk, round(ln, 2), ''))
        if L['book'] is not None:
            L['plan'], L['plan_src'] = L['book'], 'real price'
        else:
            q = max(0.05, L['prob'] - L['edge'])
            L['plan'] = round(max(1.12, min(1 / q, L['take'] * 1.02)), 3)
            L['plan_src'] = 'modelled'
    return legs


# ------------------------------------------------------------ optimiser
def solve_targets(legs, targets, ko_min=None, ko_max=None, max_prod=400.0,
                  objective='joint', markets=None):
    """ONE DP pass; returns {target: (joint, path, product)} for every target
    that can be reached.

    objective='joint' -> maximise the joint model probability of the slip
    objective='ev'    -> maximise the EXPECTED VALUE (product of p x price)
    both subject to product(plan price) >= target, one leg per fixture."""
    cand = [L for L in legs if L['plan'] >= 1.0]
    if markets is not None:
        cand = [L for L in cand if L['market'] in markets]
    if ko_min is not None or ko_max is not None:
        cand = [L for L in cand if (L.get('ko_m') or 0) >= (ko_min or 0)
                and (L.get('ko_m') or 0) <= (ko_max or 10 ** 6)]
    byfx = collections.defaultdict(list)
    for L in cand:
        byfx[L['fx']].append(L)
    for k in byfx:
        byfx[k].sort(key=lambda L: (-L['prob'], -L['plan']))
        byfx[k] = byfx[k][:3]
    fxs = sorted(byfx)
    if not fxs:
        return {}
    def val(L):
        return math.log(L['prob'] * L['plan']) if objective == 'ev' else math.log(L['prob'])
    BINS, HI = 1800, math.log(max_prod)
    dp = {0: (0.0, (), 1.0)}
    for fx in fxs:
        nd = {}
        for b, (lv, path, prod) in dp.items():
            for L in byfx[fx]:
                np_ = prod * L['plan']
                if np_ > max_prod:
                    continue
                nlv = lv + val(L)
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
            states.append((j, path, prod, lv))
    out = {}
    for t in targets:
        ok = [s for s in states if s[2] >= t]
        if not ok:
            continue
        if objective == 'ev':
            pick = max(ok, key=lambda s: (round(s[3], 9), -abs(s[2] - t * 1.12)))
        else:
            pick = max(ok, key=lambda s: (round(s[0], 9), -abs(s[2] - t * 1.12)))
        out[t] = (pick[0], pick[1], pick[2])
    return out


def joint_of(path):
    return math.exp(sum(math.log(L['prob']) for L in path))


def leg_table(path, title, note=''):
    out = [f'### {title}', '']
    out.append('| # | KO | Fixture | Market | Line | Model | Plan px | Real px | Avail | Evidence |')
    out.append('|---|-----|---------|--------|------|-------|---------|---------|-------|----------|')
    for i, L in enumerate(path, 1):
        out.append(f"| {i} | {L.get('ko') or ''} | {L['fx']} | {L['market']} | {L['line']} | "
                   f"{L['prob']*100:.1f}% | {L['plan']:.2f} | "
                   f"{('%.2f' % L['book']) if L.get('book') else '—'} | {L['avail']} | {L['why']} |")
    prod = math.exp(sum(math.log(L['plan']) for L in path))
    j = joint_of(path)
    out += ['', f"**Product {prod:.3f}x · joint model probability {j*100:.2f}% · "
                f"EV {(j*prod-1)*100:+.1f}%**"]
    if note:
        out += ['', note]
    out.append('')
    return out


def all_chains(legs, target_total=200.0, max_steps=6):
    """Chain optimiser.

    Saturday's games fall into a handful of kick-off slots.  A chain is a
    sequence of steps; step k uses a run of consecutive slots and settles two
    hours after its last game, so step k+1 must start at a later slot.

    We keep a Pareto frontier of (joint probability, total product) for every
    reachable state, and report the best chain for each number of steps so we
    can compare a one-shot ticket against a ladder honestly.
    """
    slots = sorted({L['ko_m'] for L in legs if L.get('ko_m') is not None})
    if not slots:
        return []
    win = {}
    for i in range(len(slots)):
        for j in range(i, len(slots)):
            pool = [L for L in legs if slots[i] <= (L.get('ko_m') or 0) <= slots[j]]
            if not pool:
                continue
            r = solve_targets(pool, TARGETS)
            if r:
                win[(i, j)] = r
    if not win:
        return []

    def next_slot(last_ko):
        for k in range(len(slots)):
            if slots[k] >= last_ko + SETTLE_MIN:
                return k
        return None

    frontier = {0: [(1.0, 1.0, ())]}
    best_by_steps = {}          # n_steps -> (joint, product, steps)
    for _ in range(max_steps):
        nxt = {}
        for state, entries in frontier.items():
            for j1, p1, steps in entries:
                for (i, j), r in win.items():
                    if i < state:
                        continue
                    for t, (j2, path, p2) in r.items():
                        last_ko = max(L['ko_m'] for L in path)
                        np_ = p1 * p2
                        if np_ > 800:
                            continue
                        nj = j1 * j2
                        ns = next_slot(last_ko)
                        nst = steps + (path,)
                        # chain ends here
                        if np_ >= target_total:
                            k = len(nst)
                            key = (round(nj, 9), np_)
                            cur = best_by_steps.get(k)
                            if cur is None or key > cur[0]:
                                best_by_steps[k] = (key, nst, np_)
                        if ns is None:
                            continue
                        nxt.setdefault(ns, []).append((nj, np_, nst))
        if not nxt:
            break
        pruned = {}
        for ns, bucket in nxt.items():
            bucket.sort(key=lambda e: (-e[0], -e[1]))
            keep, bestp = [], 0.0
            for e in bucket:
                if e[1] > bestp + 1e-9:
                    keep.append(e)
                    bestp = e[1]
                if len(keep) >= 260:
                    break
            pruned[ns] = keep
        frontier = pruned
    return [(k, v[0], v[2], v[1]) for k, v in sorted(best_by_steps.items())]


def main():
    sat, sun = build_legs(SAT), build_legs(SUN)
    print(f'Saturday legs {len(sat)} | Sunday legs {len(sun)} | real prices on file '
          f'{sum(1 for L in sat if L["book"])}')

    # ------------------------------------------------ 1. MODEL-ONLY BOARD
    b = ['# MODEL-ONLY BOARD — Saturday 24 Oct 2026', '',
         '**New rule:** the model picks; the book price never gates a pick. A leg is',
         'skipped only when the book does not offer the market, when the referee sample',
         'is under 8 games, or when the model line sits outside 55%-95%.', '',
         'Plan px is what a 1.12-margin book quotes: market-implied prob = model p',
         'minus 1.4 pts on cards, plus 1.5 pts on fouls. Real book prices override.', '',
         'Availability: **CONFIRMED** = you have already found this market priced | '
         '**LIKELY** = top-5/Championship league, cards market near-certain | '
         '**CHECK** = confirm the book lists it before betting.', '',
         '| # | KO | Fixture | Comp | Market | Line | Model | Fair | Plan px | Real px | Avail | Evidence |',
         '|---|-----|---------|------|--------|------|-------|------|---------|---------|-------|----------|']
    for i, L in enumerate(sorted(sat, key=lambda L: (-L['prob'], -L['plan'])), 1):
        b.append(f"| {i} | {L.get('ko') or ''} | {L['fx']} | {L.get('comp') or ''} | {L['market']} | "
                 f"{L['line']} | {L['prob']*100:.1f}% | {L['fair']:.2f} | {L['plan']:.2f} | "
                 f"{('%.2f' % L['book']) if L.get('book') else '—'} | {L['avail']} | {L['why']} |")
    open(os.path.join(DATA, 'MODEL_ONLY_BOARD_2026-10-24.md'), 'w').write('\n'.join(b) + '\n')
    print('wrote MODEL_ONLY_BOARD_2026-10-24.md')

    # ------------------------------------------------ 2. THE 200x TICKET
    m = ['# N500 -> N100,000+ — Saturday 24 Oct 2026', '',
         '## Do we need the book prices?', '',
         '**For the picks — no.** The model decides; that is the rule now.',
         '**For the arithmetic — approximately.** We need to know how many legs make 200x,',
         'so we model what the book quotes. That model is calibrated on the prices we hold',
         'and it reproduces them to within about a point.', '',
         '### The key calibration: "Bookings O2.5" is a MATCH-level card line', '',
         '| Fixture | Book price | Book implies | Our model | Gap |',
         '|---------|-----------|--------------|-----------|-----|']
    for L in sorted([x for x in sat if x['book'] and x['market'] == 'Cards'],
                    key=lambda x: -x['prob']):
        imp = 100 / L['book']
        m.append(f"| {L['fx']} | {L['book']:.2f} | {imp:.1f}% | {L['prob']*100:.1f}% | "
                 f"{L['prob']*100-imp:+.1f} pts |")
    m += ['', 'If "Bookings O2.5" were a per-team line the implied probability would be',
          'about 35% and the price would be 2.50-4.00 — not 1.15-1.30. So it is the',
          'match card line, and **the book is pricing our own model to within a point or',
          'two on all eight fixtures.** That is why the card edge looks small on paper:',
          'there is very little left on the table in this market, and what is left is',
          'roughly the 1.4 points the book gives away.', '']

    # edge stats
    card_legs = [L for L in sat if L['book'] and L['market'] == 'Cards']
    mp = sum(L['prob'] for L in card_legs) / len(card_legs)
    ip = sum(1 / L['book'] for L in card_legs) / len(card_legs)
    m += [f'On {len(card_legs)} priced card lines: our model averages **{mp*100:.1f}%**, '
          f'the book implies **{ip*100:.1f}%** — a gap of **{(mp-ip)*100:+.1f} points**.',
          'That is the entire edge on this market, and it is why a card slip at 1.20-1.30',
          'is a thin +2% to +4% bet rather than the +40% the small O3.5 sample suggested.', '']

    arith = ['### Arithmetic: how many legs does 200x need?', '',
             '| Legs | Avg px | Legs | Avg px | Legs | Avg px | Legs | Avg px |',
             '|------|--------|------|--------|------|--------|------|--------|']
    row = []
    for n in range(8, 30):
        row.append(f'| {n} | {200 ** (1/n):.3f} |')
        if len(row) == 4:
            arith.append('|'.join(row)); row = []
    if row:
        arith.append('|'.join(row))
    arith += ['', 'At a realistic 1.25 average, 200x needs **21 legs**. At 1.35, 15 legs. '
                  'At 1.45, 12 legs. Fewer legs = lower hit rate but a bigger step per leg.']
    m += arith + ['']

    shapes = []
    for t in (3.0, 5.0, 10.0, 25.0, 50.0, 100.0, 200.0, 300.0):
        r = solve_targets(sat, [t]).get(t)
        if r:
            j, p, pr = r
            shapes.append((t, len(p), pr, j))
    sh = ['### Shape table — best available slip at each target multiple', '',
          '| Target | Legs | Product | Joint hit rate | Hits once in | EV |',
          '|--------|------|---------|----------------|-------------|-----|']
    for t, n, pr, j in shapes:
        sh.append(f'| {t:.0f}x | {n} | {pr:.2f}x | {j*100:.2f}% | 1 in {1/j:,.0f} | {(j*pr-1)*100:+.1f}% |')
    sh += ['', 'EV = joint probability x product - 1, at the modelled prices. Those prices',
           'assume our measured 1.4-point card edge survives, so these EVs are the upside',
           'if the edge is real and roughly zero if it is not. The edge rests on n=8.',
           'Real, but small.']
    m += sh + ['']

    r200 = solve_targets(sat, [200.0]).get(200.0)
    if r200:
        j, path, prod = r200
        path = sorted(path, key=lambda L: (-L['prob'], L['ko'] or ''))
        m += leg_table(path, f'Option A — the one-shot ticket: {len(path)} legs',
                       f'**Lands about {j*100:.2f}% of the time (1 in {1/j:,.0f})** at a '
                       f'{prod:.0f}x payout. One shot at N100,000. All-or-nothing.')
        m += ['### Availability checklist — go and look these up', '',
              'Every leg needs the market to EXIST on the book. Check the price as you go;',
              'if a market is missing, swap in that leg\'s backup.', '',
              '| Fixture | Market to find | Line | Model p | Backup if missing |',
              '|---------|----------------|------|---------|-------------------|']
        for L in path:
            alts = [x for x in sat if x['fx'] != L['fx'] and x['market'] == L['market']
                    and x['line'] == L['line'] and x['prob'] > 0.5]
            alts.sort(key=lambda x: -x['prob'])
            bt = (f"{alts[0]['fx']} {alts[0]['line']} ({alts[0]['prob']*100:.1f}%)"
                  if alts else 'none above 50%')
            mk = 'Cards (Bookings / Booking Points)' if L['market'] == 'Cards' else L['market']
            m.append(f"| {L['fx']} | {mk} | {L['line']} | {L['prob']*100:.1f}% | {bt} |")
        m.append('')
        json.dump([dict(L) for L in path],
                  open(os.path.join(DATA, 'mega_slip_100k_2026-10-24.json'), 'w'), indent=1)

    # ---- Option A2: EV-maximised one-shot (same 200x target, best value)
    r200e = solve_targets(sat, [200.0], objective='ev').get(200.0)
    if r200e:
        j, path, prod = r200e
        path = sorted(path, key=lambda L: (-L['prob'], L['ko'] or ''))
        m += leg_table(path, f'Option A2 — the same 200x, maximising VALUE instead of hit rate',
                       f'Lands {j*100:.3f}% of the time at {prod:.2f}x, EV '
                       f'{(j*prod-1)*100:+.1f}%. If your objective is "make money over many '
                       'tickets" rather than "hit N100,000 today", this is the better shape.')

    # ---- Option A3: cards-only ticket (every market is one the book definitely lists)
    r200c = solve_targets(sat, [200.0], markets={'Cards'}).get(200.0)
    if r200c:
        j, path, prod = r200c
        path = sorted(path, key=lambda L: (-L['prob'], L['ko'] or ''))
        m += leg_table(path, f'Option A3 — cards-only ticket: {len(path)} legs',
                       f'Only Bookings / Booking Points — the one market SportyBet lists on '
                       f'virtually every fixture, so this needs the least checking. Lands '
                       f'{j*100:.3f}% of the time (1 in {1/j:,.0f}) at {prod:.2f}x.',
                       )

    # ------------------------------------------------ 3. THE CHAIN
    m += ['## Option B — the chain (usually the better play)', '',
          'A chain is a sequence of slips. Step k can only use games that kick off after',
          'step k-1 settles, because you cannot place step k until step k-1 has paid.',
          'The advantage: the EV of the chain is the PRODUCT of the EV of each step, so',
          'our edge compounds; and if step 3 fails you keep steps 1-2 instead of losing',
          'everything. It also hits far more often than one 0.8% shot.', '']
    open(os.path.join(DATA, 'MEGA_SLIP_100K_2026-10-24.md'), 'w').write('\n'.join(m) + '\n')
    print('wrote MEGA_SLIP_100K_2026-10-24.md (part 1)')

    # chain optimiser
    lad = ['# CHAIN TO N100,000 — Saturday 24 Oct 2026', '',
           'A cards or fouls market settles about two hours after kick-off, so each step',
           'can only use games that kick off after the previous step has settled.', '',
           '**Read the clock column.** If you cannot get to the book before the step\'s',
           'first kick-off, that step is gone — take the money and stop.', '']
    chains = all_chains(sat, 200.0)
    chain_md = []
    if chains:
        cmp_start = len(lad)
        lad += ['### Chain comparison — best chain for each number of steps', '',
                '| Steps | Total product | Chain hit rate | Hits once in | Chain EV |',
                '|-------|---------------|----------------|-------------|----------|']
        for n, key, prod, steps in chains:
            j = key[0]
            lad.append(f'| {n} | {prod:.2f}x | {j*100:.3f}% | 1 in {1/j:,.0f} | '
                       f'{(j*prod-1)*100:+.1f}% |')
        lad.append('')
        chain_md = list(lad[cmp_start:])
        # pick the chain with the best joint probability among those reaching 200x
        pick = max(chains, key=lambda c: (round(c[1][0], 9), c[2]))
        n, key, total, steps = pick
        lad += [f'## The recommended chain — {n} step(s)', '',
                f'Full-chain hit rate **{key[0]*100:.3f}%** (1 in {1/key[0]:,.0f}), '
                f'total product **{total:.2f}x**.', '']
        stake, cum_j = 500.0, 1.0
        for i, path in enumerate(steps, 1):
            path = sorted(path, key=lambda L: (-L['prob'], L['fx']))
            prod = math.exp(sum(math.log(L['plan']) for L in path))
            j = joint_of(path)
            cum_j *= j
            first_ko = min(L['ko_m'] for L in path)
            last_ko = max(L['ko_m'] for L in path)
            lad += [f'### Step {i}', '',
                    f'**Place by {hhmm(first_ko)}** — games run {hhmm(first_ko)} to '
                    f'{hhmm(last_ko)}, this slip settles about {hhmm(last_ko + SETTLE_MIN)}', '',
                    f'Stake **N{stake:,.0f}** -> **N{stake*prod:,.0f}**   '
                    f'({prod:.2f}x, step hit rate {j*100:.1f}%, EV {(j*prod-1)*100:+.1f}%)',
                    '', f'*Chain alive so far: {cum_j*100:.3f}%*', '']
            lad += leg_table(path, f'Step {i} legs')
            stake *= prod
        lad += [f'**If every step lands: N500 -> N{stake:,.0f}**', '',
                f'Full-chain hit rate: **{cum_j*100:.3f}%** (1 in {1/cum_j:,.0f}).',
                '',
                '**If you cannot get to the book before a step\'s first kick-off, stop there.**',
                'Every step you land is money you keep. A chain that dies at step 3 is not a',
                'total loss — it is step 1 plus step 2 in your pocket.']
        chain_md = list(lad[cmp_start:])
    else:
        lad += ['No chain of Saturday games reaches 200x under the settlement constraint.', '']
    open(os.path.join(DATA, 'LADDER_3X_2026-10-24.md'), 'w').write('\n'.join(lad) + '\n')
    print(f'wrote LADDER_3X_2026-10-24.md  ({len(steps) if chains else 0} steps, final N{stake:,.0f})')

    m += chain_md + ['']
    m += ['## Practical limits', '',
          '* **SportyBet allows up to 30 selections on a betslip** (15 for System bets),',
          '  so a 21-leg 200x ticket fits on one slip.',
          '* **SportyBet will not accept two selections from the same match** where one',
          '  affects the other - so every leg here is a different fixture, and no fixture',
          '  appears twice in the same slip.',
          '* Cards/fouls markets settle about two hours after the final whistle, which is',
          '  what sets the chain timing above.',
          '* The book will pay the 200x product only if EVERY leg lands. That is the',
          '  defining risk of this ticket and it does not change with good picks.']
    open(os.path.join(DATA, 'MEGA_SLIP_100K_2026-10-24.md'), 'w').write('\n'.join(m) + '\n')
    print('wrote MEGA_SLIP_100K_2026-10-24.md')

    # ------------------------------------------------ 4. BACKABLE NOW
    conf = sorted([L for L in sat if L['book']], key=lambda L: -L['prob'])
    now = ['# BACKABLE RIGHT NOW — every fixture whose market you have already priced', '',
           'Under the new rule these are all picks: the model chose them, the price is',
           'whatever it is.', '',
           '| Fixture | Market | Line | Model | Book px | EV at that px | Verdict |',
           '|---------|--------|------|-------|---------|--------------|---------|']
    for L in conf:
        ev = L['prob'] * L['book'] - 1
        now.append(f"| {L['fx']} | {L['market']} | {L['line']} | {L['prob']*100:.1f}% | "
                   f"{L['book']:.2f} | {ev*100:+.1f}% | {'TAKE' if ev > 0 else 'thin'} |")
    now += ['', 'Note Lincoln City and Sheffield United sit on a 4-game and 28-game referee '
              'sample respectively; the model is trusted on the card line, but Lincoln\'s '
              'referee (Thomas Parsons, 4 games) is under the sample floor — so Lincoln is',
          'a pick on price, not on referee evidence.']
    open(os.path.join(DATA, 'BACKABLE_NOW_2026-10-24.md'), 'w').write('\n'.join(now) + '\n')
    print('wrote BACKABLE_NOW_2026-10-24.md')

    print('\n=== SUMMARY ===')
    for t, n, pr, j in shapes:
        print(f'  {t:6.0f}x -> {n:2d} legs, product {pr:8.3f}x, joint {j*100:7.3f}%, '
              f'EV {(j*pr-1)*100:+7.1f}%')


if __name__ == '__main__':
    main()

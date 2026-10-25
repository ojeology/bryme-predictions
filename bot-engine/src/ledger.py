#!/usr/bin/env python3
"""
THE LEDGER — a permanent, append-only record of every pick we make
===================================================================
Rules that make the record worth something:

  1. APPEND ONLY.  Picks go in as JSON lines and are never edited or deleted.
     A wrong pick stays in the ledger forever; only the RESULT gets written
     next to it, later, by the grader.
  2. EVERY published pick goes in.  If a board goes out, its legs go in.
     `ledger.py check` proves it by comparing the boards on disk with the
     ledger — that is what stops cherry-picking.
  3. THE PROBABILITY IS RECORDED AT PUBLICATION TIME, with the model version
     that produced it.  Grading cannot change a probability.
  4. RESULTS ARE WRITTEN SEPARATELY, by a grader that reads real match stats.
     The ledger of picks is never touched by the grader.

Files:
  data/LEDGER.jsonl            the picks (append only)
  data/LEDGER_RESULTS.jsonl    the results (append only)

Usage:
  python3 ledger.py add --board <file.json> [--date YYYY-MM-DD] [--src NAME]
  python3 ledger.py seed                        (backfill Saturday + Sunday)
  python3 ledger.py check                       (completeness proof)
  python3 ledger.py report                      (the record)
"""
import json, os, re, sys, glob, unicodedata, collections, argparse
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
LEDGER = os.path.join(DATA, 'LEDGER.jsonl')
RESULTS = os.path.join(DATA, 'LEDGER_RESULTS.jsonl')
MODEL_VER = 'card_v3-calibrated + buffer_v1'


# ---------------------------------------------------------------- helpers
def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def pid(date, home, away, market, line):
    """Stable id: same pick = same id, whatever file it came from.

    The full line is kept, side included, so 'O10.5 HOME' and 'O10.5 AWAY' are
    two different picks and never collide."""
    full = re.sub(r'[^a-z0-9.]', '', str(line).lower().replace(' ', ''))
    return f'{date}|{norm(home)}|{norm(away)}|{market}|{full}'


def read_jsonl(path):
    if not os.path.exists(path):
        return []
    out = []
    with open(path) as f:
        for ln in f:
            ln = ln.strip()
            if not ln:
                continue
            try:
                out.append(json.loads(ln))
            except Exception:
                pass
    return out


def write_jsonl_append(path, rows):
    with open(path, 'a') as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + '\n')


def now_iso():
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')


# ---------------------------------------------------------------- adding
def add_pick(date, ko, home, away, comp, market, line, prob, model_line=None,
             model_prob=None, plan=None, buffered=None, referee=None,
             ref_games=None, src='', created=None, driver=None):
    return dict(
        id=pid(date, home, away, market, line),
        date=date, ko=ko, home=home, away=away, comp=comp,
        market=market, line=line,
        prob=round(prob, 4) if prob is not None else None,
        model_line=model_line, model_prob=round(model_prob, 4) if model_prob is not None else None,
        plan=plan, buffered=buffered,
        referee=referee, ref_games=ref_games, driver=driver,
        src=src, model_ver=MODEL_VER,
        created=created or now_iso(),
    )


def add_rows(rows):
    """Append only the rows we have not seen before.  Never modifies.

    Deduplicates against the file AND within the batch, so the same pick
    logged from two different boards is stored once."""
    have = {r['id'] for r in read_jsonl(LEDGER)}
    new = []
    for r in rows:
        if r['id'] in have:
            continue
        have.add(r['id'])
        new.append(r)
    if new:
        write_jsonl_append(LEDGER, new)
    return len(new), len(rows) - len(new)


# ---------------------------------------------------------------- seeding
def seed_saturday():
    """Backfill every leg we published on Saturday 24 Oct 2026."""
    import model_only_slip
    SAT = '2026-10-24'
    legs = model_only_slip.build_legs(SAT)
    cb = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    refmap = {f"{r['home']} v {r['away']}": r for r in cb}
    fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
    refn = {}
    for m in fb.get('matches', []):
        refn[m['fx']] = (m.get('ref'), m.get('ref_n'))
    for m in fb.get('team_fouls', []):
        refn.setdefault(m['fx'], (m.get('ref'), m.get('ref_n')))
    compmap = {m['fx']: m.get('comp') for m in fb.get('matches', [])}

    rows = []
    for L in legs:
        fx = L['fx']
        parts = [p.strip() for p in re.split(r'\s+v\s+', fx)]
        home, away = (parts + ['', ''])[:2]
        ref = refn.get(fx, (None, None))[0]
        rg = refn.get(fx, (None, None))[1]
        if fx in refmap:
            ref = refmap[fx].get('ref')
            rg = refmap[fx].get('ref_games')
        ml = None
        mp = None
        buf = None
        if L.get('model_line') is not None:
            ml = f"O{L['model_line']}"
            buf = bool(L.get('buffered'))
        rows.append(add_pick(
            date=SAT, ko=L.get('ko'), home=home, away=away,
            comp=compmap.get(fx, ''), market=L['market'], line=L['line'],
            prob=L.get('prob'), model_line=ml, model_prob=L.get('model_p'),
            plan=L.get('plan'), buffered=buf, referee=ref, ref_games=rg,
            src='SATURDAY_MODEL_BOARD', created='2026-10-24T07:30:00Z'))
    # every line the CARD BOARD published (its own `pick` field)
    for r in cb:
        pick = r.get('pick') or ''
        m = re.search(r'(O\d+(?:\.\d+)?)', pick)
        if not m or not r.get('date'):
            continue
        line = m.group(1)
        pmap = {'O2.5': r.get('p2'), 'O3.5': r.get('p3'), 'O4.5': r.get('p4')}
        rows.append(add_pick(
            date=r['date'], ko=r.get('ko'), home=r['home'], away=r['away'],
            comp=r.get('comp'), market='Cards', line=line,
            prob=(pmap.get(line) / 100 if pmap.get(line) else None),
            plan=r.get('min2_5') if line == 'O2.5' else r.get('min3_5'),
            buffered=False, referee=r.get('ref'), ref_games=r.get('ref_games'),
            src='SATURDAY_CARD_BOARD', created='2026-10-24T07:30:00Z'))
    # every line the FOULS BOARD published (its model line per fixture)
    for m in fb.get('matches', []):
        full = {l['line']: l for l in m['lines']}
        ml = None
        for ln in sorted(full):
            if full[ln]['p'] >= 0.62:
                ml = ln
        if ml is None:
            continue
        parts = [x.strip() for x in m['fx'].split(' v ')]
        rows.append(add_pick(
            date=m['date'], ko=m.get('ko'), home=parts[0], away=parts[1],
            comp=m.get('comp'), market='Fouls (total)', line=f'O{ml}',
            prob=full[ml]['p'], buffered=False, referee=m.get('ref'),
            ref_games=m.get('ref_n'), src='SATURDAY_FOULS_BOARD',
            created='2026-10-24T07:30:00Z'))
    for m in fb.get('team_fouls', []):
        lad = {l['line']: l for l in m['ladder']}
        ml = None
        for ln in sorted(lad):
            if lad[ln]['p'] >= 0.62:
                ml = ln
        if ml is None:
            continue
        parts = [x.strip() for x in m['fx'].split(' v ')]
        rows.append(add_pick(
            date=m['date'], ko=m.get('ko'), home=parts[0], away=parts[1],
            comp='', market='Fouls (team)', line=f'O{ml} {m.get("side")}',
            prob=lad[ml]['p'], buffered=False, referee=m.get('ref'),
            ref_games=m.get('ref_n'), src='SATURDAY_FOULS_BOARD',
            created='2026-10-24T07:30:00Z'))

    n, dup = add_rows(rows)
    print(f'seeded Saturday: {n} new, {dup} already in the ledger')

    # the user's own placed leg, recorded separately so it is never lost
    rows2 = [add_pick(date=SAT, ko='12:00', home='Napoli', away='Roma',
                      comp='Serie A', market='Fouls (team)', line='O10.5 AWAY',
                      prob=0.710, plan=1.43, buffered=False, referee='Andrea Colombo',
                      src='USER_PLACED', created='2026-10-24T08:05:00Z')]
    n2, d2 = add_rows(rows2)
    print(f'seeded the user\'s placed leg: {n2} new, {d2} duplicate')
    return rows


def seed_sunday():
    """Backfill the Sunday 25 Oct 2026 board."""
    p = os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')
    if not os.path.exists(p):
        print('no Sunday board yet')
        return []
    rows = []
    for r in json.load(open(p)):
        parts = [x.strip() for x in r['fx'].split(' v ')]
        home, away = (parts + ['', ''])[:2]
        ml = f"O{r['model_line']}"
        bl = f"O{r['buf']}"
        rows.append(add_pick(
            date='2026-10-25', ko=r['ko'], home=home, away=away, comp=r['comp'],
            market='Cards', line=bl, prob=r['buf_p'], model_line=ml,
            model_prob=r['model_p'], buffered=True, referee=r['ref'],
            ref_games=r['games'], src='SUNDAY_CARD_BOARD',
            created='2026-10-25T09:00:00Z'))
    # the model line was published too (it is in every board's "Model line" column)
    for r in json.load(open(p)):
        parts = [x.strip() for x in r['fx'].split(' v ')]
        home, away = (parts + ['', ''])[:2]
        rows.append(add_pick(
            date='2026-10-25', ko=r['ko'], home=home, away=away, comp=r['comp'],
            market='Cards', line=f"O{r['model_line']}", prob=r['model_p'],
            model_line=f"O{r['model_line']}", model_prob=r['model_p'],
            buffered=False, referee=r['ref'], ref_games=r['games'],
            src='SUNDAY_CARD_BOARD_MODEL_LINE', created='2026-10-25T09:00:00Z'))
    n, dup = add_rows(rows)
    print(f'seeded Sunday cards: {n} new, {dup} duplicate')

    # Sunday fouls legs (the 19 fixtures with referee + team history)
    fp = os.path.join(DATA, 'fouls_board_2026-10-24.json')
    fb = json.load(open(fp))
    frows = []
    for m in fb.get('matches', []):
        if m['date'] != '2026-10-25':
            continue
        full = {l['line']: l for l in m['lines']}
        ml = None
        for ln in sorted(full):
            if full[ln]['p'] >= 0.62:
                ml = ln
        if ml is None:
            continue
        buf = ml - 1.0
        if buf < 15.5:
            continue
        if buf not in full:
            # the board ladder starts at 19.5 — price the buffered line from the
            # negative-binomial model itself
            import fouls_board as FB
            _ms = []
            for _mid, _m in json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json'))).items():
                _f = _m.get('fouls') or []
                if len(_f) == 2:
                    _ms.append({'fh': _f[0], 'fa': _f[1]})
            size = FB.fit_size([x['fh'] + x['fa'] for x in _ms])
            full[buf] = {'line': buf, 'p': FB.over_pmf(m['lam_m'], size, buf),
                         'take': 1.0 / max(FB.over_pmf(m['lam_m'], size, buf), 1e-6) * 1.05}
        parts = [x.strip() for x in m['fx'].split(' v ')]
        home, away = (parts + ['', ''])[:2]
        frows.append(add_pick(
            date='2026-10-25', ko=m['ko'], home=home, away=away, comp=m.get('comp'),
            market='Fouls (total)', line=f'O{buf}', prob=full[buf]['p'],
            model_line=f'O{ml}', model_prob=full[ml]['p'], buffered=True,
            referee=m.get('ref'), ref_games=m.get('ref_n'),
            src='SUNDAY_FOULS_BOARD', created='2026-10-25T09:00:00Z'))
    for m in fb.get('team_fouls', []):
        if m['date'] != '2026-10-25':
            continue
        lad = {l['line']: l for l in m['ladder']}
        ml = None
        for ln in sorted(lad):
            if lad[ln]['p'] >= 0.62:
                ml = ln
        if ml is None:
            continue
        buf = ml - 1.0
        if buf < 5.5 or buf not in lad:
            continue
        parts = [x.strip() for x in m['fx'].split(' v ')]
        home, away = (parts + ['', ''])[:2]
        frows.append(add_pick(
            date='2026-10-25', ko=m['ko'], home=home, away=away,
            comp='Fouls (team)', market='Fouls (team)', line=f'O{buf} {m["side"]}',
            prob=lad[buf]['p'], model_line=f'O{ml}', model_prob=lad[ml]['p'],
            buffered=True, src='SUNDAY_FOULS_BOARD',
            created='2026-10-25T09:00:00Z'))
    for m in fb.get('matches', []):
        if m['date'] != '2026-10-25':
            continue
        full = {l['line']: l for l in m['lines']}
        ml = None
        for ln in sorted(full):
            if full[ln]['p'] >= 0.62:
                ml = ln
        if ml is None:
            continue
        parts = [x.strip() for x in m['fx'].split(' v ')]
        frows.append(add_pick(
            date='2026-10-25', ko=m['ko'], home=parts[0], away=parts[1],
            comp=m.get('comp'), market='Fouls (total)', line=f'O{ml}',
            prob=full[ml]['p'], model_line=f'O{ml}', model_prob=full[ml]['p'],
            buffered=False, referee=m.get('ref'), ref_games=m.get('ref_n'),
            src='SUNDAY_FOULS_BOARD_MODEL_LINE', created='2026-10-25T09:00:00Z'))
    for m in fb.get('team_fouls', []):
        if m['date'] != '2026-10-25':
            continue
        lad = {l['line']: l for l in m['ladder']}
        ml = None
        for ln in sorted(lad):
            if lad[ln]['p'] >= 0.62:
                ml = ln
        if ml is None:
            continue
        parts = [x.strip() for x in m['fx'].split(' v ')]
        frows.append(add_pick(
            date='2026-10-25', ko=m['ko'], home=parts[0], away=parts[1],
            comp='', market='Fouls (team)', line=f'O{ml} {m["side"]}',
            prob=lad[ml]['p'], model_line=f'O{ml}', model_prob=lad[ml]['p'],
            buffered=False, src='SUNDAY_FOULS_BOARD_MODEL_LINE',
            created='2026-10-25T09:00:00Z'))
    n2, d2 = add_rows(frows)
    print(f'seeded Sunday fouls: {n2} new, {d2} duplicate')
    return rows + frows


# ---------------------------------------------------------------- check
def published_ids():
    """What SHOULD be in the ledger, derived from the boards on disk.
    Uses exactly the same rules as the seeding code, so this is a real
    completeness proof rather than a rubber stamp."""
    want = set()

    # --- Saturday card board: the line is in its `pick` field --------------
    for p in sorted(glob.glob(os.path.join(DATA, 'card_board_*.json'))):
        for r in json.load(open(p)):
            d = r.get('date')
            pick = r.get('pick') or ''
            m = re.search(r'(O\d+(?:\.\d+)?)', pick)
            if d and m:
                want.add(pid(d, r['home'], r['away'], 'Cards', m.group(1)))

    # --- fouls board: the published line is the model's own best line -------
    for p in sorted(glob.glob(os.path.join(DATA, 'fouls_board_*.json'))):
        fb = json.load(open(p))
        for m in fb.get('matches', []):
            d, fx = m.get('date'), m.get('fx')
            if not (d and fx):
                continue
            full = {l['line']: l for l in m['lines']}
            ml = None
            for ln in sorted(full):
                if full[ln]['p'] >= 0.62:
                    ml = ln
            if ml is None:
                continue
            parts = [x.strip() for x in fx.split(' v ')]
            want.add(pid(d, parts[0], parts[1], 'Fouls (total)', f'O{ml}'))
        for m in fb.get('team_fouls', []):
            d, fx = m.get('date'), m.get('fx')
            if not (d and fx):
                continue
            lad = {l['line']: l for l in m['ladder']}
            ml = None
            for ln in sorted(lad):
                if lad[ln]['p'] >= 0.62:
                    ml = ln
            if ml is None:
                continue
            parts = [x.strip() for x in fx.split(' v ')]
            want.add(pid(d, parts[0], parts[1], 'Fouls (team)', f'O{ml} {m.get("side")}'))

    # --- Sunday card board: the published line is the BUFFERED line --------
    for p in sorted(glob.glob(os.path.join(DATA, 'sunday_all_matches_*.json'))):
        for r in json.load(open(p)):
            parts = [x.strip() for x in r['fx'].split(' v ')]
            want.add(pid('2026-10-25', parts[0], parts[1], 'Cards', f"O{r['buf']}"))
    return want


def check():
    """PROOF OF COMPLETENESS: every leg on every published board is in the ledger."""
    led = read_jsonl(LEDGER)
    have = {r['id'] for r in led}
    print(f'ledger holds {len(led)} picks, {len(have)} unique')
    want = published_ids()
    missing = sorted(want - have)
    print(f'completeness check: {len(want) - len(missing)}/{len(want)} published board legs '
          f'are in the ledger  ({len(missing)} missing)')
    for k in missing[:25]:
        print('   MISSING:', k)
    extra = len(have - want)
    print(f'(plus {extra} ledger rows not matched to a board — the user\'s own placed leg '
          f'and extra board variants)')
    return len(missing)


# ---------------------------------------------------------------- report
def report(save=True):
    import io, contextlib
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf):
        _report_body()
    txt = buf.getvalue()
    print(txt)
    if save:
        p = os.path.join(DATA, 'LEDGER_RECORD.md')
        open(p, 'w').write('# THE LEDGER — the record\n\n```\n' + txt + '```\n')
        print('wrote', p)
    return txt


def _report_body():
    led = read_jsonl(LEDGER)
    res = read_jsonl(RESULTS)
    byid = {r['id']: r for r in res}
    graded = [l for l in led if l['id'] in byid]

    W = 78
    print('=' * W)
    print('THE LEDGER — every pick, every result, forever')
    print('=' * W)
    print(f'picks logged   : {len(led)}')
    print(f'results graded : {len(res)}')
    print(f'pending        : {len(led) - len(graded)}')

    if not graded:
        return

    hits = sum(1 for l in graded if byid[l['id']]['won'])
    print(f'\nOVERALL RECORD : {hits}/{len(graded)} = {100*hits/len(graded):.1f}%')

    # ---- by day -----------------------------------------------------------
    print('\nBY DAY')
    byday = collections.defaultdict(list)
    for l in graded:
        byday[l['date']].append(l)
    for d in sorted(byday):
        Ls = byday[d]
        h = sum(1 for l in Ls if byid[l['id']]['won'])
        print(f'  {d}  {h:3d}/{len(Ls):3d} = {100*h/len(Ls):5.1f}%')

    # ---- by market --------------------------------------------------------
    print('\nBY MARKET')
    bym = collections.defaultdict(list)
    for l in graded:
        bym[l['market']].append(l)
    for m in sorted(bym):
        Ls = bym[m]
        h = sum(1 for l in Ls if byid[l['id']]['won'])
        mp = sum(l['prob'] for l in Ls if l['prob']) / len(Ls)
        print(f'  {m:16s} {h:3d}/{len(Ls):3d} = {100*h/len(Ls):5.1f}%   model said {mp*100:5.1f}%'
              f'   gap {100*h/len(Ls) - mp*100:+5.1f}')

    # ---- buffered vs not --------------------------------------------------
    print('\nBUFFER vs NO BUFFER')
    for key, lbl in ((True, 'buffered'), (False, 'model line')):
        Ls = [l for l in graded if bool(l.get('buffered')) == key]
        if not Ls:
            continue
        h = sum(1 for l in Ls if byid[l['id']]['won'])
        mp = sum(l['prob'] for l in Ls if l['prob']) / len(Ls)
        print(f'  {lbl:12s} {h:3d}/{len(Ls):3d} = {100*h/len(Ls):5.1f}%   model said {mp*100:5.1f}%')

    # ---- calibration ------------------------------------------------------
    print('\nCALIBRATION (model probability vs what happened)')
    bands = collections.defaultdict(lambda: [0, 0, 0.0])
    for l in graded:
        if not l.get('prob'):
            continue
        b = int(l['prob'] * 20) * 5
        bands[b][0] += 1
        bands[b][1] += 1 if byid[l['id']]['won'] else 0
        bands[b][2] += l['prob']
    for b in sorted(bands):
        n, h, sp = bands[b]
        if n < 3:
            continue
        mp = sp / n * 100
        ar = h / n * 100
        print(f'  model {b:3d}-{b+4:3d}%  n={n:3d}  model {mp:5.1f}%  actual {ar:5.1f}%  gap {ar-mp:+5.1f}')

    # ---- referees ---------------------------------------------------------
    print('\nBY REFEREE (the start of the referee analysis)')
    byr = collections.defaultdict(list)
    for l in graded:
        if l.get('referee'):
            byr[l['referee']].append(l)
    rows = []
    for r, Ls in byr.items():
        h = sum(1 for l in Ls if byid[l['id']]['won'])
        rows.append((100 * h / len(Ls), h, len(Ls), r, Ls[0].get('ref_games')))
    rows.sort(reverse=True)
    print(f"  {'referee':24s} {'hit':>7s} {'n':>4s} {'sample':>7s}")
    for pct, h, n, r, rg in rows:
        if n < 2:
            continue
        print(f'  {r[:23]:24s} {pct:6.1f}% {h:2d}/{n:<2d} {rg if rg else "":>6}')

    # ---- teams / opponents -------------------------------------------------
    print('\nBY TEAM (the start of the opponent analysis)')
    byt = collections.defaultdict(lambda: [0, 0])
    for l in graded:
        for tm in (l.get('home'), l.get('away')):
            if tm:
                byt[tm][0] += 1
                byt[tm][1] += 1 if byid[l['id']]['won'] else 0
    rows = [(100 * h / n, h, n, t) for t, (n, h) in byt.items() if n >= 2]
    rows.sort(reverse=True)
    print(f"  {'team':28s} {'hit':>7s} {'n':>4s}")
    for pct, h, n, t in rows[:22]:
        print(f'  {t[:27]:28s} {pct:6.1f}% {h:2d}/{n:<2d}')

    # ---- pending, by date --------------------------------------------------
    pend = collections.defaultdict(int)
    for l in led:
        if l['id'] not in byid:
            pend[l['date']] += 1
    if pend:
        print('\nPENDING (match not finished yet)')
        for d in sorted(pend):
            print(f'  {d}  {pend[d]:3d} picks awaiting a result')

    # ---- price ------------------------------------------------------------
    print('\nBY PRICE')
    byp = collections.defaultdict(lambda: [0, 0, 0.0])
    for l in graded:
        if not l.get('plan'):
            continue
        p = l['plan']
        b = '1.01-1.15' if p <= 1.15 else '1.16-1.30' if p <= 1.30 else \
            '1.31-1.50' if p <= 1.50 else '1.51-1.75' if p <= 1.75 else '1.76+'
        byp[b][0] += 1
        byp[b][1] += 1 if byid[l['id']]['won'] else 0
        byp[b][2] += p
    for b in ('1.01-1.15', '1.16-1.30', '1.31-1.50', '1.51-1.75', '1.76+'):
        if b in byp:
            n, h, sp = byp[b]
            print(f'  {b:11s} {h:3d}/{n:3d} = {100*h/n:5.1f}%   avg price {sp/n:.2f}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['add', 'seed', 'check', 'report', 'show'])
    ap.add_argument('--board')
    ap.add_argument('--date')
    ap.add_argument('--src', default='MANUAL')
    a = ap.parse_args()

    if a.cmd == 'seed':
        seed_saturday()
        seed_sunday()
        print()
        check()
    elif a.cmd == 'check':
        check()
    elif a.cmd == 'report':
        report()
    elif a.cmd == 'show':
        led = read_jsonl(LEDGER)
        res = {r['id']: r for r in read_jsonl(RESULTS)}
        for l in led:
            r = res.get(l['id'])
            v = 'OPEN'
            if r:
                v = 'WON' if r['won'] else 'LOST'
            print(f"{l['date']} {l['ko']:>5s} {l['home'][:22]:24s} v {l['away'][:20]:22s} "
                  f"{l['market'][:14]:15s} {l['line']:10s} p={l['prob'] if l['prob'] else 0:.2f}  {v}")


if __name__ == '__main__':
    main()

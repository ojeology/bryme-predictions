#!/usr/bin/env python3
"""
FOULS BOARD — what to price today, and what the model says about the real
prices we have already graded.

  1. THE REAL-PRICE TEST — every fouls leg we ever paid a price for, scored by
     the walk-forward model (model probability vs the real outcome vs the real
     price).  This is the only number that matters.
  2. TODAY'S BOARD — every Saturday fixture, with the referee's PRIOR foul
     average, the competition baseline, the model's probability for each
     Over line, and the MINIMUM ACCEPTABLE PRICE.
"""
import json, os, re, math, collections, unicodedata, difflib, datetime, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')

MATCH_LINES = [19.5, 20.5, 21.5, 22.5, 23.5, 24.5, 25.5]
SIGMA_TAU2 = 2.29 ** 2      # between-referee spread (Sportmonks, 142 refs)
SIGMA_OBS2 = 33.5           # variance of one match's foul total


def shrink_ref(obs_avg, obs_n, prior_mean):
    """Posterior mean for a referee's true foul average."""
    if not obs_avg or obs_n <= 0:
        return prior_mean, 0.0
    w = (obs_n / SIGMA_OBS2) / (obs_n / SIGMA_OBS2 + 1.0 / SIGMA_TAU2)
    return w * obs_avg + (1 - w) * prior_mean, w
TEAM_LINES = [9.5, 10.5, 11.5, 12.5, 13.5, 14.5]
EDGE = 1.05
MIN_REF_GAMES = 8
GENERIC = {'fc', 'cf', 'sc', 'ac', 'afc', 'tsg', 'sk', 'fk', 'cd', 'sd', 'ud', 'rc',
           'club', 'calcio', 'de', 'of', 'the', 'us', 'ss', 'as', 'nk', 'if', 'ca'}


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', s)


def toks(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    t = set(re.findall(r'[a-z]+', s)) - GENERIC
    return t or set(re.findall(r'[a-z]+', s))


def over_pmf(lam, size, line):
    if lam <= 0:
        return 0.0
    r = size
    p = r / (r + lam)
    q = 1.0 - p
    kmax = int(line)
    lp, lq = math.log(p), math.log(q)
    logs = [math.lgamma(k + r) - math.lgamma(r) - math.lgamma(k + 1) + r * lp + k * lq
            for k in range(kmax + 1)]
    mx = max(logs)
    cdf = math.exp(mx) * sum(math.exp(l - mx) for l in logs)
    return max(0.0, min(1.0, 1.0 - cdf))


def fit_size(vals):
    n = len(vals)
    if n < 20:
        return 50.0
    m = sum(vals) / n
    v = sum((x - m) ** 2 for x in vals) / (n - 1)
    return 200.0 if v <= m else m * m / (v - m)


def load_manifest_refs():
    """Sportmonks referee foul averages from the manifest — pre-match, and
    covering up to 35 games per referee against our cache's 1-7."""
    try:
        man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    except Exception:
        return {}
    out = {}
    for r in man.get('referees', []):
        if r.get('avg_fouls') and r.get('games'):
            out[r['name']] = (float(r['avg_fouls']), int(r['games']))
    return out


def load_state():
    """Everything known BEFORE each cached match, so we can score new fixtures."""
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for v in cache.values():
        if v.get('finished') and v.get('fouls'):
            ms.append(dict(date=str(v.get('utcTime'))[:10], ts=v.get('utcTime'),
                           home=v.get('homeName'), away=v.get('awayName'),
                           fh=v['fouls'][0], fa=v['fouls'][1],
                           comp=v.get('compName') or v.get('compSlug'),
                           ref=(v.get('referee') or {}).get('name')))
    ms.sort(key=lambda m: (m['ts'] or '', m['home'] or ''))

    team_for = collections.defaultdict(lambda: [0.0, 0])
    team_against = collections.defaultdict(lambda: [0.0, 0])
    ref_tot = collections.defaultdict(lambda: [0.0, 0])
    comp_team = collections.defaultdict(lambda: [0.0, 0])
    all_team = []
    for m in ms:
        team_for[m['home']][0] += m['fh']; team_for[m['home']][1] += 1
        team_for[m['away']][0] += m['fa']; team_for[m['away']][1] += 1
        team_against[m['home']][0] += m['fa']; team_against[m['home']][1] += 1
        team_against[m['away']][0] += m['fh']; team_against[m['away']][1] += 1
        if m['ref']:
            ref_tot[m['ref']][0] += m['fh'] + m['fa']; ref_tot[m['ref']][1] += 1
        comp_team[m['comp']][0] += m['fh'] + m['fa']; comp_team[m['comp']][1] += 2
        all_team += [m['fh'], m['fa']]
    base_team = sum(all_team) / len(all_team)
    return dict(ms=ms, team_for=team_for, team_against=team_against, ref_tot=ref_tot,
                comp_team=comp_team, base_team=base_team, man_refs=load_manifest_refs(),
                size_team=fit_size(all_team),
                size_match=fit_size([m['fh'] + m['fa'] for m in ms]))


def predict(st, home, away, comp, ref):
    base_team = st['base_team']
    c = comp
    if st['comp_team'][c][1] >= 10:
        cb = st['comp_team'][c][0] / st['comp_team'][c][1]
    else:
        cb = base_team
    # referee foul average: our walk-forward cache sample AND the much broader
    # Sportmonks figure in the manifest, pooled by games, then shrunk toward
    # the competition baseline
    c_avg, c_n = None, 0
    if ref and st['ref_tot'][ref][1]:
        c_avg = st['ref_tot'][ref][0] / st['ref_tot'][ref][1]
        c_n = st['ref_tot'][ref][1]
    m_avg, m_n = st.get('man_refs', {}).get(ref, (None, 0))
    if m_avg and m_n >= 3:
        tot_n = m_n + c_n
        tot_avg = (m_avg * m_n + (c_avg * c_n if c_avg else 0)) / tot_n
    else:
        tot_n, tot_avg = c_n, c_avg
    ref_avg_used, ref_w = shrink_ref(tot_avg, tot_n, cb * 2)
    ref_avg, ref_n = tot_avg, tot_n
    mult = ref_avg_used / (cb * 2)

    def rate(d, k):
        f, n = d.get(k, [0, 0])
        return (f / n, n) if n else (None, 0)

    def shrink(own, n, b, k=8.0):
        if n <= 0:
            return b
        w = n / (n + k)
        return w * own + (1 - w) * b

    def lam_for(team):
        f, fn = rate(st['team_for'], team)
        ag, an = rate(st['team_against'], team)
        ff = shrink(f, fn, cb) if f is not None else cb
        aa = shrink(ag, an, cb) if ag is not None else cb
        return max(2.0, 0.5 * (ff + aa) * mult), fn, an

    lh, hn, han = lam_for(home)
    la, an, aan = lam_for(away)
    lm = lh + la
    out = dict(comp_base_team=cb, ref_avg=ref_avg, ref_n=ref_n, ref_mult=mult,
               ref_avg_used=ref_avg_used, ref_w=ref_w,
               lam_h=lh, lam_a=la, lam_m=lm, hn=hn, an=an)
    for L in MATCH_LINES:
        out[f'm_{L}'] = over_pmf(lm, st['size_match'], L)
    for L in TEAM_LINES:
        out[f'h_{L}'] = over_pmf(lh, st['size_team'], L)
        out[f'a_{L}'] = over_pmf(la, st['size_team'], L)
    return out


def find_fixture(ms, home, away):
    th, ta = toks(home), toks(away)
    best, sc_best = None, 0
    for m in ms:
        vh, va = toks(m['home']), toks(m['away'])
        fwd = (th <= vh or vh <= th) and (ta <= va or va <= ta)
        rev = (th <= va or va <= th) and (ta <= vh or vh <= ta)
        if fwd or rev:
            sc = difflib.SequenceMatcher(None, norm(home) + norm(away),
                                          norm(m['home']) + norm(m['away'])).ratio()
            if sc > sc_best:
                best, sc_best = m, sc
    return best


def main():
    st = load_state()
    print(f'state built from {len(st["ms"])} finished matches '
          f'({st["ms"][0]["date"]} -> {st["ms"][-1]["date"]})')
    print(f'league baseline {st["base_team"]:.2f} fouls per team\n')

    # ------------------------------------------------------------------ 1. price test
    legs = json.load(open(os.path.join(DATA, 'fouls_audit_legs.json')))
    priced = [l for l in legs if l['market'] == 'fouls' and l.get('px') and l['won'] is not None]
    print('=' * 118)
    print('1. THE REAL-PRICE TEST — every fouls leg we paid a real price for')
    print('=' * 118)
    seen = set()
    rows = []
    for l in priced:
        key = (l['fx'], l['scope'], l['line'], l['side'])
        if key in seen:
            continue
        seen.add(key)
        m = find_fixture(st['ms'], l['home'], l['away'])
        if not m:
            continue
        pr = predict(st, m['home'], m['away'], m['comp'], m['ref'])
        if l['scope'] == 'team':
            pm = pr['h_%s' % l['line']] if toks(l['team']) <= toks(m['home']) else pr['a_%s' % l['line']]
        else:
            pm = pr['m_%s' % l['line']]
        rows.append(dict(l=l, model=pm, ref_avg=pr['ref_avg'], ref_n=pr['ref_n'],
                         comp=pr['comp_base_team'], ref=pr['ref_mult']))
    print(f'{"fixture":34s} {"scope":>5s} {"ln":>5s} {"px":>5s} {"model":>7s} {"actual":>7s} '
          f'{"comp base":>10s} {"ref avg":>8s} {"ref n":>6s} {"EV":>8s}')
    for r in rows:
        l = r['l']
        ev = (r['model'] * l['px'] - 1) * 100
        print(f'{l["fx"][:34]:34s} {l["scope"]:>5s} {l["line"]:5.1f} {l["px"]:5.2f} '
              f'{r["model"]*100:6.1f}% {"WON" if l["won"] else "LOST":>7s} '
              f'{r["comp"]:10.2f} {(str(round(r["ref_avg"],1)) if r["ref_avg"] else "-"):>8s} '
              f'{r["ref_n"]:6d} {ev:+7.1f}%')
    if rows:
        mp = sum(r['model'] for r in rows) / len(rows)
        hit = sum(1 for r in rows if r['l']['won']) / len(rows)
        evm = sum((r['model'] * r['l']['px'] - 1) * 100 for r in rows) / len(rows)
        print(f'\n  model average {mp*100:.1f}%  |  actual hit rate {hit*100:.1f}%  |  '
              f'mean EV at the real prices {evm:+.1f}%')
        print(f'  break-even price at the model probability: {1/mp:.3f}')
        # what price WOULD have worked
        print('\n  price needed for a 5% edge on each line (model probability):')
        for L in sorted(set(r['l']['line'] for r in rows)):
            sub = [r for r in rows if r['l']['line'] == L]
            if not sub:
                continue
            p = sum(r['model'] for r in sub) / len(sub)
            print(f'    O{L:<5} model {p*100:5.1f}%  break-even {1/p:.3f}  +5% edge needs '
                  f'{1.05/p:.3f}   (real prices here: '
                  f'{sorted(set(round(r["l"]["px"],2) for r in sub))})')

    # ------------------------------------------------------------------ 2. today's board
    print('\n' + '=' * 118)
    print('2. TODAY\'S BOARD — Saturday 24 Oct, every fixture on the card')
    print('=' * 118)
    board = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    extra = [('Racing Santander v Espanyol', 'La Liga', 'Jesus Gil Manzano', '15:15'),
             ('RC Lens v Paris FC', 'Ligue 1', 'Ayrton Ventura', '19:45')]
    rowsout = []
    for r in board:
        fx = f"{r['home']} v {r['away']}"
        m = find_fixture(st['ms'], r['home'], r['away'])
        comp = (m['comp'] if m else None) or r.get('comp')
        ref = (m['ref'] if m else None) or r.get('ref')
        pr = predict(st, r['home'], r['away'], comp, ref)
        rowsout.append(dict(fx=fx, ko=r.get('ko'), date=r.get('date'), comp=comp,
                            ref=ref, pr=pr,
                            ref_games=pr['ref_n'], hn=pr['hn'], an=pr['an']))
    for fx, comp, ref, ko in extra:
        pr = predict(st, fx.split(' v ')[0], fx.split(' v ')[1], comp, ref)
        rowsout.append(dict(fx=fx, ko=ko, date='2026-10-24', comp=comp, ref=ref, pr=pr,
                            ref_games=pr['ref_n'], hn=pr['hn'], an=pr['an']))
    print(f'{"fixture":32s} {"KO":>6s} {"comp":26s} {"ref":22s} {"ref fouls/g":>12s} {"n":>4s} '
          f'{"proj":>5s} | best OVER line + minimum price')
    print('-' * 118)
    out = []
    for r in rowsout:
        pr = r['pr']
        cands = []
        for L in MATCH_LINES:
            p = pr[f'm_{L}']
            if p <= 0:
                continue
            fair = 1.0 / p
            if fair < 1.08:          # below the 1.08 floor a leg cannot help a 3.00x step
                continue
            cands.append((L, p, fair * EDGE))
        if not cands:
            continue
        # prefer the line with the best cushion = highest (probability x price) ratio
        best = max(cands, key=lambda c: c[1] * c[2])
        out.append((r, best, cands))
    out.sort(key=lambda t: -(t[1][1] * t[1][2]))
    for r, best, cands in out:
        pr = r['pr']
        L, p, take = best
        print(f'{r["fx"][:32]:32s} {str(r["ko"]):>6s} {str(r["comp"])[:26]:26s} '
              f'{str(r["ref"])[:22]:22s} '
              f'{(f"{pr["ref_avg"]:.1f}" if pr["ref_avg"] else "-"):>12s} {pr["ref_n"]:4d} '
              f'{pr["lam_m"]:5.1f} | O{L} model {p*100:.1f}%  TAKE AT {take:.2f}+')
    # ------------------------------------------------------------------ 3. TEAM fouls board
    print('\n' + '=' * 118)
    print('3. TEAM FOULS BOARD — the dirty side, a ladder of lines, and the price')
    print('=' * 118)
    trows = []
    for r in rowsout:
        pr = r['pr']
        home, away = r['fx'].split(' v ')
        hf, hn = st['team_for'].get(home, [0, 0])
        af, an = st['team_for'].get(away, [0, 0])
        hr = hf / hn if hn else None
        ar = af / an if an else None
        # the dirtier side, by the model's own projection
        if pr['lam_h'] >= pr['lam_a']:
            side, rate, n = 'HOME', hr, hn
        else:
            side, rate, n = 'AWAY', ar, an
        ladder = []
        for L in TEAM_LINES:
            pm = pr['h_%s' % L] if side == 'HOME' else pr['a_%s' % L]
            fair = 1.0 / pm if pm > 0 else 0
            ladder.append((L, pm, fair, fair * EDGE))
        trows.append((r, side, rate, n, ladder))
    trows.sort(key=lambda t: -max(p for _, p, _, _ in t[4]))

    MD = []
    MD.append('# Team Fouls board — Saturday 24 Oct 2026\n')
    MD.append(f'Generated {datetime.datetime.now(datetime.timezone.utc):%Y-%m-%d %H:%M UTC} | '
              'walk-forward model | Pure OVER only | target **3.00x** per slip\n')
    MD.append('## How to read it\n')
    MD.append('Each fixture shows the **dirtier of the two sides** and a ladder of team-foul '
              'Over lines. `TAKE AT` is the minimum price that leaves a 5% edge after '
              'calibration — **below that, skip**.\n')
    MD.append('`fouls/g` is that team\'s own average from its prior matches. `n` is how many '
              'matches that rests on. `ref g` is the referee\'s average fouls per game from '
              'prior matches, and `ref n` is how many.\n')
    MD.append('> **Sample floor:** our v2 gate needs **8+ prior games** for a fouls line. '
              'Where `ref n` is under 8, the referee leg of the model is thin — take those '
              'lines only at a bigger price, or skip them.\n')
    MD.append('| Fixture | KO | Dirty side | Line | Model | TAKE AT | their fouls/g | n | ref fouls/g | ref n |')
    MD.append('|---|---|---|---|---|---|---|---|---|---|')
    for r, side, rate, n, ladder in trows:
        for L, pm, fair, take in ladder:
            if pm <= 0 or fair < 1.08:
                continue
            flag = '' if r['pr']['ref_n'] >= MIN_REF_GAMES else ' ⚠'
            MD.append(f'| {r["fx"]} | {r["ko"]} | **{side}** | O{L} | {pm*100:.1f}% | '
                      f'**{take:.2f}+** | {(f"{rate:.1f}" if rate else "—"):>5s} | {n} | '
                      f'{(f"{r["pr"]["ref_avg"]:.1f}" if r["pr"]["ref_avg"] else "—"):>5s} | '
                      f'{r["pr"]["ref_n"]}{flag} |')
    MD.append('')
    MD.append('## The five cleanest and five dirtiest sides in the model\n')
    sides = []
    for r, side, rate, n, ladder in trows:
        sides.append((rate or 0, r['fx'], side, n))
    sides.sort()
    MD.append('| Cleanest | fouls/g | n | | Dirtiest | fouls/g | n |')
    MD.append('|---|---|---|---|---|---|---|')
    for i in range(5):
        c = sides[i]
        d = sides[-(i + 1)]
        MD.append(f'| {c[1]} ({c[2]}) | {c[0]:.1f} | {c[3]} | | {d[1]} ({d[2]}) | {d[0]:.1f} | {d[3]} |')
    MD.append('')
    open(os.path.join(DATA, 'TEAM_FOULS_BOARD_2026-10-24.md'), 'w').write('\n'.join(MD))
    print('wrote bot-engine/data/TEAM_FOULS_BOARD_2026-10-24.md')

    for r, side, rate, n, ladder in trows[:14]:
        l = '  '.join(f'O{L} {pm*100:.0f}% @{take:.2f}' for L, pm, fair, take in ladder
                      if pm > 0 and fair >= 1.08)
        print(f'  {r["fx"][:30]:30s} {str(r["ko"]):>5s} {side:5s} '
              f'{(f"{rate:.1f}/g n={n}" if rate else "no data"):>14s}  {l}')

    json.dump(dict(
        matches=[dict(fx=r['fx'], ko=r['ko'], date=r.get('date'), comp=r['comp'], ref=r['ref'],
                      ref_avg=r['pr']['ref_avg'], ref_n=r['pr']['ref_n'],
                      lam_m=r['pr']['lam_m'], lam_h=r['pr']['lam_h'],
                      lam_a=r['pr']['lam_a'],
                      lines=[dict(line=L, p=p, take=t) for L, p, t in cands])
                for r, best, cands in out],
        team_fouls=[dict(fx=r['fx'], ko=r['ko'], date=r.get('date'), side=side, rate=rate, n=n,
                         ref_avg=r['pr']['ref_avg'], ref_n=r['pr']['ref_n'],
                         ladder=[dict(line=L, p=pm, take=take)
                                 for L, pm, fair, take in ladder])
                    for r, side, rate, n, ladder in trows]),
        open(os.path.join(DATA, 'fouls_board_2026-10-24.json'), 'w'), indent=1)
    print('\nwrote bot-engine/data/fouls_board_2026-10-24.json')


if __name__ == '__main__':
    main()

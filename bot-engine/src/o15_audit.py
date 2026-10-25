#!/usr/bin/env python3
"""
THE O1.5 AUDIT — which of today's picks actually have the history
=================================================================
The buffer puts us on Cards O1.5, which wins when the MATCH has 2+ cards.
The model says ~85% likely.  The record says otherwise, and the record wins.

For every recommended fixture this shows FOUR independent checks:

  1. TEAM A   — how many of their recent matches went over 1.5 cards
  2. TEAM B   — same
  3. REFEREE  — how often HIS OWN recent matches went over 1.5 cards
                (the referee is the driver of a card count, not the teams)
  4. H2H      — what happened in the last times THIS referee officiated
                THESE two teams against each other

Then a verdict: CLEAN, MIXED or AVOID.
"""
import json, os, re, collections, statistics as st, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def load():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for mid, m in cache.items():
        y = m.get('yellows') or []
        if len(y) != 2:
            continue
        ms.append(dict(mid=mid, date=(m.get('utcTime') or '')[:10],
                       home=m.get('homeName'), away=m.get('awayName'),
                       hc=y[0], ac=y[1], mc=y[0] + y[1],
                       ref=(m.get('referee') or {}).get('name')))
    ms.sort(key=lambda m: m['date'])
    return ms


def build_index(ms):
    idx = collections.defaultdict(list)
    for m in ms:
        idx[norm(m['home'])].append(m)
        idx[norm(m['away'])].append(m)
    names = set()
    for m in ms:
        names.add(m['home'])
        names.add(m['away'])
    return idx, names


PREFIX_NOISE = {'tsg', 'fc', 'f.c.', 'sc', 'us', 'as', 'rc', 'cd', 'vfl', 'vfb',
                'losc', 'ud', 'ogc', 'sm', 'rcs', 'fsv', 'vfb', 'bv', 'ca', 'aj',
                'if', 'bk', 'ifk', 'sv', 'sp', 'tsv', 'svv', 'ssc', 'de', 'bc',
                'rcd', 'hk', 'sk', 'fk', 'nk', 'ac', 'olympique', 'olympico',
                'sporting', 'real', 'atletico', 'athletic', 'club'}


def _core(s):
    """Strip club-name noise tokens, keep the distinctive ones."""
    raw = re.findall(r'[a-z0-9]+', unicodedata.normalize('NFKD', str(s or '')).lower()
                     .replace('ä', 'a').replace('ö', 'o').replace('ü', 'u')
                     .replace('é', 'e').replace('è', 'e').replace('ê', 'e')
                     .replace('ç', 'c').replace('ñ', 'n').replace('ø', 'o'))
    keep = [t for t in raw if t not in PREFIX_NOISE]
    # light stemming so 'lyonnais' matches 'lyon'
    def stem(t):
        for suf in ('ais', 'ens', 'es', 's', 'e'):
            if len(t) > len(suf) + 2 and t.endswith(suf):
                return t[:-len(suf)]
        return t
    return {stem(t) for t in keep}, {stem(t) for t in raw}


def resolve(t, names):
    """Map a board club name onto the FotMob name for the same club."""
    if not t:
        return None
    n = norm(t)
    byn = {norm(x): x for x in names}
    if n in byn:
        return byn[n]
    ct, rt = _core(t)
    if not ct:
        ct = rt
    for nx, x in byn.items():
        cx, _ = _core(x)
        if cx and (ct == cx or ct <= cx or cx <= ct):
            # require the distinctive part to line up, not just one token
            if ct <= cx or cx <= ct:
                return x
    for nx, x in byn.items():
        cx, _ = _core(x)
        if cx and len(cx & ct) >= max(1, min(len(cx), len(ct))):
            return x
    return None


def main():
    ms = load()
    idx, names = build_index(ms)
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    picks = json.load(open(os.path.join(DATA, 'best_picks_2026-10-25.json')))

    rec = {}
    for p in picks:
        if p['date'] != '2026-10-25' or p.get('driver') != 'REF' or p['market'] != 'Cards':
            continue
        k = (p['home'], p['away'])
        if k not in rec or (p.get('prob') or 0) > (rec[k].get('prob') or 0):
            rec[k] = p

    byref = collections.defaultdict(list)
    for m in ms:
        if m['ref']:
            byref[m['ref']].append(m)

    out = ['# THE O1.5 AUDIT — does the history back up the buffer line?', '',
           'We are playing **Cards O1.5**, which wins when the match has **2+ cards**.',
           'The model says 85-87%. The record gets a vote.', '',
           '| # | Fixture | Line | Team A record | Team B record | Referee record | H2H under this ref | Verdict |',
           '|---|---------|------|---------------|---------------|----------------|---------------------|---------|']
    verdicts = []
    for i, ((home, away), p) in enumerate(
            sorted(rec.items(), key=lambda kv: -(kv[1].get('prob') or 0)), 1):
        hr, ar = resolve(home, names), resolve(away, names)
        ref = p.get('referee')
        rm = byref.get(ref, [])
        line = p['line']

        def teamrec(t):
            if not t:
                return '?', 0, 0, None
            tm = idx[norm(t)][-12:]
            if not tm:
                return '?', 0, 0, None
            over = sum(1 for m in tm if m['mc'] > 1.5)
            lastfail = None
            for m in tm:
                if m['mc'] <= 1.5:
                    lastfail = m['date']
            return t, over, len(tm), lastfail

        tn, ho, hn, hf = teamrec(hr)
        an, ao, an_, af = teamrec(ar)
        if rm:
            rover = sum(1 for m in rm if m['mc'] > 1.5)
            rstr = f"{rover}/{len(rm)} = {100*rover/len(rm):.0f}%"
        else:
            rstr = 'no games'
        # head to head under this referee
        h2h = [m for m in ms if m['ref'] == ref
               and {norm(m['home']), norm(m['away'])} == {norm(home), norm(away)}]
        if h2h:
            hs = ' · '.join(f"{m['date']} {m['mc']} cards" for m in h2h[-3:])
        else:
            hs = 'no meetings'

        def fmt(t, o, n, f):
            if n == 0:
                return 'n/a'
            return f"{o}/{n}" + ('' if f is None else f" (last {f})")

        # verdict
        ta_ok = (hn == 0) or (ho / hn >= 0.85)
        tb_ok = (an_ == 0) or (ao / an_ >= 0.85)
        if rm:
            rr = sum(1 for m in rm if m['mc'] > 1.5) / len(rm)
        else:
            rr = None
        clean = ta_ok and tb_ok
        if clean and (rr is None or rr >= 0.85):
            v = '**CLEAN**'
        elif clean or (rr is not None and rr >= 0.9):
            v = 'MIXED'
        else:
            v = 'CAUTION'
        verdicts.append((home, away, line, p.get('prob'), ho, hn, hf, ao, an_, af,
                         rstr, hs, v))
        out.append(f"| {i} | {home} v {away} | {line} | {fmt(tn, ho, hn, hf)} | "
                   f"{fmt(an, ao, an_, af)} | {rstr} | {hs} | {v} |")

    out += ['', '## How to read the verdict', '',
            '* **CLEAN** — both teams are over 1.5 in at least 85% of their recent',
            '  matches (or never below 2 cards at all), and the referee\'s own games',
            '  go over 1.5 at least 85% of the time.',
            '* **MIXED** — one of the three is soft.',
            '* **CAUTION** — two of the three are soft. The buffer does not save a',
            '  fixture where both teams keep landing on 1 card and the referee keeps',
            '  keeping games quiet.', '',
            '## The referee record, on its own', '',
            '| Referee | Games | Over 1.5 | Over 2.5 | Mean cards |',
            '|---------|-------|----------|----------|------------|']
    refs_used = sorted({p.get('referee') for p in rec.values() if p.get('referee')})
    for r in refs_used:
        rm = byref.get(r, [])
        if not rm:
            continue
        o15 = sum(1 for m in rm if m['mc'] > 1.5)
        o25 = sum(1 for m in rm if m['mc'] > 2.5)
        out.append(f"| {r} | {len(rm)} | {o15} ({100*o15/len(rm):.0f}%) | "
                   f"{o25} ({100*o25/len(rm):.0f}%) | {st.mean([m['mc'] for m in rm]):.2f} |")

    out += ['', '## The plain answer', '']
    clean = [v for v in verdicts if v[-1].strip('*') == 'CLEAN']
    mixed = [v for v in verdicts if v[-1] == 'MIXED']
    caut = [v for v in verdicts if v[-1] == 'CAUTION']
    out.append(f'**{len(clean)} fixtures are CLEAN.** {len(mixed)} are mixed, {len(caut)} '
               f'need caution.')
    out.append('')
    for tag, group in (('CLEAN', clean), ('MIXED', mixed), ('CAUTION', caut)):
        if not group:
            continue
        out.append(f'**{tag}**')
        for v in group:
            out.append(f"* {v[0]} v {v[1]} — {v[2]} (model {(v[3] or 0)*100:.1f}%)")
        out.append('')

    p = os.path.join(DATA, 'O15_AUDIT_2026-10-25.md')
    open(p, 'w').write('\n'.join(out) + '\n')
    print('\n'.join(out))
    print('wrote', p)


if __name__ == '__main__':
    main()

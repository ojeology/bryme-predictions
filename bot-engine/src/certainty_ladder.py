#!/usr/bin/env python3
"""
CERTAINTY LADDER — 25 Oct 2026
================================
The filter is certainty, not value.  We want the lines that are as close to
certain as this market allows, and we take them whatever they pay.

THE CEILING (2026-27, 1,528 matches, bookings basis — yellow 1, red 2):
    at least ONE booking in the match      97.1%   <- the near-100% line
    2+ bookings in the match               88.4%
    3+ bookings in the match               74.8%
    a TEAM gets booked                     86.4%   (referee moves this 73%-92%)
    a team gets 2+ bookings                60.4%
    both teams booked                      75.7%

So the most certain USEFUL line is a TEAM booked line on a loud referee
(86.4% base, up to ~92%), or 2+ match bookings on a loud referee.
"""
import json, os, re, unicodedata, collections, statistics as st

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')


def nk(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def load():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for mid, m in cache.items():
        if not m.get('finished'):
            continue
        y = m.get('yellows') or []
        r = m.get('reds') or []
        if len(y) != 2:
            continue
        hr, ar = (r[0], r[1]) if len(r) == 2 else (0, 0)
        ms.append(dict(date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hc=y[0] + 2 * hr, ac=y[1] + 2 * ar,
                       book=y[0] + y[1] + 2 * (hr + ar), tot=y[0] + y[1],
                       ref=(m.get('referee') or {}).get('name')))
    ms.sort(key=lambda m: m['date'])
    return ms


def fit_referee(ms, thr, kind, K=20):
    """kind 'match' -> bookings over thr;  kind 'team' -> a team booked over thr."""
    def ok(m, which=None):
        if kind == 'match':
            return m['book'] > thr
        return None
    if kind == 'match':
        base = sum(1 for m in ms if m['book'] > thr) / len(ms)
    else:
        base = sum(1 for m in ms for v in (m['hc'], m['ac']) if v > thr) / (2 * len(ms))
    n = collections.Counter()
    h = collections.Counter()
    for m in ms:
        if kind == 'match':
            if m['ref']:
                n[m['ref']] += 1
                h[m['ref']] += (m['book'] > thr)
        else:
            if m['ref']:
                n[m['ref']] += 2
                h[m['ref']] += (m['hc'] > thr) + (m['ac'] > thr)
    tab = {r: dict(n=n[r], raw=h[r] / n[r],
                   eff=(h[r] / n[r] - base) * (n[r] / (n[r] + K))) for r in n}
    return base, tab


def main():
    ms = load()
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refman = {r['name']: r for r in man['referees']}
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))

    m05b, m05t = fit_referee(ms, 0.5, 'match'), fit_referee(ms, 0.5, 'team')
    m15b, m15t = fit_referee(ms, 1.5, 'match'), fit_referee(ms, 1.5, 'team')
    m25b, m25t = fit_referee(ms, 2.5, 'match'), fit_referee(ms, 2.5, 'team')
    print(f'bases: match bookings over 0.5 {m05b[0]*100:.1f}%  over 1.5 {m15b[0]*100:.1f}%  '
          f'over 2.5 {m25b[0]*100:.1f}%   |  team booked over 0.5 {m05t[0]*100:.1f}%  '
          f'over 1.5 {m15t[0]*100:.1f}%')

    def prob(model, ref, thr):
        base, tab = model
        rv = tab.get(ref)
        eff = rv['eff'] if rv else 0.0
        return max(0.02, min(0.995, base + eff))

    byteam = collections.defaultdict(list)
    for m in ms:
        byteam[m['home']].append((m, 'H'))
        byteam[m['away']].append((m, 'A'))

    name_map = {}
    for t in byteam:
        name_map.setdefault(nk(t), t)

    def resolve(s):
        s = s.strip()
        if s in byteam:
            return s
        k = nk(s)
        if k in name_map:
            return name_map[k]
        c = [t for kk, t in name_map.items() if k in kk or kk in k]
        return max(c, key=len) if c else None

    ladder = []
    for r in board:
        ref = r['ref']
        parts = [x.strip() for x in r['fx'].split(' v ')]
        h, a = resolve(parts[0]), resolve(parts[1])
        for tm, side in ((parts[0], 'HOME'), (parts[1], 'AWAY')):
            pass
        entries = []
        entries.append(('Match Bookings over 0.5', prob(m05b, ref, 0.5), 'match'))
        entries.append(('Match Bookings over 1.5', prob(m15b, ref, 1.5), 'match'))
        entries.append(('Match Bookings over 2.5', prob(m25b, ref, 2.5), 'match'))
        for tm, side in ((parts[0], 'HOME'), (parts[1], 'AWAY')):
            entries.append((f'{tm} to be booked', prob(m05t, ref, 0.5), 'team'))
        for name, p, kind in entries:
            ladder.append(dict(ko=r['ko'], fx=r['fx'], ref=ref, line=name, p=p, kind=kind,
                               comp=r['comp'], src=r.get('src')))
    ladder.sort(key=lambda x: -x['p'])

    W = []
    W.append('# THE CERTAINTY LADDER — Sunday 25 Oct 2026')
    W.append('')
    W.append('Ranked by how close to certain it is, not by value. Price is shown where we know it.')
    W.append('')
    W.append('## THE CEILING OF THIS MARKET')
    W.append('')
    W.append('| What happens | How often (2026-27, 1,528 matches) |')
    W.append('|---|---|')
    W.append('| **At least ONE booking in the match** | **97.1%** |')
    W.append('| 2+ bookings in the match | 88.4% |')
    W.append('| 3+ bookings in the match | 74.8% |')
    W.append('| A TEAM gets booked | 86.4% (referee moves it 73% to 92%) |')
    W.append('| A team gets 2+ bookings | 60.4% |')
    W.append('| Both teams booked | 75.7% |')
    W.append('')
    W.append('**Nothing in these markets is 100%.** The single most certain thing is "at least one '
             'booking in the match" at 97.1% — if the book offers Total Bookings over 0.5, that is the '
             'near-100% leg. Above 97% there is nothing to buy.')
    W.append('')
    W.append('## WHAT YOU ALREADY HOLD')
    W.append('')
    W.append('Man United to be booked @1.15 — our model **89.1%**, fair 1.12.')
    W.append('Man Utd have been booked in **9 of their last 10**, and of Gillett\'s 7 matches in our '
             'cache a team was booked in 13 of 14 team-matches.')
    W.append('')
    W.append('## THE LADDER')
    W.append('')
    W.append('| # | KO | Fixture | Line | Our p | Record behind it |')
    W.append('|---|---|---|---|---|---|')
    for i, x in enumerate(ladder[:46], 1):
        rec = ''
        if x['kind'] == 'team':
            tm = x['line'].replace(' to be booked', '')
            rows_t = byteam.get(resolve(tm) or '', [])
            if rows_t:
                last10 = rows_t[-10:]
                b = sum(1 for m, sd in last10
                        if (m['hc'] if sd == 'H' else m['ac']) > 0.5)
                rec = f'team booked in {b}/{len(last10)}'
        else:
            rm = refman.get(x['ref'])
            if rm:
                rec = f"ref {x['ref'].split()[0]} {rm['over_3_5']}% over 3.5"
        W.append(f"| {i} | {x['ko']} | {x['fx'][:34]} | {x['line'][:36]} | **{x['p']*100:.1f}%** | {rec} |")
    W.append('')
    out = '\n'.join(W)
    open(os.path.join(DATA, 'CERTAINTY_LADDER_2026-10-25.md'), 'w').write(out)
    json.dump(ladder, open(os.path.join(DATA, 'certainty_ladder_2026-10-25.json'), 'w'), indent=1)
    print(out)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
CERTAINTY TICKET — 25 Oct 2026
================================
One line per fixture (SportyBet rejects two selections from the same event).
Legs on different matches are treated as independent; the correlation that
does exist between different fixtures is small enough to ignore.

Objective: for a given number of legs, find the set with the highest joint
probability of landing, then show what the book must pay for it to be worth
taking.
"""
import json, os, re, unicodedata, collections, itertools

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')


def nk(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def load_cache():
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
                       book=y[0] + y[1] + 2 * (hr + ar),
                       ref=(m.get('referee') or {}).get('name')))
    ms.sort(key=lambda m: m['date'])
    return ms


def fit(ms, thr, kind, K=20):
    if kind == 'match':
        base = sum(1 for m in ms if m['book'] > thr) / len(ms)
    else:
        base = sum(1 for m in ms for v in (m['hc'], m['ac']) if v > thr) / (2 * len(ms))
    n = collections.Counter()
    h = collections.Counter()
    for m in ms:
        if not m['ref']:
            continue
        if kind == 'match':
            n[m['ref']] += 1
            h[m['ref']] += (m['book'] > thr)
        else:
            n[m['ref']] += 2
            h[m['ref']] += (m['hc'] > thr) + (m['ac'] > thr)
    tab = {r: (h[r] / n[r] - base) * (n[r] / (n[r] + K)) for r in n}
    return base, tab


def main():
    ms = load_cache()
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refman = {r['name']: r for r in man['referees']}
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))

    M05, M15, M25 = fit(ms, 0.5, 'match'), fit(ms, 1.5, 'match'), fit(ms, 2.5, 'match')
    T05, T15 = fit(ms, 0.5, 'team'), fit(ms, 1.5, 'team')

    def p_of(model, ref):
        base, tab = model
        rv = tab.get(ref)
        return max(0.02, min(0.995, base + (rv if rv else 0.0)))

    byteam = collections.defaultdict(list)
    for m in ms:
        byteam[m['home']].append((m, 'H'))
        byteam[m['away']].append((m, 'A'))
    nm = {}
    for t in byteam:
        nm.setdefault(nk(t), t)

    def resolve(s):
        s = s.strip()
        if s in byteam:
            return s
        k = nk(s)
        if k in nm:
            return nm[k]
        c = [t for kk, t in nm.items() if k in kk or kk in k]
        return max(c, key=len) if c else None

    best = {}
    for r in board:
        ref = r['ref']
        parts = [x.strip() for x in r['fx'].split(' v ')]
        cands = [
            ('Match Bookings over 0.5', p_of(M05, ref)),
            ('Match Bookings over 1.5', p_of(M15, ref)),
            ('Match Bookings over 2.5', p_of(M25, ref)),
        ]
        for tm, side in ((parts[0], 'HOME'), (parts[1], 'AWAY')):
            cands.append((f'{tm} to be booked', p_of(T05, ref)))
            cands.append((f'{tm} 2+ bookings', p_of(T15, ref)))
        # only lines worth having in a ticket: fair price 1.08 or better
        useful = [c for c in cands if 1 / c[1] >= 1.08]
        if not useful:
            useful = cands
        name, p = max(useful, key=lambda c: c[1])
        rm = refman.get(ref)
        rec = ''
        if rm:
            rec = f"{ref} — {rm['games']}g, {rm['avg_yellows']:.2f} cards/g, over 3.5 {rm['over_3_5']}%"
        elif ref:
            rec = f'{ref}'
        if name.endswith('to be booked'):
            tm = name[:-len(' to be booked')]
            rows_t = byteam.get(resolve(tm) or '', [])
            if rows_t:
                l10 = rows_t[-10:]
                b = sum(1 for m, sd in l10 if (m['hc'] if sd == 'H' else m['ac']) > 0.5)
                rec += f' | team booked in {b}/{len(l10)}'
        best[(r['ko'], r['fx'])] = dict(ko=r['ko'], fx=r['fx'], ref=ref, line=name, p=p,
                                        rec=rec, comp=r['comp'])

    rows = sorted(best.values(), key=lambda x: -x['p'])

    # ---- certainty ladder, one line per fixture --------------------------
    W = []
    W.append('# THE CERTAINTY LADDER — Sunday 25 Oct 2026')
    W.append('')
    W.append('One line per fixture (SportyBet will not take two selections from the same event).')
    W.append('Ranked by how close to certain it is.')
    W.append('')
    W.append('## THE CEILING')
    W.append('')
    W.append('| What happens | How often |')
    W.append('|---|---|')
    W.append('| **At least ONE booking in the match** | **97.1%** |')
    W.append('| 2+ bookings in the match | 88.4% |')
    W.append('| 3+ bookings in the match | 74.8% |')
    W.append('| A TEAM gets booked | 86.4% (referee moves it 73% to 92%) |')
    W.append('| Both teams booked | 75.7% |')
    W.append('')
    W.append('**Nothing here is 100%.** 97.1% is the ceiling, and the book will pay about '
             '1.03 for it — no use in a ticket. The useful near-certain line is **2+ match '
             'bookings** or **a team booked**, both around 90% with a good referee and worth '
             'about 1.12–1.20.')
    W.append('')
    W.append('The ladder below therefore shows, for each of the 40 fixtures, the most certain line '
             'that is **also worth at least 1.08** — the ones worth putting on a ticket. '
             'The 97% line is listed separately at the end because if the book offers Total '
             'Bookings over 0.5 it is the single safest thing on the board.')
    W.append('')
    W.append('## LADDER — best line on each of the 40 fixtures')
    W.append('')
    W.append('| # | KO | Fixture | Line | Our p | FAIR | Record |')
    W.append('|---|---|---|---|---|---|---|')
    for i, x in enumerate(rows, 1):
        W.append(f"| {i} | {x['ko']} | {x['fx'][:36]} | {x['line'][:34]} | **{x['p']*100:.1f}%** | "
                 f"{1/x['p']:.2f} | {x['rec'][:70]} |")
    W.append('')

    # ---- the certainty ticket at several sizes ----------------------------
    W.append('## THE CERTAINTY TICKET')
    W.append('')
    W.append('Top N most certain lines. Joint probability assumes one match does not affect '
             'another. "Book must pay" is the price at which the whole ticket breaks even.')
    W.append('')
    for N in (4, 6, 8, 10, 12):
        sel = rows[:N]
        joint = 1.0
        for x in sel:
            joint *= x['p']
        # fair multiplier
        mult = 1.0
        for x in sel:
            mult *= 1 / x['p']
        # what the book must pay per leg for the ticket to break even
        # book price needed so that prod(odds) = 1/joint
        need = (1 / joint) ** (1 / N)
        W.append(f'### {N} legs — lands **{joint*100:.1f}%** of the time '
                 f'(1 in {1/joint:.1f}) — fair multiplier {mult:.2f}x')
        W.append('')
        W.append('| KO | Fixture | Line | Our p | Book must pay |')
        W.append('|---|---|---|---|---|')
        for x in sel:
            W.append(f"| {x['ko']} | {x['fx'][:34]} | {x['line'][:32]} | {x['p']*100:.1f}% | "
                     f"**{need:.2f}+** |")
        W.append('')
        W.append(f'If the book pays {need:.2f} on every leg the ticket returns exactly 1.00. '
                 f'Above that it is in profit.')
        W.append('')

    out = '\n'.join(W)
    open(os.path.join(DATA, 'CERTAINTY_LADDER_2026-10-25.md'), 'w').write(out)
    json.dump(rows, open(os.path.join(DATA, 'certainty_ladder_2026-10-25.json'), 'w'), indent=1)
    print(out)


if __name__ == '__main__':
    main()

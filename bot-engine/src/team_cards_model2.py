#!/usr/bin/env python3
"""
TEAM CARDS — every threshold, both sides, plus the joint for a match
====================================================================
The book offers "individual" card lines: does THIS TEAM get booked N times.
We now have real prices on it (Man Utd 1.15, Bournemouth 1.05), so it needs a
proper model rather than a base rate.

Levels: O0.5 (at least one booking), O1.5 (two or more), O2.5 (three or more).
Both bases are modelled because the book settles bookings, where a red card
counts as two bookings and a second yellow does not count at all.

Walk-forward: a team's own record only ever includes matches already played.
"""
import json, os, math, collections, statistics as st, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
K_TEAM = 8        # pseudo-matches of league average for the team's own record
K_REF = 20        # pseudo-matches of "no referee effect"


def norm(s):
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
        hy, ay = y[0], y[1]
        hr, ar = (r[0], r[1]) if len(r) == 2 else (0, 0)
        ms.append(dict(date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hc=hy, ac=ay, hr=hr, ar=ar,
                       ref=(m.get('referee') or {}).get('name'),
                       comp=m.get('compSlug')))
    ms.sort(key=lambda m: m['date'])
    return ms


def bookings(hy, hr):
    """SportyBet rule: yellow = 1 booking, red = 2 bookings, second yellow ignored."""
    return hy + 2 * hr


def model_team(ms, level, basis='bookings', threshold=0.5):
    """Walk-forward P(team books >= threshold+0.5) from the team's own history."""
    def val(hy, hr):
        return bookings(hy, hr) if basis == 'bookings' else hy

    # league base for the chosen basis
    tot = cnt = 0
    for m in ms:
        for hy, hr in ((m['hc'], m['hr']), (m['ac'], m['ar'])):
            tot += 1
            cnt += (val(hy, hr) > threshold)
    base = cnt / tot

    # per-team history (prior), built incrementally for the walk-forward
    hist = collections.defaultdict(list)
    hits = n = 0
    brier = 0.0
    for m in ms:
        for tm, hy, hr in ((m['home'], m['hc'], m['hr']), (m['away'], m['ac'], m['ar'])):
            h = hist[tm]
            tn = len(h)
            p = (sum(h) + K_TEAM * base) / (tn + K_TEAM) if tn else base
            y = 1 if val(hy, hr) > threshold else 0
            hits += (p > 0.5) == (y == 1)
            brier += (p - y) ** 2
            n += 1
            h.append(y)
    # final per-team rates (full history)
    rates = {}
    for tm, h in hist.items():
        rates[tm] = dict(n=len(h), hits=sum(h), p=(sum(h) + K_TEAM * base) / (len(h) + K_TEAM))
    return dict(base=base, acc=hits / n, brier=brier / n, n=n, rates=rates)


def main():
    ms = load()
    print(f'finished team-matches: {len(ms)*2}')
    for basis in ('bookings', 'yellows'):
        print(f'\n===== basis: {basis} =====')
        for thr in (0.5, 1.5, 2.5):
            m = model_team(ms, thr, basis, thr)
            print(f'  over {thr}: base {m["base"]*100:5.1f}%   walk-forward acc {m["acc"]*100:5.1f}%  '
                  f'Brier {m["brier"]:.4f}  (n={m["n"]})')

    # ---- joint probability that BOTH teams in a match are booked -----------
    print('\n===== JOINT: both teams booked in the same match =====')
    for basis in ('bookings', 'yellows'):
        def val(hy, hr):
            return bookings(hy, hr) if basis == 'bookings' else hy
        for thr in (0.5, 1.5):
            n = both = 0
            for m in ms:
                b = (val(m['hc'], m['hr']) > thr) and (val(m['ac'], m['ar']) > thr)
                both += b
                n += 1
            print(f'  {basis:9s} both teams over {thr}: {both}/{n} = {100*both/n:.1f}%')

    # ---- today's board ----------------------------------------------------
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    res = {}
    for basis in ('bookings', 'yellows'):
        for thr in (0.5, 1.5, 2.5):
            res[(basis, thr)] = model_team(ms, thr, basis, thr)

    print('\n===== TODAY: team cards, both sides, fair price at each level =====')
    print('(book must pay MORE than the fair price to be worth taking)')
    rows = []
    for r in board:
        parts = [x.strip() for x in r['fx'].split(' v ')]
        for tm, side in ((parts[0], 'HOME'), (parts[1], 'AWAY')):
            row = dict(ko=r['ko'], fx=r['fx'], team=tm, side=side, comp=r['comp'], ref=r['ref'])
            for thr in (0.5, 1.5):
                for basis in ('bookings',):
                    mm = res[(basis, thr)]
                    p = mm['rates'].get(tm, {}).get('p', mm['base'])
                    row[f'p{thr}'] = p
                    row[f'fair{thr}'] = 1 / p if p < 1 else 99
                    rt = mm['rates'].get(tm)
                    row[f'rec{thr}'] = f"{rt['hits']}/{rt['n']}" if rt else '—'
            rows.append(row)
    rows.sort(key=lambda x: -x['p0.5'])
    print(f"{'KO':>6s} {'TEAM':26s} {'S':5s} {'P O0.5':>8s} {'FAIR':>6s} {'rec':>7s} | {'P O1.5':>8s} {'FAIR':>6s} {'rec':>7s}")
    for x in rows[:34]:
        print(f"{x['ko']:>6s} {x['team'][:25]:26s} {x['side']:5s} {x['p0.5']*100:7.1f}% {x['fair0.5']:6.2f} {x['rec0.5']:>7s} | "
              f"{x['p1.5']*100:7.1f}% {x['fair1.5']:6.2f} {x['rec1.5']:>7s}")

    json.dump(rows, open(os.path.join(DATA, 'team_cards_board_2026-10-25.json'), 'w'), indent=1)
    print('\nwrote team_cards_board_2026-10-25.json')


if __name__ == '__main__':
    main()

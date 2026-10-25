#!/usr/bin/env python3
"""
TEAM CARDS OVER 0.5 — the market the user found on the book
=============================================================
SportyBet offers "individual over 0.5" on card markets: does this TEAM get at
least one booking?  It is a different market from match-level cards, with a
different correlation structure in an accumulator, and nobody had modelled it.

League base rate from the 2026-27 cache: a team gets at least one booking in
85.1% of its matches.  But that average hides enormous spread — Villarreal and
Wolves are at 100%, Torino is at 37.5%.  So the team matters, and so does the
referee.

Model:
    P(team carded) = f(referee strictness, team record)
fitted by walk-forward on the cache, with the team's own record shrunk toward
the league base and the referee's effect shrunk toward zero by sample size.
"""
import json, os, math, collections, statistics as st, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
MIN_TEAM = 6
MIN_REF = 6
K_TEAM = 8        # pseudo-count of league matches for the team's own record
K_REF = 20        # pseudo-count of "no referee effect" for the referee


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def main():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for mid, m in cache.items():
        y = m.get('yellows') or []
        if len(y) != 2:
            continue
        ms.append(dict(date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hc=y[0], ac=y[1],
                       ref=(m.get('referee') or {}).get('name'),
                       comp=m.get('compSlug')))
    ms.sort(key=lambda m: m['date'])
    print(f'cache team-matches: {len(ms)*2}')

    # ---------- league base rate ------------------------------------------
    tot = cnt = 0
    for m in ms:
        for v in (m['hc'], m['ac']):
            tot += 1
            cnt += (v >= 1)
    base = cnt / tot
    print(f'league base rate: a team gets >=1 booking in {cnt}/{tot} = {100*base:.1f}%')

    # ---------- per-team and per-referee raw rates -------------------------
    tstat = collections.defaultdict(lambda: [0, 0])
    rstat = collections.defaultdict(lambda: [0, 0])
    for m in ms:
        for tm, v in ((m['home'], m['hc']), (m['away'], m['ac'])):
            tstat[tm][0] += 1
            tstat[tm][1] += (v >= 1)
        for v in (m['hc'], m['ac']):
            if m['ref']:
                rstat[m['ref']][0] += 1
                rstat[m['ref']][1] += (v >= 1)

    # ---------- referee effect, shrunk by sample size ----------------------
    # measured as the refereer's rate minus the league base, weighted by n/(n+K)
    ref_eff = {}
    for r, (n, h) in rstat.items():
        raw = h / n
        w = n / (n + K_REF)
        ref_eff[r] = dict(n=n, raw=raw, eff=(raw - base) * w)
    effs = [v['eff'] for v in ref_eff.values()]
    print(f'referee effect: mean {st.mean(effs)*100:+.2f} pts, '
          f'range {min(effs)*100:+.1f} to {max(effs)*100:+.1f} pts')

    # ---------- walk-forward validation -----------------------------------
    # prior team record only
    prior_team = collections.defaultdict(list)
    hits = n = 0
    brier = 0.0
    for m in ms:
        for tm, v in ((m['home'], m['hc']), (m['away'], m['ac'])):
            hist = prior_team[tm]
            tn = len(hist)
            team_rate = (sum(hist) + K_TEAM * base) / (tn + K_TEAM) if tn else base
            reff = ref_eff.get(m['ref'], {}).get('eff', 0.0)
            p = max(0.02, min(0.98, team_rate + reff))
            hits += (p > 0.5) == (v >= 1)
            brier += (p - (1 if v >= 1 else 0)) ** 2
            n += 1
            hist.append(1 if v >= 1 else 0)
    print(f'\nwalk-forward on {n} team-matches: accuracy {100*hits/n:.1f}%  '
          f'Brier {brier/n:.4f}  (base-rate model Brier '
          f'{st.mean([(base-(1 if v>=1 else 0))**2 for m in ms for v in (m["hc"],m["ac"])]):.4f})')

    # ---------- today's board ----------------------------------------------
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refman = {r['name']: r for r in man['referees']}

    def team_rate(t):
        n, h = tstat.get(t, (0, 0))
        if n == 0:
            return base, 0, 0
        return (h + K_TEAM * base) / (n + K_TEAM), h, n

    rows = []
    for r in board:
        fx = r['fx']
        parts = [x.strip() for x in fx.split(' v ')]
        home, away = parts[0], parts[1]
        ref = r['ref']
        reff = ref_eff.get(ref, {}).get('eff', 0.0)
        rn = ref_eff.get(ref, {}).get('n', 0)
        for tm, side in ((home, 'HOME'), (away, 'AWAY')):
            tr, h, n_ = team_rate(tm)
            p = max(0.02, min(0.98, tr + reff))
            rows.append(dict(ko=r['ko'], fx=fx, team=tm, side=side, ref=ref,
                             ref_n=rn, p=p, raw=(h / n_ if n_ else None), n=n_,
                             hits=h, driver=r['src'],
                             comp=r['comp']))

    rows.sort(key=lambda r: -r['p'])
    print('\n=== TEAM CARDS OVER 0.5 — SUNDAY 25 OCT ===')
    print(f"{'KO':>6s} {'TEAM':26s} {'SIDE':5s} {'P(>=1)':>8s} {'raw':>8s} {'n':>4s} {'ref':22s} {'refn':>5s}")
    for r in rows:
        raw = f"{r['raw']*100:.0f}%" if r['raw'] is not None else '—'
        print(f"{r['ko']:>6s} {r['team'][:25]:26s} {r['side']:5s} {r['p']*100:7.1f}% "
              f"{raw:>8s} {r['n']:4d} {(r['ref'] or '—')[:21]:22s} {r['ref_n']:5d}")

    json.dump(rows, open(os.path.join(DATA, 'team_cards_o05_2026-10-25.json'), 'w'), indent=1)
    print('\nwrote team_cards_o05_2026-10-25.json')


if __name__ == '__main__':
    main()

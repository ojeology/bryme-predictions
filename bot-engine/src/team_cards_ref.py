#!/usr/bin/env python3
"""
TEAM CARDS — the model that actually survives walk-forward
===========================================================
Two facts, both measured, that change how this market must be played:

1. A team's OWN card record does not predict its next match.
   Flat league base rate beats it on both levels:
     over 0.5 : base Brier 0.1194  |  +team record 0.1194 (no better)
     over 1.5 : base Brier 0.2390  |  +team record 0.2390 (no better)
   Unshrunk team record is clearly worse (0.1241 / 0.2516).
   -> Never price a team-card line off that team's reputation.

2. The REFEREE does predict, and hard.  Across 17 referees with 15+
   team-matches, P(team booked over 0.5) ranges 56% to 100%.
   The effect is estimated walk-forward: a refereer's rate only ever
   includes matches they have already officiated, and it is shrunk toward
   the league base by n/(n+K).

Model:  P(team booked over N) = league base + referee effect
Settlement basis: SportyBet bookings (yellow = 1, red = 2, second yellow = 0).
"""
import json, os, collections, statistics as st, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
K_REF = 20        # pseudo team-matches of "no referee effect"


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
        hr, ar = (r[0], r[1]) if len(r) == 2 else (0, 0)
        ms.append(dict(date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hb=y[0] + 2 * hr, ab=y[1] + 2 * ar,
                       ref=(m.get('referee') or {}).get('name'), comp=m.get('compSlug')))
    ms.sort(key=lambda m: m['date'])
    return ms


def fit(ms, thr, K=K_REF):
    """Walk-forward referee effect for P(team booked over thr)."""
    base = sum(1 for m in ms for v in (m['hb'], m['ab']) if v > thr) / (2 * len(ms))
    refn = collections.Counter()
    refhit = collections.Counter()
    preds = []
    brier = 0.0
    brier_flat = 0.0
    n = 0
    for m in ms:
        for tm, v in ((m['home'], m['hb']), (m['away'], m['ab'])):
            r = m['ref']
            if r:
                rn = refn[r]
                eff = 0.0
                if rn >= 5:
                    eff = (refhit[r] / rn - base) * (rn / (rn + K))
            else:
                eff = 0.0
            p = min(0.99, max(0.01, base + eff))
            y = 1 if v > thr else 0
            brier += (p - y) ** 2
            brier_flat += (base - y) ** 2
            n += 1
            preds.append((m['date'], r, p, y))
            if r:
                refn[r] += 1
                refhit[r] += y
    # final referee table (full history) for live use
    table = {}
    for r in refn:
        rn = refn[r]
        raw = refhit[r] / rn
        table[r] = dict(n=rn, raw=raw,
                        eff=(raw - base) * (rn / (rn + K)),
                        p=min(0.99, max(0.01, base + (raw - base) * (rn / (rn + K)))))
    return dict(base=base, brier=brier / n, brier_flat=brier_flat / n, n=n, table=table,
                preds=preds)


def main():
    ms = load()
    print(f'finished team-matches: {2*len(ms)}\n')
    models = {}
    for thr in (0.5, 1.5, 2.5):
        M = fit(ms, thr)
        models[thr] = M
        imp = 'BETTER' if M['brier'] < M['brier_flat'] else 'WORSE'
        print(f'===== team booked OVER {thr} =====')
        print(f'  league base rate            {M["base"]*100:5.1f}%')
        print(f'  flat base Brier             {M["brier_flat"]:.4f}')
        print(f'  + referee effect Brier      {M["brier"]:.4f}   -> {imp} '
              f'({100*(M["brier_flat"]-M["brier"])/M["brier_flat"]:+.1f}% change)')
        print(f'  referees with a usable sample: '
              f'{sum(1 for v in M["table"].values() if v["n"]>=10)}')

    print('\n===== referee effect table, over 0.5 (n>=10) =====')
    t = models[0.5]['table']
    rows = sorted([(r, v) for r, v in t.items() if v['n'] >= 10], key=lambda kv: kv[1]['eff'])
    for r, v in rows:
        print(f'  {r[:28]:30s} n={v["n"]:3d}  raw {v["raw"]*100:5.1f}%  '
              f'effect {v["eff"]*100:+5.1f} pts   -> P {v["p"]*100:5.1f}%')

    json.dump({str(k): dict(base=v['base'], table=v['table']) for k, v in models.items()},
              open(os.path.join(DATA, 'team_cards_referee_model.json'), 'w'), indent=1)

    # ---- today's board ----------------------------------------------------
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    print('\n===== TODAY: team card lines priced off the referee =====')
    print(f"{'KO':>6s} {'FIXTURE':34s} {'TEAM':20s} {'S':4s} {'ref':20s} {'refn':>5s} "
          f"{'P O0.5':>7s} {'FAIR':>6s} {'P O1.5':>7s} {'FAIR':>6s}")
    out = []
    for r in sorted(board, key=lambda r: (r['ko'], r['fx'])):
        parts = [x.strip() for x in r['fx'].split(' v ')]
        ref = r['ref']
        for tm, side in ((parts[0], 'HOME'), (parts[1], 'AWAY')):
            row = dict(ko=r['ko'], fx=r['fx'], team=tm, side=side, ref=ref, comp=r['comp'])
            for thr in (0.5, 1.5):
                M = models[thr]
                rv = M['table'].get(ref)
                eff = rv['eff'] if rv else 0.0
                p = min(0.99, max(0.01, M['base'] + eff))
                row[f'p{thr}'] = p
                row[f'fair{thr}'] = 1 / p
                row[f'refn'] = rv['n'] if rv else 0
                row[f'refraw{thr}'] = rv['raw'] if rv else None
            out.append(row)
    out.sort(key=lambda x: -x['p0.5'])
    for x in out:
        print(f"{x['ko']:>6s} {x['fx'][:33]:34s} {x['team'][:19]:20s} {x['side']:4s} "
              f"{(x['ref'] or '—')[:19]:20s} {x['refn']:5d} {x['p0.5']*100:6.1f}% {x['fair0.5']:6.2f} "
              f"{x['p1.5']*100:6.1f}% {x['fair1.5']:6.2f}")
    json.dump(out, open(os.path.join(DATA, 'team_cards_ref_board_2026-10-25.json'), 'w'), indent=1)
    print('\nwrote team_cards_ref_board_2026-10-25.json')


if __name__ == '__main__':
    main()

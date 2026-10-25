#!/usr/bin/env python3
"""
GLOBAL LOCK BACK-TEST — are the vault's rule-based locks real, or luck?

The vault has two kinds of "100% lock":

  1. PER-CLUB locks — "Brighton went over 9.5 team fouls in 8 of 8 games".
     These are MINED: 48 market checks were tested per club and every 8/8
     streak was kept.  With 48 checks and 8 games, the chance of at least one
     perfect 8/8 record by pure luck is 17.1% per club, and 18 clubs are
     tested, so ~3 "perfect" clubs are expected from luck alone.  We recorded
     107 perfect locks — far more than luck explains, but only because many
     locks on the same club are the same underlying behaviour counted many
     times (BRAGA 19 locks, ZVEZDA 20 locks, all on 8 games).

  2. GLOBAL locks — a PRE-SPECIFIED condition with a fixed rule, e.g.
        "High-Foul Non-Favourite (Away OR Odds > 1.85) AND pre-fouls >= 12.2/g
         -> Team Fouls Over 10.5"        11/12 = 91.7%
     These are not mined from a market list, so they are the ones worth
     trusting and the ones that can be applied to a fixture we have never seen.

This script walks forward through the 18 clubs' own match logs, rebuilding the
prior team foul rate from PREVIOUS games only, applying the GLOBAL_LOCK_04
condition, and scoring the outcome.  Zero future leakage.
"""
import csv, glob, os, math, json, collections

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
PRIOR_FOUL_FLOOR = 12.2      # the vault's threshold
LINE = 10.5                   # the vault's line


def load():
    files = [f for f in sorted(glob.glob(os.path.join(DATA, '*_matches.csv')))
             if 'master_top5' not in f and 'fresh_2000' not in f]
    rows = []
    for f in files:
        club = os.path.basename(f).replace('_matches.csv', '').upper()
        pre = 'city_' if 'city_fouls' in open(f).readline() else 'bou_'
        for r in csv.DictReader(open(f)):
            try:
                r['tf'] = int(float(r[pre + 'fouls']))
                r['of'] = int(float(r['opp_fouls']))
            except Exception:
                continue
            r['club'] = club
            r['venue'] = (r.get('venue') or '').lower()
            r['date'] = r.get('date') or ''
            rows.append(r)
    rows.sort(key=lambda r: r['date'])
    return rows


def walk_forward(rows, min_prior_games=1):
    """For each match, the team's foul rate over its PREVIOUS games only."""
    hist = collections.defaultdict(list)      # club -> [fouls per game so far]
    out = []
    for r in rows:
        club = r['club']
        prev = hist[club]
        if len(prev) >= min_prior_games:
            rate = sum(prev) / len(prev)
            out.append(dict(date=r['date'], club=club, venue=r['venue'],
                            rate=rate, n=len(prev),
                            team_fouls=r['tf'], opp_fouls=r['of'],
                            opp=r.get('opponent') or ''))
        prev.append(r['tf'])
    return out


def main():
    rows = load()
    print(f'club match logs: {len(rows)} matches, '
          f'{rows[0]["date"]} -> {rows[-1]["date"]}')

    wf = walk_forward(rows)
    print(f'walk-forward rows with a prior: {len(wf)}\n')

    # ---- GLOBAL_LOCK_04 as stated: (Away OR Odds>1.85) AND rate>=12.2
    # We have no match odds in these logs, so we score the "Away" arm exactly
    # and the "high rate" arm for everybody, so the reader can see both.
    arms = {'AWAY only (exact rule arm)': [], 'rate>=12.2, any venue': []}
    for r in wf:
        if r['rate'] < PRIOR_FOUL_FLOOR:
            continue
        hit = r['team_fouls'] > LINE
        arms['rate>=12.2, any venue'].append((r, hit))
        if r['venue'] == 'away':
            arms['AWAY only (exact rule arm)'].append((r, hit))

    print('=== GLOBAL_LOCK_04  (Team Fouls Over 10.5) ===')
    print(f'    rule: (Away OR Odds>1.85) AND pre-fouls >= {PRIOR_FOUL_FLOOR}/g')
    print(f'    vault claims 11/12 = 91.7%\n')
    for name, lst in arms.items():
        if not lst:
            continue
        hits = sum(1 for _, h in lst if h)
        n = len(lst)
        rate = hits / n
        # binomial 95% CI
        lo = max(0.0, rate - 1.96 * math.sqrt(rate * (1 - rate) / n))
        print(f'  {name}')
        print(f'    n={n:3d}  hits={hits:3d}  rate={rate*100:5.1f}%  '
              f'95% CI {lo*100:.0f}%-{min(100, rate*100 + 1.96*math.sqrt(rate*(1-rate)/n)*100):.0f}%')
        print(f'    miss rate (what the book prices) = {(1-rate)*100:.1f}%  -> '
              f'break-even price {1/(1-rate):.3f}')
        for r, h in lst:
            mark = 'HIT ' if h else 'MISS'
            print(f'      {mark} {r["date"]} {r["club"]:12s} v {r["opp"][:18]:20s} '
                  f'prior {r["rate"]:5.1f}/g (n={r["n"]:2d}) team fouls {r["team_fouls"]:2d}')
        print()

    # ---- the same filter but walk-forward with a MINIMUM PRIOR SAMPLE
    print('=== same rule, but requiring a deeper prior (>=5 previous games) ===')
    wf5 = [r for r in walk_forward(rows, min_prior_games=5)]
    lst = [r for r in wf5 if r['rate'] >= PRIOR_FOUL_FLOOR and r['venue'] == 'away']
    if lst:
        hits = sum(1 for r in lst if r['team_fouls'] > LINE)
        print(f'  n={len(lst)} hits={hits} rate={hits/len(lst)*100:.1f}%')
        print(f'  break-even price {len(lst)/hits if hits else float("inf"):.3f}')
    print()

    # ---- what the rule is worth if we had bet it
    print('=== value of the rule, if the book quoted at its break-even ===')
    for name, lst in arms.items():
        if not lst:
            continue
        hits = sum(1 for _, h in lst if h)
        n = len(lst)
        print(f'  {name}: {hits}/{n} = {hits/n*100:.1f}%  ->  '
              f'you need the book to pay above {n/hits:.3f} to profit')


if __name__ == '__main__':
    main()

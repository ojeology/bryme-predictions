#!/usr/bin/env python3
"""Harvest player-level behaviour stats (fouls, tackles, shots, duels) + confirmed lineups
from FotMob matchDetails for the clubs involved in a given fixture list.

Walks strictly BACKWARDS in time (cache is ordered by date) and never leaks future data.
"""
import json, os, sys, time, urllib.request, collections

CACHE = 'bot-engine/data/fotmob_2627_exact_api_cache.json'
OUT = 'bot-engine/data/player_behaviour_cache.json'
HDR = {'User-Agent': 'Mozilla/5.0'}


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HDR)
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read().decode())
        except Exception:
            time.sleep(1.2 * (i + 1))
    return None


def pull(mid):
    d = get(f'https://www.fotmob.com/api/data/matchDetails?matchId={mid}')
    if not d:
        return None
    c = d.get('content') or {}
    ps = c.get('playerStats') or {}
    lu = c.get('lineup') or {}
    starters = set()
    subs = set()
    for side in ('homeTeam', 'awayTeam'):
        t = lu.get(side) or {}
        for p in (t.get('starters') or []):
            starters.add(p.get('id'))
        for p in (t.get('subs') or []):
            subs.add(p.get('id'))
    out = {}
    for pid, p in ps.items():
        rec = {'name': p.get('name'), 'teamId': p.get('teamId'), 'gk': p.get('isGoalkeeper')}
        for grp in p.get('stats') or []:
            for nm, obj in (grp.get('stats') or {}).items():
                st = (obj or {}).get('stat') or {}
                v = st.get('value')
                if v is None:
                    continue
                rec[nm] = v
        out[str(pid)] = rec
    return {'players': out, 'starters': sorted(x for x in starters if x),
            'subs': sorted(x for x in subs if x)}


def main():
    with open(CACHE) as f:
        cache = json.load(f)
    out_path = OUT
    data = {}
    if os.path.exists(out_path):
        with open(out_path) as f:
            data = json.load(f)

    # club -> list of (date, matchId) from its own fixtures
    club_games = collections.defaultdict(list)
    for mid, m in cache.items():
        d = (m.get('utcTime') or '')[:10]
        if not d:
            continue
        for side in ('homeName', 'awayName'):
            nm = m.get(side)
            if nm:
                club_games[nm].append((d, mid))

    wanted_clubs = set(sys.argv[1].split(',')) if len(sys.argv) > 1 else None
    targets = []
    for club, games in club_games.items():
        if wanted_clubs and club not in wanted_clubs:
            continue
        for d, mid in games:
            if mid not in data:
                targets.append((d, mid, club))
    targets.sort()
    print(f'{len(targets)} matches to pull', flush=True)
    for i, (d, mid, club) in enumerate(targets):
        r = pull(mid)
        if r:
            r['date'] = d
            data[mid] = r
        if (i + 1) % 20 == 0:
            with open(out_path, 'w') as f:
                json.dump(data, f)
            print(f'  {i+1}/{len(targets)}', flush=True)
    with open(out_path, 'w') as f:
        json.dump(data, f)
    print(f'DONE: {len(data)} matches with player stats -> {out_path}')


if __name__ == '__main__':
    main()

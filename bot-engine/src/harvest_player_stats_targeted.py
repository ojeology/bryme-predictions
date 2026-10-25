#!/usr/bin/env python3
"""Targeted player-behaviour harvest for the weekend Top-5 fixtures (recent matches first),
so the most relevant player form is available immediately.
"""
import json, os, sys, time, urllib.request

CACHE = 'bot-engine/data/fotmob_2627_exact_api_cache.json'
OUT = 'bot-engine/data/player_behaviour_targeted.json'
HDR = {'User-Agent': 'Mozilla/5.0'}

CLUBS = [
    'Chelsea', 'Tottenham Hotspur', 'Racing Santander', 'Espanyol', 'Aston Villa', 'Manchester City',
    'RB Leipzig', 'Elversberg', 'Paderborn', 'Hamburger SV', 'Como', 'Sassuolo', 'Lens', 'Paris FC',
    'Valencia', 'Villarreal', 'Napoli', 'Roma', 'Hoffenheim', 'Bayer Leverkusen', 'Toulouse', 'Troyes',
    'Borussia Dortmund', 'Eintracht Frankfurt', 'Mainz 05', 'Werder Bremen', '1. FC Köln', 'Schalke 04',
    'Freiburg', 'Bayern München', 'Atalanta', 'Frosinone', 'Liverpool', 'Brighton & Hove Albion',
    'Sunderland', 'Leeds United', 'Udinese', 'Milan',
]


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HDR)
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read().decode())
        except Exception:
            time.sleep(1.0 * (i + 1))
    return None


def pull(mid):
    d = get(f'https://www.fotmob.com/api/data/matchDetails?matchId={mid}')
    if not d:
        return None
    c = d.get('content') or {}
    ps = c.get('playerStats') or {}
    lu = c.get('lineup') or {}
    starters, subs = set(), set()
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
                if st.get('value') is not None:
                    rec[nm] = st.get('value')
        out[str(pid)] = rec
    return {'players': out, 'starters': sorted(x for x in starters if x),
            'subs': sorted(x for x in subs if x)}


def main():
    with open(CACHE) as f:
        cache = json.load(f)
    data = {}
    if os.path.exists(OUT):
        with open(OUT) as f:
            data = json.load(f)
    targets = []
    for mid, m in cache.items():
        if m.get('homeName') in CLUBS or m.get('awayName') in CLUBS:
            targets.append(((m.get('utcTime') or '')[:10], mid))
    targets.sort(reverse=True)          # most recent first
    todo = [t for t in targets if t[1] not in data]
    print(f'{len(todo)} targeted matches to pull (most recent first)', flush=True)
    for i, (d, mid) in enumerate(todo):
        r = pull(mid)
        if r:
            r['date'] = d
            data[mid] = r
        if (i + 1) % 25 == 0:
            with open(OUT, 'w') as f:
                json.dump(data, f)
            print(f'  {i+1}/{len(todo)}', flush=True)
    with open(OUT, 'w') as f:
        json.dump(data, f)
    print(f'DONE: {len(data)} matches -> {OUT}')


if __name__ == '__main__':
    main()

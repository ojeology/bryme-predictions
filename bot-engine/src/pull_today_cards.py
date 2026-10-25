import json, urllib.request, time

with open('bot-engine/data/fotmob_2627_exact_api_cache.json') as f:
    cache = json.load(f)


def get(mid):
    req = urllib.request.Request(
        f"https://www.fotmob.com/api/data/matchDetails?matchId={mid}",
        headers={"User-Agent": "Mozilla/5.0"})
    return json.loads(urllib.request.urlopen(req, timeout=20).read().decode())


def stat(periods, key):
    """Pull a 2-element [home, away] stat out of content.stats.Periods."""
    for grp in ((periods.get('All') or {}).get('stats') or []):
        for s in (grp.get('stats') or []):
            if s.get('key') == key:
                return s.get('stats')
    return None


def card_tot(periods, key):
    v = stat(periods, key)
    if not v:
        return None
    try:
        return int(v[0]) + int(v[1])
    except (TypeError, ValueError):
        return None


today = []
for mid, m in cache.items():
    d = (m.get('utcTime') or '')[:10]
    ko = (m.get('utcTime') or '')[11:16]
    if d == '2026-10-23' and ko >= '16:00':
        today.append((ko, m.get('compName'), m.get('homeName'), m.get('awayName'), mid))
today.sort()

out = {}
for ko, comp, hn, an, mid in today:
    try:
        d = get(mid)
        content = d.get('content') or {}
        periods = ((content.get('stats') or {}).get('Periods') or {})
        header = d.get('header') or {}
        status = header.get('status') or {}
        teams = header.get('teams') or []
        score = f"{teams[0].get('score')}-{teams[1].get('score')}" if len(teams) > 1 else '?'
        refbox = ((content.get('matchFacts') or {}).get('infoBox') or {})
        refobj = refbox.get('Referee') or {}
        refstats = {}
        for s in (refobj.get('stats') or []):
            refstats[s.get('type')] = s
        halves = status.get('halfs') or {}
        if halves.get('secondHalfEnded'):
            state = 'FT'
        elif halves.get('secondHalfStarted'):
            state = '2H'
        elif halves.get('firstHalfStarted'):
            state = '1H'
        else:
            state = 'not started'
        cy = stat(periods, 'yellow_cards')
        out[mid] = dict(
            ko=ko, comp=comp, home=hn, away=an, score=score, state=state,
            ref=refobj.get('text'),
            ref_games=(refstats.get('matches') or {}).get('value'),
            ref_yellows=(refstats.get('yellowCards') or {}).get('value'),
            ref_yellows_avg=(refstats.get('yellowCards') or {}).get('average'),
            Y_all=card_tot(periods, 'yellow_cards'),
            Y_1H=card_tot((content.get('stats') or {}).get('Periods') or {}, 'yellow_cards'),
            hY=(cy or [None, None])[0], aY=(cy or [None, None])[1],
            C_all=card_tot(periods, 'corners'),
            F_all=card_tot(periods, 'fouls'),
            S_all=card_tot(periods, 'total_shots'))
        o = out[mid]
        print(f"{ko}Z {comp:20s} {hn:20s} v {an:20s} | {score:5s} {state:11s} | Y {o['Y_all']} (1H {o['Y_1H']}) "
              f"h{o['hY']}/a{o['aY']} | C {o['C_all']} F {o['F_all']} S {o['S_all']} | ref {o['ref']} "
              f"({o['ref_yellows']}Y/g over {o['ref_games']}g)")
    except Exception as e:
        print(f"{ko}Z {hn} v {an} -> ERR {e}")
    time.sleep(0.1)

json.dump(out, open('/tmp/today_live.json', 'w'), indent=1)
print(f"\npulled {len(out)}/{len(today)}")

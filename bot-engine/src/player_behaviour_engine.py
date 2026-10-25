#!/usr/bin/env python3
"""Player-level behaviour consistency engine.

Walks strictly FORWARD in time. For every player of every club involved in the
weekend fixtures, computes out-of-sample (walk-forward) rates for:
  - Fouls committed  >= 1 / >= 2   -> "Player X to commit a foul"  (Over/Under 0.5 / 1.5)
  - Tackles         >= 1 / >= 2   -> "Player X to make a tackle"
  - Total shots     >= 1 / >= 2   -> "Player X to have a shot"
Only games BEFORE the fixture are used -> zero future leakage.
"""
import json, collections, os

CACHE = 'bot-engine/data/fotmob_2627_exact_api_cache.json'
PB = 'bot-engine/data/player_behaviour_targeted.json'
OUT = 'bot-engine/data/player_props_2026-10-24.json'

FIXTURES = [
    ('2026-10-24', '12:30', 'Aston Villa', 'Manchester City', 'Premier League'),
    ('2026-10-24', '14:00', 'Como', 'Sassuolo', 'Serie A'),
    ('2026-10-24', '14:30', 'RB Leipzig', 'Elversberg', 'Bundesliga'),
    ('2026-10-24', '14:30', 'Paderborn', 'Hamburger SV', 'Bundesliga'),
    ('2026-10-24', '14:30', 'Mainz 05', 'Werder Bremen', 'Bundesliga'),
    ('2026-10-24', '14:30', '1. FC Köln', 'Schalke 04', 'Bundesliga'),
    ('2026-10-24', '15:15', 'Racing Santander', 'Espanyol', 'La Liga'),
    ('2026-10-24', '15:30', 'Arsenal', 'Everton', 'Premier League'),
    ('2026-10-24', '17:30', 'Chelsea', 'Tottenham Hotspur', 'Premier League'),
    ('2026-10-24', '17:30', 'Valencia', 'Villarreal', 'La Liga'),
    ('2026-10-24', '17:30', 'Borussia Dortmund', 'Eintracht Frankfurt', 'Bundesliga'),
    ('2026-10-24', '19:45', 'Lens', 'Paris FC', 'Ligue 1'),
    ('2026-10-24', '19:45', 'Napoli', 'Roma', 'Serie A'),
    ('2026-10-25', '15:00', 'Liverpool', 'Brighton & Hove Albion', 'Premier League'),
    ('2026-10-25', '15:30', 'Hoffenheim', 'Bayer Leverkusen', 'Bundesliga'),
    ('2026-10-25', '17:15', 'Toulouse', 'Troyes', 'Ligue 1'),
    ('2026-10-25', '15:00', 'Atalanta', 'Frosinone', 'Serie A'),
]


def load(p):
    with open(p) as f:
        return json.load(f)


def main():
    cache = load(CACHE)
    pb = load(PB)
    # player appearances: list of (date, teamId, stats-dict, started?)
    app = collections.defaultdict(list)
    meta = {}
    for mid, rec in pb.items():
        date = rec.get('date')
        starters = set(rec.get('starters') or [])
        for pid, p in (rec.get('players') or {}).items():
            key = (p.get('name'), p.get('teamId'))
            meta.setdefault(key, {'pos': None, 'gk': p.get('gk'), 'name': p.get('name')})
            mins = p.get('Minutes played') or 0
            if not mins:
                continue
            app[key].append({
                'date': date, 'mid': mid,
                'fouls': p.get('Fouls committed') or 0,
                'tackles': p.get('Tackles') or 0,
                'shots': p.get('Total shots') or 0,
                'mins': mins,
                'started': str(pid) in {str(x) for x in starters},
                'was_fouled': p.get('Was fouled') or 0,
                'duels': p.get('Duels won') or 0,
            })
    # team-name -> teamId map from cache
    name2id = {}
    for mid, m in cache.items():
        for side in ('home', 'away'):
            nm = m.get(f'{side}Name')
            if nm:
                name2id.setdefault(nm, int(m.get(f'{side}Id')))

    out = []
    for date, ko, hn, an, lg in FIXTURES:
        hid, aid = name2id.get(hn), name2id.get(an)
        for side, nm, tid in (('H', hn, hid), ('A', an, aid)):
            cands = []
            for (pname, ptid), games in app.items():
                if ptid != tid:
                    continue
                # strictly prior to fixture date
                g = [x for x in games if (x['date'] or '') < date]
                if len(g) < 4:
                    continue
                n = len(g)
                starts = sum(1 for x in g if x['started'])
                rec = {
                    'fixture': f'{hn} vs {an}', 'date': date, 'ko': ko, 'league': lg,
                    'side': side, 'club': nm, 'player': pname, 'teamId': ptid,
                    'apps': n, 'starts': starts, 'start_rate': round(100 * starts / n),
                    'avg_mins': round(sum(x['mins'] for x in g) / n),
                    'fouls_ge1': round(100 * sum(1 for x in g if x['fouls'] >= 1) / n, 1),
                    'fouls_ge2': round(100 * sum(1 for x in g if x['fouls'] >= 2) / n, 1),
                    'fouls_avg': round(sum(x['fouls'] for x in g) / n, 2),
                    'fouls_max': max(x['fouls'] for x in g),
                    'tackles_ge1': round(100 * sum(1 for x in g if x['tackles'] >= 1) / n, 1),
                    'tackles_ge2': round(100 * sum(1 for x in g if x['tackles'] >= 2) / n, 1),
                    'tackles_avg': round(sum(x['tackles'] for x in g) / n, 2),
                    'shots_ge1': round(100 * sum(1 for x in g if x['shots'] >= 1) / n, 1),
                    'shots_ge2': round(100 * sum(1 for x in g if x['shots'] >= 2) / n, 1),
                    'shots_avg': round(sum(x['shots'] for x in g) / n, 2),
                    'last5_fouls': [x['fouls'] for x in sorted(g, key=lambda z: z['date'])[-5:]],
                    'last5_tackles': [x['tackles'] for x in sorted(g, key=lambda z: z['date'])[-5:]],
                    'last5_shots': [x['shots'] for x in sorted(g, key=lambda z: z['date'])[-5:]],
                }
                cands.append(rec)
            cands.sort(key=lambda r: (-r['fouls_ge1'], -r['apps']))
            out.append({'fixture': f'{hn} vs {an}', 'date': date, 'ko': ko, 'league': lg,
                        'side': side, 'club': nm, 'players': cands})
    with open(OUT, 'w') as f:
        json.dump(out, f, indent=1)
    print(f'wrote {OUT}  ({sum(len(b["players"]) for b in out)} player records across {len(out)} club-sides)')
    # headline: must-happen foulers
    for title, key, lab in (('FOULS','fouls_ge1','foul'),('TACKLES','tackles_ge1','tackle'),('SHOTS','shots_ge1','shot')):
        print(f'\n=== MUST-HAPPEN {title}  (>=90% of appearances, >=5 apps, start rate >=50%) ===')
        for b in out:
            hits=[p for p in b['players'] if p[key]>=90 and p['apps']>=5 and p['start_rate']>=50]
            if not hits: continue
            print(f"{b['date']} {b['ko']} {b['league']:14s} {b['club']}")
            for p in hits:
                print(f"   {p['player']:26s} apps {p['apps']:2d} starts {p['starts']:2d} ({p['start_rate']:3d}%) | "
                      f"{lab}>=1 {p[key]:5.1f}%  {lab}>=2 {p[key.replace('_ge1','_ge2')]:5.1f}%  avg {p[key.replace('_ge1','_avg')]:.2f} | "
                      f"last5 {p['last5_'+lab+'s']} | mins {p['avg_mins']}")


if __name__ == '__main__':
    main()

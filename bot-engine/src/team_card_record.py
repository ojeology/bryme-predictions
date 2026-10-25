#!/usr/bin/env python3
"""
DID THESE TEAMS GO OVER 1.5 CARDS IN EVERY MATCH?
==================================================
The O1.5 line is the buffer: it wins when the MATCH has 2+ cards.  The model
says the referee makes that ~85-87% likely.  But the real question is what the
TEAMS have actually been doing, match by match.

For every Sunday fixture this prints each team's recent matches with:
    their own card count, and the MATCH card total (that is what O1.5 trades on)
and then answers the question directly: has this team been in a match that
finished on 0 or 1 cards, and how recently?
"""
import json, os, collections, statistics as st, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
N_MATCH = 12


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def load():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    matches = []
    for mid, m in cache.items():
        y = m.get('yellows') or []
        if len(y) != 2:
            continue
        rd = m.get('reds') or []
        rv = (rd[0] + rd[1]) if len(rd) == 2 else 0
        matches.append(dict(mid=mid, date=(m.get('utcTime') or '')[:10],
                            home=m.get('homeName'), away=m.get('awayName'),
                            hc=y[0], ac=y[1], mc=y[0] + y[1], rc=rv,
                            ref=(m.get('referee') or {}).get('name'),
                            comp=m.get('compName')))
    matches.sort(key=lambda m: m['date'])
    return matches


def team_matches(matches, team, upto=None):
    out = []
    for m in matches:
        if upto and m['date'] >= upto:
            continue
        if m['home'] == team:
            out.append((m, 'H'))
        elif m['away'] == team:
            out.append((m, 'A'))
    return out


def main():
    matches = load()
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    picks = json.load(open(os.path.join(DATA, 'best_picks_2026-10-25.json')))

    # the picks we are recommending (referee-driven, cards)
    rec = {}
    for p in picks:
        if p['date'] != '2026-10-25' or p.get('driver') != 'REF':
            continue
        if p['market'] != 'Cards':
            continue
        k = (p['home'], p['away'])
        if k not in rec or (p.get('prob') or 0) > (rec[k].get('prob') or 0):
            rec[k] = p

    # only the fixtures whose teams we actually know from the cache
    names = set()
    for m in matches:
        names.add(m['home'])
        names.add(m['away'])

    def resolve(t):
        if t in names:
            return t
        for n in names:
            if norm(t) == norm(n):
                return n
        # token overlap
        tt = set(re.findall(r'[a-z0-9]+', t.lower()))
        for n in names:
            nt = set(re.findall(r'[a-z0-9]+', n.lower()))
            if tt & nt and min(len(tt), len(nt)) <= 2:
                return n
        return None

    print('=' * 96)
    print('HAS EACH TEAM BEEN IN A MATCH THAT FINISHED ON 0 OR 1 CARDS?')
    print('The O1.5 line we play wins when the MATCH has 2+ cards.')
    print('=' * 96)

    summary = []
    for (home, away), p in sorted(rec.items(), key=lambda kv: -(kv[1].get('prob') or 0)):
        hr, ar = resolve(home), resolve(away)
        if not hr or not ar:
            print(f'\n### {home} v {away}   [teams not in the cache — no history]')
            continue
        hm = team_matches(matches, hr)[-N_MATCH:]
        am = team_matches(matches, ar)[-N_MATCH:]
        print(f'\n### {home} v {away}   —   PLAY Cards {p["line"]}  '
              f'(model {(p.get("prob") or 0)*100:.1f}%)   ref {p.get("referee")} '
              f'({p.get("ref_games")}g)')
        for label, tm in ((hr, hm), (ar, am)):
            if not tm:
                print(f'   {label}: no matches in the cache')
                continue
            fails = [(m, v) for m, v in tm if m['mc'] <= 1]
            print(f'   {label}  (last {len(tm)} matches)')
            for m, v in reversed(tm):
                tag = '  <-- MATCH UNDER 2 CARDS' if m['mc'] <= 1 else ''
                own = m['hc'] if v == 'H' else m['ac']
                print(f'      {m["date"]}  {"H" if v=="H" else "A"} v '
                      f'{(m["away"] if v=="H" else m["home"])[:22]:24s} '
                      f'match {m["mc"]:2d} cards   {label[:16]:18s} {own:2d}   '
                      f'{(m["ref"] or "")[:18]:20s}{tag}')
            last_fail = fails[-1][0]['date'] if fails else 'NEVER'
            nfail = len(fails)
            print(f'      -> {len(tm)-nfail}/{len(tm)} matches over 1.5 cards'
                  f'   |  last failure: {last_fail}')
            summary.append((f'{home} v {away}', label, len(tm), nfail, last_fail,
                            m['mc'] if False else 0))
    print('\n' + '=' * 96)
    print('SUMMARY — teams with a CLEAN O1.5 record (no match under 2 cards)')
    print('=' * 96)
    clean = [s for s in summary if s[3] == 0]
    dirty = [s for s in summary if s[3] > 0]
    print(f'\nCLEAN ({len(clean)} team-entries):')
    for fx, t, n, nf, lf, _ in clean:
        print(f'   {fx:42s} {t:26s} {n} matches, never under 2 cards')
    print(f'\nHAS FAILED ({len(dirty)} team-entries):')
    for fx, t, n, nf, lf, _ in sorted(dirty, key=lambda s: (s[4], -s[3])):
        print(f'   {fx:42s} {t:26s} {nf}/{n} matches under 2 cards, last {lf}')
    json.dump(dict(clean=clean, dirty=dirty),
              open(os.path.join(DATA, 'team_card_record_2026-10-25.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()

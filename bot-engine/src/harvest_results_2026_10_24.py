#!/usr/bin/env python3
"""
HARVEST SATURDAY 24 OCT 2026 RESULTS FROM FOTMOB
================================================
Pulls the real match stats (fouls, cards, corners, shots) for every 24 Oct
fixture we had a pick on, then grades every leg we published.

The stat keys live in content.stats.Periods.All:
    yellow_cards, red_cards, fouls, corners, total_shots, shots_on_target
and the referee is in content.matchFacts.infoBox.Referee.
"""
import urllib.request, json, os, time, sys, unicodedata, re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
CACHE = os.path.join(DATA, 'results_2026-10-24.json')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://www.fotmob.com/'}
SAT = '2026-10-24'


def fetch(mid):
    u = f'https://www.fotmob.com/api/data/matchDetails?matchId={mid}'
    for attempt in range(3):
        try:
            req = urllib.request.Request(u, headers=UA)
            return json.load(urllib.request.urlopen(req, timeout=30))
        except Exception as e:
            if attempt == 2:
                return {'error': str(e)}
            time.sleep(1.5)


def norm(s):
    if not s:
        return ''
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def parse(mid, doc, meta=None):
    if 'error' in doc or not doc:
        return None
    hdr = doc.get('header', {})
    teams = hdr.get('teams') or []
    if len(teams) < 2:
        return None
    st = (doc.get('content', {}) or {}).get('stats', {}) or {}
    per = st.get('Periods', {}).get('All', {}) or {}
    if not per:
        return None
    ref = None
    ib = ((doc.get('content', {}) or {}).get('matchFacts', {}) or {}).get('infoBox', {}) or {}
    for r in ib.get('Referee', []) or []:
        if isinstance(r, dict):
            ref = r.get('text') or r.get('name')
        else:
            ref = str(r)
    hn = teams[0].get('name')
    an = teams[1].get('name')
    hs = teams[0].get('score')
    asc = teams[1].get('score')
    # cross-check ordering against the fixture cache
    if meta and norm(meta.get('homeName')) != norm(hn):
        hn, an = an, hn
        hs, asc = asc, hs
    rec = {
        'mid': str(mid),
        'home': hn,
        'away': an,
        'homeScore': hs,
        'awayScore': asc,
        'status': (hdr.get('status', {}) or {}).get('utcTime'),
        'finished': (hdr.get('status', {}) or {}).get('finished'),
        'referee': ref,
        'stats': {'home': {}, 'away': {}},
    }
    # Periods.All = { 'stats': [ {title, key, stats:[home,away]}, ... ] }
    groups = per.get('stats') if isinstance(per, dict) else None
    if groups is None:
        groups = per if isinstance(per, list) else []
    for grp in groups:
        for s in (grp.get('stats') or []):
            key = s.get('key')
            vals = s.get('stats') or []
            if not key or len(vals) < 2:
                continue
            try:
                hv = int(vals[0])
                av = int(vals[1])
            except Exception:
                continue
            rec['stats']['home'][key] = hv
            rec['stats']['away'][key] = av
    return rec


def main():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ids = [(k, v) for k, v in cache.items()
           if str(v.get('utcTime', '')).startswith(SAT)]
    ids.sort(key=lambda kv: kv[1].get('utcTime', ''))
    print(f'{len(ids)} fixtures on {SAT}')

    out = {}
    if os.path.exists(CACHE):
        out = json.load(open(CACHE))
    for i, (mid, meta) in enumerate(ids, 1):
        if mid in out and out[mid].get('stats', {}).get('home', {}).get('fouls') is not None:
            continue
        doc = fetch(mid)
        rec = parse(mid, doc, meta)
        if rec:
            out[mid] = rec
            h = rec['stats'].get('home', {})
            a = rec['stats'].get('away', {})
            print(f"[{i:>2}/{len(ids)}] {mid} {rec['home'][:22]:24s} v {rec['away'][:22]:24s} "
                  f"{rec['homeScore']}-{rec['awayScore']} | fouls {h.get('fouls')}/{a.get('fouls')} "
                  f"cards {h.get('yellow_cards')}/{a.get('yellow_cards')} "
                  f"corners {h.get('corners')}/{a.get('corners')}")
        else:
            print(f"[{i:>2}/{len(ids)}] {mid} {meta.get('homeName')} v {meta.get('awayName')} "
                  f"-> NO STATS (may be unplayed)")
        time.sleep(0.25)
    json.dump(out, open(CACHE, 'w'), indent=1)
    print(f'\nwrote {CACHE}  ({len(out)} matches)')


if __name__ == '__main__':
    main()

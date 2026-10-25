#!/usr/bin/env python3
"""
GRADE THE LEDGER — fetch real results, write them separately
=============================================================
The grader NEVER touches LEDGER.jsonl.  It reads the picks, finds the ones
whose match has finished, pulls the real stats from FotMob, and appends one
result line per pick to LEDGER_RESULTS.jsonl.  A result is written once and
never changed.

Usage:  python3 grade_ledger.py [--date YYYY-MM-DD] [--recheck]
"""
import json, os, re, sys, time, urllib.request, unicodedata, collections
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
LEDGER = os.path.join(DATA, 'LEDGER.jsonl')
RESULTS = os.path.join(DATA, 'LEDGER_RESULTS.jsonl')
RES_CACHE = os.path.join(DATA, 'results_cache.json')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://www.fotmob.com/'}

sys.path.insert(0, HERE)
from ledger import read_jsonl, write_jsonl_append, norm, now_iso


def norm2(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


# ------------------------------------------------------------------ fotmob
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


def parse_stats(doc):
    """-> {'home':..,'away':..,'fouls':(h,a),'cards':(h,a),'reds':(h,a),
           'corners':(h,a),'shots':(h,a),'referee':str}"""
    if not doc or 'error' in doc:
        return None
    hdr = doc.get('header', {}) or {}
    teams = hdr.get('teams') or []
    if len(teams) < 2:
        return None
    content = doc.get('content', {}) or {}
    per = ((content.get('stats', {}) or {}).get('Periods', {}) or {}).get('All', {}) or {}
    if not per:
        return None
    out = {}
    for grp in per.get('stats', []) or []:
        key = grp.get('key')
        vals = grp.get('stats') or []
        if len(vals) == 2:
            out[key] = (vals[0], vals[1])
    ref = None
    for r in ((content.get('matchFacts', {}) or {}).get('infoBox', {}) or {}).get('Referee', []) or []:
        ref = r.get('text') or r.get('name') if isinstance(r, dict) else str(r)
    hn = teams[0].get('name')
    an = teams[1].get('name')
    sc = teams[0].get('score')
    sa = teams[1].get('score')
    return dict(
        home=hn, away=an,
        score=(sc, sa),
        finished=bool(hdr.get('status', {}).get('finished')),
        status_utc=hdr.get('status', {}).get('utcTime'),
        referee=ref,
        yellow_cards=out.get('yellow_cards'),
        red_cards=out.get('red_cards'),
        fouls=out.get('fouls'),
        corners=out.get('corners'),
        total_shots=out.get('total_shots'),
    )


GENERIC = {'fc', 'cf', 'ac', 'as', 'ss', 'ssc', 'us', 'ud', 'cd', 'rc', 'calcio',
           'club', 'city', 'town', 'rovers', 'wanderers', 'albion', 'forest',
           'ham', 'hotspur', 'spurs', 'sv', 'vfb', 'tsg', 'sc', 'bsc', 'vfl',
           'f', 'bv', 'sp', 'fsv', 'tsv', 'svv', 'ucl', 'uel', 'ma', 'de',
           'olympique', 'olympique', 'marseille', 'ogc', 'rc', 'aj', 'stade',
           'losc', 'fcgb', 'fc', 'ssc', 'utc', 'ce', 'rcd', 'vfl', 'vfb',
           '1899', '1900', '1846', '09', '05', '04', '96', '1846'}

# manual aliases for the clubs the two data sources name differently
ALIAS = {
    'psg': 'parissaintgermain', 'paris': 'parissaintgermain',
    'parissaintgermain': 'parissaintgermain', 'parissg': 'parissaintgermain',
    'manutd': 'manchesterunited', 'manchesterunited': 'manchesterunited',
    'manut': 'manchesterunited', 'mufc': 'manchesterunited',
    'brighton': 'brightonhovealbion', 'brightonhovealbion': 'brightonhovealbion',
    'wanderers': 'wolverhamptonwanderers',
    'wolverhamptonwanderers': 'wolverhamptonwanderers',
    'wolves': 'wolverhamptonwanderers',
    'tottenham': 'tottenhamhotspur', 'tottenhamhotspur': 'tottenhamhotspur',
    'spurs': 'tottenhamhotspur',
    'westham': 'westhamunited', 'whu': 'westhamunited',
    'newcastle': 'newcastleunited', 'magpies': 'newcastleunited',
    'leeds': 'leedsunited', 'wolves': 'wolverhamptonwanderers',
    'nottm': 'nottinghamforest', 'forest': 'nottinghamforest',
    'palace': 'crystalpalace', 'cpfc': 'crystalpalace',
    'huddersfield': 'huddersfieldtown', 'qpr': 'queensparkrangers',
    'afcb': 'afcbournemouth', 'bournemouth': 'afcbournemouth',
    'vfb': 'vflbochum', 'lens': 'rclens', 'rc': 'rclens',
    'parisfc': 'parissaintgermain',
    'koln': 'fckoln', 'cologne': 'fckoln',
    'mainz': 'mainz05', 'mainz05': 'mainz05',
    'augsburg': 'fcaugsburg', 'unionberlin': 'unionberlin',
    'bayern': 'fcbayernmunich', 'fcbayernmunich': 'fcbayernmunich',
    'leverkusen': 'bayerleverkusen',
    'psv': 'psv', 'ajax': 'ajax', 'feyenoord': 'feyenoord',
    'manutdunited': 'manchesterunited',
}


def toks(s):
    """Distinctive tokens for a club name, cleaned of noise words."""
    raw = re.findall(r'[a-z0-9]+', unicodedata.normalize('NFKD', str(s or '')).lower()
                      .replace('ä', 'a').replace('ö', 'o').replace('ü', 'u')
                      .replace('é', 'e').replace('è', 'e').replace('ê', 'e')
                      .replace('ç', 'c').replace('ñ', 'n').replace('ø', 'o'))
    out = set()
    for t in raw:
        if t in GENERIC or t.isdigit():
            continue
        out.add(ALIAS.get(t, t))
    if not out:
        out = {ALIAS.get(t, t) for t in raw} or {''}
    return out


def same_club(a, b):
    """Do two club names refer to the same team?"""
    if not a or not b:
        return False
    ta, tb = toks(a), toks(b)
    if not ta or not tb or {''} in (ta | tb):
        return False
    if ta == tb:
        return True
    # one token set is a subset of the other: {lens} vs {lens,paris}
    return ta <= tb or tb <= ta


def match_id_for(home, away, date, cache):
    """Find the FotMob matchId for a fixture."""
    cands = [(mid, m) for mid, m in cache.items()
             if (m.get('utcTime') or '')[:10] == date]
    for mid, m in cands:
        if norm2(m.get('homeName')) == norm2(home) and norm2(m.get('awayName')) == norm2(away):
            return mid
    for mid, m in cands:
        if same_club(m.get('homeName'), home) and same_club(m.get('awayName'), away):
            return mid
    return None


def load_cache():
    cache = {}
    if os.path.exists(RES_CACHE):
        cache = json.load(open(RES_CACHE))
    # seed from the Saturday harvest we already pulled, so we never refetch
    sat = os.path.join(DATA, 'results_2026-10-24.json')
    if os.path.exists(sat):
        for mid, r in json.load(open(sat)).items():
            if mid in cache:
                continue
            cache[mid] = {'homeName': r.get('home'), 'awayName': r.get('away'),
                          'utcTime': r.get('status', ''),
                          'stats': {'home': r['stats'].get('home', {}),
                                    'away': r['stats'].get('away', {}),
                                    'referee': r.get('referee'),
                                    'finished': r.get('finished', True),
                                    'yellow_cards': (r['stats'].get('home', {}).get('yellow_cards'),
                                                     r['stats'].get('away', {}).get('yellow_cards')),
                                    'red_cards': (r['stats'].get('home', {}).get('red_cards'),
                                                  r['stats'].get('away', {}).get('red_cards')),
                                    'fouls': (r['stats'].get('home', {}).get('fouls'),
                                              r['stats'].get('away', {}).get('fouls')),
                                    'corners': (r['stats'].get('home', {}).get('corners'),
                                                r['stats'].get('away', {}).get('corners'))}}
    return cache


def save_cache(c):
    json.dump(c, open(RES_CACHE, 'w'), indent=1)


# ------------------------------------------------------------------ grading
def grade_leg(pick, stats):
    """-> (won, detail, actual_value)"""
    mkt = pick['market']
    line = pick['line']
    thr = float(re.sub(r'[^0-9.]', '', str(line).split()[0].replace('O', '')))
    if mkt == 'Cards':
        v = stats.get('yellow_cards')
        if not v or v[0] is None:
            return None, 'no card data', None
        tot = v[0] + v[1]
        return tot > thr, f'match cards {tot} (line {thr})', tot
    if mkt == 'Fouls (total)':
        v = stats.get('fouls')
        if not v or v[0] is None:
            return None, 'no foul data', None
        tot = v[0] + v[1]
        return tot > thr, f'match fouls {tot} (line {thr})', tot
    if mkt == 'Goals':
        sc = (stats.get('score') or (None, None))[0]
        sa = (stats.get('score') or (None, None))[1]
        if sc is None or sa is None:
            return None, 'no score', None
        ln = str(line).lower()
        if ln.startswith('over'):
            thr = float(''.join(ch for ch in ln if ch.isdigit() or ch == '.') or 0)
            return (sc + sa) > thr, f'total goals {sc+sa} (line over {thr})', sc + sa
        if 'both teams' in ln or ln == 'btts':
            return (sc > 0 and sa > 0), f'{sc}-{sa} both teams scored', sc + sa
        if ln == '1x':
            return sc >= sa, f'{sc}-{sa} home or draw', sc + sa
        if ln == 'x2':
            return sc <= sa, f'{sc}-{sa} draw or away', sc + sa
        if 'home win' in ln:
            return sc > sa, f'{sc}-{sa} home win', sc + sa
        if 'away win' in ln:
            return sa > sc, f'{sc}-{sa} away win', sc + sa
        if ln == 'draw':
            return sc == sa, f'{sc}-{sa} draw', sc + sa
        if 'draw no bet' in ln:
            return sc != sa, f'{sc}-{sa} draw no bet', sc + sa
        return None, f'unknown goal line {line}', None
    if mkt == 'Bookings':
        # SportyBet bookings: yellow = 1, red = 2, second yellow not counted
        y = stats.get('yellow_cards')
        r = stats.get('red_cards')
        if not y or y[0] is None:
            return None, 'no card data', None
        red = (r[0] or 0) + (r[1] or 0) if r else 0
        bk = (y[0] or 0) + (y[1] or 0) + 2 * red
        return bk > thr, f'match bookings {bk} (line {thr})', bk
    if mkt == 'Cards (team)':
        v = stats.get('yellow_cards')
        if not v or v[0] is None:
            return None, 'no card data', None
        side = 'AWAY' if 'AWAY' in str(line) else 'HOME'
        tc = v[1] if side == 'AWAY' else v[0]
        return tc > thr, f'{side} team bookings {tc} (line {thr})', tc
    if mkt == 'Fouls (team)':
        v = stats.get('fouls')
        if not v or v[0] is None:
            return None, 'no foul data', None
        side = 'AWAY' if 'AWAY' in str(line) else 'HOME'
        tf = v[1] if side == 'AWAY' else v[0]
        return tf > thr, f'{side} team fouls {tf} (line {thr})', tf
    return None, f'unknown market {mkt}', None


def main():
    recheck = '--recheck' in sys.argv
    only = None
    if '--date' in sys.argv:
        only = sys.argv[sys.argv.index('--date') + 1]

    led = read_jsonl(LEDGER)
    done = {r['id'] for r in read_jsonl(RESULTS)}
    if recheck:
        done = set()

    todo = [p for p in led if p['id'] not in done]
    if only:
        todo = [p for p in todo if p['date'] == only]
    if not todo:
        print('nothing to grade')
        return

    dates = sorted({p['date'] for p in todo})
    print(f'grading {len(todo)} picks across {len(dates)} matchday(s): {dates}')

    cache = load_cache()
    results = []
    graded_dates = collections.defaultdict(lambda: {'w': 0, 'n': 0})
    for date in dates:
        picks = [p for p in todo if p['date'] == date]
        # group by fixture
        fx = collections.OrderedDict()
        for p in picks:
            fx.setdefault((p['home'], p['away']), []).append(p)
        for (home, away), ps in fx.items():
            mid = match_id_for(home, away, date, cache)
            if mid is None:
                print(f'  no FotMob id for {date} {home} v {away} -- skipped')
                continue
            if mid not in cache or 'stats' not in cache.get(mid, {}):
                doc = fetch(mid)
                st = parse_stats(doc)
                if st is None:
                    print(f'  {date} {home} v {away}: no stats yet (match not finished?)')
                    continue
                cache[mid] = {'homeName': home, 'awayName': away,
                              'utcTime': doc.get('header', {}).get('status', {}).get('utcTime', ''),
                              'stats': st}
                save_cache(cache)
                time.sleep(0.35)
            st = cache[mid]['stats']
            for p in ps:
                won, detail, val = grade_leg(p, st)
                if won is None:
                    continue
                results.append(dict(id=p['id'], date=date, won=won, detail=detail,
                                    actual=val, referee=p.get('referee'),
                                    graded=now_iso()))
                graded_dates[date]['n'] += 1
                graded_dates[date]['w'] += 1 if won else 0
    if results:
        write_jsonl_append(RESULTS, results)
        print(f'\nwrote {len(results)} results to LEDGER_RESULTS.jsonl')
    for d in sorted(graded_dates):
        g = graded_dates[d]
        print(f'  {d}: {g["w"]}/{g["n"]} = {100*g["w"]/g["n"]:.1f}%')


if __name__ == '__main__':
    main()

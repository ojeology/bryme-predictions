#!/usr/bin/env python3
"""CARD MODEL v2 — referee-led (validated) + Friday 23 Oct pre-match prediction & grading."""
import json, urllib.request, time, random, collections, math, statistics as st

CACHE = 'bot-engine/data/fotmob_2627_exact_api_cache.json'
TODAY = '2026-10-23'
KEYS = {'cards': 'yellow_cards', 'corners': 'corners', 'fouls': 'fouls', 'shots': 'total_shots'}


def get(mid):
    req = urllib.request.Request(
        f"https://www.fotmob.com/api/data/matchDetails?matchId={mid}",
        headers={"User-Agent": "Mozilla/5.0"})
    return json.loads(urllib.request.urlopen(req, timeout=20).read().decode())


def stat(periods, key):
    for grp in ((periods.get('All') or {}).get('stats') or []):
        for s in (grp.get('stats') or []):
            if s.get('key') == key:
                return s.get('stats')
    return None


with open(CACHE) as f:
    cache = json.load(f)

matches = []
for mid, m in cache.items():
    c, y, fl, s = m.get('corners') or [], m.get('yellows') or [], m.get('fouls') or [], m.get('shots') or []
    if len(c) != 2 or len(y) != 2:
        continue
    matches.append(dict(date=(m.get('utcTime') or '')[:10], mid=mid, comp=m.get('compName'),
                         home=m.get('homeName'), away=m.get('awayName'),
                         ref=(m.get('referee') or {}).get('name'),
                         cards=y[0] + y[1], hc=y[0], ac=y[1], corners=c[0] + c[1],
                         fouls=fl[0] + fl[1] if len(fl) == 2 else None,
                         shots=s[0] + s[1] if len(s) == 2 else None))
matches.sort(key=lambda m: (m['date'], m['mid']))
by_mid = {m['mid']: m for m in matches}

ref_cards = collections.defaultdict(list)
comp_cards = collections.defaultdict(list)
club_home = collections.defaultdict(list)
club_away = collections.defaultdict(list)


def refresh(upto):
    ref_cards.clear(); comp_cards.clear(); club_home.clear(); club_away.clear()
    for m in matches:
        if m['date'] >= upto:
            break
        if m['ref']:
            ref_cards[m['ref']].append(m['cards'])
        comp_cards[m['comp']].append(m['cards'])
        club_home[m['home']].append(m['hc'])
        club_away[m['away']].append(m['ac'])


def predict(home, away, ref, comp, seed=11, n=6000):
    rl = list(ref_cards.get(ref, []))
    cal = list(comp_cards.get(comp, []))
    hh, aa = club_home.get(home, []), club_away.get(away, [])
    if len(rl) >= 4:
        base, src, nsrc = rl, 'referee', len(rl)
    elif len(cal) >= 8:
        base, src, nsrc = cal, 'league', len(cal)
    else:
        return None
    comp_avg = st.mean(cal) if cal else st.mean(base)
    hh2 = [x for x in hh if x is not None]
    aa2 = [x for x in aa if x is not None]
    random.seed(seed)
    samp = []
    for _ in range(n):
        v = random.choice(base)
        if src == 'league' and hh2 and aa2:
            v = random.choice(hh2) + random.choice(aa2) + round(st.mean(base) - st.mean(hh2) - st.mean(aa2))
        samp.append(v)
    samp.sort()
    out = dict(pred=st.median(samp), src=src, n_src=nsrc, base_avg=st.mean(base),
               comp_avg=comp_avg, h_mean=st.mean(hh2) if hh2 else None,
               a_mean=st.mean(aa2) if aa2 else None, h_n=len(hh2), a_n=len(aa2))
    for L in (1.5, 2.5, 3.5, 4.5):
        out[f'p_{int(L)+1}'] = 100 * sum(1 for x in samp if x > L) / len(samp)
    return out


# ------------------------------------------------- walk-forward validation (v2)
refresh(TODAY)
val = []
for m in matches:
    if m['date'] >= TODAY:
        break
    p = predict(m['home'], m['away'], m['ref'], m['comp'])
    if p:
        val.append((m, p))
print("=== CARD MODEL v2 (referee-led) WALK-FORWARD VALIDATION ===")
for L, key in ((2.5, 'p_3'), (3.5, 'p_4')):
    bm = bb = 0.0
    for m, p in val:
        pm = p[key] / 100
        act = 1 if m['cards'] > L else 0
        cal = comp_cards[m['comp']]
        base = sum(1 for x in cal if x > L) / len(cal)
        bm += (pm - act) ** 2; bb += (base - act) ** 2
    print(f"  Over {L}: model Brier {bm/len(val):.4f}  vs league-base {bb/len(val):.4f}  -> "
          f"{'MODEL WINS' if bm < bb else 'BASE WINS'}")
print("  Calibration (P>2.5 bucket -> actual):")
b = collections.defaultdict(lambda: [0, 0])
for m, p in val:
    k = int(p['p_3'] // 10) * 10
    b[k][0] += 1; b[k][1] += 1 if m['cards'] > 2.5 else 0
for k in sorted(b):
    n, w = b[k]
    print(f"    {k:3d}-{k+9}%: n={n:3d} actual {100*w/n:5.1f}%")

# ------------------------------------------------- FRIDAY PREDICTIONS (pre-match)
print("\n=== FRIDAY 23 OCT — PRE-MATCH CARD PREDICTION vs ACTUAL ===")
friday = [m for m in matches if m['date'] == TODAY and m['mid'] in json.load(open('/tmp/today_live.json')).keys()]
friday = [m for m in friday if (m['mid'])]
# use the live pull for actuals
live = json.load(open('/tmp/today_live.json'))
# build actuals from live pull
rows = []
for mid, L in live.items():
    m = by_mid.get(mid)
    if not m:
        continue
    p = predict(m['home'], m['away'], m['ref'], m['comp'])
    if not p:
        continue
    rows.append((m, p, L))
rows.sort(key=lambda r: r[2]['ko'])
print(f"{'KO':>5s} {'MATCH':38s} {'REF (n)':26s} {'PRED':>5s} {'P>2.5':>7s} {'P>3.5':>7s} {'MINpx3.5':>9s} | {'ACT':>4s} {'state':10s} | VERDICT")
for m, p, L in rows:
    y = L.get('Y_all')
    stt = L.get('state')
    if y is None:
        verdict = 'not started'
    else:
        verdict = 'WON' if y > 2.5 else 'LOST'
        if stt != 'FT':
            verdict = f'LIVE (O2.5 {"IN" if y > 2.5 else "OUT"})'
    minpx = (100 / p['p_4'] * 1.05) if p['p_4'] else 0
    print(f"{L['ko']:>5s} {m['home'][:17] + ' v ' + m['away'][:17]:38s} "
          f"{(m['ref'] or '?')[:18] + ' n=' + str(p['n_src']):26s} {p['pred']:5.1f} {p['p_3']:6.1f}% {p['p_4']:6.1f}% "
          f"{minpx:9.2f} | {str(y):>4s} {stt:10s} | {verdict}")
json.dump([{'ko': L['ko'], 'comp': m['comp'], 'home': m['home'], 'away': m['away'], 'ref': m['ref'],
            'pred': p['pred'], 'p3': p['p_3'], 'p4': p['p_4'], 'src': p['src'], 'n_src': p['n_src'],
            'base_avg': p['base_avg'], 'h_mean': p['h_mean'], 'a_mean': p['a_mean'],
            'actual_Y': L.get('Y_all'), 'hY': L.get('hY'), 'aY': L.get('aY'), 'state': L.get('state'),
            'score': L.get('score'), 'ref_y': L.get('ref_yellows'), 'ref_g': L.get('ref_games')}
           for m, p, L in rows], open('/tmp/friday_card_preds.json', 'w'), indent=1)

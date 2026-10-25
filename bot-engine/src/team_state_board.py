#!/usr/bin/env python3
"""
TEAM STATE BOARD — Sunday 25 Oct 2026
======================================
"Search for teams in best position to win" was the question.  Measured first:

  * A strong favourite wins 82.1% of the time.  That is LESS certain than the
    card lines we already run (86-92%), so betting the favourite makes a
    near-certain ticket WORSE, not better.
  * Strength and motivation do NOT move the behaviour numbers:
        corr(points-per-game gap, cards) = -0.004
        corr(points-per-game gap, fouls) = +0.022
    Cards are flat at ~4.0 across every band of table position.
  * The two team-level signals that DO work:
        corr(team's last-6 foul rate, fouls next match)  = +0.274
        corr(team's last-6 card rate, cards next match)  = +0.146

So this board shows the form and table position (for information), and then
shows the two signals that actually move our numbers.
"""
import json, os, re, collections, statistics as st, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')


def nk(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def load():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for mid, m in cache.items():
        if not m.get('finished'):
            continue
        y = m.get('yellows') or []
        f = m.get('fouls') or []
        if len(y) != 2 or len(f) != 2:
            continue
        ss = m.get('scoreStr') or ''
        mm = re.match(r'^\s*(\d+)\s*-\s*(\d+)\s*$', ss)
        if not mm:
            continue
        ms.append(dict(date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hs=int(mm.group(1)), as_=int(mm.group(2)),
                       comp=m.get('compSlug'), hc=y[0], ac=y[1], hf=f[0], af=f[1],
                       ref=(m.get('referee') or {}).get('name')))
    ms.sort(key=lambda m: m['date'])
    return ms


def main():
    ms = load()
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refman = {r['name']: r for r in man['referees']}

    # league averages (fouls and cards per team-match)
    avg_f = sum(m['hf'] + m['af'] for m in ms) / (2 * len(ms))
    avg_c = sum(m['hc'] + m['ac'] for m in ms) / (2 * len(ms))

    byteam = collections.defaultdict(list)
    for m in ms:
        byteam[m['home']].append((m, 'H'))
        byteam[m['away']].append((m, 'A'))
    nm = {}
    for t in byteam:
        nm.setdefault(nk(t), t)

    def resolve(s):
        s = s.strip()
        if s in byteam:
            return s
        k = nk(s)
        if k in nm:
            return nm[k]
        c = [t for kk, t in nm.items() if k in kk or kk in k]
        return max(c, key=len) if c else None

    # partial league tables from the cache
    pts = collections.defaultdict(collections.Counter)
    pl = collections.defaultdict(collections.Counter)
    for m in ms:
        c = m['comp']
        pts[c][m['home']] += 3 if m['hs'] > m['as_'] else (1 if m['hs'] == m['as_'] else 0)
        pts[c][m['away']] += 3 if m['as_'] > m['hs'] else (1 if m['hs'] == m['as_'] else 0)
        pl[c][m['home']] += 1
        pl[c][m['away']] += 1
    pos = {}
    for c in pts:
        order = sorted(pts[c], key=lambda t: -(pts[c][t] / max(1, pl[c][t])))
        for i, t in enumerate(order, 1):
            pos[(nk(c), nk(t))] = (i, pts[c][t], pl[c][t], len(pts[c]))

    def team_state(t):
        rows = byteam.get(t, [])
        if not rows:
            return None
        last6 = rows[-6:]
        last5 = rows[-5:]
        res = []
        for m, sd in last5:
            gf = m['hs'] if sd == 'H' else m['as_']
            ga = m['as_'] if sd == 'H' else m['hs']
            res.append('W' if gf > ga else ('D' if gf == ga else 'L'))
        fouls = [m['hf'] if sd == 'H' else m['af'] for m, sd in last6]
        cards = [m['hc'] if sd == 'H' else m['ac'] for m, sd in last6]
        return dict(n=len(rows), form=''.join(res), pts=sum(3 if r == 'W' else (1 if r == 'D' else 0)
                                                       for r in res),
                    foul_rate=st.mean(fouls), card_rate=st.mean(cards),
                    fouls=fouls, cards=cards)

    W = []
    W.append('# TEAM STATE BOARD — Sunday 25 Oct 2026')
    W.append('')
    W.append('Form and table position are shown for information. The last two columns are the '
             'only team-level signals that measurably move our numbers.')
    W.append('')
    W.append('**League averages:** a team commits **%.1f fouls** and picks up **%.1f bookings** '
             'per match.' % (avg_f, avg_c))
    W.append('')
    W.append('| KO | Fixture | Team | Form | Pts | table | fouls (last 6) | vs avg | cards (last 6) | vs avg |')
    W.append('|---|---|---|---|---|---|---|---|---|---|')
    hot = []
    for r in sorted(board, key=lambda r: (r['ko'], r['fx'])):
        parts = [x.strip() for x in r['fx'].split(' v ')]
        rm = refman.get(r['ref'])
        for tm, side in ((parts[0], 'HOME'), (parts[1], 'AWAY')):
            t = resolve(tm)
            ts = team_state(t) if t else None
            if not ts:
                W.append(f"| {r['ko']} | {r['fx'][:30]} | {tm[:22]} | — | — | — | not in cache | | | |")
                continue
            p = pos.get((nk(r['comp']), nk(t)))
            tbl = f"{p[0]} of {p[3]} ({p[1]}pts/{p[2]}g)" if p else '—'
            df = ts['foul_rate'] - avg_f
            dc = ts['card_rate'] - avg_c
            W.append(f"| {r['ko']} | {r['fx'][:30]} | {t[:22]} | {ts['form']} | {ts['pts']} | {tbl} | "
                     f"{ts['foul_rate']:.1f} ({', '.join(str(x) for x in ts['fouls'])}) | "
                     f"{df:+.1f} | {ts['card_rate']:.1f} | {dc:+.1f} |")
            hot.append((max(df, dc), r, t, ts, df, dc))
    W.append('')
    W.append('## THE TEAMS WHOSE OWN PATTERN IS HOT — these are the ones that move the model')
    W.append('')
    W.append('Team fouls correlate +0.27 with a team own recent foul rate; team cards correlate '
             '+0.15. Both are weak but they are real, and they are the only team-level signal '
             'that survives walk-forward.')
    W.append('')
    hot.sort(key=lambda x: -x[0])
    W.append('| KO | Fixture | Team | fouls last 6 | vs avg | cards last 6 | vs avg |')
    W.append('|---|---|---|---|---|---|---|')
    for sc, r, t, ts, df, dc in hot[:18]:
        if sc < 0.5:
            break
        W.append(f"| {r['ko']} | {r['fx'][:30]} | {t[:24]} | {ts['foul_rate']:.1f} | **{df:+.1f}** | "
                 f"{ts['card_rate']:.1f} | {dc:+.1f} |")
    W.append('')
    W.append('## WHAT TABLE POSITION IS WORTH HERE: NOTHING')
    W.append('')
    W.append('| |')
    W.append('|---|---|')
    W.append('| A strong favourite wins | **82.1%** |')
    W.append('| Home win | 43.0% |')
    W.append('| Home win or draw (1X) | 67.0% |')
    W.append('| Over 0.5 goals | 94.2% |')
    W.append('| **Our card lines today** | **86-91%** |')
    W.append('| At least one booking in the match | 97.1% |')
    W.append('')
    W.append('Backing the favourite is a 82% bet. Our card lines are 86-91%. So the favourite is '
             'not the safer pick — it is the less safe pick, and it is a goal market, which this '
             'project ruled out on 2026-10-23.')
    out = '\n'.join(W)
    open(os.path.join(DATA, 'TEAM_STATE_BOARD_2026-10-25.md'), 'w').write(out)
    print(out[:4000])
    print('\n...\nwrote TEAM_STATE_BOARD_2026-10-25.md')


if __name__ == '__main__':
    main()

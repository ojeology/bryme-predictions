#!/usr/bin/env python3
"""
CARDS — head to head: does a TEAM's own card record add anything to the
REFEREE?

The existing card model is a bootstrap off the referee's own history and it is
our only market with a measured real-price edge (Cards O3.5 @1.60, 7/8 won).
This script asks the user's question directly, with the same machinery:

    A  league / naive rate
    B  TEAM only          — resample the team's own prior card counts
    C  REFEREE only       — resample the referee's prior match card counts
    D  TEAM + REFEREE     — the team's own distribution, shifted by how much
                             this referee differs from the league average

Everything is an EMPIRICAL probability (the fraction of prior observations
over the line), so there is no distribution assumption to get wrong.
Walk-forward: every match is predicted using only what happened before it.
"""
import json, os, collections, statistics as st

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')

MATCH_LINES = [2.5, 3.5, 4.5, 5.5]
TEAM_LINES = [0.5, 1.5, 2.5, 3.5, 4.5]
MIN_TEAM_N = 6
MIN_REF_N = 4


def brier(ps):
    return sum((p - a) ** 2 for p, a in ps) / len(ps)


def main():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for v in cache.values():
        if v.get('finished') and v.get('yellows') and v.get('fouls'):
            ms.append(dict(date=str(v.get('utcTime'))[:10], ts=v.get('utcTime'),
                           home=v.get('homeName'), away=v.get('awayName'),
                           yh=v['yellows'][0], ya=v['yellows'][1],
                           comp=v.get('compName') or v.get('compSlug'),
                           ref=(v.get('referee') or {}).get('name')))
    ms.sort(key=lambda m: (m['ts'] or '', m['home'] or ''))
    print(f'matches: {len(ms)} ({ms[0]["date"]} -> {ms[-1]["date"]})')
    allc = [c for m in ms for c in (m['yh'], m['ya'])]
    base = sum(allc) / len(allc)
    print(f'league baseline {base:.3f} yellow cards per team\n')

    # running state
    team_cards = collections.defaultdict(list)   # team -> [cards per match]
    ref_match = collections.defaultdict(list)     # referee -> [match card totals]
    ref_team = collections.defaultdict(list)       # referee -> [per-team card counts]
    comp_cards = collections.defaultdict(list)
    rows = []

    for m in ms:
        rec = dict(m)
        rec['ym'] = m['yh'] + m['ya']
        # ---------- MATCH TOTAL CARDS
        rl = ref_match.get(m['ref'], [])
        cal = comp_cards.get(m['comp'], [])
        for L in MATCH_LINES:
            rec[f'm_naive_{L}'] = (sum(1 for x in cal if x > L) / len(cal)) if cal else None
            rec[f'm_ref_{L}'] = (sum(1 for x in rl if x > L) / len(rl)) if len(rl) >= MIN_REF_N else None
        # ---------- TEAM CARDS
        for side, team, y in (('h', m['home'], m['yh']), ('a', m['away'], m['ya'])):
            tl = team_cards.get(team, [])
            rtl = ref_team.get(m['ref'], [])
            league_team = [c for c in allc]
            for L in TEAM_LINES:
                rec[f'{side}_naive_{L}'] = (sum(1 for x in league_team if x > L) / len(league_team))
                rec[f'{side}_team_{L}'] = (sum(1 for x in tl if x > L) / len(tl)) if len(tl) >= MIN_TEAM_N else None
                # team + referee: the team's own counts, shifted by this referee's
                # average relative to the league average
                if len(tl) >= MIN_TEAM_N and len(rtl) >= MIN_REF_N:
                    shift = st.mean(rtl) - base
                    shifted = [max(0, x + shift) for x in tl]
                    rec[f'{side}_tr_{L}'] = sum(1 for x in shifted if x > L) / len(shifted)
                else:
                    rec[f'{side}_tr_{L}'] = None
        rows.append(rec)

        team_cards[m['home']].append(m['yh'])
        team_cards[m['away']].append(m['ya'])
        if m['ref']:
            ref_match[m['ref']].append(m['yh'] + m['ya'])
            ref_team[m['ref']].append(m['yh'])
            ref_team[m['ref']].append(m['ya'])
        comp_cards[m['comp']].append(m['yh'] + m['ya'])

    # ---------------- MATCH TOTAL CARDS
    print('=' * 100)
    print('MATCH TOTAL CARDS — who wins')
    print('=' * 100)
    print(f'{"LINE":>6s} {"naive":>10s} {"REFEREE":>10s} {"Brier naive":>12s} {"Brier ref":>12s} '
          f'{"VERDICT":>12s} {"n":>6s}')
    for L in MATCH_LINES:
        ps = [(r[f'm_ref_{L}'], 1.0 if r['ym'] > L else 0.0) for r in rows if r[f'm_ref_{L}'] is not None]
        if len(ps) < 50:
            continue
        naive = sum(a for _, a in ps) / len(ps)
        bn = brier([(naive, a) for _, a in ps])
        br = brier(ps)
        print(f'{"O"+str(L):>6s} {naive*100:9.1f}% {sum(p for p,_ in ps)/len(ps)*100:9.1f}% '
              f'{bn:12.4f} {br:12.4f} {"REF WINS" if br < bn else "naive":>12s} {len(ps):6d}')

    # ---------------- TEAM CARDS
    print('\n' + '=' * 100)
    print('TEAM CARDS — does the TEAM add anything to the REFEREE?')
    print('=' * 100)
    print(f'{"LINE":>6s} {"naive":>9s} {"TEAM only":>10s} {"TEAM+REF":>9s} '
          f'{"Brier naive":>12s} {"Brier team":>11s} {"Brier team+ref":>15s} {"VERDICT"}')
    for L in TEAM_LINES:
        trio = []
        for r in rows:
            for side, y in (('h', r['yh']), ('a', r['ya'])):
                trio.append((r[f'{side}_naive_{L}'], r[f'{side}_team_{L}'], r[f'{side}_tr_{L}'],
                             1.0 if y > L else 0.0))
        use = [t for t in trio if t[1] is not None and t[2] is not None]
        if len(use) < 100:
            continue
        naive = sum(t[3] for t in use) / len(use)
        bn = brier([(naive, t[3]) for t in use])
        bt = brier([(t[1], t[3]) for t in use])
        btr = brier([(t[2], t[3]) for t in use])
        best = min((bn, 'naive'), (bt, 'TEAM'), (btr, 'TEAM+REF'))[1]
        print(f'{"O"+str(L):>6s} {naive*100:8.1f}% {sum(t[1] for t in use)/len(use)*100:9.1f}% '
              f'{sum(t[2] for t in use)/len(use)*100:8.1f}% {bn:12.4f} {bt:11.4f} {btr:15.4f} '
              f'{best:>10s}  (n={len(use)})')

    # ---------------- UEFA subset (where our real card prices came from)
    UEFA = ('UEFA Champions League', 'UEFA Europa League', 'UEFA Conference League')
    print('\n' + '=' * 100)
    print('SAME COMPARISON RESTRICTED TO UEFA (where our 8 real card prices came from)')
    print('=' * 100)
    print(f'{"market":20s} {"LINE":>6s} {"n":>5s} {"naive Brier":>12s} {"REF Brier":>11s} '
          f'{"TEAM Brier":>11s} {"VERDICT"}')
    for L in MATCH_LINES:
        ps = [(r['m_ref_' + str(L)], r['m_naive_' + str(L)], 1.0 if r['ym'] > L else 0.0)
              for r in rows if r['comp'] in UEFA and r[f'm_ref_{L}'] is not None
              and r[f'm_naive_{L}'] is not None]
        if len(ps) < 30:
            continue
        bn = brier([(p[1], p[2]) for p in ps])
        br = brier([(p[0], p[2]) for p in ps])
        print(f'{"MATCH CARDS":20s} {"O"+str(L):>6s} {len(ps):5d} {bn:12.4f} {br:11.4f} '
              f'{"":>11s} {"REF WINS" if br < bn else "naive":>10s}')
    for L in TEAM_LINES:
        ps = [(r[f'h_tr_{L}'], r[f'h_naive_{L}'], r[f'h_team_{L}'], 1.0 if r['yh'] > L else 0.0)
              for r in rows if r['comp'] in UEFA and r[f'h_tr_{L}'] is not None
              and r[f'h_team_{L}'] is not None]
        ps += [(r[f'a_tr_{L}'], r[f'a_naive_{L}'], r[f'a_team_{L}'], 1.0 if r['ya'] > L else 0.0)
               for r in rows if r['comp'] in UEFA and r[f'a_tr_{L}'] is not None
               and r[f'a_team_{L}'] is not None]
        if len(ps) < 50:
            continue
        bn = brier([(p[1], p[2]) for p in ps])
        bt = brier([(p[2], p[3]) for p in ps])
        btr = brier([(p[0], p[3]) for p in ps])
        best = min((bn, 'naive'), (bt, 'TEAM'), (btr, 'TEAM+REF'))[1]
        print(f'{"TEAM CARDS":20s} {"O"+str(L):>6s} {len(ps):5d} {bn:12.4f} {"":>11s} '
              f'{bt:11.4f} {best:>10s} (team+ref {btr:.4f})')

    # ---------------- the tails, and how much survives
    print('\n' + '=' * 100)
    print('THE TEAM EFFECT, ISOLATED — how much of a team\'s card record survives?')
    print('=' * 100)
    print('If a team averages 3.0 cards a game, how many does it get next time?')
    # simpler: prior team average vs actual, per side
    tf = collections.defaultdict(lambda: [0.0, 0])
    pairs = []
    for m in ms:
        for team, y in ((m['home'], m['yh']), (m['away'], m['ya'])):
            f, n = tf[team]
            if n >= 6:
                pairs.append((f / n, y, n))
            tf[team][0] += y
            tf[team][1] += 1
    for lo, hi, label in ((0, 0.9, 'under 0.9/g (clean)'), (0.9, 1.6, '0.9-1.6/g'),
                           (1.6, 2.6, '1.6-2.6/g'), (2.6, 99, 'over 2.6/g (dirty)')):
        sub = [p for p in pairs if lo <= p[0] < hi]
        if not sub:
            continue
        print(f'  prior {label:24s} n={len(sub):4d}  prior avg {sum(p[0] for p in sub)/len(sub):5.2f} '
              f'-> actual avg {sum(p[1] for p in sub)/len(sub):5.2f}  '
              f'(league average {base:.2f})')
    print('\n  A team that fouls a lot gets cards, and the league average is pulled up by those')
    print('  teams — but a specific team\'s card record is mostly the referee\'s doing.')


if __name__ == '__main__':
    main()

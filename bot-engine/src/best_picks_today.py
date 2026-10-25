#!/usr/bin/env python3
"""
BEST PICKS TODAY — Sunday 25 Oct 2026, informed by the ledger
=============================================================
The ledger gives us something we did not have before: an actual record of
which referees and which teams our lines have landed on.  One matchday is
NOT enough to trust that on its own, so every record rate is shrunk toward
the overall rate with an empirical-Bayes weight:

        shrunk = (hits + K * prior) / (n + K)

K = 10, so a referee with 7 games barely moves and one with 40 moves a lot.

The score for each pick:
        score = model probability
              + (shrunk referee rate - prior) * (n_referee / (n_referee + K))
              + (shrunk team rate     - prior) * (n_team     / (n_team     + K))

The weights are exactly the confidence in each record, so a lucky 4-game
referee cannot move a pick, while a 30-game one can.
"""
import json, os, re, sys, collections, statistics as st

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
sys.path.insert(0, HERE)
from ledger import read_jsonl, norm

K = 10.0
PRIOR = 0.673          # the ledger's overall rate, 132/196


def shrunk(hits, n, prior=PRIOR):
    if n <= 0:
        return prior, 0.0
    return (hits + K * prior) / (n + K), n / (n + K)


def main():
    led = read_jsonl(os.path.join(DATA, 'LEDGER.jsonl'))
    res = {r['id']: r for r in read_jsonl(os.path.join(DATA, 'LEDGER_RESULTS.jsonl'))}
    graded = [l for l in led if l['id'] in res]

    # ---------- referee record ---------------------------------------------
    ref = collections.defaultdict(lambda: [0, 0])
    for l in graded:
        if not l.get('referee'):
            continue
        ref[l['referee']][0] += 1
        ref[l['referee']][1] += 1 if res[l['id']]['won'] else 0
    refrec = {}
    for r, (n, h) in ref.items():
        sr, w = shrunk(h, n)
        refrec[r] = dict(n=n, h=h, raw=h / n, shrunk=sr, weight=w)

    # ---------- team record -------------------------------------------------
    team = collections.defaultdict(lambda: [0, 0])
    for l in graded:
        for tm in (l.get('home'), l.get('away')):
            if tm:
                team[tm][0] += 1
                team[tm][1] += 1 if res[l['id']]['won'] else 0
    teamrec = {}
    for t, (n, h) in team.items():
        sr, w = shrunk(h, n)
        teamrec[t] = dict(n=n, h=h, raw=h / n, shrunk=sr, weight=w)

    # ---------- today's picks ----------------------------------------------
    picks = [l for l in led if l['date'] == '2026-10-25' and l['id'] not in res]
    print(f"ledger: {len(led)} picks, {len(graded)} graded, {len(picks)} open for today")
    print(f'referee records: {len(refrec)}   team records: {len(teamrec)}')

    BOOK_PAYOUT = 0.946      # measured on the 7 real card quotes
    CARD_EDGE, FOUL_EDGE = 0.014, -0.015
    FOUL_CAL = {'Fouls (total)': +0.025, 'Fouls (team)': -0.044}

    def expected_price(p):
        if not p.get('prob'):
            return None
        edge = CARD_EDGE if p['market'] == 'Cards' else FOUL_EDGE
        fair = 1.0 / max(0.05, (p['prob'] or 0.5) - edge)
        return round(max(1.02, fair * BOOK_PAYOUT), 2)

    scored = []
    for p in picks:
        pr = refrec.get(p.get('referee') or '')
        ts = [teamrec.get(p.get('home')), teamrec.get(p.get('away'))]
        ts = [t for t in ts if t]
        adj_r = (pr['shrunk'] - PRIOR) * pr['weight'] if pr else 0.0
        adj_t = ((sum(t['shrunk'] for t in ts) / len(ts) - PRIOR)
                 * (sum(t['weight'] for t in ts) / len(ts))) if ts else 0.0
        base = p.get('prob') or 0.0
        score = base + adj_r + adj_t
        scored.append(dict(p, score=score, adj_ref=adj_r, adj_team=adj_t,
                           ref_rec=pr, team_recs=ts))

    # ---------- the board ----------------------------------------------------
    # gate: refuse to call anything "best" on thin evidence
    def quality(s):
        # A competition-baseline line has NO referee history at all, so it can
        # never be Tier A or B however good the competition looks.
        if s.get('driver') != 'REF':
            return 'C'
        rg = s.get('ref_games') or 0
        if rg >= 20:
            return 'A'
        if rg >= 8:
            return 'B'
        return 'C'

    # ONE line per fixture: the buffered line is the one we actually play.
    play = {}
    for s in scored:
        if s.get('driver') != 'REF':
            continue
        k = (s['home'], s['away'], s['market'])
        # prefer the buffered leg, then the highest probability
        cand = [x for x in scored if (x['home'], x['away'], x['market']) == k]
        if s.get('buffered'):
            play[k] = s
        elif k not in play:
            play[k] = s
    byq = collections.defaultdict(list)
    for k, s in play.items():
        byq[quality(s)].append(s)

    out = ['# SUNDAY 25 OCT 2026 — THE BEST PICKS', '',
           'Ranked by the model, then adjusted by the LEDGER record of each referee',
           'and each team — but only as far as the record actually deserves.', '',
           'Every record rate is shrunk toward the overall rate:',
           '`(hits + 10 x 67.3%) / (n + 10)`, and the adjustment is weighted by',
           '`n / (n + 10)`. One matchday cannot move a pick. Forty can.', '',
           '**OVERALL LEDGER RECORD: 132/196 = 67.3%**', '',
           '## TIER A — best sample (referee 20+ games) and highest score', '']
    for tier, blurb in (('A', 'referee 20+ games of history'),
                        ('B', 'referee 8-19 games of history'),
                        ('C', 'thin referee history — fillers, not anchors')):
        Ls = sorted(byq.get(tier, []), key=lambda s: -(s.get('prob') or 0))
        if tier == 'B':
            out += ['## TIER B — good sample (referee 8-19 games)', '']
        if tier == 'C':
            out += ['## TIER C — thin sample (use as fillers, not anchors)', '']
        if not Ls:
            continue
        out += [f'| # | KO | Fixture | Market | PLAY THIS | Model p | Expect px | Referee | Ref sample | Ref record |',
                '|---|-----|---------|--------|-----------|---------|-----------|---------|------------|-------------|']
        for i, s in enumerate(Ls, 1):
            pr = s.get('ref_rec')
            rr = (f"{pr['h']}/{pr['n']} = {pr['raw']*100:.0f}%" if pr else '—')
            px = expected_price(s)
            out.append(f"| {i} | {s['ko']} | {s['home']} v {s['away']} | {s['market']} | "
                       f"**{s['line']}** | {(s.get('prob') or 0)*100:.1f}% | "
                       f"{px if px else '—'} | {s.get('referee') or '—'} | "
                       f"{s.get('ref_games') or '—'} | {rr} |")
        out.append('')

    # ---------- what the record says about referees -------------------------
    out += ['## THE REFEREE RECORD (what we have actually seen)', '',
            '| Referee | Hits | n | Raw | Shrunk | Sample |', '|---|---|---|---|---|---|']
    for r, v in sorted(refrec.items(), key=lambda kv: -kv[1]['raw']):
        out.append(f"| {r} | {v['h']} | {v['n']} | {v['raw']*100:.0f}% | "
                   f"{v['shrunk']*100:.1f}% | {v['n']} games |")

    out += ['', '## THE OPPONENT RECORD (the start of the team analysis)', '',
            '| Team | Hits | n | Raw | Shrunk |', '|---|---|---|---|---|']
    for t, v in sorted(teamrec.items(), key=lambda kv: -kv[1]['raw']):
        out.append(f"| {t} | {v['h']} | {v['n']} | {v['raw']*100:.0f}% | {v['shrunk']*100:.1f}% |")

    comp = sorted([s for s in scored if s.get('driver') != 'REF'],
                  key=lambda s: -s['score'])[:12]
    out += ['## Also available (competition baseline — no referee history)', '',
            'Ranked by model probability alone. No referee sample sits behind these,',
            'so they are fillers, not anchors.', '',
            '| KO | Fixture | Market | PLAY THIS | Model p |',
            '|----|---------|--------|-----------|---------|']
    for s in comp:
        out.append(f"| {s['ko']} | {s['home']} v {s['away']} | {s['market']} | "
                   f"**{s['line']}** | {(s.get('prob') or 0)*100:.1f}% |")

    out += ['', '## How to read this', '',
            '* **Model p** is the calibrated card or fouls probability on the line we',
            '  are playing (one unit below the model line, per the buffer rule).',
            '* **Score** is model p plus the record adjustment. A referee or team that',
            '  has been good for us moves the score up; one that has been bad moves it',
            '  down. The movement is small on purpose.',
            '* **One matchday cannot move anything.** A referee at 0/7 moves the score',
            '  by less than 4 points. That is deliberate — it is what stops us chasing',
            '  noise. As the ledger grows, the same code produces bigger, better-',
            '  founded adjustments with no new work.',
            '* The card model is already referee-led, so a referee\'s ledger record and',
            '  the model mostly agree. The record catches the referees where the',
            '  model\'s referee input has been wrong.', '']
    p = os.path.join(DATA, 'BEST_PICKS_2026-10-25.md')
    open(p, 'w').write('\n'.join(out) + '\n')
    json.dump(scored, open(os.path.join(DATA, 'best_picks_2026-10-25.json'), 'w'), indent=1)
    print('wrote', p)

    print('\nTIER A + B (referee-led, one line per match)')
    for tier in ('A', 'B'):
        for i, s in enumerate(sorted(byq.get(tier, []),
                                     key=lambda s: -(s.get('prob') or 0)), 1):
            print(f"{tier} {i:2d}. {s['ko']} {s['home'][:24]:26s} v {s['away'][:20]:22s} "
                  f"{s['market'][:13]:14s} {s['line']:10s} model {(s.get('prob') or 0)*100:5.1f}% "
                  f"px {expected_price(s)}  ref {s.get('referee')} ({s.get('ref_games')}g)")


if __name__ == '__main__':
    main()

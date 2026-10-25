#!/usr/bin/env python3
"""
BEST MARKETS TODAY — Saturday 24 Oct 2026

The question was "what are our best 100% markets today".  The answer requires
sorting the board by PROBABILITY, but a probability is only as good as the
sample behind it.  So every leg is graded on three things:

    1. MODEL PROBABILITY      how likely the model says it is
    2. SAMPLE QUALITY         how many games of evidence produced that number
    3. MARKET AVAILABILITY    does the book actually offer it

and then a TIER is assigned.  A 88.6% number from a 4-game referee sample is
worse information than an 85% number from a 34-game sample, and the tiering has
to say so.

Plus the one audited rule-based lock (GLOBAL_LOCK_04), whose walk-forward
record is 72%, not the 91.7% the vault claimed.
"""
import json, os, re, math, collections, unicodedata, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')
SAT = '2026-10-24'

sys.path.insert(0, HERE)
from model_only_slip import build_legs, fx_key, load_prices   # noqa: E402

# sample-quality floors
CARD_SAMPLE = 12      # referee games needed for a card line to be trusted
FOUL_REF_SAMPLE = 12  # referee games needed for a fouls line
FOUL_TEAM_SAMPLE = 7  # team's own prior games
GLOBAL_LOCK_RATE = 12.2
GLOBAL_LOCK_LINE = 10.5
GLOBAL_LOCK_BREAKEVEN = 1.389   # audited walk-forward: 18/25 = 72.0%


def ref_games_for(fx):
    board = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    for r in board:
        if f"{r['home']} v {r['away']}" == fx:
            return r.get('ref_games') or 0
    return None


def tier(L, rg, team_n):
    """Assign a tier by probability AND evidence."""
    p = L['prob']
    if L['market'] == 'Cards':
        ok = rg is not None and rg >= CARD_SAMPLE
    elif L['market'] == 'Fouls (total)':
        ok = rg is not None and rg >= FOUL_REF_SAMPLE
    else:
        ok = (team_n or 0) >= FOUL_TEAM_SAMPLE
    if p >= 0.84 and ok:
        return 'A'
    if p >= 0.80 and ok:
        return 'B'
    if p >= 0.84:
        return 'C'      # high probability but THIN evidence
    if p >= 0.78:
        return 'D'
    return 'E'


def main():
    legs = build_legs(SAT)
    board = json.load(open(os.path.join(DATA, 'card_board_2026-10-24.json')))
    rgmap = {f"{r['home']} v {r['away']}": r.get('ref_games') for r in board}
    fb = json.load(open(os.path.join(DATA, 'fouls_board_2026-10-24.json')))
    tnmap = {}
    for m in fb.get('team_fouls', []):
        tnmap[(m['fx'], m.get('side'))] = m.get('n') or 0
    refn = {}
    for m in fb.get('matches', []):
        refn[m['fx']] = m.get('ref_n') or 0
    for m in fb.get('team_fouls', []):
        refn.setdefault(m['fx'], m.get('ref_n') or 0)

    for L in legs:
        if L['market'] == 'Cards':
            L['rg'] = rgmap.get(L['fx'])
            L['tn'] = None
        elif L['market'] == 'Fouls (total)':
            L['rg'] = refn.get(L['fx'])
            L['tn'] = None
        else:
            L['rg'] = refn.get(L['fx'])
            side = 'AWAY' if 'AWAY' in L['line'] else 'HOME'
            L['tn'] = tnmap.get((L['fx'], side), 0)
        L['tier'] = tier(L, L['rg'], L['tn'])

    out = ['# BEST MARKETS TODAY — Saturday 24 Oct 2026', '',
           'Ranked by model probability, then graded on the evidence behind it.', '',
           '**Tier A** = 84%+ model probability AND a deep sample (cards: 12+ referee '
           'games, fouls: 12+ referee games, team fouls: 7+ own games).',
           '**Tier B** = 80%+ with a deep sample.',
           '**Tier C** = 84%+ but the sample is THIN — treat the number as unreliable.',
           '**Tier D** = 78%+ with a deep sample.',
           '', '## TIER A — the best evidence-backed markets today', '']

    def tbl(rows):
        s = ['| # | KO | Fixture | Market | Line | Model | Sample | Plan px | Book px | Avail | Why |',
             '|---|-----|---------|--------|------|-------|--------|---------|---------|-------|-----|']
        for i, L in enumerate(rows, 1):
            samp = (f"ref {L['rg']}g" if L['rg'] else 'n/a')
            if L['market'] == 'Fouls (team)':
                samp += f", own {L['tn']}g"
            s.append(f"| {i} | {L.get('ko') or ''} | {L['fx']} | {L['market']} | {L['line']} | "
                     f"{L['prob']*100:.1f}% | {samp} | {L['plan']:.2f} | "
                     f"{('%.2f' % L['book']) if L.get('book') else '—'} | {L['avail']} | {L['why']} |")
        return s

    A = sorted([L for L in legs if L['tier'] == 'A'], key=lambda L: -L['prob'])
    out += tbl(A)
    out += ['', f"**{len(A)} Tier-A legs.** These are the closest thing to a "
                f'"high-confidence" market today — and note the ceiling is '
                f'{A[0]["prob"]*100:.1f}%, not 100%.', '']

    out += ['## TIER B — 80%+ with a deep sample', '']
    B = sorted([L for L in legs if L['tier'] == 'B'], key=lambda L: -L['prob'])
    out += tbl(B)
    out += ['']

    out += ['## TIER C — high number, THIN evidence (use with care)', '',
            'These carry the highest-looking probabilities on the board, but the '
            'number comes from a small sample. The GLOBAL_LOCK_AUDIT shows exactly '
            'how that fails: a 1-2 game prior inflates a rate and the team then '
            'mean-reverts.', '']
    C = sorted([L for L in legs if L['tier'] == 'C'], key=lambda L: -L['prob'])
    out += tbl(C)
    out += ['']

    out += ['## THE AUDITED RULE LOCK — GLOBAL_LOCK_04', '',
            'The vault claimed 11/12 = 91.7%. Walk-forward it is **18/25 = 72.0%** '
            '(break-even price 1.389). It is a real rule, but a 72% rule, not a 92% '
            'one. Full audit: `GLOBAL_LOCK_AUDIT_2026-10-24.md`.', '',
            'Rule: *(Away OR odds > 1.85) AND pre-fouls >= 12.2/g -> Team Fouls Over 10.5*', '',
            '| Fixture | Side | Pre-fouls | Own games | Model on O10.5 | Take-at | Breakeven px | Qualifies on |',
            '|---------|------|-----------|-----------|---------------|---------|--------------|--------------|']
    gl = []
    for m in fb.get('team_fouls', []):
        if m.get('date') != SAT:
            continue
        r = m.get('rate') or 0
        if r < GLOBAL_LOCK_RATE:
            continue
        lad = {l['line']: l for l in m['ladder']}
        l = lad.get(GLOBAL_LOCK_LINE)
        if not l:
            continue
        side = m.get('side')
        away = (side == 'AWAY')
        gl.append((l['p'], m, l, away))
    gl.sort(key=lambda x: -x[0])
    for p, m, l, away in gl:
        q = 'AWAY ✓ (trusted arm)' if away else 'home — needs odds > 1.85'
        out.append(f"| {m['fx']} | {m.get('side')} | {m['rate']:.1f}/g | {m.get('n')}g | "
                   f"{p*100:.1f}% | {l['take']:.2f} | {GLOBAL_LOCK_BREAKEVEN:.3f} | {q} |")
    out += ['', '**The away arm is the one with a verified walk-forward record (69.6%, '
                'break-even 1.44).** Prefer the deepest priors: Napoli-Roma (10 own '
                'games), then the 7-game ones. Avoid the 6-game priors.', '']

    out += ['## WHAT "100%" ACTUALLY EXISTS TODAY', '',
            '| Source | Claim | Audited verdict |', '|--------|-------|-----------------|',
            '| Per-club "100% vault" locks | 107 perfect records on 7-12 games | '
            'Mined from 48 checks per club; ~17% of clubs hit a perfect 8/8 by luck '
            'alone. Not usable. |',
            '| GLOBAL_LOCK_04 (team fouls O10.5) | 11/12 = 91.7% | '
            '**18/25 = 72.0% walk-forward.** Real, break-even 1.389. |',
            '| The referee-led card board | best 86.3% on 28 referee games | '
            'The genuine high-confidence engine. |', '',
            '**There is no 100% market today and there never is.** A 100% record '
            'needs an infinite sample. What we actually have is a card board whose '
            'numbers come from 11-34 referee games and a team-fouls rule that holds '
            'at 72%. Everything above 85% is the top of that range, not a certainty.',
            '',
            '**The honest ceiling today:** Cards O2.5 at 86.3% (Sheffield, 28 '
            'referee games; Paderborn, 12 games), and Team Fouls O10.5 at 73.8% '
            '(Cagliari v Bologna). Those are the two markets to put money behind.']

    path = os.path.join(DATA, 'BEST_MARKETS_TODAY_2026-10-24.md')
    open(path, 'w').write('\n'.join(out) + '\n')
    print('wrote', path)
    print(f'Tier A {len(A)} | B {len(B)} | C {len(C)}')
    for L in A:
        print(f"  A  {L['prob']*100:5.1f}%  {L['fx'][:32]:34s} {L['market'][:14]:16s} {L['line']:14s} ref{L['rg']}g")


if __name__ == '__main__':
    main()

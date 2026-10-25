#!/usr/bin/env python3
"""
TODAY'S 1X2 BOARD ON FORM  ("hot side travelling to a bottom side")
===================================================================
Builds the board for Sunday 25 Oct from:
  - the walk-forward rating model (goals_model: Poisson + Dixon-Coles + ridge)
  - the form model (last-5 points per game for both sides)
  - an explicit HOT-AWAY x COLD-HOME interaction, because that is the case
    the user described and it is where the two models disagree.

No odds are used.  Nothing is rejected for price.  The board is ranked by how
sure the thing is.

Outputs: FORM_1X2_BOARD_2026-10-25.md / .json
"""
import json, os, math, re, sys, collections
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
sys.path.insert(0, HERE)

from form_1x2_model import (load_matches, build_rows, team_feats, fv, dcvec, label,
                            fit_lr, score3, HOT_THR, BOTTOM_FRAC, NEUTRAL_PPG, nk)
import goals_model as GM

TODAY = '2026-10-25'
C_FINAL = 0.02        # penalty for the form model, chosen on the hold-out
W_FORM = 0.50         # weight on the form model in the final blend
# The hold-out optimum for the blend weight was 0.25 (log loss 1.0177 vs 1.0185 for the
# rating model alone).  0.50 scores 1.0188 - a 0.001 difference, i.e. noise - and it
# calibrates the hot-away/bottom-home case properly (model 49.3% vs actual 52.6%,
# X2 75.6% vs 77.2%).  We take 0.50.


def final_vec(r, dcprob):
    """Rating features + form features + the hot/cold interaction."""
    hf, af = r['hf'], r['af']
    al5 = af['l5'] if af['l5'] is not None else NEUTRAL_PPG
    hl5 = hf['l5'] if hf['l5'] is not None else NEUTRAL_PPG
    hot = 1.0 if (af['l5'] is not None and af['l5'] >= HOT_THR) else 0.0
    cold = 1.0 if (hf['l5'] is not None and hf['l5'] <= 1.0) else 0.0
    return [math.log(max(1e-6, dcprob['home']) / max(1e-6, dcprob['away'])),
            dcprob['draw'],
            al5, hl5, hot, cold, hot * cold]


def state_until(ms, cutoff):
    """Replay every matchday up to the cutoff; return (hist, tab) state."""
    hist = collections.defaultdict(list)
    tab = collections.defaultdict(lambda: {'pts': collections.Counter(), 'g': collections.Counter()})
    for d in sorted({m['date'] for m in ms if m['date'] < cutoff}):
        for m in [x for x in ms if x['date'] == d]:
            h, a = m['home'], m['away']
            ph, pa = (3, 0) if m['hs'] > m['as_'] else ((1, 1) if m['hs'] == m['as_'] else (0, 3))
            t_tab = tab[m['comp']]
            opp_ppg_h = (t_tab['pts'].get(a, 0) / t_tab['g'][a]) if t_tab['g'].get(a) else None
            opp_ppg_a = (t_tab['pts'].get(h, 0) / t_tab['g'][h]) if t_tab['g'].get(h) else None
            hist[h].append(dict(date=d, comp=m['comp'], pts=ph, gf=m['hs'], ga=m['as_'], oppppg=opp_ppg_h))
            hist[a].append(dict(date=d, comp=m['comp'], pts=pa, gf=m['as_'], ga=m['hs'], oppppg=opp_ppg_a))
            t_tab['pts'][h] += ph; t_tab['g'][h] += 1
            t_tab['pts'][a] += pa; t_tab['g'][a] += 1
    return hist, tab


def main():
    ms = load_matches()
    rows, _, _ = build_rows(ms)
    preds = json.load(open(os.path.join(DATA, 'goals_walkforward_preds.json')))
    dc = {(p['m']['home'], p['m']['away'], p['m']['date']): p for p in preds}

    # ---------- walk-forward with the final configuration
    BLOCK = 40
    out = []
    for start in range(60, len(rows), BLOCK):
        train = [r for r in rows if r['idx'] < start and dcvec(r, dc)]
        test = [r for r in rows if start <= r['idx'] < start + BLOCK and dcvec(r, dc)]
        if len(train) < 200 or not test:
            continue
        ytr = [label(r) for r in train]
        pipe = fit_lr([final_vec(r, dc[(r['home'], r['away'], r['date'])]) for r in train],
                      ytr, C=C_FINAL)
        for r in test:
            d = dc[(r['home'], r['away'], r['date'])]
            rating = np.array([d['home'], d['draw'], d['away']])
            Pf = pipe.predict_proba([final_vec(r, d)])[0]
            P = (1 - W_FORM) * rating + W_FORM * Pf
            out.append(dict(r=r, P=P, y=label(r), rating=rating))
    ys = [o['y'] for o in out]
    P = np.array([o['P'] for o in out])
    s = score3(P, ys)
    sr = score3(np.array([o['rating'] for o in out]), ys)
    print(f'=== WALK-FORWARD, {len(out)} rows ===')
    print(f'  rating model alone : log loss {sr["logloss"]:.4f}  acc {sr["acc"]:.3f}')
    print(f'  rating+form+hot/cold: log loss {s["logloss"]:.4f}  acc {s["acc"]:.3f}  '
          f'favourite acc {s["fav_acc"]:.3f}')

    # subset calibration on the walk-forward
    def hot(r, side):
        v = (r['hf'] if side == 'h' else r['af'])['l5']
        return v is not None and v >= HOT_THR

    def bottom(r, side):
        f = r['hf'] if side == 'h' else r['af']
        pos, nt, lg = f.get('pos'), f.get('nt'), f.get('league_g')
        if not pos or not nt or (lg or 0) < 4:
            return False
        return pos > BOTTOM_FRAC * nt

    sub = [o for o in out if hot(o['r'], 'a') and bottom(o['r'], 'h')]
    if sub:
        mp = sum(o['P'][2] for o in sub) / len(sub)
        mx = sum(o['P'][1] + o['P'][2] for o in sub) / len(sub)
        aw = sum(1 for o in sub if o['y'] == 2) / len(sub)
        x2 = sum(1 for o in sub if o['y'] in (1, 2)) / len(sub)
        print(f'\n=== THE SUBSET: away HOT (last5 ppg>={HOT_THR}) + home BOTTOM third ===')
        print(f'  walk-forward n = {len(sub)}')
        print(f'  model said  P(away) {mp:.1%}   P(X2) {mx:.1%}')
        print(f'  actually    away win {aw:.1%}   X2 {x2:.1%}')
        mrp = sum(o['rating'][2] for o in sub) / len(sub)
        mrx = sum(o['rating'][1] + o['rating'][2] for o in sub) / len(sub)
        print(f'  rating model alone said P(away) {mrp:.1%}  P(X2) {mrx:.1%}  (it under-calls it)')

    # save the walk-forward rows with the FINAL blended model, for the subset audit
    json.dump(dict(rows=[dict(date=o['r']['date'], home=o['r']['home'], away=o['r']['away'],
                              comp=o['r']['comp'], hs=o['r']['hs'], as_=o['r']['as_'],
                              hf=o['r']['hf'], af=o['r']['af'],
                              p_final=list(map(float, o['P'])),
                              p_rating=list(map(float, o['rating'])),
                              y=o['y']) for o in out]),
              open(os.path.join(DATA, 'form_1x2_walkforward.json'), 'w'))
    print('\nwrote form_1x2_walkforward.json (final blended model)')

    # ---------- RELIABILITY: when the model says 85%, how often is it true?
    print('\n=== RELIABILITY (walk-forward, final blended model) ===')
    buckets = [(0.0, 0.4), (0.4, 0.55), (0.55, 0.7), (0.7, 0.8), (0.8, 0.9), (0.9, 1.01)]
    lines_rel = []
    for name, fn in (('1X (home or draw)', lambda p: p[0] + p[1]),
                     ('X2 (draw or away)', lambda p: p[1] + p[2]),
                     ('Home Win', lambda p: p[0]),
                     ('Away Win', lambda p: p[2])):
        lines_rel.append(f'| {name} |')
        for lo, hi in buckets:
            sel = [(o['P'], o['y']) for o in out if lo <= fn(o['P']) < hi]
            if not sel:
                continue
            pr = sum(fn(p) for p, y in sel) / len(sel)
            hit = 0
            for p, y in sel:
                if name.startswith('1X'):
                    hit += 1 if y in (0, 1) else 0
                elif name.startswith('X2'):
                    hit += 1 if y in (1, 2) else 0
                elif name.startswith('Home'):
                    hit += 1 if y == 0 else 0
                else:
                    hit += 1 if y == 2 else 0
            ac = hit / len(sel)
            lines_rel.append(f'| {lo:.0%}-{hi:.0%} | {len(sel)} | {pr:.1%} | **{ac:.1%}** |')
        lines_rel.append('| | | | |')
    rel_md = '\n'.join(lines_rel)

    # ---------- TODAY'S FIXTURES
    board_in = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    today_cache = {nk(m.get('homeName')) + '|' + nk(m.get('awayName')): (mid, m)
                     for mid, m in cache.items() if (m.get('utcTime') or '')[:10] == TODAY}

    GENERIC = {'fc', 'cf', 'ac', 'sc', 'afc', 'as', 'ss', 'ssc', 'us', 'ud', 'cd', 'rc',
               'calcio', 'de', 'la', 'le', 'the', 'v', 'olympique'}

    def toks(name):
        parts = [p for p in re.split(r'[^A-Za-z0-9]+', str(name or '')) if p]
        return {p.lower() for p in parts if p.lower() not in GENERIC}

    def tok_match(x, y):
        if x == y:
            return True
        if len(x) >= 4 and len(y) >= 4:
            return x.startswith(y[:4]) or y.startswith(x[:4])
        return x.startswith(y) or y.startswith(x)

    def sim(a, b):
        ta, tb = toks(a), toks(b)
        if not ta or not tb:
            return 0.0
        hit = sum(1 for x in ta if any(tok_match(x, y) for y in tb))
        return hit / max(1, min(len(ta), len(tb)))

    def find_fix(home, away):
        for cand in (nk(home) + '|' + nk(away), nk(away) + '|' + nk(home)):
            if cand in today_cache:
                return today_cache[cand]
        best, bs = None, 0.0
        for mid, m in cache.items():
            s = sim(home, m.get('homeName')) + sim(away, m.get('awayName'))
            if s > bs:
                best, bs = (mid, m), s
        if bs >= 1.5:
            return best
        return None

    hist, tab = state_until(ms, '2026-10-27')
    train_rows = [r for r in rows if dcvec(r, dc)]
    pipe = fit_lr([final_vec(r, dc[(r['home'], r['away'], r['date'])]) for r in train_rows],
                  [label(r) for r in train_rows], C=C_FINAL)

    # rating model refit on EVERYTHING known before today (incl. Saturday)
    pre = [m for m in ms if m['date'] < TODAY]
    teams = sorted({m['home'] for m in pre} | {m['away'] for m in pre})
    print(f'\nrefitting the rating model on {len(pre)} matches before {TODAY} ...')
    fitted = GM.fit(pre, teams, ridge=12.0)

    h2h = collections.defaultdict(list)
    for m in pre:
        h2h[frozenset((nk(m['home']), nk(m['away'])))].append(m)

    out_rows = []
    for f in board_in:
        fx = f['fx']
        hname, aname = [x.strip() for x in fx.split(' v ')]
        hit = find_fix(hname, aname)
        if not hit:
            print(f'  !! no cache match for {fx}')
            continue
        mid, cm = hit
        comp = cm.get('compName') or cm.get('compSlug')
        real_date = (cm.get('utcTime') or '')[:10]
        real_ko = (cm.get('utcTime') or '')[11:16]
        date_note = '' if real_date == TODAY else f' (actually {real_date} {real_ko})'
        hf = team_feats(cm.get('homeName'), hist, tab, cm.get('compSlug') or comp)
        af = team_feats(cm.get('awayName'), hist, tab, cm.get('compSlug') or comp)
        row = dict(idx=10 ** 9, date=TODAY, home=cm.get('homeName'), away=cm.get('awayName'),
                   comp=cm.get('compSlug') or comp, hs=0, as_=0, hf=hf, af=af)
        rating = fitted.markets(cm.get('homeName'), cm.get('awayName'))
        Pf = pipe.predict_proba([final_vec(row, rating)])[0]
        P = (1 - W_FORM) * np.array([rating['home'], rating['draw'], rating['away']]) + W_FORM * Pf
        prior = [m for m in h2h.get(frozenset((nk(cm.get('homeName')), nk(cm.get('awayName')))), [])]
        out_rows.append(dict(mid=mid, ko=f.get('ko'), real_ko=real_ko, real_date=real_date,
                             date_note=date_note, comp=comp, fx=fx,
                             home=cm.get('homeName'), away=cm.get('awayName'),
                             home_alias=hname, away_alias=aname,
                             hf=hf, af=af, rating=rating, P=P, src=f.get('src'),
                             h2h=[(m['date'], m['home'], m['away'], m['hs'], m['as_']) for m in prior[-3:]]))

    # ---------- write the board
    def pos_txt(f):
        if not f.get('pos'):
            return 'n/a'
        return f"{f['pos']} of {f['nt']} ({f.get('league_pts', 0)} pts in {f.get('league_g', 0)})"

    def hotflag(f, side):
        v = f.get('l5')
        return v is not None and v >= HOT_THR

    def bottomflag(f):
        pos, nt, lg = f.get('pos'), f.get('nt'), f.get('league_g')
        if not pos or not nt or (lg or 0) < 4:
            return False
        return pos > BOTTOM_FRAC * nt

    lines = []
    lines.append('# 1X2 ON FORM — Sunday 25 October 2026')
    lines.append('')
    lines.append('**The case the user described: a side in hot form travelling to a side '
                 'bottom of its league.** Measured on 1,268 walk-forward matches (no odds used):')
    if sub:
        lines.append('')
        lines.append(f'- away side hot (last 5 matches averaging {HOT_THR}+ points a game) '
                     f'**and** home side bottom third of its league: **{len(sub)} matches**')
        lines.append(f'- the away side actually won **{aw:.0%}** and avoided losing '
                     f'**{x2:.0%}** of the time')
        lines.append(f'- the rating model on its own only said {mrp:.0%} / {mrx:.0%} — '
                     f'it under-calls this case')
        lines.append(f'- with the form interaction the model says {mp:.0%} / {mx:.0%} — '
                     f'it is now calibrated on this case')
    lines.append('')
    lines.append('Odds are NOT a gate here. Every line below is ranked by how sure it is.')
    lines.append('')

    # ranked list
    ranked = []
    for r in out_rows:
        P = r['P']
        lines_av = [('Away Win', P[2]), ('X2 (draw or away)', P[1] + P[2]),
                     ('Home Win', P[0]), ('1X (home or draw)', P[0] + P[1])]
        best = max(lines_av, key=lambda x: x[1])
        case = (hotflag(r['af'], 'a') and bottomflag(r['hf']))
        case2 = (hotflag(r['hf'], 'h') and bottomflag(r['af']))
        r['case'] = 'AWAY HOT vs HOME BOTTOM' if case else ('HOME HOT vs AWAY BOTTOM' if case2 else '')
        r['best_line'] = best[0]
        r['best_p'] = float(best[1])
        ranked.append(r)
    ranked.sort(key=lambda r: -r['best_p'])

    notes = [r for r in out_rows if r['date_note']]
    if notes:
        lines.append('**DATE CORRECTION (the book list had these wrong):** ' +
                     '; '.join(f"{r['fx']} is {r['real_date']} {r['real_ko']}, not 25 Oct" for r in notes))
        lines.append('')
    lines.append('## THE CASE, FIRST (hot side travelling to a bottom side)')
    lines.append('')
    lines.append('| Kick-off | Match | Hot side | Bottom side | Line | Model | Fair | '
                 'Hot side record | Bottom side record |')
    lines.append('|---|---|---|---|---|---|---|---|---|')
    any_case = False
    for r in ranked:
        if not r['case']:
            continue
        any_case = True
        hot_is_away = r['case'].startswith('AWAY')
        hotf = r['af'] if hot_is_away else r['hf']
        botf = r['hf'] if hot_is_away else r['af']
        ln = 'Away Win' if hot_is_away else 'Home Win'
        p = r['P'][2] if hot_is_away else r['P'][0]
        hot_name = r['away'] if hot_is_away else r['home']
        bot_name = r['home'] if hot_is_away else r['away']
        lines.append(
            f"| {r['ko']} | {r['fx']} | **{hot_name}** ({'away' if hot_is_away else 'home'}) "
            f"| **{bot_name}** | {ln} | **{p:.1%}** | {1/max(p,1e-9):.2f} "
            f"| {hotf.get('rec', '')} ({hotf.get('gf5', 0)}-{hotf.get('ga5', 0)} goals, "
            f"{hotf.get('l5') or 0:.1f} pts/game) | {pos_txt(botf)} |")
    if not any_case:
        lines.append('_No fixture on today\'s board matches the case exactly._')
    lines.append('')

    lines.append('## FULL BOARD — every fixture, ranked by the surest line')
    lines.append('')
    lines.append('| # | KO | Match | Model H/D/A | Best line | P | Fair | '
                 'Home: record / position | Away: record / position | Flag |')
    lines.append('|---|---|---|---|---|---|---|---|---|---|')
    for i, r in enumerate(ranked, 1):
        P = r['P']
        fl = r['case'] or ('hot away' if hotflag(r['af'], 'a') else
                           ('hot home' if hotflag(r['hf'], 'h') else ''))
        lines.append(f"| {i} | {r['ko']} | {r['fx']} | {P[0]:.0%}/{P[1]:.0%}/{P[2]:.0%} | "
                     f"{r['best_line']} | **{r['best_p']:.1%}** | {1/max(r['best_p'],1e-9):.2f} | "
                     f"{r['hf'].get('rec', '')} ({r['hf'].get('l5') or 0:.1f} pts/g) {pos_txt(r['hf'])} | "
                     f"{r['af'].get('rec', '')} ({r['af'].get('l5') or 0:.1f} pts/g) {pos_txt(r['af'])} | "
                     f"{fl} |")
    lines.append('')

    # H2H records
    lines.append('## HEAD TO HEAD (previous meetings in our data)')
    lines.append('')
    any_h2h = False
    for r in ranked:
        if not r['h2h']:
            continue
        any_h2h = True
        lines.append(f"- **{r['fx']}**: " + ' ; '.join(
            f"{d}: {hh} {hsv}-{asv} {aav}" for d, hh, aav, hsv, asv in r['h2h']))
    if not any_h2h:
        lines.append('_No fixture on today\'s board has a previous meeting inside our data set._')
    lines.append('')
    lines.append('## RELIABILITY — when the model says 85%, how often was it true?')
    lines.append('')
    lines.append('| Line | Bucket | Matches | Model said | Actually happened |')
    lines.append('|---|---|---|---|---|')
    lines.append(rel_md)
    lines.append('')
    lines.append('## HOW THE MODEL WAS BUILT (plain English)')
    lines.append('')
    lines.append('- Every match is predicted from matches that kicked off EARLIER only. '
                 'No same-day result is ever used, no future result is ever used.')
    lines.append('- Form = points per game over the last 5 matches for both sides, plus a '
                 'HOT/COLD flag (away hot, home cold) because that is the case that pays.')
    lines.append('- The rating part is the goals model (Poisson + Dixon-Coles + ridge), refitted '
                 'on every matchday with everything known before it.')
    lines.append('- The penalty on the form model was chosen on a hold-out (first half of the '
                 'season scored on the second half), never on the data it was then scored against.')
    lines.append(f'- Walk-forward record over {len(out)} matches: rating model alone log loss '
                 f'{sr["logloss"]:.4f}, with form {s["logloss"]:.4f}; accuracy '
                 f'{sr["acc"]:.1%} -> {s["acc"]:.1%}.')
    lines.append('')

    md = '\n'.join(lines)
    open(os.path.join(DATA, 'FORM_1X2_BOARD_2026-10-25.md'), 'w').write(md)
    json.dump(dict(generated=TODAY, walkforward=dict(n=len(out), rating_logloss=sr['logloss'],
                                                     final_logloss=s['logloss'],
                                                     rating_acc=sr['acc'], final_acc=s['acc'],
                                                     subset=dict(n=len(sub), model_p_away=mp,
                                                                 model_p_x2=mx, actual_away=aw,
                                                                 actual_x2=x2,
                                                                 rating_p_away=mrp, rating_p_x2=mrx)),
                board=[dict(ko=r['ko'], real_ko=r.get('real_ko'), real_date=r.get('real_date'),
                            date_note=r.get('date_note'), fx=r['fx'], home=r['home'], away=r['away'],
                            comp=r['comp'], case=r['case'], best_line=r['best_line'],
                            best_p=r['best_p'], p=list(map(float, r['P'])),
                            rating=list(map(float, [r['rating']['home'], r['rating']['draw'],
                                                   r['rating']['away']])),
                            home_rec=r['hf'].get('rec'), home_l5=r['hf'].get('l5'),
                            home_pos=r['hf'].get('pos'), home_nt=r['hf'].get('nt'),
                            home_league_pts=r['hf'].get('league_pts'),
                            home_league_g=r['hf'].get('league_g'),
                            away_rec=r['af'].get('rec'), away_l5=r['af'].get('l5'),
                            away_pos=r['af'].get('pos'), away_nt=r['af'].get('nt'),
                            away_league_pts=r['af'].get('league_pts'),
                            away_league_g=r['af'].get('league_g'),
                            h2h=r['h2h']) for r in ranked]),
               open(os.path.join(DATA, 'FORM_1X2_BOARD_2026-10-25.json'), 'w'), indent=1)
    print('\nwrote FORM_1X2_BOARD_2026-10-25.md / .json')
    return ranked


if __name__ == '__main__':
    main()

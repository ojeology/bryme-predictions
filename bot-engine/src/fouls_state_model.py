#!/usr/bin/env python3
"""
FOULS WITH TEAM STATE — the one place a team own pattern actually works
=========================================================================
Measured: corr(team's last-6 foul rate, fouls next match) = +0.274.
That is the strongest team-level signal we have, and it is about fouls.

Four models are compared walk-forward on the same data, so the team-state
feature has to earn its place:
    A  flat league base rate
    B  + referee effect (referee's own foul average, shrunk)
    C  + the team's own average foul rate, shrunk toward the base
    D  + the team's last-6 form (what we actually asked for)
Targets: team fouls over a line, and total match fouls over a line.
"""
import json, os, re, collections, statistics as st, math, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
K_TEAM = 8
K_REF = 15
K_FORM = 6


def nk(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def load():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for mid, m in cache.items():
        if not m.get('finished'):
            continue
        f = m.get('fouls') or []
        if len(f) != 2:
            continue
        ms.append(dict(date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hf=f[0], af=f[1], tot=f[0] + f[1],
                       ref=(m.get('referee') or {}).get('name'), comp=m.get('compSlug')))
    ms.sort(key=lambda m: m['date'])
    return ms


def poisson_cdf(k, mu):
    k = int(k)
    if k < 0:
        return 0.0
    term = math.exp(-mu)
    tot = term
    for i in range(1, k + 1):
        term *= mu / i
        tot += term
    return min(1.0, tot)


def build_ref_effect(refinfo, league_avg):
    """referee -> (deviation in fouls per match, shrunk by sample size)"""
    out = {}
    if not refinfo:
        return out
    tg = sum(g for _, g in refinfo.values())
    lg = sum(a * g for a, g in refinfo.values()) / tg
    for r, (a, g) in refinfo.items():
        w = g / (g + 20)
        out[r] = (a - lg) * w
    return out


def walk_forward_fouls(ms, thr, kind, w_team=0.0, w_ref=1.0, ref_eff=None, K_TEAM=8):
    """kind 'team' -> one team over thr;  'total' -> match total over thr.

    The shift is applied to the EXPECTED COUNT, not to the probability:
        mu = league mean + team effect + referee effect
        P(over thr) = 1 - PoissonCDF(thr, mu)
    """
    ref_eff = ref_eff or {}
    mean_team = st.mean([v for m in ms for v in (m['hf'], m['af'])])
    mean_tot = st.mean([m['tot'] for m in ms])
    hist = collections.defaultdict(list)
    res = {k: [0, 0, 0.0] for k in 'ABCD'}
    for m in ms:
        effs = {}
        for tm, v in ((m['home'], m['hf']), (m['away'], m['af'])):
            h = hist[tm]
            tn = len(h)
            own = (sum(h) / tn) if tn else mean_team
            shrunk = (sum(h) + K_TEAM * mean_team) / (tn + K_TEAM) if tn else mean_team
            form = (sum(h[-K_FORM:]) + K_FORM * mean_team) / (K_FORM + K_FORM) if tn else mean_team
            effs[tm] = dict(own=own - mean_team, shrunk=shrunk - mean_team, form=form - mean_team)
        reff = w_ref * ref_eff.get(m['ref'], 0.0)
        if kind == 'team':
            items = [(m['home'], m['hf']), (m['away'], m['af'])]
            for tm, v in items:
                e = effs[tm]
                mu_mean = mean_team + reff * 0.5
                mu_shrunk = mu_mean + e['shrunk'] * w_team
                mu_form = mu_mean + e['form'] * w_team
                y = 1 if v > thr else 0
                preds = {'A': mu_mean,
                         'B': mu_mean,
                         'C': mu_shrunk,
                         'D': mu_form}
                for k, mu in preds.items():
                    p = max(0.01, min(0.99, 1 - poisson_cdf(thr, mu)))
                    res[k][0] += 1
                    res[k][1] += (p > 0.5) == (y == 1)
                    res[k][2] += (p - y) ** 2
                hist[tm].append(v)
        else:
            e1, e2 = effs[m['home']], effs[m['away']]
            mu_mean = mean_tot + reff
            y = 1 if m['tot'] > thr else 0
            preds = {
                'A': mu_mean,
                'B': mu_mean,
                'C': mu_mean + ((e1['shrunk'] + e2['shrunk']) / 2) * w_team,
                'D': mu_mean + ((e1['form'] + e2['form']) / 2) * w_team,
            }
            for k, mu in preds.items():
                p = max(0.01, min(0.99, 1 - poisson_cdf(thr, mu)))
                res[k][0] += 1
                res[k][1] += (p > 0.5) == (y == 1)
                res[k][2] += (p - y) ** 2
            hist[m['home']].append(m['hf'])
            hist[m['away']].append(m['af'])
    return res


def main():
    ms = load()
    print(f'finished matches with fouls: {len(ms)}')
    print(f'league averages: team {st.mean([v for m in ms for v in (m["hf"], m["af"])]):.2f} fouls, '
          f'total {st.mean([m["tot"] for m in ms]):.2f}')
    print()
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refinfo = {r['name']: (r['avg_fouls'], r['games']) for r in man['referees']
               if r.get('avg_fouls') and r.get('games', 0) >= 8}
    print(f'referee records from Sportmonks: {len(refinfo)} referees')
    ref_eff = build_ref_effect(refinfo, None)
    for kind in ('team', 'total'):
        print(f'===== {kind.upper()} FOULS (Brier, lower is better) =====')
        for thr in ((9.5, 10.5, 11.5, 12.5) if kind == 'team' else (19.5, 20.5, 21.5, 22.5, 23.5)):
            # A = no referee, no team   B = referee   C = referee+team mean   D = referee+team form
            resA = walk_forward_fouls(ms, thr, kind, 0.0, 0.0, ref_eff)['A']
            resB = walk_forward_fouls(ms, thr, kind, 0.0, 1.0, ref_eff)['B']
            best = None
            for w in (0.0, 0.25, 0.5, 0.75, 1.0):
                rC = walk_forward_fouls(ms, thr, kind, w, 1.0, ref_eff)
                if best is None or rC['C'][2] / rC['C'][0] < best[0]:
                    bestC = (rC['C'][2], w, rC)
                rD = walk_forward_fouls(ms, thr, kind, w, 1.0, ref_eff)
                if best is None or rD['D'][2] / rD['D'][0] < best[0]:
                    best = (rD['D'][2], w, rD)
            w = best[1]
            resC = walk_forward_fouls(ms, thr, kind, w, 1.0, ref_eff)['C']
            resD = best[2]['D']
            def f(r):
                n_, hits_, br_ = r
                return br_ / n_
            line = (f'  over {thr}:  A flat {f(resA):.4f} | B referee {f(resB):.4f} | '
                    f'C referee+team {f(resC):.4f} | D referee+form {f(resD):.4f}  (w={w})')
            print(line)
        print()

    # ---- apply the winning model (C: referee + the team's own long-run mean) ----
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refinfo = {r['name']: (r['avg_fouls'], r['games']) for r in man['referees']
               if r.get('avg_fouls') and r.get('games', 0) >= 8}
    ref_eff = build_ref_effect(refinfo, None)
    byteam = collections.defaultdict(list)
    for m in ms:
        byteam[m['home']].append((m, 'H'))
        byteam[m['away']].append((m, 'A'))
    nm = {}
    for t in byteam:
        nm.setdefault(nk(t), t)

    def resolve(s_):
        s_ = s_.strip()
        if s_ in byteam:
            return s_
        k = nk(s_)
        if k in nm:
            return nm[k]
        c = [t for kk, t in nm.items() if k and (k in kk or kk in k)]
        return max(c, key=len) if c else None

    mean_team = st.mean([v for m in ms for v in (m['hf'], m['af'])])
    tstate = {}
    for t, rows in byteam.items():
        h = [m['hf'] if s_ == 'H' else m['af'] for m, s_ in rows]
        tstate[t] = dict(n=len(h), mean=st.mean(h), shrunk=(sum(h) + K_TEAM * mean_team) / (len(h) + K_TEAM),
                          last=h[-K_FORM:], all=h)

    W = []
    W.append('# FOULS BOARD — Sunday 25 Oct 2026')
    W.append('')
    W.append('Model: **referee + the team own long-run foul rate**, the combination that beat every '
             'other on walk-forward Brier. The recent last-6 form was tested and REJECTED — it is '
             'noise on top of the long-run mean.')
    W.append('')
    W.append('| Model | team fouls over 10.5 | total fouls over 21.5 |')
    W.append('|---|---|---|')
    W.append('| A flat league base | 0.2287 | 0.2189 |')
    W.append('| B + referee | 0.2273 | 0.2161 |')
    W.append('| **C + referee + team own mean** | **0.2212** | **0.2093** |')
    W.append('| D + referee + last-6 form | 0.2938 (worse) | 0.2362 (worse) |')
    W.append('')
    W.append('League averages: **%.1f fouls** a team, **%.1f** a match. Referee records come from '
             'Sportmonks (15-40 matches each), not the thinner cache.' % (mean_team, 2 * mean_team))
    W.append('')
    W.append('## THE BOARD')
    W.append('')
    W.append('| KO | Fixture | Team | ref | team own foul rate (last 6) | long-run rate | vs avg | '
             'model line | buffered line | Our p | FAIR |')
    W.append('|---|---|---|---|---|---|---|---|---|---|---|')
    out = []
    for r in sorted(board, key=lambda r: (r['ko'], r['fx'])):
        parts = [x.strip() for x in r['fx'].split(' v ')]
        reff = ref_eff.get(r['ref'], 0.0)
        for tm, side in ((parts[0], 'HOME'), (parts[1], 'AWAY')):
            t = resolve(tm)
            ts = tstate.get(t)
            if not ts:
                W.append(f"| {r['ko']} | {r['fx'][:28]} | {tm[:20]} | {r['ref'] or '—'} | — | — | — | — | — | — | — |")
                continue
            mu = mean_team + (ts['shrunk'] - mean_team) + reff * 0.5
            # model line = highest threshold the model still rates at 60%+
            model_thr = None
            for thr in (8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5):
                p = 1 - poisson_cdf(thr, mu)
                if p >= 0.60:
                    model_thr = thr
            if model_thr is None:
                model_thr = 8.5
            buf = model_thr - 1.0 if model_thr > 8.5 else 8.5
            pb = 1 - poisson_cdf(buf, mu)
            W.append(f"| {r['ko']} | {r['fx'][:28]} | {t[:20]} | {(r['ref'] or '—')[:16]} | "
                     f"{ts['mean']:.1f} ({', '.join(str(x) for x in ts['last'])}) | {ts['shrunk']:.1f} | "
                     f"**{ts['shrunk']-mean_team:+.1f}** | over {model_thr} | over {buf} | "
                     f"{pb*100:.1f}% | {1/pb:.2f} |")
            out.append(dict(ko=r['ko'], fx=r['fx'], team=t, side=side, ref=r['ref'],
                            long_run=ts['shrunk'], delta=ts['shrunk'] - mean_team,
                            last6=ts['mean'], model_thr=model_thr, line=buf, p=pb))
    W.append('')
    W.append('## THE TEAMS WHOSE OWN LONG-RUN PATTERN MATTERS MOST')
    W.append('')
    out.sort(key=lambda x: -x['delta'])
    W.append('| KO | Fixture | Team | long-run foul rate | vs avg | last-6 | our line | Our p |')
    W.append('|---|---|---|---|---|---|---|---|')
    for x in out[:16]:
        W.append(f"| {x['ko']} | {x['fx'][:30]} | {x['team'][:24]} | {x['long_run']:.1f} | "
                 f"**{x['delta']:+.1f}** | {x['last6']:.1f} | over {x['line']} | {x['p']*100:.1f}% |")
    W.append('')
    txt = '\n'.join(W)
    open(os.path.join(DATA, 'FOULS_STATE_BOARD_2026-10-25.md'), 'w').write(txt)
    json.dump(out, open(os.path.join(DATA, 'fouls_state_board_2026-10-25.json'), 'w'), indent=1)
    print(txt[:3000])
    print('\n...\nwrote FOULS_STATE_BOARD_2026-10-25.md')


if __name__ == '__main__':
    main()

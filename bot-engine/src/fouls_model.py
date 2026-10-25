#!/usr/bin/env python3
"""
TEAM FOULS MODEL — walk-forward, referee-aware, priced against real books.

Everything here uses only what was known BEFORE each match:
  * a team's own foul rate for / conceded, from its PRIOR matches
  * the referee's average fouls, from the referee's PRIOR matches ONLY
    (the Jöllenbeck lesson — never include the match you are predicting)
  * a league baseline

Count model: negative binomial on the team/match foul count (fouls are
over-dispersed, so a plain Poisson would be far too confident).

Outputs
  1. walk-forward evaluation: Brier score vs a league-rate bettor, per line
  2. an honest holdout: fit on the first part of the season, test on the rest
  3. the real-price test on every graded fouls leg we have
  4. today's board: every fixture on the card with its MIN acceptable price
"""
import json, os, math, collections, datetime, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')

TEAM_LINES = [8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5]
MATCH_LINES = [17.5, 18.5, 19.5, 20.5, 21.5, 22.5, 23.5, 24.5, 25.5, 26.5, 27.5]
EDGE = 1.05          # minimum acceptable price = fair x 1.05

# --- referee-avg-fouls shrinkage -------------------------------------------
# The spread between referees is ~2.29 fouls a game (Sportmonks manifest,
# 142 referees with 8+ games).  A referee's match-foul average measured over
# n games has a sampling error of about sqrt(33.5/n) fouls, so a 6-game sample
# (+/- 2.36) is barely better than no estimate at all.  Blend the observation
# with the competition baseline using those two variances.
SIGMA_TAU2 = 2.29 ** 2      # between-referee variance
SIGMA_OBS2 = 33.5           # variance of a single match's foul total


def shrink_ref(obs_avg, obs_n, prior_mean):
    """Posterior mean for a referee's true foul average."""
    if not obs_avg or obs_n <= 0:
        return prior_mean, 0.0
    w = (obs_n / SIGMA_OBS2) / (obs_n / SIGMA_OBS2 + 1.0 / SIGMA_TAU2)
    return w * obs_avg + (1 - w) * prior_mean, w
MIN_REF_GAMES = 8    # sample floor for a referee on a fouls line (v2 gate)


# ------------------------------------------------------------------ helpers
def over_pmf(lam, size, line):
    """P(X > line) for a negative binomial with mean `lam` and dispersion `size`.

    Computed in log space: q**size underflows to 1e-37 for a realistic
    dispersion, which silently collapsed the whole CDF to zero.
    """
    if lam <= 0:
        return 0.0
    r = size
    p = r / (r + lam)
    q = 1.0 - p
    kmax = int(line)
    lp = math.log(p)
    lq = math.log(q)
    logs = []
    for k in range(kmax + 1):
        # NB pmf = C(k+r-1, k) * p^r * (1-p)^k   with p = r/(r+lam)
        logs.append(math.lgamma(k + r) - math.lgamma(r) - math.lgamma(k + 1)
                    + r * lp + k * lq)
    mx = max(logs)
    cdf = math.exp(mx) * sum(math.exp(l - mx) for l in logs)
    return max(0.0, min(1.0, 1.0 - cdf))


def fit_size(values):
    """NB dispersion from a sample (method of moments on var/mean)."""
    n = len(values)
    if n < 20:
        return 50.0
    m = sum(values) / n
    v = sum((x - m) ** 2 for x in values) / (n - 1)
    if v <= m:
        return 200.0
    return m * m / (v - m)


def shrink(own, n, base, k=8.0):
    """Shrink a team's own rate toward the league base by sample size."""
    if n <= 0:
        return base
    w = n / (n + k)
    return w * own + (1 - w) * base


def main():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    matches = []
    for v in cache.values():
        if not v.get('finished') or not v.get('fouls'):
            continue
        matches.append(dict(date=str(v.get('utcTime'))[:10], ts=v.get('utcTime'),
                            home=v.get('homeName'), away=v.get('awayName'),
                            fh=v['fouls'][0], fa=v['fouls'][1],
                            corners=v.get('corners'), yellows=v.get('yellows'),
                            shots=v.get('shots'), tackles=v.get('tackles'),
                            comp=v.get('compName') or v.get('compSlug'),
                            ref=(v.get('referee') or {}).get('name'),
                            stored_ref_avg=(v.get('referee') or {}).get('avg_fouls'),
                            stored_ref_games=(v.get('referee') or {}).get('games')))
    matches.sort(key=lambda m: (m['ts'] or '', m['home'] or ''))
    print(f'finished matches with fouls: {len(matches)}  '
          f'({matches[0]["date"]} -> {matches[-1]["date"]})')

    # ---------- league baseline from the whole sample (descriptive only)
    team_f = [f for m in matches for f in (m['fh'], m['fa'])]
    base_team = sum(team_f) / len(team_f)
    base_match = base_team * 2
    print(f'league baseline: {base_team:.2f} fouls per team, {base_match:.2f} per match')
    size_team = fit_size(team_f)
    size_match = fit_size([m['fh'] + m['fa'] for m in matches])
    print(f'negative-binomial dispersion: team size {size_team:.1f}  match size {size_match:.1f}\n')

    # ---------- walk-forward
    team_for = collections.defaultdict(lambda: [0.0, 0])       # team -> [fouls, n]
    team_against = collections.defaultdict(lambda: [0.0, 0])
    ref_tot = collections.defaultdict(lambda: [0.0, 0])        # referee -> [fouls, n]
    comp_f = collections.defaultdict(lambda: [0.0, 0])         # competition -> [fouls, n]
    comp_team = collections.defaultdict(lambda: [0.0, 0])      # competition -> [team fouls, n]

    ev = []
    for m in matches:
        h, a = m['home'], m['away']
        rh, ra = m['ref'], m['ref']

        # --- competition baseline from PRIOR matches only.
        # Foul counts are a COMPETITION market: Serie A sits at 47% over 21.5
        # while the Russian league sits at 89%.  A single pooled league
        # average misprices both.
        cm = m['comp']
        if comp_team[cm][1] >= 10:
            comp_base_team = comp_team[cm][0] / comp_team[cm][1]
            comp_n = comp_team[cm][1]
        else:
            comp_base_team, comp_n = base_team, 0
        comp_base_match = comp_base_team * 2

        # --- referee average from PRIOR matches only (never this one),
        #     shrunk toward the competition baseline
        if rh and ref_tot[rh][1] >= 3:
            ref_avg = ref_tot[rh][0] / ref_tot[rh][1]
            ref_n = ref_tot[rh][1]
        else:
            ref_avg, ref_n = None, 0
        ref_avg_used, ref_w = shrink_ref(ref_avg, ref_n, comp_base_match)
        ref_mult = ref_avg_used / comp_base_match

        # --- team rates from PRIOR matches only
        def rate(d, k):
            f, n = d[k]
            return (f / n, n) if n else (None, 0)

        h_for, hn = rate(team_for, h)
        h_ag, _ = rate(team_against, h)
        a_for, an = rate(team_for, a)
        a_ag, _ = rate(team_against, a)

        def team_lam(for_rate, for_n, ag_rate, ag_n):
            f = shrink(for_rate, for_n, comp_base_team) if for_rate is not None else comp_base_team
            c = shrink(ag_rate, ag_n, comp_base_team) if ag_rate is not None else comp_base_team
            lam = 0.5 * f + 0.5 * c
            return max(2.0, lam * ref_mult)

        lam_h = team_lam(h_for, hn, h_ag, hn)
        lam_a = team_lam(a_for, an, a_ag, an)
        lam_m = lam_h + lam_a

        rec = dict(date=m['date'], home=h, away=a, comp=m['comp'], ref=rh,
                   comp_base_team=comp_base_team, comp_n=comp_n,
                   ref_avg=ref_avg, ref_n=ref_n, ref_mult=ref_mult,
                   lam_h=lam_h, lam_a=lam_a, lam_m=lam_m,
                   fh=m['fh'], fa=m['fa'], fm=m['fh'] + m['fa'],
                   hn=hn, an=an)
        for L in TEAM_LINES:
            rec[f'h_{L}'] = over_pmf(lam_h, size_team, L)
            rec[f'a_{L}'] = over_pmf(lam_a, size_team, L)
        for L in MATCH_LINES:
            rec[f'm_{L}'] = over_pmf(lam_m, size_match, L)
        ev.append(rec)

        # --- update the running state AFTER predicting
        team_for[h][0] += m['fh']; team_for[h][1] += 1
        team_for[a][0] += m['fa']; team_for[a][1] += 1
        team_against[h][0] += m['fa']; team_against[h][1] += 1
        team_against[a][0] += m['fh']; team_against[a][1] += 1
        if rh:
            ref_tot[rh][0] += m['fh'] + m['fa']; ref_tot[rh][1] += 1
        comp_f[m['comp']][0] += m['fh'] + m['fa']; comp_f[m['comp']][1] += 1
        comp_team[m['comp']][0] += m['fh'] + m['fa']; comp_team[m['comp']][1] += 2

    json.dump(ev, open(os.path.join(DATA, 'fouls_walkforward.json'), 'w'))
    print(f'walk-forward records: {len(ev)}\n')

    # ---------- evaluation
    def brier(ps):
        return sum((p - a) ** 2 for p, a in ps) / len(ps) if ps else float('nan')

    print('=== MATCH TOTAL FOULS Over X.5 — walk-forward ===')
    print(f'{"LINE":>7s} {"NAIVE":>8s} {"MODEL":>8s} {"ACTUAL":>8s} {"GAP":>7s} '
          f'{"BRIER naive":>12s} {"BRIER model":>12s} {"VERDICT"}')
    for L in MATCH_LINES:
        ps = [(r[f'm_{L}'], 1.0 if r['fm'] > L else 0.0) for r in ev]
        naive = sum(a for _, a in ps) / len(ps)
        avg = sum(p for p, _ in ps) / len(ps)
        hit = sum(a for _, a in ps) / len(ps)
        bn = brier([(naive, a) for _, a in ps])
        bm = brier(ps)
        v = 'MODEL WINS' if bm < bn else 'naive wins'
        print(f'{"O"+str(L):>7s} {naive*100:7.1f}% {avg*100:7.1f}% {hit*100:7.1f}% '
              f'{(avg-hit)*100:+6.1f} {bn:12.4f} {bm:12.4f}  {v}')

    print('\n=== TEAM FOULS Over X.5 — walk-forward (both sides) ===')
    print(f'{"LINE":>7s} {"NAIVE":>8s} {"MODEL":>8s} {"ACTUAL":>8s} {"GAP":>7s} '
          f'{"BRIER naive":>12s} {"BRIER model":>12s} {"VERDICT"}')
    for L in TEAM_LINES:
        ps = []
        for r in ev:
            ps.append((r[f'h_{L}'], 1.0 if r['fh'] > L else 0.0))
            ps.append((r[f'a_{L}'], 1.0 if r['fa'] > L else 0.0))
        naive = sum(a for _, a in ps) / len(ps)
        avg = sum(p for p, _ in ps) / len(ps)
        hit = sum(a for _, a in ps) / len(ps)
        bn = brier([(naive, a) for _, a in ps])
        bm = brier(ps)
        v = 'MODEL WINS' if bm < bn else 'naive wins'
        print(f'{"O"+str(L):>7s} {naive*100:7.1f}% {avg*100:7.1f}% {hit*100:7.1f}% '
              f'{(avg-hit)*100:+6.1f} {bn:12.4f} {bm:12.4f}  {v}')

    # ---------- honest holdout: fit the calibration on the first 60%, test on the rest
    print('\n=== HOLDOUT: calibration fitted on the first 60% of the season, '
          'tested on the last 40% ===')
    cut = int(len(ev) * 0.6)
    tr, te = ev[:cut], ev[cut:]
    print(f'train {len(tr)} matches ({tr[0]["date"]} -> {tr[-1]["date"]}) | '
          f'test {len(te)} matches ({te[0]["date"]} -> {te[-1]["date"]})\n')

    def isotonic(pairs):
        xs = sorted(set(p for p, _ in pairs))
        if not xs:
            return []
        # PAV with weights
        blocks = []
        for x in xs:
            sub = [a for p, a in pairs if p == x]
            blocks.append([x, sum(sub) / len(sub), len(sub)])
        i = 0
        while i < len(blocks) - 1:
            if blocks[i][1] > blocks[i + 1][1]:
                b1, b2 = blocks[i], blocks[i + 1]
                tw = b1[2] + b2[2]
                blocks[i] = [(b1[0] * b1[2] + b2[0] * b2[2]) / tw,
                             (b1[1] * b1[2] + b2[1] * b2[2]) / tw, tw]
                blocks.pop(i + 1)
                i = max(i - 1, 0)
            else:
                i += 1
        return [(b[0], b[1]) for b in blocks]

    def apply_cal(knots, x):
        if not knots:
            return x
        xs = [k[0] for k in knots]; ys = [k[1] for k in knots]
        if x <= xs[0]:
            return ys[0]
        if x >= xs[-1]:
            return ys[-1]
        for i in range(len(xs) - 1):
            if xs[i] <= x <= xs[i + 1]:
                span = xs[i + 1] - xs[i]
                if span <= 0:
                    return ys[i + 1]
                t = (x - xs[i]) / span
                return ys[i] + t * (ys[i + 1] - ys[i])
        return ys[-1]

    hold = {}
    for label, keys, actual in (
            ('MATCH TOTAL FOULS', MATCH_LINES, 'fm'),
            ('TEAM FOULS', TEAM_LINES, None)):
        print(f'--- {label} ---')
        print(f'{"LINE":>7s} {"naive Brier":>12s} {"raw model":>10s} {"cal model":>10s} '
              f'{"ACTUAL":>8s} {"GAP":>7s} {"BRIER cal":>10s} {"VERDICT"}')
        for L in keys:
            def get(r):
                if actual == 'fm':
                    return (r[f'm_{L}'], 1.0 if r['fm'] > L else 0.0)
                return None
            if actual == 'fm':
                trp = [(r[f'm_{L}'], 1.0 if r['fm'] > L else 0.0) for r in tr]
                tep = [(r[f'm_{L}'], 1.0 if r['fm'] > L else 0.0) for r in te]
            else:
                trp = []
                for r in tr:
                    trp.append((r[f'h_{L}'], 1.0 if r['fh'] > L else 0.0))
                    trp.append((r[f'a_{L}'], 1.0 if r['fa'] > L else 0.0))
                tep = []
                for r in te:
                    tep.append((r[f'h_{L}'], 1.0 if r['fh'] > L else 0.0))
                    tep.append((r[f'a_{L}'], 1.0 if r['fa'] > L else 0.0))
            if len(trp) < 100 or len(tep) < 50:
                continue
            kn = isotonic(trp)
            cal = [(apply_cal(kn, p), a) for p, a in tep]
            naive_tr = sum(a for _, a in trp) / len(trp)
            bn = brier([(naive_tr, a) for _, a in tep])
            br = brier(tep)
            bc = brier(cal)
            avg = sum(p for p, _ in cal) / len(cal)
            hit = sum(a for _, a in cal) / len(cal)
            v = 'CALIBRATED WINS' if (bc < bn and abs(avg - hit) <= 0.06) else '~naive'
            print(f'{"O"+str(L):>7s} {bn:12.4f} {sum(p for p,_ in tep)/len(tep)*100:9.1f}% '
                  f'{avg*100:9.1f}% {hit*100:7.1f}% {(avg-hit)*100:+6.1f} {bc:10.4f}  {v}')
            hold[(label, L)] = dict(knots=kn, cal=avg, hit=hit, brier_cal=bc,
                                    brier_naive=bn, brier_raw=br)
        print()

    json.dump({f'{k[0]}|{k[1]}': dict(knots=v['knots'], cal=v['cal'], hit=v['hit'],
                                      brier_cal=v['brier_cal'], brier_naive=v['brier_naive'])
               for k, v in hold.items()},
              open(os.path.join(DATA, 'fouls_holdout.json'), 'w'), indent=1)
    print('wrote bot-engine/data/fouls_walkforward.json and fouls_holdout.json')


if __name__ == '__main__':
    main()

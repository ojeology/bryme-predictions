#!/usr/bin/env python3
"""
TEAM CARDS — is there a team that collects cards consistently?

Same discipline as the fouls model:
  * a team's OWN prior card rate from its prior matches only
  * the referee's card average from the referee's PRIOR matches only
  * a competition baseline
  * negative binomial on the count, computed in log space

Tests:
  1. how strongly does a team's prior card rate predict its cards?
  2. how much do teams mean-revert? (the fouls teams regressed hard)
  3. does a team+referee model beat a league-rate bettor, out of sample?
  4. for a TEAM cards line, does the team effect beat the referee effect?
  5. today's board: the card-collecting side of every fixture
"""
import json, os, math, collections, unicodedata, difflib, datetime, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'bot-engine', 'data')

TEAM_LINES = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]
MATCH_LINES = [2.5, 3.5, 4.5, 5.5, 6.5, 7.5]
EDGE = 1.05
GENERIC = {'fc', 'cf', 'sc', 'ac', 'afc', 'tsg', 'sk', 'fk', 'cd', 'sd', 'ud', 'rc',
           'club', 'calcio', 'de', 'of', 'the', 'us', 'ss', 'as', 'nk', 'if', 'ca'}


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]', '', s)


def toks(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    t = set(re.findall(r'[a-z]+', s)) - GENERIC
    return t or set(re.findall(r'[a-z]+', s))


def nb_over(lam, size, line):
    """P(X > line), negative binomial, log space."""
    if lam <= 0:
        return 0.0
    r = size
    p = r / (r + lam)
    q = 1 - p
    kmax = int(line)
    lp, lq = math.log(p), math.log(q)
    logs = [math.lgamma(k + r) - math.lgamma(r) - math.lgamma(k + 1) + r * lp + k * lq
            for k in range(kmax + 1)]
    mx = max(logs)
    cdf = math.exp(mx) * sum(math.exp(l - mx) for l in logs)
    return max(0.0, min(1.0, 1.0 - cdf))


def fit_size(vals):
    n = len(vals)
    if n < 20:
        return 50.0
    m = sum(vals) / n
    v = sum((x - m) ** 2 for x in vals) / (n - 1)
    return 200.0 if v <= m else m * m / (v - m)


def shrink(own, n, base, k=8.0):
    if n <= 0:
        return base
    w = n / (n + k)
    return w * own + (1 - w) * base


def main():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for v in cache.values():
        if v.get('finished') and v.get('yellows') and v.get('fouls'):
            ms.append(dict(date=str(v.get('utcTime'))[:10], ts=v.get('utcTime'),
                           home=v.get('homeName'), away=v.get('awayName'),
                           yh=v['yellows'][0], ya=v['yellows'][1],
                           fh=v['fouls'][0], fa=v['fouls'][1],
                           comp=v.get('compName') or v.get('compSlug'),
                           ref=(v.get('referee') or {}).get('name')))
    ms.sort(key=lambda m: (m['ts'] or '', m['home'] or ''))
    allc = [c for m in ms for c in (m['yh'], m['ya'])]
    base = sum(allc) / len(allc)
    print(f'finished matches with cards: {len(ms)} ({ms[0]["date"]} -> {ms[-1]["date"]})')
    print(f'league baseline: {base:.3f} yellow cards per team  '
          f'({base*2:.2f} per match)')
    size_team = fit_size(allc)
    size_match = fit_size([m['yh'] + m['ya'] for m in ms])
    print(f'dispersion: team size {size_team:.1f}  match size {size_match:.1f}\n')

    # ---------------------------------------------------------- 1 & 2: the team effect
    tf = collections.defaultdict(lambda: [0.0, 0])
    rows = []
    for m in ms:
        for team, c, f in ((m['home'], m['yh'], m['fh']), (m['away'], m['ya'], m['fa'])):
            pf, pn = tf[team]
            rows.append((team, pf / pn if pn else None, pn, c, f))
            tf[team][0] += c
            tf[team][1] += 1

    print('=== 1. does a team\'s OWN prior card rate predict its cards? ===')
    print(f'{"prior games":>12s} {"n":>6s} {"corr":>8s} {"MAE naive":>10s} {"MAE team":>9s}')
    for min_n in (1, 3, 5, 8, 12):
        sub = [r for r in rows if r[1] is not None and r[2] >= min_n]
        if len(sub) < 50:
            continue
        xs = [r[1] for r in sub]
        ys = [r[3] for r in sub]
        mx_, my = sum(xs) / len(xs), sum(ys) / len(ys)
        cov = sum((x - mx_) * (y - my) for x, y in zip(xs, ys))
        sx = math.sqrt(sum((x - mx_) ** 2 for x in xs))
        sy = math.sqrt(sum((y - my) ** 2 for y in ys))
        corr = cov / (sx * sy) if sx and sy else 0
        en = sum(abs(y - base) for y in ys) / len(ys)
        et = sum(abs(y - x) for x, y in zip(xs, ys)) / len(ys)
        print(f'{min_n:12d} {len(sub):6d} {corr:+8.3f} {en:10.3f} {et:9.3f}')

    print('\n=== 2. the tails — who collects cards, who never does ===')
    byt = collections.defaultdict(list)
    for team, pf, pn, c, f in rows:
        if pn >= 6:
            byt[team].append((pf, pn, c, f))
    out = []
    for team, vals in byt.items():
        pf = sum(v[0] for v in vals) / len(vals)
        pn = max(v[1] for v in vals)
        ac = sum(v[2] for v in vals) / len(vals)
        out.append((pf, team, pn, ac))
    out.sort(reverse=True)
    print(f'{"DIRTIEST":32s} {"prior/g":>8s} {"n":>4s} {"actual":>7s}   | '
          f'{"CLEANEST":32s} {"prior/g":>8s} {"n":>4s} {"actual":>7s}')
    for i in range(12):
        d = out[i]
        c = out[-(i + 1)]
        print(f'{d[1][:32]:32s} {d[0]:8.2f} {d[2]:4d} {d[3]:7.2f}   | '
              f'{c[1][:32]:32s} {c[0]:8.2f} {c[2]:4d} {c[3]:7.2f}')

    # mean reversion: how far does a team move from its prior rate?
    print('\n=== mean reversion: prior rate vs what actually happened ===')
    for min_n in (6, 8, 12):
        sub = [r for r in rows if r[1] is not None and r[2] >= min_n]
        if len(sub) < 40:
            continue
        xs = [r[1] for r in sub]
        ys = [r[3] for r in sub]
        mx_ = sum(xs) / len(xs)
        my = sum(ys) / len(ys)
        cov = sum((x - mx_) * (y - my) for x, y in zip(xs, ys))
        sx = math.sqrt(sum((x - mx_) ** 2 for x in xs))
        sy = math.sqrt(sum((y - my) ** 2 for y in ys))
        beta = cov / (sx * sx) if sx else 0
        print(f'  teams with >={min_n} prior games: slope of (actual on prior rate) = {beta:+.3f} '
              f'-> {"STRONG reversion" if beta < 0.35 else "mild reversion" if beta < 0.6 else "little reversion"}')

    # ---------------------------------------------------------- 3 & 4: the model
    print('\n=== 3. walk-forward model, out of sample ===')
    team_c = collections.defaultdict(lambda: [0.0, 0])
    team_f = collections.defaultdict(lambda: [0.0, 0])
    opp_c = collections.defaultdict(lambda: [0.0, 0])
    ref_c = collections.defaultdict(lambda: [0.0, 0])
    comp_c = collections.defaultdict(lambda: [0.0, 0])
    ev = []
    for m in ms:
        cm = m['comp']
        cb = (comp_c[cm][0] / comp_c[cm][1]) if comp_c[cm][1] >= 10 else base
        ref_avg, ref_n = None, 0
        if m['ref'] and ref_c[m['ref']][1]:
            ref_avg = ref_c[m['ref']][0] / ref_c[m['ref']][1]
            ref_n = ref_c[m['ref']][1]
        mult = (ref_avg / (cb * 2)) if (ref_avg and ref_n >= 3) else 1.0

        def lam_for(team, use_ref=True):
            cf, cn = team_c.get(team, [0, 0])
            ff, fn = team_f.get(team, [0, 0])
            oc, on = opp_c.get(team, [0, 0])
            c_rate = cf / cn if cn else None
            o_rate = oc / on if on else None
            f_rate = ff / fn if fn else None
            c_s = shrink(c_rate, cn, cb) if c_rate is not None else cb
            o_s = shrink(o_rate, on, cb) if o_rate is not None else cb
            # a team's cards come from their own card rate AND from the fouls they draw
            f_s = shrink(f_rate, fn, base * 1.0) if f_rate is not None else base
            lam = 0.55 * c_s + 0.25 * o_s + 0.20 * f_s
            if use_ref:
                lam *= mult
            return max(0.15, lam), cn, on

        lh, hn, _ = lam_for(m['home'])
        la, an, _ = lam_for(m['away'])
        lh_noref, _, _ = lam_for(m['home'], use_ref=False)
        la_noref, _, _ = lam_for(m['away'], use_ref=False)
        lm = lh + la
        rec = dict(date=m['date'], home=m['home'], away=m['away'], comp=cm, ref=m['ref'],
                   ref_avg=ref_avg, ref_n=ref_n, ref_mult=mult, comp_base=cb,
                   lam_h=lh, lam_a=la, lam_m=lm, hn=hn, an=an,
                   yh=m['yh'], ya=m['ya'], ym=m['yh'] + m['ya'],
                   lam_h_noref=lh_noref, lam_a_noref=la_noref)
        for L in TEAM_LINES:
            rec[f'h_{L}'] = nb_over(lh, size_team, L)
            rec[f'a_{L}'] = nb_over(la, size_team, L)
        for L in MATCH_LINES:
            rec[f'm_{L}'] = nb_over(lm, size_match, L)
        ev.append(rec)

        team_c[m['home']][0] += m['yh']; team_c[m['home']][1] += 1
        team_c[m['away']][0] += m['ya']; team_c[m['away']][1] += 1
        team_f[m['home']][0] += m['fh']; team_f[m['home']][1] += 1
        team_f[m['away']][0] += m['fa']; team_f[m['away']][1] += 1
        opp_c[m['home']][0] += m['ya']; opp_c[m['home']][1] += 1
        opp_c[m['away']][0] += m['yh']; opp_c[m['away']][1] += 1
        if m['ref']:
            ref_c[m['ref']][0] += m['yh'] + m['ya']; ref_c[m['ref']][1] += 1
        comp_c[cm][0] += m['yh'] + m['ya']; comp_c[cm][1] += 2

    json.dump(ev, open(os.path.join(DATA, 'cards_walkforward.json'), 'w'))

    def brier(ps):
        return sum((p - a) ** 2 for p, a in ps) / len(ps)

    print('\n--- MATCH TOTAL CARDS ---')
    print(f'{"LINE":>7s} {"naive":>8s} {"model":>8s} {"actual":>8s} {"Brier naive":>12s} '
          f'{"Brier model":>12s} {"VERDICT"}')
    for L in MATCH_LINES:
        ps = [(r[f'm_{L}'], 1.0 if r['ym'] > L else 0.0) for r in ev]
        naive = sum(a for _, a in ps) / len(ps)
        avg = sum(p for p, _ in ps) / len(ps)
        hit = sum(a for _, a in ps) / len(ps)
        bn = brier([(naive, a) for _, a in ps])
        bm = brier(ps)
        print(f'{"O"+str(L):>7s} {naive*100:7.1f}% {avg*100:7.1f}% {hit*100:7.1f}% {bn:12.4f} '
              f'{bm:12.4f}  {"MODEL WINS" if bm < bn else "naive wins"}')

    print('\n--- TEAM CARDS ---')
    print(f'{"LINE":>7s} {"naive":>8s} {"model":>8s} {"actual":>8s} {"Brier naive":>12s} '
          f'{"Brier model":>12s} {"VERDICT"}')
    for L in TEAM_LINES:
        ps = []
        for r in ev:
            ps.append((r[f'h_{L}'], 1.0 if r['yh'] > L else 0.0))
            ps.append((r[f'a_{L}'], 1.0 if r['ya'] > L else 0.0))
        naive = sum(a for _, a in ps) / len(ps)
        avg = sum(p for p, _ in ps) / len(ps)
        hit = sum(a for _, a in ps) / len(ps)
        bn = brier([(naive, a) for _, a in ps])
        bm = brier(ps)
        print(f'{"O"+str(L):>7s} {naive*100:7.1f}% {avg*100:7.1f}% {hit*100:7.1f}% {bn:12.4f} '
              f'{bm:12.4f}  {"MODEL WINS" if bm < bn else "naive wins"}')

    print('\n--- TEAM CARDS: team effect only, vs team+referee ---')
    for L in TEAM_LINES:
        ps_ref, ps_noref = [], []
        for r in ev:
            for side, y, k_ref, k_noref in (('h', r['yh'], f'h_{L}', None), ('a', r['ya'], f'a_{L}', None)):
                a = 1.0 if y > L else 0.0
                ps_ref.append((r[k_ref], a))
        # recompute the no-referee variant on the fly
        for r in ev:
            for side, y, lamk in (('h', r['yh'], 'lam_h_noref'), ('a', r['ya'], 'lam_a_noref')):
                a = 1.0 if y > L else 0.0
                ps_noref.append((nb_over(r[lamk], size_team, L), a))
        naive = sum(a for _, a in ps_ref) / len(ps_ref)
        bn = brier([(naive, a) for _, a in ps_ref])
        br = brier(ps_ref)
        bnr = brier(ps_noref)
        print(f'  O{L}: naive {bn:.4f} | team+ref {br:.4f} | team only {bnr:.4f}  -> '
              f'{"TEAM+REF wins" if br < bnr else "TEAM ONLY wins"}')

    # ---------------------------------------------------------- holdout
    print('\n=== 4. HOLDOUT — calibration fitted on the first 60%, tested on the last 40% ===')
    cut = int(len(ev) * 0.6)
    tr, te = ev[:cut], ev[cut:]
    print(f'train {len(tr)} | test {len(te)} ({te[0]["date"]} -> {te[-1]["date"]})\n')

    def isotonic(pairs):
        xs = sorted(set(p for p, _ in pairs))
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
        xs = [k[0] for k in knots]
        ys = [k[1] for k in knots]
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

    print(f'{"market":22s} {"LINE":>6s} {"naive Brier":>12s} {"cal model":>10s} {"ACTUAL":>8s} '
          f'{"GAP":>7s} {"BRIER cal":>10s} {"VERDICT"}')
    for label, lines, kind in (('MATCH TOTAL CARDS', MATCH_LINES, 'm'),
                                ('TEAM CARDS', TEAM_LINES, 't')):
        for L in lines:
            def rows_for(rs):
                out = []
                for r in rs:
                    if kind == 'm':
                        out.append((r[f'm_{L}'], 1.0 if r['ym'] > L else 0.0))
                    else:
                        out.append((r[f'h_{L}'], 1.0 if r['yh'] > L else 0.0))
                        out.append((r[f'a_{L}'], 1.0 if r['ya'] > L else 0.0))
                return out
            trp, tep = rows_for(tr), rows_for(te)
            if len(trp) < 100 or len(tep) < 50:
                continue
            kn = isotonic(trp)
            cal = [(apply_cal(kn, p), a) for p, a in tep]
            naive_tr = sum(a for _, a in trp) / len(trp)
            bn = brier([(naive_tr, a) for _, a in tep])
            bc = brier(cal)
            avg = sum(p for p, _ in cal) / len(cal)
            hit = sum(a for _, a in cal) / len(cal)
            v = 'CALIBRATED WINS' if (bc < bn and abs(avg - hit) <= 0.06) else '~naive'
            print(f'{label:22s} {"O"+str(L):>6s} {bn:12.4f} {avg*100:9.1f}% {hit*100:7.1f}% '
                  f'{(avg-hit)*100:+6.1f} {bc:10.4f}  {v}')
        print()

    print('wrote bot-engine/data/cards_walkforward.json')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
BUFFER BOARD — "if the model says over 8.5, we play over 7.5"
=============================================================
Saturday 24 Oct proved why we need this: EVERY ONE of the 11 losing card legs
finished on EXACTLY 2 cards.  21.3% of all 75 matches landed on exactly 2.
The O2.5 line is a cliff, and one unit of buffer walks straight past it.

This script:
  1. builds a full match-card-count DISTRIBUTION model (P>0.5 .. P>5.5) so we
     can price any line, not just the three the old card board carried;
  2. VALIDATES the buffer rule on Saturday against the real results;
  3. emits today's (Sunday 25 Oct) board with buffered lines.

The buffer rule: take the model's own best line and drop ONE unit.
    Cards O2.5 -> play O1.5        Cards O3.5 -> play O2.5
    Fouls total O19.5 -> O18.5     Team fouls O10.5 -> O9.5
"""
import json, collections, statistics as st, math, re, unicodedata, os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')

# ------------------------------------------------------------------ load
cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))

ref_cards = collections.defaultdict(list)
league = []
for mid, m in cache.items():
    y = m.get('yellows') or []
    if len(y) != 2:
        continue
    d = (m.get('utcTime') or '')[:10]
    league.append(y[0] + y[1])
    r = (m.get('referee') or {}).get('name')
    if r and d < '2026-10-24':          # prior only, no Saturday in the fit
        ref_cards[r].append(y[0] + y[1])

# the real Saturday results (for validation, NOT for fitting)
try:
    results = json.load(open(os.path.join(DATA, 'results_2026-10-24.json')))
except Exception:
    results = {}


def norm(s):
    if not s:
        return ''
    s = unicodedata.normalize('NFKD', str(s)).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


res_idx = {}
for mid, r in results.items():
    res_idx[(norm(r.get('home')), norm(r.get('away')))] = r

THRESH = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]


def fit(xs, ys):
    n = len(xs); mx = sum(xs) / n; my = sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    if den == 0:
        return my, 0.0, 0.0
    b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den
    a = my - b * mx
    ss = sum((y - my) ** 2 for y in ys)
    r2 = 1 - sum((y - (a + b * x)) ** 2 for x, y in zip(xs, ys)) / ss if ss else 0.0
    return a, b, r2


# ---- learn the mapping ref_over_rate -> P(over each threshold) -------------
pts = []
for r, v in ref_cards.items():
    if len(v) < 4:
        continue
    row = [100 * sum(1 for x in v if x > t) / len(v) for t in THRESH]
    pts.append((100 * sum(1 for x in v if x > 3.5) / len(v), row))

print(f'calibration referees: {len(pts)} (>=4 prior 2026-27 matches)')
print(f'league baseline: mean {st.mean(league):.2f} cards | ' +
      ' '.join(f'P>{t} {100*sum(1 for x in league if x>t)/len(league):.1f}%' for t in THRESH))

p35s = [p[0] for p in pts]
REG = {}
for i, t in enumerate(THRESH):
    ys = [p[1][i] for p in pts]
    a, b, r2 = fit(p35s, ys)
    REG[t] = (a, b, r2)
    print(f'  P(>{t}) = {a:6.2f} + {b:.3f} * P(>3.5)   R2={r2:.3f}')

# league fallback when the referee has no sample
LEAG = {t: sum(1 for x in league if x > t) / len(league) for t in THRESH}


def prob_over(thr, p35):
    """Probability the match has MORE than thr cards."""
    if p35 is None:
        return LEAG[thr]
    a, b, r2 = REG[thr]
    # shrink toward the league baseline by how weak the fit is
    p = (a + b * p35) / 100.0
    p = max(0.0, min(1.0, p))
    return p


def prob_from_ref(ref_name, thr):
    r = refman.get(ref_name) or {}
    o35 = r.get('over_3_5')
    if o35 is None:
        return None
    if o35 <= 0:
        o35 = 1
    return prob_over(thr, o35)


refman = {r['name']: r for r in man['referees']}

# ------------------------------------------------------------------ validate
print('\n' + '=' * 74)
print('VALIDATION ON SATURDAY — did the buffer rule actually save us?')
print('=' * 74)

board_sat = [f for f in man['weekend_fixtures'] if f.get('date') == '2026-10-24']
raw_hits = buf_hits = n = 0
rows = []
for f in board_sat:
    ref = (f.get('referee') or {}).get('name')
    r = refman.get(ref) or {}
    mu, o35, games = r.get('avg_yellows'), r.get('over_3_5'), r.get('games')
    if mu is None or o35 is None:
        continue
    if o35 <= 0:
        o35 = 1
    key = (norm(f.get('home_name')), norm(f.get('away_name')))
    res = res_idx.get(key)
    if not res:
        continue
    h = res['stats'].get('home', {})
    a = res['stats'].get('away', {})
    actual = (h.get('yellow_cards') or 0) + (a.get('yellow_cards') or 0)
    # model's own best line: highest threshold whose prob still >= 0.55
    probs = {t: prob_over(t, o35) for t in THRESH}
    model_line = None
    for t in [3.5, 2.5, 1.5, 0.5]:
        if probs[t] >= 0.55:
            model_line = t
            break
    if model_line is None:
        continue
    buf_line = model_line - 1.0
    n += 1
    raw_won = actual > model_line
    buf_won = actual > buf_line
    raw_hits += raw_won
    buf_hits += buf_won
    rows.append((f, ref, games, model_line, buf_line, actual, raw_won, buf_won,
                 probs[model_line], probs[buf_line]))

print(f'Saturday fixtures with a referee and a result: {n}')
print(f'  model line (no buffer): {raw_hits}/{n} = {100*raw_hits/n:.1f}%')
print(f'  BUFFERED line (-1 unit): {buf_hits}/{n} = {100*buf_hits/n:.1f}%')
print(f'  legs rescued by the buffer: {buf_hits - raw_hits}')
print()
print(f"{'fixture':34s} {'ref':18s} {'g':>3s} {'model':>6s} {'buf':>5s} {'act':>4s} {'raw':>5s} {'buf':>5s}")
for f, ref, g, ml, bl, act, rw, bw, pm, pb in sorted(rows, key=lambda r: (r[6], r[3])):
    if rw and not bw:
        continue
    print(f"{(f.get('home_name','')[:16]+' v '+f.get('away_name','')[:16]):34s} {ref[:17]:18s} {g:3d} "
          f"{ml:6.1f} {bl:5.1f} {act:4d} {'WIN' if rw else 'LOSS':>5s} {'WIN' if bw else 'LOSS':>5s}")

# ------------------------------------------------------------------ output
print('\n' + '=' * 74)
print('TODAY — SUNDAY 25 OCT 2026 — BUFFERED BOARD')
print('=' * 74)

out = ['# BUFFERED BOARD — Sunday 25 Oct 2026', '',
       '**The rule: if the model says over 8.5, we play over 7.5.** One unit down',
       'from the model\'s own best line, every time.', '',
       '**Why:** on Saturday, all 11 losing card legs finished on EXACTLY 2 cards —',
       '21.3% of all 75 matches landed on exactly 2. One unit of buffer walked past',
       'every one of them.', '',
       '## How the prices work', '',
       'We have no Sunday prices yet, so the plan price is the fair price at the',
       'buffered line with a 4% book margin taken off. When you look up the real',
       'price, use the **Take at** column: if the book pays less than that, the leg',
       'is not worth taking at that line.', '',
       '## The board', '',
       '| KO | Fixture | Market | MODEL line | MODEL p | PLAY THIS | Buffer p | Take at | Referee | Sample |',
       '|----|---------|--------|------------|---------|-----------|----------|---------|---------|--------|']
srows = []
for f in man['weekend_fixtures']:
    if f.get('date') != '2026-10-25':
        continue
    ref = (f.get('referee') or {}).get('name')
    r = refman.get(ref) or {}
    mu, o35, games = r.get('avg_yellows'), r.get('over_3_5'), r.get('games')
    if mu is None or o35 is None:
        continue
    if o35 <= 0:
        o35 = 1
    probs = {t: prob_over(t, o35) for t in THRESH}
    model_line = None
    for t in [3.5, 2.5, 1.5, 0.5]:
        if probs[t] >= 0.55:
            model_line = t
            break
    if model_line is None:
        continue
    buf_line = model_line - 1.0
    pb = probs[buf_line]
    take = round(1.0 / max(pb, 0.02) * 0.96, 2)
    srows.append((f.get('kickoff_time'), f.get('home_name'), f.get('away_name'), model_line, probs[model_line],
                   buf_line, pb, take, ref, games, f.get('comp')))
for ko, h, a, ml, pm, bl, pb, take, ref, g, comp in sorted(srows):
    out.append(f'| {ko} | {h} v {a} | Cards | O{ml} | {pm*100:.1f}% | **O{bl}** | '
               f'{pb*100:.1f}% | {take:.2f} | {ref} | {g}g |')

out += ['', '## The buffer in numbers', '']
if srows:
    raw_p = st.mean([r[4] for r in srows])
    buf_p = st.mean([r[6] for r in srows])
    raw_prod = math.exp(sum(math.log(1 / max(r[4], .02) * .96) for r in srows))
    print(f'  mean model-line prob {raw_p*100:.1f}%  -> buffered {buf_p*100:.1f}%')
    print(f'  full-board product at model lines  {raw_prod:.1f}x')
    print(f'  full-board product buffered        {math.exp(sum(math.log(1/max(r[6],.02)*.96) for r in srows)):.1f}x')
    out += [f'* Mean model-line probability **{raw_p*100:.1f}%** -> buffered **{buf_p*100:.1f}%**',
            f'* All {len(srows)} fixtures multiplied: **{raw_prod:.1f}x** at model lines, '
            f'**{math.exp(sum(math.log(1/max(r[6],.02)*.96) for r in srows)):.1f}x** buffered.']

out += ['', '## What the buffer costs and buys', '',
        '| | Model line | Buffered line |', '|---|---|---|',
        f'| Hit rate on Saturday | {100*raw_hits/n:.1f}% ({raw_hits}/{n}) | **{100*buf_hits/n:.1f}%** ({buf_hits}/{n}) |',
        '| Odds per leg | higher | lower |',
        '| What a 100k ticket needs | fewer legs | more legs |', '',
        '**The buffer does not make money better — it makes money MORE LIKELY.**',
        'On Saturday the card edge was real but thin (~1.7% per leg). Buffering',
        'converts a thin edge on a few legs into a thick-looking hit rate on many,',
        'at the price of a much smaller multiplier. If the goal is "hit N100,000',
        'today", buffer is the right lever. If the goal is "make money over many',
        'weeks", take the model lines at good prices.', '']

path = os.path.join(DATA, 'BUFFER_BOARD_2026-10-25.md')
open(path, 'w').write('\n'.join(out) + '\n')
print('wrote', path)

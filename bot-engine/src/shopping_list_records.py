#!/usr/bin/env python3
"""
SHOPPING LIST WITH RECORDS
============================
Every line carries the evidence behind it:
  * the referee: his own record (games, cards per game, over-3.5 rate) and his
    recent matches from our cache
  * each team: their recent card record, and how often the line was covered
  * head to head: previous meetings between these two

Nothing here changes a pick.  It is the audit the record demands.
"""
import json, os, re, unicodedata, collections, statistics as st

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')


def nm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def norm(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def load_cache():
    cache = json.load(open(os.path.join(DATA, 'fotmob_2627_exact_api_cache.json')))
    ms = []
    for mid, m in cache.items():
        if not m.get('finished'):
            continue
        y = m.get('yellows') or []
        r = m.get('reds') or []
        if len(y) != 2:
            continue
        hr, ar = (r[0], r[1]) if len(r) == 2 else (0, 0)
        ms.append(dict(date=(m.get('utcTime') or '')[:10], home=m.get('homeName'),
                       away=m.get('awayName'), hy=y[0], ay=y[1], hr=hr, ar=ar,
                       hc=y[0] + 2 * hr, ac=y[1] + 2 * ar, total=y[0] + y[1],
                       ref=(m.get('referee') or {}).get('name'), comp=m.get('compSlug'),
                       hs=m.get('homeScore'), as_=m.get('awayScore')))
    ms.sort(key=lambda m: m['date'])
    return ms


def build_index(ms):
    byteam = collections.defaultdict(list)
    byref = collections.defaultdict(list)
    for m in ms:
        byteam[m['home']].append((m, 'H'))
        byteam[m['away']].append((m, 'A'))
        if m['ref']:
            byref[m['ref']].append(m)
    return byteam, byref


def team_line(ms_rows, thr, mode, n=10):
    """mode 'team' -> did THIS team get booked over thr.  mode 'match' -> did the match go over thr."""
    out = []
    for m, side in ms_rows[-n:]:
        if mode == 'team':
            v = m['hc'] if side == 'H' else m['ac']
        else:
            v = m['total']
        out.append((m['date'], v, v > thr))
    return out


def fmt_team(rows, n=8):
    return '  '.join(f"{v}" for _, v, _ in rows[-n:])


def main():
    ms = load_cache()
    byteam, byref = build_index(ms)
    man = json.load(open(os.path.join(DATA, 'ground_zero_manifest.json')))
    refman = {r['name']: r for r in man['referees']}
    board = json.load(open(os.path.join(DATA, 'sunday_all_matches_2026-10-25.json')))
    tc = json.load(open(os.path.join(DATA, 'team_cards_ref_board_2026-10-25.json')))
    bkm = json.load(open(os.path.join(DATA, 'match_bookings_referee_model.json')))

    def bk_raw(ref, thr):
        M = bkm[str(thr)]
        rv = M['table'].get(ref)
        eff = rv['eff'] if rv else 0.0
        return max(0.02, min(0.98, M['base'] + eff))

    def bk_prob(ref, thr, cards_p=None):
        """P(match bookings over thr).

        A red counts as two bookings, so the Bookings line can never be harder
        to win than the yellows line at the same threshold, and P(over 1.5) can
        never be below P(over 2.5).  The referee-effect fit on bookings is
        noisy (small samples), so it is floored by the card model and made
        monotonic in the threshold.
        """
        p = bk_raw(ref, thr)
        if cards_p is not None:
            p = max(p, cards_p)
        for t in (thr + 1, thr + 2):
            if t in (1.5, 2.5, 3.5):
                p = max(p, bk_raw(ref, t))
        return min(p, 0.99)

    CM = json.load(open(os.path.join(DATA, 'card_model_v3.json')))
    CAL = {float(k): [(a, b, n) for a, b, n in v] for k, v in CM['CAL'].items()}
    FINAL = {float(k): v for k, v in CM['FINAL'].items()}

    def apply_cal(L, pred):
        pts = CAL.get(L) or []
        if not pts:
            return pred
        if pred <= pts[0][0]:
            return pts[0][1]
        if pred >= pts[-1][0]:
            return pts[-1][1]
        for i in range(len(pts) - 1):
            x0, y0, _ = pts[i]
            x1, y1, _ = pts[i + 1]
            if x0 <= pred <= x1:
                return y0 if x1 == x0 else y0 + (y1 - y0) * (pred - x0) / (x1 - x0)
        return pred

    def cp(line, o35):
        a, b, _ = FINAL[line]
        raw = max(0., min(1., (a + b * o35) / 100.))
        return max(0., min(1., apply_cal(line, raw)))

    # resolve fixture names to cache names
    name_map = {}
    for t in byteam:
        name_map.setdefault(nm(t), t)

    def resolve(s):
        s = s.strip()
        if s in byteam:
            return s
        k = nm(s)
        if k in name_map:
            return name_map[k]
        cands = [t for kk, t in name_map.items() if k in kk or kk in k]
        return max(cands, key=len) if cands else None

    OUT = []
    W = OUT.append

    W('# SUNDAY 25 OCT — SHOPPING LIST WITH RECORDS')
    W('')
    W('Every line shows the record behind it: the referee own record, both teams'
      ' recent card record, and the head-to-head. Lines are ordered by how much '
      'value they carry, not by confidence.')
    W('')
    W('**Settlement basis:** SportyBet bookings — a yellow is 1 booking, a red is 2, '
      'a second yellow is not counted. The card model is calibrated on yellows, so '
      'the bookings line settles slightly easier than the numbers shown.')
    W('')

    # ---------------- MATCH-LEVEL CARDS ------------------------------------
    W('## MATCH-LEVEL CARDS')
    W('')
    rows = []
    for r in board:
        ref = r['ref']
        rm = refman.get(ref)
        if not rm or rm.get('over_3_5') is None:
            continue
        o35 = rm['over_3_5']
        parts = [x.strip() for x in r['fx'].split(' v ')]
        h, a = resolve(parts[0]), resolve(parts[1])
        if not h or not a:
            continue
        # use the line the board actually published (model line + one unit below)
        ml = float(r.get('model_line') or 2.5)
        buf = float(r.get('buf') or ml)
        rows.append(dict(r=r, ref=ref, rm=rm, o35=o35, h=h, a=a, ml=ml, buf=buf,
                         p_ml=cp(ml, o35), p_buf=cp(buf, o35)))
    rows.sort(key=lambda x: -x['p_buf'])

    W('## QUICK LIST — go to the book, take only what clears these numbers')
    W('')
    W('| KO | Fixture | Market | Line | Our p | FAIR | TAKE IF |')
    W('|---|---|---|---|---|---|---|')
    for x in sorted(rows, key=lambda x: (x['r']['ko'], x['r']['fx'])):
        thr = x['buf']
        p = x['p_buf']
        W(f"| {x['r']['ko']} | {x['h']} v {x['a']} | Cards | over {thr} | {p*100:.1f}% | "
          f"{1/p:.2f} | **{1/p+0.02:.2f}+** |")
        bthr = thr if thr >= 1.5 else 1.5
        bp = bk_prob(x['ref'], bthr, x['p_buf'])
        W(f"| {x['r']['ko']} | {x['h']} v {x['a']} | Bookings | over {bthr} | {bp*100:.1f}% | "
          f"{1/bp:.2f} | **{1/bp+0.02:.2f}+** |")
    W('')
    for x in rows:
        r, ref, rm = x['r'], x['ref'], x['rm']
        thr = x['buf']
        p = x['p_buf']
        fair = 1 / p
        W(f"### {r['ko']}  {x['h']} v {x['a']}")
        W('')
        W(f"**Referee: {ref}** — {rm['games']} games, {rm['avg_yellows']:.2f} cards/match, "
          f"over 3.5 in {rm['over_3_5']}% of them")
        rc = byref.get(ref, [])
        if rc:
            tots = [m['total'] for m in rc]
            ovr = {t: sum(1 for v in tots if v > t) for t in (1.5, 2.5, 3.5)}
            W(f"  - our own record: {len(rc)} matches, card totals "
              f"{', '.join(str(v) for v in tots[-8:])} — over 1.5 in {ovr[1.5]}/{len(rc)}, "
              f"over 2.5 in {ovr[2.5]}/{len(rc)}, over 3.5 in {ovr[3.5]}/{len(rc)}")
        W('')
        for team in (x['h'], x['a']):
            rows_t = byteam.get(team, [])
            if not rows_t:
                W(f"- **{team}** — not in our match cache")
                continue
            last10 = rows_t[-10:]
            ov = {t: sum(1 for m, s in last10 if m['total'] > t) for t in (1.5, 2.5, 3.5)}
            W(f"- **{team}** — last {len(last10)} matches, card totals "
              f"{', '.join(str(m['total']) for m, s in last10)}")
            W(f"  - over 1.5 in **{ov[1.5]}/{len(last10)}**, "
              f"over 2.5 in **{ov[2.5]}/{len(last10)}**, over 3.5 in {ov[3.5]}/{len(last10)}")
            bk = [m['hc'] + m['ac'] for m, sd in last10]
            bov = {t: sum(1 for v in bk if v > t) for t in (1.5, 2.5)}
            W(f"  - as BOOKINGS (red = 2): totals {', '.join(str(v) for v in bk)} — "
              f"over 1.5 in **{bov[1.5]}/{len(last10)}**, over 2.5 in {bov[2.5]}/{len(last10)}")
        # head to head
        h2h = [m for m in ms if {m['home'], m['away']} == {x['h'], x['a']}]
        if h2h:
            h2h = h2h[-6:]
            W(f"- **Head to head** ({len(h2h)} meeting(s)): " +
              ', '.join(f"{m['date']} {m['home']} v {m['away']} = {m['total']} cards" for m in h2h) +
              f" — over {thr} in {sum(1 for m in h2h if m['total'] > thr)}/{len(h2h)}")
        else:
            W(f"- **Head to head**: no previous meeting in our cache")
        W('')
        W(f"> **OUR LINE: Cards over {thr} — {p*100:.1f}% — fair price {fair:.2f} — "
          f"TAKE IF THE BOOK PAYS {fair+0.02:.2f}+**")
        W(f">")
        W(f"> (model line is Cards over {x['ml']} at {x['p_ml']*100:.1f}%, fair "
          f"{1/x['p_ml']:.2f}; the line above is one unit below it, the buffer rule)")
        # the Bookings market — same fixture, red counts as two, so it settles easier
        bthr = thr if thr >= 1.5 else 1.5
        bp = bk_prob(ref, bthr, p)
        bfair = 1 / bp
        W(f">")
        W(f"> **BOOKINGS over {bthr}** (a red counts as two) — {bp*100:.1f}% — fair {bfair:.2f} — "
          f"TAKE IF {bfair+0.02:.2f}+  ← ask for this one if plain Cards is not offered")
        W('')
        W('---')
        W('')

    # ---------------- TEAM CARDS -------------------------------------------
    W('## TEAM CARDS — "individual over 0.5"')
    W('')
    W('The team own card record is noise (split-half r = +0.13 over 242 teams), so these '
      'are priced off the referee. The record is shown anyway, because it tells you what '
      'you are actually betting on.')
    W('')
    trows = []
    for t in tc:
        if t['ref'] is None:
            continue
        rm = refman.get(t['ref'])
        if not rm:
            continue
        trows.append(t)
    trows.sort(key=lambda t: -t['p0.5'])
    for t in trows[:22]:
        team = resolve(t['team'])
        rm = refman.get(t['ref'])
        fair = 1 / t['p0.5']
        W(f"### {t['ko']}  {t['fx']} — {team} ({t['side']}) to be booked")
        W('')
        W(f"**Referee: {t['ref']}** — {rm['games']} games, {rm['avg_yellows']:.2f} cards/match, "
          f"over 3.5 in {rm['over_3_5']}%")
        rc = byref.get(t['ref'], [])
        if rc:
            booked = sum((m['hc'] > 0) + (m['ac'] > 0) for m in rc)
            nteam = 2 * len(rc)
            W(f"  - of his {len(rc)} matches ({nteam} team-matches), a team was booked in "
              f"{booked} ({100*booked/nteam:.1f}%)")
        W('')
        if not team:
            W(f"- **{t['team']}** — not in our match cache")
        else:
            rows_t = byteam.get(team, [])
            last10 = rows_t[-10:]
            booked = sum(1 for m, s in last10
                         if (m['hc'] if s == 'H' else m['ac']) > 0)
            two = sum(1 for m, s in last10
                      if (m['hc'] if s == 'H' else m['ac']) > 1)
            W(f"- **{team}** — last {len(last10)} matches, their own bookings "
              f"{', '.join(str(m['hc'] if s == 'H' else m['ac']) for m, s in last10)}")
            W(f"  - **booked in {booked}/{len(last10)}** of them, booked 2+ in {two}/{len(last10)}")
        W('')
        W(f"> **OUR LINE: {team} over 0.5 — {t['p0.5']*100:.1f}% — fair price {fair:.2f} — "
          f"TAKE IF THE BOOK PAYS {fair+0.01:.2f}+**")
        W('')
        W('---')
        W('')

    out = '\n'.join(OUT)
    open(os.path.join(DATA, 'SHOPPING_LIST_WITH_RECORDS_2026-10-25.md'), 'w').write(out)
    print('wrote SHOPPING_LIST_WITH_RECORDS_2026-10-25.md')
    print(out[:6000])


if __name__ == '__main__':
    main()

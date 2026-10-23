#!/usr/bin/env python3
"""
Global Friday 23 October 2026 Two-Sided Behaviour Machine Scanner
Scans ALL competitions on Statz for today's (2026-10-23) fixtures:
- Top 5 Leagues (EPL, La Liga, Bundesliga, Serie A, Ligue 1)
- Russia (Premier Liga), Netherlands (Eredivisie), Portugal (Liga Portugal)
- Turkey (Super Lig), Belgium (Pro League), England Championship, La Liga 2, Serie B
- Austria Bundesliga, Denmark Superliga, Sweden Allsvenskan, Poland Ekstraklasa,
  Croatia 1. HNL, Ukraine Premier League, Saudi Pro League, etc.

Strictly evaluates OVER markets only (user preference: NO UNDER MARKETS):
- Corners (Team Over / Match Total Over)
- Fouls (Team Over / 1H Over / Match Total Over)
- Tackles (Team Over / Match Total Over)
- Yellow Cards (Team Over / Match Total Over)
- Shots (Team Over / Match Total Over)
"""

import html as htmllib
import json
import re
import ssl
import urllib.request
from concurrent.futures import ThreadPoolExecutor

CTX = ssl.create_default_context()
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

STAT_SLUGS = {
    "corners": ("team_corners", "opp_corners", "match_corners"),
    "fouls": ("team_fouls", "opp_fouls", "match_fouls"),
    "tackles": ("team_tackles", "opp_tackles", "match_tackles"),
    "yellowcards": ("team_yellowcards", "opp_yellowcards", "match_yellowcards"),
    "shots-total": ("team_shots", "opp_shots", "match_shots"),
}


def fetch_props(url):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=12, context=CTX) as r:
            s = r.read().decode("utf-8", errors="ignore")
        m = re.search(r'data-page="([^"]+)"', s)
        if m:
            return url, json.loads(htmllib.unescape(m.group(1)))["props"]
    except Exception:
        return url, None
    return url, None


def extract_fields(row):
    """Dynamically find team, opp, match keys in matchLog row."""
    t_key = o_key = m_key = None
    for k in row.keys():
        if k.startswith("team_") and k not in ("team_id",):
            t_key = k
        elif k.startswith("opp_") and k not in ("opp_id",):
            o_key = k
        elif k.startswith("match_") and k not in ("match_id",):
            m_key = k
    return t_key, o_key, m_key


def parse_odds_sections(odds_obj):
    if not odds_obj or not isinstance(odds_obj, dict):
        return []
    out = []
    for sec in odds_obj.get("sections") or []:
        label = sec.get("label", "")
        proj = sec.get("projection")
        for ln in sec.get("lines") or []:
            line_val = ln.get("line")
            overs = ln.get("over") or []
            if overs:
                best = max(overs, key=lambda x: x.get("price") or 0)
                prices = {b["book"]: b["price"] for b in overs if b.get("book") and b.get("price")}
                out.append({
                    "section": label,
                    "line": line_val,
                    "projection": proj,
                    "best_book": best.get("book"),
                    "best_price": best.get("price"),
                    "prices": prices,
                })
    return out


def hit_rate(seq, line):
    if not seq:
        return 0, 0, 0.0
    hits = sum(1 for v in seq if v is not None and v > line)
    return hits, len(seq), round(100.0 * hits / len(seq), 1)


def main():
    _, seed = fetch_props("https://statz.ai/team/vitoria-guimaraes/corners")
    comps = [c["slug"] for c in seed["footerCompetitions"]]

    comp_urls = [f"https://statz.ai/competitions/{slug}/fixtures" for slug in comps]
    fixtures_today = []

    with ThreadPoolExecutor(max_workers=16) as ex:
        for url, props in ex.map(fetch_props, comp_urls):
            if not props:
                continue
            comp_name = (props.get("competition") or {}).get("name", url.split("/")[4])
            comp_slug = url.split("/")[4]
            for mw in props.get("matchweeks") or []:
                for day in mw.get("days") or []:
                    if day.get("iso") == "2026-10-23":
                        for fx in day.get("fixtures") or []:
                            ht = fx.get("home_team") or {}
                            at = fx.get("away_team") or {}
                            if ht.get("slug") and at.get("slug"):
                                fixtures_today.append({
                                    "comp_slug": comp_slug,
                                    "comp_name": comp_name,
                                    "fixture_id": fx.get("id"),
                                    "kickoff_time": fx.get("kickoff_time"),
                                    "status": fx.get("status"),
                                    "home_name": ht.get("name"),
                                    "home_slug": ht.get("slug"),
                                    "away_name": at.get("name"),
                                    "away_slug": at.get("slug"),
                                })

    # Deduplicate fixtures
    seen_fx = {}
    for f in fixtures_today:
        seen_fx[f["fixture_id"]] = f
    fixtures_today = sorted(seen_fx.values(), key=lambda x: (x["comp_slug"], x["kickoff_time"] or ""))

    print(f"=== TOTAL 2026-10-23 FIXTURES FOUND ACROSS ALL COMPETITIONS: {len(fixtures_today)} ===")
    for f in fixtures_today:
        print(f"  [{f['comp_name']}] {f['kickoff_time']} | {f['home_name']} ({f['home_slug']}) vs {f['away_name']} ({f['away_slug']}) [{f['status']}]")

    # Fetch all 5 stat pages for every team playing today
    team_slugs = sorted({f["home_slug"] for f in fixtures_today} | {f["away_slug"] for f in fixtures_today})
    tasks = [(t, st, f"https://statz.ai/team/{t}/{st}") for t in team_slugs for st in STAT_SLUGS.keys()]
    print(f"\nFetching {len(tasks)} team-market pages across {len(team_slugs)} teams...")

    raw_team_data = {t: {} for t in team_slugs}

    def worker(item):
        t, st, u = item
        _, p = fetch_props(u)
        return t, st, p

    with ThreadPoolExecutor(max_workers=20) as ex:
        for t, st, p in ex.map(worker, tasks):
            if not p or "payload" not in p:
                continue
            mlog = (p["payload"].get("matchLog") or [])
            if not mlog:
                continue
            tk, ok, mk = extract_fields(mlog[0])
            if not tk:
                continue
            rows_all = []
            for r in mlog:
                rows_all.append({
                    "date": (r.get("kickoff_iso") or "")[:10],
                    "venue": r.get("venue"),
                    "comp": (r.get("competition") or {}).get("name"),
                    "opp": (r.get("opponent") or {}).get("name"),
                    "for": r.get(tk),
                    "ag": r.get(ok),
                    "tot": r.get(mk),
                    "h1_for": r.get("h1_team"),
                    "h1_ag": r.get("h1_opp"),
                })
            # Separate 2026-27 season games (date >= 2026-07-01) and last10
            rows_2627 = [x for x in rows_all if x["date"] >= "2026-07-01" and x["for"] is not None]
            raw_team_data[t][st] = {
                "last10": rows_all,
                "s2627": rows_2627,
                "odds": parse_odds_sections(p.get("nextFixtureMarketOdds")),
            }

    # Candidate half-point lines per stat
    CANDIDATE_LINES = {
        "corners": {
            "team": [2.5, 3.5, 4.5, 5.5, 6.5],
            "match": [6.5, 7.5, 8.5, 9.5, 10.5],
        },
        "fouls": {
            "team": [8.5, 9.5, 10.5, 11.5, 12.5, 13.5],
            "match": [18.5, 19.5, 20.5, 21.5, 22.5, 23.5, 24.5],
        },
        "tackles": {
            "team": [10.5, 11.5, 12.5, 13.5, 14.5, 15.5, 16.5],
            "match": [24.5, 25.5, 26.5, 27.5, 28.5, 29.5, 30.5, 31.5, 32.5],
        },
        "yellowcards": {
            "team": [0.5, 1.5, 2.5],
            "match": [2.5, 3.5, 4.5],
        },
        "shots-total": {
            "team": [8.5, 9.5, 10.5, 11.5, 12.5, 13.5],
            "match": [20.5, 21.5, 22.5, 23.5, 24.5, 25.5],
        },
    }

    audit_results = []
    elite_locks = []

    for fx in fixtures_today:
        hs, as_ = fx["home_slug"], fx["away_slug"]
        hn, an = fx["home_name"], fx["away_name"]
        fx_summary = {"fixture": fx, "live_odds": {}, "locks_100_or_90": []}

        for st in STAT_SLUGS.keys():
            hd = raw_team_data.get(hs, {}).get(st)
            ad = raw_team_data.get(as_, {}).get(st)
            if not hd or not ad:
                continue

            # Collect live bookmaker odds from both home & away pages
            combined_odds = []
            seen_od = set()
            for od in (hd.get("odds") or []) + (ad.get("odds") or []):
                key = (od["section"], od["line"])
                if key not in seen_od:
                    seen_od.add(key)
                    combined_odds.append(od)
            if combined_odds:
                fx_summary["live_odds"][st] = combined_odds

            h26 = hd["s2627"]
            a26 = ad["s2627"]
            if len(h26) < 4 or len(a26) < 4:
                continue

            h_for = [r["for"] for r in h26]
            h_ag = [r["ag"] for r in h26]
            h_tot = [r["tot"] for r in h26]
            h_home_for = [r["for"] for r in h26 if r["venue"] == "H"]
            h_home_ag = [r["ag"] for r in h26 if r["venue"] == "H"]
            h_home_tot = [r["tot"] for r in h26 if r["venue"] == "H"]

            a_for = [r["for"] for r in a26]
            a_ag = [r["ag"] for r in a26]
            a_tot = [r["tot"] for r in a26]
            a_away_for = [r["for"] for r in a26 if r["venue"] == "A"]
            a_away_ag = [r["ag"] for r in a26 if r["venue"] == "A"]
            a_away_tot = [r["tot"] for r in a26 if r["venue"] == "A"]

            # 1) Match Total Overs
            for ln in CANDIDATE_LINES[st]["match"]:
                hh, hn_c, hp = hit_rate(h_tot, ln)
                ah, an_c, ap = hit_rate(a_tot, ln)
                comb_h, comb_n = hh + ah, hn_c + an_c
                comb_p = round(100.0 * comb_h / comb_n, 1)
                vh, vn, vp = hit_rate(h_home_tot + a_away_tot, ln)
                if comb_p >= 90.0 or (vp == 100.0 and vn >= 6 and comb_p >= 85.0):
                    # Match live odds if available
                    matched_odds = [o for o in combined_odds if str(o["line"]) in (str(ln), str(int(ln))) and "Match" in o["section"]]
                    rec = {
                        "comp": fx["comp_name"],
                        "kickoff": fx["kickoff_time"],
                        "match": f"{hn} vs {an}",
                        "stat": st,
                        "market": f"Match Total {st} OVER {ln}",
                        "two_sided_2627": f"{comb_h}/{comb_n} ({comb_p}%)",
                        "venue_2627": f"{vh}/{vn} ({vp}%)",
                        "side_a_seq": h_tot,
                        "side_b_seq": a_tot,
                        "comb_pct": comb_p,
                        "venue_pct": vp,
                        "live_odds": matched_odds,
                    }
                    fx_summary["locks_100_or_90"].append(rec)
                    elite_locks.append(rec)

            # 2) Home Team Overs (Home For + Away Conceded)
            for ln in CANDIDATE_LINES[st]["team"]:
                hh, hn_c, hp = hit_rate(h_for, ln)
                ah, an_c, ap = hit_rate(a_ag, ln)
                comb_h, comb_n = hh + ah, hn_c + an_c
                comb_p = round(100.0 * comb_h / comb_n, 1)
                vh, vn, vp = hit_rate(h_home_for + a_away_ag, ln)
                if (hp == 100.0 and comb_p >= 85.0) or comb_p >= 90.0 or (vp == 100.0 and vn >= 6 and comb_p >= 83.0):
                    matched_odds = [o for o in combined_odds if str(o["line"]) in (str(ln), str(int(ln))) and hn[:5].lower() in o["section"].lower()]
                    rec = {
                        "comp": fx["comp_name"],
                        "kickoff": fx["kickoff_time"],
                        "match": f"{hn} vs {an}",
                        "stat": st,
                        "market": f"{hn} (Home) {st} OVER {ln}",
                        "two_sided_2627": f"{comb_h}/{comb_n} ({comb_p}%) [For {hh}/{hn_c}, OppAg {ah}/{an_c}]",
                        "venue_2627": f"{vh}/{vn} ({vp}%)",
                        "side_a_seq": h_for,
                        "side_b_seq": a_ag,
                        "comb_pct": comb_p,
                        "venue_pct": vp,
                        "live_odds": matched_odds,
                    }
                    fx_summary["locks_100_or_90"].append(rec)
                    elite_locks.append(rec)

            # 3) Away Team Overs (Away For + Home Conceded)
            for ln in CANDIDATE_LINES[st]["team"]:
                ah, an_c, ap = hit_rate(a_for, ln)
                hh, hn_c, hp = hit_rate(h_ag, ln)
                comb_h, comb_n = ah + hh, an_c + hn_c
                comb_p = round(100.0 * comb_h / comb_n, 1)
                vh, vn, vp = hit_rate(a_away_for + h_home_ag, ln)
                if (ap == 100.0 and comb_p >= 85.0) or comb_p >= 90.0 or (vp == 100.0 and vn >= 6 and comb_p >= 83.0):
                    matched_odds = [o for o in combined_odds if str(o["line"]) in (str(ln), str(int(ln))) and an[:5].lower() in o["section"].lower()]
                    rec = {
                        "comp": fx["comp_name"],
                        "kickoff": fx["kickoff_time"],
                        "match": f"{hn} vs {an}",
                        "stat": st,
                        "market": f"{an} (Away) {st} OVER {ln}",
                        "two_sided_2627": f"{comb_h}/{comb_n} ({comb_p}%) [For {ah}/{an_c}, OppAg {hh}/{hn_c}]",
                        "venue_2627": f"{vh}/{vn} ({vp}%)",
                        "side_a_seq": a_for,
                        "side_b_seq": h_ag,
                        "comb_pct": comb_p,
                        "venue_pct": vp,
                        "live_odds": matched_odds,
                    }
                    fx_summary["locks_100_or_90"].append(rec)
                    elite_locks.append(rec)

        audit_results.append(fx_summary)

    out_path = "/home/user/bryme-predictions/bot-engine/data/friday_23_oct_all_leagues_overs_audit.json"
    with open(out_path, "w") as f:
        json.dump({"fixtures_scanned": len(fixtures_today), "audit": audit_results}, f, indent=2)

    print(f"\nSaved full global audit to {out_path}. Total high-confidence OVER locks found: {len(elite_locks)}")
    # Print ALL 100% two-sided locks FIRST, then 92%+ locks AND any locks with LIVE ODDS >= 1.15!
    print("\n================ PURE 100% TWO-SIDED SEASON OVER LOCKS ================")
    for r in sorted(elite_locks, key=lambda x: (-x["comb_pct"], -x["venue_pct"], x["comp"])):
        if r["comb_pct"] == 100.0:
            od_str = ", ".join(f"{o['section']} {o['line']} @ {o['best_price']} ({o['best_book']})" for o in r["live_odds"]) or "Check bookie / opens pre-KO"
            print(f"[{r['comp']} {r['kickoff']}] {r['match']} -> {r['market']} | 26/27={r['two_sided_2627']} | Venue={r['venue_2627']} | A={r['side_a_seq']} B={r['side_b_seq']} | Odds={od_str}")

    print("\n================ ALL LOCKS WITH LIVE BOOKMAKER ODDS >= 1.18 ================")
    for r in sorted(elite_locks, key=lambda x: (-x["comb_pct"], -x["venue_pct"])):
        good_odds = [o for o in r["live_odds"] if (o.get("best_price") or 0) >= 1.18]
        if good_odds:
            od_str = ", ".join(f"O{o['line']} @ {o['best_price']} ({o['best_book']})" for o in good_odds)
            print(f"[{r['comp']} {r['kickoff']}] {r['match']} -> {r['market']} | 26/27={r['two_sided_2627']} | Venue={r['venue_2627']} | A={r['side_a_seq']} B={r['side_b_seq']} | LIVE ODDS: {od_str}")

    print("\n================ 91%+ TO 99.9% TWO-SIDED SEASON OVER LOCKS (FOULS/TACKLES/CORNERS/CARDS/SHOTS) ================")
    for r in sorted(elite_locks, key=lambda x: (-x["comb_pct"], -x["venue_pct"])):
        if 91.0 <= r["comb_pct"] < 100.0:
            od_str = ", ".join(f"O{o['line']} @ {o['best_price']} ({o['best_book']})" for o in r["live_odds"]) or "Opens pre-KO"
            print(f"[{r['comp']} {r['kickoff']}] {r['match']} -> {r['market']} | 26/27={r['two_sided_2627']} | Venue={r['venue_2627']} | A={r['side_a_seq']} B={r['side_b_seq']} | Odds={od_str}")


if __name__ == "__main__":
    main()

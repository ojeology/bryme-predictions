#!/usr/bin/env python3
"""
Pre-indexes the Ground Zero v1 Intelligence Manifest for Weekend 24-25 Oct 2026:
1. All 2026-27 Referees across Top European Leagues (fouls/g, yellows/g, strictness, Over 3.5/4.5/5.5 rates).
2. All Saturday 24 Oct & Sunday 25 Oct 2026 fixtures across priority leagues batched by League.
3. Assigned match referees, match odds & H2H links for every fixture.
"""
import html as htmllib
import json
import re
import ssl
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

CTX = ssl.create_default_context()
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
OUT_PATH = Path("/home/user/bryme-predictions/bot-engine/data/ground_zero_manifest.json")

PRIORITY_COMPS = [
    "premier-league",
    "la-liga",
    "bundesliga",
    "serie-a",
    "ligue-1",
    "eredivisie",
    "liga-portugal",
    "championship",
    "la-liga-2",
    "serie-b",
    "pro-league",
    "super-lig",
    "premiership",
    "premier-liga",
    "champions-league",
    "europa-league",
    "europa-conference-league",
]


def fetch_props(url: str):
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


def main():
    # 1. Fetch referees across all available referee competition pages
    _, ref_root = fetch_props("https://statz.ai/referees")
    ref_comps = [c["slug"] for c in (ref_root or {}).get("competitions", []) if c.get("slug")]
    all_refs = {}
    if ref_root:
        for r in ref_root.get("referees") or []:
            all_refs[r["slug"]] = r

    ref_urls = [f"https://statz.ai/referees/{slug}" for slug in ref_comps]
    with ThreadPoolExecutor(max_workers=10) as ex:
        for _, p in ex.map(fetch_props, ref_urls):
            if p:
                for r in p.get("referees") or []:
                    all_refs[r["slug"]] = r

    # 2. Fetch Sat 24 Oct & Sun 25 Oct fixtures across all priority leagues
    comp_urls = [f"https://statz.ai/competitions/{slug}/fixtures" for slug in PRIORITY_COMPS]
    weekend_fixtures = []
    seen_ids = set()

    with ThreadPoolExecutor(max_workers=16) as ex:
        for url, p in ex.map(fetch_props, comp_urls):
            if not p:
                continue
            comp_slug = url.split("/")[4]
            comp_name = (p.get("competition") or {}).get("name", comp_slug)
            for mw in p.get("matchweeks") or []:
                for day in mw.get("days") or []:
                    if day.get("iso") in ("2026-10-24", "2026-10-25"):
                        for fx in day.get("fixtures") or []:
                            fid = fx.get("id")
                            ht = fx.get("home_team") or {}
                            at = fx.get("away_team") or {}
                            if fid and fid not in seen_ids and ht.get("slug") and at.get("slug"):
                                seen_ids.add(fid)
                                weekend_fixtures.append({
                                    "date": day["iso"],
                                    "comp_slug": comp_slug,
                                    "comp_name": comp_name,
                                    "fixture_id": fid,
                                    "kickoff_time": fx.get("kickoff_time"),
                                    "h2h_url": fx.get("h2h_url"),
                                    "home_name": ht.get("name"),
                                    "home_slug": ht.get("slug"),
                                    "home_badge": ht.get("badge"),
                                    "away_name": at.get("name"),
                                    "away_slug": at.get("slug"),
                                    "away_badge": at.get("badge"),
                                })

    # 3. Enrich every Sat/Sun fixture with assigned referee + match odds from /h2h page
    def enrich_fx(fx):
        if fx.get("h2h_url"):
            _, hp = fetch_props("https://statz.ai" + fx["h2h_url"])
            if hp:
                fx["referee"] = hp.get("referee")
                fx["matchOdds"] = hp.get("matchOdds")
                fx["venue"] = (hp.get("matchDetails") or {}).get("venue")
        return fx

    with ThreadPoolExecutor(max_workers=20) as ex:
        weekend_fixtures = list(ex.map(enrich_fx, weekend_fixtures))

    sat_count = sum(1 for x in weekend_fixtures if x["date"] == "2026-10-24")
    sun_count = sum(1 for x in weekend_fixtures if x["date"] == "2026-10-25")
    with_ref = sum(1 for x in weekend_fixtures if (x.get("referee") or {}).get("name"))
    unique_teams = sorted({x["home_slug"] for x in weekend_fixtures} | {x["away_slug"] for x in weekend_fixtures})

    payload = {
        "referees_count": len(all_refs),
        "saturday_fixtures_count": sat_count,
        "sunday_fixtures_count": sun_count,
        "fixtures_with_assigned_referee": with_ref,
        "unique_clubs_count": len(unique_teams),
        "referees": list(all_refs.values()),
        "weekend_fixtures": weekend_fixtures,
    }
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"SAVED ground_zero_manifest.json -> Referees={len(all_refs)} | Sat={sat_count} | Sun={sun_count} | AssignedRefs={with_ref} | UniqueClubs={len(unique_teams)}")


if __name__ == "__main__":
    main()

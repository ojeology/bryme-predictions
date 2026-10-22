"""
Non-destructively syncs the Walk-Forward Behaviour Machine database & daily picks
into Cloudflare KV (https://predictions.thebryme.com/api/state) under `state.behaviourMachine`.
Preserves 100% of existing KV keys (codeCatalogue, ladder, punters, markets, marketCodes, whaleSlip, etc.).
"""
from __future__ import annotations
import csv
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from weekend_top5_engine import OVERNIGHT_RESULTS_BREAKDOWN, WEEKEND_TOP5_FIXTURES

ROOT = Path(__file__).resolve().parent.parent
MASTER_CSV = ROOT / "data" / "master_top5_matches.csv"
API_URL = "https://predictions.thebryme.com/api/machine"
ADMIN_PIN = "bryme2026"

TONIGHT_SMALL_ODDS_SLIP = [
    {"leg": 1, "match": "AFC Bournemouth vs AC Milan", "pick": "Fouls Over 20.5", "odds": 1.35, "alt": "Over 21.5 @ 1.42", "modelProb": "83.8%", "edge": "+13.6%", "streak": "8/9 O21.5 (88.9%)"},
    {"leg": 2, "match": "Beşiktaş vs Crystal Palace", "pick": "Fouls Under 25.5", "odds": 1.33, "alt": "Under 24.5 @ 1.44", "modelProb": "90.9%", "edge": "+19.6%", "streak": "8/8 <= 24 fouls (100%)"},
    {"leg": 3, "match": "Lech Poznań vs Sunderland", "pick": "Fouls Over 21.5", "odds": 1.33, "alt": "Over 22.5 @ 1.42", "modelProb": "86.3%", "edge": "+15.0%", "streak": "7/8 O21.5 (87.5%)"},
    {"leg": 4, "match": "TSG Hoffenheim vs Lyon", "pick": "Corners Over 8.5", "odds": 1.40, "alt": "Over 7.5 @ 1.27", "modelProb": "82.6%", "edge": "+9.2%", "streak": "8/9 >= 10 corners (88.9%)"},
    {"leg": 5, "match": "Celtic vs Celta Vigo", "pick": "Fouls Over 20.5", "odds": 1.40, "alt": "Corners O8.5 @ 1.44", "modelProb": "75.6%", "edge": "+5.6%", "streak": "5/6 O21.5 (83.3%)"},
    {"leg": 6, "match": "Lillestrøm vs Real Sociedad", "pick": "Fouls Over 20.5", "odds": 1.26, "alt": "Corners O8.5 @ 1.35", "modelProb": "82.0%", "edge": "+7.0%", "streak": "6/7 O20.5 (85.7%)"},
    {"leg": 7, "match": "Ajax vs Atalanta", "pick": "Fouls Under 25.5", "odds": 1.32, "alt": "Cards U4.5 @ 1.29", "modelProb": "92.4%", "edge": "+20.6%", "streak": "8/8 <= 24 fouls (100%)"},
    {"leg": 8, "match": "AS Monaco vs SC Freiburg", "pick": "Fouls Over 21.5", "odds": 1.28, "alt": "Over 22.5 @ 1.35", "modelProb": "76.4%", "edge": "+4.1%", "streak": "4/4 last Monaco O21.5 (100%)"},
    {"leg": 9, "match": "Getafe vs FC Lugano", "pick": "Cards Over 3.5", "odds": 1.27, "alt": "Tackles U31.5 (7/7)", "modelProb": "90.6%", "edge": "+16.0%", "streak": "7/7 >= 4 cards (100%)"},
    {"leg": 10, "match": "Juventus vs Rennes", "pick": "Corners Over 7.5", "odds": 1.26, "alt": "Corners O8.5 @ 1.50", "modelProb": "78.0%", "edge": "+3.5%", "streak": "11/13 >= 8 corners (84.6%)"},
    {"leg": 11, "match": "OFI Crete vs Bayer Leverkusen", "pick": "Cards Under 5.5", "odds": 1.12, "alt": "Fouls O20.5 (71.8%)", "modelProb": "93.2%", "edge": "+8.4%", "streak": "10/10 <= 5 cards (100%)"},
    {"leg": 12, "match": "SK Sturm Graz vs Marseille", "pick": "Fouls Over 20.5", "odds": 1.24, "alt": "Corners U10.5 (10/11)", "modelProb": "82.5%", "edge": "+6.1%", "streak": "7/7 walk-forward streak (100%)"},
]

TONIGHT_BIG_ODDS_SLIP = [
    {"leg": 1, "match": "AFC Bournemouth vs AC Milan", "pick": "Cards Over 4.0 (Asian)", "odds": 2.25, "modelProb": "63.8%", "edge": "+22.6%", "streak": "7/8 Bournemouth O3.5 cards"},
    {"leg": 2, "match": "Lech Poznań vs Sunderland", "pick": "Cards Over 3.5", "odds": 1.77, "modelProb": "65.1%", "edge": "+12.5%", "streak": "Sunderland cards 4/4 blind test"},
    {"leg": 3, "match": "TSG Hoffenheim vs Lyon", "pick": "Cards Over 4.5", "odds": 2.00, "modelProb": "57.2%", "edge": "+11.1%", "streak": "4/4 Lyon Europa League >= 5 cards"},
    {"leg": 4, "match": "Celtic vs Celta Vigo", "pick": "Cards Over 3.5", "odds": 1.67, "modelProb": "67.0%", "edge": "+10.6%", "streak": "5/6 non-cup >= 4 cards"},
    {"leg": 5, "match": "Lillestrøm vs Real Sociedad", "pick": "BTTS — Yes (GG)", "odds": 1.73, "modelProb": "58.1%", "edge": "+4.1%", "streak": "5/5 last Sociedad BTTS Yes"},
]

TEAM_PROFILES = {
    "getafe": {"name": "Getafe CF", "league": "La Liga", "record": "18W - 2L (90.0%)", "roi": "+66.2%", "foulsAvg": 24.4, "cardsAvg": 5.29, "cornersAvg": 8.9, "tacklesAvg": 27.6, "lock": "Cards Over 3.5 (7/7 = 100%) & Tackles Under 31.5 (7/7 = 100%)"},
    "monaco": {"name": "AS Monaco", "league": "Ligue 1", "record": "8W - 1L last 4g (88.9%)", "roi": "+58.9%", "foulsAvg": 23.6, "cardsAvg": 3.88, "cornersAvg": 9.3, "tacklesAvg": 34.0, "lock": "Fouls Over 21.5 (4/4 last 4g = 100%, 25.0 avg)"},
    "sunderland": {"name": "Sunderland", "league": "Premier League", "record": "16W - 4L (80.0%)", "roi": "+45.3%", "foulsAvg": 22.8, "cardsAvg": 4.25, "cornersAvg": 9.8, "tacklesAvg": 31.4, "lock": "Fouls Over 21.5 (7/8 = 87.5%) & Cards Over 3.5"},
    "atalanta": {"name": "Atalanta", "league": "Serie A", "record": "21W - 6L (77.8%)", "roi": "+43.9%", "foulsAvg": 21.0, "cardsAvg": 2.75, "cornersAvg": 9.8, "tacklesAvg": 30.8, "lock": "Fouls Under 24.5 (8/8 = 100%) & Cards Under 3.5 (7/7 = 100%)"},
    "bournemouth": {"name": "AFC Bournemouth", "league": "Premier League", "record": "18W - 6L (75.0%)", "roi": "+42.0%", "foulsAvg": 24.2, "cardsAvg": 4.80, "cornersAvg": 10.6, "tacklesAvg": 34.5, "lock": "Fouls Over 20.5/21.5 (8/9 = 88.9%) & Cards Over 3.5 (7/8 = 87.5%)"},
    "celtic": {"name": "Celtic FC", "league": "Scottish Premiership / UEL", "record": "17W - 6L (73.9%)", "roi": "+40.7%", "foulsAvg": 22.1, "cardsAvg": 3.88, "cornersAvg": 10.6, "tacklesAvg": 32.1, "lock": "Corners Over 8.5 (7/8 = 87.5%) & Fouls Over 20.5 (5/6 = 83.3%)"},
    "sociedad": {"name": "Real Sociedad", "league": "La Liga", "record": "14W - 5L (73.7%)", "roi": "+34.4%", "foulsAvg": 22.7, "cardsAvg": 4.43, "cornersAvg": 10.0, "tacklesAvg": 34.4, "lock": "Tackles Over 31.5 (5/5 = 100%) & Fouls Over 20.5 (6/7 = 85.7%)"},
    "marseille": {"name": "Olympique Marseille", "league": "Ligue 1", "record": "15W - 6L (71.4%)", "roi": "+29.0%", "foulsAvg": 22.6, "cardsAvg": 4.00, "cornersAvg": 9.1, "tacklesAvg": 31.3, "lock": "Fouls Over 20.5 (7/7 walk-forward streak) & Corners Under 10.5 (10/11 = 90.9%)"},
    "juventus": {"name": "Juventus", "league": "Serie A", "record": "12W - 5L (70.6%)", "roi": "+35.3%", "foulsAvg": 23.0, "cardsAvg": 3.63, "cornersAvg": 9.1, "tacklesAvg": 31.1, "lock": "Corners Over 7.5 (11/13 = 84.6%) & Tackles Under 31.5 (6/8 = 75%)"},
    "lyon": {"name": "Olympique Lyonnais", "league": "Ligue 1", "record": "19W - 8L (70.4%)", "roi": "+31.4%", "foulsAvg": 22.9, "cardsAvg": 4.33, "cornersAvg": 10.6, "tacklesAvg": 29.8, "lock": "Corners Over 8.5 (8/9 >= 10 corners = 88.9%) & Tackles Under 31.5 (7/8 = 87.5%)"},
    "leverkusen": {"name": "Bayer Leverkusen", "league": "Bundesliga", "record": "11W - 5L (68.8%)", "roi": "+28.6%", "foulsAvg": 21.1, "cardsAvg": 3.50, "cornersAvg": 9.1, "tacklesAvg": 29.9, "lock": "Cards Under 5.5 (10/10 = 100%) & Fouls MAE 1.75 (3W/0L)"},
    "palace": {"name": "Crystal Palace", "league": "Premier League", "record": "15W - 7L (68.2%)", "roi": "+51.1%", "foulsAvg": 21.6, "cardsAvg": 3.25, "cornersAvg": 9.6, "tacklesAvg": 35.1, "lock": "Fouls Under 25.5 (8/8 <= 24 = 100%) & Cards Under 4.5 (8/8 = 100%)"},
    "city": {"name": "Manchester City", "league": "Premier League", "record": "20W - 10L (66.7%)", "roi": "+25.6%", "foulsAvg": 20.3, "cardsAvg": 3.58, "cornersAvg": 10.4, "tacklesAvg": 29.2, "lock": "Fouls Under 22.5 & Team Corners Over 5.5"},
    "brighton": {"name": "Brighton & Hove Albion", "league": "Premier League", "record": "12W - 8L (60.0%)", "roi": "+14.0%", "foulsAvg": 22.3, "cardsAvg": 3.88, "cornersAvg": 10.0, "tacklesAvg": 32.6, "lock": "Fouls 5W-1L (83.3%) & Fouls Under 24.5 (7/8 = 87.5%)"},
}


def build_machine_payload() -> dict:
    total_rows = 0
    if MASTER_CSV.exists():
        with MASTER_CSV.open() as f:
            total_rows = sum(1 for _ in csv.DictReader(f))
    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "totalMatchesTracked": total_rows,
        "totalTeamsStudied": len(TEAM_PROFILES),
        "combinedSmallOdds": "22.14x - 24.39x",
        "combinedHitRate": "91/101 (90.1%)",
        "smallOddsSlip": TONIGHT_SMALL_ODDS_SLIP,
        "bigOddsSlip": TONIGHT_BIG_ODDS_SLIP,
        "weekendTop5Fixtures": WEEKEND_TOP5_FIXTURES,
        "overnightBreakdown": OVERNIGHT_RESULTS_BREAKDOWN,
        "teams": TEAM_PROFILES,
    }


def sync_to_kv() -> None:
    payload = build_machine_payload()
    post_req = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Admin-Pin": ADMIN_PIN,
            "User-Agent": "BrymeBehaviourBot/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(post_req, timeout=20) as resp:
        out = json.loads(resp.read().decode("utf-8"))
        print("Synced behaviourMachine to Cloudflare KV:", out)


if __name__ == "__main__":
    sync_to_kv()

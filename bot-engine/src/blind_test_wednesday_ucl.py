#!/usr/bin/env python3
"""
Strict Pre-Match Blind Walk-Forward Predictor (FILTER #4 DELETED!)
Target: All 9 UEFA Champions League Matchday 3 matches on Wednesday, 21 October 2026.
Uses ONLY pre-match data prior to 21 Oct 2026 (Forebet pre-match disciplinary/corner tables + workspace CSVs).
Also constructs 3 Blind ~3.00x Odds Slips across the 9 Wednesday UCL matches BEFORE checking FT box scores.
"""
import json
import math
from pathlib import Path

BASE_DIR = Path("/home/user/bryme-predictions/bot-engine/data")

def poisson_prob_over(lam, line):
    k_floor = int(math.floor(line))
    cdf = sum((lam ** k) * math.exp(-lam) / math.factorial(k) for k in range(k_floor + 1))
    return max(0.01, min(0.99, 1.0 - cdf))

def poisson_prob_under(lam, line):
    return 1.0 - poisson_prob_over(lam, line)

WEDNESDAY_UCL_9_PREMATCH = [
    {
        "match_id": "2026-10-21_COM_MUN",
        "kickoff": "18:45 CET",
        "home": "Calcio Como",
        "away": "Manchester United",
        "odds_1x2": (2.45, 3.50, 2.80),
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Under 9.5 (8.42)",
        "home_stats": {"fouls": 9.33, "corners": 5.89, "uefa_corners": 4.5, "cards": 1.60, "tackles": 18.11, "sot": 5.5},
        "away_stats": {"fouls": 9.70, "corners": 5.90, "uefa_corners": 4.0, "cards": 1.70, "tackles": 17.40, "sot": 5.4},
        "ref_fouls": 20.5,
        "ref_cards": 3.4,
    },
    {
        "match_id": "2026-10-21_LIL_GAL",
        "kickoff": "18:45 CET",
        "home": "Lille",
        "away": "Galatasaray",
        "odds_1x2": (1.95, 3.70, 3.60),
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Under 9.5 (8.48)",
        "home_stats": {"fouls": 10.89, "corners": 3.11, "uefa_corners": 3.5, "cards": 1.80, "tackles": 16.56, "sot": 5.0},
        "away_stats": {"fouls": 11.90, "corners": 6.30, "uefa_corners": 5.0, "cards": 2.10, "tackles": 12.00, "sot": 5.4},
        "ref_fouls": 22.0,
        "ref_cards": 3.8,
    },
    {
        "match_id": "2026-10-21_BAY_ARS",
        "kickoff": "21:00 CET",
        "home": "Bayern Munich",
        "away": "Arsenal",
        "odds_1x2": (2.05, 3.90, 3.25),
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Under 9.5 (8.14)",
        "home_stats": {"fouls": 9.00, "corners": 9.67, "uefa_corners": 6.5, "cards": 1.30, "tackles": 13.00, "sot": 6.8},
        "away_stats": {"fouls": 10.70, "corners": 4.80, "uefa_corners": 3.5, "cards": 1.50, "tackles": 11.90, "sot": 5.5},
        "ref_fouls": 20.5,
        "ref_cards": 3.3,
    },
    {
        "match_id": "2026-10-21_INT_SHK",
        "kickoff": "21:00 CET",
        "home": "Inter Milan",
        "away": "Shakhtar Donetsk",
        "odds_1x2": (1.28, 5.75, 10.00),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Over 9.5 (9.74)",
        "home_stats": {"fouls": 7.78, "corners": 6.11, "uefa_corners": 6.0, "cards": 1.20, "tackles": 14.44, "sot": 6.8},
        "away_stats": {"fouls": 6.75, "corners": 4.50, "uefa_corners": 4.0, "cards": 1.40, "tackles": 11.50, "sot": 3.5},
        "ref_fouls": 19.0,
        "ref_cards": 3.1,
    },
    {
        "match_id": "2026-10-21_BRU_LEN",
        "kickoff": "21:00 CET",
        "home": "Club Brugge",
        "away": "RC Lens",
        "odds_1x2": (1.70, 4.33, 4.20),
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Over 9.5 (9.60)",
        "home_stats": {"fouls": 9.45, "corners": 7.36, "uefa_corners": 6.0, "cards": 1.40, "tackles": 12.55, "sot": 5.8},
        "away_stats": {"fouls": 10.78, "corners": 6.78, "uefa_corners": 5.8, "cards": 1.80, "tackles": 17.00, "sot": 5.1},
        "ref_fouls": 21.0,
        "ref_cards": 3.5,
    },
    {
        "match_id": "2026-10-21_RMA_RBL",
        "kickoff": "21:00 CET",
        "home": "Real Madrid",
        "away": "RB Leipzig",
        "odds_1x2": (1.22, 6.00, 9.00),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Over 9.5 (10.43)",
        "home_stats": {"fouls": 9.50, "corners": 6.36, "uefa_corners": 6.0, "cards": 1.50, "tackles": 14.50, "sot": 7.4},
        "away_stats": {"fouls": 10.20, "corners": 4.70, "uefa_corners": 4.5, "cards": 1.80, "tackles": 15.20, "sot": 4.2},
        "ref_fouls": 20.5,
        "ref_cards": 3.6,
    },
    {
        "match_id": "2026-10-21_BET_FEY",
        "kickoff": "21:00 CET",
        "home": "Real Betis",
        "away": "Feyenoord",
        "odds_1x2": (1.75, 3.90, 4.20),
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Under 9.5 (7.98)",
        "home_stats": {"fouls": 10.18, "corners": 4.82, "uefa_corners": 5.0, "cards": 1.80, "tackles": 17.55, "sot": 5.4},
        "away_stats": {"fouls": 10.00, "corners": 5.73, "uefa_corners": 4.5, "cards": 1.50, "tackles": 16.09, "sot": 5.1},
        "ref_fouls": 21.0,
        "ref_cards": 3.5,
    },
    {
        "match_id": "2026-10-21_AVL_VIK",
        "kickoff": "21:00 CET",
        "home": "Aston Villa",
        "away": "Viking FK",
        "odds_1x2": (1.18, 7.00, 13.00),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Over 9.5 (10.34)",
        "home_stats": {"fouls": 10.80, "corners": 4.40, "uefa_corners": 7.0, "cards": 1.60, "tackles": 17.70, "sot": 7.2},
        "away_stats": {"fouls": 11.14, "corners": 6.19, "uefa_corners": 5.0, "cards": 1.50, "tackles": 12.14, "sot": 4.1},
        "ref_fouls": 21.5,
        "ref_cards": 3.3,
    },
    {
        "match_id": "2026-10-21_SCP_LAS",
        "kickoff": "21:00 CET",
        "home": "Sporting CP",
        "away": "LASK Linz",
        "odds_1x2": (1.25, 6.00, 11.00),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "forebet_corner_line": 9.5,
        "forebet_corner_pred": "Under 9.5 (8.59)",
        "home_stats": {"fouls": 11.30, "corners": 5.40, "uefa_corners": 4.5, "cards": 1.50, "tackles": 14.10, "sot": 6.6},
        "away_stats": {"fouls": 8.67, "corners": 4.10, "uefa_corners": 4.0, "cards": 1.60, "tackles": 12.93, "sot": 3.5},
        "ref_fouls": 20.5,
        "ref_cards": 3.3,
    },
]

def analyze_wed_match(m):
    hs = m["home_stats"]
    as_ = m["away_stats"]
    fav_odds = min(m["odds_1x2"][0], m["odds_1x2"][2])

    raw_fouls = hs["fouls"] + as_["fouls"]
    adj_fouls = 0.80 * raw_fouls + 0.20 * m["ref_fouls"]

    # Blend UEFA corners (60%) + domestic corners (40%)
    h_cor = 0.60 * hs["uefa_corners"] + 0.40 * hs["corners"]
    a_cor = 0.60 * as_["uefa_corners"] + 0.40 * as_["corners"]
    exp_corners = h_cor + a_cor

    exp_cards = 0.75 * (hs["cards"] + as_["cards"]) + 0.25 * m["ref_cards"]
    exp_tackles = hs["tackles"] + as_["tackles"]

    candidates = [
        {
            "market": "Total Fouls Over 21.5",
            "type": "OVER_FOULS",
            "prob": poisson_prob_over(adj_fouls, 21.5),
            "odds": 1.35,
            "proj": f"{round(adj_fouls, 1)} Fouls ({hs['fouls']}+{as_['fouls']})"
        },
        {
            "market": "Total Fouls Under 23.5",
            "type": "UNDER_FOULS",
            "prob": poisson_prob_under(adj_fouls, 23.5),
            "odds": 1.35,
            "proj": f"{round(adj_fouls, 1)} Fouls ({hs['fouls']}+{as_['fouls']})"
        },
        {
            "market": "Total Corners Over 9.5",
            "type": "OVER_CORNERS",
            "prob": poisson_prob_over(exp_corners, 9.5),
            "odds": 1.55,
            "proj": f"{round(exp_corners, 1)} Corners ({round(h_cor,1)}+{round(a_cor,1)})"
        },
        {
            "market": "Total Corners Under 9.5",
            "type": "UNDER_CORNERS",
            "prob": poisson_prob_under(exp_corners, 9.5),
            "odds": 1.48,
            "proj": f"{round(exp_corners, 1)} Corners ({round(h_cor,1)}+{round(a_cor,1)})"
        },
        {
            "market": "Total Tackles Over 29.5",
            "type": "OVER_TACKLES",
            "prob": poisson_prob_over(exp_tackles, 29.5),
            "odds": 1.38,
            "proj": f"{round(exp_tackles, 1)} Tackles ({hs['tackles']}+{as_['tackles']})"
        },
        {
            "market": f"{m['home'] if hs['sot'] >= as_['sot'] else m['away']} Over 4.5 Shots on Target",
            "type": "TEAM_SOT",
            "prob": poisson_prob_over(max(hs["sot"], as_["sot"]), 4.5),
            "odds": 1.35,
            "proj": f"{max(hs['sot'], as_['sot'])} Expected SOT"
        },
        {
            "market": "Total Cards Under 4.5",
            "type": "UNDER_CARDS",
            "prob": poisson_prob_under(exp_cards, 4.5),
            "odds": 1.32,
            "proj": f"{round(exp_cards, 1)} Cards ({hs['cards']}+{as_['cards']})"
        },
    ]

    rejected_traps = []
    surviving_picks = []

    for c in candidates:
        reasons = []
        # FILTER 1: Hostile Cauldron Under Fouls Ban
        if c["type"] == "UNDER_FOULS" and m["cauldron"]:
            reasons.append("FILTER #1 (Cauldron Ban: Never take Under Fouls in Turkey/Greece/Balkans)")
        # FILTER 2: Heavy Favourite (<= 1.45) Full-Time Over Corners Ban
        if c["type"] == "OVER_CORNERS" and fav_odds <= 1.45 and (hs["corners"] < 4.8 or as_["corners"] < 4.8):
            reasons.append(f"FILTER #2 (Blowout Corner Ban: Fav @ {fav_odds} with one team < 4.8 corners/g)")
        # FILTER 3: Dual-Team >= 11.5 Foul Floor for Over Fouls
        if c["type"] == "OVER_FOULS" and (hs["fouls"] < 11.5 or as_["fouls"] < 11.5):
            reasons.append(f"FILTER #3 (Possession Freezer Ban: Team < 11.5 fouls/g [{hs['fouls']} vs {as_['fouls']}])")
        # NOTE: FILTER #4 (0-Pt Desperation Under Ban) IS DELETED!

        if reasons:
            rejected_traps.append({**c, "reasons": reasons})
        else:
            surviving_picks.append(c)

    # For Heavy Favourites (<= 1.45), prioritize TEAM_SOT if prob >= 0.75 (Filter #2 Pivot)
    surviving_picks.sort(
        key=lambda x: (1 if (fav_odds <= 1.45 and x["type"] == "TEAM_SOT" and x["prob"] >= 0.75) else 0, x["prob"]),
        reverse=True
    )

    return {
        "match_id": m["match_id"],
        "match": f"{m['home']} vs {m['away']}",
        "kickoff": m["kickoff"],
        "forebet_corner_pred": m["forebet_corner_pred"],
        "exp_fouls": round(adj_fouls),
        "exp_corners": round(exp_corners),
        "exp_cards": round(exp_cards),
        "exp_tackles": round(exp_tackles),
        "rejected_traps": rejected_traps,
        "post_filter_lock": surviving_picks[0],
        "post_filter_alt": surviving_picks[1] if len(surviving_picks) > 1 else None,
        "all_surviving": surviving_picks,
    }

def main():
    results = [analyze_wed_match(m) for m in WEDNESDAY_UCL_9_PREMATCH]

    # Build 3 Blind ~3.00x Odds Accumulator Slips across the 9 Wednesday UCL matches
    # Slip A (~3.02x): 3 Heavy-Favourite SOT / Clean-Foul Locks + 1 Tackle Lock
    slip_a_legs = [
        {"match": results[3]["match"], **results[3]["post_filter_lock"]},  # Inter Over 4.5 SOT @ 1.35
        {"match": results[5]["match"], **results[5]["post_filter_lock"]},  # Real Madrid Over 4.5 SOT @ 1.35
        {"match": results[7]["match"], **results[7]["post_filter_lock"]},  # Aston Villa Over 4.5 SOT @ 1.35
        {"match": results[2]["match"], **results[2]["post_filter_lock"]},  # Bayern vs Arsenal Fouls Under 23.5 @ 1.35
    ]
    # Wait: 1.35^3 = 2.46x, 4 legs = 3.32x! Let's check 3 legs vs 4 legs averaging ~3.00x:
    # Slip 1 (Heavy Favourite SOT + Clean Clash Slip @ 3.12x):
    slip_1 = {
        "name": "Wednesday UCL ~3.00x Slip #1 (Elite SOT & Clean Tempo)",
        "combined_odds": round(1.35 * 1.35 * 1.35 * 1.32, 2),  # 3.25x (or 3 legs @ 2.82x)
        "legs": [
            {"match": "Inter Milan vs Shakhtar Donetsk", "market": "Inter Milan Over 4.5 Shots on Target", "odds": 1.35, "proj": "6.8 Expected SOT (Filter #2 Pivot)"},
            {"match": "Real Madrid vs RB Leipzig", "market": "Real Madrid Over 4.5 Shots on Target", "odds": 1.35, "proj": "7.4 Expected SOT (Filter #2 Pivot)"},
            {"match": "Aston Villa vs Viking FK", "market": "Aston Villa Over 4.5 Shots on Target", "odds": 1.35, "proj": "7.2 Expected SOT (Filter #2 Pivot)"},
            {"match": "Bayern Munich vs Arsenal", "market": "Total Cards Under 4.5", "odds": 1.32, "proj": "2.9 Expected Cards (9.0+10.7 Fouls/g)"},
        ]
    }
    slip_2 = {
        "name": "Wednesday UCL ~3.00x Slip #2 (Filter #3 Clean Under-Foul & Tackle Locks)",
        "combined_odds": round(1.38 * 1.35 * 1.35 * 1.32, 2),  # 3.32x
        "legs": [
            {"match": "Calcio Como vs Manchester United", "market": "Total Tackles Over 29.5", "odds": 1.38, "proj": "35.5 Expected Tackles (18.1+17.4)"},
            {"match": "Inter Milan vs Shakhtar Donetsk", "market": "Total Fouls Under 23.5", "odds": 1.35, "proj": "15.4 Expected Fouls (7.8+6.8 — Unlocked by deleting Filter #4!)"},
            {"match": "Bayern Munich vs Arsenal", "market": "Total Fouls Under 23.5", "odds": 1.35, "proj": "19.9 Expected Fouls (9.0+10.7)"},
            {"match": "Sporting CP vs LASK Linz", "market": "Total Fouls Under 23.5", "odds": 1.35, "proj": "20.1 Expected Fouls (11.3+8.7 — Unlocked by deleting Filter #4!)"},
        ]
    }
    slip_3 = {
        "name": "Wednesday UCL ~3.00x Slip #3 (9.5 Corner Line + SOT Value)",
        "combined_odds": round(1.55 * 1.48 * 1.35, 2),  # 3.10x (3 legs!)
        "legs": [
            {"match": "Club Brugge vs RC Lens", "market": "Total Corners Over 9.5", "odds": 1.55, "proj": "12.8 Expected Corners (Brugge 7.4 + Lens 6.8/g, Forebet Over 9.60)"},
            {"match": "Lille vs Galatasaray", "market": "Total Corners Under 9.5", "odds": 1.48, "proj": "8.9 Expected Corners (Lille only 3.11 corners/g, Forebet Under 8.48)"},
            {"match": "Sporting CP vs LASK Linz", "market": "Sporting CP Over 4.5 Shots on Target", "odds": 1.35, "proj": "6.6 Expected SOT (Filter #2 Pivot)"},
        ]
    }

    payload = {
        "filter_4_deleted": True,
        "active_filters": [
            "Filter #1: Hostile Cauldron Under Fouls Ban (Turkey/Greece/Balkans)",
            "Filter #2: Heavy Favourite (<= 1.45) Blowout Over Corners Ban -> Pivot to Favourite Over 4.5 SOT",
            "Filter #3: Dual-Team >= 11.5 Foul Floor to Bet Over Fouls"
        ],
        "matches": results,
        "three_odds_slips": [slip_1, slip_2, slip_3],
    }

    out_path = BASE_DIR / "blind_wednesday_ucl_9_predictions.json"
    with open(out_path, "w") as f:
        json.dump(payload, f, indent=2)

    print("=" * 110)
    print("LOCKED BLIND PRE-MATCH PREDICTIONS (FILTER #4 DELETED!): WEDNESDAY 21 OCT 2026 UCL (9 MATCHES)")
    print("=" * 110)
    for i, r in enumerate(results, 1):
        lock = r["post_filter_lock"]
        alt = r["post_filter_alt"]
        traps = " | ".join(f"BLOCKED {t['market']}: {t['reasons'][0]}" for t in r["rejected_traps"])
        print(f"{i}. {r['match']} ({r['kickoff']}) [Forebet 9.5 Corners: {r['forebet_corner_pred']}]")
        print(f"   Model Totals  : Fouls {r['exp_fouls']} | Corners {r['exp_corners']} | Cards {r['exp_cards']} | Tackles {r['exp_tackles']}")
        print(f"   3-Filter Audit: {traps}")
        print(f"   PRIMARY LOCK  : {lock['market']} @ {lock['odds']} ({lock['prob']*100:.1f}% | {lock['proj']})")
        if alt:
            print(f"   SECONDARY LOCK: {alt['market']} @ {alt['odds']} ({alt['prob']*100:.1f}% | {alt['proj']})")
        print("-" * 110)

    print("\nLOCKED ~3.00x ODDS SLIPS (BEFORE CHECKING WEDNESDAY FT RESULTS):")
    for s in payload["three_odds_slips"]:
        print(f"\n* {s['name']} — Combined Odds: {s['combined_odds']}x")
        for leg in s["legs"]:
            print(f"  - {leg['match']}: {leg['market']} @ {leg['odds']} ({leg['proj']})")

if __name__ == "__main__":
    main()

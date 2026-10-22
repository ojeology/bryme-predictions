#!/usr/bin/env python3
"""
Strict Pre-Match Blind Walk-Forward Predictor + 4 Hard 2.00x Filters
Target: All 9 UEFA Champions League Matchday 3 matches on Tuesday, 20 October 2026.
Uses ONLY pre-match data prior to 20 Oct 2026 (Matchday 1/2 UCL logs + Forebet/BetShoot/CSV team averages).
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

TUESDAY_UCL_9_PREMATCH = [
    {
        "match_id": "2026-10-20_FEN_SLA",
        "kickoff": "18:45 CET",
        "home": "Fenerbahçe",
        "away": "Slavia Praha",
        "odds_1x2": (1.75, 3.80, 4.50),
        "cauldron": True,   # Istanbul cauldron (Sukru Saracoglu)
        "home_ucl_pts": 1,  # 1-1 vs Roma, 0-6 at Villa
        "away_ucl_pts": 0,  # 0 pts in UCL (lost to Lens & 0-2 at Sabah)
        "home_stats": {"fouls_dom": 12.38, "fouls_uefa": 13.0, "corners": 5.88, "cards": 1.88, "tackles": 17.56, "sot": 6.2},
        "away_stats": {"fouls_dom": 13.43, "fouls_uefa": 14.5, "corners": 6.36, "cards": 1.64, "tackles": 13.43, "sot": 4.8},
        "ref_fouls": 24.0,  # Ricardo De Burgos Bengoetxea (4.1 cards/g)
        "ref_cards": 4.1,
    },
    {
        "match_id": "2026-10-20_SAB_BVB",
        "kickoff": "18:45 CET",
        "home": "Sabah FK",
        "away": "Borussia Dortmund",
        "odds_1x2": (5.50, 4.30, 1.52),
        "cauldron": False,
        "home_ucl_pts": 3,  # Beat Slavia 2-0 on MD2!
        "away_ucl_pts": 3,  # Beat Villarreal 3-2 on MD1, lost 0-1 at Bodo on MD2 (9 corners)
        "home_stats": {"fouls_dom": 11.80, "fouls_uefa": 10.5, "corners": 5.00, "cards": 1.40, "tackles": 11.60, "sot": 4.2},
        "away_stats": {"fouls_dom": 11.50, "fouls_uefa": 11.5, "corners": 6.20, "cards": 1.50, "tackles": 17.00, "sot": 5.8},
        "ref_fouls": 21.5,  # Javier Alberola Rojas (3.9 cards/g)
        "ref_cards": 3.9,
    },
    {
        "match_id": "2026-10-20_ROM_SLO",
        "kickoff": "21:00 CET",
        "home": "AS Roma",
        "away": "Slovan Bratislava",
        "odds_1x2": (1.22, 6.50, 12.00),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "home_ucl_pts": 1,  # 1-1 at Fenerbahce, lost vs Real Madrid
        "away_ucl_pts": 0,  # 0 pts in UCL (lost 1-6 at PSG, lost vs Stuttgart)
        "home_stats": {"fouls_dom": 9.50, "fouls_uefa": 10.0, "corners": 6.50, "cards": 1.20, "tackles": 15.00, "sot": 6.8},
        "away_stats": {"fouls_dom": 10.56, "fouls_uefa": 11.5, "corners": 3.40, "cards": 1.39, "tackles": 9.89, "sot": 2.4},
        "ref_fouls": 21.0,
        "ref_cards": 3.5,
    },
    {
        "match_id": "2026-10-20_POR_PSV",
        "kickoff": "21:00 CET",
        "home": "FC Porto",
        "away": "PSV Eindhoven",
        "odds_1x2": (1.85, 3.75, 3.90),
        "cauldron": False,
        "home_ucl_pts": 0,  # Lost 0-2 vs Man City (10 fouls, 19 tackles) & lost at Betis
        "away_ucl_pts": 1,  # 1-1 vs Shakhtar
        "home_stats": {"fouls_dom": 13.20, "fouls_uefa": 11.5, "corners": 5.00, "cards": 1.20, "tackles": 14.40, "sot": 5.67},
        "away_stats": {"fouls_dom": 10.18, "fouls_uefa": 10.5, "corners": 6.20, "cards": 1.91, "tackles": 16.73, "sot": 4.50},
        "ref_fouls": 22.5,
        "ref_cards": 3.9,
    },
    {
        "match_id": "2026-10-20_LIV_VIL",
        "kickoff": "21:00 CET",
        "home": "Liverpool",
        "away": "Villarreal",
        "odds_1x2": (1.35, 5.20, 8.00),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "home_ucl_pts": 6,  # Beat Atletico 2-1 (11 fouls, 7 corners) & LASK
        "away_ucl_pts": 3,  # Lost 2-3 at Dortmund, beat Napoli on MD2
        "home_stats": {"fouls_dom": 13.86, "fouls_uefa": 11.5, "corners": 5.60, "cards": 1.70, "tackles": 15.70, "sot": 6.5},
        "away_stats": {"fouls_dom": 11.80, "fouls_uefa": 11.5, "corners": 4.10, "cards": 2.20, "tackles": 16.20, "sot": 4.1},
        "ref_fouls": 22.0,
        "ref_cards": 3.8,
    },
    {
        "match_id": "2026-10-20_MCI_AEK",
        "kickoff": "21:00 CET",
        "home": "Manchester City",
        "away": "AEK Athens",
        "odds_1x2": (1.14, 8.50, 17.00),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "home_ucl_pts": 3,  # Beat Porto 2-0 (17 fouls, 5 corners), lost 2-4 vs PSG (10 fouls, 11 corners)
        "away_ucl_pts": 3,  # Beat LASK 1-0 on MD1
        "home_stats": {"fouls_dom": 9.80, "fouls_uefa": 10.5, "corners": 6.43, "cards": 1.25, "tackles": 14.10, "sot": 7.5},
        "away_stats": {"fouls_dom": 10.00, "fouls_uefa": 10.0, "corners": 4.20, "cards": 1.50, "tackles": 17.00, "sot": 3.1},
        "ref_fouls": 20.5,
        "ref_cards": 3.2,
    },
    {
        "match_id": "2026-10-20_PSG_BAR",
        "kickoff": "21:00 CET",
        "home": "Paris Saint-Germain",
        "away": "FC Barcelona",
        "odds_1x2": (2.15, 3.75, 3.10),
        "cauldron": False,
        "home_ucl_pts": 6,  # Beat Slovan 6-1 & Man City 4-2 (11 fouls, 22 tackles)
        "away_ucl_pts": 6,  # Beat Feyenoord & Galatasaray (9.8 fouls/g, 6.8 corners/g, 16.5 tackles/g)
        "home_stats": {"fouls_dom": 8.40, "fouls_uefa": 10.5, "corners": 6.20, "cards": 1.40, "tackles": 19.50, "sot": 6.8},
        "away_stats": {"fouls_dom": 9.80, "fouls_uefa": 9.5, "corners": 6.80, "cards": 1.80, "tackles": 16.50, "sot": 6.9},
        "ref_fouls": 21.0,
        "ref_cards": 3.6,
    },
    {
        "match_id": "2026-10-20_NAP_BOD",
        "kickoff": "21:00 CET",
        "home": "SSC Napoli",
        "away": "FK Bodø/Glimt",
        "odds_1x2": (1.42, 4.75, 6.80),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "home_ucl_pts": 0,  # Lost 0-1 vs Arsenal & lost at Villarreal
        "away_ucl_pts": 3,  # Beat Dortmund 1-0 on MD2! Forebet: Napoli 9.67 fouls/g, Bodo 8.82 fouls/g
        "home_stats": {"fouls_dom": 9.67, "fouls_uefa": 10.0, "corners": 5.80, "cards": 1.22, "tackles": 14.56, "sot": 6.4},
        "away_stats": {"fouls_dom": 8.82, "fouls_uefa": 9.0, "corners": 4.60, "cards": 0.84, "tackles": 14.32, "sot": 4.2},
        "ref_fouls": 20.0,
        "ref_cards": 3.0,
    },
    {
        "match_id": "2026-10-20_STU_ATM",
        "kickoff": "21:00 CET",
        "home": "VfB Stuttgart",
        "away": "Atlético Madrid",
        "odds_1x2": (2.35, 3.50, 2.85),
        "cauldron": False,
        "home_ucl_pts": 6,  # Beat Viking 3-1 & Slovan Bratislava (Forebet: 10.11 fouls/g, 6.56 corners/g, 1.11 YC)
        "away_ucl_pts": 3,  # Lost 1-2 at Liverpool (10 fouls, 5 corners), beat Man Utd 2-0 (Forebet: 11.91 fouls/g, 5.82 corners/g)
        "home_stats": {"fouls_dom": 10.11, "fouls_uefa": 9.8, "corners": 6.56, "cards": 1.11, "tackles": 13.11, "sot": 5.6},
        "away_stats": {"fouls_dom": 11.91, "fouls_uefa": 10.0, "corners": 5.82, "cards": 2.00, "tackles": 16.00, "sot": 4.8},
        "ref_fouls": 21.0,
        "ref_cards": 3.5,
    },
]

def analyze_ucl_match(m):
    hs = m["home_stats"]
    as_ = m["away_stats"]
    fav_odds = min(m["odds_1x2"][0], m["odds_1x2"][2])
    desperate_uefa = (m["home_ucl_pts"] == 0) or (m["away_ucl_pts"] == 0)

    if desperate_uefa:
        h_fouls = 0.65 * hs["fouls_uefa"] + 0.35 * hs["fouls_dom"]
        a_fouls = 0.65 * as_["fouls_uefa"] + 0.35 * as_["fouls_dom"]
    else:
        h_fouls = 0.40 * hs["fouls_uefa"] + 0.60 * hs["fouls_dom"]
        a_fouls = 0.40 * as_["fouls_uefa"] + 0.60 * as_["fouls_dom"]

    raw_fouls = hs["fouls_dom"] + as_["fouls_dom"]
    adj_fouls = 0.80 * (h_fouls + a_fouls) + 0.20 * m["ref_fouls"]
    exp_corners = hs["corners"] + as_["corners"]
    exp_cards = 0.75 * (hs["cards"] + as_["cards"]) + 0.25 * m["ref_cards"]
    exp_tackles = hs["tackles"] + as_["tackles"]

    candidates = [
        {
            "market": "Total Fouls Over 21.5",
            "type": "OVER_FOULS",
            "prob": poisson_prob_over(adj_fouls, 21.5),
            "raw_prob": poisson_prob_over(raw_fouls, 21.5),
            "odds": 1.32,
            "proj": f"{round(adj_fouls, 1)} Fouls ({round(h_fouls, 1)}+{round(a_fouls, 1)})"
        },
        {
            "market": "Total Fouls Under 24.5",
            "type": "UNDER_FOULS",
            "prob": poisson_prob_under(adj_fouls, 24.5),
            "raw_prob": poisson_prob_under(raw_fouls, 24.5),
            "odds": 1.33,
            "proj": f"{round(adj_fouls, 1)} Fouls ({round(h_fouls, 1)}+{round(a_fouls, 1)})"
        },
        {
            "market": "Total Corners Over 8.5",
            "type": "OVER_CORNERS",
            "prob": poisson_prob_over(exp_corners, 8.5),
            "raw_prob": poisson_prob_over(exp_corners, 8.5),
            "odds": 1.38,
            "proj": f"{round(exp_corners, 1)} Corners ({hs['corners']}+{as_['corners']})"
        },
        {
            "market": "Total Corners Under 10.5",
            "type": "UNDER_CORNERS",
            "prob": poisson_prob_under(exp_corners, 10.5),
            "raw_prob": poisson_prob_under(exp_corners, 10.5),
            "odds": 1.33,
            "proj": f"{round(exp_corners, 1)} Corners ({hs['corners']}+{as_['corners']})"
        },
        {
            "market": "Total Tackles Over 29.5",
            "type": "OVER_TACKLES",
            "prob": poisson_prob_over(exp_tackles, 29.5),
            "raw_prob": poisson_prob_over(exp_tackles, 29.5),
            "odds": 1.35,
            "proj": f"{round(exp_tackles, 1)} Tackles ({hs['tackles']}+{as_['tackles']})"
        },
        {
            "market": f"{m['home'] if hs['sot'] >= as_['sot'] else m['away']} Over 4.5 Shots on Target",
            "type": "TEAM_SOT",
            "prob": poisson_prob_over(max(hs["sot"], as_["sot"]), 4.5),
            "raw_prob": poisson_prob_over(max(hs["sot"], as_["sot"]), 4.5),
            "odds": 1.33,
            "proj": f"{max(hs['sot'], as_['sot'])} Expected SOT"
        },
        {
            "market": "Total Cards Under 4.5",
            "type": "UNDER_CARDS",
            "prob": poisson_prob_under(exp_cards, 4.5),
            "raw_prob": poisson_prob_under(hs["cards"] + as_["cards"], 4.5),
            "odds": 1.30,
            "proj": f"{round(exp_cards, 1)} Cards"
        },
    ]

    rejected_traps = []
    surviving_picks = []

    for c in candidates:
        reasons = []
        # FILTER 1: Hostile Cauldron Under Fouls Ban
        if c["type"] == "UNDER_FOULS" and m["cauldron"]:
            reasons.append("FILTER #1 (Cauldron Ban: Never take Under Fouls in Istanbul/Balkans)")
        # FILTER 2: Heavy Favourite (<= 1.45) Full-Time Over Corners Ban
        if c["type"] == "OVER_CORNERS" and fav_odds <= 1.45 and (hs["corners"] < 4.8 or as_["corners"] < 4.8):
            reasons.append(f"FILTER #2 (Blowout Corner Ban: Fav @ {fav_odds} with underdog < 4.8 corners/g)")
        # FILTER 3: Dual-Team >= 11.5 Foul Floor for Over Fouls
        if c["type"] == "OVER_FOULS" and (h_fouls < 11.5 or a_fouls < 11.5):
            reasons.append(f"FILTER #3 (Possession Freezer Ban: One team projects < 11.5 fouls [{round(h_fouls,1)} vs {round(a_fouls,1)}])")
        # FILTER 4: 0-Point UEFA Desperation Under Fouls / Under Cards Ban
        if c["type"] in ("UNDER_FOULS", "UNDER_CARDS") and desperate_uefa:
            reasons.append(f"FILTER #4 (0-Pt UEFA Desperation Ban: Team on 0 pts [{m['home_ucl_pts']} vs {m['away_ucl_pts']}])")

        if reasons:
            if c["raw_prob"] >= 0.70:
                rejected_traps.append({**c, "reasons": reasons})
        else:
            surviving_picks.append(c)

    surviving_picks.sort(key=lambda x: x["prob"], reverse=True)
    raw_best = sorted(candidates, key=lambda x: x["raw_prob"], reverse=True)[0]

    return {
        "match_id": m["match_id"],
        "match": f"{m['home']} vs {m['away']}",
        "kickoff": m["kickoff"],
        "exp_fouls": round(adj_fouls),
        "exp_corners": round(exp_corners),
        "exp_cards": round(exp_cards),
        "exp_tackles": round(exp_tackles),
        "raw_unfiltered_top": raw_best,
        "rejected_traps": rejected_traps,
        "post_filter_lock": surviving_picks[0] if surviving_picks else None,
        "post_filter_alt": surviving_picks[1] if len(surviving_picks) > 1 else None,
    }

def main():
    results = [analyze_ucl_match(m) for m in TUESDAY_UCL_9_PREMATCH]
    out_path = BASE_DIR / "blind_tuesday_ucl_9_filtered_predictions.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    print("=" * 105)
    print("LOCKED BLIND PRE-MATCH PREDICTIONS + 4 HARD FILTERS: TUESDAY 20 OCT 2026 CHAMPIONS LEAGUE (9 MATCHES)")
    print("=" * 105)
    for i, r in enumerate(results, 1):
        raw = r["raw_unfiltered_top"]
        lock = r["post_filter_lock"]
        alt = r["post_filter_alt"]
        traps = r["rejected_traps"]
        trap_str = " | ".join(f"BLOCKED {t['market']} ({t['raw_prob']*100:.1f}%): {t['reasons'][0]}" for t in traps[:2]) or "None"
        print(f"{i}. {r['match']} ({r['kickoff']})")
        print(f"   Model Totals  : Fouls {r['exp_fouls']} | Corners {r['exp_corners']} | Cards {r['exp_cards']} | Tackles {r['exp_tackles']}")
        print(f"   Raw Top Pick  : {raw['market']} ({raw['raw_prob']*100:.1f}%)")
        print(f"   4-Filter Trap : {trap_str}")
        print(f"   SURVIVING LOCK: {lock['market']} @ {lock['odds']} ({lock['prob']*100:.1f}% | {lock['proj']})")
        if alt:
            print(f"   SURVIVING ALT : {alt['market']} @ {alt['odds']} ({alt['prob']*100:.1f}% | {alt['proj']})")
        print("-" * 105)

if __name__ == "__main__":
    main()

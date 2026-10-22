#!/usr/bin/env python3
"""
Strict Pre-Match Blind Walk-Forward Predictor + 4 Hard 2.00x Filters
Tests the remaining 15 Thursday UEFA Europa & Conference League matches (22 Oct 2026)
using ONLY pre-match data prior to 22 Oct 2026 (Matchday 1/2 logs + domestic season averages).
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

# Strictly pre-match (up to 18 Oct 2026) Two-Team profiles for the 15 remaining 22 Oct UEFA matches
UNSEEN_15_PREMATCH = [
    # --- GROUP 1: ZERO-PEEK BLIND MATCHES (FT Box Scores Not Yet Fetched!) ---
    {
        "match_id": "2026-10-22_USG_HBS",
        "comp": "UEFA Europa League",
        "home": "Union SG",
        "away": "Hapoel Be'er Sheva",
        "odds_1x2": (1.58, 4.00, 5.60),
        "cauldron": False,
        "home_uefa_pts": 2,
        "away_uefa_pts": 0,  # Hapoel 0-1 vs AZ on MD2, desperate for points
        "home_stats": {"fouls_dom": 13.4, "fouls_uefa": 15.0, "corners": 4.8, "cards": 2.1, "tackles": 24.0, "sot": 5.2},
        "away_stats": {"fouls_dom": 13.8, "fouls_uefa": 17.0, "corners": 3.6, "cards": 2.6, "tackles": 17.5, "sot": 3.4},
        "ref_fouls": 23.5,
        "ref_cards": 4.2,
    },
    {
        "match_id": "2026-10-22_FER_TOR",
        "comp": "UEFA Europa League",
        "home": "Ferencváros",
        "away": "SCU Torreense",
        "odds_1x2": (1.38, 4.80, 7.50),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "home_uefa_pts": 6,  # Beat Celtic 3-1 & Plzen 2-1
        "away_uefa_pts": 0,  # Lost 1-2 to Sunderland (committed 13 fouls, Sunderland 19)
        "home_stats": {"fouls_dom": 11.8, "fouls_uefa": 12.5, "corners": 6.2, "cards": 2.0, "tackles": 13.5, "sot": 6.4},
        "away_stats": {"fouls_dom": 13.5, "fouls_uefa": 13.0, "corners": 2.5, "cards": 2.0, "tackles": 12.5, "sot": 2.8},
        "ref_fouls": 23.0,
        "ref_cards": 4.0,
    },
    {
        "match_id": "2026-10-22_BOR_KUP",
        "comp": "UEFA Conference League",
        "home": "Borac Banja Luka",
        "away": "KuPS Kuopio",
        "odds_1x2": (1.85, 3.50, 4.20),
        "cauldron": True,   # Balkan cauldron in Banja Luka
        "home_uefa_pts": 0,  # Lost 1-2 at Panathinaikos (17 fouls, 0 corners, 3 yellows)
        "away_uefa_pts": 0,  # Lost 2-4 vs Trabzonspor (13 fouls, 9 corners, 3 yellows; 15.7 fouls/g season)
        "home_stats": {"fouls_dom": 12.6, "fouls_uefa": 17.0, "corners": 3.8, "cards": 2.8, "tackles": 15.5, "sot": 4.1},
        "away_stats": {"fouls_dom": 15.7, "fouls_uefa": 13.0, "corners": 4.5, "cards": 2.3, "tackles": 14.0, "sot": 3.6},
        "ref_fouls": 24.5,
        "ref_cards": 4.3,
    },
    {
        "match_id": "2026-10-22_OMO_BEN",
        "comp": "UEFA Europa League",
        "home": "Omonia Nicosia",
        "away": "SL Benfica",
        "odds_1x2": (6.50, 4.50, 1.44),  # Heavy Away Favourite <= 1.45 in Cyprus cauldron!
        "cauldron": True,   # Nicosia Cyprus cauldron
        "home_uefa_pts": 6,  # Beat Celta 1-0 & Celje 3-0 (9.5 fouls/g, 4.3 corners/g, 1.2 yellows/g)
        "away_uefa_pts": 6,  # Beat Milan 2-0 & Celtic 4-1 (10.0 fouls/g, 6.9 corners/g, 2.5 yellows/g, 7.2 SOT/g)
        "home_stats": {"fouls_dom": 9.5, "fouls_uefa": 7.5, "corners": 4.3, "cards": 1.2, "tackles": 11.5, "sot": 3.8},
        "away_stats": {"fouls_dom": 9.8, "fouls_uefa": 10.0, "corners": 6.9, "cards": 2.5, "tackles": 15.5, "sot": 7.4},
        "ref_fouls": 21.0,
        "ref_cards": 3.8,
    },
    # --- GROUP 2: REMAINING 11 THURSDAY MATCHES ON THE 22 OCT SLATE ---
    {
        "match_id": "2026-10-22_CEL_SAL",
        "comp": "UEFA Europa League",
        "home": "NK Celje",
        "away": "RB Salzburg",
        "odds_1x2": (3.40, 3.60, 2.05),
        "cauldron": False,
        "home_uefa_pts": 0,  # Lost 0-2 Leverkusen (10 fouls, 2 corners), Lost 0-3 Omonia (9 fouls, 3 corners)
        "away_uefa_pts": 3,  # Lost 0-4 Milan (13 fouls, 5 corners); Forebet: Celje 9.37 fouls/g, Salzburg 8.71 fouls/g
        "home_stats": {"fouls_dom": 9.4, "fouls_uefa": 9.5, "corners": 4.2, "cards": 2.1, "tackles": 13.0, "sot": 3.9},
        "away_stats": {"fouls_dom": 8.7, "fouls_uefa": 13.0, "corners": 5.2, "cards": 1.2, "tackles": 14.5, "sot": 4.8},
        "ref_fouls": 20.5,
        "ref_cards": 3.5,
    },
    {
        "match_id": "2026-10-22_DIN_NEC",
        "comp": "UEFA Europa League",
        "home": "Dinamo Zagreb",
        "away": "NEC Nijmegen",
        "odds_1x2": (1.80, 3.75, 4.20),
        "cauldron": True,   # Maksimir Zagreb cauldron
        "home_uefa_pts": 4,  # Forebet: Dinamo 13.0 fouls/g, 6.32 corners/g, 1.47 yellows/g
        "away_uefa_pts": 1,  # Committed 19 fouls at Juventus! Forebet: NEC 12.13 fouls/g, 15.87 tackles/g
        "home_stats": {"fouls_dom": 13.0, "fouls_uefa": 12.5, "corners": 5.5, "cards": 1.6, "tackles": 14.5, "sot": 5.4},
        "away_stats": {"fouls_dom": 12.1, "fouls_uefa": 16.5, "corners": 4.2, "cards": 1.8, "tackles": 15.9, "sot": 4.1},
        "ref_fouls": 24.0,
        "ref_cards": 4.0,
    },
    {
        "match_id": "2026-10-22_ARA_AZA",
        "comp": "UEFA Europa League",
        "home": "Ararat-Armenia",
        "away": "AZ Alkmaar",
        "odds_1x2": (7.00, 4.60, 1.40),  # Heavy Away Favourite <= 1.45!
        "cauldron": False,
        "home_uefa_pts": 0,  # 0 pts in UEL, 19.5 tackles/g
        "away_uefa_pts": 3,  # Beat Hapoel 2-1 (14 fouls), lost 0-1 Sunderland (13 fouls, 5 corners)
        "home_stats": {"fouls_dom": 11.2, "fouls_uefa": 11.5, "corners": 3.4, "cards": 2.3, "tackles": 19.5, "sot": 2.9},
        "away_stats": {"fouls_dom": 11.5, "fouls_uefa": 13.5, "corners": 6.4, "cards": 2.0, "tackles": 15.5, "sot": 6.8},
        "ref_fouls": 22.0,
        "ref_cards": 3.6,
    },
    {
        "match_id": "2026-10-22_TRA_HEA",
        "comp": "UEFA Conference League",
        "home": "Trabzonspor",
        "away": "Heart of Midlothian",
        "odds_1x2": (1.42, 4.50, 6.80),  # Heavy Turkish Favourite + Hostile Cauldron!
        "cauldron": True,   # Trabzon Turkey cauldron
        "home_uefa_pts": 3,  # Beat KuPS 4-2 (12 fouls, 6 corners, 2 yellows)
        "away_uefa_pts": 1,  # Drew 1-1 vs Nordsjaelland (14 fouls, 6 corners, 3 yellows)
        "home_stats": {"fouls_dom": 12.2, "fouls_uefa": 12.0, "corners": 5.8, "cards": 2.1, "tackles": 15.5, "sot": 6.1},
        "away_stats": {"fouls_dom": 11.8, "fouls_uefa": 14.0, "corners": 4.5, "cards": 2.4, "tackles": 17.5, "sot": 3.2},
        "ref_fouls": 23.5,
        "ref_cards": 4.2,
    },
    {
        "match_id": "2026-10-22_FCN_CSK",
        "comp": "UEFA Conference League",
        "home": "FC Nordsjælland",
        "away": "CSKA Sofia",
        "odds_1x2": (1.62, 3.90, 5.10),
        "cauldron": False,
        "home_uefa_pts": 1,  # 1-1 at Hearts (13 fouls, 8 corners, 3 yellows)
        "away_uefa_pts": 0,  # Lost 1-2 vs Monaco (13 fouls, 12 corners, 3 yellows, 18 tackles)
        "home_stats": {"fouls_dom": 10.8, "fouls_uefa": 13.0, "corners": 5.8, "cards": 2.0, "tackles": 15.0, "sot": 5.4},
        "away_stats": {"fouls_dom": 12.8, "fouls_uefa": 13.0, "corners": 5.2, "cards": 2.6, "tackles": 17.5, "sot": 4.2},
        "ref_fouls": 23.5,
        "ref_cards": 4.3,
    },
    {
        "match_id": "2026-10-22_AGF_EGN",
        "comp": "UEFA Conference League",
        "home": "AGF Aarhus",
        "away": "Egnatia",
        "odds_1x2": (1.44, 4.30, 6.80),  # Heavy Home Favourite <= 1.45!
        "cauldron": False,
        "home_uefa_pts": 0,  # Lost 0-1 at Gent (2 yellows)
        "away_uefa_pts": 1,  # Drew 1-1 vs Midtjylland (2 corners, 6 conceded = 8 total)
        "home_stats": {"fouls_dom": 12.2, "fouls_uefa": 12.5, "corners": 5.4, "cards": 2.0, "tackles": 16.0, "sot": 4.8},
        "away_stats": {"fouls_dom": 12.8, "fouls_uefa": 13.5, "corners": 3.2, "cards": 2.5, "tackles": 18.0, "sot": 3.5},
        "ref_fouls": 23.5,
        "ref_cards": 4.1,
    },
    {
        "match_id": "2026-10-22_PAF_RIG",
        "comp": "UEFA Conference League",
        "home": "Pafos FC",
        "away": "Riga FC",
        "odds_1x2": (1.65, 3.80, 4.90),
        "cauldron": True,   # Cyprus venue + Romanian referee Marian Barbu (4.4 cards/g)
        "home_uefa_pts": 0,  # Lost 1-3 at Atalanta (11 fouls, 2 corners, 0 yellows)
        "away_uefa_pts": 1,  # Drew 1-1 vs Kairat (2 corners, 3 conceded = 5 total; BetShoot: 6.9 corners/g domestic)
        "home_stats": {"fouls_dom": 11.5, "fouls_uefa": 11.0, "corners": 5.2, "cards": 2.2, "tackles": 14.0, "sot": 5.3},
        "away_stats": {"fouls_dom": 13.2, "fouls_uefa": 14.0, "corners": 4.8, "cards": 2.4, "tackles": 16.0, "sot": 4.1},
        "ref_fouls": 23.0,
        "ref_cards": 4.4,
    },
    {
        "match_id": "2026-10-22_KAI_PAN",
        "comp": "UEFA Conference League",
        "home": "Kairat Almaty",
        "away": "Panathinaikos",
        "odds_1x2": (5.50, 4.10, 1.55),
        "cauldron": False,
        "home_uefa_pts": 1,  # Drew 1-1 at Riga (3 corners, 3 yellows)
        "away_uefa_pts": 3,  # Beat Borac 2-1 (19 fouls, 11 corners, 0 yellows; Forebet: 13.4 fouls/g, 7.3 corners/g)
        "home_stats": {"fouls_dom": 12.8, "fouls_uefa": 13.5, "corners": 3.5, "cards": 2.4, "tackles": 15.5, "sot": 3.4},
        "away_stats": {"fouls_dom": 13.4, "fouls_uefa": 19.0, "corners": 7.3, "cards": 2.1, "tackles": 14.3, "sot": 6.2},
        "ref_fouls": 24.0,
        "ref_cards": 3.6,
    },
    {
        "match_id": "2026-10-22_IBE_MJA",
        "comp": "UEFA Conference League",
        "home": "Iberia 1999",
        "away": "Mjällby AIF",
        "odds_1x2": (3.80, 3.50, 1.95),
        "cauldron": False,
        "home_uefa_pts": 0,  # Lost 0-2 at Sint-Truiden
        "away_uefa_pts": 3,  # Beat Inter d'Escaldes 2-0 (9 fouls, 6 corners)
        "home_stats": {"fouls_dom": 12.4, "fouls_uefa": 13.0, "corners": 3.6, "cards": 2.3, "tackles": 15.5, "sot": 3.2},
        "away_stats": {"fouls_dom": 11.8, "fouls_uefa": 9.0, "corners": 5.8, "cards": 1.6, "tackles": 16.5, "sot": 5.6},
        "ref_fouls": 23.0,
        "ref_cards": 3.8,
    },
    {
        "match_id": "2026-10-22_KAU_BRA",
        "comp": "UEFA Conference League",
        "home": "Kauno Žalgiris",
        "away": "SK Brann",
        "odds_1x2": (6.20, 4.30, 1.44),  # Heavy Away Favourite <= 1.45!
        "cauldron": False,
        "home_uefa_pts": 0,  # Lost 0-4 at Brighton (8 fouls, 0 corners, 1 yellow, 21 tackles)
        "away_uefa_pts": 3,  # Beat Lincoln 2-1 (12 fouls, 17 corners!)
        "home_stats": {"fouls_dom": 11.5, "fouls_uefa": 8.0, "corners": 2.8, "cards": 2.0, "tackles": 19.0, "sot": 2.5},
        "away_stats": {"fouls_dom": 12.5, "fouls_uefa": 12.0, "corners": 8.2, "cards": 1.8, "tackles": 15.5, "sot": 6.4},
        "ref_fouls": 23.5,
        "ref_cards": 3.8,
    },
    {
        "match_id": "2026-10-22_INT_CRA",
        "comp": "UEFA Conference League",
        "home": "Inter Club d'Escaldes",
        "away": "Universitatea Craiova",
        "odds_1x2": (7.50, 4.80, 1.36),  # Heavy Away Favourite <= 1.45!
        "cauldron": False,
        "home_uefa_pts": 0,  # Lost 0-2 at Mjallby (14 fouls, 3 corners)
        "away_uefa_pts": 1,  # Drew 1-1 vs Getafe (14 fouls, 4 corners, 4 yellows, 18 tackles)
        "home_stats": {"fouls_dom": 13.5, "fouls_uefa": 14.0, "corners": 3.0, "cards": 2.6, "tackles": 17.5, "sot": 2.6},
        "away_stats": {"fouls_dom": 11.8, "fouls_uefa": 14.0, "corners": 5.4, "cards": 2.5, "tackles": 17.0, "sot": 5.8},
        "ref_fouls": 24.0,
        "ref_cards": 4.2,
    },
]

def analyze_with_4_filters(m):
    hs = m["home_stats"]
    as_ = m["away_stats"]
    fav_odds = min(m["odds_1x2"][0], m["odds_1x2"][2])
    desperate_uefa = (m["home_uefa_pts"] == 0) or (m["away_uefa_pts"] == 0)

    # Filter 4 Regime Weighting: If either team has 0 UEFA pts, weight UEFA foul rate 65% / Domestic 35%
    if desperate_uefa:
        h_fouls = 0.65 * hs["fouls_uefa"] + 0.35 * hs["fouls_dom"]
        a_fouls = 0.65 * as_["fouls_uefa"] + 0.35 * as_["fouls_dom"]
    else:
        h_fouls = 0.40 * hs["fouls_uefa"] + 0.60 * hs["fouls_dom"]
        a_fouls = 0.40 * as_["fouls_uefa"] + 0.60 * as_["fouls_dom"]

    # Raw (Old Model) vs Post-Filter Fouls
    raw_fouls = hs["fouls_dom"] + as_["fouls_dom"]
    adj_fouls = 0.80 * (h_fouls + a_fouls) + 0.20 * m["ref_fouls"]
    exp_corners = hs["corners"] + as_["corners"]
    exp_cards = 0.75 * (hs["cards"] + as_["cards"]) + 0.25 * m["ref_cards"]
    exp_tackles = hs["tackles"] + as_["tackles"]

    # Candidate bets before filtering
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
            "market": "Total Fouls Under 25.5",
            "type": "UNDER_FOULS",
            "prob": poisson_prob_under(adj_fouls, 25.5),
            "raw_prob": poisson_prob_under(raw_fouls, 25.5),
            "odds": 1.33,
            "proj": f"{round(adj_fouls, 1)} Fouls ({round(h_fouls, 1)}+{round(a_fouls, 1)})"
        },
        {
            "market": "Total Corners Over 8.5",
            "type": "OVER_CORNERS",
            "prob": poisson_prob_over(exp_corners, 8.5),
            "raw_prob": poisson_prob_over(exp_corners, 8.5),
            "odds": 1.40,
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
            "market": "Total Cards Under 4.5",
            "type": "UNDER_CARDS",
            "prob": poisson_prob_under(exp_cards, 4.5),
            "raw_prob": poisson_prob_under(hs["cards"] + as_["cards"], 4.5),
            "odds": 1.30,
            "proj": f"{round(exp_cards, 1)} Cards"
        },
        {
            "market": "Total Cards Over 3.5",
            "type": "OVER_CARDS",
            "prob": poisson_prob_over(exp_cards, 3.5),
            "raw_prob": poisson_prob_over(exp_cards, 3.5),
            "odds": 1.72,
            "proj": f"{round(exp_cards, 1)} Cards"
        },
        {
            "market": f"{m['home'] if hs['sot'] >= as_['sot'] else m['away']} Over 4.5 Shots on Target",
            "type": "TEAM_SOT",
            "prob": poisson_prob_over(max(hs["sot"], as_["sot"]), 4.5),
            "raw_prob": poisson_prob_over(max(hs["sot"], as_["sot"]), 4.5),
            "odds": 1.35,
            "proj": f"{max(hs['sot'], as_['sot'])} Expected SOT"
        }
    ]

    rejected_traps = []
    surviving_picks = []

    for c in candidates:
        reasons = []
        # FILTER 1: Hostile Cauldron Under Fouls Ban
        if c["type"] == "UNDER_FOULS" and m["cauldron"]:
            reasons.append("FILTER #1 (Cauldron Ban: Never take Under Fouls in Turkey/Cyprus/Balkans)")
        # FILTER 2: Heavy Favourite (<= 1.45) Full-Time Over Corners Ban
        if c["type"] == "OVER_CORNERS" and fav_odds <= 1.45 and (hs["corners"] < 4.8 or as_["corners"] < 4.8):
            reasons.append(f"FILTER #2 (Blowout Corner Ban: Fav @ {fav_odds} with underdog < 4.8 corners/g)")
        # FILTER 3: Dual-Team >= 11.5 Foul Floor for Over Fouls
        if c["type"] == "OVER_FOULS" and (h_fouls < 11.5 or a_fouls < 11.5):
            reasons.append(f"FILTER #3 (Possession Freezer Ban: One team projects < 11.5 fouls [{round(h_fouls,1)} vs {round(a_fouls,1)}])")
        # FILTER 4: 0-Point UEFA Desperation Under Fouls / Under Cards Ban
        if c["type"] in ("UNDER_FOULS", "UNDER_CARDS") and desperate_uefa:
            reasons.append(f"FILTER #4 (0-Pt UEFA Desperation Ban: Team on 0 pts [{m['home_uefa_pts']} vs {m['away_uefa_pts']}])")

        if reasons:
            if c["raw_prob"] >= 0.72:
                rejected_traps.append({**c, "reasons": reasons})
        else:
            surviving_picks.append(c)

    surviving_picks.sort(key=lambda x: x["prob"], reverse=True)
    raw_best = sorted(candidates, key=lambda x: x["raw_prob"], reverse=True)[0]

    return {
        "match_id": m["match_id"],
        "match": f"{m['home']} vs {m['away']}",
        "comp": m["comp"],
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
    results = [analyze_with_4_filters(m) for m in UNSEEN_15_PREMATCH]
    out_path = BASE_DIR / "blind_unseen_15_filtered_predictions.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    print("=" * 105)
    print("LOCKED BLIND PRE-MATCH PREDICTIONS + 4 HARD FILTERS ON TODAY'S 15 REMAINING UEFA MATCHES (22 OCT 2026)")
    print("=" * 105)
    for i, r in enumerate(results, 1):
        raw = r["raw_unfiltered_top"]
        lock = r["post_filter_lock"]
        traps = r["rejected_traps"]
        trap_str = " | ".join(f"BLOCKED {t['market']} ({t['raw_prob']*100:.1f}%): {t['reasons'][0]}" for t in traps[:2]) or "None"
        print(f"{i:2d}. {r['match']} ({r['comp']})")
        print(f"    Model Totals : Fouls {r['exp_fouls']} | Corners {r['exp_corners']} | Cards {r['exp_cards']} | Tackles {r['exp_tackles']}")
        print(f"    Raw Top Pick : {raw['market']} ({raw['raw_prob']*100:.1f}%)")
        print(f"    4-Filter Trap: {trap_str}")
        print(f"    SURVIVING LOCK: {lock['market']} @ {lock['odds']} ({lock['prob']*100:.1f}% | {lock['proj']})")
        print("-" * 105)

if __name__ == "__main__":
    main()

"""
predict_brighton.py — Live prediction for Brighton trained on all 8
2026-27 matches played so far (Premier League + Carabao Cup + Conference League).

Match: FK Jablonec vs Brighton (Thu 22 Oct 2026, Conference League, Away)
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from bournemouth_engine import (
    load_matches, load_opponents, load_odds, predict_match,
    poisson_over_prob, EDGE_THRESHOLD, STANDARD_LINES, DATA
)


def main():
    matches = load_matches(DATA / "brighton_matches.csv")
    opponents = load_opponents()
    odds_all = load_odds(DATA / "brighton_odds.csv")

    opp_name = "FK Jablonec"
    comp = "Conference League"
    venue = "Away"
    ref = {"name": "UEFA Referee", "fouls_avg": 21.0, "yellow_avg": 3.0}
    match_key = f"{opp_name} vs Brighton"
    odds_blk = odds_all.get(match_key)

    pred = predict_match(matches, opponents[opp_name], comp, venue, "Brighton",
                         ref, odds_blk, opponents)
    g = pred["grid"]
    tot_g = pred["lam_team_goals"] + pred["lam_opp_goals"]

    print("=" * 78)
    print(f"NEXT MATCH: {opp_name.upper()} vs BRIGHTON (Away), Thu 22 Oct 2026, Conference League")
    print(f"Referee: {ref['name']} (fouls {ref['fouls_avg']}/g, yellows {ref['yellow_avg']}/g) "
          f"-> fouls x{pred['ref_fouls_mult']:.2f}, cards x{pred['ref_cards_mult']:.2f}")
    print("=" * 78)
    print(f"Expected goals:  Brighton {pred['lam_team_goals']:.2f} - {pred['lam_opp_goals']:.2f} {opp_name} "
          f"(Total {tot_g:.2f})")
    print(f"1X2:  Brighton {100*g['home']:.1f}%   Draw {100*g['draw']:.1f}%   {opp_name} {100*g['away']:.1f}%")
    print(f"Totals:  Over 2.5 = {100*g['over25']:.1f}%   Over 3.5 = {100*g['over35']:.1f}%   BTTS = {100*g['btts']:.1f}%")
    print()
    print("Behaviour markets:")
    for bk in ["fouls", "cards", "corners", "tackles"]:
        b = pred["behaviour"][bk]
        line = STANDARD_LINES[bk]
        p_over = poisson_over_prob(b["lam"], line)
        lean = "OVER" if p_over > 0.55 else ("UNDER" if p_over < 0.45 else "no lean")
        print(f"  {bk:8s}: model lam = {b['lam']:5.2f}  (BHA {b['team']:.2f} + JAB {b['opp']:.2f})"
              f"   P(Over {line}) = {100*p_over:5.1f}%   P(Under {line}) = {100*(1-p_over):5.1f}%   lean: {lean}")
        if bk == "fouls":
            for alt in [20.5, 21.5, 22.5, 23.5, 24.5, 25.5]:
                p_u = 1.0 - poisson_over_prob(b["lam"], alt)
                p_o = poisson_over_prob(b["lam"], alt)
                print(f"             -> P(Under {alt:4.1f} Fouls)  = {100*p_u:5.1f}% (fair {1/p_u:.2f}) | P(Over {alt:4.1f}) = {100*p_o:5.1f}%")
        if bk == "cards":
            for alt in [2.5, 3.5, 4.5]:
                p_u = 1.0 - poisson_over_prob(b["lam"], alt)
                p_o = poisson_over_prob(b["lam"], alt)
                print(f"             -> P(Under {alt:4.1f} Cards)  = {100*p_u:5.1f}% (fair {1/p_u:.2f}) | P(Over {alt:4.1f}) = {100*p_o:5.1f}%")
        if bk == "corners":
            for alt in [7.5, 8.5, 9.5, 10.5]:
                p_o = poisson_over_prob(b["lam"], alt)
                print(f"             -> P(Over {alt:4.1f} Corners) = {100*p_o:5.1f}% (fair {1/p_o:.2f})")

    if pred["bets"]:
        print("\n22bet / Market Odds Comparison (Edge Threshold > 5 pts):")
        for b in pred["bets"]:
            flag = f"<<< BET ({100*b['stake']:.2f}% bankroll)" if b["edge_vs_devig"] >= EDGE_THRESHOLD else "pass"
            print(f"  {b['market']:<6} {b['selection']:<18} @ {b['odds']:5.2f} | "
                  f"Model={100*b['model_p']:5.1f}% vs Devig={100*b['implied_devig']:5.1f}% | "
                  f"Edge={100*b['edge_vs_devig']:+5.1f}pts | {flag}")
    print("=" * 78)


if __name__ == "__main__":
    main()

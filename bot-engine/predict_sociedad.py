"""
predict_sociedad.py — Live prediction for Real Sociedad trained on all 7
2026-27 matches played so far (La Liga + Europa League).

Match: Lillestrom vs Real Sociedad (Thu 22 Oct 2026, 20:00, Europa League, Away)
Referee:UEFA average profile (~23.5 fouls / 4.3 yellows).
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from bournemouth_engine import (
    load_matches, load_opponents, load_odds, predict_match,
    poisson_over_prob, EDGE_THRESHOLD, STANDARD_LINES, DATA
)


def main():
    matches = load_matches(DATA / "sociedad_matches.csv")
    opponents = load_opponents()
    odds_all = load_odds(DATA / "sociedad_odds.csv")

    opp_name = "Lillestrom"
    comp = "Europa League"
    venue = "Away"
    ref = {"name": "UEFA Referee", "fouls_avg": 23.5, "yellow_avg": 4.3}
    match_key = f"{opp_name} vs Real Sociedad"
    odds_blk = odds_all.get(match_key)

    pred = predict_match(matches, opponents[opp_name], comp, venue, "Real Sociedad",
                         ref, odds_blk, opponents)
    g = pred["grid"]
    tot_g = pred["lam_team_goals"] + pred["lam_opp_goals"]

    print("=" * 78)
    print(f"NEXT MATCH: {opp_name} vs REAL SOCIEDAD (Away), Thu 22 Oct 2026 20:00, Europa League")
    print(f"Referee: {ref['name']} (fouls {ref['fouls_avg']}/g, yellows {ref['yellow_avg']}/g) "
          f"-> fouls x{pred['ref_fouls_mult']:.2f}, cards x{pred['ref_cards_mult']:.2f}")
    print("=" * 78)
    print(f"Expected goals:  {opp_name} {pred['lam_opp_goals']:.2f} - {pred['lam_team_goals']:.2f} Real Sociedad "
          f"(Total {tot_g:.2f})")
    print(f"1X2:  Lillestrom {100*g['away']:.1f}%   Draw {100*g['draw']:.1f}%   Real Sociedad {100*g['home']:.1f}%")
    print(f"Totals:  Over 2.5 = {100*g['over25']:.1f}%   Over 3.5 = {100*g['over35']:.1f}%   BTTS = {100*g['btts']:.1f}%")
    print()
    print("Behaviour markets:")
    for bk in ["fouls", "cards", "corners", "tackles"]:
        b = pred["behaviour"][bk]
        line = STANDARD_LINES[bk]
        p_over = poisson_over_prob(b["lam"], line)
        lean = "OVER" if p_over > 0.55 else ("UNDER" if p_over < 0.45 else "no lean")
        print(f"  {bk:8s}: model lam = {b['lam']:5.2f}  (RSO {b['team']:.2f} + LIL {b['opp']:.2f})"
              f"   P(Over {line}) = {100*p_over:5.1f}%   lean: {lean}")
        if bk == "corners":
            for alt in [7.5, 8.5, 9.5, 10.5]:
                p_alt = poisson_over_prob(b["lam"], alt)
                print(f"             -> P(Over {alt:4.1f} Corners) = {100*p_alt:5.1f}% (fair {1/p_alt:.2f})")
        if bk == "fouls":
            for alt in [20.5, 21.5, 22.5, 23.5]:
                p_alt = poisson_over_prob(b["lam"], alt)
                print(f"             -> P(Over {alt:4.1f} Fouls)   = {100*p_alt:5.1f}% (fair {1/p_alt:.2f})")
        if bk == "cards":
            for alt in [2.5, 3.5, 4.5]:
                p_alt = poisson_over_prob(b["lam"], alt)
                print(f"             -> P(Over {alt:4.1f} Cards)   = {100*p_alt:5.1f}% (fair {1/p_alt:.2f})")

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

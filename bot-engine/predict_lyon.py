"""
predict_lyon.py — Live prediction for Lyon trained on all 9
2026-27 matches played so far (Ligue 1 + Europa League).

Match: Hoffenheim vs Lyon (Thu 22 Oct 2026, 20:00, Europa League, Away)
Referee: Halil Umut Meler (Turkey) — averages ~25.0 fouls / 4.9 yellows.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from bournemouth_engine import (
    load_matches, load_opponents, load_odds, predict_match,
    poisson_over_prob, EDGE_THRESHOLD, STANDARD_LINES, DATA
)


def main():
    matches = load_matches(DATA / "lyon_matches.csv")
    opponents = load_opponents()
    odds_all = load_odds(DATA / "lyon_odds.csv")

    opp_name = "Hoffenheim"
    comp = "Europa League"
    venue = "Away"
    ref = {"name": "Halil Umut Meler", "fouls_avg": 25.0, "yellow_avg": 4.9}
    match_key = f"{opp_name} vs Lyon"
    odds_blk = odds_all.get(match_key)

    pred = predict_match(matches, opponents[opp_name], comp, venue, "Lyon",
                         ref, odds_blk, opponents)
    g = pred["grid"]
    tot_g = pred["lam_team_goals"] + pred["lam_opp_goals"]

    print("=" * 78)
    print(f"NEXT MATCH: {opp_name} vs LYON (Away), Thu 22 Oct 2026 20:00, Europa League")
    print(f"Referee: {ref['name']} (fouls {ref['fouls_avg']}/g, yellows {ref['yellow_avg']}/g) "
          f"-> fouls x{pred['ref_fouls_mult']:.2f}, cards x{pred['ref_cards_mult']:.2f}")
    print("=" * 78)
    print(f"Expected goals:  {opp_name} {pred['lam_opp_goals']:.2f} - {pred['lam_team_goals']:.2f} Lyon "
          f"(Total {tot_g:.2f})")
    print(f"1X2:  Hoffenheim {100*g['away']:.1f}%   Draw {100*g['draw']:.1f}%   Lyon {100*g['home']:.1f}%")
    print(f"Double Chance X2 (Lyon or Draw): {100*(g['home'] + g['draw']):.1f}%")
    print(f"Totals:  Over 2.5 = {100*g['over25']:.1f}%   Over 3.5 = {100*g['over35']:.1f}%   BTTS = {100*g['btts']:.1f}%")
    print()
    print("Behaviour markets:")
    for bk in ["fouls", "cards", "corners", "tackles"]:
        b = pred["behaviour"][bk]
        line = STANDARD_LINES[bk]
        p_over = poisson_over_prob(b["lam"], line)
        lean = "OVER" if p_over > 0.55 else ("UNDER" if p_over < 0.45 else "no lean")
        print(f"  {bk:8s}: model lam = {b['lam']:5.2f}  (LYO {b['team']:.2f} + HOF {b['opp']:.2f})"
              f"   P(Over {line}) = {100*p_over:5.1f}%   lean: {lean}")

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

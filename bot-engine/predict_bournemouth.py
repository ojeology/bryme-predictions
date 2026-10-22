"""
predict_bournemouth.py — Live predictions for AFC Bournemouth trained on all 10
2026-27 matches played so far (PL + Europa League + Carabao Cup).

Outputs:
  1. TODAY (22 Oct 2026, 20:00): Bournemouth vs AC Milan (Europa League, Home)
     with real 22bet odds comparison.
  2. NEXT PL (25 Oct 2026): Man Utd vs Bournemouth (Premier League, Away).
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))

from bournemouth_engine import (
    load_matches, load_opponents, load_odds, predict_match,
    poisson_over_prob, EDGE_THRESHOLD, STANDARD_LINES
)


def print_sheet(title, opp_name, comp, venue, ref, matches, opponents, odds_all):
    opp = opponents[opp_name]
    match_key = f"Bournemouth vs {opp_name}" if venue == "Home" else f"{opp_name} vs Bournemouth"
    odds_blk = odds_all.get(match_key)
    pred = predict_match(matches, opp, comp, venue, "Bournemouth", ref, odds_blk, opponents)
    g = pred["grid"]
    tot_g = pred["lam_team_goals"] + pred["lam_opp_goals"]

    print("=" * 78)
    print(title)
    print(f"Trained on {len(matches)} Bournemouth 2026-27 matches (PL + Europa League + Carabao Cup)")
    print("=" * 78)
    print(f"Expected Goals : Bournemouth {pred['lam_team_goals']:.2f} - {pred['lam_opp_goals']:.2f} {opp_name} (Total {tot_g:.2f})")
    print(f"1X2 Model Probs: Bournemouth {100*g['home']:.1f}% | Draw {100*g['draw']:.1f}% | {opp_name} {100*g['away']:.1f}%")
    print(f"Fair 1X2 Odds  : Bournemouth {1/g['home']:.2f}  | Draw {1/g['draw']:.2f}  | {opp_name} {1/g['away']:.2f}")
    print(f"Totals Probs   : Over 2.5 = {100*g['over25']:.1f}% (fair {1/g['over25']:.2f}) | "
          f"Over 3.5 = {100*g['over35']:.1f}% | BTTS = {100*g['btts']:.1f}% (fair {1/g['btts']:.2f})")

    print("\nBehaviour Markets (Trained on Bournemouth's 10-match log):")
    for bk, line in STANDARD_LINES.items():
        b_info = pred["behaviour"][bk]
        p_ov = poisson_over_prob(b_info["lam"], line)
        p_un = 1.0 - p_ov
        if p_ov >= 0.55:
            lean = f"OVER {line} ({100*p_ov:.1f}%, fair {1/p_ov:.2f})"
        elif p_un >= 0.55:
            lean = f"UNDER {line} ({100*p_un:.1f}%, fair {1/p_un:.2f})"
        else:
            lean = f"No strong lean (Over {100*p_ov:.1f}%)"
        print(f"  {bk:<8}: lam={b_info['lam']:5.2f} (BOU {b_info['team']:4.1f} + {opp_name[:3].upper()} {b_info['opp']:4.1f}) "
              f"| {lean}")

    if pred["bets"]:
        print("\n22bet / Market Odds Comparison (Edge Threshold >= +5.0 pts):")
        for b in pred["bets"]:
            flag = f"<<< BET ({100*b['stake']:.2f}% bankroll)" if b["edge_vs_devig"] >= EDGE_THRESHOLD else "pass"
            print(f"  {b['market']:<6} {b['selection']:<16} @ {b['odds']:5.2f} | "
                  f"Model={100*b['model_p']:5.1f}% vs Devig={100*b['implied_devig']:5.1f}% | "
                  f"Edge={100*b['edge_vs_devig']:+5.1f}pts | {flag}")
    print("=" * 78 + "\n")


def main():
    matches = load_matches()
    opponents = load_opponents()
    odds_all = load_odds()

    print_sheet(
        "LIVE PREDICTION #1 (TODAY 22 OCT 2026, 20:00): Bournemouth vs AC Milan (Europa League, Home)",
        "AC Milan", "Europa League", "Home",
        {"fouls_avg": 23.0, "yellow_avg": 4.2},
        matches, opponents, odds_all
    )

    print_sheet(
        "LIVE PREDICTION #2 (SUN 25 OCT 2026): Man Utd vs Bournemouth (Premier League, Away)",
        "Man Utd", "Premier League", "Away",
        {"fouls_avg": 21.5, "yellow_avg": 3.5},
        matches, opponents, odds_all
    )


if __name__ == "__main__":
    main()

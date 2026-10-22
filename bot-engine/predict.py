"""
predict.py — next-match prediction sheet.

Currently set up for: Aston Villa vs Man City, Sat 24 Oct 2026, Villa Park,
referee Peter Bankes (20.5 fouls / 3.75 yellows per game this season).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))
from engine import (load_matches, load_opponents, predict_match,
                    poisson_over_prob, STANDARD_LINES, FAIR_PRICE)

OPPONENT = "Aston Villa"
VENUE = "Away"
COMP = "Premier League"
REFEREE = {"name": "Peter Bankes", "fouls_avg": 20.5, "yellow_avg": 3.75}


def main():
    matches = load_matches()
    opponents = load_opponents()
    pred = predict_match(matches, opponents[OPPONENT], COMP, VENUE, REFEREE, None, opponents)
    g = pred["grid"]

    print("=" * 70)
    print(f"NEXT MATCH: {OPPONENT} vs MANCHESTER CITY  (A), Sat 24 Oct 2026, 11:30")
    print(f"Referee: {REFEREE['name']} (fouls {REFEREE['fouls_avg']}/g, "
          f"yellows {REFEREE['yellow_avg']}/g) -> fouls x{pred['ref_fouls_mult']:.2f}, "
          f"cards x{pred['ref_cards_mult']:.2f}")
    print("=" * 70)
    print(f"Expected goals:  {OPPONENT} {pred['lam_opp_goals']:.2f} - "
          f"{pred['lam_city_goals']:.2f} Man City")
    print(f"1X2:  City {100*g['home']:.1f}%   Draw {100*g['draw']:.1f}%   "
          f"Villa {100*g['away']:.1f}%")
    print(f"Totals:  Over 2.5 = {100*g['over25']:.1f}%   Over 3.5 = {100*g['over35']:.1f}%   "
          f"BTTS = {100*g['btts']:.1f}%")
    print()
    print("Behaviour markets (compare against Bet365 lines when they drop):")
    for bk in ["fouls", "cards", "corners", "tackles"]:
        b = pred["behaviour"][bk]
        _, line = STANDARD_LINES[bk]
        p_over = poisson_over_prob(b["lam"], line)
        lean = "OVER" if p_over > 0.55 else ("UNDER" if p_over < 0.45 else "no lean")
        print(f"  {bk:8s}: model lam = {b['lam']:5.2f}  (City {b['city']:.2f} + Villa {b['opp']:.2f})"
              f"   P(Over {line}) = {100*p_over:5.1f}%   lean: {lean}")
    print()
    print("Rule: bet only when your price beats the book's implied prob by >5 pts,")
    print("with quarter-Kelly sizing. Import the real Bet365 lines before acting.")


if __name__ == "__main__":
    main()

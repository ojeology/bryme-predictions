import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))
from bournemouth_engine import (
    load_matches, load_opponents, load_odds, predict_match,
    poisson_over_prob, EDGE_THRESHOLD, STANDARD_LINES, DATA
)

def main():
    matches = load_matches(DATA / "zvezda_matches.csv")
    opponents = load_opponents()
    odds_all = load_odds(DATA / "zvezda_odds.csv")
    opp_name = "FC Copenhagen"
    comp = "Conference League"
    venue = "Home"
    ref = {"name": "Radu Petrescu", "fouls_avg": 24.2, "yellow_avg": 4.5}
    match_key = f"Crvena Zvezda vs {opp_name}"
    odds_blk = odds_all.get(match_key)
    pred = predict_match(matches, opponents[opp_name], comp, venue, "Crvena Zvezda", ref, odds_blk, opponents)
    g = pred["grid"]
    tot_g = pred["lam_team_goals"] + pred["lam_opp_goals"]
    print("=" * 78)
    print(f"NEXT MATCH: CRVENA ZVEZDA vs {opp_name.upper()} (Home), Thu 22 Oct 2026, Conference League")
    print(f"Referee: {ref['name']} (fouls {ref['fouls_avg']}/g, yellows {ref['yellow_avg']}/g) -> fouls x{pred['ref_fouls_mult']:.2f}, cards x{pred['ref_cards_mult']:.2f}")
    print("=" * 78)
    print(f"Expected goals:  Crvena Zvezda {pred['lam_team_goals']:.2f} - {pred['lam_opp_goals']:.2f} {opp_name} (Total {tot_g:.2f})")
    print(f"1X2:  Crvena Zvezda {100*g['home']:.1f}%   Draw {100*g['draw']:.1f}%   {opp_name} {100*g['away']:.1f}%")
    print(f"Totals:  Over 2.5 = {100*g['over25']:.1f}%   Over 3.5 = {100*g['over35']:.1f}%   BTTS = {100*g['btts']:.1f}%")
    print("\nBehaviour markets:")
    for bk in ["fouls", "cards", "corners", "tackles"]:
        b = pred["behaviour"][bk]
        line = STANDARD_LINES[bk]
        p_over = poisson_over_prob(b["lam"], line)
        print(f"  {bk:8s}: model lam = {b['lam']:5.2f}  (CZV {b['team']:.2f} + FCK {b['opp']:.2f})   P(Over {line}) = {100*p_over:5.1f}%   P(Under {line}) = {100*(1-p_over):5.1f}%")
        if bk == "fouls":
            for alt in [20.5, 21.5, 22.5, 23.5, 24.5]:
                p_o = poisson_over_prob(b["lam"], alt)
                print(f"             -> P(Over {alt:4.1f} Fouls) = {100*p_o:5.1f}% (fair {1/p_o:.2f}) | P(Under {alt:4.1f}) = {100*(1-p_o):5.1f}%")
        if bk == "corners":
            for alt in [7.5, 8.5, 9.5, 10.5]:
                p_o = poisson_over_prob(b["lam"], alt)
                print(f"             -> P(Over {alt:4.1f} Corners) = {100*p_o:5.1f}% (fair {1/p_o:.2f}) | P(Under {alt:4.1f}) = {100*(1-p_o):5.1f}%")
if __name__ == "__main__":
    main()

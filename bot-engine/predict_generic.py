"""
predict_generic.py — generic two-team prediction (not City-centric).

Predicts any match using opponent profiles from data/opponents.csv.
No per-match history needed — uses season rate profiles directly.

Method (same math as engine.py, team-agnostic):
  lambda_home_goals = (home_gf_rate * away_ga_rate) / league_avg_goals
  lambda_away_goals = (away_gf_rate * home_ga_rate) / league_avg_goals
  behaviour lambdas similarly from for/against rate products.
  Referee multiplier on fouls/cards if known.
  Poisson distributions for Over/Under and 1X2.
"""

import sys
import math
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))
from engine import (load_opponents, poisson_over_prob, poisson_pmf,
                    BASELINES, REF_FOULS_AVG, REF_YELLOW_AVG,
                    STANDARD_LINES, score_grid, devig_two, devig_three,
                    kelly_stake)


def poisson_grid(lam_home, lam_away, max_goals=12):
    ph = [poisson_pmf(i, lam_home) for i in range(max_goals + 1)]
    pa = [poisson_pmf(j, lam_away) for j in range(max_goals + 1)]
    home = draw = away = btts = over25 = over35 = 0.0
    for i, p_i in enumerate(ph):
        for j, p_j in enumerate(pa):
            p = p_i * p_j
            if i > j:
                home += p
            elif i == j:
                draw += p
            else:
                away += p
            if i + j > 2.5:
                over25 += p
            if i + j > 3.5:
                over35 += p
            if i > 0 and j > 0:
                btts += p
    return {"home": home, "draw": draw, "away": away,
            "over25": over25, "over35": over35, "btts": btts}


def predict_generic(home_team, away_team, comp, referee=None,
                    home_odds=None, away_odds=None, draw_odds=None,
                    ou25_over=None, ou25_under=None, btts_yes=None, btts_no=None):
    opponents = load_opponents()
    base = BASELINES[comp]

    hp = opponents.get(home_team)
    ap = opponents.get(away_team)
    if not hp or not ap:
        print(f"ERROR: missing profile for {home_team if not hp else ''} "
              f"{away_team if not ap else ''}")
        return

    # ---- goals ----
    lam_home_goals = (hp["gf_rate"] * ap["ga_rate"]) / base["goals"]
    lam_away_goals = (ap["gf_rate"] * hp["ga_rate"]) / base["goals"]
    grid = poisson_grid(lam_home_goals, lam_away_goals)

    # ---- behaviour (total match) ----
    # lambda_fouls = (home_for * away_against + away_for * home_against) / mu
    mu_f = base["fouls"]
    lam_fouls = ((hp["fouls_for"] * ap["fouls_against"] +
                  ap["fouls_for"] * hp["fouls_against"]) / mu_f)

    mu_c = base["cards"]
    # cards: each team commits their own yellows independently -> sum
    lam_cards = hp["yellow_for"] + ap["yellow_for"]

    mu_n = base["corners"]
    lam_corners = ((hp["corners_for"] * ap["corners_against"] +
                    ap["corners_for"] * hp["corners_against"]) / mu_n)

    mu_t = base["tackles"]
    # tackles: each team makes their own tackles independently -> sum
    lam_tackles = hp["tackles_for"] + ap["tackles_for"]

    # referee multiplier
    ref_fm = (referee["fouls_avg"] / REF_FOULS_AVG) if referee and referee.get("fouls_avg") else 1.0
    ref_cm = (referee["yellow_avg"] / REF_YELLOW_AVG) if referee and referee.get("yellow_avg") else 1.0
    lam_fouls *= ref_fm
    lam_cards *= ref_cm

    behaviour = {
        "fouls":   {"lam": lam_fouls},
        "cards":   {"lam": lam_cards},
        "corners": {"lam": lam_corners},
        "tackles": {"lam": lam_tackles},
    }

    # ---- display ----
    print("=" * 70)
    print(f"GENERIC PREDICTION: {home_team} vs {away_team}  ({comp})")
    if referee:
        print(f"Referee: {referee['name']} -> fouls x{ref_fm:.2f}, cards x{ref_cm:.2f}")
    print("=" * 70)
    print(f"Expected goals:  {home_team} {lam_home_goals:.2f} - {lam_away_goals:.2f} {away_team}")
    print(f"1X2:  {home_team} {100*grid['home']:.1f}%   Draw {100*grid['draw']:.1f}%   "
          f"{away_team} {100*grid['away']:.1f}%")
    print(f"Totals:  Over 2.5 = {100*grid['over25']:.1f}%   Over 3.5 = {100*grid['over35']:.1f}%   "
          f"BTTS = {100*grid['btts']:.1f}%")
    print()
    print("Behaviour markets (model lambda vs standard lines):")
    for bk in ["fouls", "cards", "corners", "tackles"]:
        b = behaviour[bk]
        _, line = STANDARD_LINES[bk]
        p_over = poisson_over_prob(b["lam"], line)
        lean = "OVER" if p_over > 0.55 else ("UNDER" if p_over < 0.45 else "no lean")
        print(f"  {bk:8s}: model lam = {b['lam']:5.2f}   P(Over {line}) = {100*p_over:5.1f}%   lean: {lean}")

    # ---- market comparison if odds provided ----
    print()
    print("EDGE CHECK (bet only if edge > 5pts):")

    def check(market, selection, model_p, odds, devig_p):
        edge = model_p - devig_p
        stake = kelly_stake(model_p, odds)
        flag = "BET " if edge > 0.05 and stake > 0 else "pass"
        print(f"  [{flag}] {market:7s} {selection:14s} model {100*model_p:5.1f}%  "
              f"implied {100*devig_p:5.1f}%  odds {odds:.2f}  edge {100*edge:+.1f}p  "
              f"stake {stake*100:.2f}u")

    if home_odds and draw_odds and away_odds:
        p_h, p_d, p_a = devig_three(home_odds, draw_odds, away_odds)
        check("1X2", f"{home_team} win", grid["home"], home_odds, p_h)
        check("1X2", "Draw", grid["draw"], draw_odds, p_d)
        check("1X2", f"{away_team} win", grid["away"], away_odds, p_a)

    if ou25_over and ou25_under:
        d_o, d_u = devig_two(ou25_over, ou25_under)
        check("OU2.5", "Over", grid["over25"], ou25_over, d_o)
        check("OU2.5", "Under", 1 - grid["over25"], ou25_under, d_u)

    if btts_yes and btts_no:
        d_y, d_n = devig_two(btts_yes, btts_no)
        check("BTTS", "Yes", grid["btts"], btts_yes, d_y)
        check("BTTS", "No", 1 - grid["btts"], btts_no, d_n)

    print()
    print("CAUTION: profile-based only (no per-match history). Treat as directional,")
    print("not a betting signal until validated with real match data.")


if __name__ == "__main__":
    # Bournemouth (Home) vs AC Milan (Away) — Europa League, today 22 Oct 2026
    predict_generic(
        home_team="Bournemouth",
        away_team="AC Milan",
        comp="Europa League",
        referee=None,  # unknown
        # Paste real 22bet odds here when available:
        # home_odds=2.10, draw_odds=3.40, away_odds=3.50,
        # ou25_over=1.85, ou25_under=1.95,
        # btts_yes=1.90, btts_no=1.90,
    )

"""
backtest.py — walk-forward backtest of the City machine.

Rule: for match i the engine sees ONLY matches [0..i-1]. Nothing from the
future, no post-match odds moves, no in-play information.

Headline test (user request): the last two matches played by Man City ->
    17 Oct  Man City 3-2 Ipswich    (Premier League)
    20 Oct  Man City 5-1 AEK Athens (Champions League)
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))
import engine
from engine import (load_matches, load_opponents, load_odds, predict_match,
                    poisson_over_prob, STANDARD_LINES, FAIR_PRICE, EDGE_THRESHOLD)

OPP_NAME_FIX = {"Ipswich": "Ipswich Town"}
BEHAVIOUR_KEYS = ["fouls", "cards", "corners", "tackles"]


def match_key(m):
    opp = OPP_NAME_FIX.get(m["opponent"], m["opponent"])
    return f"Man City vs {opp}" if m["venue"] == "Home" else f"{opp} vs Man City"


def find_odds(odds, key):
    if key in odds:
        return odds[key]
    alt = key.replace(" Town", "")
    return odds.get(alt)


def fmt_pct(x):
    return f"{100 * x:5.1f}%"


def run():
    matches = load_matches()
    opponents = load_opponents()
    odds = load_odds()

    results = []
    bet_ledger = []
    behaviour_ledger = []

    print("=" * 78)
    print("WALK-FORWARD BACKTEST — Manchester City 2026-27 (each match predicted")
    print("with strictly prior data only)")
    print("=" * 78)

    for i, m in enumerate(matches):
        upto = matches[:i]
        if not upto:
            continue
        prof = opponents[m["opponent"]]
        ref = None
        if m.get("referee") and m.get("ref_fouls_avg"):
            ref = {"name": m["referee"], "fouls_avg": m["ref_fouls_avg"],
                   "yellow_avg": m["ref_yellow_avg"]}
        key = match_key(m)
        pred = predict_match(upto, prof, m["comp"], m["venue"], ref,
                             find_odds(odds, key), opponents)

        actual = {
            "goals": m["city_goals"] + m["opp_goals"],
            "city_goals": m["city_goals"], "opp_goals": m["opp_goals"],
            "fouls": (m["city_fouls"] + m["opp_fouls"]) if m["city_fouls"] is not None else None,
            "cards": (m["city_yellow"] + m["opp_yellow"]) if m["city_yellow"] is not None else None,
            "corners": (m["city_corners"] + m["opp_corners"]) if m["city_corners"] is not None else None,
            "tackles": (m["city_tackles"] + m["opp_tackles"]) if m["city_tackles"] is not None else None,
        }
        results.append({"m": m, "key": key, "pred": pred, "actual": actual, "ref": ref})

        # ---------- real-odds betting ledger ----------
        for b in pred["bets"]:
            if b["edge_vs_devig"] <= EDGE_THRESHOLD or b["stake"] <= 0:
                continue
            won = None
            if b["market"] == "1X2":
                if b["selection"] == "Man City win":
                    won = m["city_goals"] > m["opp_goals"]
                elif b["selection"] == "Draw":
                    won = m["city_goals"] == m["opp_goals"]
                else:
                    won = m["opp_goals"] > m["city_goals"]
            elif b["market"] == "OU2.5":
                won = actual["goals"] > 2.5 if b["selection"] == "Over" else actual["goals"] < 2.5
            elif b["market"] == "OU3.5":
                won = actual["goals"] > 3.5 if b["selection"] == "Over" else actual["goals"] < 3.5
            elif b["market"] == "BTTS":
                both = m["city_goals"] > 0 and m["opp_goals"] > 0
                won = both if b["selection"] == "Yes" else not both
            elif b["market"] == "CORNERS":
                parts = b["selection"].split()
                side, line = parts[0], float(parts[1])
                tot = actual["corners"]
                if tot is not None:
                    won = (tot > line) if side == "Over" else (tot < line)
            if won is not None:
                pnl = b["stake"] * (b["odds"] - 1) if won else -b["stake"]
                bet_ledger.append({**b, "match": key, "date": m["date"], "won": won,
                                   "pnl": pnl})

        # ---------- behaviour grading at standard lines ----------
        for bk in BEHAVIOUR_KEYS:
            if actual[bk] is None:
                continue
            _, line = STANDARD_LINES[bk]
            lam = pred["behaviour"][bk]["lam"]
            p_over = poisson_over_prob(lam, line)
            lean = "Over" if p_over > 0.55 else ("Under" if p_over < 0.45 else "PASS")
            if lean == "PASS":
                continue
            won = (actual[bk] > line) if lean == "Over" else (actual[bk] < line)
            stake = engine.kelly_stake(max(p_over, 1 - p_over), FAIR_PRICE)
            pnl = stake * (FAIR_PRICE - 1) if won else -stake
            behaviour_ledger.append({
                "date": m["date"], "match": key, "market": bk, "line": line,
                "lam": lam, "p_over": p_over, "lean": lean, "actual": actual[bk],
                "won": won, "stake": stake, "pnl": pnl})

    # ---------------- detailed sheets ----------------
    for res in results:
        if not find_odds(odds, res["key"]):
            continue
        m, pred, actual = res["m"], res["pred"], res["actual"]
        g = pred["grid"]
        print()
        print("-" * 78)
        print(f"{m['date']}  {res['key']}  ({m['comp']}, {m['venue']})")
        print(f"  ref: {res['ref']['name'] if res['ref'] else 'unknown'}"
              + (f"  [fouls x{pred['ref_fouls_mult']:.2f}, cards x{pred['ref_cards_mult']:.2f}]"
                 if res["ref"] else ""))
        print(f"  MODEL  goals: City {pred['lam_city_goals']:.2f} - {pred['lam_opp_goals']:.2f} Opp")
        print(f"         P(City/Draw/Opp) = {fmt_pct(g['home'])} / {fmt_pct(g['draw'])} / {fmt_pct(g['away'])}")
        print(f"         P(O2.5)={fmt_pct(g['over25'])}  P(O3.5)={fmt_pct(g['over35'])}"
              f"  P(BTTS)={fmt_pct(g['btts'])}")
        for bk in BEHAVIOUR_KEYS:
            b = pred["behaviour"][bk]
            _, line = STANDARD_LINES[bk]
            p_over = poisson_over_prob(b["lam"], line)
            print(f"         {bk:8s}: lam_total {b['lam']:5.2f}  (City {b['city']:.2f} + Opp {b['opp']:.2f})"
                  f"   P(Over {line}) = {fmt_pct(p_over)}")
        print("  BETS (edge vs devig > 5%):")
        any_bet = False
        for b in pred["bets"]:
            mark = "BET " if b["edge_vs_devig"] > EDGE_THRESHOLD else "pass"
            if mark == "BET ":
                any_bet = True
            print(f"    [{mark}] {b['market']:7s} {b['selection']:14s} model {fmt_pct(b['model_p'])}"
                  f"  implied {fmt_pct(b['implied_devig'])}  odds {b['odds']:.2f}"
                  f"  edge {100 * b['edge_vs_devig']:+.1f}p  stake {b['stake'] * 100:.2f}u")
        if not any_bet:
            print("    (no qualifying bets)")
        print(f"  ACTUAL: City {actual['city_goals']:.0f}-{actual['opp_goals']:.0f} Opp"
              f"  | fouls {actual['fouls']}  cards {actual['cards']}"
              f"  corners {actual['corners']}  tackles {actual['tackles']}")

    # ---------------- summary ----------------
    print()
    print("=" * 78)
    print("WALK-FORWARD SUMMARY (cell = actual / model-lambda, pre kick-off)")
    print("=" * 78)
    print(f"{'date':11s} {'match':24s} {'score':>5s} {'goals':>5s} {'fouls':>5s} {'cards':>5s} {'corners':>6s} {'tackles':>6s}")
    for res in results:
        m, pred, actual = res["m"], res["pred"], res["actual"]

        def cell(bk):
            if actual[bk] is None:
                return "   -"
            lam = pred["lam_city_goals"] + pred["lam_opp_goals"] if bk == "goals" \
                else pred["behaviour"][bk]["lam"]
            return f"{actual[bk]:.0f}/{lam:.0f}"

        print(f"{m['date']:11s} {res['key'][:24]:24s} "
              f"{actual['city_goals']:.0f}-{actual['opp_goals']:.0f} "
              f"{cell('goals'):>5s} {cell('fouls'):>5s} {cell('cards'):>5s} "
              f"{cell('corners'):>6s} {cell('tackles'):>6s}")

    print()
    for bk in ["goals"] + BEHAVIOUR_KEYS:
        errs = []
        for res in results:
            a = res["actual"][bk]
            if a is None:
                continue
            lam = res["pred"]["lam_city_goals"] + res["pred"]["lam_opp_goals"] if bk == "goals" \
                else res["pred"]["behaviour"][bk]["lam"]
            errs.append(abs(a - lam))
        if errs:
            print(f"  MAE {bk:8s}: {sum(errs) / len(errs):5.2f} over {len(errs)} matches")

    # ---------------- ledgers ----------------
    print()
    print("=" * 78)
    print("BETTING LEDGER — real market odds (1X2 / goals / BTTS / real corner line)")
    print("=" * 78)
    total = 0.0
    for b in bet_ledger:
        total += b["pnl"]
        print(f"  {b['date']}  {b['match'][:28]:28s} {b['market']:7s} {b['selection']:14s}"
              f" odds {b['odds']:.2f}  stake {b['stake'] * 100:4.2f}u  "
              f"{'WON ' if b['won'] else 'LOST'}  pnl {b['pnl']:+.3f}u")
    n_staked = sum(b["stake"] for b in bet_ledger)
    print(f"  --> bets {len(bet_ledger)}, staked {n_staked * 100:.2f}u, P&L {total:+.3f}u,"
          f" ROI {100 * total / n_staked if n_staked else 0:+.1f}%")

    print()
    print("=" * 78)
    print("BEHAVIOUR LEDGER — indicative, graded at standard lines 1.85/1.85")
    print("(fouls 21.5, cards 3.5, corners 9.5, tackles 32.5 — historical Bet365")
    print("prices for these specific matches were not retrievable; shows model skill)")
    print("=" * 78)
    total_b = 0.0
    for b in behaviour_ledger:
        total_b += b["pnl"]
        print(f"  {b['date']}  {b['match'][:28]:28s} {b['market']:8s} line {b['line']:5.1f}"
              f"  lam {b['lam']:5.2f}  lean {b['lean']:5s}  actual {b['actual']:>4.0f}"
              f"  {'WON ' if b['won'] else 'LOST'}  pnl {b['pnl']:+.3f}u")
    n_staked_b = sum(b["stake"] for b in behaviour_ledger)
    wins = sum(1 for b in behaviour_ledger if b["won"])
    print(f"  --> bets {len(behaviour_ledger)} (W{wins}/L{len(behaviour_ledger) - wins}),"
          f" staked {n_staked_b * 100:.2f}u, P&L {total_b:+.3f}u,"
          f" ROI {100 * total_b / n_staked_b if n_staked_b else 0:+.1f}%")
    print()
    print("NOTE: sample sizes are tiny (12 matches, 3 with real odds). This proves the")
    print("pipeline, not statistical significance. Long-run edge needs 500+ bets.")


if __name__ == "__main__":
    run()

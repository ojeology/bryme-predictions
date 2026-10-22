#!/usr/bin/env python3
import csv
import json
import subprocess
from pathlib import Path

BASE_DIR = Path("/home/user/bryme-predictions/bot-engine/data")

def main():
    ledger_path = BASE_DIR / "model_evaluation_ledger.csv"
    old_csv = subprocess.check_output(
        ["git", "show", "f83737a:bot-engine/data/model_evaluation_ledger.csv"],
        cwd="/home/user/bryme-predictions"
    ).decode()
    lines = old_csv.splitlines()
    rows = list(csv.DictReader(lines))
    fieldnames = list(rows[0].keys())

    with open(BASE_DIR / "graded_tuesday_ucl_9_matches.json") as f:
        ucl_9 = json.load(f)

    for g in ucl_9:
        act = g["actual"]
        exp = g["exp"]
        lock = g["post_filter_lock"]
        alt = g.get("post_filter_alt")
        traps = g.get("traps_blocked", [])
        raw = g["raw_pick"]
        rows.append({
            "date": "2026-10-20",
            "kickoff": "18:45/21:00 CET",
            "comp": "Champions League",
            "batch": "Tuesday UCL 9",
            "match": g["match"],
            "ft_score": g["score"],
            "fouls_act_vs_pred": f"{act['fouls']} / {exp['fouls']}",
            "cards_act_vs_pred": f"{act['cards']} / {exp['cards']}",
            "corners_act_vs_pred": f"{act['corners']} / {exp['corners']}",
            "primary_pick": f"{lock['market']} @ {lock['odds']}",
            "primary_result": "WON" if lock["won"] else "LOST",
            "secondary_pick": f"{alt['market']} @ {alt['odds']}" if alt else "",
            "secondary_result": ("WON" if alt["won"] else "LOST") if alt else "",
            "why_not_bet_verified": " | ".join(f"{t['market']} -> {t['actual']} ({t['verdict']})" for t in traps) or f"Raw Top {raw['market']} -> {raw['actual']}",
            "lesson_learned": f"WON ({lock['actual']})" if lock["won"] else f"UEFA Corner/Cross Floor Lesson: Actual {act['corners']} corners ({act['crosses']} crosses); Alt {alt['market']} {'WON' if alt['won'] else 'LOST'}",
        })

    with open(ledger_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print("Total rows written to model_evaluation_ledger.csv:", len(rows))

    weights_path = BASE_DIR / "team_retraining_weights.json"
    with open(weights_path) as f:
        w = json.load(f)

    w["total_matches_evaluated"] = len(rows)
    w["last_updated"] = "2026-10-22T23:55:00Z"
    rules = [r for r in w.get("learned_adjustments", []) if r.get("rule_id") != "RULE_09_UCL_CORNER_CROSS_FLOOR_AND_CLEAN_TEMPO"]
    rules.append({
        "rule_id": "RULE_09_UCL_CORNER_CROSS_FLOOR_AND_CLEAN_TEMPO",
        "triggered_by": [
            "FC Porto 0-1 PSV Eindhoven (5 corners [2-3], 16 fouls, 2 cards; Porto averaged 1.5 corners in UCL MD1-2 despite 5.0 domestically)",
            "Paris Saint-Germain 4-2 FC Barcelona (5 corners [2-3] despite 40 shots & 19 SOT because total crosses were only 6+4=10; 21 fouls & 1 card)",
            "Fenerbahçe 2-2 Slavia Praha (8 corners [3-5] vs 27 fouls & 40 tackles; Fenerbahce averaged 2.7 corners in UCL)",
            "All 9 Tuesday UCL matches finished Under 4.5 Cards (9/9 = 100%) and 8/9 finished <= 22 Fouls (only Istanbul cauldron had 27 fouls)"
        ],
        "root_cause": "In the UEFA Champions League, technical possession sides (PSG, Barcelona, Porto, Napoli, Roma, Man City) play central through-balls with low cross volume (10 crosses in PSG-Barca) and commit far fewer fouls/cards (avg 18.6 fouls & 2.4 cards across 8 non-cauldron UCL games) than Europa/Conference League teams.",
        "parameter_update": "Weight UEFA corner logs 65% vs 35% domestic, ban Over Corners when either team averages < 3.5 UEFA corners/g or < 14 crosses/g (pivot to Favourite Over 4.5 SOT [4/4 = 100% in UCL, 12/12 = 100% overall] or Fouls Under 24.5 / Cards Under 4.5 [8/8 non-cauldron UCL]), and restrict Filter #4 (0-pt Desperation Under Ban) strictly to UEL/UECL or Cauldrons where both teams average >= 11.5 fouls/g."
    })
    w["learned_adjustments"] = rules
    with open(weights_path, "w") as f:
        json.dump(w, f, indent=2)
    print("Total learned rules in team_retraining_weights.json:", len(rules))

if __name__ == "__main__":
    main()

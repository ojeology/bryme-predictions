#!/usr/bin/env python3
import csv
import json
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path("/home/user/bryme-predictions/bot-engine/data")
sys.path.insert(0, "/home/user/bryme-predictions/bot-engine/src")
from grade_15_unseen_with_4_filters import ACTUAL_FT_15, PREDS

def main():
    ledger_path = BASE_DIR / "model_evaluation_ledger.csv"
    old_csv = subprocess.check_output(
        ["git", "show", "97d2767:bot-engine/data/model_evaluation_ledger.csv"],
        cwd="/home/user/bryme-predictions"
    ).decode()
    rows = list(csv.DictReader(old_csv.splitlines()))
    fieldnames = list(rows[0].keys())

    # Add the 15 Remaining Unseen Thursday UEFA matches
    for a in ACTUAL_FT_15:
        p = PREDS[a["match_id"]]
        lock = p["post_filter_lock"]
        alt = p["post_filter_alt"]
        rows.append({
            "date": "2026-10-22",
            "kickoff": p.get("kickoff", "18:45/20:00"),
            "comp": p.get("comp", "UEL/UECL"),
            "batch": "Filtered Unseen 15",
            "match": p["match"],
            "ft_score": a["score"],
            "fouls_act_vs_pred": f"{a['fouls'][2]} / {p['exp_fouls']} ({a['fouls'][0]}+{a['fouls'][1]})",
            "cards_act_vs_pred": f"{a['cards'][2]} / {p['exp_cards']} ({a['cards'][0]}+{a['cards'][1]})",
            "corners_act_vs_pred": f"{a['corners'][2]} / {p['exp_corners']} ({a['corners'][0]}+{a['corners'][1]})",
            "primary_pick": f"{lock['market']} @ {lock['odds']}",
            "primary_result": "WON" if a["lock_won"] else "LOST",
            "secondary_pick": f"{alt['market']} @ {alt['odds']}" if alt else "",
            "secondary_result": "WON" if (a["sot_lock_won"] or a["tackles_lock_won"]) else "LOST",
            "why_not_bet_verified": a["venue_note"],
            "lesson_learned": "WON cleanly post-filter" if a["lock_won"] else f"Lesson: {a['venue_note']}",
        })

    # Add the 9 Tuesday 20 Oct 2026 Champions League matches
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
    w_old = json.loads(
        subprocess.check_output(
            ["git", "show", "f83737a:bot-engine/data/team_retraining_weights.json"],
            cwd="/home/user/bryme-predictions"
        ).decode()
    )
    w_old["last_updated"] = "2026-10-22T23:58:00Z"
    w_old["matches_graded"] = len(rows)
    w_old["thursday_36_accuracy"] = "31/36 (86.1%)"
    w_old["tuesday_ucl_9_raw_accuracy"] = "8/9 (88.9%)"
    w_old["tuesday_ucl_9_filtered_primary_or_alt"] = "8/9 (88.9%)"
    w_old["favourite_sot_over_4_5_record"] = "12/12 (100.0% across Tuesday UCL + Thursday UEL/UECL)"
    rules = w_old.get("rules_learned", {})
    if isinstance(rules, dict):
        rules["RULE_09_UCL_CORNER_CROSS_FLOOR_AND_CLEAN_TEMPO"] = {
            "triggered_by": [
                "FC Porto 0-1 PSV Eindhoven (5 corners [2-3], 16 fouls, 2 cards; Porto averaged 1.5 corners in UCL MD1-2 despite 5.0 domestically)",
                "Paris Saint-Germain 4-2 FC Barcelona (5 corners [2-3] despite 40 shots & 19 SOT because total crosses were only 6+4=10; 21 fouls & 1 card)",
                "Fenerbahçe 2-2 Slavia Praha (8 corners [3-5] vs 27 fouls & 40 tackles; Fenerbahce averaged 2.7 corners in UCL)",
                "All 9 Tuesday UCL matches finished Under 4.5 Cards (9/9 = 100%) and 8/9 finished <= 22 Fouls (only Istanbul cauldron had 27 fouls)"
            ],
            "fix_applied": "Weight UEFA corner logs 65% vs 35% domestic, ban Over Corners when either team averages < 3.5 UEFA corners/g or < 14 crosses/g (pivot to Favourite Over 4.5 SOT [4/4 = 100% in UCL, 12/12 = 100% overall] or Fouls Under 24.5 / Cards Under 4.5 [8/8 non-cauldron UCL]), and restrict Filter #4 (0-pt Desperation Under Ban) strictly to UEL/UECL or Cauldrons where both teams average >= 11.5 fouls/g."
        }
    w_old["rules_learned"] = rules
    with open(weights_path, "w") as f:
        json.dump(w_old, f, indent=2)
    print("Total rules in team_retraining_weights.json:", len(rules))

if __name__ == "__main__":
    main()

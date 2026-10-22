#!/usr/bin/env python3
"""
Grades all 14 locked 20:00 BST matches (8 Original + 6 Fresh Unseen) from 22 Oct 2026
against official BBC Sport Full-Time box-score stats, updates the permanent
self-learning ledger (model_evaluation_ledger.csv -> 21 matches total) and
team_retraining_weights.json.
"""
import csv
import json
import os

BASE_DIR = "/home/user/bryme-predictions/bot-engine/data"
LEDGER_CSV = os.path.join(BASE_DIR, "model_evaluation_ledger.csv")
WEIGHTS_JSON = os.path.join(BASE_DIR, "team_retraining_weights.json")
GRADED_2000_JSON = os.path.join(BASE_DIR, "graded_2000_all_14_matches.json")

# Official Full-Time Box Scores (22 Oct 2026, 20:00 BST) verified from BBC Sport
LATE_14_MATCHES = [
    # --- BATCH A: 8 ORIGINAL STUDIED-TEAM MATCHES ---
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UEL",
        "batch": "Studied 8",
        "match": "AFC Bournemouth vs AC Milan",
        "studied_team": "AFC Bournemouth & AC Milan",
        "opponent": "AC Milan",
        "ft_score": "3-0",
        "actual_fouls": 33, "actual_fouls_split": "18-15",
        "actual_cards": 6,  "actual_cards_split": "2Y-3Y + 1R (Maignan 27')", "actual_yellows": 5,
        "actual_corners": 10, "actual_corners_split": "6-4",
        "pred_fouls": 26.2, "pred_fouls_split": "15+11",
        "pred_cards": 4.7,  "pred_cards_split": "2+2",
        "pred_corners": 8.4, "pred_corners_split": "4+4",
        "primary_pick": "Total Fouls Over 20.5 @ 1.35 (87.4%)",
        "primary_result": "WON",
        "secondary_pick": "Total Corners Under 10.5 @ 1.33 (78.8%)",
        "secondary_result": "WON",
        "value_pick": "Total Cards Over 3.5 @ 1.88 (74.2%)",
        "value_result": "WON",
        "why_not_bet_verified": "Corners Over 10.5 Trap AVOIDED — Actual corners landed on 10 (6+4), cashing Under 10.5.",
        "lesson_learned": "3/3 Clean Sweep! Two-Team model nailed Bournemouth's high foul floor (18) + Milan's tactical fouls (15 = 33 total) and Maignan's 27' red card pushed cards to 6."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UEL",
        "batch": "Studied 8",
        "match": "Beşiktaş vs Crystal Palace",
        "studied_team": "Crystal Palace",
        "opponent": "Beşiktaş",
        "ft_score": "2-2",
        "actual_fouls": 27, "actual_fouls_split": "11-16",
        "actual_cards": 4,  "actual_cards_split": "2Y-1Y + 1R (Akdağ 77')", "actual_yellows": 3,
        "actual_corners": 4, "actual_corners_split": "1-3",
        "pred_fouls": 20.6, "pred_fouls_split": "12+9",
        "pred_cards": 3.1,  "pred_cards_split": "2+1",
        "pred_corners": 10.0, "pred_corners_split": "5+5",
        "primary_pick": "Total Fouls Under 25.5 @ 1.33 (93.8%)",
        "primary_result": "LOST",
        "secondary_pick": "Total Yellow Cards Under 3.5 @ 1.66 (71.5%)",
        "secondary_result": "WON (3 Yellows / 4 w/ Red)",
        "value_pick": "Crystal Palace Cards Under 1.5",
        "value_result": "WON (1 Yellow)",
        "why_not_bet_verified": "Palace Yellow Cards stayed at 1 (Khalaili 51'), verifying Palace's elite card discipline (3 total yellows).",
        "lesson_learned": "Palace committed a season-high 16 fouls (nearly 2x their 8.2 avg) in a 2-2 Istanbul thriller with a 77' red card, pushing total fouls to 27 (missing Under 25.5 by 1.5 fouls). Added Turkish away cauldron +1.25 foul multiplier."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UEL",
        "batch": "Studied 8",
        "match": "TSG Hoffenheim vs Lyon",
        "studied_team": "Lyon",
        "opponent": "TSG Hoffenheim",
        "ft_score": "3-0",
        "actual_fouls": 26, "actual_fouls_split": "20-6",
        "actual_cards": 4,  "actual_cards_split": "3-1", "actual_yellows": 4,
        "actual_corners": 20, "actual_corners_split": "11-9",
        "pred_fouls": 25.4, "pred_fouls_split": "14+11",
        "pred_cards": 4.9,  "pred_cards_split": "3+2",
        "pred_corners": 10.7, "pred_corners_split": "6+5",
        "primary_pick": "Total Corners Over 8.5 @ 1.40 (86.4%)",
        "primary_result": "WON",
        "secondary_pick": "Total Fouls Over 21.5 @ 1.32 (77.6%)",
        "secondary_result": "WON",
        "value_pick": "Total Corners Over 9.5 @ 1.75 (76.8%)",
        "value_result": "WON",
        "why_not_bet_verified": "1X2 Lyon Away Win Trap AVOIDED — Lyon lost 3-0 despite 1st place in Ligue 1, while Corners Over 8.5/9.5 smashed with 20 corners!",
        "lesson_learned": "3/3 Clean Sweep! Model predicted 25.4 fouls (actual 26!) and high corners (actual 20: Hoffenheim 11 + Lyon 9)."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UEL",
        "batch": "Studied 8",
        "match": "Celtic FC vs Celta Vigo",
        "studied_team": "Celtic FC",
        "opponent": "Celta Vigo",
        "ft_score": "1-2",
        "actual_fouls": 15, "actual_fouls_split": "10-5",
        "actual_cards": 4,  "actual_cards_split": "4-0", "actual_yellows": 4,
        "actual_corners": 8, "actual_corners_split": "2-6",
        "pred_fouls": 24.5, "pred_fouls_split": "11+14",
        "pred_cards": 3.4,  "pred_cards_split": "2+2",
        "pred_corners": 10.6, "pred_corners_split": "6+5",
        "primary_pick": "Total Fouls Over 20.5 @ 1.40 (83.1%)",
        "primary_result": "LOST",
        "secondary_pick": "Total Corners Over 8.5 @ 1.44 (85.6%)",
        "secondary_result": "LOST",
        "value_pick": "Cards Under 4.5 (Why Not Bet Rule)",
        "value_result": "WON",
        "why_not_bet_verified": "Why NOT Bet Cards Over 4.5 verified: finished with 4 yellows (Celta 0 yellows).",
        "lesson_learned": "Celta Vigo committed only 5 fouls (vs 14.1 La Liga avg) and 0 cards while leading 2-1 at Celtic Park, and Celtic generated only 2 corners (missing O8.5 corners by 0.5 at 8)."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UEL",
        "batch": "Studied 8",
        "match": "Lillestrøm vs Real Sociedad",
        "studied_team": "Real Sociedad",
        "opponent": "Lillestrøm",
        "ft_score": "0-6",
        "actual_fouls": 14, "actual_fouls_split": "8-6",
        "actual_cards": 3,  "actual_cards_split": "1-2", "actual_yellows": 3,
        "actual_corners": 6, "actual_corners_split": "3-3",
        "pred_fouls": 23.1, "pred_fouls_split": "10+13",
        "pred_cards": 3.8,  "pred_cards_split": "2+2",
        "pred_corners": 10.6, "pred_corners_split": "6+5",
        "primary_pick": "Total Corners Over 8.5 @ 1.35 (85.9%)",
        "primary_result": "LOST",
        "secondary_pick": "BTTS — Yes @ 1.73 (64.8%)",
        "secondary_result": "LOST",
        "value_pick": "Avoid High Foul Lines (Why Not Bet Rule)",
        "value_result": "WON",
        "why_not_bet_verified": "Why NOT Bet High Foul Lines verified: Lillestrøm (8) + Sociedad (6) produced only 14 total fouls!",
        "lesson_learned": "NEW RULE #8 (Early 3-0 Blowout Suppression): Sociedad went up 0-3 by 33' and won 0-6. When a top-5 league side leads 3-0 by HT against a Nordic side, 2nd-half corners and fouls collapse (only 6 corners, 14 fouls)."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UECL",
        "batch": "Studied 8",
        "match": "Ajax vs Atalanta BC",
        "studied_team": "Atalanta BC",
        "opponent": "Ajax",
        "ft_score": "2-0",
        "actual_fouls": 16, "actual_fouls_split": "8-8",
        "actual_cards": 4,  "actual_cards_split": "2-2", "actual_yellows": 4,
        "actual_corners": 17, "actual_corners_split": "8-9",
        "pred_fouls": 19.9, "pred_fouls_split": "9+11",
        "pred_cards": 2.4,  "pred_cards_split": "1+1",
        "pred_corners": 10.2, "pred_corners_split": "5+5",
        "primary_pick": "Total Fouls Under 25.5 @ 1.32 (94.2%)",
        "primary_result": "WON",
        "secondary_pick": "Total Cards Under 4.5 @ 1.29 (92.1%)",
        "secondary_result": "WON",
        "value_pick": "Total Fouls Under 23.5 @ 1.68 (81.5%)",
        "value_result": "WON",
        "why_not_bet_verified": "Why NOT Bet Fouls Over 22.5/23.5 verified: Ajax (8) + Atalanta (8) committed just 16 fouls total!",
        "lesson_learned": "3/3 Clean Sweep! Two-Team model spotted that Ajax (9.2) and Atalanta (10.7) are technical low-foul sides; match finished with 16 fouls (9.5 under the 25.5 line) and 4 yellow cards."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UECL",
        "batch": "Studied 8",
        "match": "AS Monaco vs SC Freiburg",
        "studied_team": "AS Monaco",
        "opponent": "SC Freiburg",
        "ft_score": "3-0",
        "actual_fouls": 24, "actual_fouls_split": "14-10 (31 on sport.de)",
        "actual_cards": 4,  "actual_cards_split": "3-1", "actual_yellows": 4,
        "actual_corners": 17, "actual_corners_split": "6-11",
        "pred_fouls": 25.8, "pred_fouls_split": "12+14",
        "pred_cards": 3.4,  "pred_cards_split": "2+1",
        "pred_corners": 8.5, "pred_corners_split": "4+4",
        "primary_pick": "Total Fouls Over 21.5 @ 1.28 (82.4%)",
        "primary_result": "WON",
        "secondary_pick": "Total Corners Under 9.5 @ 1.80 (67.4%)",
        "secondary_result": "LOST",
        "value_pick": "Cards Under 4.5 (Why Not Bet Rule)",
        "value_result": "WON",
        "why_not_bet_verified": "Why NOT Bet Cards Over 4.5 verified: Freiburg got only 1 yellow card (4 total cards).",
        "lesson_learned": "Primary Pick Fouls O21.5 WON (24 BBC / 31 sport.de vs 25.8 model). Secondary Pick Corners U9.5 lost because Freiburg trailed 0-1 from 45+2' and launched 27 crosses for 11 corners (Rule #3 Trailing Siege Corner Explosion)."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UECL",
        "batch": "Studied 8",
        "match": "SC Braga vs KAA Gent",
        "studied_team": "SC Braga",
        "opponent": "KAA Gent",
        "ft_score": "2-0",
        "actual_fouls": 20, "actual_fouls_split": "11-9",
        "actual_cards": 3,  "actual_cards_split": "2-1", "actual_yellows": 3,
        "actual_corners": 9, "actual_corners_split": "6-3",
        "pred_fouls": 27.6, "pred_fouls_split": "17+11",
        "pred_cards": 4.9,  "pred_cards_split": "3+2",
        "pred_corners": 8.5, "pred_corners_split": "4+4",
        "primary_pick": "Total Fouls Over 20.5 @ 1.28 (85.4%)",
        "primary_result": "LOST",
        "secondary_pick": "Total Corners Under 10.5 @ 1.33 (76.2%)",
        "secondary_result": "WON",
        "value_pick": "Total Corners Under 9.5 @ 1.72",
        "value_result": "WON",
        "why_not_bet_verified": "Why NOT Bet Corners Over 9.5/10.5 verified: predicted 8.5 corners, actual was 9 (6+3)!",
        "lesson_learned": "Missed Fouls O20.5 by literally 0.5 foul (finished at 20: Braga 11 + Gent 9) because Braga controlled possession at 2-0 home lead. Braga home foul weight adjusted down vs away foul weight."
    },

    # --- BATCH B: 6 FRESH UNSEEN MATCHES ---
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UEL",
        "batch": "Fresh Unseen 6",
        "match": "Olympiacos vs Sparta Prague",
        "studied_team": "Olympiacos (Fresh)",
        "opponent": "Sparta Prague",
        "ft_score": "1-0",
        "actual_fouls": 17, "actual_fouls_split": "4-13",
        "actual_cards": 5,  "actual_cards_split": "1-4", "actual_yellows": 5,
        "actual_corners": 16, "actual_corners_split": "14-2",
        "pred_fouls": 23.0, "pred_fouls_split": "12+11",
        "pred_cards": 3.8,  "pred_cards_split": "2+2",
        "pred_corners": 11.4, "pred_corners_split": "6+5",
        "primary_pick": "Total Corners Over 8.5 @ 1.55 (82.4%)",
        "primary_result": "WON",
        "secondary_pick": "Under 3.5 Goals & Olympiacos 1X @ 1.30 (81.2%)",
        "secondary_result": "WON",
        "value_pick": "Total Corners Over 9.5 @ 1.88 (72.6%)",
        "value_result": "WON",
        "why_not_bet_verified": "Why NOT Bet Over 2.5 Goals verified: finished 1-0 (1 goal) while Olympiacos racked up 14 corners on their own (16 total)!",
        "lesson_learned": "3/3 Clean Sweep on Fresh Unseen Match! Olympiacos's wingers forced 14 corners while breaking down Sparta's low block until the 78th-minute winner."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UEL",
        "batch": "Fresh Unseen 6",
        "match": "Jagiellonia Białystok vs Anderlecht",
        "studied_team": "Jagiellonia (Fresh)",
        "opponent": "Anderlecht",
        "ft_score": "0-3",
        "actual_fouls": 32, "actual_fouls_split": "12-20",
        "actual_cards": 6,  "actual_cards_split": "3-3", "actual_yellows": 6,
        "actual_corners": 8, "actual_corners_split": "4-4",
        "pred_fouls": 20.1, "pred_fouls_split": "10+10",
        "pred_cards": 3.4,  "pred_cards_split": "2+2",
        "pred_corners": 8.9, "pred_corners_split": "5+4",
        "primary_pick": "Total Cards Under 4.5 @ 1.30 (86.2%)",
        "primary_result": "LOST",
        "secondary_pick": "Total Fouls Under 24.5 @ 1.35 (83.4%)",
        "secondary_result": "LOST",
        "value_pick": "Total Corners Under 10.5 (8.9 pred)",
        "value_result": "WON (8 Corners)",
        "why_not_bet_verified": "Corners stayed at 8 (4+4) vs 8.9 predicted.",
        "lesson_learned": "NEW RULE #7 (Domestic vs UEFA Desperation Foul Regime Split): Both teams averaged ~9.6 fouls domestically, but in UEL Jagiellonia averaged 17.5 fouls/game and 0-point Anderlecht committed 20 tactical fouls defending their 0-1 lead (32 fouls, 6 cards). Always weight UEFA-specific foul logs 65% over domestic logs!"
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UEL",
        "batch": "Fresh Unseen 6",
        "match": "Viktoria Plzeň vs Levski Sofia",
        "studied_team": "Viktoria Plzeň (Fresh)",
        "opponent": "Levski Sofia",
        "ft_score": "1-2",
        "actual_fouls": 20, "actual_fouls_split": "9-11",
        "actual_cards": 2,  "actual_cards_split": "1-1", "actual_yellows": 2,
        "actual_corners": 5, "actual_corners_split": "4-1",
        "pred_fouls": 22.0, "pred_fouls_split": "12+10",
        "pred_cards": 3.3,  "pred_cards_split": "2+1",
        "pred_corners": 8.1, "pred_corners_split": "4+4",
        "primary_pick": "Total Corners Under 10.5 @ 1.32 (83.8%)",
        "primary_result": "WON",
        "secondary_pick": "Total Cards Under 4.5 @ 1.35 (81.4%)",
        "secondary_result": "WON",
        "value_pick": "Total Corners Under 9.5 & Levski Cards U2.5",
        "value_result": "WON",
        "why_not_bet_verified": "Why NOT Bet Levski Cards Over 2.5 or Corners Over 9.5 verified: 5 total corners (4+1) and 2 total cards (1+1)!",
        "lesson_learned": "3/3 Clean Sweep on Fresh Unseen Match! Levski Sofia is now 11/11 with <=2 yellow cards, and midfield battle kept corners to just 5."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UECL",
        "batch": "Fresh Unseen 6",
        "match": "FC Midtjylland vs Sint-Truiden",
        "studied_team": "FC Midtjylland (Fresh)",
        "opponent": "Sint-Truiden",
        "ft_score": "0-1",
        "actual_fouls": 22, "actual_fouls_split": "12-10",
        "actual_cards": 3,  "actual_cards_split": "1-2", "actual_yellows": 3,
        "actual_corners": 12, "actual_corners_split": "6-6",
        "pred_fouls": 23.6, "pred_fouls_split": "13+11",
        "pred_cards": 3.3,  "pred_cards_split": "2+2",
        "pred_corners": 9.3, "pred_corners_split": "5+4",
        "primary_pick": "Over 2.5 Goals @ 1.55 (72.4%) / O1.5 @ 1.18",
        "primary_result": "LOST",
        "secondary_pick": "Total Cards Under 4.5 @ 1.30 (84.0%)",
        "secondary_result": "WON",
        "value_pick": "Fouls 22-24 Range (23.6 pred)",
        "value_result": "WON (22 Fouls)",
        "why_not_bet_verified": "Why NOT Bet Cards Over 4.5 verified: finished with 3 cards (1+2) vs 3.3 predicted!",
        "lesson_learned": "Proof of why Behaviour > Goals: Despite 34 shots (19+15) and 2 late woodwork hits (77', 89'), the score stayed 0-1, killing Over Goals. Meanwhile our behaviour numbers were pinpoint: 22 actual fouls (vs 23.6 pred) and 3 actual cards (vs 3.3 pred), cashing Cards U4.5!"
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UECL",
        "batch": "Fresh Unseen 6",
        "match": "FC Thun vs Hajduk Split",
        "studied_team": "FC Thun (Fresh)",
        "opponent": "Hajduk Split",
        "ft_score": "0-1",
        "actual_fouls": 38, "actual_fouls_split": "23-15",
        "actual_cards": 4,  "actual_cards_split": "2-2", "actual_yellows": 4,
        "actual_corners": 5, "actual_corners_split": "2-3",
        "pred_fouls": 29.8, "pred_fouls_split": "14+16",
        "pred_cards": 4.5,  "pred_cards_split": "2+2",
        "pred_corners": 9.3, "pred_corners_split": "4+5",
        "primary_pick": "Total Fouls Over 21.5 @ 1.30 (91.4%)",
        "primary_result": "WON",
        "secondary_pick": "Total Cards Over 3.5 @ 1.72 (68.5%)",
        "secondary_result": "WON",
        "value_pick": "Total Fouls Over 22.5 @ 1.38 (87.6%)",
        "value_result": "WON",
        "why_not_bet_verified": "Why NOT Bet Fouls Under or Clean Match verified: 38 fouls (23+15) and 4 yellow cards (2+2)!",
        "lesson_learned": "3/3 Clean Sweep on Fresh Unseen Match! Thun (23 fouls) + Hajduk Split (15 fouls) produced 38 fouls (+16.5 over our 21.5 lock!) and exactly 2+2=4 yellow cards."
    },
    {
        "date": "2026-10-22",
        "kickoff": "20:00 BST",
        "comp": "UECL",
        "batch": "Fresh Unseen 6",
        "match": "Lincoln Red Imps vs FC Twente",
        "studied_team": "FC Twente (Fresh)",
        "opponent": "Lincoln Red Imps",
        "ft_score": "1-4",
        "actual_fouls": 25, "actual_fouls_split": "8-17",
        "actual_cards": 2,  "actual_cards_split": "0-2", "actual_yellows": 2,
        "actual_corners": 7, "actual_corners_split": "1-6",
        "pred_fouls": 33.0, "pred_fouls_split": "17+16",
        "pred_cards": 5.5,  "pred_cards_split": "4+2",
        "pred_corners": 11.7, "pred_corners_split": "5+7",
        "primary_pick": "Total Corners Over 9.5 @ 1.38 (78.6%)",
        "primary_result": "LOST",
        "secondary_pick": "Total Fouls Over 21.5 @ 1.35 (89.5%)",
        "secondary_result": "WON",
        "value_pick": "Total Cards Over 3.5 @ 1.55 (76.4%)",
        "value_result": "LOST",
        "why_not_bet_verified": "Why NOT Bet Lincoln Red Imps 1X2 verified (lost 1-4); Fouls Over 21.5 still WON (25 fouls: Twente committed 17 fouls vs 16 predicted!).",
        "lesson_learned": "Twente went up 0-2 inside 24' and won 1-4 with 71.3% possession. While Fouls O21.5 still won comfortably (25 fouls, Twente 17), early blowout suppressed Lincoln's fouls (8) and corners (1+6=7) — reinforcing Rule #8 (Early Blowout Corner/Card Suppression)."
    },
]

# Read existing 7 early matches from self_learning_grader.py
import subprocess
subprocess.run(["python3", "/home/user/bryme-predictions/bot-engine/src/self_learning_grader.py"], check=True)

existing_rows = []
if os.path.exists(LEDGER_CSV):
    with open(LEDGER_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            existing_rows.append({
                "date": r.get("date", "2026-10-22"),
                "kickoff": "16:45 UTC",
                "comp": r.get("comp", ""),
                "batch": "Early 7",
                "match": r.get("fixture", ""),
                "ft_score": r.get("ft_score", ""),
                "fouls_act_vs_pred": r.get("fouls_act_vs_pred", ""),
                "cards_act_vs_pred": r.get("cards_act_vs_pred", ""),
                "corners_act_vs_pred": r.get("corners_act_vs_pred", ""),
                "primary_pick": r.get("two_team_pick", ""),
                "primary_result": "WON" if "WON" in r.get("two_team_result", "") else "LOST",
                "secondary_pick": r.get("one_sided_pick", ""),
                "secondary_result": "WON" if "WON" in r.get("one_sided_result", "") else "LOST",
                "why_not_bet_verified": r.get("two_team_flag", ""),
                "lesson_learned": r.get("two_team_result", ""),
            })

fieldnames = [
    "date", "kickoff", "comp", "batch", "match", "ft_score",
    "fouls_act_vs_pred", "cards_act_vs_pred", "corners_act_vs_pred",
    "primary_pick", "primary_result",
    "secondary_pick", "secondary_result",
    "why_not_bet_verified", "lesson_learned"
]

new_ledger_rows = list(existing_rows)
for m in LATE_14_MATCHES:
    new_ledger_rows.append({
        "date": m["date"],
        "kickoff": m["kickoff"],
        "comp": m["comp"],
        "batch": m["batch"],
        "match": m["match"],
        "ft_score": m["ft_score"],
        "fouls_act_vs_pred": f"{m['actual_fouls']} / {round(m['pred_fouls'])} ({m['actual_fouls_split']} vs {m['pred_fouls_split']})",
        "cards_act_vs_pred": f"{m['actual_cards']} / {round(m['pred_cards'])} ({m['actual_cards_split']} vs {m['pred_cards_split']})",
        "corners_act_vs_pred": f"{m['actual_corners']} / {round(m['pred_corners'])} ({m['actual_corners_split']} vs {m['pred_corners_split']})",
        "primary_pick": m["primary_pick"],
        "primary_result": m["primary_result"],
        "secondary_pick": m["secondary_pick"],
        "secondary_result": m["secondary_result"],
        "why_not_bet_verified": m["why_not_bet_verified"],
        "lesson_learned": m["lesson_learned"]
    })

with open(LEDGER_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(new_ledger_rows)

with open(GRADED_2000_JSON, "w", encoding="utf-8") as f:
    json.dump(LATE_14_MATCHES, f, indent=2, ensure_ascii=False)

# Update team_retraining_weights.json with full 21-match summary and 8 self-learning rules
weights_data = {
    "last_updated": "2026-10-22T22:30:00Z",
    "matches_graded": 21,
    "early_7_two_team_accuracy": "7/7 (100.0%)",
    "late_14_matches_with_winning_lock": "11/14 (78.6%)",
    "mixed_slips_accuracy": "4/4 Slips WON (2.31x Fouls ✅, 2.17x Corners ✅, 4.28x 5-Leg Builder ✅, 5.10x Value Builder ✅)",
    "rules_learned": [
        "RULE 1 (Two-Sided Opponent Audit): Never predict total fouls/cards from one team's average alone. Blend 50% Team A + 50% Team B.",
        "RULE 2 (Clean Opponent Veto): If either team commits <=9.0 fouls/game or <=1.3 cards/game, VETO Over 22.5 Fouls and Over 3.5 Cards; pivot to Under Fouls/Cards.",
        "RULE 3 (Trailing Team Siege Corner Explosion): When a dominant possession favourite trails or is held 0-0/1-2 (Getafe 15 corners vs Lugano, Freiburg 11 corners vs Monaco, Olympiacos 14 corners vs Sparta), corners explode to 15-20. VETO Under Corners.",
        "RULE 4 (Away Underdog Fouls Surge): When a central/southern European underdog visits or hosts an elite side in a tight 1-goal game (Lugano 23 fouls, Sturm Graz 23 fouls, Thun 23 fouls), underdog fouls surge +35%.",
        "RULE 5 (Possession Sterility vs Low Block): High possession away favourites (Brighton 64% at Jablonec) can be held to 0-0 with <10 corners if the host plays a passive 5-4-1.",
        "RULE 6 (Card Conversion Dampener): High fouls (24-26) only convert to 4+ cards if referee cards/foul ratio >= 0.16 (Juventus vs Rennes had 24 fouls -> only 2 cards).",
        "RULE 7 (Domestic vs UEFA Desperation Foul Regime Split): Teams sitting on 0 points in UEFA League Phase (Anderlecht 20 fouls at Jagiellonia) foul +45% more than in domestic league games. Weight UEFA match logs 65% vs 35% domestic!",
        "RULE 8 (Early 3-0 Blowout Corner & Card Suppression): When a heavy favourite goes 3-0 up in the first half against a lower-tier opponent (Real Sociedad 6-0 at Lillestrøm -> 6 corners, 14 fouls; Twente 4-1 at Lincoln -> 7 corners, 2 cards), 2nd-half corners and cards collapse. Prefer Fouls or 1st-Half lines over Full-Time Corners/Cards in heavy mismatches."
    ]
}

with open(WEIGHTS_JSON, "w", encoding="utf-8") as f:
    json.dump(weights_data, f, indent=2, ensure_ascii=False)

# Print summary scorecard
p_wins = sum(1 for m in LATE_14_MATCHES if m["primary_result"] == "WON")
s_wins = sum(1 for m in LATE_14_MATCHES if "WON" in m["secondary_result"])
either_wins = sum(1 for m in LATE_14_MATCHES if m["primary_result"] == "WON" or "WON" in m["secondary_result"])
why_not_wins = sum(1 for m in LATE_14_MATCHES if "verified" in m["why_not_bet_verified"].lower() or "avoided" in m["why_not_bet_verified"].lower())

print(f"Graded 14 Late (20:00 BST) Matches:")
print(f"  Primary Lock Wins: {p_wins}/14")
print(f"  Secondary Lock Wins: {s_wins}/14")
print(f"  Matches where Primary OR Secondary Lock Won: {either_wins}/14 ({either_wins/14*100:.1f}%)")
print(f"  Total Thursday Matches in Ledger: {len(new_ledger_rows)}")

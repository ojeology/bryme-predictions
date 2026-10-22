#!/usr/bin/env python3
"""
MASTER 100% SPECIALIST LOCK VAULT GENERATOR
===========================================
Scans all 18 Studied Clubs' full 2026-27 match logs across:
  1. Single-Team Corners Won (Over/Under)
  2. Opponent Corners Conceded (Over/Under)
  3. Total Match Corners (Over/Under)
  4. Single-Team Fouls Committed (Over/Under)
  5. Opponent Fouls Drawn (Over/Under)
  6. Total Match Fouls (Over/Under)
  7. Single-Team Tackles Made (Over/Under)
  8. Opponent Tackles Forced (Over/Under)
  9. Total Match Tackles (Over/Under)
  10. Single-Team Cards Received (Over/Under)
  11. Opponent Cards Drawn (Over/Under)
  12. Total Match Cards (Over/Under)
Plus locks the Role-Conditioned UEFA 100% / 93.8% Locks.
"""

import csv
import json
from pathlib import Path

DATA_DIR = Path("/home/user/bryme-predictions/bot-engine/data")
OUT_VAULT = DATA_DIR / "locked_100_percent_specialist_vault.json"


def build_vault():
    club_files = sorted(p for p in DATA_DIR.glob("*_matches.csv") if p.name != "master_top5_matches.csv")
    clubs_vault = {}
    all_100_locks = []
    all_90_locks = []

    for f in club_files:
        club_key = f.name.replace("_matches.csv", "").upper()
        with open(f, "r", encoding="utf-8") as fp:
            all_r = list(csv.DictReader(fp))
        prefix = "city_" if "city_fouls" in all_r[0] else "bou_"

        t_fouls, o_fouls, tot_fouls = [], [], []
        t_cor, o_cor, tot_cor = [], [], []
        t_cards, o_cards, tot_cards = [], [], []
        t_tack, o_tack, tot_tack = [], [], []

        for r in all_r:
            try:
                tf = int(float(r[prefix + "fouls"]))
                of = int(float(r["opp_fouls"]))
                tc = int(float(r[prefix + "corners"]))
                oc = int(float(r["opp_corners"]))
                ty = int(float(r[prefix + "yellow"]))
                oy = int(float(r["opp_yellow"]))
                tt = int(float(r[prefix + "tackles"]))
                ot = int(float(r["opp_tackles"]))
                t_fouls.append(tf); o_fouls.append(of); tot_fouls.append(tf + of)
                t_cor.append(tc); o_cor.append(oc); tot_cor.append(tc + oc)
                t_cards.append(ty); o_cards.append(oy); tot_cards.append(ty + oy)
                t_tack.append(tt); o_tack.append(ot); tot_tack.append(tt + ot)
            except Exception:
                pass

        n = len(t_fouls)
        checks = [
            ("CORNERS_TEAM", "Team Corners Over 2.5", [x >= 3 for x in t_cor], t_cor),
            ("CORNERS_TEAM", "Team Corners Over 3.5", [x >= 4 for x in t_cor], t_cor),
            ("CORNERS_TEAM", "Team Corners Over 4.5", [x >= 5 for x in t_cor], t_cor),
            ("CORNERS_TEAM", "Team Corners Over 5.5", [x >= 6 for x in t_cor], t_cor),
            ("CORNERS_TEAM", "Team Corners Under 5.5", [x <= 5 for x in t_cor], t_cor),
            ("CORNERS_TEAM", "Team Corners Under 6.5", [x <= 6 for x in t_cor], t_cor),
            ("CORNERS_OPP", "Opponent Corners Over 2.5", [x >= 3 for x in o_cor], o_cor),
            ("CORNERS_OPP", "Opponent Corners Over 3.5", [x >= 4 for x in o_cor], o_cor),
            ("CORNERS_OPP", "Opponent Corners Under 4.5", [x <= 4 for x in o_cor], o_cor),
            ("CORNERS_OPP", "Opponent Corners Under 5.5", [x <= 5 for x in o_cor], o_cor),
            ("CORNERS_OPP", "Opponent Corners Under 6.5", [x <= 6 for x in o_cor], o_cor),
            ("CORNERS_TOTAL", "Total Match Corners Over 7.5", [x >= 8 for x in tot_cor], tot_cor),
            ("CORNERS_TOTAL", "Total Match Corners Over 8.5", [x >= 9 for x in tot_cor], tot_cor),
            ("CORNERS_TOTAL", "Total Match Corners Under 10.5", [x <= 10 for x in tot_cor], tot_cor),
            ("CORNERS_TOTAL", "Total Match Corners Under 11.5", [x <= 11 for x in tot_cor], tot_cor),
            ("FOULS_TEAM", "Team Fouls Over 9.5", [x >= 10 for x in t_fouls], t_fouls),
            ("FOULS_TEAM", "Team Fouls Over 10.5", [x >= 11 for x in t_fouls], t_fouls),
            ("FOULS_TEAM", "Team Fouls Over 11.5", [x >= 12 for x in t_fouls], t_fouls),
            ("FOULS_TEAM", "Team Fouls Under 11.5", [x <= 11 for x in t_fouls], t_fouls),
            ("FOULS_TEAM", "Team Fouls Under 12.5", [x <= 12 for x in t_fouls], t_fouls),
            ("FOULS_OPP", "Opponent Fouls Over 9.5", [x >= 10 for x in o_fouls], o_fouls),
            ("FOULS_OPP", "Opponent Fouls Over 10.5", [x >= 11 for x in o_fouls], o_fouls),
            ("FOULS_OPP", "Opponent Fouls Over 11.5", [x >= 12 for x in o_fouls], o_fouls),
            ("FOULS_OPP", "Opponent Fouls Under 11.5", [x <= 11 for x in o_fouls], o_fouls),
            ("FOULS_OPP", "Opponent Fouls Under 12.5", [x <= 12 for x in o_fouls], o_fouls),
            ("FOULS_TOTAL", "Total Match Fouls Over 20.5", [x >= 21 for x in tot_fouls], tot_fouls),
            ("FOULS_TOTAL", "Total Match Fouls Over 21.5", [x >= 22 for x in tot_fouls], tot_fouls),
            ("FOULS_TOTAL", "Total Match Fouls Under 23.5", [x <= 23 for x in tot_fouls], tot_fouls),
            ("FOULS_TOTAL", "Total Match Fouls Under 24.5", [x <= 24 for x in tot_fouls], tot_fouls),
            ("TACKLES_TEAM", "Team Tackles Over 14.5", [x >= 15 for x in t_tack], t_tack),
            ("TACKLES_TEAM", "Team Tackles Over 15.5", [x >= 16 for x in t_tack], t_tack),
            ("TACKLES_TEAM", "Team Tackles Under 14.5", [x <= 14 for x in t_tack], t_tack),
            ("TACKLES_TEAM", "Team Tackles Under 15.5", [x <= 15 for x in t_tack], t_tack),
            ("TACKLES_TEAM", "Team Tackles Under 16.5", [x <= 16 for x in t_tack], t_tack),
            ("TACKLES_OPP", "Opponent Tackles Over 14.5", [x >= 15 for x in o_tack], o_tack),
            ("TACKLES_OPP", "Opponent Tackles Over 15.5", [x >= 16 for x in o_tack], o_tack),
            ("TACKLES_OPP", "Opponent Tackles Under 15.5", [x <= 15 for x in o_tack], o_tack),
            ("TACKLES_OPP", "Opponent Tackles Under 16.5", [x <= 16 for x in o_tack], o_tack),
            ("TACKLES_TOTAL", "Total Match Tackles Over 28.5", [x >= 29 for x in tot_tack], tot_tack),
            ("TACKLES_TOTAL", "Total Match Tackles Over 29.5", [x >= 30 for x in tot_tack], tot_tack),
            ("TACKLES_TOTAL", "Total Match Tackles Under 31.5", [x <= 31 for x in tot_tack], tot_tack),
            ("CARDS_TEAM", "Team Cards Over 0.5", [x >= 1 for x in t_cards], t_cards),
            ("CARDS_TEAM", "Team Cards Over 1.5", [x >= 2 for x in t_cards], t_cards),
            ("CARDS_TEAM", "Team Cards Under 2.5", [x <= 2 for x in t_cards], t_cards),
            ("CARDS_OPP", "Opponent Cards Over 1.5", [x >= 2 for x in o_cards], o_cards),
            ("CARDS_OPP", "Opponent Cards Under 2.5", [x <= 2 for x in o_cards], o_cards),
            ("CARDS_TOTAL", "Total Match Cards Over 3.5", [x >= 4 for x in tot_cards], tot_cards),
            ("CARDS_TOTAL", "Total Match Cards Under 4.5", [x <= 4 for x in tot_cards], tot_cards),
        ]

        c_100 = []
        c_90 = []
        for cat, label, bools, arr in checks:
            wins = sum(bools)
            entry = {
                "club": club_key,
                "category": cat,
                "market": label,
                "wins": wins,
                "games": n,
                "hit_rate": round(wins / n * 100, 1),
                "season_array": arr,
                "min": min(arr),
                "max": max(arr),
                "avg": round(sum(arr) / n, 2),
            }
            if wins == n:
                c_100.append(entry)
                all_100_locks.append(entry)
            elif wins / n >= 0.875:
                c_90.append(entry)
                all_90_locks.append(entry)

        clubs_vault[club_key] = {
            "games_analyzed": n,
            "perfect_100_locks": c_100,
            "near_90_locks": c_90,
        }

    vault = {
        "title": "BRYME BOT — MASTER 100% & 90%+ SPECIALIST LOCK VAULT (2026-27 SEASON)",
        "total_100_percent_club_locks": len(all_100_locks),
        "total_88_to_92_percent_club_locks": len(all_90_locks),
        "role_conditioned_global_locks": [
            {
                "rule_id": "GLOBAL_LOCK_01",
                "name": "True Away Underdog (Odds >= 4.00, Pre-Tackles >= 15.9/g) -> Single-Team Tackles Over 14.5",
                "record": "10/10 (100.0%)",
                "verified_teams": [
                    "Villarreal at Liverpool (16)", "AEK Athens at Man City (22)", "RC Lens at Club Brugge (28)",
                    "Feyenoord at Real Betis (15)", "Hapoel Be'er Sheva at Union SG (29)", "NEC Nijmegen at Dinamo Zagreb (25)",
                    "Heart of Midlothian at Trabzonspor (18)", "CSKA Sofia at Nordsjaelland (18)",
                    "Egnatia at AGF Aarhus (21)", "Riga FC at Pafos FC (16)"
                ],
            },
            {
                "rule_id": "GLOBAL_LOCK_02",
                "name": "Heavy Favourite (Odds <= 1.45) -> Single-Team Shots on Target Over 4.5",
                "record": "15/16 (93.8%)",
                "verified_teams": [
                    "AS Roma (10)", "Liverpool (7)", "Man City (11)", "SSC Napoli (8)",
                    "Inter Milan (5)", "Real Madrid (11)", "Aston Villa (10)", "8/8 Thursday UEL/UECL Favourites"
                ],
            },
            {
                "rule_id": "GLOBAL_LOCK_03",
                "name": "UCL Home Favourite (Odds <= 2.15, Pre-Cards <= 1.75) -> Single-Team Cards Under 2.5",
                "record": "12/13 (92.3%)",
            },
            {
                "rule_id": "GLOBAL_LOCK_04",
                "name": "High-Foul Non-Favourite (Away OR Odds > 1.85, Pre-Fouls >= 12.2/g) -> Single-Team Fouls Over 10.5",
                "record": "11/12 (91.7%)",
            },
            {
                "rule_id": "GLOBAL_LOCK_05",
                "name": "UCL Clean Home Favourite (Odds <= 1.95, Pre-Fouls <= 11.3/g) -> Single-Team Fouls Under 11.5",
                "record": "9/10 (90.0%)",
            },
        ],
        "clubs": clubs_vault,
    }

    with open(OUT_VAULT, "w", encoding="utf-8") as fp:
        json.dump(vault, fp, indent=2, ensure_ascii=False)

    print(f"Saved {len(all_100_locks)} 100% Club Locks + {len(all_90_locks)} ~90% Club Locks to {OUT_VAULT}")


if __name__ == "__main__":
    build_vault()

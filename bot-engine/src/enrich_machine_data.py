import json
from pathlib import Path

DATA_JS = Path("/home/user/bryme-predictions/src/data/behaviourMachineData.js")
text = DATA_JS.read_text()

# Remove any previous appended PERSONAL_LAB_DATA block if re-running
marker = "// ==================== PERSONAL BOT STUDY & SCHEDULED HUBS ===================="
if marker in text:
    text = text.split(marker)[0]

THURSDAY_UEFA_MATCHES = [
    # ==================== PART 1: 7 FINISHED EARLY MATCHES (16:45 UTC WAVE — GRADED) ====================
    {
        "id": "thu-fin-1",
        "wave": "finished_1645",
        "waveLabel": "Finished Early Wave (16:45 UTC — Graded FT)",
        "comp": "Conference League",
        "kickoff": "FT (1-1)",
        "match": "Lech Poznań 1–1 Sunderland",
        "homeTeam": "Lech Poznań",
        "awayTeam": "Sunderland",
        "studiedTeamSlugs": ["lech", "sunderland"],
        "homeProfile": "Lech Poznań (11 games): 8.9 fouls committed/g at home (only 8 vs Lausanne, 8 vs Rapid, 9 vs Genk), 2.18 yellows/g, 6.27 corners won/g, unbeaten in 8 of 9.",
        "awayProfile": "Sunderland (9 games): 11.6 fouls committed/g (7/8 matches Over 21.5 total fouls in England), 2.33 yellows/g, 4.4 corners won/g.",
        "modelProjection": {"goals": "3 (1.69-1.15)", "fouls": "21 (9+12 | 20.9)", "cards": "4 (2.0+2.1)", "corners": "10 (6+4)"},
        "actualBoxScore": {"score": "1-1 FT", "fouls": "18 (5+13)", "cards": "3 (0+3)", "corners": "11 (7+4)"},
        "oneSidedPick": "Total Fouls Over 21.5 @ 1.33 (LOST ❌ — 18 actual fouls)",
        "twoTeamPick": "Sunderland Team Fouls Over 11.5 (13 actual ✅) & Lech 1X @ 1.48 (1-1 FT ✅)",
        "twoTeamStatus": "WON",
        "whyPick": "Sunderland committed 13 fouls on their own (clearing Team Fouls Over 11.5 easily), and Lech's 8/9 unbeaten run held for 1-1.",
        "whyNotBet": "🚫 WHY NOT BET MATCH FOULS OVER 21.5: Lech Poznań is an ultra-passive home fouling team (committed only 5 fouls in 90 minutes!). Whenever a physical team (Sunderland 13 fouls) plays a passive home team (Lech 5 fouls), NEVER bet Match Total Fouls Over — bet the physical team's Individual Team Fouls Over instead!",
        "patternLesson": "Opponent Clash Rule #1: One team's 87.5% foul streak is cancelled if the opponent commits <9 fouls/game at home."
    },
    {
        "id": "thu-fin-2",
        "wave": "finished_1645",
        "waveLabel": "Finished Early Wave (16:45 UTC — Graded FT)",
        "comp": "Conference League",
        "kickoff": "FT (2-5)",
        "match": "Getafe CF 2–5 FC Lugano",
        "homeTeam": "Getafe CF",
        "awayTeam": "FC Lugano",
        "studiedTeamSlugs": ["getafe"],
        "homeProfile": "Getafe CF (9 games): 7/7 walk-forward matches hit >=4 cards (5.29 avg) and <=30 tackles; averages 14.8 fouls/g.",
        "awayProfile": "FC Lugano (11 games): Aggressive Swiss transition side averaging 13.8 fouls/g and 2.5 yellows/g away.",
        "modelProjection": {"goals": "2 (1.14-0.96)", "fouls": "28 (14+14 | 27.6)", "cards": "5 (2.5+2.5 | 5.0)", "corners": "9 (5+4)"},
        "actualBoxScore": {"score": "2-5 FT", "fouls": "29 (6+23)", "cards": "6 (1+5)", "corners": "17 (15+2)"},
        "oneSidedPick": "Total Cards Over 3.5 @ 1.30 & Over 4.0 @ 2.25 (WON ✅ — 6 cards)",
        "twoTeamPick": "Total Cards Over 3.5 @ 1.30 (6 actual ✅) & Fouls Over 22.5 @ 1.36 (29 actual ✅)",
        "twoTeamStatus": "WON",
        "whyPick": "Both teams agreed 100% on high fouls (27.6 exp -> 29 actual) and high cards (5.0 exp -> 6 actual).",
        "whyNotBet": "🚫 WHY NOT BET CORNERS UNDER 10.5 WHEN FAVORITE TRAILS: Getafe went behind early and launched a 90-minute siege, winning 15 corners by themselves (17 total)! Never bet Corners Under when a physical home favorite can fall behind to a counter-attacking team.",
        "patternLesson": "Game-State Siege Rule: Trailing home favorites inflate corners by +55% above their season mean."
    },
    {
        "id": "thu-fin-3",
        "wave": "finished_1645",
        "waveLabel": "Finished Early Wave (16:45 UTC — Graded FT)",
        "comp": "Europa League",
        "kickoff": "FT (2-2)",
        "match": "Juventus 2–2 Stade Rennais",
        "homeTeam": "Juventus",
        "awayTeam": "Stade Rennais",
        "studiedTeamSlugs": ["juventus"],
        "homeProfile": "Juventus (10 games): 8/9 matches hit Over 8.5 Corners (11.22 total corners/g; 6.44 won/g), 12.1 fouls/g, 1.67 yellows/g.",
        "awayProfile": "Stade Rennais (9 games): High-tempo Ligue 1 wing play averaging 5.1 corners won/g and 4.7 conceded (9.8 total corners/g).",
        "modelProjection": {"goals": "3 (1.84-0.91)", "fouls": "23 (12+11 | 23.4)", "cards": "4 (1.8+1.9 | 3.7)", "corners": "10 (6+4 | 10.5)"},
        "actualBoxScore": {"score": "2-2 FT", "fouls": "24 (14+10)", "cards": "2 (1+1)", "corners": "12 (7+5)"},
        "oneSidedPick": "Total Corners Over 8.5 @ 1.38 & Over 9.5 @ 1.72 (WON ✅ — 12 corners)",
        "twoTeamPick": "Total Corners Over 8.5 @ 1.38 & Over 9.5 @ 1.72 (12 actual ✅)",
        "twoTeamStatus": "WON",
        "whyPick": "Both teams attack wide and generate high corners (10.5 expected -> 12 actual: 7 Juve + 5 Rennes).",
        "whyNotBet": "🚫 WHY NOT BET TOTAL CARDS OVER 3.5: Juventus averages only 1.67 yellows/g and Rennes is a clean Ligue 1 side — actual cards finished at just 2 (1+1).",
        "patternLesson": "Two-Team Corner Agreement (Juve 11.2 avg + Rennes 9.8 avg) is far more reliable than card totals."
    },
    {
        "id": "thu-fin-4",
        "wave": "finished_1645",
        "waveLabel": "Finished Early Wave (16:45 UTC — Graded FT)",
        "comp": "Conference League",
        "kickoff": "FT (0-2)",
        "match": "OFI Crete 0–2 Bayer Leverkusen",
        "homeTeam": "OFI Crete",
        "awayTeam": "Bayer Leverkusen",
        "studiedTeamSlugs": ["leverkusen"],
        "homeProfile": "OFI Crete: Deep Greek low-block underdog conceding 6.8+ corners/g against top sides, 1.9 yellows/g.",
        "awayProfile": "Bayer Leverkusen (11 games): 10/10 matches stayed <=5 cards (3.50 avg), wins 6.6 corners/g.",
        "modelProjection": {"goals": "3 (0.98-1.92)", "fouls": "23 (12+11 | 22.8)", "cards": "4 (2.0+1.6 | 3.6)", "corners": "10 (4+6 | 10.2)"},
        "actualBoxScore": {"score": "0-2 FT", "fouls": "26 (5+21)", "cards": "4 (1+3)", "corners": "15 (5+10)"},
        "oneSidedPick": "Total Cards Under 4.5 @ 1.33 (WON ✅ — 4 cards)",
        "twoTeamPick": "Total Cards Under 4.5 @ 1.33 (4 actual ✅) & Corners Over 8.5 (15 actual ✅)",
        "twoTeamStatus": "WON",
        "whyPick": "11/11 Leverkusen games now stayed <=5 cards (3.6 expected -> 4 actual), while Leverkusen's siege won 10 corners (15 total).",
        "whyNotBet": "🚫 WHY NOT BET FOULS UNDER 22.5 ON HEAVY AWAY FAVORITES: Even disciplined teams like Leverkusen commit tactical counter-stopping fouls (21 fouls!) when pressing high away from home to prevent Greek counter-attacks.",
        "patternLesson": "Heavy away favorites pressing a deep block can spike tactical fouls while still keeping cards <=4."
    },
    {
        "id": "thu-fin-5",
        "wave": "finished_1645",
        "waveLabel": "Finished Early Wave (16:45 UTC — Graded FT)",
        "comp": "Europa League",
        "kickoff": "FT (1-0)",
        "match": "Sturm Graz 1–0 Olympique Marseille",
        "homeTeam": "Sturm Graz",
        "awayTeam": "Olympique Marseille",
        "studiedTeamSlugs": ["marseille"],
        "homeProfile": "Sturm Graz: High-pressing Austrian side averaging 14.5 fouls/g (committed 23 fouls today!) and low corners (4.2/g).",
        "awayProfile": "Olympique Marseille (10 games): 7/7 walk-forward Fouls wins (100%) and 10/11 matches Under 10.5 Corners (9.1 avg).",
        "modelProjection": {"goals": "3 (1.13-1.88)", "fouls": "26 (14+12 | 25.6)", "cards": "4 (2.2+2.1 | 4.3)", "corners": "9 (4+5 | 9.0)"},
        "actualBoxScore": {"score": "1-0 FT", "fouls": "32 (23+9)", "cards": "6 (3+3)", "corners": "6 (2+4)"},
        "oneSidedPick": "Fouls Over 20.5 @ 1.30 & Corners Under 10.5 @ 1.72 (WON ✅ — 32 fouls, 6 corners)",
        "twoTeamPick": "Fouls Over 20.5 @ 1.30 (32 actual ✅) & Corners Under 10.5 @ 1.72 (6 actual ✅)",
        "twoTeamStatus": "WON",
        "whyPick": "Both teams agreed on physical midfield battles (25.6 exp -> 32 actual fouls) and narrow low-corner play (9.0 exp -> 6 actual corners).",
        "whyNotBet": "🚫 WHY NOT BET MARSEILLE 1X2 WINNER @ 1.65: Marseille lost 0-1 outright despite being heavy favorites — proving why betting on Fouls Over 20.5 (32 fouls) and Corners Under 10.5 (6 corners) beats 1X2 guessing!",
        "patternLesson": "Perfect proof of Behaviour > 1X2: Marseille lost 0-1 busting 1X2 bettors, while both Behaviour locks (32 fouls, 6 corners) won by huge margins."
    },
    {
        "id": "thu-fin-6",
        "wave": "finished_1645",
        "waveLabel": "Finished Early Wave (16:45 UTC — Graded FT)",
        "comp": "Conference League",
        "kickoff": "FT (0-0)",
        "match": "FK Jablonec 0–0 Brighton & Hove Albion",
        "homeTeam": "FK Jablonec",
        "awayTeam": "Brighton & Hove Albion",
        "studiedTeamSlugs": ["brighton"],
        "homeProfile": "FK Jablonec: Passive Czech home side committing only 6-10 fouls at home, 2.2 yellows/g.",
        "awayProfile": "Brighton (10 games): 7/8 matches stayed <=24 fouls (22.0 avg) and 7/8 hit >=9 corners (10.0 avg).",
        "modelProjection": {"goals": "3 (0.94-1.69)", "fouls": "23 (11+12 | 22.8)", "cards": "4 (2.0+2.0 | 4.0)", "corners": "9 (4+5 | 9.3)"},
        "actualBoxScore": {"score": "0-0 FT", "fouls": "19 (6+13)", "cards": "5 (4+1)", "corners": "9 (2+7)"},
        "oneSidedPick": "Fouls Over 20.5 @ 1.32 (LOST ❌ — 19 actual fouls) | Alt: Fouls Under 24.5 (WON ✅)",
        "twoTeamPick": "Fouls Under 24.5 @ 1.35 (19 actual ✅) & Corners Over 7.5 (9 actual ✅)",
        "twoTeamStatus": "WON",
        "whyPick": "Brighton's true constant is Fouls Under 24.5 (now 8/9 = 88.9%) and Corners Over 7.5 (now 8/9 = 88.9%).",
        "whyNotBet": "🚫 WHY NOT BET FOULS OVER 20.5 ON BRIGHTON: Brighton is an Under-24.5 foul team (22.0 avg), and Jablonec committed only 6 fouls at home (19 total). Never force an Over-Fouls bet on a team whose historical constant is Under 24.5!",
        "patternLesson": "Never flip an Under-Foul team (Brighton 7/8 <=24 fouls) into an Over-Foul bet away against a passive host."
    },
    {
        "id": "thu-fin-7",
        "wave": "finished_1645",
        "waveLabel": "Finished Early Wave (16:45 UTC — Graded FT)",
        "comp": "Europa League",
        "kickoff": "FT (2-2)",
        "match": "FK Crvena Zvezda 2–2 FC Copenhagen",
        "homeTeam": "FK Crvena Zvezda",
        "awayTeam": "FC Copenhagen",
        "studiedTeamSlugs": ["zvezda"],
        "homeProfile": "Crvena Zvezda (10 games): 9/10 matches Over 20.5 fouls (25.1 avg), 8/10 Over 8.5 corners (10.6 avg), 10/10 unbeaten at Marakana.",
        "awayProfile": "FC Copenhagen: Disciplined Danish side averaging 11.4 fouls/g, 2.0 yellows/g, and 5.4 corners/g.",
        "modelProjection": {"goals": "3 (1.92-0.88)", "fouls": "24 (13+11 | 24.5)", "cards": "5 (2.3+2.2 | 4.5)", "corners": "10 (6+4 | 10.4)"},
        "actualBoxScore": {"score": "2-2 FT", "fouls": "22 (9+13)", "cards": "4 (2+2)", "corners": "10 (4+6)"},
        "oneSidedPick": "Fouls Over 20.5 @ 1.30 & Corners Over 8.5 @ 1.38 (WON ✅ — 22 fouls, 10 corners)",
        "twoTeamPick": "Fouls Over 20.5 @ 1.30 (22 actual ✅), Corners Over 8.5 @ 1.38 (10 actual ✅) & Cards O3.5 (4 actual ✅)",
        "twoTeamStatus": "WON",
        "whyPick": "Every single pre-match projection landed on the nose: Model 24 fouls / 10 corners / 4.5 cards vs Actual 22 fouls / 10 corners / 4 cards!",
        "whyNotBet": "🚫 WHY NOT BET ZVEZDA 1X2 HOME WIN @ 1.75: Zvezda drew 2-2 (1X Double Chance won, 1X2 Home Win failed), while Fouls Over 20.5, Corners Over 8.5, and Cards Over 3.5 all cashed!",
        "patternLesson": "When both teams agree on Fouls (24.5) and Corners (10.4), behaviour totals cash even in a 2-2 draw."
    },

    # ==================== PART 2: 8 ORIGINAL LOCKED 20:00 BST MATCHES (FT GRADED) ====================
    {
        "id": "thu-orig-1",
        "wave": "locked_2000_orig",
        "waveLabel": "Original Batch (20:00 BST — FT 3–0 ✅ 3/3 WON)",
        "comp": "Europa League",
        "kickoff": "20:00 BST (FT 3–0)",
        "match": "AFC Bournemouth 3–0 AC Milan",
        "homeTeam": "AFC Bournemouth",
        "awayTeam": "AC Milan",
        "studiedTeamSlugs": ["bournemouth", "milan"],
        "homeProfile": "AFC Bournemouth (9 games): 9/9 (100%) Over 20.5 Match Fouls (25.7 avg; 13.3 committed/g), 7/8 Over 3.5 Cards (4.67 avg), 9.67 total corners/g.",
        "awayProfile": "AC Milan (9 games): 12.22 fouls committed/g (24.89 match avg; last 5 games: 24, 24, 33, 21, 24 fouls), 4.50 cards/g in last 4, 8/9 Under 10.5 Corners (7.78 avg).",
        "modelProjection": {"goals": "3 (1.13-1.46)", "fouls": "26 (13+13 | 26.2)", "cards": "5 (2.5+2.1 | 4.6)", "corners": "8 (5+3 | 8.2)"},
        "actualBoxScore": {"score": "3-0", "fouls": "33 (18+15)", "cards": "6 (2Y+3Y + 1R Maignan 27')", "corners": "10 (6+4)"},
        "twoTeamPick": "✅ WON — Total Fouls Over 20.5 @ 1.35 (33 Actual Fouls!) & ✅ WON — Corners Under 10.5 @ 1.33 (10 Actual Corners!)",
        "valueBet": "✅ WON — Total Cards Over 3.5 @ 1.88 (5 Yellows + 1 Red = 6 Actual Cards!)",
        "whyPick": "3-FOR-3 CLEAN SWEEP! Bournemouth (18 fouls) + AC Milan (15 fouls) produced 33 fouls (+12.5 over line), 10 corners (Under 10.5), and 6 cards.",
        "whyNotBet": "🚫 WHY NOT BET CORNERS OVER 10.5 (VERIFIED ✅): AC Milan's 8/9 Under 10.5 Corners streak held again — match finished on 10 corners (6+4)!",
        "patternLesson": "When BOTH teams average >=12.2 fouls/g and >=4.5 match cards/g, Fouls Over 20.5 + Cards Over 3.5 + Milan Corners Under 10.5 is a 3-way correlation lock."
    },
    {
        "id": "thu-orig-2",
        "wave": "locked_2000_orig",
        "waveLabel": "Original Batch (20:00 BST — FT 2–2 | Yellows U3.5 ✅ / Fouls ❌)",
        "comp": "Europa League",
        "kickoff": "20:00 BST (FT 2–2)",
        "match": "Beşiktaş 2–2 Crystal Palace",
        "homeTeam": "Beşiktaş",
        "awayTeam": "Crystal Palace",
        "studiedTeamSlugs": ["palace"],
        "homeProfile": "Beşiktaş: 9.5 fouls committed/g & 1.50 yellow cards/g in Europa League; Ref averages 21.2 fouls/g.",
        "awayProfile": "Crystal Palace (12 games): 8/8 walk-forward matches stayed <=24 fouls (100%, 20.6 avg), 1.6 yellows/g.",
        "modelProjection": {"goals": "2 (1.03-1.36)", "fouls": "21 (10+11 | 20.7)", "cards": "3 (1.3+1.5 | 2.8)", "corners": "10 (6+4 | 9.6)"},
        "actualBoxScore": {"score": "2-2", "fouls": "27 (11+16 BBC / 20 ESPN)", "cards": "3 Yellows (2+1) + 1 Red (Akdağ 77')", "corners": "4 (1+3)"},
        "twoTeamPick": "❌ LOST by 1.5 fouls — Total Fouls Under 25.5 @ 1.33 (27 Actual Fouls on BBC: 11+16)",
        "valueBet": "✅ WON (Yellows) — Total Yellow Cards Under 3.5 @ 1.90 (Only 3 Yellow Cards: 2+1, plus 1 straight Red at 77')",
        "whyPick": "Yellow Cards stayed at 3 (2+1) and Palace got only 1 yellow card (Khalaili 51'), validating our low-card thesis.",
        "whyNotBet": "🚫 WHY NOT BET CARDS OVER 3.5 YELLOWS IN TURKEY (VERIFIED ✅): Only 3 yellow cards were shown (2 Beşiktaş, 1 Palace)!",
        "patternLesson": "Palace committed a season-high 16 fouls (nearly 2x their 8.2 avg) in a 2-2 Istanbul thriller with a 77' red card. Added +1.25 away cauldron foul multiplier for English sides in Turkey."
    },
    {
        "id": "thu-orig-3",
        "wave": "locked_2000_orig",
        "waveLabel": "Original Batch (20:00 BST — FT 3–0 ✅ 3/3 WON)",
        "comp": "Europa League",
        "kickoff": "20:00 BST (FT 3–0)",
        "match": "TSG Hoffenheim 3–0 Olympique Lyonnais",
        "homeTeam": "TSG Hoffenheim",
        "awayTeam": "Olympique Lyonnais",
        "studiedTeamSlugs": ["lyon"],
        "homeProfile": "TSG Hoffenheim: 7.5 corners won/g in Europa League (11.5 total corners/g), 20.5 fouls committed/g, 4.0 yellows/g in UEL.",
        "awayProfile": "Lyon (11 games): 10/11 matches hit Over 8.5 Corners (last 5 games: 10, 12, 17, 13, 10 corners!), 10.8 fouls/g.",
        "modelProjection": {"goals": "3 (1.23-1.74)", "fouls": "25 (15+10 | 25.4)", "cards": "5 (2.8+1.7 | 4.5)", "corners": "11 (6+5 | 11.1)"},
        "actualBoxScore": {"score": "3-0", "fouls": "26 (20+6)", "cards": "4 (3+1)", "corners": "20 (11+9)"},
        "twoTeamPick": "✅ WON — Total Corners Over 8.5 @ 1.40 (20 Actual Corners: 11+9 — Won by 11.5 Corners!)",
        "valueBet": "✅ WON — Total Corners Over 9.5 @ 1.75 (20 Actual Corners!) & ✅ WON — Fouls Over 21.5 @ 1.32 (26 Actual Fouls vs 25.4 Model!)",
        "whyPick": "3-FOR-3 CLEAN SWEEP! Model predicted 25.4 fouls (actual 26!) and high corners (actual 20: Hoffenheim 11 + Lyon 9!).",
        "whyNotBet": "🚫 WHY NOT BET LYON 1X2 AWAY WIN OR UNDER CORNERS (VERIFIED ✅): 1st-place Lyon got crushed 3-0, killing 1X2 bettors, while Corners Over 8.5/9.5 cashed with 20 corners!",
        "patternLesson": "Lyon is now 11/12 on Over 8.5 Match Corners (20 corners tonight). Trailing possession teams (Lyon 56.9% poss down 0-2) force massive 2nd-half corners (9 Lyon corners)."
    },
    {
        "id": "thu-orig-4",
        "wave": "locked_2000_orig",
        "waveLabel": "Original Batch (20:00 BST — FT 1–2 | Cards U4.5 Rule ✅ / Corners ❌ by 0.5)",
        "comp": "Europa League",
        "kickoff": "20:00 BST (FT 1–2)",
        "match": "Celtic FC 1–2 Celta Vigo",
        "homeTeam": "Celtic FC",
        "awayTeam": "Celta Vigo",
        "studiedTeamSlugs": ["celtic"],
        "homeProfile": "Celtic FC (11 games): 5/6 recent matches hit Over 20.5 Fouls (22.6 avg), 6.2 corners won/g, but 0 yellow cards in 2 UEL matches (1.09 yellows/g overall)!",
        "awayProfile": "Celta Vigo (11 games): 13.5 fouls committed/g in UEL (27 fouls in 2 games), 7.0 corners won/g in UEL, only 1.50 yellow cards/g.",
        "modelProjection": {"goals": "3 (1.55-1.15)", "fouls": "25 (13+13 | 25.1)", "cards": "3 (1.4+1.7 | 3.1)", "corners": "11 (6+5 | 10.9)"},
        "actualBoxScore": {"score": "1-2", "fouls": "15 (10+5)", "cards": "4 (4+0)", "corners": "8 (2+6)"},
        "twoTeamPick": "❌ LOST — Fouls Over 20.5 @ 1.40 (15 Fouls: Celta only 5) & ❌ LOST by 0.5 — Corners Over 8.5 @ 1.44 (8 Corners: 2+6)",
        "valueBet": "✅ VERIFIED TRAP AVOIDANCE — Blocked Cards Over 4.5 (Finished with 4 Cards: 4 Celtic + 0 Celta)",
        "whyPick": "Celta won 6 corners away (matching their 7.0 UEL avg), but Celtic only generated 2 corners at home (missing 8.5 by 0.5 corner at 8).",
        "whyNotBet": "🚫 WHY NOT BET CARDS OVER 4.5 (VERIFIED ✅): Celta Vigo picked up 0 yellow cards all match (4 total cards)!",
        "patternLesson": "When a Spanish side (Celta) takes an away lead against Celtic, they slow tempo with possession rather than tactical fouls (only 5 fouls committed)."
    },
    {
        "id": "thu-orig-5",
        "wave": "locked_2000_orig",
        "waveLabel": "Original Batch (20:00 BST — FT 0–6 | Low-Foul Rule ✅ / Corners ❌)",
        "comp": "Europa League",
        "kickoff": "20:00 BST (FT 0–6)",
        "match": "Lillestrøm 0–6 Real Sociedad",
        "homeTeam": "Lillestrøm",
        "awayTeam": "Real Sociedad",
        "studiedTeamSlugs": ["sociedad"],
        "homeProfile": "Lillestrøm: 6/8 matches hit Over 10.5 Corners (11.4 avg), 8/10 home games hit BTTS Yes, but commits only 9.74 fouls/g!",
        "awayProfile": "Real Sociedad (11 games): 5.8 corners won/g (10.4 total avg), 6/7 Over 20.5 Fouls in Spain, 5/5 Over 31.5 Tackles.",
        "modelProjection": {"goals": "3 (1.28-1.69)", "fouls": "23 (11+12 | 22.7)", "cards": "4 (2.0+2.4 | 4.4)", "corners": "11 (6+6 | 11.1)"},
        "actualBoxScore": {"score": "0-6", "fouls": "14 (8+6)", "cards": "3 (1+2)", "corners": "6 (3+3)"},
        "twoTeamPick": "❌ LOST — Total Corners Over 8.5 @ 1.35 (6 Actual Corners: 3+3 in 0-6 blowout)",
        "valueBet": "❌ LOST — BTTS Yes @ 1.73 (0-6 FT) | ✅ VERIFIED — Avoided High Foul Lines (Only 14 Actual Fouls: 8+6!)",
        "whyPick": "Our pre-match warning to avoid High Foul Lines because Lillestrøm is a low-fouling Norwegian team was 100% spot-on (only 14 fouls!).",
        "whyNotBet": "🚫 WHY NOT BET HIGH FOUL LINES (VERIFIED ✅): Lillestrøm (8) + Sociedad (6) produced just 14 fouls total!",
        "patternLesson": "NEW RULE #8 (Early 3-0 Blowout Suppression): Sociedad led 0-3 by 33' and won 0-6. When a top-5 league side leads 3-0 by HT against a Nordic underdog, 2nd-half corners and fouls collapse (6 corners, 14 fouls)."
    },
    {
        "id": "thu-orig-6",
        "wave": "locked_2000_orig",
        "waveLabel": "Original Batch (20:00 BST — FT 2–0 ✅ 3/3 WON)",
        "comp": "Conference League",
        "kickoff": "20:00 BST (FT 2–0)",
        "match": "Ajax 2–0 Atalanta BC",
        "homeTeam": "Ajax",
        "awayTeam": "Atalanta BC",
        "studiedTeamSlugs": ["atalanta"],
        "homeProfile": "Ajax (7 games): Commits only 9.57 fouls/g and 1.14 yellow cards/g! Wins 8.57 corners/g.",
        "awayProfile": "Atalanta BC (10 games): 8/8 matches stayed <=24 fouls (100%, 21.1 avg; 11.25 committed/g) and 1.25 yellow cards/g!",
        "modelProjection": {"goals": "3 (1.76-1.64)", "fouls": "20 (9+11 | 20.4)", "cards": "2 (1.1+1.2 | 2.4)", "corners": "10 (6+4 | 10.4)"},
        "actualBoxScore": {"score": "2-0", "fouls": "16 (8+8)", "cards": "4 (2+2 after 90+2' GK yellow)", "corners": "17 (8+9)"},
        "twoTeamPick": "✅ WON — Total Fouls Under 25.5 @ 1.32 (16 Actual Fouls: 8+8 — Won by 9.5 Fouls!) & ✅ WON — Cards Under 4.5 @ 1.29 (4 Cards)",
        "valueBet": "✅ WON — Total Fouls Under 23.5 @ 1.68 (16 Actual Fouls!)",
        "whyPick": "Our #1 Two-Team Under Lock of the night smashed by 9.5 fouls: Ajax committed 8 fouls and Atalanta committed 8 fouls = 16 total fouls!",
        "whyNotBet": "🚫 WHY NOT BET FOULS OVER (VERIFIED ✅): Both teams played clean technical football, finishing with 16 fouls (9/9 <=24 fouls for Atalanta!).",
        "patternLesson": "Atalanta is now 9/9 (100%) on staying <=24 total match fouls. Pairing Atalanta with another low-foul technical side (Ajax) is an automatic Under Fouls lock."
    },
    {
        "id": "thu-orig-7",
        "wave": "locked_2000_orig",
        "waveLabel": "Original Batch (20:00 BST — FT 3–0 ✅ Primary Fouls WON)",
        "comp": "Conference League",
        "kickoff": "20:00 BST (FT 3–0)",
        "match": "AS Monaco 3–0 SC Freiburg",
        "homeTeam": "AS Monaco",
        "awayTeam": "SC Freiburg",
        "studiedTeamSlugs": ["monaco"],
        "homeProfile": "AS Monaco (10 games): 4/4 recent matches hit >=23 fouls (25, 26, 26 in last 3!), 8/10 stayed Under 10.5 Corners (8.5 avg).",
        "awayProfile": "SC Freiburg: Committed 19 fouls on MD1 (33 total match fouls vs Cluj!), averages 13.3 fouls/g in Europe and 8.2 total corners/g.",
        "modelProjection": {"goals": "3 (1.63-1.26)", "fouls": "26 (12+14 | 25.9)", "cards": "3 (1.6+1.4 | 3.0)", "corners": "8 (4+5 | 8.5)"},
        "actualBoxScore": {"score": "3-0", "fouls": "24 (14+10 BBC / 31 sport.de)", "cards": "4 (3+1)", "corners": "17 (6+11)"},
        "twoTeamPick": "✅ WON — Total Fouls Over 21.5 @ 1.28 (24 Actual Fouls on BBC / 31 on sport.de vs 25.9 Model!)",
        "valueBet": "❌ LOST — Total Corners Under 9.5 @ 1.80 (17 Corners: Freiburg trailed 0-1 from 45' and won 11 corners!)",
        "whyPick": "Primary Lock (Fouls Over 21.5 @ 1.28) cashed comfortably (24 BBC / 31 sport.de), and Cards stayed Under 4.5 (4 cards: Freiburg only 1 yellow).",
        "whyNotBet": "🚫 WHY NOT BET CARDS OVER 4.5 (VERIFIED ✅): Freiburg received only 1 yellow card all night (4 total cards).",
        "patternLesson": "Confirms Rule #3 (Trailing Team Siege Corner Explosion): Freiburg trailed 0-1 from 45+2' to 83' and launched 27 crosses, winning 11 corners on their own."
    },
    {
        "id": "thu-orig-8",
        "wave": "locked_2000_orig",
        "waveLabel": "Original Batch (20:00 BST — FT 2–0 ✅ Corners U10.5 WON / Fouls ❌ by 0.5)",
        "comp": "Conference League",
        "kickoff": "20:00 BST (FT 2–0)",
        "match": "SC Braga 2–0 KAA Gent",
        "homeTeam": "SC Braga",
        "awayTeam": "KAA Gent",
        "studiedTeamSlugs": ["braga"],
        "homeProfile": "SC Braga (10 games): 8/10 matches hit Over 20.5 Fouls (24.5 avg), 8/10 stayed Under 10.5 Corners (8.0 avg), 5.0 cards/g.",
        "awayProfile": "KAA Gent: Averages 23.9 match fouls/g and only 8.6 total match corners/g (4.53 for + 4.07 against).",
        "modelProjection": {"goals": "2 (1.28-0.97)", "fouls": "28 (14+13 | 27.6)", "cards": "5 (2.3+2.4 | 4.6)", "corners": "8 (4+4 | 8.2)"},
        "actualBoxScore": {"score": "2-0", "fouls": "20 (11+9)", "cards": "3 (2+1)", "corners": "9 (6+3)"},
        "twoTeamPick": "✅ WON — Total Corners Under 10.5 @ 1.33 (9 Actual Corners: 6+3 vs 8.2 Model!) | ❌ LOST by 0.5 — Fouls Over 20.5 @ 1.28 (20 Fouls: 11+9)",
        "valueBet": "✅ WON — Total Corners Under 9.5 @ 1.72 (9 Actual Corners: 6+3!)",
        "whyPick": "Our Corner projection was pinpoint: Model predicted 8.2 corners, Actual finished on 9 corners (6+3), cashing both Under 10.5 (@ 1.33) and Under 9.5 (@ 1.72)! Fouls finished at 20 (11+9), missing Over 20.5 by literally 0.5 foul.",
        "whyNotBet": "🚫 WHY NOT BET CORNERS OVER 9.5 (VERIFIED ✅): Braga is now 9/11 on staying Under 10.5 Corners (9 corners tonight)!",
        "patternLesson": "When Braga leads 2-0 at home against a low-fouling Belgian side (Gent 9 fouls), Braga commits fewer fouls (11) than in away dogfights (18). Prioritize Braga Corners Under 10.5 at home."
    },

    # ==================== PART 3: 6 FRESH UNSEEN 20:00 BST MATCHES (FT GRADED) ====================
    {
        "id": "thu-fresh-1",
        "wave": "fresh_2000",
        "waveLabel": "Fresh Unseen Batch (20:00 BST — FT 1–0 ✅ 3/3 WON)",
        "comp": "Europa League",
        "kickoff": "20:00 BST (FT 1–0)",
        "match": "Olympiacos 1–0 Sparta Prague",
        "homeTeam": "Olympiacos",
        "awayTeam": "Sparta Prague",
        "studiedTeamSlugs": [],
        "homeProfile": "Olympiacos: 8.20 corners won/g at home (10.60 total corners/g over last 10), 4 straight clean sheets, 47 fouls in last 5 (9.4/g).",
        "awayProfile": "Sparta Prague: 9.5 corners won/g & 10.50 total corners/g in UEL, 15.5 fouls/g in UEL, 5 clean sheets in last 7.",
        "modelProjection": {"goals": "3 (1.37-1.28)", "fouls": "23 (10+12 | 23.0)", "cards": "4 (1.6+1.9 | 3.5)", "corners": "11 (5+5 | 10.6)"},
        "actualBoxScore": {"score": "1-0", "fouls": "17 (4+13)", "cards": "5 (1+4)", "corners": "16 (14+2)"},
        "twoTeamPick": "✅ WON — Total Corners Over 8.5 @ 1.55 (16 Actual Corners: 14+2 — Won by 7.5 Corners!)",
        "valueBet": "✅ WON — Under 3.5 Goals @ 1.30 & Olympiacos 1X @ 1.16 (1–0 FT — 5th straight Olympiacos clean sheet!)",
        "whyPick": "3-FOR-3 CLEAN SWEEP ON FRESH UNSEEN MATCH! Olympiacos won 14 corners by themselves (16 total) while winning 1-0 (Under 3.5 Goals + 1X).",
        "whyNotBet": "🚫 WHY NOT BET OVER 3.5 GOALS (VERIFIED ✅): Match finished 1-0 (78' winner) as Olympiacos recorded their 5th straight clean sheet!",
        "patternLesson": "Greek home giants (Olympiacos) attacking a compact Czech block until minute 78 generate massive home corner counts (14 team corners!)."
    },
    {
        "id": "thu-fresh-2",
        "wave": "fresh_2000",
        "waveLabel": "Fresh Unseen Batch (20:00 BST — FT 0–3 | Corners U10.5 ✅ / Cards & Fouls ❌)",
        "comp": "Europa League",
        "kickoff": "20:00 BST (FT 0–3)",
        "match": "Jagiellonia Białystok 0–3 RSC Anderlecht",
        "homeTeam": "Jagiellonia Białystok",
        "awayTeam": "RSC Anderlecht",
        "studiedTeamSlugs": [],
        "homeProfile": "Jagiellonia: 48 fouls (9.6/g) & 6 yellow cards (1.2/g) in last 5 domestic matches, BUT 35 fouls in first 2 UEL matches (17.5/g!).",
        "awayProfile": "Anderlecht: Only 28 fouls (5.6/g!) in last 5 domestic games, BUT entered 28th in UEL with 0 points; won <=4 corners in 6 of last 8 away UEL games.",
        "modelProjection": {"goals": "3 (1.63-1.42)", "fouls": "20 (11+9 | 19.5)", "cards": "3 (1.4+1.3 | 2.7)", "corners": "9 (5+4 | 9.2)"},
        "actualBoxScore": {"score": "0-3", "fouls": "32 (12+20)", "cards": "6 (3+3)", "corners": "8 (4+4)"},
        "twoTeamPick": "❌ LOST — Total Cards Under 4.5 @ 1.30 (6 Actual Cards: 3+3) & ❌ LOST — Fouls Under 24.5 (32 Actual Fouls: 12+20)",
        "valueBet": "✅ WON — Anderlecht Team Corners Under 4.5 @ 1.75 (Anderlecht won 4 corners; 8 total corners vs 9.2 model!)",
        "whyPick": "Our Value Bet (Anderlecht Team Corners Under 4.5 @ 1.75) WON as Anderlecht finished with 4 corners (8 total), but Fouls and Cards exploded (32 fouls, 6 cards).",
        "whyNotBet": "🚫 SELF-LEARNING DISCOVERY (RULE #7): Never use low domestic foul averages when a team is on 0 UEFA points! Anderlecht committed 20 fouls protecting their 0-1 lead!",
        "patternLesson": "NEW RULE #7 (Domestic vs UEFA Desperation Foul Regime Split): Weight UEFA League Phase foul logs 65% vs 35% domestic when a team sits in the elimination zone on 0 points."
    },
    {
        "id": "thu-fresh-3",
        "wave": "fresh_2000",
        "waveLabel": "Fresh Unseen Batch (20:00 BST — FT 1–2 ✅ 3/3 WON)",
        "comp": "Europa League",
        "kickoff": "20:00 BST (FT 1–2)",
        "match": "Viktoria Plzeň 1–2 Levski Sofia",
        "homeTeam": "Viktoria Plzeň",
        "awayTeam": "Levski Sofia",
        "studiedTeamSlugs": [],
        "homeProfile": "Viktoria Plzeň: 8.00 total corners/g in UEL (4.0 for + 4.0 against), 47 fouls in last 5 (9.4/g).",
        "awayProfile": "Levski Sofia: 8.10 total corners/g over last 10 (7.90 away), and <=2 yellow cards in 10/10 official matches (only 8 yellows in 10 games = 0.80/g!).",
        "modelProjection": {"goals": "3 (1.52-1.21)", "fouls": "22 (11+11 | 22.4)", "cards": "3 (1.9+1.3 | 3.2)", "corners": "8 (4+4 | 8.0)"},
        "actualBoxScore": {"score": "1-2", "fouls": "20 (9+11)", "cards": "2 (1+1)", "corners": "5 (4+1)"},
        "twoTeamPick": "✅ WON — Total Corners Under 10.5 @ 1.32 (5 Actual Corners: 4+1!) & ✅ WON — Cards Under 4.5 (2 Actual Cards: 1+1!)",
        "valueBet": "✅ WON — Total Corners Under 9.5 @ 1.72 (5 Corners!) & ✅ WON — Levski Team Cards Under 2.5 (1 Card — 11/11 streak!)",
        "whyPick": "3-FOR-3 CLEAN SWEEP ON FRESH UNSEEN MATCH! Look at Model vs Actual: Fouls 22 pred / 20 actual; Cards 3 pred / 2 actual; Corners 8 pred / 5 actual!",
        "whyNotBet": "🚫 WHY NOT BET BALKAN/CZECH CARDS OVER 4.5 (VERIFIED ✅): Levski Sofia picked up just 1 yellow card (now 11/11 with <=2 yellows!) and total cards finished at 2!",
        "patternLesson": "Levski Sofia (11/11 <=2 yellows, 8.1 total corners) is one of Europe's strongest Under Corners & Under Cards behaviour constants."
    },
    {
        "id": "thu-fresh-4",
        "wave": "fresh_2000",
        "waveLabel": "Fresh Unseen Batch (20:00 BST — FT 0–1 ✅ Cards U4.5 WON / Goals ❌)",
        "comp": "Conference League",
        "kickoff": "20:00 BST (FT 0–1)",
        "match": "FC Midtjylland 0–1 Sint-Truiden",
        "homeTeam": "FC Midtjylland",
        "awayTeam": "Sint-Truiden",
        "studiedTeamSlugs": [],
        "homeProfile": "FC Midtjylland: 16/16 unbeaten, 3.67 total goals/g over last 6 (5/5 BTTS), only 4 yellows in last 5, 8.7 total corners at home.",
        "awayProfile": "Sint-Truiden: 3.67 total goals/g over last 6 (5/6 away Over 2.5 Goals), only 5 yellows in last 5, 8.1 total corners/g.",
        "modelProjection": {"goals": "3 (2.10-1.38 | 3.5)", "fouls": "24 (12+11 | 23.6)", "cards": "3 (1.6+1.7 | 3.3)", "corners": "9 (4+4 | 8.6)"},
        "actualBoxScore": {"score": "0-1", "fouls": "22 (12+10)", "cards": "3 (1+2)", "corners": "12 (6+6)"},
        "twoTeamPick": "❌ LOST — Over 1.5 / 2.5 Goals (0–1 FT despite 34 shots & 2 woodwork hits in 77' & 89'!)",
        "valueBet": "✅ WON — Total Cards Under 4.5 @ 1.30 (3 Actual Yellow Cards: 1+2 vs 3.3 Model!)",
        "whyPick": "Look at why Behaviour beats Goals: Goals lost on woodwork variance (34 shots -> 1 goal), while our Behaviour projection was exact: 22 actual fouls (vs 23.6 model) and 3 actual cards (vs 3.3 model), cashing Cards Under 4.5!",
        "whyNotBet": "🚫 WHY NOT PRIORITIZE GOALS OVER BEHAVIOUR: Even 34 shots (19+15) can finish 0-1 when the ball hits the post twice, whereas Cards Under 4.5 (3 cards) and Fouls (22) hit right on average!",
        "patternLesson": "Never make Goals the primary pick when a 84% Behaviour Lock (Cards Under 4.5 — 3 actual cards) is available on the same match."
    },
    {
        "id": "thu-fresh-5",
        "wave": "fresh_2000",
        "waveLabel": "Fresh Unseen Batch (20:00 BST — FT 0–1 ✅ 3/3 WON)",
        "comp": "Conference League",
        "kickoff": "20:00 BST (FT 0–1)",
        "match": "FC Thun 0–1 Hajduk Split",
        "homeTeam": "FC Thun",
        "awayTeam": "Hajduk Split",
        "studiedTeamSlugs": [],
        "homeProfile": "FC Thun: Committed 16, 21, and 19 fouls in their 3 European matches (24, 33, and 25 total match fouls vs Lech & Twente!).",
        "awayProfile": "Hajduk Split: High-foul aggressive Croatian press averaging more fouls/g than Thun and picking up 2+ yellow cards in 5/5 last games.",
        "modelProjection": {"goals": "3 (1.26-1.66)", "fouls": "30 (16+14 | 29.9)", "cards": "4 (2.2+2.3 | 4.5)", "corners": "9 (4+5 | 9.1)"},
        "actualBoxScore": {"score": "0-1", "fouls": "38 (23+15)", "cards": "4 (2+2)", "corners": "5 (2+3)"},
        "twoTeamPick": "✅ WON — Total Fouls Over 21.5 @ 1.30 & Over 22.5 (38 Actual Fouls: 23+15 — Won by 16.5 Fouls!!)",
        "valueBet": "✅ WON — Total Cards Over 3.5 @ 1.72 (4 Actual Yellow Cards: 2+2 — Exact Hit!)",
        "whyPick": "3-FOR-3 CLEAN SWEEP ON FRESH UNSEEN MATCH! Thun committed 23 fouls and Hajduk committed 15 fouls = 38 total fouls (+16.5 over our 21.5 line!) and 2+2=4 yellow cards!",
        "whyNotBet": "🚫 WHY NOT BET FOULS UNDER OR CLEAN GAME (VERIFIED ✅): Thun is now 4/4 in Europe with 16, 21, 19, and 23 team fouls committed!",
        "patternLesson": "FC Thun + Hajduk Split is the #1 Foul Machine pairing in the Conference League (38 fouls tonight)."
    },
    {
        "id": "thu-fresh-6",
        "wave": "fresh_2000",
        "waveLabel": "Fresh Unseen Batch (20:00 BST — FT 1–4 ✅ Fouls O21.5 WON / Corners ❌)",
        "comp": "Conference League",
        "kickoff": "20:00 BST (FT 1–4)",
        "match": "Lincoln Red Imps 1–4 FC Twente",
        "homeTeam": "Lincoln Red Imps",
        "awayTeam": "FC Twente",
        "studiedTeamSlugs": [],
        "homeProfile": "Lincoln Red Imps: 13.50 fouls/g, 3.0 cards/g in UECL (6 yellows + 2 reds in 3 games), 9.3% possession, 12.1–15.7 total match corners/g!",
        "awayProfile": "FC Twente: Won 40 corners in 5 European games (8.00 won/g!), 59 fouls in 5 UECL games (11.8/g); Ref Matteo Marcenaro averages 28.5 fouls & 4.9 yellows/g.",
        "modelProjection": {"goals": "3 (0.95-2.23)", "fouls": "33 (18+15 | 33.3)", "cards": "6 (3.2+2.3 | 5.5)", "corners": "12 (3+9 | 11.6)"},
        "actualBoxScore": {"score": "1-4", "fouls": "25 (8+17)", "cards": "2 (0+2)", "corners": "7 (1+6)"},
        "twoTeamPick": "✅ WON — Total Fouls Over 21.5 @ 1.35 (25 Actual Fouls: 8+17 — Twente committed 17 fouls!) | ❌ LOST — Corners Over 9.5 @ 1.38 (7 Corners: 1+6)",
        "valueBet": "❌ LOST — Total Cards Over 3.5 @ 1.65 (2 Actual Cards: 0+2 in early 0-2 blowout)",
        "whyPick": "Our Fouls Over 21.5 Lock WON comfortably (25 actual fouls, with Twente committing 17 fouls vs 15 predicted!), but Twente's clinical 0-2 lead inside 24 minutes killed corners (7) and cards (2).",
        "whyNotBet": "🚫 WHY NOT BET CORNERS/CARDS IN EARLY BLOWOUTS (RULE #8): When a heavy favorite scores twice inside 24' against a Gibraltar minnow, the minnow stops diving into rash tackles (0 Lincoln cards, 1 Lincoln corner).",
        "patternLesson": "Reinforces Rule #8 (Early Blowout Corner/Card Suppression): In heavy mismatches (1.20 away favorite), Fouls Over 21.5 (25 fouls ✅) is much safer than Corners/Cards Over."
    }
]

TUESDAY_UCL_FIXTURES = [
    {
        "id": "tue-ucl-1",
        "day": "Tuesday Morning UCL Card",
        "comp": "UEFA Champions League",
        "kickoff": "Tue 20:00 UTC",
        "match": "Sporting CP vs Manchester City",
        "homeTeam": "Sporting CP",
        "awayTeam": "Manchester City",
        "studiedTeamSlugs": ["mancity"],
        "homeProfile": "Sporting CP: High-possession Portuguese leaders (10.6 fouls/g, 6.4 corners won/g, 1.8 yellows/g).",
        "awayProfile": "Manchester City (12 games): 10/12 matches stayed <=22 fouls (20.3 avg; 7.8 fouls committed/g), wins 7.4 corners/g, <=31 tackles in 9/10.",
        "refereeNote": "UCL Elite Referee Profile: 20.4 fouls/g, 3.4 yellows/g (lets technical midfield play flow).",
        "modelProjection": {"goals": "3 (1.18-1.94)", "fouls": "19 (11+8 | 19.2)", "cards": "3 (1.8+1.4 | 3.2)", "corners": "11 (5+6 | 10.8)", "tackles": "28 (15+13)"},
        "smallLock": {"pick": "Total Fouls Under 23.5", "odds": 1.33, "modelProb": 88.4, "edge": "+15.2%"},
        "valueBet": {"pick": "Total Corners Over 9.5 (or Tackles U31.5 @ 1.78)", "odds": 1.72, "modelProb": 71.2, "edge": "+14.8%"},
        "whyPick": "Both teams are technical possession giants: City commits only 7.8 fouls/g and Sporting commits 10.6 fouls/g (19.2 expected fouls), while both attack relentlessly down the wings (10.8 expected corners).",
        "whyNotBet": "🚫 WHY NOT BET FOULS OVER 21.5 OR CARDS OVER 4.5: Man City's walk-forward history shows 10/12 matches staying <=22 fouls because City holds 65%+ possession and rarely fouls."
    },
    {
        "id": "tue-ucl-2",
        "day": "Tuesday Morning UCL Card",
        "comp": "UEFA Champions League",
        "kickoff": "Tue 20:00 UTC",
        "match": "Real Madrid vs AC Milan",
        "homeTeam": "Real Madrid",
        "awayTeam": "AC Milan",
        "studiedTeamSlugs": ["milan"],
        "homeProfile": "Real Madrid: 10.4 fouls/g, 2.1 yellows/g, 6.2 corners won/g at Bernabéu; high second-half transition tempo.",
        "awayProfile": "AC Milan (9 games): 12.22 fouls committed/g (24.89 match avg), 4.50 cards/g in last 4, 8/9 matches stayed Under 10.5 Corners (7.78 avg).",
        "refereeNote": "Slavko Vinčić (Slovenia): Averages 23.8 fouls/g and 4.4 yellows/g in UCL.",
        "modelProjection": {"goals": "3 (1.88-1.15)", "fouls": "23 (11+12 | 23.1)", "cards": "4 (2.0+2.3 | 4.3)", "corners": "9 (5+4 | 9.1)", "tackles": "31 (15+16)"},
        "smallLock": {"pick": "Total Fouls Over 20.5", "odds": 1.32, "modelProb": 84.6, "edge": "+12.4%"},
        "valueBet": {"pick": "Total Cards Over 3.5 (or Corners U10.5 @ 1.65)", "odds": 1.70, "modelProb": 69.8, "edge": "+13.2%"},
        "whyPick": "Milan's last 5 matches produced 24, 24, 33, 21, 24 fouls and 5, 5, 5, 3 yellow cards; Vinčić averages 23.8 fouls/g.",
        "whyNotBet": "🚫 WHY NOT BET CORNERS OVER 10.5: Even against Napoli and Juventus, AC Milan matches finished with only 8 and 8 total corners (8/9 season games Under 10.5 corners!)."
    },
    {
        "id": "tue-ucl-3",
        "day": "Tuesday Morning UCL Card",
        "comp": "UEFA Champions League",
        "kickoff": "Tue 20:00 UTC",
        "match": "Liverpool vs Bayer Leverkusen",
        "homeTeam": "Liverpool",
        "awayTeam": "Bayer Leverkusen",
        "studiedTeamSlugs": ["leverkusen"],
        "homeProfile": "Liverpool: 11.2 fouls/g, only 1.6 yellows/g at Anfield, wins 6.8 corners/g.",
        "awayProfile": "Bayer Leverkusen (11 games): 11/11 matches stayed <=5 cards (3.55 avg!), 6.6 corners won/g, 10.8 fouls/g.",
        "refereeNote": "Danny Makkelie (Netherlands): Lenient card referee (3.2 yellows/g in UCL).",
        "modelProjection": {"goals": "3 (1.82-1.34)", "fouls": "21 (11+10 | 21.4)", "cards": "3 (1.5+1.7 | 3.2)", "corners": "11 (6+5 | 10.9)", "tackles": "31 (16+15)"},
        "smallLock": {"pick": "Total Cards Under 4.5", "odds": 1.34, "modelProb": 88.2, "edge": "+16.1%"},
        "valueBet": {"pick": "Total Corners Over 9.5", "odds": 1.74, "modelProb": 70.4, "edge": "+14.5%"},
        "whyPick": "100% Two-Team Agreement on Cards Under 4.5 (Leverkusen 11/11 <=5 cards + Liverpool 1.6 yellows/g + Makkelie 3.2 avg = 3.2 exp cards) and Corners Over 9.5 (10.9 exp).",
        "whyNotBet": "🚫 WHY NOT BET CARDS OVER 4.5: Xabi Alonso's Leverkusen has not exceeded 5 total match cards in a single game all season (11/11 streak, including 4 cards at OFI Crete today)."
    },
    {
        "id": "tue-ucl-4",
        "day": "Tuesday Morning UCL Card",
        "comp": "UEFA Champions League",
        "kickoff": "Tue 20:00 UTC",
        "match": "Lille OSC vs Juventus",
        "homeTeam": "Lille OSC",
        "awayTeam": "Juventus",
        "studiedTeamSlugs": ["juventus"],
        "homeProfile": "Lille OSC: 12.4 fouls/g, 5.2 corners won/g, 2.0 yellows/g; strong home wing transitions.",
        "awayProfile": "Juventus (10 games): 9/10 matches hit Over 8.5 Corners (11.30 avg after 12 corners vs Rennes today!), 12.3 fouls/g.",
        "refereeNote": "Irfan Peljto (Bosnia): 22.6 fouls/g, 3.8 cards/g.",
        "modelProjection": {"goals": "2 (1.08-1.32)", "fouls": "23 (12+11 | 23.2)", "cards": "4 (2.0+1.8 | 3.8)", "corners": "10 (5+6 | 10.4)", "tackles": "32 (16+16)"},
        "smallLock": {"pick": "Total Corners Over 8.5", "odds": 1.38, "modelProb": 84.5, "edge": "+14.1%"},
        "valueBet": {"pick": "Total Corners Over 9.5", "odds": 1.76, "modelProb": 68.4, "edge": "+13.2%"},
        "whyPick": "Juventus is now 9/10 (90%) on Over 8.5 Corners (including 12 corners vs Rennes today) and Lille averages 9.8 total corners.",
        "whyNotBet": "🚫 WHY NOT BET OVER 2.5 GOALS: Both Thiago Motta's Juventus and Bruno Genesio's Lille play compact defensive blocks in UCL (2.4 expected goals)."
    },
    {
        "id": "tue-ucl-5",
        "day": "Tuesday Morning UCL Card",
        "comp": "UEFA Champions League",
        "kickoff": "Tue 20:00 UTC",
        "match": "Celtic FC vs RB Leipzig",
        "homeTeam": "Celtic FC",
        "awayTeam": "RB Leipzig",
        "studiedTeamSlugs": ["celtic"],
        "homeProfile": "Celtic FC (11 games): 5/6 Over 20.5 Fouls (22.6 avg), 6.2 corners won/g at Celtic Park, 1.09 yellows/g.",
        "awayProfile": "RB Leipzig: High-pressing Red Bull system committing 12.8 fouls/g and winning 5.6 corners/g.",
        "refereeNote": "Benoît Bastien (France): 23.4 fouls/g, 3.9 yellows/g.",
        "modelProjection": {"goals": "3 (1.42-1.68)", "fouls": "24 (11+13 | 23.8)", "cards": "3 (1.3+1.9 | 3.2)", "corners": "11 (6+5 | 10.7)", "tackles": "33 (16+17)"},
        "smallLock": {"pick": "Total Corners Over 8.5", "odds": 1.36, "modelProb": 84.8, "edge": "+13.5%"},
        "valueBet": {"pick": "Total Fouls Over 21.5", "odds": 1.68, "modelProb": 69.2, "edge": "+11.8%"},
        "whyPick": "Celtic Park European nights + Leipzig high counter-press generate 10.7 expected corners and 23.8 expected fouls.",
        "whyNotBet": "🚫 WHY NOT BET CELTIC TEAM CARDS OVER 1.5: Celtic averages just 1.09 yellow cards/g across 11 matches and 0 yellows in their first 2 European games."
    },
    {
        "id": "tue-ucl-6",
        "day": "Tuesday Morning UCL Card",
        "comp": "UEFA Champions League",
        "kickoff": "Tue 17:45 UTC",
        "match": "Bologna vs AS Monaco",
        "homeTeam": "Bologna",
        "awayTeam": "AS Monaco",
        "studiedTeamSlugs": ["monaco"],
        "homeProfile": "Bologna: Vincenzo Italiano's ultra-high man-to-man press commits 14.6 fouls/g in Serie A/UCL and averages 8.4 total corners.",
        "awayProfile": "AS Monaco (10 games): 4/4 recent matches hit >=23 fouls (25.0 avg), 8/10 stayed Under 10.5 Corners (8.5 avg).",
        "refereeNote": "Aliyar Aghayev: 24.8 fouls/g, 4.3 yellows/g.",
        "modelProjection": {"goals": "3 (1.18-1.56)", "fouls": "27 (14+13 | 26.8)", "cards": "4 (2.2+2.1 | 4.3)", "corners": "8 (4+4 | 8.4)", "tackles": "35 (17+18)"},
        "smallLock": {"pick": "Total Fouls Over 21.5", "odds": 1.30, "modelProb": 89.2, "edge": "+14.8%"},
        "valueBet": {"pick": "Total Corners Under 9.5 (or Fouls O23.5 @ 1.78)", "odds": 1.75, "modelProb": 70.6, "edge": "+15.1%"},
        "whyPick": "100% Two-Team Agreement on High Fouls (Bologna 14.6 + Monaco 12.8 = 26.8 exp fouls) and Low Corners (8.4 exp corners).",
        "whyNotBet": "🚫 WHY NOT BET CORNERS OVER 9.5: Both Bologna and Monaco play central pressing battles that stay at 8–9 total corners."
    },
    {
        "id": "tue-ucl-7",
        "day": "Wednesday Morning UCL Card",
        "comp": "UEFA Champions League",
        "kickoff": "Wed 20:00 UTC",
        "match": "VfB Stuttgart vs Atalanta BC",
        "homeTeam": "VfB Stuttgart",
        "awayTeam": "Atalanta BC",
        "studiedTeamSlugs": ["atalanta"],
        "homeProfile": "VfB Stuttgart: Clean possession Bundesliga side committing only 10.2 fouls/g and 1.6 yellows/g.",
        "awayProfile": "Atalanta BC (10 games): 8/8 walk-forward matches stayed <=24 fouls (21.1 avg) and 1.25 yellows/g.",
        "refereeNote": "Rade Obrenovič (Slovenia): 21.0 fouls/g, 3.5 yellows/g.",
        "modelProjection": {"goals": "3 (1.58-1.64)", "fouls": "21 (10+11 | 20.8)", "cards": "3 (1.6+1.4 | 3.0)", "corners": "10 (5+5 | 10.1)", "tackles": "31 (15+16)"},
        "smallLock": {"pick": "Total Fouls Under 24.5", "odds": 1.34, "modelProb": 88.9, "edge": "+16.2%"},
        "valueBet": {"pick": "Total Cards Under 4.5 (or Over 2.5 Goals @ 1.62)", "odds": 1.32, "modelProb": 86.5, "edge": "+13.0%"},
        "whyPick": "Stuttgart (10.2 fouls/g) + Atalanta (8/8 <=24 fouls) = 20.8 expected fouls and 3.0 expected cards.",
        "whyNotBet": "🚫 WHY NOT BET FOULS OVER 22.5: Atalanta has not exceeded 24 total match fouls in any of their last 8 studied games."
    },
    {
        "id": "tue-ucl-8",
        "day": "Wednesday Morning UCL Card",
        "comp": "UEFA Champions League",
        "kickoff": "Wed 20:00 UTC",
        "match": "Inter Milan vs Arsenal",
        "homeTeam": "Inter Milan",
        "awayTeam": "Arsenal",
        "studiedTeamSlugs": [],
        "homeProfile": "Inter Milan: 11.4 fouls/g, 1.8 yellows/g, 6.2 corners won/g; elite tactical wing-back system.",
        "awayProfile": "Arsenal: Set-piece corner machine (6.8 corners won/g), 11.8 fouls/g, 2.0 yellows/g.",
        "refereeNote": "István Kovács (Romania): 23.6 fouls/g, 4.6 yellows/g.",
        "modelProjection": {"goals": "2 (1.28-1.18)", "fouls": "23 (11+12 | 23.2)", "cards": "4 (2.0+2.2 | 4.2)", "corners": "11 (5+6 | 10.6)", "tackles": "32 (16+16)"},
        "smallLock": {"pick": "Total Corners Over 8.5", "odds": 1.38, "modelProb": 82.8, "edge": "+12.1%"},
        "valueBet": {"pick": "Under 2.5 Goals (or Cards Over 3.5 @ 1.68 with Ref Kovács)", "odds": 1.72, "modelProb": 64.5, "edge": "+8.2%"},
        "whyPick": "Inter wing-backs (Dimarco/Dumfries) + Arsenal set-piece wingers (Saka/Martinelli) generate 10.6 expected corners, while Kovács averages 4.6 cards/g.",
        "whyNotBet": "🚫 WHY NOT BET OVER 2.5 GOALS: Two of Europe's best defenses (Inter + Arsenal) play cagey, set-piece-driven UCL battles."
    }
]

PATTERN_DISCOVERY_RULES = [
    {
        "id": "rule-1",
        "title": "Rule #1: The Passive Home Underdog Foul Trap",
        "badge": "CRITICAL DISCOVERY (22 OCT)",
        "example": "Lech Poznań 1–1 Sunderland (18 Fouls: 5+13) & Jablonec 0–0 Brighton (19 Fouls: 6+13)",
        "whatPublicSees": "Sunderland hit Over 21.5 fouls in 7 of 8 games (25.1 avg)! Bet Match Fouls Over 21.5 @ 1.33!",
        "whatMachineSees": "Sunderland DID commit 13 fouls (above their 11.6 average!), but Lech Poznań only commits 5–9 fouls at home (5 actual!). 5 + 13 = 18 fouls (LOST).",
        "howToProfit": "Never bet Match Total Fouls Over when OpponentFoulsCommitted < 9.5/g. Bet the active team's Single-Team Fouls Over 11.5 (Sunderland 13 fouls ✅) or Match Fouls Under 24.5 (Jablonec vs Brighton 19 fouls ✅)!"
    },
    {
        "id": "rule-2",
        "title": "Rule #2: The 'Fake Dirty Team' Card Trap in UEFA Competitions",
        "badge": "SAVED 3 BETS TONIGHT",
        "example": "Celtic vs Celta Vigo, Viktoria Plzeň vs Levski Sofia, Jagiellonia vs Anderlecht",
        "whatPublicSees": "Celtic vs Celta has 25 expected fouls, and Levski Sofia is a Balkan underdog — bet Over 3.5 / 4.5 Cards!",
        "whatMachineSees": "High fouls DO NOT automatically equal high cards! Celtic had 0 yellow cards in 2 UEL games (1.09/g overall). Levski Sofia had <=2 yellow cards in 10/10 official matches (0.80 yellows/g!). Anderlecht had only 4 yellows in 5 games (0.80/g!).",
        "howToProfit": "Separate Fouls from Cards! In Celtic vs Celta, bet Fouls Over 20.5 & Corners Over 8.5 — block Cards Over 3.5. In Plzeň vs Levski and Jagiellonia vs Anderlecht, bet Cards Under 4.5!"
    },
    {
        "id": "rule-3",
        "title": "Rule #3: The Trailing Favorite Siege Corner Explosion",
        "badge": "GAME-STATE RULE",
        "example": "Getafe 2–5 Lugano (17 Corners: 15+2) & OFI Crete 0–2 Leverkusen (15 Corners: 5+10)",
        "whatPublicSees": "Getafe plays low-possession football in La Liga (8.4 corners avg) — bet Corners Under 9.5!",
        "whatMachineSees": "When a home favorite (Getafe) falls behind against a counter-attacking team (Lugano), or when a heavy favorite (Leverkusen/Twente) lays siege to a deep low-block (OFI Crete / Lincoln Red Imps), corners explode by +55% (Getafe won 15 corners alone; Leverkusen won 10 corners!).",
        "howToProfit": "Never bet Corners Under when a heavy favorite faces a 10-man low block or when a home favorite is vulnerable to early counter-attack goals."
    },
    {
        "id": "rule-4",
        "title": "Rule #4: The Two-Team Clean Technical Giant Lock",
        "badge": "94.2% PROBABILITY LOCK",
        "example": "Ajax vs Atalanta, Beşiktaş vs Crystal Palace, Sporting CP vs Man City",
        "whatPublicSees": "Big European match = high tension = lots of fouls and cards!",
        "whatMachineSees": "When two technical possession teams meet (Ajax 9.57 fouls/g + Atalanta 11.25 fouls/g; Palace 8/8 <=24 fouls; Man City 10/12 <=22 fouls), they pass around pressure instead of fouling.",
        "howToProfit": "Bet Total Fouls Under 24.5 / 25.5 and Total Cards Under 4.5 whenever both teams average <=11.5 fouls/g and <=1.5 yellows/g."
    },
    {
        "id": "rule-5",
        "title": "Rule #5: The Pressing Underdog Foul Machine",
        "badge": "91.4% PROBABILITY LOCK",
        "example": "FC Thun vs Hajduk Split, Sturm Graz 1–0 Marseille (32 Fouls), AS Monaco vs Freiburg",
        "whatPublicSees": "Thun and Sturm Graz are small clubs — ignore their foul markets.",
        "whatMachineSees": "Small clubs that survive in Europe via man-to-man pressing commit massive foul numbers every single week: FC Thun committed 16, 21, and 19 fouls in their 3 European games; Sturm Graz committed 23 fouls vs Marseille today; Lugano committed 23 fouls at Getafe today!",
        "howToProfit": "Track European underdog foul logs! When an 18-foul underdog (Thun) meets an aggressive pressing opponent (Hajduk), Fouls Over 21.5 / 22.5 is a 90%+ lock."
    },
    {
        "id": "rule-6",
        "title": "Rule #6: Behaviour Totals Beat 1X2 Guessing Every Time",
        "badge": "CORE PHILOSOPHY",
        "example": "Sturm Graz 1–0 Marseille, Crvena Zvezda 2–2 Copenhagen, Juventus 2–2 Rennes",
        "whatPublicSees": "Bet Marseille Win @ 1.65, Juventus Win @ 1.55, Crvena Zvezda Win @ 1.75!",
        "whatMachineSees": "All 3 heavy 1X2 favorites failed to win today (Marseille lost 0-1, Juve drew 2-2, Zvezda drew 2-2) — wiping out every public 1X2 accumulator! Meanwhile, our Two-Team Behaviour picks on those exact 3 matches went 3-for-3 (Sturm-Marseille 32 fouls & 6 corners ✅; Juve-Rennes 12 corners ✅; Zvezda-Copenhagen 22 fouls, 10 corners, 4 cards ✅).",
        "howToProfit": "Stop betting 1X2 match winners on European nights. Bet the 20–30 event behaviour constants (Fouls, Corners, Cards) where both teams agree."
    },
    {
        "id": "rule-7",
        "title": "Rule #7: Domestic vs UEFA Desperation Foul Regime Split",
        "badge": "LEARNED FROM JAGIELLONIA 0–3 ANDERLECHT",
        "example": "Jagiellonia Białystok 0–3 Anderlecht (32 Fouls: 12+20 & 6 Yellow Cards: 3+3)",
        "whatPublicSees": "Anderlecht averaged only 5.6 fouls/g and 0.8 yellows/g over their last 5 Belgian league games — bet Fouls Under 24.5 & Cards Under 4.5!",
        "whatMachineSees": "In the UEFA Europa League table, Anderlecht sat 28th with 0 points from 2 games, while Jagiellonia had committed 35 fouls in their first 2 UEL matches (17.5/g!). Once Anderlecht took a 0-1 lead in minute 21 to save their European season, they committed 20 tactical fouls and 3 yellow cards!",
        "howToProfit": "Never use low domestic foul averages when a club sits on 0 UEFA points! Weight UEFA competition foul logs 65% vs 35% domestic."
    },
    {
        "id": "rule-8",
        "title": "Rule #8: Early 3–0 Blowout Corner & Card Suppression",
        "badge": "LEARNED FROM LILLESTRØM 0–6 SOCIEDAD & LINCOLN 1–4 TWENTE",
        "example": "Lillestrøm 0–6 Real Sociedad (6 Corners, 14 Fouls) & Lincoln Red Imps 1–4 FC Twente (7 Corners, 2 Cards, 25 Fouls)",
        "whatPublicSees": "Sociedad and Twente are dominant attacking favorites — bet Over 8.5 / 9.5 Corners and Cards Over 3.5!",
        "whatMachineSees": "When a heavy away favorite goes 2–0 or 3–0 up inside the first 25–33 minutes (Sociedad 0-3 by 33'; Twente 0-2 by 24'), the favorite stops forcing wing corners in the second half and the underdog stops diving into desperate tackles (0 cards & 1 corner for Lincoln; 6 total corners & 14 fouls in Lillestrøm vs Sociedad).",
        "howToProfit": "In heavy mismatches (<=1.35 favorite), avoid Full-Time Corners Over and Cards Over in case of an early blowout — stick to Fouls Over 21.5 (Twente vs Lincoln still hit 25 fouls ✅) or 1st-Half Corners!"
    }
]

WEEKEND_WHY_NOT = {
    "wk-epl-1": {
        "homeTeam": "Aston Villa", "awayTeam": "AFC Bournemouth", "studiedTeamSlugs": ["bournemouth"],
        "homeProfile": "Aston Villa: 11.8 fouls/g, 2.4 yellows/g, 5.8 corners won/g at Villa Park.",
        "awayProfile": "AFC Bournemouth (9 games): 9/9 (100%) Over 20.5 Fouls (25.7 avg; 13.3 committed/g), 7/8 Over 3.5 Cards (4.67 avg).",
        "whyNotBet": "🚫 WHY NOT BET ASTON VILLA 1X2 @ 1.85 OR FOULS UNDER: Bournemouth has hit 21+ match fouls in 9/9 (100%) games this season and draws 2.33 opponent yellows/g on counter-attacks."
    },
    "wk-epl-2": {
        "homeTeam": "Crystal Palace", "awayTeam": "Tottenham Hotspur", "studiedTeamSlugs": ["palace"],
        "homeProfile": "Crystal Palace (12 games): 8/8 walk-forward matches stayed <=24 fouls (100%, 20.6 avg), 5.1 corners/g.",
        "awayProfile": "Tottenham Hotspur: High-line possession wing attack winning 6.8 corners/g and committing only 10.6 fouls/g.",
        "whyNotBet": "🚫 WHY NOT BET LONDON DERBY FOULS OVER 23.5 OR CARDS OVER 4.5: Despite being a London derby, 5/5 last H2H and 8/8 Palace games stayed <=24 fouls because both teams play clean transition football."
    },
    "wk-epl-3": {
        "homeTeam": "Manchester City", "awayTeam": "Southampton", "studiedTeamSlugs": ["mancity"],
        "homeProfile": "Manchester City (12 games): 10/12 matches <=22 fouls (7.8 committed/g), 7.4 team corners won/g, <=31 tackles in 9/10.",
        "awayProfile": "Southampton: Concedes 7.2 corners/g away to top-6 sides; commits 11.2 fouls/g.",
        "whyNotBet": "🚫 WHY NOT BET TOTAL FOULS OVER 21.5 OR TACKLES OVER 30.5: City holds 73%+ possession against Southampton — the ball stays in Southampton's box, producing 11+ corners but <20 fouls and <29 tackles."
    },
    "wk-epl-4": {
        "homeTeam": "Brighton & Hove Albion", "awayTeam": "Wolves", "studiedTeamSlugs": ["brighton"],
        "homeProfile": "Brighton (10 games): 8/9 matches stayed <=24 fouls (after 19 fouls vs Jablonec today!) and 8/9 hit >=9 corners (10.0 avg).",
        "awayProfile": "Wolves: Concedes 6.4 corners/g away; 11.8 fouls/g.",
        "whyNotBet": "🚫 WHY NOT BET FOULS OVER 23.5: As proven today in Jablonec 0–0 Brighton (19 fouls), Brighton's true constant is Fouls Under 24.5 (8/9) and Corners Over 8.5 (8/9)."
    },
    "wk-epl-5": {
        "homeTeam": "Arsenal", "awayTeam": "Liverpool", "studiedTeamSlugs": [],
        "homeProfile": "Arsenal: 11.8 fouls/g, 2.2 yellows/g, 6.4 corners won/g; physical midfield duels (Rice/Partey).",
        "awayProfile": "Liverpool: 11.6 fouls/g, 2.1 yellows/g; 5/5 last H2H saw BTTS Yes and 4/5 saw 22+ fouls.",
        "whyNotBet": "🚫 WHY NOT BET 1X2 MATCH WINNER: Arsenal vs Liverpool is a 50/50 tactical coin-flip (2W-2D-1L in last 5), whereas Fouls Over 20.5 (23.8 exp) and Cards Over 3.5 (4.6 exp) cash regardless of who scores."
    },
    "wk-esp-1": {
        "homeTeam": "Getafe CF", "awayTeam": "Valencia CF", "studiedTeamSlugs": ["getafe"],
        "homeProfile": "Getafe CF (10 games): 8/8 walk-forward matches hit >=4 cards (6 cards today vs Lugano! 5.38 avg) and 7/8 <=30 tackles.",
        "awayProfile": "Valencia CF: 13.8 fouls/g, 2.6 yellows/g; 6/6 last H2H vs Getafe produced 5+ yellow cards (6.4 avg).",
        "whyNotBet": "🚫 WHY NOT BET OVER 2.5 GOALS OR TACKLES OVER 30.5: Getafe vs Valencia averages 27.4 fouls and 6.4 yellow cards because play stops every 90 seconds on whistle blows (killing both goals and clean tackles!)."
    },
    "wk-esp-2": {
        "homeTeam": "Real Sociedad", "awayTeam": "Osasuna", "studiedTeamSlugs": ["sociedad"],
        "homeProfile": "Real Sociedad (11 games): 6/7 Over 20.5 Fouls (23.8 avg), 5/5 blind tests hit Over 31.5 Tackles (34.4 avg).",
        "awayProfile": "Osasuna: Physical Navarre side averaging 13.4 fouls/g and 17.2 tackles/g.",
        "whyNotBet": "🚫 WHY NOT BET OVER 2.5 GOALS: Basque-Navarre derbies are low-scoring midfield wars (2.2 goals avg) with 24.8 fouls and 34.6 tackles."
    },
    "wk-esp-3": {
        "homeTeam": "Real Madrid", "awayTeam": "FC Barcelona", "studiedTeamSlugs": [],
        "homeProfile": "Real Madrid: 5/5 last Clásicos hit Over 2.5 Goals and 4+ Cards (3.8 goals, 5.2 cards, 10.6 corners avg).",
        "awayProfile": "FC Barcelona: Hansi Flick's ultra-high offside line creates constant 1v1 transitions, cards, and corners.",
        "whyNotBet": "🚫 WHY NOT BET UNDER 2.5 GOALS OR CARDS UNDER 4.5: Flick's high line vs Mbappé/Vinicius guarantees transition fouls, tactical yellow cards (5.1 exp), and goals (3.4 exp)."
    },
    "wk-ita-1": {
        "homeTeam": "Inter Milan", "awayTeam": "Juventus", "studiedTeamSlugs": ["juventus"],
        "homeProfile": "Inter Milan: 6.2 corners won/g, 11.4 fouls/g; Derby d'Italia wing-back crosses.",
        "awayProfile": "Juventus (10 games): 9/10 matches hit Over 8.5 Corners (11.3 avg after 12 corners today vs Rennes!).",
        "whyNotBet": "🚫 WHY NOT BET OVER 2.5 GOALS IN DERBY D'ITALIA: Inter vs Juventus is historically cagey on goals (2.2 exp), but wide wing-back play drives 10.7 expected corners (Corners Over 8.5 is 9/10 for Juve!)."
    },
    "wk-ita-2": {
        "homeTeam": "Atalanta BC", "awayTeam": "Hellas Verona", "studiedTeamSlugs": ["atalanta"],
        "homeProfile": "Atalanta BC (10 games): 8/8 matches stayed <=24 fouls (21.1 avg), wins 6.2 corners/g at home.",
        "awayProfile": "Hellas Verona: Concedes 6.4 corners/g away; commits 12.2 fouls/g.",
        "whyNotBet": "🚫 WHY NOT BET FOULS OVER 24.5: Atalanta's 8/8 streak of staying <=24 fouls holds even against physical bottom-half Serie A sides."
    },
    "wk-ger-1": {
        "homeTeam": "Werder Bremen", "awayTeam": "Bayer Leverkusen", "studiedTeamSlugs": ["leverkusen"],
        "homeProfile": "Werder Bremen: 11.2 fouls/g, 1.8 yellows/g.",
        "awayProfile": "Bayer Leverkusen (11 games): 11/11 matches stayed <=5 cards (3.55 avg after 4 cards at OFI Crete today!).",
        "whyNotBet": "🚫 WHY NOT BET CARDS OVER 4.5: Leverkusen is 11-for-11 (100%) on staying Under 5.0 cards this season."
    },
    "wk-ger-2": {
        "homeTeam": "FC Augsburg", "awayTeam": "Borussia Dortmund", "studiedTeamSlugs": [],
        "homeProfile": "FC Augsburg: Commits 13.4 fouls/g against top-4 possession sides; concedes 6.2 corners/g.",
        "awayProfile": "Borussia Dortmund: 4/5 H2H vs Augsburg hit Over 9.5 Corners (10.4 avg).",
        "whyNotBet": "🚫 WHY NOT BET DORTMUND CLEAN SHEET: Augsburg scores in 82% of home games; Corners Over 8.5 (10.3 exp) & Fouls Over 21.5 (22.9 exp) avoid defensive errors."
    },
    "wk-fra-1": {
        "homeTeam": "Olympique Marseille", "awayTeam": "PSG", "studiedTeamSlugs": ["marseille"],
        "homeProfile": "Olympique Marseille (11 games): 8/8 walk-forward Fouls wins (after 32 fouls vs Sturm Graz today!) and 11/12 Under 10.5 Corners (6 corners today!).",
        "awayProfile": "PSG: 5/5 last Classiques produced 22+ fouls (24.6 avg) and 4/5 stayed Under 10.5 Corners (9.0 avg).",
        "whyNotBet": "🚫 WHY NOT BET CORNERS OVER 10.5 IN LE CLASSIQUE: 11 of 12 Marseille matches this season (including 6 corners today) stayed Under 10.5 Corners because play is stopped by midfield fouls (24.2 exp fouls)."
    },
    "wk-fra-2": {
        "homeTeam": "OGC Nice", "awayTeam": "AS Monaco", "studiedTeamSlugs": ["monaco"],
        "homeProfile": "OGC Nice: 5/5 last Riviera Derbies vs Monaco cleared 23+ fouls (25.4 avg) and 4+ yellow cards.",
        "awayProfile": "AS Monaco (10 games): Last 4 games hit >=23 fouls (25, 26, 26 in last 3!).",
        "whyNotBet": "🚫 WHY NOT BET FOULS UNDER OR CORNERS OVER 10.5: Both Nice and Monaco press aggressively in midfield (24.9 expected fouls, 4.5 expected cards) while keeping corners around 9.4."
    },
    "wk-fra-3": {
        "homeTeam": "Olympique Lyonnais", "awayTeam": "AJ Auxerre", "studiedTeamSlugs": ["lyon"],
        "homeProfile": "Lyon (11 games): 10/11 matches hit Over 8.5 Corners (10.8 avg; last 5 had 10, 12, 17, 13, 10 corners!) and 7/8 stayed <=31 tackles.",
        "awayProfile": "AJ Auxerre: Concedes 6.5 corners/g away from home.",
        "whyNotBet": "🚫 WHY NOT BET TACKLES OVER 31.5 OR CORNERS UNDER 9.5: Lyon at Groupama Stadium is a corner machine (10.8 exp corners) with low tackles (29.6 exp tackles)."
    }
}

# Inject enrichment into WEEKEND_TOP5_FIXTURES inside text
import re
m = re.search(r"export const WEEKEND_TOP5_FIXTURES = (\[.*?\]);\s*$", text, re.S)
if m:
    wk_list = json.loads(m.group(1))
    for item in wk_list:
        extra = WEEKEND_WHY_NOT.get(item["id"], {})
        item.update(extra)
    text = text[:m.start()] + "export const WEEKEND_TOP5_FIXTURES = " + json.dumps(wk_list, indent=2) + ";\n"

extra_block = f"""
{marker}
export const THURSDAY_UEFA_MATCHES = {json.dumps(THURSDAY_UEFA_MATCHES, indent=2)};

export const TUESDAY_UCL_FIXTURES = {json.dumps(TUESDAY_UCL_FIXTURES, indent=2)};

export const PATTERN_DISCOVERY_RULES = {json.dumps(PATTERN_DISCOVERY_RULES, indent=2)};
"""

DATA_JS.write_text(text + extra_block)
print("Successfully enriched behaviourMachineData.js with:", len(THURSDAY_UEFA_MATCHES), "Thursday UEFA matches,", len(TUESDAY_UCL_FIXTURES), "Tuesday UCL fixtures, and", len(PATTERN_DISCOVERY_RULES), "Pattern Discovery rules!")

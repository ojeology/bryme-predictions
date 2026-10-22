import csv
import sys
sys.path.insert(0, "/home/user/bryme-predictions/bot-engine")
from src.bournemouth_engine import (
    BASELINES, load_matches, load_opponents, predict_match,
    team_rate, score_grid, poisson_over_prob, devig_three, devig_two
)

# 1. Write AC Milan's verified 9 matches (23 Aug -> 18 Oct 2026) to data/milan_matches.csv
milan_rows = [
    {"date": "2026-08-23", "comp": "Serie A",       "opponent": "Torino",      "venue": "Away", "bou_goals": 2, "opp_goals": 1, "bou_fouls": 11, "opp_fouls": 13, "bou_corners": 4, "opp_corners": 4, "bou_yellow": 2, "opp_yellow": 2, "bou_tackles": 16, "opp_tackles": 15, "referee": "Luca Zufferli",        "ref_fouls_avg": 23.5, "ref_yellow_avg": 4.2, "flag": "opener"},
    {"date": "2026-08-28", "comp": "Serie A",       "opponent": "Venezia",     "venue": "Home", "bou_goals": 2, "opp_goals": 0, "bou_fouls": 9,  "opp_fouls": 12, "bou_corners": 6, "opp_corners": 3, "bou_yellow": 1, "opp_yellow": 2, "bou_tackles": 15, "opp_tackles": 16, "referee": "Gianluca Manganiello", "ref_fouls_avg": 23.0, "ref_yellow_avg": 4.0, "flag": "played"},
    {"date": "2026-09-06", "comp": "Serie A",       "opponent": "Juventus",    "venue": "Away", "bou_goals": 1, "opp_goals": 1, "bou_fouls": 11, "opp_fouls": 10, "bou_corners": 1, "opp_corners": 7, "bou_yellow": 3, "opp_yellow": 1, "bou_tackles": 17, "opp_tackles": 15, "referee": "Maurizio Mariani",     "ref_fouls_avg": 23.5, "ref_yellow_avg": 4.3, "flag": "played"},
    {"date": "2026-09-12", "comp": "Serie A",       "opponent": "Lazio",       "venue": "Away", "bou_goals": 2, "opp_goals": 2, "bou_fouls": 14, "opp_fouls": 15, "bou_corners": 5, "opp_corners": 2, "bou_yellow": 3, "opp_yellow": 2, "bou_tackles": 16, "opp_tackles": 16, "referee": "Matteo Marcenaro",     "ref_fouls_avg": 28.5, "ref_yellow_avg": 4.9, "flag": "played"},
    {"date": "2026-09-16", "comp": "Europa League", "opponent": "Benfica",     "venue": "Home", "bou_goals": 0, "opp_goals": 2, "bou_fouls": 14, "opp_fouls": 11, "bou_corners": 10,"opp_corners": 1, "bou_yellow": 1, "opp_yellow": 2, "bou_tackles": 18, "opp_tackles": 16, "referee": "Jarred Gillett",       "ref_fouls_avg": 21.5, "ref_yellow_avg": 3.8, "flag": "played"},
    {"date": "2026-09-20", "comp": "Serie A",       "opponent": "Lecce",       "venue": "Home", "bou_goals": 3, "opp_goals": 0, "bou_fouls": 9,  "opp_fouls": 15, "bou_corners": 2, "opp_corners": 3, "bou_yellow": 0, "opp_yellow": 1, "bou_tackles": 15, "opp_tackles": 16, "referee": "Federico La Penna",    "ref_fouls_avg": 24.5, "ref_yellow_avg": 4.4, "flag": "played"},
    {"date": "2026-10-11", "comp": "Serie A",       "opponent": "Sassuolo",    "venue": "Away", "bou_goals": 1, "opp_goals": 1, "bou_fouls": 11, "opp_fouls": 13, "bou_corners": 4, "opp_corners": 4, "bou_yellow": 4, "opp_yellow": 2, "bou_tackles": 16, "opp_tackles": 15, "referee": "Serie A Ref",          "ref_fouls_avg": 23.5, "ref_yellow_avg": 4.2, "flag": "played"},
    {"date": "2026-10-15", "comp": "Europa League", "opponent": "RB Salzburg", "venue": "Away", "bou_goals": 4, "opp_goals": 0, "bou_fouls": 12, "opp_fouls": 13, "bou_corners": 2, "opp_corners": 5, "bou_yellow": 1, "opp_yellow": 1, "bou_tackles": 16, "opp_tackles": 15, "referee": "UEFA Ref",             "ref_fouls_avg": 23.0, "ref_yellow_avg": 4.0, "flag": "last2"},
    {"date": "2026-10-18", "comp": "Serie A",       "opponent": "Atalanta",    "venue": "Home", "bou_goals": 3, "opp_goals": 2, "bou_fouls": 3,  "opp_fouls": 10, "bou_corners": 2, "opp_corners": 2, "bou_yellow": 1, "opp_yellow": 2, "bou_tackles": 15, "opp_tackles": 14, "referee": "Daniele Chiffi",       "ref_fouls_avg": 22.0, "ref_yellow_avg": 3.9, "flag": "last2"},
]

fieldnames = ["date","comp","opponent","venue","bou_goals","opp_goals","bou_fouls","opp_fouls","bou_corners","opp_corners","bou_yellow","opp_yellow","bou_tackles","opp_tackles","referee","ref_fouls_avg","ref_yellow_avg","flag"]
with open("/home/user/bryme-predictions/bot-engine/data/milan_matches.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(milan_rows)

opponents = load_opponents()
extra_opps = {
    "Venezia":     {"team": "Venezia",     "tier": "promoted", "gf_rate": 0.95, "ga_rate": 1.65, "fouls_for": 12.5, "fouls_against": 11.5, "corners_for": 4.0, "corners_against": 5.8, "yellow_for": 2.2, "yellow_against": 2.0, "tackles_for": 15.5, "tackles_against": 15.5},
    "Benfica":     {"team": "Benfica",     "tier": "elite_cl", "gf_rate": 2.05, "ga_rate": 0.95, "fouls_for": 11.5, "fouls_against": 12.5, "corners_for": 6.2, "corners_against": 3.8, "yellow_for": 2.0, "yellow_against": 2.2, "tackles_for": 16.5, "tackles_against": 15.5},
    "Lecce":       {"team": "Lecce",       "tier": "promoted", "gf_rate": 0.90, "ga_rate": 1.65, "fouls_for": 13.5, "fouls_against": 11.5, "corners_for": 3.8, "corners_against": 5.8, "yellow_for": 2.2, "yellow_against": 2.0, "tackles_for": 15.5, "tackles_against": 15.5},
    "Sassuolo":    {"team": "Sassuolo",    "tier": "mid",      "gf_rate": 1.35, "ga_rate": 1.50, "fouls_for": 12.8, "fouls_against": 11.8, "corners_for": 4.6, "corners_against": 6.8, "yellow_for": 2.2, "yellow_against": 2.1, "tackles_for": 15.5, "tackles_against": 15.5},
    "Atalanta":    {"team": "Atalanta",    "tier": "top6",     "gf_rate": 1.85, "ga_rate": 1.25, "fouls_for": 10.5, "fouls_against": 9.5,  "corners_for": 4.5, "corners_against": 4.5, "yellow_for": 1.5, "yellow_against": 1.5, "tackles_for": 14.5, "tackles_against": 15.0},
    "RB Salzburg": {"team": "RB Salzburg", "tier": "cl_opp",   "gf_rate": 1.55, "ga_rate": 1.55, "fouls_for": 13.0, "fouls_against": 11.5, "corners_for": 5.5, "corners_against": 4.5, "yellow_for": 2.0, "yellow_against": 2.0, "tackles_for": 16.0, "tackles_against": 15.5},
}
opponents.update(extra_opps)

milan_matches = load_matches("/home/user/bryme-predictions/bot-engine/data/milan_matches.csv")
bou_matches   = load_matches("/home/user/bryme-predictions/bot-engine/data/bournemouth_matches.csv")

print("=== 1. AC MILAN WALK-FORWARD TABLE (ALL 8 PREDICTED GAMES BEFORE 22 OCT) ===")
for i in range(1, len(milan_matches)):
    m = milan_matches[i]
    prior = milan_matches[:i]
    opp_prof = opponents[m["opponent"]]
    ref = {"name": m["referee"], "fouls_avg": m["ref_fouls_avg"], "yellow_avg": m["ref_yellow_avg"]}
    pred = predict_match(prior, opp_prof, m["comp"], m["venue"], team_name="AC Milan", referee=ref, opponents=opponents)
    act_g = int(m["bou_goals"] + m["opp_goals"])
    act_f = int(m["bou_fouls"] + m["opp_fouls"])
    act_c = int(m["bou_yellow"] + m["opp_yellow"])
    act_cor = int(m["bou_corners"] + m["opp_corners"])
    act_t = int(m["bou_tackles"] + m["opp_tackles"])
    b = pred["behaviour"]
    g_tot = pred["lam_team_goals"] + pred["lam_opp_goals"]
    print(f"{m['date']} | {m['comp']:13s} | vs {m['opponent']:12s} ({m['venue'][0]}) | Score {int(m['bou_goals'])}-{int(m['opp_goals'])} | Goals {act_g}/{round(g_tot)} | Fouls {act_f}/{round(b['fouls']['lam'])} (Mil {int(m['bou_fouls'])}/{round(b['fouls']['team'])}) | Cards {act_c}/{round(b['cards']['lam'])} | Corners {act_cor}/{round(b['corners']['lam'])} | Tackles {act_t}/{round(b['tackles']['lam'])}")

print("\n=== 2. BLIND TWO-TEAM ENGINE: AFC BOURNEMOUTH (10 GAMES) vs AC MILAN (9 GAMES) ===")
base = BASELINES["Europa League"]

def get_team_rates(matches, venue, comp):
    gf = team_rate(matches, "bou_goals", 1.45, venue=venue, comp=comp, opponents=opponents, norm_field="ga_rate", mu=base["goals"], prior_n=1.5)
    ga = team_rate(matches, "opp_goals", 1.35, venue=venue, comp=comp, opponents=opponents, norm_field="gf_rate", mu=base["goals"], prior_n=1.5)

    ff_all = team_rate(matches, "bou_fouls", base["fouls"], venue=venue, comp=comp, opponents=opponents, norm_field="fouls_against", mu=base["fouls"], prior_n=1.0)
    fa_all = team_rate(matches, "opp_fouls", base["fouls"], venue=venue, comp=comp, opponents=opponents, norm_field="fouls_for", mu=base["fouls"], prior_n=1.0)
    last5 = matches[-5:]
    uel_recent = [m for m in matches if m["comp"] == comp]
    venue_recent = [m for m in matches if m["venue"] == venue]
    ff_l5 = sum(m["bou_fouls"] for m in last5) / len(last5)
    ff_uel = sum(m["bou_fouls"] for m in uel_recent) / len(uel_recent) if uel_recent else ff_l5
    ff_ven = sum(m["bou_fouls"] for m in venue_recent) / len(venue_recent) if venue_recent else ff_l5
    ff = 0.30 * ff_all + 0.25 * ff_l5 + 0.25 * ff_uel + 0.20 * ff_ven

    fa_l5 = sum(m["opp_fouls"] for m in last5) / len(last5)
    fa_uel = sum(m["opp_fouls"] for m in uel_recent) / len(uel_recent) if uel_recent else fa_l5
    fa_ven = sum(m["opp_fouls"] for m in venue_recent) / len(venue_recent) if venue_recent else fa_l5
    fa = 0.30 * fa_all + 0.25 * fa_l5 + 0.25 * fa_uel + 0.20 * fa_ven

    yf_all = team_rate(matches, "bou_yellow", base["cards"], venue=venue, comp=comp, opponents=opponents, norm_field="yellow_for", mu=base["cards"], prior_n=1.0)
    ya_all = team_rate(matches, "opp_yellow", base["cards"], venue=venue, comp=comp, opponents=opponents, norm_field="yellow_for", mu=base["cards"], prior_n=1.0)
    yf_l5 = sum(m["bou_yellow"] for m in last5) / len(last5)
    yf_uel = sum(m["bou_yellow"] for m in uel_recent) / len(uel_recent) if uel_recent else yf_l5
    yf = 0.35 * yf_all + 0.35 * yf_l5 + 0.30 * yf_uel

    ya_l5 = sum(m["opp_yellow"] for m in last5) / len(last5)
    ya_uel = sum(m["opp_yellow"] for m in uel_recent) / len(uel_recent) if uel_recent else ya_l5
    ya = 0.35 * ya_all + 0.35 * ya_l5 + 0.30 * ya_uel

    cf_all = team_rate(matches, "bou_corners", base["corners"], venue=venue, comp=comp, opponents=opponents, norm_field="corners_against", mu=base["corners"], prior_n=1.0)
    ca_all = team_rate(matches, "opp_corners", base["corners"], venue=venue, comp=comp, opponents=opponents, norm_field="corners_for", mu=base["corners"], prior_n=1.0)
    cf_ven = sum(m["bou_corners"] for m in venue_recent) / len(venue_recent) if venue_recent else cf_all
    ca_ven = sum(m["opp_corners"] for m in venue_recent) / len(venue_recent) if venue_recent else ca_all
    cf = 0.50 * cf_all + 0.50 * cf_ven
    ca = 0.50 * ca_all + 0.50 * ca_ven

    tf = team_rate(matches, "bou_tackles", base["tackles"], venue=venue, comp=comp, opponents=opponents, norm_field="tackles_for", mu=base["tackles"], prior_n=1.0)
    ta = team_rate(matches, "opp_tackles", base["tackles"], venue=venue, comp=comp, opponents=opponents, norm_field="tackles_for", mu=base["tackles"], prior_n=1.0)
    return {"gf": gf, "ga": ga, "ff": ff, "fa": fa, "cf": cf, "ca": ca, "yf": yf, "ya": ya, "tf": tf, "ta": ta}

bou_r   = get_team_rates(bou_matches,   venue="Home", comp="Europa League")
milan_r = get_team_rates(milan_matches, venue="Away", comp="Europa League")

print("Learned Bournemouth Rates (Home, UEL):", {k: round(v, 2) for k, v in bou_r.items()})
print("Learned AC Milan Rates    (Away, UEL):", {k: round(v, 2) for k, v in milan_r.items()})

# Referee Vassilis Fotias (Greece): 24.5 fouls/g, 4.75 yellows/g (737 yellows in 155 matches = 4.75/g)
ref_f_mult = 0.55 * (24.5 / 21.5) + 0.45 * 1.0
ref_y_mult = 0.50 * (4.75 / 3.8) + 0.50 * 1.0

lam_bou_goals = (bou_r["gf"] * milan_r["ga"]) / base["goals"] * 1.06
lam_mil_goals = (milan_r["gf"] * bou_r["ga"]) / base["goals"] * 0.94

lam_bou_fouls = 0.5 * (bou_r["ff"] + milan_r["fa"]) * ref_f_mult
lam_mil_fouls = 0.5 * (milan_r["ff"] + bou_r["fa"]) * ref_f_mult
lam_tot_fouls = lam_bou_fouls + lam_mil_fouls

lam_bou_cards = 0.5 * (bou_r["yf"] + milan_r["ya"]) * ref_y_mult
lam_mil_cards = 0.5 * (milan_r["yf"] + bou_r["ya"]) * ref_y_mult
lam_tot_cards = lam_bou_cards + lam_mil_cards

lam_bou_corners = 0.5 * (bou_r["cf"] + milan_r["ca"]) * 1.03
lam_mil_corners = 0.5 * (milan_r["cf"] + bou_r["ca"]) * 0.97
lam_tot_corners = lam_bou_corners + lam_mil_corners

lam_bou_tackles = 0.5 * (bou_r["tf"] + milan_r["ta"])
lam_mil_tackles = 0.5 * (milan_r["tf"] + bou_r["ta"])
lam_tot_tackles = lam_bou_tackles + lam_mil_tackles

grid = score_grid(lam_bou_goals, lam_mil_goals)

print("\n=== PRE-MATCH TWO-TEAM PROJECTION: BOURNEMOUTH vs AC MILAN (BLIND) ===")
print(f"Expected Goals   : Bournemouth {lam_bou_goals:.2f} - {lam_mil_goals:.2f} AC Milan (Total {lam_bou_goals+lam_mil_goals:.2f})")
print(f"1X2 Pure Model   : Bournemouth {grid['home']*100:.1f}% | Draw {grid['draw']*100:.1f}% | AC Milan {grid['away']*100:.1f}% | BTTS Yes {grid['btts']*100:.1f}%")
print(f"Expected Fouls   : Bournemouth {lam_bou_fouls:.2f} + AC Milan {lam_mil_fouls:.2f} = {lam_tot_fouls:.2f} Total Fouls")
print(f"  -> P(Over 20.5 Fouls)  = {poisson_over_prob(lam_tot_fouls, 20.5)*100:.1f}% (@ 1.35 = 74.1% implied -> Edge {(poisson_over_prob(lam_tot_fouls, 20.5)-1/1.35)*100:+.1f}%)")
print(f"  -> P(Over 21.5 Fouls)  = {poisson_over_prob(lam_tot_fouls, 21.5)*100:.1f}% (@ 1.42 = 70.4% implied -> Edge {(poisson_over_prob(lam_tot_fouls, 21.5)-1/1.42)*100:+.1f}%)")
print(f"Expected Cards   : Bournemouth {lam_bou_cards:.2f} + AC Milan {lam_mil_cards:.2f} = {lam_tot_cards:.2f} Total Cards")
print(f"  -> P(Over 3.5 Cards)   = {poisson_over_prob(lam_tot_cards, 3.5)*100:.1f}%  |  P(Over 4.5 Cards) = {poisson_over_prob(lam_tot_cards, 4.5)*100:.1f}%")
print(f"  -> P(Bournemouth Team Cards Over 2.5) = {poisson_over_prob(lam_bou_cards, 2.5)*100:.1f}% vs AC Milan Team Cards = {lam_mil_cards:.2f}")
print(f"Expected Corners : Bournemouth {lam_bou_corners:.2f} + AC Milan {lam_mil_corners:.2f} = {lam_tot_corners:.2f} Total Corners")
print(f"  -> P(Under 9.5 Corners) = {(1-poisson_over_prob(lam_tot_corners, 9.5))*100:.1f}%  |  P(Under 10.5 Corners) = {(1-poisson_over_prob(lam_tot_corners, 10.5))*100:.1f}%")

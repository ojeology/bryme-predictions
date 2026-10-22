import csv
import sys
sys.path.insert(0, "/home/user/bryme-predictions/bot-engine")
from src.bournemouth_engine import (
    BASELINES, load_matches, load_opponents, predict_match,
    team_rate, score_grid, poisson_over_prob, devig_three
)

BASELINES["Ekstraklasa"] = {"goals": 1.38, "fouls": 12.20, "corners": 5.00, "cards": 2.10, "tackles": 15.20}

opponents = load_opponents()
extra_opps = {
    "FC Thun":        {"team": "FC Thun", "tier": "cl_opp", "gf_rate": 1.45, "ga_rate": 1.45, "fouls_for": 13.5, "fouls_against": 11.5, "corners_for": 4.8, "corners_against": 5.0, "yellow_for": 2.2, "yellow_against": 2.0, "tackles_for": 16.0, "tackles_against": 15.5},
    "Widzew Lodz":    {"team": "Widzew Lodz", "tier": "mid", "gf_rate": 1.35, "ga_rate": 1.45, "fouls_for": 12.2, "fouls_against": 14.7, "corners_for": 4.9, "corners_against": 5.1, "yellow_for": 2.2, "yellow_against": 2.1, "tackles_for": 15.5, "tackles_against": 15.5},
    "Jagiellonia":    {"team": "Jagiellonia", "tier": "top6", "gf_rate": 1.75, "ga_rate": 1.25, "fouls_for": 13.3, "fouls_against": 10.1, "corners_for": 5.4, "corners_against": 4.6, "yellow_for": 2.1, "yellow_against": 2.0, "tackles_for": 15.8, "tackles_against": 15.2},
    "Rakow":          {"team": "Rakow", "tier": "top6", "gf_rate": 1.55, "ga_rate": 1.05, "fouls_for": 11.1, "fouls_against": 13.9, "corners_for": 5.5, "corners_against": 4.4, "yellow_for": 2.0, "yellow_against": 2.2, "tackles_for": 15.5, "tackles_against": 15.0},
    "Gornik Zabrze":  {"team": "Gornik Zabrze", "tier": "top6", "gf_rate": 1.65, "ga_rate": 1.15, "fouls_for": 12.1, "fouls_against": 13.7, "corners_for": 5.2, "corners_against": 4.8, "yellow_for": 2.2, "yellow_against": 2.1, "tackles_for": 16.0, "tackles_against": 15.5},
    "Radomiak Radom": {"team": "Radomiak Radom", "tier": "mid", "gf_rate": 1.25, "ga_rate": 1.60, "fouls_for": 13.1, "fouls_against": 14.8, "corners_for": 4.6, "corners_against": 5.4, "yellow_for": 2.4, "yellow_against": 2.2, "tackles_for": 15.5, "tackles_against": 15.2},
    "Slask Wroclaw":  {"team": "Slask Wroclaw", "tier": "promoted", "gf_rate": 1.10, "ga_rate": 1.65, "fouls_for": 12.2, "fouls_against": 11.2, "corners_for": 4.4, "corners_against": 5.5, "yellow_for": 2.1, "yellow_against": 2.0, "tackles_for": 15.2, "tackles_against": 15.0},
    "Bayer Leverkusen": {"team": "Bayer Leverkusen", "tier": "elite", "gf_rate": 2.10, "ga_rate": 1.15, "fouls_for": 10.0, "fouls_against": 10.7, "corners_for": 5.8, "corners_against": 4.2, "yellow_for": 1.8, "yellow_against": 1.9, "tackles_for": 15.5, "tackles_against": 15.0},
    "Korona Kielce":  {"team": "Korona Kielce", "tier": "mid", "gf_rate": 1.20, "ga_rate": 1.55, "fouls_for": 14.8, "fouls_against": 13.7, "corners_for": 4.7, "corners_against": 5.3, "yellow_for": 2.5, "yellow_against": 2.3, "tackles_for": 15.8, "tackles_against": 15.5},
}
opponents.update(extra_opps)

lech_matches = load_matches("/home/user/bryme-predictions/bot-engine/data/lech_matches.csv")
sun_matches = load_matches("/home/user/bryme-predictions/bot-engine/data/sunderland_matches.csv")

print("=== 1. LECH POZNAN WALK-FORWARD TABLE (ALL 10 PREDICTED GAMES BEFORE 22 OCT) ===")
for i in range(1, len(lech_matches)):
    m = lech_matches[i]
    prior = lech_matches[:i]
    opp_prof = opponents[m["opponent"]]
    ref = {"name": m["referee"], "fouls_avg": m["ref_fouls_avg"], "yellow_avg": m["ref_yellow_avg"]}
    pred = predict_match(prior, opp_prof, m["comp"], m["venue"], team_name="Lech Poznan", referee=ref, opponents=opponents)
    act_g = int(m["bou_goals"] + m["opp_goals"])
    act_f = int(m["bou_fouls"] + m["opp_fouls"])
    act_c = int(m["bou_yellow"] + m["opp_yellow"])
    act_cor = int(m["bou_corners"] + m["opp_corners"])
    act_t = int(m["bou_tackles"] + m["opp_tackles"])
    b = pred["behaviour"]
    g_tot = pred["lam_team_goals"] + pred["lam_opp_goals"]
    print(f"{m['date']} | {m['comp']:13s} | vs {m['opponent']:16s} ({m['venue'][0]}) | Score {int(m['bou_goals'])}-{int(m['opp_goals'])} | Goals {act_g}/{round(g_tot)} | Fouls {act_f}/{round(b['fouls']['lam'])} (Lech {int(m['bou_fouls'])}/{round(b['fouls']['team'])}) | Cards {act_c}/{round(b['cards']['lam'])} | Corners {act_cor}/{round(b['corners']['lam'])} | Tackles {act_t}/{round(b['tackles']['lam'])}")

print("\n=== 2. BLIND TWO-TEAM ENGINE: LECH POZNAN (11 GAMES) vs SUNDERLAND (8 GAMES) ===")
# Notice: What Happens When We Weight Each Team's Recent Form + Competition (Europa League) Match Logs?
base = BASELINES["Europa League"]

def get_team_rates(matches, venue, comp, prior_f=None, prior_c=None):
    pf = prior_f if prior_f else base["fouls"]
    pc = prior_c if prior_c else base["cards"]
    # Also compute recent 5-game / competition-specific rate so a team's sharp drop in fouls/cards in Europe is captured!
    gf = team_rate(matches, "bou_goals", 1.40, venue=venue, comp=comp, opponents=opponents, norm_field="ga_rate", mu=base["goals"], prior_n=1.5)
    ga = team_rate(matches, "opp_goals", 1.40, venue=venue, comp=comp, opponents=opponents, norm_field="gf_rate", mu=base["goals"], prior_n=1.5)
    
    # For fouls & cards: blend overall recency rate (45%) with last-5-games / UEL league-phase rate (55%)
    ff_all = team_rate(matches, "bou_fouls", pf, venue=venue, comp=comp, opponents=opponents, norm_field="fouls_against", mu=base["fouls"], prior_n=1.0)
    fa_all = team_rate(matches, "opp_fouls", pf, venue=venue, comp=comp, opponents=opponents, norm_field="fouls_for", mu=base["fouls"], prior_n=1.0)
    last5 = matches[-5:]
    uel_recent = [m for m in last5 if m["comp"] == comp]
    ff_l5 = sum(m["bou_fouls"] for m in last5) / len(last5)
    ff_uel = sum(m["bou_fouls"] for m in uel_recent) / len(uel_recent) if uel_recent else ff_l5
    ff = 0.35 * ff_all + 0.35 * ff_l5 + 0.30 * ff_uel

    fa_l5 = sum(m["opp_fouls"] for m in last5) / len(last5)
    fa_uel = sum(m["opp_fouls"] for m in uel_recent) / len(uel_recent) if uel_recent else fa_l5
    fa = 0.35 * fa_all + 0.35 * fa_l5 + 0.30 * fa_uel

    yf_all = team_rate(matches, "bou_yellow", pc, venue=venue, comp=comp, opponents=opponents, norm_field="yellow_for", mu=base["cards"], prior_n=1.0)
    ya_all = team_rate(matches, "opp_yellow", pc, venue=venue, comp=comp, opponents=opponents, norm_field="yellow_for", mu=base["cards"], prior_n=1.0)
    yf_l5 = sum(m["bou_yellow"] for m in last5) / len(last5)
    yf_uel = sum(m["bou_yellow"] for m in uel_recent) / len(uel_recent) if uel_recent else yf_l5
    yf = 0.35 * yf_all + 0.35 * yf_l5 + 0.30 * yf_uel

    ya_l5 = sum(m["opp_yellow"] for m in last5) / len(last5)
    ya_uel = sum(m["opp_yellow"] for m in uel_recent) / len(uel_recent) if uel_recent else ya_l5
    ya = 0.35 * ya_all + 0.35 * ya_l5 + 0.30 * ya_uel

    cf = team_rate(matches, "bou_corners", base["corners"], venue=venue, comp=comp, opponents=opponents, norm_field="corners_against", mu=base["corners"], prior_n=1.0)
    ca = team_rate(matches, "opp_corners", base["corners"], venue=venue, comp=comp, opponents=opponents, norm_field="corners_for", mu=base["corners"], prior_n=1.0)
    tf = team_rate(matches, "bou_tackles", base["tackles"], venue=venue, comp=comp, opponents=opponents, norm_field="tackles_for", mu=base["tackles"], prior_n=1.0)
    ta = team_rate(matches, "opp_tackles", base["tackles"], venue=venue, comp=comp, opponents=opponents, norm_field="tackles_for", mu=base["tackles"], prior_n=1.0)
    return {"gf": gf, "ga": ga, "ff": ff, "fa": fa, "cf": cf, "ca": ca, "yf": yf, "ya": ya, "tf": tf, "ta": ta}

lech_r = get_team_rates(lech_matches, venue="Home", comp="Europa League")
sun_r  = get_team_rates(sun_matches,  venue="Away", comp="Europa League")

print("Learned Lech Poznan Rates (Home, UEL):", {k: round(v, 2) for k, v in lech_r.items()})
print("Learned Sunderland Rates  (Away, UEL):", {k: round(v, 2) for k, v in sun_r.items()})

# Combine both teams' learned rates + FotMob Pre-Match Referee Profile for Balazs Berke in UEL (20.7 fouls/g, 4.0 yellows/g)
ref_f_mult = 20.7 / 21.5
ref_y_mult = 4.0 / 3.8

lam_lech_goals = (lech_r["gf"] * sun_r["ga"]) / base["goals"] * 1.06
lam_sun_goals  = (sun_r["gf"] * lech_r["ga"]) / base["goals"] * 0.94

lam_lech_fouls = 0.5 * (lech_r["ff"] + sun_r["fa"]) * ref_f_mult
lam_sun_fouls  = 0.5 * (sun_r["ff"] + lech_r["fa"]) * ref_f_mult
lam_tot_fouls  = lam_lech_fouls + lam_sun_fouls

lam_lech_cards = 0.5 * (lech_r["yf"] + sun_r["ya"]) * ref_y_mult
lam_sun_cards  = 0.5 * (sun_r["yf"] + lech_r["ya"]) * ref_y_mult
lam_tot_cards  = lam_lech_cards + lam_sun_cards

lam_lech_corners = 0.5 * (lech_r["cf"] + sun_r["ca"]) * 1.04
lam_sun_corners  = 0.5 * (sun_r["cf"] + lech_r["ca"]) * 0.96
lam_tot_corners  = lam_lech_corners + lam_sun_corners

lam_lech_tackles = 0.5 * (lech_r["tf"] + sun_r["ta"])
lam_sun_tackles  = 0.5 * (sun_r["tf"] + lech_r["ta"])
lam_tot_tackles  = lam_lech_tackles + lam_sun_tackles

grid = score_grid(lam_lech_goals, lam_sun_goals)
m_lech, m_draw, m_sun = devig_three(4.92, 4.21, 1.69)

print("\n=== PRE-MATCH TWO-TEAM PROJECTION (100% BLIND TO TODAY'S RESULT) ===")
print(f"Expected Goals   : Lech Poznan {lam_lech_goals:.2f} - {lam_sun_goals:.2f} Sunderland (Total {lam_lech_goals+lam_sun_goals:.2f})")
print(f"1X2 Pure Model   : Lech {grid['home']*100:.1f}% | Draw {grid['draw']*100:.1f}% | Sunderland {grid['away']*100:.1f}% (Bookie Implied Sunderland: {m_sun*100:.1f}%)")
print(f"Expected Fouls   : Lech {lam_lech_fouls:.2f} + Sunderland {lam_sun_fouls:.2f} = {lam_tot_fouls:.2f} Total Fouls")
print(f"  -> P(Over 21.5 Fouls)  = {poisson_over_prob(lam_tot_fouls, 21.5)*100:.1f}%  |  P(Over 22.5 Fouls) = {poisson_over_prob(lam_tot_fouls, 22.5)*100:.1f}%")
print(f"  -> P(Lech Fouls Under 9.5) = {(1-poisson_over_prob(lam_lech_fouls, 9.5))*100:.1f}%  |  P(Sunderland Fouls Over 11.5) = {poisson_over_prob(lam_sun_fouls, 11.5)*100:.1f}%")
print(f"Expected Cards   : Lech {lam_lech_cards:.2f} + Sunderland {lam_sun_cards:.2f} = {lam_tot_cards:.2f} Total Cards")
print(f"  -> P(Over 3.5 Cards)   = {poisson_over_prob(lam_tot_cards, 3.5)*100:.1f}%  |  P(Under 3.5 Cards) = {(1-poisson_over_prob(lam_tot_cards, 3.5))*100:.1f}%")
print(f"Expected Corners : Lech {lam_lech_corners:.2f} + Sunderland {lam_sun_corners:.2f} = {lam_tot_corners:.2f} Total Corners")
print(f"  -> P(Sunderland Corners Over 4.5) = {poisson_over_prob(lam_sun_corners, 4.5)*100:.1f}%  |  P(Total Corners Over 9.5) = {poisson_over_prob(lam_tot_corners, 9.5)*100:.1f}%")
print(f"Expected Tackles : Lech {lam_lech_tackles:.2f} + Sunderland {lam_sun_tackles:.2f} = {lam_tot_tackles:.2f} Total Tackles")
print(f"  -> P(Under 31.5 Tackles) = {(1-poisson_over_prob(lam_tot_tackles, 31.5))*100:.1f}%")

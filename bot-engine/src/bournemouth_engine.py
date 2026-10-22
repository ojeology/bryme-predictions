"""
bournemouth_engine.py — AFC Bournemouth behaviour & results prediction engine.

Same method as City's engine:
  1. Poisson count models for goals, fouls, cards, corners, tackles.
  2. Recency-weighted, opponent-strength-normalized rates.
  3. Match lambda: (rate_A_for * rate_B_against) / league_avg.
  4. Referee multiplier on fouls/cards.
  5. Devig bookmaker odds -> implied prob; edge = model - implied.
  6. Fractional Kelly staking (0.25), capped at 2%.

Note: score_grid() is BOURNEMOUTH-CENTRIC: grid['home'] = P(Bournemouth wins)
regardless of venue.

Walk-forward enforced by caller: predict_match() only sees matches BEFORE
the fixture being predicted.
"""

import csv
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

# ---------------------------------------------------------------- config
EDGE_THRESHOLD = 0.05
KELLY_FRACTION = 0.25
MAX_STAKE = 0.02
HALFLIFE_MATCHES = 5.0

BASELINES = {
    "Premier League":    {"goals": 1.45, "fouls": 11.45, "corners": 5.10,
                          "cards": 1.75, "tackles": 16.50},
    "La Liga":           {"goals": 1.35, "fouls": 12.50, "corners": 4.90,
                          "cards": 2.30, "tackles": 15.00},
    "Serie A":           {"goals": 1.40, "fouls": 11.00, "corners": 4.90,
                          "cards": 1.65, "tackles": 15.50},
    "Ligue 1":           {"goals": 1.45, "fouls": 11.50, "corners": 4.90,
                          "cards": 1.80, "tackles": 17.00},
    "Europa League":     {"goals": 1.50, "fouls": 11.80, "corners": 4.90,
                          "cards": 2.00, "tackles": 16.50},
    "Conference League": {"goals": 1.50, "fouls": 11.20, "corners": 4.90,
                          "cards": 1.75, "tackles": 15.50},
    "Carabao Cup":       {"goals": 1.45, "fouls": 11.00, "corners": 5.00,
                          "cards": 1.60, "tackles": 16.50},
}

TIER_GOALS_PRIOR = {
    "elite":     (1.85, 1.05),
    "elite_cl":  (2.00, 1.05),
    "top6":      (1.60, 1.20),
    "mid":       (1.35, 1.45),
    "promoted":  (1.15, 1.75),
    "cl_opp":    (1.25, 1.55),
    "cup_opp":   (1.05, 1.85),
}
PRIOR_N_GOALS = 6.0
PRIOR_N_EVENTS = 4.0

REF_FOULS_AVG = 21.5
REF_YELLOW_AVG = 3.5

STANDARD_LINES = {
    "fouls":   21.5,
    "cards":   3.5,
    "corners": 9.5,
    "tackles": 31.5,
}
FAIR_PRICE = 1.85


# ---------------------------------------------------------------- helpers
def poisson_pmf(k, lam):
    if lam <= 0:
        return 1.0 if k == 0 else 0.0
    return math.exp(-lam) * (lam ** k) / math.factorial(k)


def poisson_over_prob(lam, line):
    k0 = int(math.floor(line)) + 1
    hi = int(lam + 12 * math.sqrt(lam + 1) + 25)
    return sum(poisson_pmf(k, lam) for k in range(k0, hi))


def score_grid(lam_bou, lam_opp, max_goals=12):
    """BOURNEMOUTH-CENTRIC joint grid: grid['home'] = P(Bournemouth wins)."""
    pb = [poisson_pmf(i, lam_bou) for i in range(max_goals + 1)]
    po = [poisson_pmf(j, lam_opp) for j in range(max_goals + 1)]
    bou = draw = opp = btts = over25 = over35 = 0.0
    for i, p_i in enumerate(pb):
        for j, p_j in enumerate(po):
            p = p_i * p_j
            if i > j:
                bou += p
            elif i == j:
                draw += p
            else:
                opp += p
            if i + j > 2.5:
                over25 += p
            if i + j > 3.5:
                over35 += p
            if i > 0 and j > 0:
                btts += p
    return {"home": bou, "draw": draw, "away": opp,
            "over25": over25, "over35": over35, "btts": btts}


def devig_two(o1, o2):
    i1, i2 = 1.0 / o1, 1.0 / o2
    s = i1 + i2
    return i1 / s, i2 / s


def devig_three(o1, o2, o3):
    i1, i2, i3 = 1.0 / o1, 1.0 / o2, 1.0 / o3
    s = i1 + i2 + i3
    return i1 / s, i2 / s, i3 / s


def kelly_stake(p, odds):
    b = odds - 1.0
    if b <= 0:
        return 0.0
    f = (p * b - (1 - p)) / b
    return max(0.0, min(f * KELLY_FRACTION, MAX_STAKE))


# ---------------------------------------------------------------- loading
def load_matches(path=None):
    if path is None:
        path = DATA / "bournemouth_matches.csv"
    rows = []
    with open(path) as f:
        for r in csv.DictReader(f):
            for k in ("bou_goals", "opp_goals", "bou_fouls", "opp_fouls",
                      "bou_corners", "opp_corners", "bou_yellow", "opp_yellow",
                      "bou_tackles", "opp_tackles", "ref_fouls_avg", "ref_yellow_avg"):
                r[k] = float(r[k]) if r.get(k) not in (None, "") else None
            rows.append(r)
    return rows


def load_opponents(path=None):
    if path is None:
        path = DATA / "opponents.csv"
    out = {}
    with open(path) as f:
        for r in csv.DictReader(f):
            row = {}
            for k, v in r.items():
                if k in ("team", "tier", "source_note") or v in ("", None):
                    row[k] = v
                else:
                    row[k] = float(v)
            out[row["team"]] = row
    return out


def load_odds(path=None):
    if path is None:
        path = DATA / "bournemouth_odds.csv"
    out = {}
    with open(path) as f:
        for r in csv.DictReader(f):
            out.setdefault(r["match"], {}).setdefault(r["market"], {})[r["selection"]] = {
                "odds": float(r["odds"]), "note": r["source_note"]}
    return out


# ---------------------------------------------------------------- rates
def recency_rate(pairs, prior_value, prior_n, halflife=HALFLIFE_MATCHES):
    num = prior_value * prior_n
    den = prior_n
    for age, val in pairs:
        if val is None:
            continue
        w = 0.5 ** (age / halflife)
        num += w * val
        den += w
    return num / den if den > 0 else prior_value


def team_rate(matches_upto, field, prior_value, venue=None, comp=None,
              opponents=None, norm_field=None, mu=None, prior_n=PRIOR_N_EVENTS):
    """Recency-weighted team rate from strictly prior matches."""
    pairs = []
    n = len(matches_upto)
    for j, m in enumerate(matches_upto):
        v = m.get(field)
        if v is None:
            continue
        if norm_field and opponents is not None and mu:
            prof = opponents.get(m["opponent"])
            r = prof.get(norm_field) if prof else None
            if r:
                v = v * mu / r
        age = float(n - 1 - j)
        if venue and m["venue"] != venue:
            age += 2.0
        if comp and m["comp"] != comp:
            age += 1.0
        pairs.append((age, v))
    return recency_rate(pairs, prior_value, prior_n)


def opp_rate(profile, field, prior):
    v = profile.get(field)
    return recency_rate([(0.0, v)], prior, PRIOR_N_EVENTS) if v is not None else prior


# ---------------------------------------------------------------- model
def predict_match(matches_upto, opp_profile, comp, venue, team_name="Bournemouth",
                  referee=None, odds_block=None, opponents=None):
    """
    Full prediction sheet for the next Bournemouth fixture.
    venue: "Home" or "Away" from Bournemouth's perspective.
    No future data allowed.
    """
    base = BASELINES[comp]
    tier_att, tier_con = TIER_GOALS_PRIOR[opp_profile["tier"]]

    def crate(field, prior, norm_field, mu, prior_n=PRIOR_N_EVENTS):
        return team_rate(matches_upto, field, prior, venue=venue, comp=comp,
                         opponents=opponents, norm_field=norm_field, mu=mu,
                         prior_n=prior_n)

    def orate(field, prior):
        return opp_rate(opp_profile, field, prior)

    # ---- goals -------------------------------------------------------
    # Pre-season Bournemouth priors (mid-table high-pressing side: ~1.50 GF, 1.40 GA at Home)
    prior_gf = 1.50 if venue == "Home" else 1.25
    prior_ga = 1.25 if venue == "Home" else 1.55
    team_gf = crate("bou_goals", prior_gf, "ga_rate", base["goals"], PRIOR_N_GOALS)
    team_ga = crate("opp_goals", prior_ga, "gf_rate", base["goals"], PRIOR_N_GOALS)
    opp_gf = orate("gf_rate", tier_att)
    opp_ga = orate("ga_rate", tier_con)

    venue_mult_bou = 1.06 if venue == "Home" else 0.94
    venue_mult_opp = 0.94 if venue == "Home" else 1.06

    lam_team_goals = (team_gf * opp_ga) / base["goals"] * venue_mult_bou
    lam_opp_goals = (opp_gf * team_ga) / base["goals"] * venue_mult_opp
    grid = score_grid(lam_team_goals, lam_opp_goals)

    # ---- behaviour markets ------------------------------------------
    ref_fouls_mult = (referee["fouls_avg"] / REF_FOULS_AVG) if referee and referee.get("fouls_avg") else 1.0
    ref_cards_mult = (referee["yellow_avg"] / REF_YELLOW_AVG) if referee and referee.get("yellow_avg") else 1.0

    def total_lambda(team_for_f, team_against_f, opp_for_f, opp_against_f,
                     mu, ref_mult=1.0, team_prior_for=None, team_prior_against=None):
        pf = team_prior_for if team_prior_for is not None else mu
        pa = team_prior_against if team_prior_against is not None else mu
        lt = crate(team_for_f, pf, opp_against_f, mu) * orate(opp_against_f, mu) / mu
        lo = orate(opp_for_f, mu) * crate(team_against_f, pa, opp_for_f, mu) / mu
        return (lt + lo) * ref_mult, lt * ref_mult, lo * ref_mult

    # Team-specific pre-season priors (from 2025-26 baseline)
    TEAM_PRIORS = {
        "Bournemouth":    {"fouls": (12.1, 12.0), "cards": (2.3, 1.8), "corners": (5.5, 4.8), "tackles": (16.0, 16.0)},
        "Crystal Palace": {"fouls": (10.0, 10.2), "cards": (1.5, 1.6), "corners": (4.2, 5.2), "tackles": (19.5, 15.0)},
        "Sunderland":     {"fouls": (12.0, 13.0), "cards": (1.9, 1.9), "corners": (4.8, 5.0), "tackles": (15.5, 15.5)},
        "Lyon":           {"fouls": (10.5, 12.5), "cards": (1.7, 1.9), "corners": (5.0, 5.2), "tackles": (13.5, 15.0)},
        "Celtic":         {"fouls": (11.5, 11.5), "cards": (1.6, 2.1), "corners": (8.0, 3.8), "tackles": (16.5, 16.0)},
        "Real Sociedad":  {"fouls": (12.5, 11.0), "cards": (1.5, 1.8), "corners": (7.2, 4.8), "tackles": (18.0, 18.0)},
        "Atalanta":       {"fouls": (10.5, 9.5),  "cards": (1.0, 1.0), "corners": (4.5, 4.5), "tackles": (13.0, 15.0)},
        "Monaco":         {"fouls": (12.0, 11.5), "cards": (2.0, 1.8), "corners": (4.2, 5.8), "tackles": (21.5, 17.5)},
        "Getafe":         {"fouls": (14.5, 12.5), "cards": (3.2, 2.2), "corners": (4.0, 6.0), "tackles": (11.5, 16.0)},
    }
    tp = TEAM_PRIORS.get(team_name, {
        "fouls": (base["fouls"], base["fouls"]),
        "cards": (base["cards"], base["cards"]),
        "corners": (base["corners"], base["corners"]),
        "tackles": (base["tackles"], base["tackles"]),
    })

    lam_fouls = total_lambda("bou_fouls", "opp_fouls", "fouls_for", "fouls_against",
                             base["fouls"], ref_fouls_mult, tp["fouls"][0], tp["fouls"][1])
    lam_cards = total_lambda("bou_yellow", "opp_yellow", "yellow_for", "yellow_for",
                             base["cards"], ref_cards_mult, tp["cards"][0], tp["cards"][1])
    lam_corners = total_lambda("bou_corners", "opp_corners", "corners_for", "corners_against",
                               base["corners"], 1.0, tp["corners"][0], tp["corners"][1])
    lam_tackles = total_lambda("bou_tackles", "opp_tackles", "tackles_for", "tackles_for",
                               base["tackles"], 1.0, tp["tackles"][0], tp["tackles"][1])

    behaviour = {
        "fouls":   {"lam": lam_fouls[0], "team": lam_fouls[1], "opp": lam_fouls[2]},
        "cards":   {"lam": lam_cards[0], "team": lam_cards[1], "opp": lam_cards[2]},
        "corners": {"lam": lam_corners[0], "team": lam_corners[1], "opp": lam_corners[2]},
        "tackles": {"lam": lam_tackles[0], "team": lam_tackles[1], "opp": lam_tackles[2]},
    }

    # ---- market comparison / edge -----------------------------------
    bets = []

    def add_bet(market, selection, model_p, odds, devig_p, note=""):
        bets.append({"market": market, "selection": selection, "model_p": model_p,
                     "implied_devig": devig_p, "implied_raw": 1.0 / odds, "odds": odds,
                     "edge_vs_raw": model_p - 1.0 / odds,
                     "edge_vs_devig": model_p - devig_p,
                     "stake": kelly_stake(model_p, odds), "note": note})

    if odds_block:
        x2 = odds_block.get("1X2")
        if x2 and team_name in x2 and "Draw" in x2:
            o_team = x2[team_name]["odds"]
            o_draw = x2["Draw"]["odds"]
            opp_key, opp_info = [(k, v) for k, v in x2.items() if k not in (team_name, "Draw")][0]
            o_opp = opp_info["odds"]
            p_team, p_draw, p_opp = devig_three(o_team, o_draw, o_opp)
            add_bet("1X2", f"{team_name} win", grid["home"], o_team, p_team)
            add_bet("1X2", "Draw", grid["draw"], o_draw, p_draw)
            add_bet("1X2", f"{opp_key} win", grid["away"], o_opp, p_opp)

        for mkt, mkt_key, over_key, under_key in (
                ("OU2.5", "over25", "Over", "Under"),
                ("OU3.5", "over35", "Over", "Under"),
                ("BTTS", "btts", "Yes", "No")):
            blk = odds_block.get(mkt)
            if blk and over_key in blk and under_key in blk:
                d_over, d_under = devig_two(blk[over_key]["odds"], blk[under_key]["odds"])
                m_over = grid[mkt_key]
                add_bet(mkt, over_key, m_over, blk[over_key]["odds"], d_over)
                add_bet(mkt, under_key, 1 - m_over, blk[under_key]["odds"], d_under)

    return {"lam_team_goals": lam_team_goals, "lam_opp_goals": lam_opp_goals,
            "grid": grid, "behaviour": behaviour, "bets": bets,
            "ref_fouls_mult": ref_fouls_mult, "ref_cards_mult": ref_cards_mult}

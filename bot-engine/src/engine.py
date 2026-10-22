"""
engine.py — Man City behaviour & results prediction engine.

Method (deliberately simple + auditable, stdlib only):
  1. Count-model core: Poisson. Fouls, cards, corners, tackles, goals are counts.
  2. Rates: recency-weighted, OPPONENT-STRENGTH-NORMALIZED team rates, shrunk
     toward tier priors / league baselines (small-sample protection).
     Normalization: a match observation is rescaled by mu/opponent_rate, so
     "conceded 4 vs PSG" counts less than "conceded 4 vs Ipswich".
  3. Match lambda: multiplicative strength model
        lambda_A = (rate_A_for * rate_B_against) / league_avg_per_team
  4. Referee multiplier on fouls/cards (behavioural kicker).
  5. Market comparison: devig bookmaker odds -> implied prob; edge = model - implied.
  6. Stake: fractional Kelly (0.25), capped at 2% of bankroll.

Note: score_grid() is CITY-CENTRIC: grid['home'] = P(City win) regardless of
venue. Venue only affects rate weighting and market selection labels.

Walk-forward is enforced by the caller: predict_match() only ever sees
matches BEFORE the fixture being predicted.
"""

import csv
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

# ---------------------------------------------------------------- config
EDGE_THRESHOLD = 0.05      # bet only if model prob - devig implied prob > 5 pts
KELLY_FRACTION = 0.25      # quarter Kelly
MAX_STAKE = 0.02           # never more than 2% of bankroll
HALFLIFE_MATCHES = 5.0     # recency weighting

BASELINES = {
    "Premier League":  {"goals": 1.45, "fouls": 11.45, "corners": 5.10,
                        "cards": 1.75, "tackles": 16.50},
    "Champions League": {"goals": 1.55, "fouls": 10.10, "corners": 4.80,
                         "cards": 1.65, "tackles": 18.50},
    "Europa League":   {"goals": 1.50, "fouls": 10.50, "corners": 4.90,
                        "cards": 1.70, "tackles": 17.50},
    "League Cup":      {"goals": 1.45, "fouls": 11.00, "corners": 5.00,
                        "cards": 1.60, "tackles": 17.00},
    "Community Shield": {"goals": 1.45, "fouls": 11.00, "corners": 5.00,
                         "cards": 1.75, "tackles": 16.50},
}

TIER_GOALS_PRIOR = {
    "elite":     (1.85, 1.05),
    "elite_cl":  (2.00, 1.05),
    "top6":      (1.60, 1.20),
    "mid":       (1.35, 1.45),
    "promoted":  (1.15, 1.75),
    "cl_opp":    (1.15, 1.65),
    "cup_opp":   (1.20, 1.70),
}
PRIOR_N_GOALS = 10.0
PRIOR_N_EVENTS = 5.0

REF_FOULS_AVG = 21.5
REF_YELLOW_AVG = 3.4

STANDARD_LINES = {
    "fouls":   ("Premier League", 21.5),
    "cards":   ("Premier League", 3.5),
    "corners": ("Premier League", 9.5),
    "tackles": ("Premier League", 32.5),
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


def score_grid(lam_city, lam_opp, max_goals=12):
    """CITY-CENTRIC joint grid: grid['home'] = P(City wins)."""
    pc = [poisson_pmf(i, lam_city) for i in range(max_goals + 1)]
    po = [poisson_pmf(j, lam_opp) for j in range(max_goals + 1)]
    city = draw = opp = btts = 0.0
    over25 = over35 = 0.0
    for i, p_i in enumerate(pc):
        for j, p_j in enumerate(po):
            p = p_i * p_j
            if i > j:
                city += p
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
    return {"home": city, "draw": draw, "away": opp,
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
def load_matches():
    rows = []
    with open(DATA / "city_matches.csv") as f:
        for r in csv.DictReader(f):
            for k in ("city_goals", "opp_goals", "city_fouls", "opp_fouls",
                      "city_corners", "opp_corners", "city_yellow", "opp_yellow",
                      "city_tackles", "opp_tackles", "ref_fouls_avg", "ref_yellow_avg"):
                r[k] = float(r[k]) if r.get(k) not in (None, "") else None
            rows.append(r)
    return rows


def load_opponents():
    out = {}
    with open(DATA / "opponents.csv") as f:
        for r in csv.DictReader(f):
            row = {}
            for k, v in r.items():
                if k in ("team", "tier", "source_note") or v in ("", None):
                    row[k] = v
                else:
                    row[k] = float(v)
            out[row["team"]] = row
    return out


def load_odds():
    out = {}
    with open(DATA / "odds.csv") as f:
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


def city_rate(matches_upto, field, prior_value, venue=None, comp=None,
              opponents=None, norm_field=None, mu=None, prior_n=PRIOR_N_EVENTS):
    """Recency-weighted City rate from strictly prior matches.

    If norm_field + mu are given, each observation is rescaled:
        normalized = observed * mu / opponent_rate
    so it becomes 'vs an average opponent' before pooling.
    """
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


# ---------------------------------------------------------------- model
def predict_match(matches_upto, opp_profile, comp, venue, referee=None,
                  odds_block=None, opponents=None):
    """Full prediction sheet for the next fixture. No future data allowed."""
    base = BASELINES[comp]
    tier_att, tier_con = TIER_GOALS_PRIOR[opp_profile["tier"]]

    def crate(field, prior, norm_field, mu, prior_n=PRIOR_N_EVENTS):
        return city_rate(matches_upto, field, prior, venue=venue, comp=comp,
                         opponents=opponents, norm_field=norm_field, mu=mu,
                         prior_n=prior_n)

    def orate(field, prior):
        v = opp_profile.get(field)
        return recency_rate([(0.0, v)], prior, PRIOR_N_EVENTS) if v is not None else prior

    # ---- goals -------------------------------------------------------
    city_gf = crate("city_goals", 1.85, "ga_rate", base["goals"], PRIOR_N_GOALS)
    city_ga = crate("opp_goals", 1.05, "gf_rate", base["goals"], PRIOR_N_GOALS)
    opp_gf = orate("gf_rate", tier_att)
    opp_ga = orate("ga_rate", tier_con)

    lam_city_goals = (city_gf * opp_ga) / base["goals"]
    lam_opp_goals = (opp_gf * city_ga) / base["goals"]
    grid = score_grid(lam_city_goals, lam_opp_goals)

    # ---- behaviour markets ------------------------------------------
    ref_fouls_mult = (referee["fouls_avg"] / REF_FOULS_AVG) if referee and referee.get("fouls_avg") else 1.0
    ref_cards_mult = (referee["yellow_avg"] / REF_YELLOW_AVG) if referee and referee.get("yellow_avg") else 1.0

    def total_lambda(city_for_f, city_against_f, opp_for_f, opp_against_f,
                     mu, ref_mult=1.0):
        lc = crate(city_for_f, mu, opp_against_f, mu) * orate(opp_against_f, mu) / mu
        lo = orate(opp_for_f, mu) * crate(city_against_f, mu, opp_for_f, mu) / mu
        return (lc + lo) * ref_mult, lc * ref_mult, lo * ref_mult

    lam_fouls = total_lambda("city_fouls", "opp_fouls", "fouls_for", "fouls_against",
                             base["fouls"], ref_fouls_mult)
    lam_cards = total_lambda("city_yellow", "opp_yellow", "yellow_for", "yellow_for",
                             base["cards"], ref_cards_mult)
    lam_corners = total_lambda("city_corners", "opp_corners", "corners_for", "corners_against",
                               base["corners"])
    lam_tackles = total_lambda("city_tackles", "opp_tackles", "tackles_for", "tackles_for",
                               base["tackles"])

    behaviour = {
        "fouls":   {"lam": lam_fouls[0], "city": lam_fouls[1], "opp": lam_fouls[2]},
        "cards":   {"lam": lam_cards[0], "city": lam_cards[1], "opp": lam_cards[2]},
        "corners": {"lam": lam_corners[0], "city": lam_corners[1], "opp": lam_corners[2]},
        "tackles": {"lam": lam_tackles[0], "city": lam_tackles[1], "opp": lam_tackles[2]},
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
        if x2 and "Man City" in x2 and "Draw" in x2:
            o_city = x2["Man City"]["odds"]
            o_draw = x2["Draw"]["odds"]
            o_opp = [v for k, v in x2.items() if k not in ("Man City", "Draw")][0]["odds"]
            p_city, p_draw, p_opp = devig_three(o_city, o_draw, o_opp)
            # grid is city-centric: home=City win, away=Opp win
            add_bet("1X2", "Man City win", grid["home"], o_city, p_city)
            add_bet("1X2", "Draw", grid["draw"], o_draw, p_draw)
            add_bet("1X2", "Opp win", grid["away"], o_opp, p_opp)

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

        for mkt, key in (("CORNERS", "corners"), ("FOULS", "fouls"),
                         ("CARDS", "cards"), ("TACKLES", "tackles")):
            blk = odds_block.get(mkt)
            if not blk:
                continue
            for sel, info in blk.items():
                parts = sel.split()
                side, line = parts[0], float(parts[1])
                lam = behaviour[key]["lam"]
                p_over = poisson_over_prob(lam, line)
                m_p = p_over if side.lower() == "over" else 1 - p_over
                add_bet(mkt, sel, m_p, info["odds"], 0.5,
                        note="single quoted side; fair assumed 50%")

    return {"lam_city_goals": lam_city_goals, "lam_opp_goals": lam_opp_goals,
            "grid": grid, "behaviour": behaviour, "bets": bets,
            "ref_fouls_mult": ref_fouls_mult, "ref_cards_mult": ref_cards_mult}

# football-bot — Man City behaviour model

A small, auditable football-betting research pipeline: Poisson count models for
goals, fouls, cards, corners and tackles, with opponent-strength normalization,
referee multipliers, market devig + edge detection, and fractional Kelly staking.

## Run

```bash
python3 backtest.py   # walk-forward backtest, whole season, ledgers
python3 predict.py    # next-match sheet (Aston Villa v City, 24 Oct)
```

No dependencies beyond Python 3 stdlib.

## Layout

- `data/city_matches.csv` — every competitive match this season with per-match
  events (fouls/cards/corners/tackles) and referees. Flags mark the two
  reconstructed fields (Bournemouth events, Community Shield goals-only).
- `data/odds.csv` — real pre-match market prices where retrievable.
- `data/opponents.csv`, `data/refs.csv` — opponent profiles and referee profiles.
- `src/engine.py` — the model.
- `REPORT.md` — findings, backtest results, failure analysis, roadmap.

## Method in one line

`λ_A = (normalized_rate_A_for × rate_B_against) / league_avg`, Poisson
distributions, referee multipliers on fouls/cards, bet when
`model_prob − devig_implied_prob > 5pts`, quarter-Kelly, 2% cap.

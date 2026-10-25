#!/usr/bin/env python3
"""
THE DAILY ROUTINE — one command that keeps the record consistent
=================================================================
Run this once a day, before and after the matchday:

    python3 ledger_daily.py before    (morning)  -> log today's board, prove completeness
    python3 ledger_daily.py after     (evening)  -> pull results, grade, rewrite the record

"before" makes sure every board that goes out today is IN the ledger, so
nothing can be published without being recorded.  "after" pulls the real
results and grades every open leg.  Neither step can rewrite a pick or a
result that already exists.
"""
import json, os, sys, subprocess, glob, re
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data')
LEDGER = os.path.join(DATA, 'LEDGER.jsonl')


def run(script, *args):
    cmd = [sys.executable, os.path.join(HERE, script)] + list(args)
    print('$', ' '.join(os.path.basename(cmd[0]) for _ in [0]) + ' ' + ' '.join(args))
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(r.stdout)
    if r.returncode != 0:
        print('ERROR:', r.stderr[-2000:])
    return r.returncode


def log_todays_boards():
    """Put every board published for today into the ledger."""
    import ledger as LD
    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    rows = []
    # Sunday card board (all matches)
    for p in glob.glob(os.path.join(DATA, 'sunday_all_matches_*.json')):
        for r in json.load(open(p)):
            parts = [x.strip() for x in r['fx'].split(' v ')]
            home, away = (parts + ['', ''])[:2]
            rows.append(LD.add_pick(
                date=today, ko=r['ko'], home=home, away=away, comp=r.get('comp', ''),
                market='Cards', line=f"O{r['buf']}", prob=r.get('buf_p'),
                model_line=f"O{r['model_line']}", model_prob=r.get('model_p'),
                buffered=True, referee=r.get('ref'), ref_games=r.get('games'),
                src='DAILY_CARD_BOARD', created=LD.now_iso()))
    # the ticket we actually placed
    for p in glob.glob(os.path.join(DATA, '*ticket*.json')) + \
             glob.glob(os.path.join(DATA, 'sunday_n100k_*.json')):
        try:
            data = json.load(open(p))
        except Exception:
            continue
        if not isinstance(data, list):
            continue
        for L in data:
            fx = L.get('fx')
            if not fx:
                continue
            parts = [x.strip() for x in fx.split(' v ')]
            home, away = (parts + ['', ''])[:2]
            rows.append(LD.add_pick(
                date=L.get('date', today), ko=L.get('ko'), home=home, away=away,
                comp=L.get('comp', ''), market=L.get('market'), line=L.get('line'),
                prob=L.get('prob'), model_line=L.get('model_line'),
                model_prob=L.get('model_p'), plan=L.get('plan'),
                buffered=L.get('buffered'), referee=L.get('referee'),
                src=os.path.basename(p), created=LD.now_iso()))
    n, dup = LD.add_rows(rows)
    print(f'logged {n} new picks, {dup} already recorded')
    return n


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'report'
    if mode == 'before':
        print('=' * 70)
        print('BEFORE THE MATCHDAY — log everything, prove nothing is missing')
        print('=' * 70)
        log_todays_boards()
        run('ledger.py', 'check')
    elif mode == 'after':
        print('=' * 70)
        print('AFTER THE MATCHDAY — pull results, grade, rewrite the record')
        print('=' * 70)
        run('grade_ledger.py')
        run('ledger.py', 'report')
    else:
        run('ledger.py', 'report')


if __name__ == '__main__':
    main()

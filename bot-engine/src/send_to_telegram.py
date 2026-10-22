"""
Optional direct Telegram push helper for GitHub Actions (`behaviour-bot.yml`).
If `TELEGRAM_CHAT_ID` is set in GitHub Actions Variables/Secrets, pushes the daily
Walk-Forward Behaviour Machine summary directly to Telegram via the bot token.
"""
from __future__ import annotations
import json
import os
import urllib.request
from sync_machine_to_kv import build_machine_payload

DEFAULT_BOT_TOKEN = "8443187787:AAGui3m2Kq6ck-RCQFBqVJirIs-uepWVSd8"


def push_daily_summary() -> None:
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", DEFAULT_BOT_TOKEN).strip()
    if not chat_id:
        print("TELEGRAM_CHAT_ID not set; skipping direct Telegram push (use /machine in Telegram bot).")
        return

    bm = build_machine_payload()
    legs = bm["smallOddsSlip"]
    lines = [
        f"🤖 <b>BRYME Walk-Forward Behaviour Machine ({bm['totalMatchesTracked']} Matches, {bm['totalTeamsStudied']} Teams)</b>",
        f"🔒 <b>Tonight's 12-Leg Behaviour Acca ({bm['combinedSmallOdds']}) — Hit Rate {bm['combinedHitRate']}:</b>\n",
    ]
    for l in legs:
        lines.append(
            f"<b>{l['leg']}. {l['match']}</b>\n"
            f"   👉 <b>{l['pick']} @ {l['odds']}</b> (Model {l['modelProb']} | Edge {l['edge']} | {l['streak']})"
        )

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": "\n".join(lines),
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        print("Telegram message sent:", resp.read().decode("utf-8")[:200])


if __name__ == "__main__":
    push_daily_summary()

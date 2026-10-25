#!/usr/bin/env bash
#
# Publish the lab to predictions.thebryme.com
# -------------------------------------------
#   ./publish.sh              build + deploy
#   ./publish.sh --login      log in to Cloudflare first (browser, one click)
#
set -euo pipefail
cd "$(dirname "$0")"

if [ "${1:-}" = "--login" ]; then
  echo "Opening Cloudflare in your browser — approve, then run ./publish.sh again."
  npx wrangler@4 login
  exit 0
fi

echo "==> building"
npm run build

echo
echo "==> deploying (if this asks you to log in, run: npx wrangler@4 login)"
npx wrangler@4 deploy

echo
echo "==> done. Check https://predictions.thebryme.com"
echo "    Hard-refresh (Ctrl+Shift+R) — the old service worker may hold a cached copy."

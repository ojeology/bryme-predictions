# The reader on a machine in Nigeria

Five books answer the free runner: SportyBet, NairaBet, LiveScore Bet,
BetKing and MSport. Three more refuse it — **22Bet, 1xBet and Bet9ja** — and
they refuse it for one reason only: they answer addresses inside the country
they serve, and both the GitHub runner and the Cloudflare Worker sit
outside it. That is not a puzzle; the same request from a Nigerian address
is answered.

So the way to eight books is to run **the same reader** on a small Linux
box in Nigeria. Nothing else changes: the reader publishes the prices to
the same branch, the Worker reads them from the same place, and the phone
sees the same site.

---

## What the machine needs

- Ubuntu or Debian, 1 GB of memory is plenty.
- Node.js 20 (`apt install nodejs npm`, or nodesource).
- Chromium, because two of the books answer only a real browser.
- A GitHub token with write access to this repository — the same kind of
  token the Worker already uses, and the reader already knows how to publish
  with it.

There is no other cost. The books' own prices are free to read.

---

## The steps

```bash
# 1. the code
git clone https://github.com/ojeology/bryme-predictions.git
cd bryme-predictions
npm install --no-save puppeteer-core

# 2. chromium, for the two books that need a browser
sudo apt update && sudo apt install -y chromium-browser || sudo apt install -y chromium

# 3. the token, and the addresses of the books that only answer Nigeria
cat > .env <<'ENV'
GITHUB_TOKEN=ghp_your_token_here
BET22_FEED_URL=https://22bet.ng/service-api/LineFeed/GetSportsShortZip?sports=1&champs=&lng=en&tf=0&tz=0&afterDays=0&antisports=&cyberFlag=0&withCountries=false&country=0&partner=0&isPartner=false&virtualSports=false&top=false&countryOnly=false&filterSports=0&menuSection=&teams=&fcountry=0&gr=0&sportCategoriesFlag=0&groupChamps=false&minOffset=0
BET1X_FEED_URL=https://1xbet.ng/service-api/LineFeed/GetSportsShortZip?sports=1&champs=&lng=en&tf=0&tz=0&afterDays=0&antisports=&cyberFlag=0&withCountries=false&country=0&partner=0&isPartner=false&virtualSports=false&top=false&countryOnly=false&filterSports=0&menuSection=&teams=&fcountry=0&gr=0&sportCategoriesFlag=0&groupChamps=false&minOffset=0
ENV

# 4. a first run, to see what the books answer
set -a && . ./.env && set +a
node scripts/arb-read.mjs
```

The run writes one file per book into `out/`, and prints what each book
answered. If `22bet` and `1xbet` show prices, the addresses are right.

**Bet9ja** is not in the line feed: it answers only a real browser and
refuses plain requests, so it is read the way BetKing is — open the site in
the runner's Chrome and take the answers the page itself receives. That
part still needs writing; it is the one book of the three that is not
covered by a feed address.

---

## Keeping it running

```bash
# a service, so it keeps reading on its own
sudo tee /etc/systemd/system/arb-reader.service > /dev/null <<'UNIT'
[Unit]
Description=The arb reader
After=network-online.target

[Service]
Type=oneshot
WorkingDirectory=/home/arb/bryme-predictions
EnvironmentFile=/home/arb/bryme-predictions/.env
ExecStart=/usr/bin/node scripts/arb-read.mjs
User=arb

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl enable --now arb-reader.timer
```

and a timer that starts it every ten minutes:

```bash
sudo tee /etc/systemd/system/arb-reader.timer > /dev/null <<'TIMER'
[Unit]
Description=Start the arb reader every ten minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=10min
Persistent=true

[Install]
WantedBy=timers.target
TIMER

sudo systemctl daemon-reload
sudo systemctl enable --now arb-reader.timer
```

The reader publishes to the `prices` branch with the token, exactly as the
GitHub workflow does. **The Worker does not need to know that any of this
exists** — it reads the same published files either way. The GitHub runner
can keep running as well; the Worker only starts a read when the prices
are cold, and it will not start one while a read of any kind is running.

---

## What it is worth

- **22Bet and 1xBet** come straight away: one price feed each, and the
  adapter is already written and tested.
- **Bet9ja** — the biggest book in the country — needs its browser reader
  written, and its address is refused by plain requests from everywhere,
  so it only works from Nigeria as well.
- More books with the same shape: any book that uses the 22Bet family feed
  (1xBet, 22Bet, BetWinner, Onexbet, Baji and others) is read by giving it
  the same address with its own host name.

The rules stay the same wherever the reader runs: public prices only, no
account, no bet placed, nothing invented, and every price carries the time
it was really read.

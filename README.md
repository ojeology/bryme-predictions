# BRYME Predictions ⚽

> **Mobile-first sports intelligence, transparent record-keeping, and public rollover ladder prototype.**

Live Prototype hosted on GitHub Pages: **[https://ojeology.github.io/bryme-predictions/](https://ojeology.github.io/bryme-predictions/)**

---

## 🌟 Overview & Product Philosophy

Most social-media betting tipsters post booking codes and silently delete losses, presenting an artificial illusion of consistent profit. **BRYME Predictions** is built on transparent accounting:
- **Zero deleted records**: All tickets (Won, Lost, Void, Pending) are permanently logged in the public archive.
- **Zero guarantees**: Strictly no claims of "sure odds", "fixed matches", or percentage win certainty.
- **The Ladder Challenge**: A public, numbered rollover starting at ₦1,000 targeting ₦1,000,000 with daily 1.50 codes, an honest Day-6 banking milestone (50%), and a permanent loss ledger.
- **Favorite Punters Catalog**: Independent tracking of popular African sports analysts with source attribution and non-endorsement disclaimers.
- **Weekend Consensus Hub**: Fixtures grouped across punters to surface high-conviction games.
- **Pre-match Arbitrage Scanner**: `#/arbs` provides exact-market matching, NGN stake splitting, manual verification and a device-local placement ledger. No automatic betting or invented live odds.
- **Strict 18+ Compliance**: Embedded responsible-gambling resources for Nigeria (GambleAlert) and Kenya (BCLB).

---

## 📱 Tech Architecture & Portability

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Vite 6.
- **Data Layer**: Cleanly isolated JavaScript data modules in `src/data/` (`markets.js`, `tickets.js`, `ladder.js`, `punters.js`, `editorPicks.js`, `bookmakers.js`, `compliance.js`). Easily swappable for a Cloudflare Workers + D1/PostgreSQL backend in Phase 2.
- **Static Hosting**: Configured with relative base asset paths (`base: './'`) and hash-based SPA routing to run smoothly on any GitHub Pages subpath (e.g. `https://<user>.github.io/<repo>/`) or custom domain without server-side rewrite rules.

---

## 🚀 Local Development

### 1. Installation
```bash
git clone https://github.com/ojeology/bryme-predictions.git
cd bryme-predictions
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Preview opens at `http://localhost:5173`. The arbitrage scanner is at `http://localhost:5173/#/arbs`; its local API uses the same service as the Cloudflare Worker.

### 3. Test and Build for Production
```bash
npm test
npm run build
```
Generates production-optimized static assets in `dist/` and creates `404.html` for routing fallback. See **[ARB_SCANNER.md](./ARB_SCANNER.md)** for the normalized quote schema, Cloudflare feed configuration, API routes and connector limitations.

---

## 🌐 GitHub Pages Deployment Guide

### Automatic via `gh-pages` branch
1. Build the static bundle:
   ```bash
   npm run build
   ```
2. Commit and push the contents of `dist/` to the `gh-pages` branch.
3. In GitHub Repository Settings -> **Pages**, set **Source** to `Deploy from a branch` and select `gh-pages` branch, `/ (root)`.

---

## 🛡️ Responsible Gambling & Editorial Notice
Sports betting involves financial risk. You can lose your stake. Never wager money needed for living expenses. Prototype figures are realistic demonstration data.

## Live Deployment Status
- **GitHub Pages**: [https://ojeology.github.io/bryme-predictions/](https://ojeology.github.io/bryme-predictions/)
- **Workflow**: Automated GitHub Actions deployment enabled

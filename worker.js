/**
 * BRYME Predictions - Edge Worker
 * Full-Stack Cloudflare Worker serving Static Assets & Edge KV APIs
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Pin',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

function getKvBinding(env) {
  if (!env) return null;
  if (env.BRYME_KV) return env.BRYME_KV;
  if (env.bryme_kv) return env.bryme_kv;
  if (env.KV) return env.KV;
  // Automatically detect any bound KV instance
  for (const key of Object.keys(env)) {
    if (key !== 'ASSETS' && env[key] && typeof env[key].get === 'function' && typeof env[key].put === 'function') {
      return env[key];
    }
  }
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle preflight OPTIONS requests for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Route /api/* requests to Edge Handlers
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }

    // If static asset binding is available, serve the frontend SPA
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function handleApiRequest(request, env, url) {
  const path = url.pathname.replace(/\/$/, '');
  const method = request.method;
  const kv = getKvBinding(env);
  const detectedKeys = env ? Object.keys(env).filter(k => k !== 'ASSETS') : [];

  // 1. Health check
  if (path === '/api/health') {
    return jsonResponse({
      status: 'healthy',
      platform: 'Cloudflare Worker with Static Assets',
      timestamp: new Date().toISOString(),
      kvConnected: Boolean(kv),
      bindingsFound: detectedKeys
    });
  }

  // 2. Global State API (/api/state)
  if (path === '/api/state') {
    if (method === 'GET') {
      if (kv) {
        const state = await kv.get('bryme_global_state', { type: 'json' });
        if (state) {
          return jsonResponse({ success: true, source: 'cloudflare-kv', data: state });
        }
      }
      return jsonResponse({
        success: true,
        source: 'edge-default',
        message: 'No saved KV state found yet; using default platform state.'
      });
    }

    if (method === 'POST') {
      const pin = request.headers.get('X-Admin-Pin');
      if (pin !== 'bryme2026') {
        return jsonResponse({ success: false, error: 'Unauthorized: Invalid Admin PIN' }, 401);
      }
      const payload = await request.json();
      if (kv) {
        await kv.put('bryme_global_state', JSON.stringify(payload));
        return jsonResponse({
          success: true,
          message: 'Global state synced to Cloudflare KV edge successfully',
          timestamp: new Date().toISOString()
        });
      }
      return jsonResponse({
        success: true,
        warning: 'KV binding not configured yet in Cloudflare.',
        detectedBindings: detectedKeys,
        payloadReceived: true
      });
    }
  }

  // 3. Markets API (/api/markets)
  if (path === '/api/markets') {
    if (method === 'GET') {
      if (kv) {
        const markets = await kv.get('bryme_markets', { type: 'json' });
        if (markets) {
          return jsonResponse({ success: true, source: 'cloudflare-kv', markets });
        }
      }
      return jsonResponse({ success: true, source: 'edge-default', markets: [] });
    }

    if (method === 'POST') {
      const pin = request.headers.get('X-Admin-Pin');
      if (pin !== 'bryme2026') {
        return jsonResponse({ success: false, error: 'Unauthorized: Invalid Admin PIN' }, 401);
      }
      const payload = await request.json();
      if (kv) {
        await kv.put('bryme_markets', JSON.stringify(payload.markets || payload));
        return jsonResponse({ success: true, message: 'Markets updated successfully in Cloudflare KV' });
      }
      return jsonResponse({ success: true, warning: 'KV binding not found' });
    }
  }

  // 4. Ladder API (/api/ladder)
  if (path === '/api/ladder') {
    if (method === 'GET') {
      if (kv) {
        const ladder = await kv.get('bryme_ladder', { type: 'json' });
        if (ladder) {
          return jsonResponse({ success: true, data: ladder });
        }
      }
      return jsonResponse({ success: true, message: 'Default ladder active' });
    }

    if (method === 'POST') {
      const pin = request.headers.get('X-Admin-Pin');
      if (pin !== 'bryme2026') {
        return jsonResponse({ success: false, error: 'Unauthorized: Invalid Admin PIN' }, 401);
      }
      const ladderData = await request.json();
      if (kv) {
        await kv.put('bryme_ladder', JSON.stringify(ladderData));
      }
      return jsonResponse({ success: true, data: ladderData });
    }
  }

  // 5. Codes Hub API (/api/codes)
  if (path === '/api/codes') {
    if (method === 'GET') {
      if (kv) {
        const codes = await kv.get('bryme_codes', { type: 'json' });
        if (codes) {
          return jsonResponse({ success: true, data: codes });
        }
      }
      return jsonResponse({ success: true, message: 'Default catalogue active' });
    }

    if (method === 'POST') {
      const pin = request.headers.get('X-Admin-Pin');
      if (pin !== 'bryme2026') {
        return jsonResponse({ success: false, error: 'Unauthorized: Invalid Admin PIN' }, 401);
      }
      const payload = await request.json();
      if (kv) {
        await kv.put('bryme_codes', JSON.stringify(payload));
      }
      return jsonResponse({ success: true, count: payload?.length || 0 });
    }
  }

  // 6. Punters API (/api/punters)
  if (path === '/api/punters') {
    if (method === 'GET') {
      if (kv) {
        const punters = await kv.get('bryme_punters', { type: 'json' });
        if (punters) {
          return jsonResponse({ success: true, data: punters });
        }
      }
      return jsonResponse({ success: true, message: 'Default punters active' });
    }

    if (method === 'POST') {
      const pin = request.headers.get('X-Admin-Pin');
      if (pin !== 'bryme2026') {
        return jsonResponse({ success: false, error: 'Unauthorized: Invalid Admin PIN' }, 401);
      }
      const puntersData = await request.json();
      if (kv) {
        await kv.put('bryme_punters', JSON.stringify(puntersData));
      }
      return jsonResponse({ success: true, data: puntersData });
    }
  }

  // 7. Telegram Bot Auto-Ingestion & Live Admin Webhook (/api/telegram-webhook)
  if (path === '/api/telegram-webhook') {
    if (method === 'POST') {
      try {
        const update = await request.json();
        const msg = update.message || update.channel_post;
        if (!msg || (!msg.text && !msg.caption)) {
          return jsonResponse({ ok: true, ignored: 'no_text' });
        }

        const text = (msg.text || msg.caption || '').trim();
        const chatId = msg.chat?.id;
        const forwardFrom = msg.forward_from_chat?.title || msg.forward_from?.first_name || '';
        const botToken = env.TELEGRAM_BOT_TOKEN || '8443187787:AAGui3m2Kq6ck-RCQFBqVJirIs-uepWVSd8';

        // ── A. COMMAND: /start OR /help ──
        if (text.startsWith('/start') || text.startsWith('/help') || text.toLowerCase() === 'help') {
          const helpMsg = `👑 <b>BRYME Predictions Management Bot</b>\n\n` +
            `You can fully manage the Code Hub, Markets, and Rollover directly from this chat:\n\n` +
            `<b>1. 📌 ADD CODE TO HUB:</b>\n` +
            `• <code>Tall man PZ6US6 10000 odds 16 games</code>\n` +
            `• <code>Cindy Bet9ja 5WGQPQ3 200 odds</code>\n` +
            `• <code>/add sportybet TZUMDQ 365 24 games Mr banks</code>\n` +
            `<i>(Note: If you don't include number of games, it will NOT be added)</i>\n\n` +
            `<b>2. ⚽ ATTACH CODE TO MARKET:</b>\n` +
            `• <code>/market over15 sportybet Q7S287 1.54</code>\n` +
            `• <code>/market over25 sportybet TZ01SR 2694 20 games</code>\n` +
            `• <code>/market btts sportybet W6XDM5 148</code>\n` +
            `• <code>/market dc bet9ja 5WGQKM6 20</code>\n` +
            `• <code>/market corners sportybet PZ6US6 2.30</code>\n` +
            `<i>Markets: over15, over25, btts/gg, dc, 1x2, corners, dnb, multigoals</i>\n\n` +
            `<b>3. 🔄 ROLLOVER CHALLENGE:</b>\n` +
            `• <code>/rollover Day 1 1.50 Q7S288 SportyBet</code>\n` +
            `• <code>/rollover reset</code> (Resets to Day 1 with ₦1,000)\n\n` +
            `<b>4. 🗑 DELETE CODE:</b>\n` +
            `• <code>/del PZ6US6</code> (Purges code from Hub, Markets & Punters)\n\n` +
            `<b>5. 📊 LIVE OVERVIEW:</b>\n` +
            `• <code>/status</code> (Live status of Rollover, Hub & Markets)\n` +
            `• <code>/codes</code> (List 10 newest codes)`;
          if (chatId && botToken) await sendTelegramReply(botToken, chatId, helpMsg);
          return jsonResponse({ ok: true, action: 'help' });
        }

        // Fetch current KV state
        let state = null;
        if (kv) {
          state = await kv.get('bryme_global_state', { type: 'json' });
        }
        if (!state) {
          state = { codeCatalogue: [], punters: [], marketCodes: [], ladder: null };
        }
        if (!state.codeCatalogue) state.codeCatalogue = [];
        if (!state.punters) state.punters = [];
        if (!state.marketCodes) state.marketCodes = [];

        // ── B. COMMAND: /status OR /stats ──
        if (text.startsWith('/status') || text.startsWith('/stats')) {
          const l = state.ladder || {};
          const hubCount = state.codeCatalogue?.length || 0;
          const marketCount = state.marketCodes?.length || 0;
          const recent3 = (state.codeCatalogue || []).slice(0, 3).map(c => `• <code>${c.code}</code> (${c.bookmaker}) - ${c.odds || c.totalOdds}x${c.eventsCount || c.gamesCount ? ` (${c.eventsCount || c.gamesCount}G)` : ''}`).join('\n') || 'None';

          const statusMsg = `📊 <b>BRYME Predictions Live Status</b>\n\n` +
            `🔄 <b>Rollover Challenge:</b>\n` +
            `• Status: <b>${(l.status || 'Active').toUpperCase()}</b>\n` +
            `• Step: Day <b>${l.currentDay || 1}</b> / 18\n` +
            `• Balance: <b>₦${(l.currentBalance || 1000).toLocaleString()}</b>\n` +
            `• Active Code: <code>${l.todaysCode || 'None'}</code>\n\n` +
            `📌 <b>Code Hub:</b> <b>${hubCount}</b> active slips\n` +
            `<b>Latest Additions:</b>\n${recent3}\n\n` +
            `⚽ <b>Market Slips Attached:</b> <b>${marketCount}</b> slips\n\n` +
            `🌐 Live: <b>predictions.thebryme.com</b>`;
          if (chatId && botToken) await sendTelegramReply(botToken, chatId, statusMsg);
          return jsonResponse({ ok: true, action: 'status' });
        }

        // ── C. COMMAND: /codes OR /list ──
        if (text.startsWith('/codes') || text.startsWith('/list')) {
          const list = (state.codeCatalogue || []).slice(0, 8).map((c, i) => 
            `${i + 1}. <b>${c.bookmaker?.toUpperCase()}</b>: <code>${c.code}</code> (${c.odds || c.totalOdds}x)${c.eventsCount || c.gamesCount ? ` [${c.eventsCount || c.gamesCount} Games]` : ''} — <i>${c.author || c.punterName || 'Desk'}</i>`
          ).join('\n');
          const listMsg = `📌 <b>Top Live Booking Codes (Newest First):</b>\n\n${list || 'No codes active'}\n\nTo delete any code: <code>/del CODE</code>`;
          if (chatId && botToken) await sendTelegramReply(botToken, chatId, listMsg);
          return jsonResponse({ ok: true, action: 'list' });
        }

        // ── D. COMMAND: /del OR /delete <code> ──
        if (text.startsWith('/del ') || text.startsWith('/delete ') || text.startsWith('/remove ')) {
          const parts = text.split(/\s+/);
          const targetCode = parts[1]?.trim().toUpperCase();
          if (!targetCode) {
            if (chatId && botToken) await sendTelegramReply(botToken, chatId, '⚠️ Please specify a code to delete. Example: <code>/del PZ6US6</code>');
            return jsonResponse({ ok: false, error: 'no_code' });
          }

          const beforeHub = state.codeCatalogue.length;
          state.codeCatalogue = state.codeCatalogue.filter(c => c.code?.toUpperCase() !== targetCode);
          const removedFromHub = beforeHub - state.codeCatalogue.length;

          const beforeMarket = state.marketCodes.length;
          state.marketCodes = state.marketCodes.filter(c => c.code?.toUpperCase() !== targetCode);
          const removedFromMarket = beforeMarket - state.marketCodes.length;

          // Also remove from punters
          for (const p of state.punters) {
            if (p.dailyCodes) {
              p.dailyCodes = p.dailyCodes.filter(c => c.code?.toUpperCase() !== targetCode);
            }
          }

          if (kv) {
            await kv.put('bryme_global_state', JSON.stringify(state));
          }

          const replyMsg = `🗑 <b>Code Purged:</b> <code>${targetCode}</code>\n` +
            `• Removed from Code Hub: ${removedFromHub}\n` +
            `• Removed from Market Slips: ${removedFromMarket}\n\n` +
            `Updated live across predictions.thebryme.com!`;
          if (chatId && botToken) await sendTelegramReply(botToken, chatId, replyMsg);
          return jsonResponse({ ok: true, action: 'delete', code: targetCode });
        }

        // ── E. COMMAND: /rollover <day> <odds> <code> [bookie] OR /rollover reset ──
        if (text.startsWith('/rollover') || text.startsWith('/ladder')) {
          const parts = text.split(/\s+/);
          if (parts[1]?.toLowerCase() === 'reset') {
            if (!state.ladder) state.ladder = {};
            state.ladder.challengeNumber = (state.ladder.challengeNumber || 50) + 1;
            state.ladder.currentDay = 1;
            state.ladder.startingStake = 1000;
            state.ladder.currentBalance = 1000;
            state.ladder.nextPotentialBalance = 1500;
            state.ladder.status = 'pending';
            state.ladder.todaysCode = 'DROPS 11:00 AM';
            state.ladder.sportyCode = 'DROPS 11:00 AM';
            state.ladder.footballCode = 'DROPS 11:00 AM';
            state.ladder.dailyOdds = 1.50;
            state.ladder.selections = [
              {
                match: 'Day 1 Banker Double',
                league: 'European Domestic & Champions League Football',
                kickoff: 'Tomorrow 16:30 WAT',
                market: 'Double Chance & Total Goals',
                pick: 'Analysis in Progress (Drops 11:00 AM WAT)',
                odds: 1.50,
                status: 'pending'
              }
            ];
            state.ladder.daysHistory = [];

            if (kv) await kv.put('bryme_global_state', JSON.stringify(state));
            if (chatId && botToken) {
              await sendTelegramReply(botToken, chatId, `🔄 <b>Rollover Challenge Reset to Day 1!</b>\n• Challenge: #${state.ladder.challengeNumber}\n• Starting Capital: ₦1,000\n• Status: Ready for tomorrow's Day 1 drop.`);
            }
            return jsonResponse({ ok: true, action: 'rollover_reset' });
          }

          // Format: /rollover [Day] <dayNum> <odds> <code> [bookmaker]
          // e.g. /rollover Day 1 1.50 Q7S288 SportyBet
          let day = 1;
          let odds = 1.50;
          let code = '';
          let bookie = 'SportyBet';

          // Extract day
          const dayMatch = text.match(/day\s*(\d+)/i) || text.match(/\/rollover\s+(\d+)/i);
          if (dayMatch) day = parseInt(dayMatch[1], 10);

          // Extract odds
          const oddsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:odds|odd|x)?\b/);
          // Look for decimal number like 1.50 or 1.54
          const decMatch = text.match(/\b(1\.\d{2})\b/);
          if (decMatch) odds = parseFloat(decMatch[1]);

          // Extract code: 6-char alphanumeric
          const codeMatch = text.match(/\b([A-Z0-9]{6})\b/i);
          if (codeMatch && !['SPORTS', 'TICKET', 'BANKER', 'LADDER'].includes(codeMatch[1].toUpperCase())) {
            code = codeMatch[1].toUpperCase();
          }

          if (text.toLowerCase().includes('bet9ja')) bookie = 'Bet9ja';
          else if (text.toLowerCase().includes('1xbet')) bookie = '1xBet';
          else if (text.toLowerCase().includes('football.com')) bookie = 'Football.com';

          if (!state.ladder) state.ladder = {};
          state.ladder.currentDay = day;
          state.ladder.dailyOdds = odds;
          if (code) {
            state.ladder.todaysCode = code;
            state.ladder.sportyCode = code;
            state.ladder.footballCode = code;
          }
          state.ladder.bookmaker = bookie;
          state.ladder.status = 'active';
          state.ladder.currentBalance = Math.round(1000 * Math.pow(odds, day - 1));
          state.ladder.nextPotentialBalance = Math.round(state.ladder.currentBalance * odds);

          if (kv) await kv.put('bryme_global_state', JSON.stringify(state));

          const rMsg = `🚀 <b>Rollover Challenge Updated!</b>\n\n` +
            `• <b>Day:</b> ${day} / 18\n` +
            `• <b>Odds:</b> ${odds}x\n` +
            `• <b>Code:</b> <code>${code || state.ladder.todaysCode}</code> (${bookie})\n` +
            `• <b>Pot Balance:</b> ₦${state.ladder.currentBalance.toLocaleString()} ➔ Target: ₦${state.ladder.nextPotentialBalance.toLocaleString()}\n\n` +
            `Live on <b>predictions.thebryme.com</b>!`;
          if (chatId && botToken) await sendTelegramReply(botToken, chatId, rMsg);
          return jsonResponse({ ok: true, action: 'rollover_update' });
        }

        // ── F. COMMAND: /market OR market ... (ATTACH CODE TO MARKET) ──
        if (text.startsWith('/market') || text.toLowerCase().startsWith('market ')) {
          const marketResolution = parseMarketCommand(text);
          if (!marketResolution.marketId) {
            const errReply = `⚠️ Could not identify market.\nSupported markets: <code>over15</code>, <code>over25</code>, <code>btts</code>, <code>dc</code>, <code>1x2</code>, <code>corners</code>, <code>dnb</code>, <code>multigoals</code>.\n\nExample:\n<code>/market over15 sportybet Q7S287 1.54</code>`;
            if (chatId && botToken) await sendTelegramReply(botToken, chatId, errReply);
            return jsonResponse({ ok: false, error: 'unknown_market' });
          }

          const { marketId, marketName, bookmaker, code, odds, gamesCount } = marketResolution;

          if (!code) {
            if (chatId && botToken) await sendTelegramReply(botToken, chatId, `⚠️ No booking code found in market command.\nExample: <code>/market ${marketId} sportybet Q7S287 1.54</code>`);
            return jsonResponse({ ok: false, error: 'missing_code' });
          }

          // 1. Add to marketCodes
          const newMarketEntry = {
            id: `mcode-${Date.now()}-${code.toLowerCase()}`,
            marketId,
            code,
            odds,
            bookmaker: bookmaker.toLowerCase(),
            bookmakerName: bookmaker === 'footballcom' ? 'Football.com' : bookmaker === 'bet9ja' ? 'Bet9ja' : bookmaker === '1xbet' ? '1xBet' : bookmaker === 'betking' ? 'BetKing' : 'SportyBet',
            title: `${marketName} (${odds}x ${bookmaker})`,
            eventsCount: gamesCount, // ONLY SET IF USER INCLUDED IT
            status: 'active',
            dropTime: 'Live Today'
          };

          // Prepend ahead of all others
          state.marketCodes.unshift(newMarketEntry);

          // If SportyBet, also create Football.com twin in markets
          if (bookmaker.toLowerCase() === 'sportybet') {
            state.marketCodes.unshift({
              ...newMarketEntry,
              id: `mcode-${Date.now()}-${code.toLowerCase()}-fb`,
              bookmaker: 'footballcom',
              bookmakerName: 'Football.com',
              title: `${marketName} (${odds}x Football.com)`
            });
          }

          // 2. Also ensure it's in codeCatalogue at the very top
          state.codeCatalogue.unshift({
            id: `code-cat-${Date.now()}`,
            bookmaker: bookmaker.toLowerCase(),
            bookmakerName: newMarketEntry.bookmakerName,
            code,
            title: `${marketName} Verified Slip`,
            odds,
            eventsCount: gamesCount, // ONLY SET IF USER INCLUDED IT
            categoryName: marketName,
            status: 'active',
            dropTime: 'Just Now',
            author: 'BRYME Desk',
            isNew: true
          });

          if (bookmaker.toLowerCase() === 'sportybet') {
            state.codeCatalogue.unshift({
              id: `code-cat-${Date.now()}-fb`,
              bookmaker: 'footballcom',
              bookmakerName: 'Football.com',
              code,
              title: `${marketName} Verified Slip (Football.com)`,
              odds,
              eventsCount: gamesCount, // ONLY SET IF USER INCLUDED IT
              categoryName: marketName,
              status: 'active',
              dropTime: 'Just Now',
              author: 'BRYME Desk',
              isNew: true
            });
          }

          if (kv) await kv.put('bryme_global_state', JSON.stringify(state));

          const marketReply = `⚽ <b>Market Slip Attached!</b>\n\n` +
            `• <b>Market:</b> ${marketName}\n` +
            `• <b>Bookmaker:</b> ${bookmaker.toUpperCase()}\n` +
            `• <b>Code:</b> <code>${code}</code>\n` +
            `• <b>Odds:</b> ${odds}x\n` +
            (gamesCount ? `• <b>Games Count:</b> ${gamesCount} Games\n` : `• <i>(No games count specified - none added)</i>\n`) +
            `\n🌐 Live on market directory & code hub at <b>predictions.thebryme.com</b>`;
          if (chatId && botToken) await sendTelegramReply(botToken, chatId, marketReply);
          return jsonResponse({ ok: true, action: 'market_added', marketId, code });
        }

        // ── G. GENERAL / NATURAL LANGUAGE INGESTION ──
        const parsed = parseTelegramMessage(text, forwardFrom);

        if (!parsed || parsed.codes.length === 0) {
          if (chatId && botToken) {
            await sendTelegramReply(botToken, chatId, `⚠️ No valid booking codes detected.\nFormat examples:\n• <code>Tall man PZ6US6 10000 odds 16 games</code>\n• <code>Cindy Bet9ja 5WGQPQ3 200 odds</code>\n• Send <code>/help</code> for all commands.`);
          }
          return jsonResponse({ ok: true, detected: 0 });
        }

        let publishedCount = 0;
        for (const item of parsed.codes) {
          // Avoid duplicates
          const exists = state.codeCatalogue.some(c => c.code === item.code && c.bookmaker === item.bookmaker);
          if (!exists) {
            state.codeCatalogue.unshift({
              id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              code: item.code,
              bookmaker: item.bookmaker,
              bookmakerName: item.bookmaker === 'footballcom' ? 'Football.com' : item.bookmaker === 'bet9ja' ? 'Bet9ja' : item.bookmaker === '1xbet' ? '1xBet' : item.bookmaker === 'betking' ? 'BetKing' : 'SportyBet',
              title: `${item.punterName} ${item.odds}x Slip`,
              odds: item.odds || 2.00,
              totalOdds: item.odds || 2.00,
              eventsCount: item.gamesCount, // STRICT: NULL IF NOT INCLUDED
              gamesCount: item.gamesCount,  // STRICT: NULL IF NOT INCLUDED
              categoryName: item.marketCategory || 'Verified Punter Slip',
              status: 'active',
              dropTime: 'Just Now',
              author: item.punterName,
              punterName: item.punterName,
              isNew: true
            });
            publishedCount++;
          }

          // Attach to punter profile if identified
          if (item.punterId) {
            const p = state.punters.find(p => p.id === item.punterId);
            if (p) {
              if (!p.dailyCodes) p.dailyCodes = [];
              const pExists = p.dailyCodes.some(c => c.code === item.code);
              if (!pExists) {
                p.dailyCodes.unshift({
                  id: `pcode-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  bookmaker: item.bookmaker,
                  code: item.code,
                  marketType: `${item.punterName} Pick`,
                  gamesCount: item.gamesCount, // STRICT: NULL IF NOT INCLUDED
                  totalOdds: item.odds || 2.00,
                  status: 'active',
                  dropTime: 'Just Now'
                });
              }
            }
          }
        }

        if (kv) {
          await kv.put('bryme_global_state', JSON.stringify(state));
        }

        // Send confirmation back to Telegram
        if (chatId && botToken) {
          const summary = parsed.codes.map(c => 
            `• <b>${c.bookmaker.toUpperCase()}</b>: <code>${c.code}</code> (${c.odds}x)${c.gamesCount ? ` • ${c.gamesCount} Games` : ''} — <i>${c.punterName}</i>`
          ).join('\n');
          await sendTelegramReply(botToken, chatId, `✅ <b>Successfully Published to BRYME!</b>\n\n${summary}\n\n🌐 Live at the top of <b>predictions.thebryme.com</b>`);
        }

        return jsonResponse({ ok: true, published: publishedCount, items: parsed.codes });
      } catch (err) {
        return jsonResponse({ ok: false, error: err.message }, 500);
      }
    }
  }

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}

// ── TELEGRAM MESSAGE PARSER ──
function parseTelegramMessage(rawText, forwardSource = '') {
  const text = rawText || '';
  const combined = `${forwardSource} ${text}`.toLowerCase();

  // 1. Identify punter
  let punterName = 'BRYME Verified Punter';
  let punterId = null;

  if (combined.includes('banks') || combined.includes('mr banks')) {
    punterName = 'Mr banks';
    punterId = 'punter-mrbanks';
  } else if (combined.includes('tall') || combined.includes('tallman') || combined.includes('tall man')) {
    punterName = 'Tall man';
    punterId = 'punter-tallman';
  } else if (combined.includes('boss tips') || combined.includes('bosstips')) {
    punterName = 'Boss Tips';
    punterId = 'punter-bosstips';
  } else if (combined.includes('zeh') || combined.includes('dr zeh')) {
    punterName = 'Dr zeh';
    punterId = 'punter-drzeh';
  } else if (combined.includes('bossola') || combined.includes('olamilekan')) {
    punterName = 'Bossolamilekan';
    punterId = 'punter-bossolamilekan';
  } else if (combined.includes('lightbet') || combined.includes('light bet')) {
    punterName = 'Lightbet';
    punterId = 'punter-lightbet';
  } else if (combined.includes('most wanted') || combined.includes('wanted punter')) {
    punterName = 'Most wanted punter';
    punterId = 'punter-mostwanted';
  } else if (combined.includes('jayfund') || combined.includes('theonlyjayfund')) {
    punterName = 'Theonlyjayfund';
    punterId = 'punter-theonlyjayfund';
  } else if (combined.includes('bayo') || combined.includes('mr bayo')) {
    punterName = 'Mr bayo';
    punterId = 'punter-mrbayo';
  } else if (combined.includes('talented fight') || combined.includes('fight')) {
    punterName = 'Talented fight';
    punterId = 'punter-talentedfight';
  } else if (combined.includes('39billion') || combined.includes('39 billion')) {
    punterName = '39billion';
    punterId = 'punter-39billion';
  } else if (combined.includes('cindy') || combined.includes('cindymodel')) {
    punterName = 'Cindymodel';
    punterId = 'punter-cindymodel';
  } else if (combined.includes('pandev')) {
    punterName = 'Pandev punter';
    punterId = 'punter-pandev';
  }

  // 2. Identify odds
  let odds = 2.00;
  const oddsMatch = text.match(/([\d,]+(?:\.\d+)?)\s*(?:odds|odd|x)\b/i) || text.match(/@\s*([\d,]+(?:\.\d+)?)/i);
  if (oddsMatch) {
    const cleanNum = oddsMatch[1].replace(/,/g, '');
    const parsedOdds = parseFloat(cleanNum);
    if (!isNaN(parsedOdds) && parsedOdds > 1.0) {
      odds = parsedOdds;
    }
  }

  // 3. Identify number of games (STRICT RULE: ONLY IF INCLUDED BY USER)
  let gamesCount = null;
  const gamesMatch = text.match(/(\d+)\s*(?:games?|legs?|folds?|matches|selections|teams)\b/i);
  if (gamesMatch) {
    const parsedG = parseInt(gamesMatch[1], 10);
    if (!isNaN(parsedG) && parsedG > 0) {
      gamesCount = parsedG;
    }
  }

  // 4. Extract codes
  const foundCodes = [];

  // Bet9ja: starts with 5W followed by 5 alphanumeric characters (e.g. 5WGQPQ3)
  const bet9jaMatches = text.match(/\b(5W[A-Z0-9]{5})\b/gi);
  if (bet9jaMatches) {
    for (const code of bet9jaMatches) {
      foundCodes.push({
        code: code.toUpperCase(),
        bookmaker: 'bet9ja',
        punterName,
        punterId,
        odds,
        gamesCount, // null if user didn't write it
        marketCategory: 'Bet9ja Value Ticket'
      });
    }
  }

  // SportyBet / Football.com: 6 alphanumeric characters (must contain at least one number and one letter, not common words)
  const ignoredWords = new Set([
    'BET9JA', 'SPORTY', 'SPORTS', 'TICKET', 'BANKER', 'SOCCER', 'TODAY', 'BETTING', 
    'FRIDAY', 'SUNDAY', 'MONDAY', 'STREAM', 'FOLLOW', 'WINNER', 'CHANCE', 'MARKET', 
    'ONLINE', 'MOBILE', 'FOOTY', 'FOOTBALL', 'PROFIT', 'WEALTH', 'ROLLOVER', 'MONSTER',
    'JACKPOT', 'STRIKE', 'UPDATE', 'LOADED', 'BOOKING', 'CHALLENGE', 'TELEGRAM', 'TWITTER'
  ]);
  const sportyMatches = text.match(/\b([A-Z0-9]{6})\b/gi);
  if (sportyMatches) {
    for (const raw of sportyMatches) {
      const code = raw.toUpperCase();
      if (!ignoredWords.has(code) && !code.startsWith('5W') && /[0-9]/.test(code) && /[A-Z]/.test(code)) {
        // Add SportyBet slip
        foundCodes.push({
          code,
          bookmaker: 'sportybet',
          punterName,
          punterId,
          odds,
          gamesCount, // null if user didn't write it
          marketCategory: 'SportyBet Multiplier Slip'
        });
        // User rule: SportyBet & Football.com share exact same codes, create twin!
        foundCodes.push({
          code,
          bookmaker: 'footballcom',
          punterName,
          punterId,
          odds,
          gamesCount, // null if user didn't write it
          marketCategory: 'Football.com Twin Multiplier'
        });
      }
    }
  }

  // 1xBet: 5 uppercase alphanumeric
  const onexMatches = text.match(/\b([A-Z0-9]{5})\b/gi);
  if (onexMatches && combined.includes('1x')) {
    for (const raw of onexMatches) {
      const code = raw.toUpperCase();
      if (!['TODAY', 'GAMES', 'MATCH'].includes(code)) {
        foundCodes.push({
          code,
          bookmaker: '1xbet',
          punterName,
          punterId,
          odds,
          gamesCount, // null if user didn't write it
          marketCategory: '1xBet High-Multiplier Slip'
        });
      }
    }
  }

  return { punterName, punterId, codes: foundCodes };
}

// ── PARSE MARKET COMMAND ──
function parseMarketCommand(rawText) {
  const text = rawText || '';
  const lower = text.toLowerCase();

  let marketId = null;
  let marketName = null;

  if (lower.includes('over15') || lower.includes('over 1.5') || lower.includes('o15')) {
    marketId = 'over-15-goals';
    marketName = 'Over 1.5 Total Goals';
  } else if (lower.includes('over25') || lower.includes('over 2.5') || lower.includes('o25')) {
    marketId = 'over-25-goals';
    marketName = 'Over 2.5 Total Goals';
  } else if (lower.includes('btts') || lower.includes(' gg') || lower.includes('goal-goal') || lower.includes('both teams')) {
    marketId = 'both-teams-to-score';
    marketName = 'Both Teams to Score (GG)';
  } else if (lower.includes('dc') || lower.includes('double chance') || lower.includes('1x') || lower.includes('x2')) {
    marketId = 'double-chance';
    marketName = 'Double Chance (1X/X2)';
  } else if (lower.includes('1x2') || lower.includes('winner') || lower.includes('straight win') || lower.includes('match result')) {
    marketId = '1x2-match-result';
    marketName = '1X2 Match Result';
  } else if (lower.includes('corner') || lower.includes('corners')) {
    marketId = 'total-corners';
    marketName = 'Total Corners';
  } else if (lower.includes('dnb') || lower.includes('draw no bet')) {
    marketId = 'draw-no-bet';
    marketName = 'Draw No Bet';
  } else if (lower.includes('multigoal') || lower.includes('multi goals') || lower.includes('multi-goals') || lower.includes('multi')) {
    marketId = 'multigoals';
    marketName = 'Multi-Goals (2-5 Goals)';
  } else if (lower.includes('correct') || lower.includes('multiscores') || lower.includes('scores')) {
    marketId = 'correct-score';
    marketName = 'Correct Score & Multiscores';
  }

  // Bookmaker
  let bookmaker = 'sportybet';
  if (lower.includes('bet9ja')) bookmaker = 'bet9ja';
  else if (lower.includes('1xbet')) bookmaker = '1xbet';
  else if (lower.includes('football.com') || lower.includes('footballcom')) bookmaker = 'footballcom';
  else if (lower.includes('betking')) bookmaker = 'betking';
  else if (lower.includes('msport')) bookmaker = 'msport';

  // Code
  let code = '';
  const b9Match = text.match(/\b(5W[A-Z0-9]{5})\b/i);
  if (b9Match) {
    code = b9Match[1].toUpperCase();
    bookmaker = 'bet9ja';
  } else {
    const sMatch = text.match(/\b([A-Z0-9]{6})\b/i);
    const ignored = new Set(['MARKET', 'SPORTS', 'TICKET', 'BANKER', 'SOCCER', 'TODAY', 'BETTING']);
    if (sMatch && !ignored.has(sMatch[1].toUpperCase()) && /[0-9]/.test(sMatch[1]) && /[A-Z]/.test(sMatch[1])) {
      code = sMatch[1].toUpperCase();
    }
  }

  // Odds
  let odds = 2.00;
  const oddsMatch = text.match(/([\d,]+(?:\.\d+)?)\s*(?:odds|odd|x)\b/i) || text.match(/@\s*([\d,]+(?:\.\d+)?)/i);
  if (oddsMatch) {
    const clean = oddsMatch[1].replace(/,/g, '');
    const o = parseFloat(clean);
    if (!isNaN(o) && o > 1.0) odds = o;
  } else {
    const dec = text.match(/\b([1-9]\d*(?:\.\d{1,2})?)\b/g);
    if (dec && dec.length > 0) {
      const candidates = dec.map(Number).filter(n => n >= 1.1 && n !== 15 && n !== 25);
      if (candidates.length > 0) odds = candidates[candidates.length - 1];
    }
  }

  // Games count - STRICT: ONLY IF INCLUDED
  let gamesCount = null;
  const gamesMatch = text.match(/(\d+)\s*(?:games?|legs?|folds?|matches|selections)\b/i);
  if (gamesMatch) {
    const parsedG = parseInt(gamesMatch[1], 10);
    if (!isNaN(parsedG) && parsedG > 0) gamesCount = parsedG;
  }

  return { marketId, marketName, bookmaker, code, odds, gamesCount };
}

async function sendTelegramReply(botToken, chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.error('Telegram reply error:', err);
  }
}


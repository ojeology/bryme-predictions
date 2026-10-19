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
        const botToken = env.TELEGRAM_BOT_TOKEN || '8443187787:AAGui3m2Kq6ck-RCQFBqVJirIs-uepWVSd8';

        // ── FETCH STATE HELPER ──
        const getState = async () => {
          let s = null;
          if (kv) s = await kv.get('bryme_global_state', { type: 'json' });
          if (!s) s = { codeCatalogue: [], punters: [], marketCodes: [], ladder: null };
          if (!s.codeCatalogue) s.codeCatalogue = [];
          if (!s.punters) s.punters = [];
          if (!s.marketCodes) s.marketCodes = [];
          return s;
        };

        const saveState = async (s) => {
          if (kv) await kv.put('bryme_global_state', JSON.stringify(s));
        };

        const getSession = async (userId) => {
          if (kv && userId) return await kv.get(`tgsess_${userId}`, { type: 'json' });
          return null;
        };

        const saveSession = async (userId, data) => {
          if (kv && userId) await kv.put(`tgsess_${userId}`, JSON.stringify(data), { expirationTtl: 3600 });
        };

        const clearSession = async (userId) => {
          if (kv && userId) await kv.delete(`tgsess_${userId}`);
        };

        // ══════════════════════════════════════════════════════════════
        // ── 1. INLINE KEYBOARD CALLBACK QUERIES (BUTTON CLICKS) ──
        // ══════════════════════════════════════════════════════════════
        if (update.callback_query) {
          const cb = update.callback_query;
          const callbackId = cb.id;
          const chatId = cb.message?.chat?.id;
          const messageId = cb.message?.message_id;
          const userId = cb.from?.id;
          const data = cb.data || '';

          await answerTelegramCallback(botToken, callbackId);

          // 1.1 Main Menu
          if (data === 'menu_main') {
            await clearSession(userId);
            await editTelegramMessage(botToken, chatId, messageId, getMainMenuText(), getMainMenuKeyboard());
            return jsonResponse({ ok: true, action: 'main_menu' });
          }

          // 1.2 Start Code Hub Wizard
          if (data === 'wiz_hub') {
            await saveSession(userId, { flow: 'hub', step: 'bookmaker' });
            const text = `<b>➕ Add New Code (Step 1/4)</b>\n\nWhich bookmaker is this code for?`;
            await editTelegramMessage(botToken, chatId, messageId, text, getBookmakerKeyboard());
            return jsonResponse({ ok: true, action: 'wiz_hub_step1' });
          }

          // 1.3 Start Market Wizard
          if (data === 'wiz_mkt') {
            await saveSession(userId, { flow: 'market', step: 'bookmaker' });
            const text = `<b>⚽ Attach Code to Market (Step 1/5)</b>\n\nWhich bookmaker is this slip for?`;
            await editTelegramMessage(botToken, chatId, messageId, text, getBookmakerKeyboard());
            return jsonResponse({ ok: true, action: 'wiz_mkt_step1' });
          }

          // 1.4 Cancel Wizard
          if (data === 'wiz_cancel') {
            await clearSession(userId);
            await editTelegramMessage(botToken, chatId, messageId, `❌ <i>Operation cancelled.</i>\n\nTap below to start again:`, getMainMenuKeyboard());
            return jsonResponse({ ok: true, action: 'cancelled' });
          }

          // 1.5 Select Bookmaker
          if (data.startsWith('bk_')) {
            const bookie = data.replace('bk_', '');
            const session = (await getSession(userId)) || { flow: 'hub' };
            session.bookmaker = bookie;
            session.step = 'awaiting_code';
            await saveSession(userId, session);

            const bName = bookie === 'footballcom' ? 'Football.com' : bookie === 'bet9ja' ? 'Bet9ja' : bookie === '1xbet' ? '1xBet' : bookie === 'betking' ? 'BetKing' : 'SportyBet';
            const text = `<b>${session.flow === 'market' ? '⚽ Market Slip' : '➕ Code Hub'} (Step 2)</b>\n` +
              `Bookmaker: <b>${bName}</b>\n\n` +
              `👉 <b>Type & send the Booking Code now:</b>\n` +
              `<i>(e.g. <code>PZ6US6</code> or <code>5WGQPQ3</code>)</i>`;
            await editTelegramMessage(botToken, chatId, messageId, text, getCancelKeyboard());
            return jsonResponse({ ok: true, action: 'step_code' });
          }

          // 1.6 Odds Preset Selected
          if (data.startsWith('odds_')) {
            const val = parseFloat(data.replace('odds_', ''));
            const session = await getSession(userId);
            if (session) {
              session.odds = val;
              session.step = 'awaiting_games';
              await saveSession(userId, session);

              const text = `<b>Games Count (Step 4)</b>\n` +
                `Code: <code>${session.code}</code> | Odds: <b>${val}x</b>\n\n` +
                `How many matches are in this slip?\n` +
                `<i>Tap <b>Skip</b> if you do NOT want to show a game count.</i>`;
              await editTelegramMessage(botToken, chatId, messageId, text, getGamesKeyboard());
              return jsonResponse({ ok: true, action: 'step_games' });
            }
          }

          // 1.7 Games Count Selected or Skipped
          if (data.startsWith('games_')) {
            const val = data.replace('games_', '');
            const session = await getSession(userId);
            if (session) {
              session.gamesCount = val === 'skip' ? null : parseInt(val, 10);
              session.step = 'awaiting_punter';
              await saveSession(userId, session);

              const text = `<b>Select Punter / Source (Step ${session.flow === 'market' ? '4/5' : 'Final'})</b>\n` +
                `Code: <code>${session.code}</code> | Odds: <b>${session.odds}x</b>` +
                (session.gamesCount ? ` | Games: <b>${session.gamesCount}</b>\n\n` : `\n\n`) +
                `Who dropped this slip?`;
              await editTelegramMessage(botToken, chatId, messageId, text, getPuntersKeyboard());
              return jsonResponse({ ok: true, action: 'step_punter' });
            }
          }

          // 1.8 Punter Selected
          if (data.startsWith('punter_')) {
            const pKey = data.replace('punter_', '');
            const pMap = {
              'mrbanks': { name: 'Mr banks', id: 'punter-mrbanks' },
              'tallman': { name: 'Tall man', id: 'punter-tallman' },
              'bosstips': { name: 'Boss Tips', id: 'punter-bosstips' },
              'drzeh': { name: 'Dr zeh', id: 'punter-drzeh' },
              'cindymodel': { name: 'Cindymodel', id: 'punter-cindymodel' },
              '39billion': { name: '39billion', id: 'punter-39billion' },
              'lightbet': { name: 'Lightbet', id: 'punter-lightbet' },
              'mrbayo': { name: 'Mr bayo', id: 'punter-mrbayo' },
              'talentedfight': { name: 'Talented fight', id: 'punter-talentedfight' },
              'bossolamilekan': { name: 'Bossolamilekan', id: 'punter-bossolamilekan' },
              'general': { name: 'BRYME Desk', id: null }
            };
            const pObj = pMap[pKey] || { name: 'BRYME Desk', id: null };

            const session = await getSession(userId);
            if (session) {
              session.punterName = pObj.name;
              session.punterId = pObj.id;

              // If market flow, ask for market
              if (session.flow === 'market') {
                session.step = 'awaiting_market';
                await saveSession(userId, session);
                const text = `<b>⚽ Target Football Market (Step 5/5)</b>\n` +
                  `Code: <code>${session.code}</code> | By: <b>${pObj.name}</b>\n\n` +
                  `Which market does this slip belong to?`;
                await editTelegramMessage(botToken, chatId, messageId, text, getMarketsKeyboard());
                return jsonResponse({ ok: true, action: 'step_market' });
              }

              // Otherwise execute Code Hub Publish!
              const state = await getState();
              publishToState(state, session);
              await saveState(state);
              await clearSession(userId);

              const summaryText = formatPublishSuccess(session);
              await editTelegramMessage(botToken, chatId, messageId, summaryText, getSuccessKeyboard());
              return jsonResponse({ ok: true, action: 'published_hub' });
            }
          }

          // 1.9 Market Selected (Finalize Market Slip)
          if (data.startsWith('mkt_')) {
            const mKey = data.replace('mkt_', '');
            const mNames = {
              'over-15-goals': 'Over 1.5 Total Goals',
              'over-25-goals': 'Over 2.5 Total Goals',
              'both-teams-to-score': 'Both Teams to Score (GG)',
              'double-chance': 'Double Chance (1X/X2)',
              '1x2-match-result': '1X2 Match Result',
              'total-corners': 'Total Corners',
              'draw-no-bet': 'Draw No Bet',
              'multigoals': 'Multi-Goals (2-5 Goals)'
            };

            const session = await getSession(userId);
            if (session) {
              session.marketId = mKey;
              session.marketName = mNames[mKey] || 'Football Market';

              const state = await getState();
              publishToState(state, session);
              await saveState(state);
              await clearSession(userId);

              const summaryText = formatPublishSuccess(session);
              await editTelegramMessage(botToken, chatId, messageId, summaryText, getSuccessKeyboard());
              return jsonResponse({ ok: true, action: 'published_market' });
            }
          }

          // 1.10 Commands from Buttons
          if (data === 'cmd_status') {
            const state = await getState();
            const l = state.ladder || {};
            const hubCount = state.codeCatalogue?.length || 0;
            const marketCount = state.marketCodes?.length || 0;
            const recent3 = (state.codeCatalogue || []).slice(0, 3).map(c => `• <code>${c.code}</code> (${c.bookmaker}) - ${c.odds}x${c.eventsCount ? ` (${c.eventsCount}G)` : ''}`).join('\n') || 'None';

            const statusMsg = `📊 <b>BRYME Live Status</b>\n\n` +
              `🔄 <b>Rollover Challenge:</b> Day <b>${l.currentDay || 1}</b> / 18 | Code: <code>${l.todaysCode || 'None'}</code>\n` +
              `• Balance: <b>₦${(l.currentBalance || 1000).toLocaleString()}</b>\n\n` +
              `📌 <b>Code Hub:</b> <b>${hubCount}</b> active slips\n${recent3}\n\n` +
              `⚽ <b>Market Slips Attached:</b> <b>${marketCount}</b> slips\n\n` +
              `🌐 <b>predictions.thebryme.com</b>`;
            await editTelegramMessage(botToken, chatId, messageId, statusMsg, getMainMenuKeyboard());
            return jsonResponse({ ok: true, action: 'status' });
          }

          if (data === 'cmd_markets') {
            const state = await getState();
            const slips = (state.marketCodes || []).slice(0, 10).map((c, i) => 
              `${i + 1}. <b>${c.title || c.marketId}</b>\n   <code>${c.code}</code> (${c.bookmaker?.toUpperCase()}) — ${c.odds}x${c.eventsCount ? ` [${c.eventsCount} Games]` : ''}`
            ).join('\n\n');

            const mktMsg = `⚽ <b>Active Football Market Slips:</b>\n\n${slips || 'No market slips attached yet'}\n\n` +
              `• To remove any code: <code>/del CODE</code>\n` +
              `• To attach new code: Tap <b>Attach to Market</b> below:`;
            await editTelegramMessage(botToken, chatId, messageId, mktMsg, getMainMenuKeyboard());
            return jsonResponse({ ok: true, action: 'markets_list' });
          }

          if (data === 'cmd_codes') {
            const state = await getState();
            const list = (state.codeCatalogue || []).slice(0, 8).map((c, i) => 
              `${i + 1}. <b>${c.bookmaker?.toUpperCase()}</b>: <code>${c.code}</code> (${c.odds}x)${c.eventsCount ? ` [${c.eventsCount} Games]` : ''} — <i>${c.author || c.punterName || 'Desk'}</i>`
            ).join('\n');
            const listMsg = `📌 <b>Top Live Booking Codes (Newest First):</b>\n\n${list || 'No codes active'}\n\nTo delete: <code>/del CODE</code>`;
            await editTelegramMessage(botToken, chatId, messageId, listMsg, getMainMenuKeyboard());
            return jsonResponse({ ok: true, action: 'codes' });
          }

          if (data === 'help_bulk') {
            const bulkHelp = `📋 <b>Bulk Drop Mode</b>\n\n` +
              `To drop 5, 20, or 100 codes at once, just send or paste a multi-line message:\n\n` +
              `<code>PZ6US6 10000 Tall man 16 games\n5WGQPQ3 200 Cindy 12 games\nTZUMDQ 365 Mr banks 24 games\nW6XDM5 148 Mr bayo\nQ7S287 1.54 Mr banks</code>\n\n` +
              `The bot will automatically extract all codes, create Football.com twins, and publish them to the top instantly!`;
            await editTelegramMessage(botToken, chatId, messageId, bulkHelp, getMainMenuKeyboard());
            return jsonResponse({ ok: true, action: 'help_bulk' });
          }
        }

        // ══════════════════════════════════════════════════════════════
        // ── 2. TEXT MESSAGES (COMMANDS, WIZARD INPUTS & BULK DROPS) ──
        // ══════════════════════════════════════════════════════════════
        const msg = update.message || update.channel_post;
        if (!msg || (!msg.text && !msg.caption)) {
          return jsonResponse({ ok: true, ignored: 'no_text' });
        }

        const text = (msg.text || msg.caption || '').trim();
        const chatId = msg.chat?.id;
        const userId = msg.from?.id;
        const forwardFrom = msg.forward_from_chat?.title || msg.forward_from?.first_name || '';

        // Check if user is in an interactive wizard step
        const session = await getSession(userId);

        // 2.1 Handle Active Wizard Step Input
        if (session && session.step) {
          // If awaiting code:
          if (session.step === 'awaiting_code') {
            const codeCandidate = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (codeCandidate.length < 4) {
              if (chatId) await sendTelegramReply(botToken, chatId, `⚠️ That doesn't look like a valid code. Send code again (e.g. <code>PZ6US6</code>):`, getCancelKeyboard());
              return jsonResponse({ ok: false, error: 'short_code' });
            }
            session.code = codeCandidate;
            session.step = 'awaiting_odds';
            await saveSession(userId, session);

            const promptText = `<b>Total Odds (Step 3)</b>\n` +
              `Code: <code>${session.code}</code>\n\n` +
              `👉 <b>Type the total odds</b> (e.g. <code>10000</code> or <code>2.50</code>) or tap a preset:`;
            if (chatId) await sendTelegramReply(botToken, chatId, promptText, getOddsKeyboard());
            return jsonResponse({ ok: true, action: 'saved_code' });
          }

          // If awaiting odds:
          if (session.step === 'awaiting_odds') {
            const numMatch = text.match(/([\d,]+(?:\.\d+)?)/);
            let odds = 2.00;
            if (numMatch) odds = parseFloat(numMatch[1].replace(/,/g, '')) || 2.00;

            session.odds = odds;
            session.step = 'awaiting_games';
            await saveSession(userId, session);

            const promptText = `<b>Games Count (Step 4)</b>\n` +
              `Code: <code>${session.code}</code> | Odds: <b>${odds}x</b>\n\n` +
              `How many games in this ticket?\n` +
              `<i>Tap <b>Skip</b> if you do NOT want to show a game count.</i>`;
            if (chatId) await sendTelegramReply(botToken, chatId, promptText, getGamesKeyboard());
            return jsonResponse({ ok: true, action: 'saved_odds' });
          }

          // If awaiting games count:
          if (session.step === 'awaiting_games') {
            if (text.toLowerCase() === 'skip') {
              session.gamesCount = null;
            } else {
              const gNum = parseInt(text.replace(/[^0-9]/g, ''), 10);
              session.gamesCount = !isNaN(gNum) && gNum > 0 ? gNum : null;
            }
            session.step = 'awaiting_punter';
            await saveSession(userId, session);

            const promptText = `<b>Select Punter / Source (Step ${session.flow === 'market' ? '4/5' : 'Final'})</b>\n` +
              `Code: <code>${session.code}</code> | Odds: <b>${session.odds}x</b>` +
              (session.gamesCount ? ` | Games: <b>${session.gamesCount}</b>\n\n` : `\n\n`) +
              `Who dropped this slip? Tap below or type a name:`;
            if (chatId) await sendTelegramReply(botToken, chatId, promptText, getPuntersKeyboard());
            return jsonResponse({ ok: true, action: 'saved_games' });
          }
        }

        // 2.2 Menu / Start / Help
        if (text.startsWith('/start') || text.startsWith('/menu') || text.toLowerCase() === 'menu' || text.startsWith('/help')) {
          await clearSession(userId);
          if (chatId) await sendTelegramReply(botToken, chatId, getMainMenuText(), getMainMenuKeyboard());
          return jsonResponse({ ok: true, action: 'help' });
        }

        // 2.3 Status / Stats
        if (text.startsWith('/status') || text.startsWith('/stats')) {
          const state = await getState();
          const l = state.ladder || {};
          const hubCount = state.codeCatalogue?.length || 0;
          const marketCount = state.marketCodes?.length || 0;
          const recent3 = (state.codeCatalogue || []).slice(0, 3).map(c => `• <code>${c.code}</code> (${c.bookmaker}) - ${c.odds}x${c.eventsCount ? ` (${c.eventsCount}G)` : ''}`).join('\n') || 'None';

          const statusMsg = `📊 <b>BRYME Live Status</b>\n\n` +
            `🔄 <b>Rollover Challenge:</b> Day <b>${l.currentDay || 1}</b> / 18 | Code: <code>${l.todaysCode || 'None'}</code>\n` +
            `• Balance: <b>₦${(l.currentBalance || 1000).toLocaleString()}</b>\n\n` +
            `📌 <b>Code Hub:</b> <b>${hubCount}</b> active slips\n${recent3}\n\n` +
            `⚽ <b>Market Slips Attached:</b> <b>${marketCount}</b> slips\n\n` +
            `🌐 <b>predictions.thebryme.com</b>`;
          if (chatId) await sendTelegramReply(botToken, chatId, statusMsg, getMainMenuKeyboard());
          return jsonResponse({ ok: true, action: 'status' });
        }

        // 2.4 List Codes
        if (text.startsWith('/codes') || text.startsWith('/list')) {
          const state = await getState();
          const list = (state.codeCatalogue || []).slice(0, 8).map((c, i) => 
            `${i + 1}. <b>${c.bookmaker?.toUpperCase()}</b>: <code>${c.code}</code> (${c.odds}x)${c.eventsCount ? ` [${c.eventsCount} Games]` : ''} — <i>${c.author || c.punterName || 'Desk'}</i>`
          ).join('\n');
          const listMsg = `📌 <b>Top Live Booking Codes (Newest First):</b>\n\n${list || 'No codes active'}\n\nTo delete: <code>/del CODE</code>`;
          if (chatId) await sendTelegramReply(botToken, chatId, listMsg, getMainMenuKeyboard());
          return jsonResponse({ ok: true, action: 'codes' });
        }

        // 2.5 Delete Code (/del, /delete, /remove)
        if (text.startsWith('/del ') || text.startsWith('/delete ') || text.startsWith('/remove ')) {
          const targetCode = text.split(/\s+/)[1]?.trim().toUpperCase();
          if (!targetCode) {
            if (chatId) await sendTelegramReply(botToken, chatId, '⚠️ Please specify code: <code>/del PZ6US6</code>');
            return jsonResponse({ ok: false, error: 'no_code' });
          }

          const state = await getState();
          const beforeHub = state.codeCatalogue.length;
          state.codeCatalogue = state.codeCatalogue.filter(c => c.code?.toUpperCase() !== targetCode);
          state.marketCodes = state.marketCodes.filter(c => c.code?.toUpperCase() !== targetCode);
          for (const p of state.punters) {
            if (p.dailyCodes) p.dailyCodes = p.dailyCodes.filter(c => c.code?.toUpperCase() !== targetCode);
          }
          await saveState(state);

          const replyMsg = `🗑 <b>Code Purged:</b> <code>${targetCode}</code>\nRemoved from Code Hub, Market Slips & Punters!`;
          if (chatId) await sendTelegramReply(botToken, chatId, replyMsg, getMainMenuKeyboard());
          return jsonResponse({ ok: true, action: 'deleted', code: targetCode });
        }

        // 2.6 Rollover Command (/rollover, /ladder)
        if (text.startsWith('/rollover') || text.startsWith('/ladder')) {
          const state = await getState();
          if (text.includes('reset')) {
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
                league: 'European Top-Flight Competitions',
                kickoff: 'Tomorrow 16:30 WAT',
                market: 'Double Chance & Total Goals',
                pick: 'Analysis in Progress (Drops 11:00 AM WAT)',
                odds: 1.50,
                status: 'pending'
              }
            ];
            state.ladder.daysHistory = [];

            await saveState(state);
            if (chatId) await sendTelegramReply(botToken, chatId, `🔄 <b>Rollover Reset to Day 1!</b>\nStarting Capital: ₦1,000 | Challenge #${state.ladder.challengeNumber}`, getMainMenuKeyboard());
            return jsonResponse({ ok: true, action: 'rollover_reset' });
          }

          let day = 1;
          let odds = 1.50;
          let code = '';
          let bookie = 'SportyBet';

          const dayMatch = text.match(/day\s*(\d+)/i) || text.match(/\/rollover\s+(\d+)/i);
          if (dayMatch) day = parseInt(dayMatch[1], 10);

          const decMatch = text.match(/\b(1\.\d{2})\b/);
          if (decMatch) odds = parseFloat(decMatch[1]);

          const codeMatch = text.match(/\b([A-Z0-9]{6})\b/i);
          if (codeMatch && !['SPORTS', 'TICKET', 'BANKER', 'LADDER'].includes(codeMatch[1].toUpperCase())) {
            code = codeMatch[1].toUpperCase();
          }

          if (text.toLowerCase().includes('bet9ja')) bookie = 'Bet9ja';
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

          await saveState(state);
          const rMsg = `🚀 <b>Rollover Challenge Updated!</b>\nDay ${day} @ ${odds}x | Code: <code>${code || state.ladder.todaysCode}</code> (${bookie})`;
          if (chatId) await sendTelegramReply(botToken, chatId, rMsg, getMainMenuKeyboard());
          return jsonResponse({ ok: true, action: 'rollover_updated' });
        }

        // 2.7 Market Command (/market)
        if (text.startsWith('/market') || text.toLowerCase().startsWith('market ')) {
          const res = parseMarketCommand(text);
          if (!res.marketId || !res.code) {
            const errReply = `⚠️ Format: <code>/market over15 sportybet Q7S287 1.54</code>\n(Markets: over15, over25, btts, dc, 1x2, corners, dnb, multigoals)`;
            if (chatId) await sendTelegramReply(botToken, chatId, errReply, getMainMenuKeyboard());
            return jsonResponse({ ok: false, error: 'invalid_market_cmd' });
          }

          const state = await getState();
          publishToState(state, {
            flow: 'market',
            marketId: res.marketId,
            marketName: res.marketName,
            bookmaker: res.bookmaker,
            code: res.code,
            odds: res.odds,
            gamesCount: res.gamesCount,
            punterName: 'BRYME Desk'
          });
          await saveState(state);

          const rMsg = `⚽ <b>Market Slip Attached!</b>\n\n` +
            `• <b>Market:</b> ${res.marketName}\n` +
            `• <b>Code:</b> <code>${res.code}</code> (${res.bookmaker.toUpperCase()})\n` +
            `• <b>Odds:</b> ${res.odds}x\n` +
            (res.gamesCount ? `• <b>Games Count:</b> ${res.gamesCount} Games\n` : `• <i>(No games count specified - none added)</i>\n`) +
            `\n🌐 Live on market directory & code hub!`;
          if (chatId) await sendTelegramReply(botToken, chatId, rMsg, getSuccessKeyboard());
          return jsonResponse({ ok: true, action: 'market_added' });
        }

        // 2.8 Bulk Multi-Line Ingestion Or Single Drop
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        const state = await getState();
        let totalPublished = 0;
        const publishedItems = [];

        for (const line of lines) {
          const parsed = parseTelegramMessage(line, forwardFrom);
          if (parsed && parsed.codes.length > 0) {
            for (const item of parsed.codes) {
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
                totalPublished++;
                publishedItems.push(item);
              }

              // Punter profile
              if (item.punterId) {
                const p = state.punters.find(p => p.id === item.punterId);
                if (p) {
                  if (!p.dailyCodes) p.dailyCodes = [];
                  if (!p.dailyCodes.some(c => c.code === item.code)) {
                    p.dailyCodes.unshift({
                      id: `pcode-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                      bookmaker: item.bookmaker,
                      code: item.code,
                      marketType: `${item.punterName} Pick`,
                      gamesCount: item.gamesCount,
                      totalOdds: item.odds || 2.00,
                      status: 'active',
                      dropTime: 'Just Now'
                    });
                  }
                }
              }
            }
          }
        }

        if (totalPublished > 0) {
          await saveState(state);
          const summary = publishedItems.map(c => 
            `• <b>${c.bookmaker.toUpperCase()}</b>: <code>${c.code}</code> (${c.odds}x)${c.gamesCount ? ` • ${c.gamesCount} Games` : ''} — <i>${c.punterName}</i>`
          ).join('\n');
          const reply = `✅ <b>Published ${totalPublished} Slips to BRYME!</b>\n\n${summary}\n\n🌐 Live at the top of <b>predictions.thebryme.com</b>`;
          if (chatId) await sendTelegramReply(botToken, chatId, reply, getSuccessKeyboard());
          return jsonResponse({ ok: true, published: totalPublished });
        }

        // If no code detected at all
        if (chatId) {
          await sendTelegramReply(botToken, chatId, `⚠️ No booking code found in your message.\nTap below to add a code step-by-step:`, getMainMenuKeyboard());
        }
        return jsonResponse({ ok: true, detected: 0 });

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
    const ignored = new Set(['MARKET', 'OVER15', 'OVER25', 'SPORTS', 'TICKET', 'BANKER', 'SOCCER', 'TODAY', 'BETTING']);
    const allMatches = text.match(/\b([A-Z0-9]{6})\b/gi) || [];
    for (const m of allMatches) {
      const up = m.toUpperCase();
      if (!ignored.has(up) && /[0-9]/.test(up) && /[A-Z]/.test(up)) {
        code = up;
        break;
      }
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

// ── TELEGRAM API & UI HELPERS ──
function getMainMenuText() {
  return `👑 <b>BRYME Code & Market Control Center</b>\n\n` +
    `Tap any button below to manage codes, attach to markets, or drop slips in bulk:`;
}

function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '➕ Add Code to Hub', callback_data: 'wiz_hub' },
        { text: '⚽ Attach to Market', callback_data: 'wiz_mkt' }
      ],
      [
        { text: '⚽ View Market Slips', callback_data: 'cmd_markets' },
        { text: '📌 View Top Codes', callback_data: 'cmd_codes' }
      ],
      [
        { text: '📋 Bulk Drop Mode', callback_data: 'help_bulk' },
        { text: '📊 Live Status', callback_data: 'cmd_status' }
      ]
    ]
  };
}

function getBookmakerKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🔴 SportyBet (+Football.com)', callback_data: 'bk_sportybet' },
        { text: '🟢 Football.com', callback_data: 'bk_footballcom' }
      ],
      [
        { text: '🟡 Bet9ja', callback_data: 'bk_bet9ja' },
        { text: '🔵 1xBet', callback_data: 'bk_1xbet' }
      ],
      [
        { text: '👑 BetKing', callback_data: 'bk_betking' },
        { text: '⚡ MSport', callback_data: 'bk_msport' }
      ],
      [
        { text: '❌ Cancel', callback_data: 'wiz_cancel' }
      ]
    ]
  };
}

function getOddsKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '1.50x', callback_data: 'odds_1.50' },
        { text: '2.00x', callback_data: 'odds_2.00' },
        { text: '3.50x', callback_data: 'odds_3.50' }
      ],
      [
        { text: '5.00x', callback_data: 'odds_5.00' },
        { text: '10.0x', callback_data: 'odds_10.0' },
        { text: '50.0x', callback_data: 'odds_50.0' }
      ],
      [
        { text: '100x', callback_data: 'odds_100.0' },
        { text: '1000x', callback_data: 'odds_1000.0' },
        { text: '10000x', callback_data: 'odds_10000.0' }
      ],
      [
        { text: '❌ Cancel', callback_data: 'wiz_cancel' }
      ]
    ]
  };
}

function getGamesKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '2 Games', callback_data: 'games_2' },
        { text: '3 Games', callback_data: 'games_3' },
        { text: '4 Games', callback_data: 'games_4' }
      ],
      [
        { text: '6 Games', callback_data: 'games_6' },
        { text: '8 Games', callback_data: 'games_8' },
        { text: '10 Games', callback_data: 'games_10' }
      ],
      [
        { text: '12 Games', callback_data: 'games_12' },
        { text: '16 Games', callback_data: 'games_16' },
        { text: '20 Games', callback_data: 'games_20' }
      ],
      [
        { text: '⏭️ Skip (No Game Count)', callback_data: 'games_skip' }
      ],
      [
        { text: '❌ Cancel', callback_data: 'wiz_cancel' }
      ]
    ]
  };
}

function getPuntersKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: 'Mr banks 📌', callback_data: 'punter_mrbanks' },
        { text: 'Tall man', callback_data: 'punter_tallman' }
      ],
      [
        { text: 'Boss Tips', callback_data: 'punter_bosstips' },
        { text: 'Dr zeh', callback_data: 'punter_drzeh' }
      ],
      [
        { text: 'Cindymodel', callback_data: 'punter_cindymodel' },
        { text: '39billion', callback_data: 'punter_39billion' }
      ],
      [
        { text: 'Lightbet', callback_data: 'punter_lightbet' },
        { text: 'Mr bayo', callback_data: 'punter_mrbayo' }
      ],
      [
        { text: 'Talented fight', callback_data: 'punter_talentedfight' },
        { text: 'Bossolamilekan', callback_data: 'punter_bossolamilekan' }
      ],
      [
        { text: '🏢 BRYME General Desk', callback_data: 'punter_general' }
      ],
      [
        { text: '❌ Cancel', callback_data: 'wiz_cancel' }
      ]
    ]
  };
}

function getMarketsKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '⚽ Over 1.5 Goals', callback_data: 'mkt_over-15-goals' },
        { text: '⚽ Over 2.5 Goals', callback_data: 'mkt_over-25-goals' }
      ],
      [
        { text: '🎯 Both Teams to Score (GG)', callback_data: 'mkt_both-teams-to-score' },
        { text: '🛡️ Double Chance (1X/X2)', callback_data: 'mkt_double-chance' }
      ],
      [
        { text: '🏆 Match Winner (1X2)', callback_data: 'mkt_1x2-match-result' },
        { text: '🚩 Total Corners', callback_data: 'mkt_total-corners' }
      ],
      [
        { text: '⚖️ Draw No Bet', callback_data: 'mkt_draw-no-bet' },
        { text: '⚡ Multi-Goals (2-5 Goals)', callback_data: 'mkt_multigoals' }
      ],
      [
        { text: '❌ Cancel', callback_data: 'wiz_cancel' }
      ]
    ]
  };
}

function getSuccessKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '➕ Add Another Code', callback_data: 'wiz_hub' },
        { text: '⚽ Attach Another Market', callback_data: 'wiz_mkt' }
      ],
      [
        { text: '📊 View Status', callback_data: 'cmd_status' },
        { text: '🏠 Main Menu', callback_data: 'menu_main' }
      ]
    ]
  };
}

function getCancelKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '❌ Cancel', callback_data: 'wiz_cancel' }
      ]
    ]
  };
}

function publishToState(state, session) {
  const code = session.code.toUpperCase();
  const bookmaker = session.bookmaker.toLowerCase();
  const odds = session.odds || 2.00;
  const gamesCount = session.gamesCount || null;
  const pName = session.punterName || 'BRYME Desk';
  const pId = session.punterId || null;

  // 1. Add to Code Hub at the top (unshift)
  state.codeCatalogue.unshift({
    id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    code,
    bookmaker,
    bookmakerName: bookmaker === 'footballcom' ? 'Football.com' : bookmaker === 'bet9ja' ? 'Bet9ja' : bookmaker === '1xbet' ? '1xBet' : bookmaker === 'betking' ? 'BetKing' : 'SportyBet',
    title: `${pName} ${odds}x Slip`,
    odds,
    totalOdds: odds,
    eventsCount: gamesCount, // STRICT: ONLY IF INCLUDED
    gamesCount: gamesCount,  // STRICT: ONLY IF INCLUDED
    categoryName: session.marketName || 'Verified Punter Slip',
    status: 'active',
    dropTime: 'Just Now',
    author: pName,
    punterName: pName,
    isNew: true
  });

  // If SportyBet, auto duplicate to Football.com
  if (bookmaker === 'sportybet') {
    state.codeCatalogue.unshift({
      id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-fb`,
      code,
      bookmaker: 'footballcom',
      bookmakerName: 'Football.com',
      title: `${pName} ${odds}x Slip (Football.com)`,
      odds,
      totalOdds: odds,
      eventsCount: gamesCount,
      gamesCount: gamesCount,
      categoryName: session.marketName || 'Football.com Twin',
      status: 'active',
      dropTime: 'Just Now',
      author: pName,
      punterName: pName,
      isNew: true
    });
  }

  // 2. If market flow, add to marketCodes
  if (session.marketId) {
    state.marketCodes.unshift({
      id: `mcode-${Date.now()}-${code.toLowerCase()}`,
      marketId: session.marketId,
      code,
      odds,
      bookmaker,
      bookmakerName: bookmaker === 'footballcom' ? 'Football.com' : bookmaker === 'bet9ja' ? 'Bet9ja' : bookmaker === '1xbet' ? '1xBet' : 'SportyBet',
      title: `${session.marketName} (${odds}x ${bookmaker.toUpperCase()})`,
      eventsCount: gamesCount,
      status: 'active',
      dropTime: 'Just Now'
    });

    if (bookmaker === 'sportybet') {
      state.marketCodes.unshift({
        id: `mcode-${Date.now()}-${code.toLowerCase()}-fb`,
        marketId: session.marketId,
        code,
        odds,
        bookmaker: 'footballcom',
        bookmakerName: 'Football.com',
        title: `${session.marketName} (${odds}x Football.com)`,
        eventsCount: gamesCount,
        status: 'active',
        dropTime: 'Just Now'
      });
    }
  }

  // 3. Attach to punter profile
  if (pId) {
    const p = state.punters.find(p => p.id === pId);
    if (p) {
      if (!p.dailyCodes) p.dailyCodes = [];
      p.dailyCodes.unshift({
        id: `pcode-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        bookmaker,
        code,
        marketType: `${pName} Pick`,
        gamesCount,
        totalOdds: odds,
        status: 'active',
        dropTime: 'Just Now'
      });
      if (bookmaker === 'sportybet') {
        p.dailyCodes.unshift({
          id: `pcode-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-fb`,
          bookmaker: 'footballcom',
          code,
          marketType: `${pName} Pick (Football.com)`,
          gamesCount,
          totalOdds: odds,
          status: 'active',
          dropTime: 'Just Now'
        });
      }
    }
  }
}

function formatPublishSuccess(session) {
  const bUpper = session.bookmaker.toUpperCase();
  const twinNotice = session.bookmaker === 'sportybet' ? ` (+ Football.com twin)` : '';
  const gamesNotice = session.gamesCount ? `• <b>Games Count:</b> ${session.gamesCount} Games\n` : `• <i>(No games count specified - none added)</i>\n`;
  const marketNotice = session.marketName ? `• <b>Market:</b> ${session.marketName}\n` : '';

  return `✅ <b>Successfully Published to BRYME!</b>\n\n` +
    `• <b>Bookmaker:</b> ${bUpper}${twinNotice}\n` +
    `• <b>Code:</b> <code>${session.code}</code>\n` +
    `• <b>Odds:</b> ${session.odds}x\n` +
    gamesNotice +
    `• <b>Punter:</b> ${session.punterName || 'BRYME Desk'}\n` +
    marketNotice +
    `\n🌐 Live at the top of <b>predictions.thebryme.com</b>`;
}

async function sendTelegramReply(botToken, chatId, text, replyMarkup = null) {
  try {
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML'
    };
    if (replyMarkup) body.reply_markup = replyMarkup;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Telegram reply error:', err);
  }
}

async function editTelegramMessage(botToken, chatId, messageId, text, replyMarkup = null) {
  try {
    const body = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML'
    };
    if (replyMarkup) body.reply_markup = replyMarkup;

    await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Telegram editMessageText error:', err);
  }
}

async function answerTelegramCallback(botToken, callbackQueryId, text = '') {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text
      })
    });
  } catch (err) {
    console.error('Telegram answerCallbackQuery error:', err);
  }
}


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

  // 7. Telegram Bot Auto-Ingestion Webhook (/api/telegram-webhook)
  if (path === '/api/telegram-webhook') {
    if (method === 'POST') {
      try {
        const update = await request.json();
        const msg = update.message || update.channel_post;
        if (!msg || (!msg.text && !msg.caption)) {
          return jsonResponse({ ok: true, ignored: 'no_text' });
        }

        const text = msg.text || msg.caption || '';
        const chatId = msg.chat?.id;
        const forwardFrom = msg.forward_from_chat?.title || msg.forward_from?.first_name || '';

        const parsed = parseTelegramMessage(text, forwardFrom);

        const botToken = env.TELEGRAM_BOT_TOKEN || '8443187787:AAGui3m2Kq6ck-RCQFBqVJirIs-uepWVSd8';

        if (!parsed || parsed.codes.length === 0) {
          if (chatId && botToken) {
            await sendTelegramReply(botToken, chatId, `⚠️ No valid booking codes detected in this message.\nFormat examples: "SportyBet PZ6US6 10000 odds" or "Bet9ja 5WGQPQ3"`);
          }
          return jsonResponse({ ok: true, detected: 0 });
        }

        // Push new codes to KV at the very top (newest first)
        let publishedCount = 0;
        if (kv) {
          // 1. Fetch current global state or default
          let state = await kv.get('bryme_global_state', { type: 'json' });
          if (!state) {
            state = { codeCatalogue: [], punters: [] };
          }

          if (!state.codeCatalogue) state.codeCatalogue = [];
          if (!state.punters) state.punters = [];

          for (const item of parsed.codes) {
            // Avoid duplicates
            const exists = state.codeCatalogue.some(c => c.code === item.code && c.bookmaker === item.bookmaker);
            if (!exists) {
              // Prepend to top
              state.codeCatalogue.unshift({
                id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                code: item.code,
                bookmaker: item.bookmaker,
                marketCategory: item.marketCategory || 'Punter Value Slip',
                totalOdds: item.odds || 2.00,
                gamesCount: item.gamesCount || 4,
                status: 'active',
                dropTime: 'Just Now',
                punterName: item.punterName,
                isNew: true
              });
              publishedCount++;
            }

            // Also attach to punter profile if identified
            if (item.punterId) {
              const p = state.punters.find(p => p.id === item.punterId);
              if (p) {
                if (!p.dailyCodes) p.dailyCodes = [];
                const pExists = p.dailyCodes.some(c => c.code === item.code);
                if (!pExists) {
                  p.dailyCodes.unshift({
                    id: `pcode-auto-${Date.now()}`,
                    bookmaker: item.bookmaker,
                    code: item.code,
                    marketType: `${item.punterName} Auto Slip (${item.odds || '2.0'}x)`,
                    gamesCount: item.gamesCount || 4,
                    totalOdds: item.odds || 2.00,
                    status: 'active',
                    dropTime: 'Just Now'
                  });
                }
              }
            }
          }

          await kv.put('bryme_global_state', JSON.stringify(state));
        }

        // Send confirmation back to Telegram
        if (chatId && botToken) {
          const summary = parsed.codes.map(c => `• <b>${c.bookmaker.toUpperCase()}</b>: <code>${c.code}</code> (${c.odds}x) — <i>${c.punterName}</i>`).join('\n');
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

  // 3. Extract codes
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
          marketCategory: 'SportyBet Multiplier Slip'
        });
        // User rule: SportyBet & Football.com share exact same codes, create twin!
        foundCodes.push({
          code,
          bookmaker: 'footballcom',
          punterName,
          punterId,
          odds,
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
          marketCategory: '1xBet High-Multiplier Slip'
        });
      }
    }
  }

  return { punterName, punterId, codes: foundCodes };
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


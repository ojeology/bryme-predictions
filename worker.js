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

  return jsonResponse({ error: 'Endpoint not found' }, 404);
}

/**
 * GROUND ZERO — Match Behaviour Intelligence Edge Worker
 * Serves SPA Static Assets & Cloudflare KV Edge Endpoints (/api/health, /api/machine, /api/state)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Pin',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function getKvBinding(env) {
  if (!env) return null;
  if (env.BRYME_KV) return env.BRYME_KV;
  if (env.bryme_kv) return env.bryme_kv;
  if (env.KV) return env.KV;
  for (const key of Object.keys(env)) {
    if (key !== 'ASSETS' && env[key] && typeof env[key].get === 'function' && typeof env[key].put === 'function') {
      return env[key];
    }
  }
  return null;
}

const DEFAULT_GROUND_ZERO_SUMMARY = {
  version: 'ground-zero-v7',
  title: 'GROUND ZERO — Match Behaviour Intelligence Lab',
  ladder: {
    steps: 4,
    progression: [1000, 3036, 9108, 27324, 81972],
    targetOddsPerStep: '3.00x Pure OVER',
  },
  counts: {
    clubs: 307,
    leagues: 22,
    weekendMatches: 120,
    referees: 197,
    gradedUefaLedger: 54,
  },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response('Not Found', { status: 404 });
  },
};

async function handleApiRequest(request, env, url) {
  const path = url.pathname.replace(/\/$/, '');
  const method = request.method;
  const kv = getKvBinding(env);
  const detectedKeys = env ? Object.keys(env).filter((k) => k !== 'ASSETS') : [];

  if (path === '/api/health') {
    return jsonResponse({
      status: 'healthy',
      version: 'ground-zero-v7',
      platform: 'Ground Zero Edge Worker',
      timestamp: new Date().toISOString(),
      kvConnected: Boolean(kv),
      bindingsFound: detectedKeys,
    });
  }

  if (path === '/api/machine' || path === '/api/groundzero' || path === '/api/state') {
    const kvKey = path === '/api/state' ? 'bryme_global_state' : 'bryme_behaviour_machine';
    if (method === 'GET') {
      if (kv) {
        const stored = await kv.get(kvKey, { type: 'json' });
        if (stored) {
          return jsonResponse({ success: true, source: 'cloudflare-kv', data: stored });
        }
      }
      return jsonResponse({ success: true, source: 'edge-default', data: DEFAULT_GROUND_ZERO_SUMMARY });
    }

    if (method === 'POST') {
      const pin = request.headers.get('X-Admin-Pin');
      if (pin !== 'bryme2026') {
        return jsonResponse({ success: false, error: 'Unauthorized: Invalid Admin PIN' }, 401);
      }
      const payload = await request.json();
      if (kv) {
        await kv.put(kvKey, JSON.stringify(payload));
      }
      return jsonResponse({
        success: true,
        key: kvKey,
        version: 'ground-zero-v7',
        timestamp: new Date().toISOString(),
      });
    }
  }

  return jsonResponse({ success: true, version: 'ground-zero-v7' });
}

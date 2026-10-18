// Cloudflare Edge Worker & Pages Router
// Handles /api/ endpoints with Cloudflare KV persistence, falls back to static assets for all other routes.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Pin',
  'Content-Type': 'application/json'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({
        status: 'online',
        service: 'BRYME Predictions Cloudflare Edge',
        timestamp: new Date().toISOString(),
        kvConnected: !!env.BRYME_KV
      }), { status: 200, headers: corsHeaders });
    }

    // 3. Global Platform State (/api/state)
    if (url.pathname === '/api/state') {
      if (request.method === 'GET') {
        try {
          if (env.BRYME_KV) {
            const data = await env.BRYME_KV.get('bryme_global_state', { type: 'json' });
            if (data) {
              return new Response(JSON.stringify({ success: true, source: 'cloudflare-kv', data }), {
                status: 200,
                headers: corsHeaders
              });
            }
          }
          return new Response(JSON.stringify({
            success: true,
            source: 'edge-default',
            message: 'Edge API online. Ready for KV binding.'
          }), { status: 200, headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: corsHeaders
          });
        }
      }

      if (request.method === 'POST') {
        try {
          const pin = request.headers.get('X-Admin-Pin');
          if (pin !== 'bryme2026') {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Admin PIN' }), {
              status: 401,
              headers: corsHeaders
            });
          }

          const payload = await request.json();
          if (env.BRYME_KV) {
            await env.BRYME_KV.put('bryme_global_state', JSON.stringify(payload));
            return new Response(JSON.stringify({
              success: true,
              message: 'State successfully synced to Cloudflare KV Edge',
              timestamp: new Date().toISOString()
            }), { status: 200, headers: corsHeaders });
          }

          return new Response(JSON.stringify({
            success: true,
            warning: 'BRYME_KV binding pending in Cloudflare dashboard.',
            payloadReceived: true
          }), { status: 200, headers: corsHeaders });
        } catch (err) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: corsHeaders
          });
        }
      }
    }

    // 4. Default: Serve static frontend asset (index.html, assets, favicon, etc.)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  }
};

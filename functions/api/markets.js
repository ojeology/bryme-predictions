// Cloudflare Pages Function: /api/markets
// Reads and writes markets data to Cloudflare KV

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Pin',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
  const { env } = context;

  try {
    if (env.BRYME_KV) {
      const markets = await env.BRYME_KV.get('bryme_markets', { type: 'json' });
      if (markets) {
        return new Response(JSON.stringify({ success: true, source: 'cloudflare-kv', markets }), {
          status: 200,
          headers: corsHeaders
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      source: 'edge-default',
      markets: []
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const adminPin = request.headers.get('X-Admin-Pin');
    if (adminPin !== 'bryme2026') {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Invalid Admin PIN' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const payload = await request.json();

    if (env.BRYME_KV) {
      await env.BRYME_KV.put('bryme_markets', JSON.stringify(payload.markets || payload));
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Markets updated successfully in Cloudflare KV' 
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      warning: 'BRYME_KV binding not found' 
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

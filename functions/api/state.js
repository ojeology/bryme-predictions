// Cloudflare Pages Function: /api/state
// Reads and writes the global platform state to Cloudflare KV or D1

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
    // 1. Try to read from Cloudflare KV if bound
    if (env.BRYME_KV) {
      const data = await env.BRYME_KV.get('bryme_global_state', { type: 'json' });
      if (data) {
        return new Response(JSON.stringify({ success: true, source: 'cloudflare-kv', data }), {
          status: 200,
          headers: corsHeaders
        });
      }
    }

    // 2. Return fallback response indicating ready for KV binding
    return new Response(JSON.stringify({
      success: true,
      source: 'default-edge',
      message: 'Cloudflare Pages edge function running. Ready for KV/D1 binding.'
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
      await env.BRYME_KV.put('bryme_global_state', JSON.stringify(payload));
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Platform state synced to Cloudflare KV edge successfully',
        timestamp: new Date().toISOString() 
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // If KV not yet bound
    return new Response(JSON.stringify({ 
      success: true, 
      warning: 'BRYME_KV binding not found. Please bind a KV namespace named BRYME_KV in Cloudflare Pages settings.',
      payloadReceived: true
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

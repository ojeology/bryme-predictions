const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
      const codes = await env.BRYME_KV.get('bryme_codes', { type: 'json' });
      if (codes) {
        return new Response(JSON.stringify({ success: true, data: codes }), {
          status: 200,
          headers: corsHeaders
        });
      }
    }
    return new Response(JSON.stringify({ success: true, message: 'Default catalogue active' }), {
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
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    const payload = await request.json();
    if (env.BRYME_KV) {
      await env.BRYME_KV.put('bryme_codes', JSON.stringify(payload));
    }

    return new Response(JSON.stringify({ success: true, count: payload?.length || 0 }), {
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

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
      const ladder = await env.BRYME_KV.get('bryme_ladder', { type: 'json' });
      if (ladder) {
        return new Response(JSON.stringify({ success: true, data: ladder }), {
          status: 200,
          headers: corsHeaders
        });
      }
    }
    return new Response(JSON.stringify({ success: true, message: 'Default ladder active' }), {
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

    const ladderData = await request.json();
    if (env.BRYME_KV) {
      await env.BRYME_KV.put('bryme_ladder', JSON.stringify(ladderData));
    }

    return new Response(JSON.stringify({ success: true, data: ladderData }), {
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

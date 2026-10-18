export async function onRequestGet(context) {
  const { env } = context;

  const detectedKeys = env ? Object.keys(env).filter(k => k !== 'ASSETS') : [];
  let isKvBound = Boolean(env && (env.BRYME_KV || env.bryme_kv || env.KV));
  if (!isKvBound && env) {
    for (const key of Object.keys(env)) {
      if (key !== 'ASSETS' && env[key] && typeof env[key].get === 'function' && typeof env[key].put === 'function') {
        isKvBound = true;
        break;
      }
    }
  }

  return new Response(JSON.stringify({
    status: 'healthy',
    service: 'BRYME Predictions Edge API',
    platform: 'Cloudflare Pages Functions',
    timestamp: new Date().toISOString(),
    kvConnected: isKvBound,
    bindingsFound: detectedKeys
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

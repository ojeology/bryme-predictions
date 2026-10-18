export async function onRequestGet(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    status: 'online',
    service: 'BRYME Predictions Edge API',
    platform: 'Cloudflare Pages Functions',
    timestamp: new Date().toISOString(),
    kvConnected: !!env.BRYME_KV
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

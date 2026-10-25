import { handleArbRequest } from './arb/service.js';
import { dispatchReader } from './arb/connectors/snapshot.js';

/**
 * BRYME ARB SCANNER — Edge Worker
 * ================================
 * Two jobs only:
 *   1. serve the arbitrage scanner API (/api/arbs*) which reads the bookmaker
 *      feeds the operator configured and does the matching;
 *   2. serve the site, with fresh (no-store) HTML so a phone never shows a
 *      stale layout.
 *
 * The old match-behaviour machine, its KV state and its API routes are gone.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Content-Type': 'application/json',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

export default {
  /**
   * The clock on the Worker starts the free reader.
   *
   * GitHub's own schedule is not always run, and the prices cannot be left
   * to go cold while it is not.  Every thirteen minutes the reader is
   * started, so the prices on the phone are never more than a quarter of an
   * hour old.
   */
  async scheduled(event, env, ctx) {
    const started = dispatchReader(env);
    ctx.waitUntil(started.then((result) => {
      console.log(`reader: ${result.dispatched ? 'started' : 'not started'} (${result.error || 'ok'})`);
    }));
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    // the arbitrage scanner API — the feed URLs live in the Worker env only
    const arbResponse = await handleArbRequest(request, env);
    if (arbResponse) return arbResponse;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === '/api/health') {
      return jsonResponse({
        status: 'healthy',
        service: 'BRYME Arb Scanner',
        platform: 'Cloudflare Worker',
        timestamp: new Date().toISOString(),
      });
    }

    if (env.ASSETS) {
      const assetRes = await env.ASSETS.fetch(request);
      const contentType = assetRes.headers.get('content-type') || '';
      if (contentType.includes('text/html') || url.pathname === '/' || url.pathname === '/index.html') {
        const headers = new Headers(assetRes.headers);
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        return new Response(assetRes.body, {
          status: assetRes.status,
          statusText: assetRes.statusText,
          headers,
        });
      }
      return assetRes;
    }

    return new Response('Not Found', { status: 404 });
  },
};

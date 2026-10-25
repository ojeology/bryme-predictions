import { loadEnv } from 'vite';
import { handleArbRequest } from './service.js';

function middleware(getEnv) {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/arbs')) return next();
    try {
      const chunks = [];
      let size = 0;
      if (!['GET', 'HEAD'].includes(req.method)) {
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 512_000) {
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: 'Request body exceeds the 512 KB limit.' }));
            return;
          }
          chunks.push(chunk);
        }
      }
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
      const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host || 'localhost'}`;
      const body = chunks.length ? Buffer.concat(chunks) : undefined;
      const request = new Request(new URL(req.url, origin), {
        method: req.method,
        headers,
        ...(body ? { body } : {}),
      });
      const response = await handleArbRequest(request, getEnv());
      if (!response) return next();
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false, error: error?.message || 'Local scanner API failed.' }));
    }
  };
}

/** Use the production Web Request service in both Vite dev and preview servers. */
export function arbApiPlugin() {
  let env = {};
  const attach = (server) => server.middlewares.use(middleware(() => env));
  return {
    name: 'bryme-arb-api',
    configResolved(config) {
      env = { ...process.env, ...loadEnv(config.mode, config.root, '') };
    },
    configureServer(server) { attach(server); },
    configurePreviewServer(server) { attach(server); },
  };
}

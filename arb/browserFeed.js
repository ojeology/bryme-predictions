/**
 * Reading a book through a real browser.
 *
 * Three of the books we work with do not answer a plain request: one puts a
 * bot check in front of its web API, one has a dead price origin, and one
 * only answers traffic from inside its own country. A real browser, opened
 * on the server inside that country, is what a person would use - and it is
 * allowed to ask the book the same questions the page asks.
 *
 * The browser is only ever used to look at the public prices of a book. It
 * never logs in, never solves a check, never places a bet.
 *
 * What it does:
 *   1. opens the book's own page,
 *   2. listens to what the page itself asks for (fetch, XHR, websocket),
 *   3. keeps the answers that look like prices.
 *
 * The answers come back in the book's own JSON shape, so the same adapters
 * that read a direct feed read these too.
 */
import puppeteer from '@cloudflare/puppeteer';

const WAIT_MS = 9000;

/** The page the book opens on. */
const BOOK_PAGES = {
  '22bet': 'https://22bet.ng/en/',
  '1xbet': 'https://1xbet.ng/en/',
  nairabet: 'https://nairabet.com/sports',
  msport: 'https://www.msport.com/ng/web/sports/list/Soccer',
  bet9ja: 'https://bet9ja.com/',
};

/** Only these hosts may be opened. */
const PAGE_HOSTS = [
  '22bet.ng', '1xbet.ng', 'nairabet.com', 'msport.com', 'bet9ja.com',
  'livescorebet.com', 'sportybet.com',
];

export function pageAllowed(address) {
  try {
    const host = new URL(address).hostname;
    return PAGE_HOSTS.some((allowed) => host === allowed || host.endsWith('.' + allowed));
  } catch {
    return false;
  }
}

/**
 * The hook is installed before any of the book's own code runs, so nothing
 * is missed. It only records what the page asks for and what it gets back.
 */
const HOOK = `
  (() => {
    window.__arb = { urls: [], payloads: [], sockets: [] };
    const plainHeaders = (value) => {
      try {
        if (!value) return {};
        if (typeof value.forEach === 'function' && typeof value.get === 'function') {
          const out = {};
          value.forEach((v, k) => { out[k] = v; });
          return out;
        }
        if (typeof value === 'object') return Object.assign({}, value);
      } catch (e) {}
      return {};
    };
    const record = (url, body, method, requestBody, headers) => {
      try { window.__arb.urls.push(String(url).slice(0, 400)); } catch (e) {}
      try {
        window.__arb.requests = window.__arb.requests || [];
        window.__arb.requests.push({ url: String(url).slice(0, 400), method: String(method || 'GET'), body: requestBody === undefined || requestBody === null ? '' : String(requestBody).slice(0, 4000), headers: plainHeaders(headers) });
      } catch (e) {}
      if (body !== undefined && body !== null) {
        try { window.__arb.payloads.push({ url: String(url).slice(0, 400), body: String(body).slice(0, 2000000) }); }
        catch (e) {}
      }
    };
    const nativeFetch = window.fetch;
    window.fetch = async function (input, init) {
      try {
        const url = typeof input === 'string' ? input : (input && input.url);
        const method = (init && init.method) || (input && input.method) || 'GET';
        let requestBody = init && init.body !== undefined ? init.body : (input && input.body);
        if (requestBody && typeof requestBody !== 'string') { try { requestBody = JSON.stringify(requestBody); } catch (e) { requestBody = ''; } }
        const requestHeaders = init && init.headers !== undefined ? init.headers : (input && input.headers);
        const response = await nativeFetch.apply(this, arguments);
        try {
          const clone = response.clone();
          const reader = clone.body && clone.body.getReader ? clone.body.getReader() : null;
          if (!reader) {
            record(url, await clone.text(), method, requestBody, requestHeaders);
          } else {
            // Some books answer with a stream that never closes. Read it for a
            // while, then take what we got.
            const decoder = new TextDecoder();
            let text = '';
            const stopAt = Date.now() + 6000;
            while (Date.now() < stopAt) {
              const next = await Promise.race([
                reader.read(),
                new Promise((resolve) => setTimeout(() => resolve({ done: true, timeout: true }), 600)),
              ]);
              if (next.timeout) break;
              if (next.done) break;
              text += decoder.decode(next.value, { stream: true });
              if (text.length > 4000000) break;
            }
            record(url, text, method, requestBody, requestHeaders);
          }
        } catch (e) {}
        return response;
      } catch (e) {
        throw e;
      }
    };
    const nativeOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      try { this.__arbUrl = String(url); window.__arb.urls.push(String(url).slice(0, 400)); this.__arbMethod = String(method || 'GET'); } catch (e) {}
      return nativeOpen.apply(this, arguments);
    };
    const nativeSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (name, value) {
      try {
        this.__arbHeaders = this.__arbHeaders || {};
        this.__arbHeaders[String(name)] = String(value);
      } catch (e) {}
      return nativeSetRequestHeader.apply(this, arguments);
    };
    const nativeSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
      const self = this;
      let requestBody = body;
      if (requestBody && typeof requestBody !== 'string') { try { requestBody = JSON.stringify(requestBody); } catch (e) { requestBody = ''; } }
      this.addEventListener('load', function () {
        try {
          if (self.responseType === '' || self.responseType === 'text') record(self.__arbUrl, self.responseText, self.__arbMethod || 'GET', requestBody, self.__arbHeaders);
        } catch (e) {}
      });
      return nativeSend.apply(this, arguments);
    };
    const NativeWebSocket = window.WebSocket;
    window.WebSocket = function (url, protocols) {
      try { window.__arb.sockets.push(String(url).slice(0, 400)); } catch (e) {}
      const socket = protocols === undefined ? new NativeWebSocket(url) : new NativeWebSocket(url, protocols);
      socket.addEventListener('message', function (event) {
        try { window.__arb.payloads.push({ url: String(url).slice(0, 400), body: String(event.data).slice(0, 2000000) }); } catch (e) {}
      });
      return socket;
    };
    window.WebSocket.prototype = NativeWebSocket.prototype;
  })();
`;

/** Does this answer look like prices? */
function looksLikePrices(body) {
  const text = String(body || '');
  if (text.length < 200) return false;
  if (!/^\s*[[{]/.test(text)) return false;
  return /odds|price|outcome|selection|market|event|Sports|Competitions|linefeed/i.test(text);
}

/** Try the price calls the page itself makes, from inside the page. */
const IN_PAGE_PROBES = `
  (async function (tries) {
    const out = [];
    for (const item of tries) {
      try {
        const response = await fetch(item.url, {
          method: item.method || 'POST',
          body: item.body || undefined,
          headers: item.headers || { 'Content-Type': 'application/json' },
        });
        const text = await response.text();
        const entry = { url: item.url, status: response.status, length: text.length, head: text.slice(0, 700) };
        if (item.full && text.length <= 2500000) entry.body = text;
        out.push(entry);
      } catch (error) {
        out.push({ url: item.url, error: String(error && error.message || error) });
      }
    }
    return out;
  })
`;

/**
 * Open the book in a browser and collect the prices its own page receives.
 *
 * @returns {Promise<{ok: boolean, note: string, urls: string[], payloads: Array}>}
 */
export async function captureBookViaBrowser(env, bookId, { waitMs = WAIT_MS, probe = null, pageUrl: asked = null, pages: extraPages = [] } = {}) {
  const firstPage = asked && pageAllowed(asked) ? asked : BOOK_PAGES[bookId];
  const pageUrl = firstPage;
  if (!pageUrl) return { ok: false, note: 'no page known for this book', urls: [], payloads: [] };
  const wanted = [pageUrl, ...(extraPages || []).filter((entry) => pageAllowed(entry))];
  if (!env?.browser) return { ok: false, note: 'this deployment has no browser available', urls: [], payloads: [] };

  let browser = null;
  try {
    browser = await puppeteer.launch(env.browser);
    const page = await browser.newPage();
    await page.setViewport({ width: 412, height: 900 });
    try {
      await page.evaluateOnNewDocument(HOOK);
    } catch {
      await page.evaluate(HOOK);
    }
    const everyPayload = [];
    const everyUrl = [];
    const everyText = [];
    const everyRequests = [];
    for (const target of wanted) {
      await page.goto(target, { waitUntil: 'domcontentloaded', timeout: waitMs + 8000 }).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      const piece = await page.evaluate(() => ({
        urls: window.__arb?.urls || [],
        payloads: (window.__arb?.payloads || []).filter((entry) => {
          try { return String(entry.body || '').length > 200; } catch (e) { return false; }
        }),
        title: document.title,
        url: location.href,
        text: (document.body?.innerText || '').slice(0, 800),
      })).catch(() => ({ urls: [], payloads: [], title: '', url: '', text: '' }));
      everyUrl.push(...(piece.urls || []));
      everyPayload.push(...(piece.payloads || []));
      const pieceRequests = await page.evaluate(() => (window.__arb?.requests || []).slice(0, 200)).catch(() => []);
      everyRequests.push(...pieceRequests);
      everyText.push(`${piece.url} :: ${(piece.text || '').slice(0, 200)}`);
    }
    let probeResult = null;
    if (probe) {
      // The probe code runs inside the page, so it must not lean on anything
      // from this side. It is installed as a plain function on the page and
      // then called with the list of addresses to try.
      await page.evaluate(`window.__arbProbe = ${IN_PAGE_PROBES}; true`).catch(() => {});
      probeResult = await page
        .evaluate(`window.__arbProbe(${JSON.stringify(probe)})`)
        .catch((error) => [{ error: `the in-page probe failed: ${error?.message || error}` }]);
    }
    const captured = {
      urls: everyUrl,
      payloads: everyPayload,
      requests: everyRequests,
      sockets: [],
      title: '',
      url: '',
      text: everyText.join(' || '),
    };

    const all = (captured.payloads || []).map((entry) => ({
      url: entry.url,
      length: String(entry.body || '').length,
      head: String(entry.body || '').slice(0, 260),
    }));
    const payloads = (captured.payloads || []).filter((entry) => looksLikePrices(entry.body));
    return {
      ok: payloads.length > 0,
      note: payloads.length
        ? `the page asked for ${new Set(captured.urls || []).size} addresses and ${payloads.length} of them carried prices`
        : `the page loaded (${captured.title || 'no title'}) but carried no prices`,
      urls: [...new Set([...(captured.urls || []), ...(captured.sockets || [])])].slice(0, 60),
      requests: captured.requests || [],
      payloads: payloads.slice(0, 6),
      allPayloads: all.slice(0, 40),
      pageText: captured.text || '',
      pageUrl: captured.url || '',
      pageTitle: captured.title || '',
      probe: probeResult,
    };
  } catch (error) {
    return { ok: false, note: `the browser could not open the book: ${error?.message || error}`, urls: [], payloads: [] };
  } finally {
    try { await browser?.close(); } catch { /* the session may already be gone */ }
  }
}

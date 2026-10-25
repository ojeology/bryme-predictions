/**
 * Extra headers a book's own API asks for.
 *
 * Some gateways want a request id on every call. It is a plain client header
 * - the same one the book's own website sends - and it carries no secret.
 */

export function feedHeaders(url = '') {
  const host = String(url).toLowerCase();
  if (host.includes('gateway-ng.livescorebet.com')) {
    return { 'Request-Id': crypto.randomUUID() };
  }
  return {};
}

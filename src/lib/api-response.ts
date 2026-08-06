/** Shared response helper for the public /api/v1/* endpoints — plain JSON,
 * CORS-open (this is public, read-only vault content; no cookies or
 * credentials involved, so allowing any origin is safe), with rate-limit
 * bookkeeping headers attached when available. */

export const PUBLIC_API_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function apiJson(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...PUBLIC_API_CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export function rateLimitedResponse(retryAfterSeconds: number): Response {
  return apiJson(
    { error: 'Rate limit exceeded. Try again shortly.' },
    429,
    { 'Retry-After': String(retryAfterSeconds) },
  );
}

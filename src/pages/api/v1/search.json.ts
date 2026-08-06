import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { checkRateLimit } from '../../../lib/rate-limit';
import { apiJson, rateLimitedResponse } from '../../../lib/api-response';

export const prerender = false;

// Title/summary/tag substring matching, NOT a Pagefind wrapper — Pagefind's
// index is built post-build for browser consumption (see package.json's
// `postbuild` script) and isn't reliably queryable from inside a Vercel
// serverless function at request time. This is the fallback the expansion
// plan explicitly allows for Phase 5: good enough for "find notes about X"
// from an external tool, not a full-text body search.
function matchScore(query: string, text: string): number {
  if (!text) return -1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const idx = t.indexOf(q);
  if (idx === -1) return -1;
  return (idx === 0 ? 1000 : 500 - idx) - text.length * 0.1;
}

const MAX_RESULTS = 20;

export const GET: APIRoute = async (context) => {
  const rl = checkRateLimit(context.clientAddress);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSeconds);

  const url = new URL(context.request.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  if (!q) return apiJson({ error: 'Missing required query parameter "q".' }, 400);

  const [languages, terms, knowledge] = await Promise.all([
    getCollection('languages'),
    getCollection('terms'),
    getCollection('knowledge'),
  ]);

  const notes = [
    ...languages
      .filter((l) => !l.data.isMoc)
      .map((l) => ({ route: `/languages/${l.data.slug}`, title: l.data.title, summary: l.data.summary, tags: l.data.tags })),
    ...terms
      .filter((t) => !t.data.isMoc)
      .map((t) => ({ route: `/terms/${t.data.domainSlug}/${t.data.slug}`, title: t.data.title, summary: t.data.summary, tags: t.data.tags })),
    ...knowledge
      .filter((k) => !k.data.isMoc)
      .map((k) => ({ route: `/${k.data.domainSlug}/${k.data.slug}`, title: k.data.title, summary: k.data.summary, tags: k.data.tags })),
  ];

  const results = notes
    .map((n) => {
      const tagScore = Math.max(-1, ...n.tags.map((tag) => matchScore(q, tag)));
      const score = Math.max(matchScore(q, n.title), matchScore(q, n.summary ?? ''), tagScore);
      return { ...n, score };
    })
    .filter((n) => n.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ score: _score, ...rest }) => rest);

  return apiJson(
    { query: q, count: results.length, results },
    200,
    { 'X-RateLimit-Remaining': String(rl.remaining) },
  );
};

export const OPTIONS: APIRoute = async () => apiJson(null, 204);

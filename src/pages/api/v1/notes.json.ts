import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { checkRateLimit } from '../../../lib/rate-limit';
import { apiJson, rateLimitedResponse } from '../../../lib/api-response';

// Server-rendered on demand (not prerendered like the site's other *.json.ts
// endpoints) specifically so checkRateLimit() below has a real per-request
// hook to run on — a purely static file has no server-side code path at all.
export const prerender = false;

export const GET: APIRoute = async (context) => {
  const rl = checkRateLimit(context.clientAddress);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSeconds);

  const [languages, terms, knowledge] = await Promise.all([
    getCollection('languages'),
    getCollection('terms'),
    getCollection('knowledge'),
  ]);

  const notes = [
    ...languages
      .filter((l) => !l.data.isMoc)
      .map((l) => ({
        route: `/languages/${l.data.slug}`,
        title: l.data.title,
        collection: 'languages' as const,
        category: l.data.category,
        tags: l.data.tags,
        summary: l.data.summary,
      })),
    ...terms
      .filter((t) => !t.data.isMoc)
      .map((t) => ({
        route: `/terms/${t.data.domainSlug}/${t.data.slug}`,
        title: t.data.title,
        collection: 'terms' as const,
        domain: t.data.domain,
        tags: t.data.tags,
        summary: t.data.summary,
      })),
    ...knowledge
      .filter((k) => !k.data.isMoc)
      .map((k) => ({
        route: `/${k.data.domainSlug}/${k.data.slug}`,
        title: k.data.title,
        collection: 'knowledge' as const,
        domain: k.data.domain,
        tags: k.data.tags,
        summary: k.data.summary,
      })),
  ];

  return apiJson(
    {
      count: notes.length,
      notes,
    },
    200,
    { 'X-RateLimit-Remaining': String(rl.remaining) },
  );
};

export const OPTIONS: APIRoute = async () => apiJson(null, 204);

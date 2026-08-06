import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { apiJson, rateLimitedResponse } from '../../../../lib/api-response';

export const prerender = false;

// URL shape mirrors the site's own public routes so a consumer can predict
// the API URL directly from a page URL they already have:
//   /languages/python        -> /api/v1/notes/languages/python.json
//   /terms/full-stack/rest-api -> /api/v1/notes/terms/full-stack/rest-api.json
//   /physics/entropy         -> /api/v1/notes/physics/entropy.json
// The standalone knowledge domains (Founders and Executives, Finance and
// Economics, Physics, Chemistry, Electrical and Electronics Engineering)
// live at the URL root with no fixed prefix segment, same as on the site
// itself, so they're matched last against whatever two-part path remains.
export const GET: APIRoute = async (context) => {
  const rl = checkRateLimit(context.clientAddress);
  if (rl.limited) return rateLimitedResponse(rl.retryAfterSeconds);

  const parts = (context.params.route ?? '').split('/').filter(Boolean);

  let publicRoute: string | null = null;
  let collection: 'languages' | 'terms' | 'knowledge' | null = null;
  let entryData: {
    title: string;
    domain: string;
    category?: string;
    tags: string[];
    summary?: string;
    body?: string;
  } | null = null;

  if (parts[0] === 'languages' && parts.length === 2) {
    const languages = await getCollection('languages');
    const entry = languages.find((l) => l.data.slug === parts[1] && !l.data.isMoc);
    if (entry) {
      collection = 'languages';
      publicRoute = `/languages/${entry.data.slug}`;
      entryData = { title: entry.data.title, domain: entry.data.domain, category: entry.data.category, tags: entry.data.tags, summary: entry.data.summary, body: entry.body };
    }
  } else if (parts[0] === 'terms' && parts.length === 3) {
    const terms = await getCollection('terms');
    const entry = terms.find((t) => t.data.domainSlug === parts[1] && t.data.slug === parts[2] && !t.data.isMoc);
    if (entry) {
      collection = 'terms';
      publicRoute = `/terms/${entry.data.domainSlug}/${entry.data.slug}`;
      entryData = { title: entry.data.title, domain: entry.data.domain, tags: entry.data.tags, summary: entry.data.summary, body: entry.body };
    }
  } else if (parts.length === 2) {
    const knowledge = await getCollection('knowledge');
    const entry = knowledge.find((k) => k.data.domainSlug === parts[0] && k.data.slug === parts[1] && !k.data.isMoc);
    if (entry) {
      collection = 'knowledge';
      publicRoute = `/${entry.data.domainSlug}/${entry.data.slug}`;
      entryData = { title: entry.data.title, domain: entry.data.domain, tags: entry.data.tags, summary: entry.data.summary, body: entry.body };
    }
  }

  if (!entryData || !publicRoute || !collection) {
    return apiJson({ error: 'Note not found.' }, 404);
  }

  return apiJson(
    {
      route: publicRoute,
      title: entryData.title,
      collection,
      domain: entryData.domain,
      category: entryData.category,
      tags: entryData.tags,
      summary: entryData.summary,
      // Wikilinks already resolved to real routes; this is the note's raw
      // markdown, not the rendered HTML the site itself displays.
      markdown: entryData.body ?? '',
    },
    200,
    { 'X-RateLimit-Remaining': String(rl.remaining) },
  );
};

export const OPTIONS: APIRoute = async () => apiJson(null, 204);

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const [languages, terms] = await Promise.all([getCollection('languages'), getCollection('terms')]);

  const entries = [
    ...languages
      .filter((l) => !l.data.isMoc && l.data.summary)
      .map((l) => ({ route: `/languages/${l.data.slug}`, title: l.data.title, summary: l.data.summary! })),
    ...terms
      .filter((t) => !t.data.isMoc && t.data.summary)
      .map((t) => ({
        route: `/terms/${t.data.domainSlug}/${t.data.slug}`,
        title: t.data.title,
        summary: t.data.summary!,
      })),
  ];

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};

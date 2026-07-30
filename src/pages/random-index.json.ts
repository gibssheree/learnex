import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const [languages, terms] = await Promise.all([getCollection('languages'), getCollection('terms')]);

  const entries = [
    ...languages
      .filter((l) => !l.data.isMoc)
      .map((l) => ({ title: l.data.title, url: `/languages/${l.data.slug}` })),
    ...terms
      .filter((t) => !t.data.isMoc)
      .map((t) => ({ title: t.data.title, url: `/terms/${t.data.domainSlug}/${t.data.slug}` })),
  ];

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};

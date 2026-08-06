import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

interface RawNote {
  route: string;
  title: string;
  summary?: string;
  links: string[];
}

export const GET: APIRoute = async () => {
  const [languages, terms] = await Promise.all([getCollection('languages'), getCollection('terms')]);

  const allNotes: RawNote[] = [
    ...languages
      .filter((l) => !l.data.isMoc)
      .map((l) => ({ route: `/languages/${l.data.slug}`, title: l.data.title, summary: l.data.summary, links: l.data.links })),
    ...terms
      .filter((t) => !t.data.isMoc)
      .map((t) => ({
        route: `/terms/${t.data.domainSlug}/${t.data.slug}`,
        title: t.data.title,
        summary: t.data.summary,
        links: t.data.links,
      })),
  ];

  // Title lookup built from every note (not just flashcard-eligible ones) —
  // a valid "read this first" pointer doesn't need its own flashcard.
  const titleByRoute = new Map(allNotes.map((n) => [n.route, n.title]));
  const MAX_RELATED = 3;

  const entries = allNotes
    .filter((n) => n.summary)
    .map((n) => ({
      route: n.route,
      title: n.title,
      summary: n.summary!,
      // Notes this one links OUT to (not backlinks) — the concepts this
      // note itself assumes, not just notes that happen to mention it.
      // Used by /review's "read this first" nudge (see review/index.astro)
      // when a card keeps coming back graded "again".
      related: n.links
        .filter((route) => route !== n.route && titleByRoute.has(route))
        .slice(0, MAX_RELATED)
        .map((route) => ({ route, title: titleByRoute.get(route)! })),
    }));

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  });
};

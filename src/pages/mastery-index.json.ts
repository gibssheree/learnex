import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { LANGUAGE_CATEGORY_ORDER, LANGUAGE_CATEGORY_LABELS } from '../lib/domainGroups';

// Feeds /progress (Mastery Map) and Sidebar.astro's mastery badges. The
// group/note structure (who belongs to which category or domain) is build-time
// data, same as every other page here — only the SRS review state driving the
// actual percentages lives in the browser (localStorage), so that half is
// computed client-side in src/lib/mastery.ts against this JSON.
export const GET: APIRoute = async () => {
  const [languages, terms] = await Promise.all([getCollection('languages'), getCollection('terms')]);

  const languageNotes = languages.filter((l) => !l.data.isMoc);
  const termNotes = terms.filter((t) => !t.data.isMoc);

  const languageGroups = LANGUAGE_CATEGORY_ORDER.map((key) => ({
    key,
    label: LANGUAGE_CATEGORY_LABELS[key] ?? key,
    kind: 'language-category' as const,
    notes: languageNotes
      .filter((n) => (n.data.category ?? '') === key)
      .map((n) => ({ route: `/languages/${n.data.slug}`, title: n.data.title, known: n.data.status === 'known' })),
  })).filter((g) => g.notes.length > 0);

  const domainByName = new Map<string, { domainSlug: string; notes: { route: string; title: string }[] }>();
  for (const t of termNotes) {
    if (!domainByName.has(t.data.domain)) domainByName.set(t.data.domain, { domainSlug: t.data.domainSlug, notes: [] });
    domainByName.get(t.data.domain)!.notes.push({ route: `/terms/${t.data.domainSlug}/${t.data.slug}`, title: t.data.title });
  }
  const termGroups = [...domainByName.entries()].map(([domain, { domainSlug, notes }]) => ({
    key: domainSlug,
    label: domain,
    kind: 'term-domain' as const,
    notes,
  }));

  return new Response(JSON.stringify({ languageGroups, termGroups }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

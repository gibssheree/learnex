import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { DOMAIN_GROUPS } from '../lib/domainGroups';

const GROUP_BY_DOMAIN = new Map<string, string>();
for (const group of DOMAIN_GROUPS) {
  for (const domain of group.domains) GROUP_BY_DOMAIN.set(domain, group.title);
}

export const GET: APIRoute = async () => {
  const [languages, terms] = await Promise.all([getCollection('languages'), getCollection('terms')]);

  const languageNotes = languages.filter((l) => !l.data.isMoc);
  const termNotes = terms.filter((t) => !t.data.isMoc);

  const nodes = [
    ...languageNotes.map((l) => ({
      id: `/languages/${l.data.slug}`,
      title: l.data.title,
      group: 'Programming Languages',
    })),
    ...termNotes.map((t) => ({
      id: `/terms/${t.data.domainSlug}/${t.data.slug}`,
      title: t.data.title,
      group: GROUP_BY_DOMAIN.get(t.data.domain) ?? 'Specialized Domains',
    })),
  ];

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edgeSet = new Set<string>();
  const edges: { source: string; target: string }[] = [];

  function addEdges(entries: (typeof languageNotes)[number][], toId: (e: (typeof languageNotes)[number]) => string) {
    for (const entry of entries) {
      const source = toId(entry);
      for (const target of entry.data.links) {
        if (!nodeIds.has(target) || target === source) continue;
        const key = [source, target].sort().join('~');
        if (edgeSet.has(key)) continue;
        edgeSet.add(key);
        edges.push({ source, target });
      }
    }
  }

  addEdges(languageNotes, (l) => `/languages/${l.data.slug}`);
  addEdges(termNotes, (t) => `/terms/${t.data.domainSlug}/${t.data.slug}`);

  return new Response(JSON.stringify({ nodes, edges }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

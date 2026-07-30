import { getCollection, type CollectionEntry } from 'astro:content';
import { routeFor, type LinkTarget } from './vault';

export interface BacklinkEntry {
  title: string;
  route: string;
}

function routeForEntry(entry: CollectionEntry<'languages'> | CollectionEntry<'terms'>, collection: 'languages' | 'terms'): string {
  const target: LinkTarget = {
    collection,
    domainSlug: entry.data.domainSlug,
    slug: entry.data.slug,
    title: entry.data.title,
  };
  return routeFor(target);
}

let cache: Map<string, BacklinkEntry[]> | null = null;

/** Inverts every note's outgoing [[wikilink]] routes (captured at ingestion time
 * in `data.links`) into a route -> "who links here" index. Computed once per
 * build/dev process and memoized, since every note page needs a lookup into it. */
export async function getBacklinkIndex(): Promise<Map<string, BacklinkEntry[]>> {
  if (cache) return cache;

  const [languages, terms] = await Promise.all([getCollection('languages'), getCollection('terms')]);
  const index = new Map<string, BacklinkEntry[]>();

  function addEntry(entry: CollectionEntry<'languages'> | CollectionEntry<'terms'>, collection: 'languages' | 'terms') {
    const route = routeForEntry(entry, collection);
    for (const link of entry.data.links) {
      if (link === route) continue;
      if (!index.has(link)) index.set(link, []);
      index.get(link)!.push({ title: entry.data.title, route });
    }
  }

  for (const e of languages) addEntry(e, 'languages');
  for (const e of terms) addEntry(e, 'terms');

  for (const list of index.values()) {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }

  cache = index;
  return index;
}

export async function getBacklinksFor(route: string): Promise<BacklinkEntry[]> {
  const index = await getBacklinkIndex();
  return index.get(route) ?? [];
}

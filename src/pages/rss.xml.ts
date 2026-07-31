import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { listVaultFiles, readNote, extractSummary, routeFor, lastModified, type LinkTarget } from '../lib/vault';

// No real domain has been chosen yet (still deciding on hosting) — this is a
// placeholder so the feed's item links and self-reference are well-formed
// absolute URLs. Update once Learnex has an actual home.
const SITE_URL = 'https://learnex.example.com';

const MAX_ITEMS = 50;

export const GET: APIRoute = async () => {
  const { languages, terms } = listVaultFiles();

  const items = [...languages, ...terms]
    .filter((file) => !file.isMoc)
    .map((file) => {
      const collection: LinkTarget['collection'] = languages.includes(file) ? 'languages' : 'terms';
      const { body } = readNote(file);
      return {
        title: file.title,
        link: routeFor({ collection, domainSlug: file.domainSlug, slug: file.slug, title: file.title }),
        description: extractSummary(body) ?? '',
        pubDate: lastModified(file.absPath),
      };
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, MAX_ITEMS);

  return rss({
    title: 'Learnex',
    description: 'An illustrated archive of programming languages and computer-science knowledge.',
    site: SITE_URL,
    items,
  });
};

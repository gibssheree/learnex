import type { Loader, LoaderContext } from 'astro/loaders';
import {
  LANGUAGES_DIR,
  TERMS_DIR,
  buildLinkMap,
  clearVaultCache,
  extractSummary,
  isVaultMarkdownPath,
  listVaultFiles,
  readNote,
  resolveWikilinks,
  type VaultFile,
} from '../lib/vault';

interface VaultLoaderOptions {
  collection: 'languages' | 'terms';
}

/** Full re-ingestion of one collection: re-walks the vault, rebuilds the
 * vault-wide wikilink map (a note anywhere can affect how any other note's
 * links resolve, so there's no cheaper correct option than redoing all of
 * it), and replaces the store contents. */
async function syncCollection(context: LoaderContext, collection: 'languages' | 'terms') {
  const { store, renderMarkdown, generateDigest } = context;
  const files: VaultFile[] = listVaultFiles()[collection];
  const linkMap = buildLinkMap();

  store.clear();

  for (const file of files) {
    const { frontmatter, body } = readNote(file);
    const { text: linkedBody, links } = resolveWikilinks(body, linkMap);
    const rendered = await renderMarkdown(linkedBody);
    const digest = generateDigest({ frontmatter, body });

    store.set({
      id: `${file.domainSlug}/${file.slug}`,
      data: {
        title: file.title,
        domain: file.domain,
        domainSlug: file.domainSlug,
        slug: file.slug,
        isMoc: file.isMoc,
        summary: extractSummary(body),
        links,
        category: typeof frontmatter.category === 'string' ? frontmatter.category : undefined,
        status: typeof frontmatter.status === 'string' ? frontmatter.status : undefined,
        tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
      },
      digest,
      rendered,
    });
  }

  return files.length;
}

/** Loads vault markdown files (living outside src/, in the Obsidian folders one
 * level up) into an Astro content collection, resolving [[wikilinks]] to real
 * routes as part of the render pass. In dev mode, also watches both vault
 * roots so notes added/edited/deleted in Obsidian while `astro dev` is
 * running show up without a manual restart. */
export function vaultLoader({ collection }: VaultLoaderOptions): Loader {
  return {
    name: `vault-${collection}`,
    load: async (context) => {
      const { logger, watcher } = context;
      const count = await syncCollection(context, collection);
      logger.info(`loaded ${count} notes into "${collection}"`);

      if (!watcher) return; // production build — nothing to watch

      watcher.add(LANGUAGES_DIR);
      watcher.add(TERMS_DIR);

      let reloadTimer: ReturnType<typeof setTimeout> | undefined;
      const scheduleReload = (changedPath: string) => {
        if (!isVaultMarkdownPath(changedPath)) return;
        clearTimeout(reloadTimer);
        // Debounce so a single save (which can fire several fs events in
        // quick succession) triggers one reload instead of several.
        reloadTimer = setTimeout(async () => {
          try {
            clearVaultCache();
            const n = await syncCollection(context, collection);
            logger.info(`reloaded "${collection}" (${n} notes) after a vault change`);
          } catch (err) {
            logger.error(`failed to reload "${collection}" after a vault change: ${err}`);
          }
        }, 200);
      };

      watcher.on('add', scheduleReload);
      watcher.on('change', scheduleReload);
      watcher.on('unlink', scheduleReload);
    },
  };
}

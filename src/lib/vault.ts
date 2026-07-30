import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import matter from 'gray-matter';

const here = path.dirname(fileURLToPath(import.meta.url)); // <project>/src/lib
const PROJECT_ROOT = path.resolve(here, '../../'); // <project>
export const VAULT_ROOT = path.resolve(PROJECT_ROOT, '..'); // the Obsidian vault
export const LANGUAGES_DIR = path.join(VAULT_ROOT, 'Programming Languages');
export const TERMS_DIR = path.join(VAULT_ROOT, 'Terms and Knowledge');

const SKIP_DIRS = new Set(['_Templates']);

/** Turns a raw note title into a URL-safe, collision-free slug. Symbols that carry
 * meaning in language names (C#, C++, F#) are spelled out instead of stripped. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/#/g, '-sharp')
    .replace(/\+/g, '-plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface VaultFile {
  /** Absolute path on disk */
  absPath: string;
  /** Title as it appears in [[wikilinks]] — the filename without extension */
  title: string;
  /** Top-level folder name under the source dir, e.g. "Full-Stack" */
  domain: string;
  slug: string;
  domainSlug: string;
  isMoc: boolean;
}

function walk(dir: string, domainOverride?: string): VaultFile[] {
  const out: VaultFile[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, domainOverride ?? entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const title = entry.name.slice(0, -3);
      const domain = domainOverride ?? path.basename(dir);
      out.push({
        absPath: full,
        title,
        domain,
        slug: slugify(title),
        domainSlug: slugify(domain),
        isMoc: /\bMOC$/i.test(title),
      });
    }
  }
  return out;
}

let _cache: { languages: VaultFile[]; terms: VaultFile[] } | null = null;

/** Walks both vault source trees once and caches the result for this process. */
export function listVaultFiles() {
  if (_cache) return _cache;
  _cache = {
    languages: walk(LANGUAGES_DIR, 'Programming Languages'),
    terms: walk(TERMS_DIR),
  };
  return _cache;
}

/** Drops the cached directory walk so the next `listVaultFiles()` call re-reads
 * disk. Call this after a dev-mode watcher detects a change under either vault
 * root, before re-running the loader. */
export function clearVaultCache() {
  _cache = null;
}

/** True for any .md path inside either vault root (regardless of how deep, or
 * whether it's under a skipped dir like `_Templates` — an edit there is rare
 * and harmless to react to). Used by the dev-mode file watcher to ignore
 * unrelated fs events. */
export function isVaultMarkdownPath(filePath: string): boolean {
  if (!filePath.toLowerCase().endsWith('.md')) return false;
  return [LANGUAGES_DIR, TERMS_DIR].some((root) => {
    const rel = path.relative(root, filePath);
    return rel !== '' && rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
  });
}

export interface LinkTarget {
  collection: 'languages' | 'terms';
  domainSlug: string;
  slug: string;
  title: string;
}

/** Global title -> route map so any [[wikilink]] anywhere in the vault resolves,
 * regardless of which collection or domain it points into. */
export function buildLinkMap(): Map<string, LinkTarget> {
  const { languages, terms } = listVaultFiles();
  const map = new Map<string, LinkTarget>();
  for (const f of languages) {
    map.set(f.title.toLowerCase(), {
      collection: 'languages',
      domainSlug: f.domainSlug,
      slug: f.slug,
      title: f.title,
    });
  }
  for (const f of terms) {
    map.set(f.title.toLowerCase(), {
      collection: 'terms',
      domainSlug: f.domainSlug,
      slug: f.slug,
      title: f.title,
    });
  }
  return map;
}

export function routeFor(target: LinkTarget): string {
  const isMoc = /\bMOC$/i.test(target.title);
  if (target.collection === 'languages') {
    return isMoc ? '/languages' : `/languages/${target.slug}`;
  }
  return isMoc ? `/terms/${target.domainSlug}` : `/terms/${target.domainSlug}/${target.slug}`;
}

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export interface ResolvedBody {
  text: string;
  /** Deduped routes this note links out to, in first-seen order — used to build
   * the backlink ("referenced by") index without re-parsing every note. */
  links: string[];
}

/** Rewrites Obsidian [[wikilinks]] and [[file|alias]] links into standard markdown
 * links resolved against the vault-wide link map. Unresolvable targets (shouldn't
 * happen — the vault has 0 broken links per the last integrity check) degrade to
 * plain text rather than a dead link. */
export function resolveWikilinks(body: string, linkMap: Map<string, LinkTarget>): ResolvedBody {
  const seen = new Set<string>();
  const text = body.replace(WIKILINK_RE, (_match, rawTarget: string, rawAlias?: string) => {
    const target = rawTarget.trim();
    const label = (rawAlias ?? target).trim();
    const hit = linkMap.get(target.toLowerCase());
    if (!hit) return label;
    const route = routeFor(hit);
    seen.add(route);
    return `[${label}](${route})`;
  });
  return { text, links: [...seen] };
}

const DEFINITION_RE = /\*\*Definition:\*\*\s*(.+)/;

/** Pulls the "**Definition:** ..." line every note/language note opens with, stripped
 * of inline markdown, for use in card previews and tooltips. */
export function extractSummary(body: string): string | undefined {
  const match = body.match(DEFINITION_RE);
  if (!match) return undefined;
  return match[1]
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, target: string, alias?: string) => alias ?? target)
    .replace(/\*\*|__|`/g, '')
    .trim();
}

export interface ParsedNote {
  file: VaultFile;
  frontmatter: Record<string, unknown>;
  body: string;
}

export function readNote(file: VaultFile): ParsedNote {
  const raw = fs.readFileSync(file.absPath, 'utf-8');
  const { data, content } = matter(raw);
  return { file, frontmatter: data, body: content };
}

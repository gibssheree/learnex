import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import matter from 'gray-matter';

// Deliberately process.cwd(), not an import.meta.url-relative path: Astro
// bundles API routes like rss.xml.ts into dist/.prerender/chunks/ for
// prerendering, which relocates this module and breaks any path computed
// relative to its own file location. astro dev/build/preview always run
// from the project root, so cwd is stable everywhere this code executes.
const PROJECT_ROOT = process.cwd();
// Learnitas owns its own copy of the content under content/ — it's no longer
// read live from the personal Obsidian vault one folder up. Publishing an
// update means copying fresh notes in here (see the sync script), not just
// editing the vault and rebuilding.
export const VAULT_ROOT = path.resolve(PROJECT_ROOT, 'content');
export const LANGUAGES_DIR = path.join(VAULT_ROOT, 'Programming Languages');
export const TERMS_DIR = path.join(VAULT_ROOT, 'Terms and Knowledge');

/** Domains outside computer science, each living in its own top-level content
 * root (sibling to "Programming Languages" and "Terms and Knowledge") rather
 * than nested under either — these are standalone sections in their own
 * right, not CS sub-topics and not one shared "general knowledge" bucket. */
export const KNOWLEDGE_DOMAINS = [
  'Founders and Executives',
  'Finance and Economics',
  'Physics',
  'Chemistry',
  'Electrical and Electronics Engineering',
];
export const KNOWLEDGE_ROOTS = KNOWLEDGE_DOMAINS.map((name) => path.join(VAULT_ROOT, name));

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

let _cache: { languages: VaultFile[]; terms: VaultFile[]; knowledge: VaultFile[] } | null = null;

/** Walks all vault source trees once and caches the result for this process. */
export function listVaultFiles() {
  if (_cache) return _cache;
  _cache = {
    languages: walk(LANGUAGES_DIR, 'Programming Languages'),
    terms: walk(TERMS_DIR),
    knowledge: KNOWLEDGE_ROOTS.flatMap((root) => walk(root, path.basename(root))),
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
  return [LANGUAGES_DIR, TERMS_DIR, ...KNOWLEDGE_ROOTS].some((root) => {
    const rel = path.relative(root, filePath);
    return rel !== '' && rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel);
  });
}

export interface LinkTarget {
  collection: 'languages' | 'terms' | 'knowledge';
  domainSlug: string;
  slug: string;
  title: string;
}

/** Global title -> route map so any [[wikilink]] anywhere in the vault resolves,
 * regardless of which collection or domain it points into. */
export function buildLinkMap(): Map<string, LinkTarget> {
  const { languages, terms, knowledge } = listVaultFiles();
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
  for (const f of knowledge) {
    map.set(f.title.toLowerCase(), {
      collection: 'knowledge',
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
  if (target.collection === 'knowledge') {
    // Standalone domains live at the URL root, not nested under /terms —
    // each one (Chemistry, Physics, ...) is its own top-level section.
    return isMoc ? `/${target.domainSlug}` : `/${target.domainSlug}/${target.slug}`;
  }
  return isMoc ? `/terms/${target.domainSlug}` : `/terms/${target.domainSlug}/${target.slug}`;
}

const WIKILINK_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/** Fenced code blocks (``` ... ``` or ~~~ ... ~~~) and inline code spans (`...`)
 * can legitimately contain literal `[[...]]` sequences that aren't wikilinks —
 * Bash's `[[ ]]` test syntax, Lua's `[[ ]]` long-string delimiters, JS's
 * `[[Prototype]]` internal slot, R's `df[["score"]]` subsetting, Rcpp's
 * `// [[Rcpp::export]]` attribute. Wikilink resolution must skip these regions
 * entirely rather than mangling the code sample. */
const CODE_SEGMENT_RE = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g;

export interface ResolvedBody {
  text: string;
  /** Deduped routes this note links out to, in first-seen order — used to build
   * the backlink ("referenced by") index without re-parsing every note. */
  links: string[];
}

/** Rewrites Obsidian [[wikilinks]] and [[file|alias]] links into standard markdown
 * links resolved against the vault-wide link map. Unresolvable targets degrade to
 * plain text rather than a dead link. Text inside fenced code blocks and inline
 * code spans is left byte-identical (see CODE_SEGMENT_RE) so real `[[...]]` syntax
 * in code examples doesn't get rewritten or stripped. */
export function resolveWikilinks(body: string, linkMap: Map<string, LinkTarget>): ResolvedBody {
  const seen = new Set<string>();

  function resolveProse(segment: string): string {
    return segment.replace(WIKILINK_RE, (_match, rawTarget: string, rawAlias?: string) => {
      const target = rawTarget.trim();
      const label = (rawAlias ?? target).trim();
      const hit = linkMap.get(target.toLowerCase());
      if (!hit) return label;
      const route = routeFor(hit);
      seen.add(route);
      return `[${label}](${route})`;
    });
  }

  let text = '';
  let lastIndex = 0;
  for (const match of body.matchAll(CODE_SEGMENT_RE)) {
    const start = match.index!;
    text += resolveProse(body.slice(lastIndex, start));
    text += match[0]; // code segment — left untouched
    lastIndex = start + match[0].length;
  }
  text += resolveProse(body.slice(lastIndex));

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

let _gitDatesCache: Map<string, Date> | null = null;

/** Maps every file under content/ to the author date of the most recent git
 * commit that touched it, via one batched `git log` call rather than one
 * process per file. Returns an empty map (not an error) if git isn't
 * available or content/ has no history yet — lastModified() below falls
 * back to filesystem mtime in that case. */
function loadGitDates(): Map<string, Date> {
  if (_gitDatesCache) return _gitDatesCache;
  const map = new Map<string, Date>();
  try {
    // %x01 is a control character used purely as a delimiter — it can't
    // appear in a file path or an ISO date, so splitting on it is safe.
    const out = execFileSync('git', ['log', '--name-only', '--format=%x01%aI', '--', 'content'], {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
    });
    let currentDate: string | null = null;
    for (const line of out.split('\n')) {
      if (line.startsWith('\x01')) {
        currentDate = line.slice(1).trim();
      } else if (line.trim() && currentDate) {
        const abs = path.resolve(PROJECT_ROOT, line.trim());
        // git log is newest-first, so the first time a path is seen is its
        // most recent change — later (older) hits for the same path are ignored.
        if (!map.has(abs)) map.set(abs, new Date(currentDate));
      }
    }
  } catch {
    // No git repo, git not on PATH, or content/ not committed yet.
  }
  _gitDatesCache = map;
  return map;
}

/** Best known "last modified" moment for a vault file: git history if the
 * file has been committed, otherwise the file's own mtime on disk. */
export function lastModified(absPath: string): Date {
  const gitDate = loadGitDates().get(absPath);
  if (gitDate) return gitDate;
  try {
    return fs.statSync(absPath).mtime;
  } catch {
    return new Date();
  }
}

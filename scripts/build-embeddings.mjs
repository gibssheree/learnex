#!/usr/bin/env node
// Generates the RAG retrieval index for the Study Assistant: walks the vault
// (the same folders src/lib/vault.ts reads — duplicated here rather than
// cross-imported, since scripts/ run as plain Node ESM with no TS loader,
// same convention as scripts/sync-content.mjs), chunks each note by its
// `## ` sections, embeds each chunk via the Gemini API, and writes the
// result to src/data/vault-embeddings.json for src/lib/rag.ts to load.
//
// Costs one API call per chunk (a few thousand for this vault), so it's run
// manually when content changes rather than wired into every `astro build`:
//   npm run build-embeddings

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { GoogleGenAI } from '@google/genai';

const here = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(here, '..');
const VAULT_ROOT = path.join(PROJECT_ROOT, 'content');
const LANGUAGES_DIR = path.join(VAULT_ROOT, 'Programming Languages');
const TERMS_DIR = path.join(VAULT_ROOT, 'Terms and Knowledge');
const OUT_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'vault-embeddings.json');

const SKIP_DIRS = new Set(['_Templates']);
const EMBEDDING_MODEL = 'gemini-embedding-2';
const CONCURRENCY = 6;

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set. Copy .env.example to .env and fill it in (or export it in your shell) before running this script.');
  process.exit(1);
}

// Mirrors slugify() in src/lib/vault.ts byte-for-byte — routes generated here
// must match the real site routes, or retrieval results point at dead pages.
function slugify(input) {
  return input
    .toLowerCase()
    .replace(/#/g, '-sharp')
    .replace(/\+/g, '-plus')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function walk(dir, collection, domainOverride) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, collection, domainOverride ?? entry.name));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const title = entry.name.slice(0, -3);
      if (/\bMOC$/i.test(title)) continue; // MOC index pages aren't retrieval content
      const domain = domainOverride ?? path.basename(dir);
      out.push({ absPath: full, title, domain, collection, slug: slugify(title), domainSlug: slugify(domain) });
    }
  }
  return out;
}

function routeFor(file) {
  return file.collection === 'languages'
    ? `/languages/${file.slug}`
    : `/terms/${file.domainSlug}/${file.slug}`;
}

// Splits a note's body into retrieval chunks: everything before the first
// "## " heading (title, **Definition:**, the Paradigm/Typing line) becomes
// an "Overview" chunk, then one chunk per "## " section — the same section
// boundaries every note in the vault already uses, so chunks are naturally
// self-contained instead of arbitrary character windows.
function chunkBody(body) {
  const lines = body.split('\n');
  const chunks = [];
  let heading = 'Overview';
  let buf = [];
  const flush = () => {
    const text = buf.join('\n').trim();
    if (text) chunks.push({ heading, text });
    buf = [];
  };
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      flush();
      heading = h2[1].trim();
    } else {
      buf.push(line);
    }
  }
  flush();
  return chunks;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function embed(text) {
  const res = await ai.models.embedContent({ model: EMBEDDING_MODEL, contents: text });
  return res.embeddings[0].values;
}

// Small concurrency pool so a few thousand chunks don't go out fully
// sequential (slow) or fully parallel (rate-limited) — a middle ground.
async function mapPool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return results;
}

async function main() {
  const files = [...walk(LANGUAGES_DIR, 'languages', 'Programming Languages'), ...walk(TERMS_DIR, 'terms')];

  const tasks = [];
  for (const file of files) {
    const raw = fs.readFileSync(file.absPath, 'utf-8');
    const { content } = matter(raw);
    const route = routeFor(file);
    for (const chunk of chunkBody(content)) {
      tasks.push({ route, title: file.title, domain: file.domain, heading: chunk.heading, text: chunk.text });
    }
  }

  console.log(`Embedding ${tasks.length} chunks from ${files.length} notes...`);

  let done = 0;
  const out = await mapPool(tasks, CONCURRENCY, async (task) => {
    const embedInput = `${task.title} — ${task.heading}\n\n${task.text}`;
    try {
      const vector = await embed(embedInput);
      return { ...task, vector };
    } catch (err) {
      console.error(`  failed on "${task.title} / ${task.heading}": ${err.message}`);
      return null;
    } finally {
      done++;
      if (done % 100 === 0) console.log(`  ${done}/${tasks.length}`);
    }
  });

  const chunks = out.filter(Boolean);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(chunks));
  console.log(`Wrote ${chunks.length} chunks (${out.length - chunks.length} failed) to ${path.relative(PROJECT_ROOT, OUT_FILE)}`);
}

main();

#!/usr/bin/env node
// Copies the two source folders from the personal Obsidian vault (one level
// up from this project) into content/, overwriting whatever's already
// there. Learnex reads from content/, not from the vault directly (see
// src/lib/vault.ts) — run this after editing notes and before committing,
// or nothing published here changes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(here, '..');
const VAULT_ROOT = path.resolve(PROJECT_ROOT, '..');
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'content');

const FOLDERS = ['Programming Languages', 'Terms and Knowledge'];

function countMarkdown(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) count += countMarkdown(full);
    else if (entry.name.endsWith('.md')) count += 1;
  }
  return count;
}

for (const folder of FOLDERS) {
  const src = path.join(VAULT_ROOT, folder);
  const dest = path.join(CONTENT_ROOT, folder);

  if (!fs.existsSync(src)) {
    console.error(`Skipping "${folder}" — not found at ${src}`);
    continue;
  }

  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`Synced "${folder}": ${countMarkdown(dest)} notes`);
}

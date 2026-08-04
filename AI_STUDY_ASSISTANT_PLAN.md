# Learnex — AI Study Assistant + iPad/Pencil Mode (Phase 1)

## Context

Learnex is currently a 100% static Astro site (no adapter, no server, no env vars, no backend) that renders a personal knowledge vault (~50 language notes + ~400 term notes) with client-side-only interactivity (localStorage for theme/bookmarks/SRS state, a mouse-only canvas graph). The user wants to turn it into a genuinely AI-assisted, touch/Pencil-friendly study tool:

1. **An AI study assistant** — a chat/search feature backed by Google Gemini, with the API key held server-side (never exposed to the browser), that answers questions using the vault's own content via **retrieval** (RAG) rather than dumping the whole vault into every prompt — retrieval is exposed to the model as a **callable tool**, so Gemini decides when it needs to search rather than the app always stuffing context in.
2. **An "iPad Mode"** — a navbar-toggled mode that unlocks a touch/stylus-optimized UI and a handwritten annotation layer (Apple Pencil / touch / mouse via the Pointer Events API) that lets the user draw directly on top of a note, persisted locally.

This is a large build. Per explicit agreement with the user, **Phase 1 ships a working foundation for both tracks**; a documented **Phase 2** (AI-driven DOM navigation/highlighting while the user practices, and an always-on voice mode) is deferred — Phase 1's architecture is designed so Phase 2 can build on top of it without rework (page-context passing, tool-calling scaffold, and a persistent assistant surface all already point that direction).

Confirmed decisions (from user Q&A this session):
- **Hosting**: Vercel → add `@astrojs/vercel` adapter.
- **AI provider**: Google **Gemini**, key lives server-side as an environment variable, never shipped to the client.
- **Retrieval**: proper RAG — build-time embeddings index + a `searchVault` **function/tool** the model can call, not naive "paste everything into the prompt."
- **iPad Mode**: stays in Phase 1 as originally scoped — toggle, touch-target CSS pass, Pencil/touch annotation canvas.

---

## Architecture Overview

### Rendering model
Astro's default `output: 'static'` mode prerenders every page at build time (unchanged for all existing content pages) **except** routes that explicitly opt out with `export const prerender = false;` — those become on-demand serverless/edge functions once an adapter is installed. This means:
- Every existing page (`/languages/*`, `/terms/*`, `/`, `/graph`, `/review`, etc.) stays exactly as it is today: static HTML, no regression, no added cold-start latency.
- Only the new `src/pages/api/assistant.ts` endpoint opts into server rendering.

`astro.config.mjs` changes:
```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  vite: { plugins: [tailwindcss()] },
});
```
(`output` stays implicit/`'static'` — the adapter + per-route `prerender = false` is what makes the one API route dynamic.)

### RAG pipeline (build-time index + runtime tool-call)

**1. Build-time embeddings** (`scripts/build-embeddings.mjs`, modeled on the existing `scripts/sync-content.mjs`):
- Walk `content/Programming Languages/` and `content/Terms and Knowledge/**/` the same way `src/lib/vault.ts`'s `listVaultFiles()`/`walk()` already does (reuse that logic rather than re-implementing the walk).
- Chunk each note **by `## ` section** (not the whole note, and not arbitrary character windows) — this vault's notes are already consistently section-structured (`Definition` / `How It Works` / `Pros` / `Cons` / etc.), so section-level chunks are natural, self-contained retrieval units and keep the index compact even for the ~500-800 line notes some of the expanded ones now are.
- Call Gemini's embedding model (`text-embedding-004`) per chunk via `@google/generative-ai`.
- Write the result to `src/data/vault-embeddings.json`: `{ route, title, domain, heading, text, vector: number[] }[]`.
- This script needs `GEMINI_API_KEY` at **build time** too (Vercel build environment, same var as runtime) — add it as a new `npm run build-embeddings` package.json script, run manually when content changes (same workflow as `npm run sync-content` — not wired into every `astro build` automatically, since it costs API calls and content doesn't change every build).

**2. Runtime retrieval + tool-calling** (`src/lib/rag.ts` + `src/pages/api/assistant.ts`):
- `src/lib/rag.ts` loads `vault-embeddings.json` once per function instance (module-level cache) and exposes `searchVault(queryVector, topK)` — brute-force cosine similarity over ~1,500–2,500 chunk vectors, which is sub-100ms in plain JS at this scale, no vector DB needed.
- `src/pages/api/assistant.ts` (`export const prerender = false;`) receives `{ messages, currentPage: { title, route } }` from the client, calls Gemini's chat API with:
  - A system instruction describing Learnex and that it should use the `search_vault` function when it needs facts from the notes rather than guessing.
  - A **function declaration** `search_vault(query: string)` in the request.
  - The conversation history plus the user's new message.
- When Gemini's response contains a function call, the route embeds `query` via the Gemini embedding API, calls `searchVault()`, sends the results back to Gemini as a function response, and lets Gemini produce the final answer (standard Gemini function-calling round trip — may loop more than once if the model chains searches).
- Streams the final text back to the client (`ReadableStream` response).
- `currentPage` is passed through into the system/user context now (not used for navigation yet — that's Phase 2) so the assistant already knows "what note the user is reading," per the user's stated requirement.

### Client-side chat UI

`src/components/StudyAssistant.astro` — a floating panel mounted once in `BaseLayout.astro` (available on every page), following the existing popover pattern already in `Header.astro` (`.tool-popover-wrap` / `.tool-panel`, `registerPopover()`/`closeAllPopovers()`): a toolbar button opens a slide-up chat panel. Client script:
- Tracks conversation `messages[]` in memory (reset on full page navigation — fine for v1, matches this site's otherwise-static nature; no new persistence layer needed yet).
- On send: `POST /api/assistant` with `{ messages, currentPage: { title: document.title, route: location.pathname } }`, reads the streamed response, appends it to the transcript.
- Reuses the vault's existing visual language (`.tool-panel`, `--brass`/`--accent` vars, `font-pixel` labels) rather than inventing a new design system.

---

## iPad Mode

### Toggle (`Header.astro` + `BaseLayout.astro`)
Follows the **exact existing pattern** used by the CRT/theme/text-size toggles — no new mechanism needed:
- New `#ipad-mode-toggle-btn` button in `Header.astro`'s `.toolbar-group`, same shape as `#crt-toggle-btn`.
- `BaseLayout.astro`'s existing inline `<script is:inline>` (the one that already restores `learnex-theme`/`learnex-crt`/`learnex-text-size`/`learnex-sidebar`/`learnex-navbar` from `localStorage` before paint) gets one more line restoring `learnex-ipad-mode` → `data-ipad-mode="on"` on `<html>`.
- `Header.astro`'s existing toggle-handler script gets one more handler, identical shape to the CRT one.

### Touch/stylus CSS pass (`src/styles/global.css` + component styles)
- Add `@media (pointer: coarse)` rules (new — none exist today) bumping interactive targets that are currently 30–38px (`.tool-btn`, `.bookmark-toggle`, `.print-toggle`, sidebar `summary`/`a` rows, grade buttons on `/review`) up toward the ~44px Apple HIG minimum. This applies to **any** coarse-pointer device automatically (real touch, not gated behind the iPad Mode toggle — it's a strict usability improvement with no downside on mouse devices).
- `[data-ipad-mode='on']` scoped rules for anything that should *only* change when the user has explicitly opted in (e.g. showing the annotation toolbar — see below).

### Pencil/touch annotation layer
- `src/lib/annotations-db.ts` — small vanilla IndexedDB wrapper (no new dependency; nothing like this exists in the repo today, `localStorage` used elsewhere is too small/sync-only for stroke data). One object store `strokes`, keyed by note route (`pathname`), value = `{ strokes: Stroke[] }` where `Stroke = { points: {x,y,pressure}[], color: string, width: number }`.
- `src/components/AnnotationCanvas.astro` — mounted in `ReaderLayout.astro`, only rendered/active inside `.page-leaf` on note pages, only interactive when `data-ipad-mode='on'`:
  - A `<canvas>` absolutely positioned over `.vault-prose`, sized/DPR-scaled with the **same devicePixelRatio pattern already used in `src/pages/graph/index.astro`** (reuse that logic rather than reinventing canvas-DPR handling).
  - `pointerdown`/`pointermove`/`pointerup` (Pointer Events — new to this repo, unifies Pencil/touch/mouse in one API; use `event.pressure` for Pencil-sensitive line width, default width for touch/mouse).
  - Minimal toolbar: pen, eraser, 2–3 ink colors pulled from the vault's own palette (`--accent`, `--brass`, `--ink`), clear-page, show/hide.
  - Loads/saves strokes via `annotations-db.ts`, keyed to the current note's route so annotations are per-note and survive reloads.
- Toggling "Hide annotations" doesn't delete them — just skips drawing/hides the canvas, so print mode (which already strips app chrome via the `@media print` block in `global.css`) naturally excludes it too as long as the canvas gets a class covered by that existing print rule.

---

## New dependencies

```
@astrojs/vercel          # adapter
@google/generative-ai    # Gemini SDK, used by scripts/build-embeddings.mjs and src/lib/rag.ts + src/pages/api/assistant.ts
```
No new dependency for IndexedDB or canvas — both handled with vanilla browser APIs to keep the dependency list as small as it is today.

## Environment / config

- `.env` (gitignored — confirm `.gitignore` covers it, add if missing) with `GEMINI_API_KEY=...`
- `.env.example` committed, documenting the one required var
- Same var name used at build time (`scripts/build-embeddings.mjs`) and request time (`src/pages/api/assistant.ts`), read via `import.meta.env.GEMINI_API_KEY` (server-only — no `PUBLIC_` prefix, so Vite never exposes it to client bundles)
- Vercel project settings: add `GEMINI_API_KEY` to both Production and Preview/Build environment variables (documented in this plan, actual dashboard step is on the user)

## Files — new
| File | Purpose |
|---|---|
| `scripts/build-embeddings.mjs` | Build-time RAG index generator, reuses `listVaultFiles()`/note-reading from `src/lib/vault.ts` |
| `src/data/vault-embeddings.json` | Generated embeddings index (checked in, regenerated on demand) |
| `src/lib/rag.ts` | Loads the index, cosine-similarity top-K search |
| `src/pages/api/assistant.ts` | `prerender = false` endpoint: Gemini chat + function-calling loop, streams response |
| `src/components/StudyAssistant.astro` | Floating chat panel UI + client script |
| `src/lib/annotations-db.ts` | IndexedDB wrapper for pencil/touch strokes |
| `src/components/AnnotationCanvas.astro` | Drawing layer mounted on note pages |
| `.env.example` | Documents `GEMINI_API_KEY` |

## Files — modified
| File | Change |
|---|---|
| `astro.config.mjs` | add `@astrojs/vercel` adapter |
| `package.json` | add 2 deps, add `build-embeddings` script |
| `.gitignore` | ensure `.env` is ignored |
| `src/layouts/BaseLayout.astro` | restore `learnex-ipad-mode` in the existing inline localStorage-restore script; mount `<StudyAssistant />` |
| `src/layouts/ReaderLayout.astro` | mount `<AnnotationCanvas />` on note pages |
| `src/components/Header.astro` | add iPad Mode toggle button + handler (mirrors existing CRT toggle) |
| `src/styles/global.css` | `@media (pointer: coarse)` touch-target rules; `[data-ipad-mode]` scoping; ensure annotation canvas is covered by the existing `@media print` chrome-stripping block |

---

## Phase 2 (explicitly NOT built now — documented for later)
- AI tool-use that can navigate the site / scroll to and highlight a specific section while the user practices (extends the same function-calling scaffold in `api/assistant.ts` with additional tool declarations like `navigate_to(route)` / `highlight(selector)`, executed client-side on receipt rather than server-side).
- An always-on voice mode (persistent bottom-of-screen widget, speech-to-text in, TTS or Gemini audio out), reusing the same `currentPage` context-passing and `/api/assistant` conversation loop already built in Phase 1.

## Verification
1. `npm install` picks up the two new deps cleanly.
2. `npm run dev` (via `astro dev --background` per this repo's convention) still serves every existing static page unchanged — spot-check `/`, `/languages/python`, `/terms/devops-toolchain/linux-server-commands`.
3. `npm run build-embeddings` (with `GEMINI_API_KEY` set locally) produces `src/data/vault-embeddings.json` and logs a chunk count.
4. Local dev: open the Study Assistant panel, ask a question whose answer requires a specific note (e.g. "what's the difference between git rebase and git merge") — confirm via server logs that a `search_vault` function call round-trip happened before the final answer, and that the answer is grounded in real note content, not hallucinated.
5. Toggle iPad Mode on: confirm `data-ipad-mode="on"` persists across reload; confirm touch-target sizing kicks in under `(pointer: coarse)` (test via the Browser tool's device emulation or an actual iPad); open a note, draw a stroke, reload the page, confirm the stroke persists (per-route IndexedDB read-back).
6. `npm run build && npm run preview` once locally to confirm the static output + the one serverless route still both work outside `astro dev`.

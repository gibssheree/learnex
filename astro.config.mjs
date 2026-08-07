// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
// output stays implicit ('static') — every content page keeps prerendering
// exactly as before. Only src/pages/api/assistant.ts opts into on-demand
// rendering (via its own `export const prerender = false`), which is what
// this adapter makes possible.
export default defineConfig({
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    // Astro 7 defaults to the Sätteri processor, which doesn't run
    // remark/rehype plugins — opt back into the unified pipeline so vault
    // notes can write math as $inline$ and $$block$$ (standard
    // Obsidian/LaTeX convention) and have it render as real typeset
    // notation, needed for Physics/Chemistry/EEE formulas.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex]
    })
  }
});
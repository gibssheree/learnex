// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
// output stays implicit ('static') — every content page keeps prerendering
// exactly as before. Only src/pages/api/assistant.ts opts into on-demand
// rendering (via its own `export const prerender = false`), which is what
// this adapter makes possible.
export default defineConfig({
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()]
  }
});
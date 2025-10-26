// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],

  // Production site URL - update when deploying docs to mainnet
  site: 'https://zlxjo-taaaa-aaaan-qz72a-cai.icp0.io',

  vite: {
    plugins: [tailwindcss()]
  }
});
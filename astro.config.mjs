// @ts-check
import { defineConfig } from 'astro/config';

// Fully static site; Cloudflare serves ./dist as Workers Static Assets (see wrangler.jsonc).
export default defineConfig({
  site: 'https://tayfunbudak.com.tr',
});

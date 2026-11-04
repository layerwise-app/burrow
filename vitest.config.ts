import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests run in Node without the Cloudflare plugin; code under test must
// not import `cloudflare:workers` (keep it in *.functions.ts and *-store.ts).
export default defineConfig({
  resolve: {
    alias: { '~': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node'
  }
});

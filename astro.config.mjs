// @ts-check
import { defineConfig } from 'astro/config';
import { execFileSync } from 'node:child_process';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// Get commit SHA: prefer Cloudflare's env var, fall back to git
const commitSha = process.env.CF_PAGES_COMMIT_SHA
  || execFileSync('git', ['rev-parse', 'HEAD']).toString().trim();

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    define: {
      __COMMIT_SHA__: JSON.stringify(commitSha),
      __COMMIT_SHA_SHORT__: JSON.stringify(commitSha.slice(0, 7)),
      __DD_APP_ID__: JSON.stringify(process.env.DD_APP_ID || ''),
      __DD_CLIENT_TOKEN__: JSON.stringify(process.env.DD_CLIENT_TOKEN || ''),
    },
  },

  integrations: [react()],
});

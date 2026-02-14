// @ts-check
import { defineConfig, envField } from 'astro/config';
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
    },
  },

  env: {
    schema: {
      DD_APP_ID: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      DD_CLIENT_TOKEN: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },

  integrations: [react()],
});

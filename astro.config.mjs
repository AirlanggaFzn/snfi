import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/data/site.json';

export default defineConfig({
  site: site.url,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'id', locales: { id: 'id-ID', en: 'en-US' } },
      filter: (page) => !page.endsWith('/_redirect/'),
    }),
  ],
});

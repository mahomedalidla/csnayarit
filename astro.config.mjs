import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://camarasdeseguridadnayarit.com',
  output: 'static',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize(item) {
        const home = item.url.endsWith('camarasdeseguridadnayarit.com/');
        const landing = /instalacion-camaras-seguridad-tepic|mantenimiento-reparacion-dvr-cctv/.test(item.url);
        const guide = item.url.includes('/blog/');
        item.priority = home ? 1.0 : landing ? 0.9 : guide ? 0.8 : 0.7;
        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});

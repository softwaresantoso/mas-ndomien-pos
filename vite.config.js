import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Mas Ndomien POS & Ordering',
        short_name: 'Mas Ndomien',
        description: 'Sistem operasional Pondok Es Teler Mas Ndomien',
        theme_color: '#B31F1F',
        background_color: '#FFF8F0',
        display: 'standalone',
        start_url: '/order',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Menu images & static assets cached; Firestore data intentionally
        // NOT cached here — realtime correctness matters more than offline reads
        // for orders/kitchen. See src/hooks/useConnectionStatus.js for the
        // "offline" banner instead of silently serving stale operational data.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp}']
      }
    })
  ],
  server: { port: 5173 }
});

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['apple-touch-icon.png', 'icons/*.png', 'mathe-reise-island.png'],
      manifest: {
        name: 'Mathe-Reise',
        short_name: 'Mathe-Reise',
        description: 'Eine freundliche Mathematik-Förderapp für die dritte Klasse.',
        theme_color: '#fffdf8',
        background_color: '#fffdf8',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        lang: 'de',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        navigateFallback: '/index.html'
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    css: true,
    restoreMocks: true
  }
})

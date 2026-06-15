/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/pr-tracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'avatars/*.svg', 'overlays/*.svg'],
      manifest: {
        name: 'PR Tracker',
        short_name: 'PR Tracker',
        description: 'Gamified personal record tracker for fitness',
        start_url: '/pr-tracker/',
        scope: '/pr-tracker/',
        display: 'standalone',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        icons: [],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})

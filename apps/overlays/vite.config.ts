import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '~': resolve(import.meta.dirname, './src'),
    },
  },
  base: '/overlays',
  server: {
    port: 1337,
  },
  build: {
    outDir: '../youtube-overlays-app/resources/overlays',
    emptyOutDir: true,
  },
})

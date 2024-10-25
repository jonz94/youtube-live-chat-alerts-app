import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
    outDir: '../electron-app/resources/overlays',
    emptyOutDir: true,
  },
})

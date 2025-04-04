import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // subpath
  base: '/overlays',

  plugins: [
    TanStackRouterVite({
      autoCodeSplitting: true,
    }),
    viteReact({
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
  server: {
    port: 1337,
  },
  build: {
    outDir: '../youtube-overlays-app/resources/overlays',
    emptyOutDir: true,
  },
})

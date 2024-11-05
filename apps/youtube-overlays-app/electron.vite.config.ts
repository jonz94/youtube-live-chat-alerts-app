import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'node:path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    build: {
      chunkSizeWarningLimit: Infinity,
    },
    resolve: {
      alias: {
        '~/renderer': resolve(import.meta.dirname, './src/renderer/src'),
      },
    },
    plugins: [react()],
  },
})

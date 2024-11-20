import { is } from '@electron-toolkit/utils'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { app as electronApp } from 'electron'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { type Server as HttpServer } from 'node:http'
import { relative, resolve } from 'node:path'
import { getSettings, getSettingsDir } from './settings'
import { startWebsocket } from './websocket'

export function startWebServer(port = 21829) {
  const app = new Hono()

  app.use('/*', cors())

  if (!is.dev) {
    const appInstallDir = resolve(electronApp.getAppPath(), '..', '..')
    const root = relative(process.cwd(), appInstallDir)

    app.use(
      '/overlays/*',
      serveStatic({
        root,
        rewriteRequestPath: (path) => path.replace(/^\/overlays/, '/resources/app.asar.unpacked/resources/overlays'),
        onFound(path) {
          console.log('found')
          console.log(path)
        },
        onNotFound(path, c) {
          console.log('not found')
          console.log(path)
          c.text(`${path} not found`)
        },
      }),
    )
  }

  app.use(
    '/assets/*',
    serveStatic({
      root: relative(process.cwd(), resolve(getSettingsDir(), 'assets')).replaceAll('\\', '/'),
      rewriteRequestPath: (path) => path.replace(/^\/assets/, ''),
      onFound(path) {
        console.log('found')
        console.log(path)
      },
      onNotFound(path, c) {
        console.log('not found')
        console.log(path)
        c.text(`${path} not found`)
      },
    }),
  )

  app.get('/healthz', (c) => {
    return c.text('OK')
  })

  app.get('/api/settings', (c) => {
    return c.json(getSettings())
  })

  console.log(`Server is running on port ${port}`)

  const server = serve({
    fetch: app.fetch,
    port,
  })

  startWebsocket(server as HttpServer)
}

import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { app as electronApp } from 'electron'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { existsSync } from 'node:fs'
import { type Server as HttpServer } from 'node:http'
import { join, relative, resolve } from 'node:path'
import { PORT } from './const'
import { getSettings, getSettingsDir } from './settings'
import { startWebsocket } from './websocket'

export function startWebServer(port = PORT) {
  const app = new Hono()

  app.use('/*', cors())

  if (!import.meta.env.DEV) {
    const appInstallDir = resolve(electronApp.getAppPath(), '..', '..')
    const root = relative(process.cwd(), appInstallDir)

    app.use(
      '/overlays/*',
      serveStatic({
        root,
        rewriteRequestPath: (path) => {
          const index = '/resources/app.asar.unpacked/resources/overlays'
          try {
            const rewritePath = path.replace(/^\/overlays/, '/resources/app.asar.unpacked/resources/overlays')

            const doesExist = existsSync(join(appInstallDir, rewritePath))

            return doesExist ? rewritePath : index
          } catch {
            return index
          }
        },
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

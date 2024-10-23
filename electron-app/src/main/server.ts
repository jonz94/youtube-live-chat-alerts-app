import { is } from '@electron-toolkit/utils'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'

export function startWebServer(port = 21829) {
  const app = new Hono()

  app.use(
    '/overlays/*',
    serveStatic({
      root: './',
      rewriteRequestPath: (path) =>
        path.replace(/^\/overlays/, is.dev ? '/resources/overlays' : '/resources/app.asar.unpacked/resources/overlays'),
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

  console.log(`Server is running on port ${port}`)

  serve({
    fetch: app.fetch,
    port,
  })
}

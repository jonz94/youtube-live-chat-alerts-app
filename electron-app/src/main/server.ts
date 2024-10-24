import { is } from '@electron-toolkit/utils'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { type Server as HttpServer } from 'node:http'
import { io, startLivechat, startWebsocket } from './websocket'

export function startWebServer(port = 21829) {
  const app = new Hono()

  app.use('/*', cors())

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

  app.get('/api/live-chat/:videoId', (c) => {
    const { videoId } = c.req.param()

    if (!io || !videoId) {
      return c.json({ error: 'no websocker connection' }, 400)
    }

    startLivechat(videoId)

    return c.json({ videoId })
  })

  console.log(`Server is running on port ${port}`)

  const server = serve({
    fetch: app.fetch,
    port,
  })

  startWebsocket(server as HttpServer)
}

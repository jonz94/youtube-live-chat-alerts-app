import { initTRPC } from '@trpc/server'
import { join } from 'node:path'
import { io } from './websocket'

const t = initTRPC.create({ isServer: true })

export const router = t.router({
  open: t.procedure.mutation(() => {
    if (!io) {
      return { opened: false }
    }

    const value = io.emit('open')

    return { opened: value }
  }),

  debug: t.procedure.query(() => {
    const cwd = process.cwd()
    const dirname = __dirname
    const resources = join(__dirname, '../../resources/test')

    console.log(cwd)
    console.log(__dirname)

    return { cwd, dirname, resources }
  }),
})

export type AppRouter = typeof router

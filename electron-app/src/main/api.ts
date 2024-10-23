import { initTRPC } from '@trpc/server'
import { join } from 'node:path'
import { Innertube } from 'youtubei.js'
import z from 'zod'

const t = initTRPC.create({ isServer: true })

export const router = t.router({
  getVideoBasicInfo: t.procedure.input(z.object({ videoId: z.string() })).query(async ({ input }) => {
    const youtube = await Innertube.create()
    const video = await youtube.getBasicInfo(input.videoId)

    const { is_live, is_upcoming, title, start_timestamp, end_timestamp, duration } = video.basic_info

    const info = {
      isLive: is_live,
      isUpcoming: is_upcoming,
      title,
      startTimestamp: start_timestamp?.toISOString(),
      endTimestamp: end_timestamp?.toISOString(),
      duration,
    }

    console.log(info)

    return info
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

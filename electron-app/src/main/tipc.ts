import { tipc } from '@egoist/tipc/main'
import { Innertube } from 'youtubei.js'

const { procedure } = tipc.create()

export const router = {
  getVideoBasicInfo: procedure.input<{ videoId: string }>().action(async ({ input }) => {
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
}

export type Router = typeof router

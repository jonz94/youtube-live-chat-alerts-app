import { is } from '@electron-toolkit/utils'
import { initTRPC } from '@trpc/server'
import { join } from 'node:path'
import { type Server } from 'socket.io'
import { Innertube, YTNodes } from 'youtubei.js'
import { z } from 'zod'
import { io } from './websocket'

const t = initTRPC.create({ isServer: true })

export const router = t.router({
  initial: t.procedure.query(() => {
    return { isDev: is.dev }
  }),

  open: t.procedure.mutation(() => {
    if (!io) {
      return { opened: false }
    }

    const value = io.emit('open', { name: '測試', amount: '87' })

    return { opened: value }
  }),

  start: t.procedure.input(z.object({ videoId: z.string() })).mutation(async ({ input }) => {
    const { videoId } = input

    const youtube = await Innertube.create()

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    const video = await youtube.getInfo(videoId)

    const {
      is_live: isLive,
      is_upcoming: isUpcoming,
      title,
      start_timestamp: startTimestamp,
      end_timestamp: endTimestamp,
      duration,
    } = video.basic_info

    const videoInfo = {
      isLive,
      isUpcoming,
      title,
      startTimestamp,
      endTimestamp,
      duration,
    }

    console.log(`🚀 start observing live chat data from the video: (${videoUrl})`)
    console.log(JSON.stringify(videoInfo, null, 2))
    console.log()

    if (!isLive && !isUpcoming) {
      console.log(`🚧 only ongoing/upcoming live streams need this feature...`)

      // return { error: 'only ongoing/upcoming live streams need this feature...', data: null }
    }

    const livechat = video.getLiveChat()

    livechat.on('error', (error) => {
      console.log('Live chat error:', error)
    })

    livechat.on('end', () => {
      console.log('This live stream has ended.')
      livechat.stop()
    })

    function parseAddChatItemActionItem(io: Server, item: YTNodes.AddChatItemAction['item']) {
      if (item.is(YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement)) {
        io.emit('live-chat-debug', { type: YTNodes.LiveChatSponsorshipsGiftPurchaseAnnouncement.type, item })

        const header = item.header

        if (!header) {
          return
        }

        const name = header.author_name.toString()
        const primaryText = header.primary_text.toString()
        const amount = (function getAmount(text: string) {
          return text.split(' ').at(1)
        })(primaryText)

        io.emit('open', { name, amount })
        // NOTE: uncomment these lines below to simulate a delayed queue event for testing purposes
        // console.log('open', { name, amount })
        // setTimeout(() => {
        //   io.emit('open', { name: `${name} (delay)`, amount })
        //   console.log('open delay', { name: `${name} (delay)`, amount })
        // }, 1000)
      }
    }

    livechat.on('chat-update', async (chatAction) => {
      if (!io) {
        return
      }

      // io.emit('live-chat-debug', chatAction)

      if (chatAction.is(YTNodes.ReplayChatItemAction)) {
        for (const action of chatAction.actions) {
          if (action.is(YTNodes.AddChatItemAction)) {
            parseAddChatItemActionItem(io, action.item)
          }
        }
      }

      if (chatAction.is(YTNodes.AddChatItemAction)) {
        parseAddChatItemActionItem(io, chatAction.item)
      }
    })

    livechat.start()

    return { error: null, data: videoInfo }
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

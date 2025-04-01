import { is } from '@electron-toolkit/utils'
import { initTRPC } from '@trpc/server'
import { YTNodes } from 'youtubei.js'
import { z } from 'zod'
import { getConnectionStatus, getToken, listen, startEcpayConnection, stopEcpayConnection } from './ecpay'
import { getInnertubeClient } from './innertube'
import { parsedPaymentUrlDataSchema, templateSchema, VideoInfo } from './schema'
import {
  getSettings,
  removeChannelInfoSetting,
  resetImage,
  resetSoundEffect,
  updateAnimationTimeInMillisecondsSetting,
  updateChannelInfoSetting,
  updateImage,
  updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplateSetting,
  updateSoundEffect,
  updateVolumeSetting,
} from './settings'
import { getChannel, getLiveOrUpcomingStreams, parseAddChatItemActionItem } from './utils'
import { io } from './websocket'

const t = initTRPC.create({ isServer: true })

export const router = t.router({
  initial: t.procedure.query(() => {
    return { isDev: is.dev }
  }),

  open: t.procedure.input(z.object({ amount: z.string() })).mutation(({ input }) => {
    if (!io) {
      return { opened: false }
    }

    const { animationTimeInMilliseconds } = getSettings()

    const value = io.emit('open', { name: '測試贊助者', amount: input.amount, animationTimeInMilliseconds })

    return { opened: value }
  }),

  settings: t.procedure.query(() => {
    return getSettings()
  }),

  updateAnimationTimeSetting: t.procedure.input(z.number().gte(1)).mutation(({ input }) => {
    return updateAnimationTimeInMillisecondsSetting(input)
  }),

  updateImage: t.procedure.input(z.object({ newImagePath: z.string(), amount: z.number() })).mutation(({ input }) => {
    const result = updateImage(input.newImagePath, input.amount)

    io?.emit('update')

    return result
  }),

  resetImage: t.procedure.input(z.object({ amount: z.number() })).mutation(({ input }) => {
    const result = resetImage(input.amount)

    io?.emit('update')

    return result
  }),

  updateSoundEffect: t.procedure
    .input(z.object({ newSoundEffectPath: z.string(), amount: z.number() }))
    .mutation(({ input }) => {
      const result = updateSoundEffect(input.newSoundEffectPath, input.amount)

      io?.emit('update')

      return result
    }),

  resetSoundEffect: t.procedure.input(z.object({ amount: z.number() })).mutation(({ input }) => {
    const result = resetSoundEffect(input.amount)

    io?.emit('update')

    return result
  }),

  updateVolumeSetting: t.procedure.input(z.object({ volume: z.number().gte(0).lte(100) })).mutation(({ input }) => {
    return updateVolumeSetting(input.volume)
  }),

  updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplateSetting: t.procedure
    .input(templateSchema)
    .mutation(({ input }) => {
      const trimedInput = input.map((item) => {
        if (item.type === 'variable') {
          return item
        }

        return {
          ...item,
          text: item.text.trim(),
        }
      })

      const template = updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplateSetting(trimedInput)

      io?.emit('template-updated')

      return template
    }),

  getChannelInfo: t.procedure.input(z.object({ channelIdOrHandle: z.string() })).mutation(async ({ input }) => {
    return await getChannel(input.channelIdOrHandle)
  }),

  getChannelInfoAndThenUpdateChannelInfoSettings: t.procedure
    .input(z.object({ channelIdOrHandle: z.string() }))
    .mutation(async ({ input }) => {
      const result = await getChannel(input.channelIdOrHandle)

      if (result.error || !result.data) {
        return result
      }

      const data = updateChannelInfoSetting(result.data)

      io?.emit('channel-updated')

      return { error: null, data }
    }),

  removeChannelInfoSettings: t.procedure.mutation(() => {
    removeChannelInfoSetting()

    io?.emit('channel-updated')

    return { error: null, data: null }
  }),

  getLiveOrUpcomingStreams: t.procedure
    .input(z.object({ channelIdOrHandle: z.string() }))
    .mutation(async ({ input }) => {
      const data = await getLiveOrUpcomingStreams(input.channelIdOrHandle)

      return { error: null, data }
    }),

  getConnectionStatus: t.procedure.query(() => {
    return getConnectionStatus()
  }),

  connectPaymentUrl: t.procedure.input(parsedPaymentUrlDataSchema).mutation(async ({ input }) => {
    if (input.type === 'UNKNOWN') {
      return { error: '網址格式錯誤，請再重新貼一次網址試試看' }
    }

    if (input.type === 'OPAY') {
      return { error: '暫時不支援歐付寶 OPAY' }
    }

    const { token } = await getToken(input.id, input.type === 'ECPAY_STAGE')

    if (!token) {
      return { error: '無法取得連線 token' }
    }

    const hubConnection = await startEcpayConnection(token, input.type === 'ECPAY_STAGE')

    if (hubConnection === null) {
      return { error: '與綠界建立 signalr 連線時失敗' }
    }

    listen(input.id)

    return { error: null }
  }),

  disconnectPaymentUrl: t.procedure.mutation(async () => {
    await stopEcpayConnection()

    return { error: null }
  }),

  start: t.procedure.input(z.object({ videoId: z.string() })).mutation(async ({ input }) => {
    const { videoId } = input

    const youtube = await getInnertubeClient()

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    const video = await youtube.getInfo(videoId)

    const { basic_info: basicInfo } = await youtube.getInfo(videoId)

    const videoInfo: VideoInfo = {
      id: videoId,
      isLive: !!basicInfo.is_live,
      isUpcoming: !!basicInfo.is_upcoming,
      title: basicInfo.title ?? '',
      startTimestamp: basicInfo.start_timestamp?.valueOf() ?? 0,
    }

    console.log(`🚀 start observing live chat data from the video: (${videoUrl})`)
    console.log(JSON.stringify(videoInfo, null, 2))
    console.log()

    if (!videoInfo.isLive && !videoInfo.isUpcoming) {
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

    livechat.on('chat-update', (chatAction) => {
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
})

export type AppRouter = typeof router

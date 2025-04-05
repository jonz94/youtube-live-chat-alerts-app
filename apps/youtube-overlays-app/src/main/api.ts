import { is } from '@electron-toolkit/utils'
import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { getConnectionState, getToken, listen, startEcpayConnection, stopEcpayConnection } from './ecpay'
import { startLivechat, stopLivechat } from './innertube'
import { parsedPaymentUrlDataSchema, templateSchema } from './schema'
import {
  addPaymentsSettings,
  getSettings,
  hideTempDonation,
  removeChannelInfoSetting,
  removePaymentsSettings,
  resetImage,
  resetSoundEffect,
  updateAnimationTimeInMillisecondsSetting,
  updateChannelInfoSetting,
  updateImage,
  updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplateSetting,
  updateProgressBarCurrentValueSetting,
  updateProgressBarCurrentValueSettingViaDelta,
  updateProgressBarTargetValueSetting,
  updateProgressBarTextSetting,
  updateSoundEffect,
  updateVolumeSetting,
} from './settings'
import { getChannel, getLiveOrUpcomingStreams } from './utils'
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

  getConnectionState: t.procedure.query(() => {
    return getConnectionState()
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

    addPaymentsSettings(input)

    return { error: null }
  }),

  disconnectPaymentUrl: t.procedure.mutation(async () => {
    await stopEcpayConnection()

    return { error: null }
  }),

  hideDonation: t.procedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    hideTempDonation(input.id)

    return { error: null }
  }),

  removePaymentSetting: t.procedure.input(parsedPaymentUrlDataSchema).mutation(async ({ input }) => {
    await stopEcpayConnection()

    removePaymentsSettings(input)

    return { error: null }
  }),

  updateProgressBarTextSetting: t.procedure.input(z.object({ text: z.string() })).mutation(({ input }) => {
    updateProgressBarTextSetting(input.text)

    return { error: null, data: input.text }
  }),

  updateProgressBarCurrentValueSetting: t.procedure.input(z.object({ value: z.number() })).mutation(({ input }) => {
    updateProgressBarCurrentValueSetting(input.value)

    return { error: null, data: input.value }
  }),

  updateProgressBarCurrentValueSettingViaDelta: t.procedure
    .input(z.object({ delta: z.number() }))
    .mutation(({ input }) => {
      updateProgressBarCurrentValueSettingViaDelta(input.delta)

      return { error: null, data: input.delta }
    }),

  updateProgressBarTargetValueSetting: t.procedure.input(z.object({ value: z.number() })).mutation(({ input }) => {
    updateProgressBarTargetValueSetting(input.value)

    return { error: null, data: input.value }
  }),

  startLivechat: t.procedure.input(z.object({ videoId: z.string() })).mutation(async ({ input }) => {
    const { videoId } = input

    const videoInfo = await startLivechat(videoId)

    return { error: null, data: videoInfo }
  }),

  stopLivechat: t.procedure.mutation(() => {
    stopLivechat()

    return { error: null }
  }),
})

export type AppRouter = typeof router

import { z } from 'zod'

export const DEFAULT_ANIMATION_TIME_IN_MILLISECONDS = 10_000
export const DEFAULT_VOLUME = 50
export const DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE = [
  {
    type: 'text',
    text: '感謝',
  },
  {
    type: 'variable',
    attrs: {
      id: 'name',
    },
  },
  {
    type: 'text',
    text: '種了',
  },
  {
    type: 'variable',
    attrs: {
      id: 'amount',
    },
  },
  {
    type: 'text',
    text: '個貓草',
  },
] satisfies Template

export const channelInfoSchema = z.object({
  id: z.string(),
  handle: z.string().nullable(),
  name: z.string(),
  avatar: z.string().url().nullable(),
})

export type ChannelInfo = z.infer<typeof channelInfoSchema>

const textNodeSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
})

const variableNodeSchema = z.object({
  type: z.literal('variable'),
  attrs: z.object({
    id: z.string(),
  }),
})

const templateNodeSchema = z.discriminatedUnion('type', [textNodeSchema, variableNodeSchema])

export const templateSchema = z.array(templateNodeSchema)

export type Template = z.infer<typeof templateSchema>

export const settingsSchema = z.object({
  animationTimeInMilliseconds: z.number().default(DEFAULT_ANIMATION_TIME_IN_MILLISECONDS),
  volume: z.number().default(DEFAULT_VOLUME),
  channelInfo: channelInfoSchema.nullable().default(null),
  liveChatSponsorshipsGiftPurchaseAnnouncementTemplate: templateSchema.default(
    DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE,
  ),
})

export type SettingsSchema = z.infer<typeof settingsSchema>

export interface VideoInfo {
  id: string
  isLive: boolean
  isUpcoming: boolean
  title: string
  startTimestamp: number
}

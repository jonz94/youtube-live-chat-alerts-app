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
  liveChatSponsorshipsGiftPurchaseAnnouncementTemplate: templateSchema.default(
    DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE,
  ),
})

export type SettingsSchema = z.infer<typeof settingsSchema>

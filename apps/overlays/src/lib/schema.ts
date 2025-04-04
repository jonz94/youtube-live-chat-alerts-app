import { z } from 'zod'

export const DEFAULT_ANIMATION_TIME_IN_MILLISECONDS = 10_000
export const DEFAULT_VOLUME = 50
export const DEFAULT_PROGRESSBAR_TAGET_VALUE = 10_000
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
    text: '贈送了',
  },
  {
    type: 'variable',
    attrs: {
      id: 'amount',
    },
  },
  {
    type: 'text',
    text: '個會員',
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

const tempDonationSchema = z.object({
  uniqueId: z.string(),
  type: z.string(),
  to: z.string(),
  nickname: z.string(),
  price: z.number().nullable(),
  message: z.string().optional(),
  createdAt: z.number(),
  hide: z.boolean().optional().default(false),
})

export const settingsSchema = z.object({
  animationTimeInMilliseconds: z.number().default(DEFAULT_ANIMATION_TIME_IN_MILLISECONDS),
  volume: z.number().default(DEFAULT_VOLUME),
  liveChatSponsorshipsGiftPurchaseAnnouncementTemplate: templateSchema.default(
    DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE,
  ),

  progressBarText: z.string().default(''),
  progressBarCurrentValue: z.number().default(0),
  progressBarTargetValue: z.number().default(DEFAULT_PROGRESSBAR_TAGET_VALUE),

  // TODO: remove this after saving donation data into database
  tempDonations: z.array(tempDonationSchema).default([]),
})

export type SettingsSchema = z.infer<typeof settingsSchema>

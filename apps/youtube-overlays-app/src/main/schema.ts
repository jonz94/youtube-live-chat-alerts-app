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

const now = Date.now()

export const DEFAULT_TEMP_DONATIONS = [
  {
    uniqueId: 'temp11',
    to: 'temp',
    type: 'TEMP',
    price: 10000,
    nickname: '測試者',
    message: '這是一筆贊助測試~',
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp10',
    to: 'temp',
    type: 'TEMP',
    price: 2820,
    nickname: '測試者',
    message: 'RGB 彩虹測試！',
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp9',
    to: 'temp',
    type: 'TEMP',
    price: 1500,
    nickname: '名字很長'.repeat(10),
    message: '很長很長的文字測試~'.repeat(10),
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp8',
    to: 'temp',
    type: 'TEMP',
    price: 750,
    nickname: '測試者',
    message: '這是一筆贊助測試~',
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp7',
    to: 'temp',
    type: 'TEMP',
    price: 300,
    nickname: '測試者',
    message: '這是一筆贊助測試~',
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp6',
    to: 'temp',
    type: 'TEMP',
    price: 150,
    nickname: '測試者',
    message: '這是一筆贊助測試~',
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp5',
    to: 'temp',
    type: 'TEMP',
    price: 75,
    nickname: '測試者',
    message: '這是一筆贊助測試~',
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp4',
    to: 'temp',
    type: 'TEMP',
    price: 30,
    nickname: '測試者',
    message: '這是一筆贊助測試~',
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp3',
    to: 'temp',
    type: 'TEMP',
    price: 15,
    nickname: '測試者',
    message: '這是一筆贊助測試~',
    createdAt: now,
    hide: false,
  },
  {
    uniqueId: 'temp2',
    to: 'temp',
    type: 'TEMP',
    price: 0,
    nickname: '測試者',
    message: '這是一筆贊助測試~',
    createdAt: now,
    hide: false,
  },
  { uniqueId: 'temp1', to: 'temp', type: 'TEMP', price: null, nickname: '測試者', createdAt: now, hide: false },
] satisfies TempDonation[]

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

export const parsedPaymentUrlDataSchema = z.object({
  type: z.enum(['ECPAY', 'ECPAY_STAGE', 'OPAY', 'UNKNOWN']),
  id: z.string(),
})

export type ParsedPaymentUrlData = z.infer<typeof parsedPaymentUrlDataSchema>

// TODO: remove this after saving donation data into database
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

export type TempDonation = z.infer<typeof tempDonationSchema>

export const settingsSchema = z.object({
  animationTimeInMilliseconds: z.number().default(DEFAULT_ANIMATION_TIME_IN_MILLISECONDS),
  volume: z.number().default(DEFAULT_VOLUME),
  channelInfo: channelInfoSchema.nullable().default(null),
  liveChatSponsorshipsGiftPurchaseAnnouncementTemplate: templateSchema.default(
    DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE,
  ),
  payments: z.array(parsedPaymentUrlDataSchema).default([]),
  progressBarText: z.string().default(''),
  progressBarCurrentValue: z.number().default(0),
  progressBarTargetValue: z.number().default(DEFAULT_PROGRESSBAR_TAGET_VALUE),

  // TODO: remove this after saving donation data into database
  tempDonations: z.array(tempDonationSchema).default(DEFAULT_TEMP_DONATIONS),
})

export type SettingsSchema = z.infer<typeof settingsSchema>

export interface VideoInfo {
  id: string
  isLive: boolean
  isUpcoming: boolean
  title: string
  startTimestamp: number
}

export interface Donation {
  type: 'ECPAY'
  nickname: string
  price: number
  message?: string
  isTesting?: boolean
}

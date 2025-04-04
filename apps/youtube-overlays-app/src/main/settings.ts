import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  ChannelInfo,
  DEFAULT_ANIMATION_TIME_IN_MILLISECONDS,
  DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE,
  DEFAULT_PROGRESSBAR_TAGET_VALUE,
  DEFAULT_TEMP_DONATIONS,
  DEFAULT_VOLUME,
  ParsedPaymentUrlData,
  settingsSchema,
  SettingsSchema,
  TempDonation,
  type Template,
} from './schema'
import { io } from './websocket'

let settings: SettingsSchema = {
  animationTimeInMilliseconds: DEFAULT_ANIMATION_TIME_IN_MILLISECONDS,
  volume: DEFAULT_VOLUME,
  channelInfo: null,
  liveChatSponsorshipsGiftPurchaseAnnouncementTemplate:
    DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE,
  payments: [],
  progressBarText: '',
  progressBarCurrentValue: 0,
  progressBarTargetValue: DEFAULT_PROGRESSBAR_TAGET_VALUE,

  // TODO: remove this after saving donation data into database
  tempDonations: DEFAULT_TEMP_DONATIONS,
}

const DEFAULT_SOUND_EFFECT_PATH = is.dev
  ? resolve(import.meta.dirname, '..', '..', 'resources', 'sound.m4a')
  : resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'sound.m4a')

const DEFAULT_IMAGE_PATH = is.dev
  ? resolve(import.meta.dirname, '..', '..', 'resources', 'icon.png')
  : resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'icon.png')

// FIXME: remove this after allowing user to set avatar for paid message
const DEFAULT_AVATAR_PATH = is.dev
  ? resolve(import.meta.dirname, '..', '..', 'resources', 'icon.png')
  : resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'icon.png')

// FIXME: remove this after allowing user to set progress bar image
const DEFAULT_PROGRESS_IMAGE_PATH = is.dev
  ? resolve(import.meta.dirname, '..', '..', 'resources', 'progress.gif')
  : resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'progress.gif')

const AMOUNT = ['1', '5', '10', '20', '50'] as const

export function getSettingsDir() {
  if (is.dev) {
    const monorepoProjectRoot = resolve(import.meta.dirname, '..', '..', '..', '..')

    return resolve(monorepoProjectRoot, 'tmp')
  }

  return resolve(app.getPath('appData'), app.getName())
}

function getSettingsPath() {
  const fileName = 'settings.json'

  return resolve(getSettingsDir(), fileName)
}

export function initializeSettings() {
  const settingsPath = getSettingsPath()
  const settingsDir = resolve(getSettingsPath(), '..')

  if (!existsSync(settingsPath)) {
    if (!existsSync(settingsDir)) {
      mkdirSync(settingsDir, { recursive: true })
    }

    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
  }

  const assetsDir = resolve(settingsDir, 'assets')

  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true })
  }

  const legacySoundEffectPath = resolve(assetsDir, 'sound.mp3')
  const hasLegacySoundEffect = existsSync(legacySoundEffectPath)
  const soundEffectPaths = AMOUNT.map((item) => resolve(assetsDir, `sound${item}.mp3`))

  for (const soundEffectPath of soundEffectPaths) {
    if (!existsSync(soundEffectPath)) {
      if (hasLegacySoundEffect) {
        copyFileSync(legacySoundEffectPath, soundEffectPath)
      } else {
        copyFileSync(DEFAULT_SOUND_EFFECT_PATH, soundEffectPath)
      }
    }
  }

  if (hasLegacySoundEffect) {
    rmSync(legacySoundEffectPath, { force: true })
  }

  const legacyImagePath = resolve(assetsDir, 'image.gif')
  const hasLegacyImage = existsSync(legacyImagePath)
  const imagesPaths = AMOUNT.map((item) => resolve(assetsDir, `image${item}.gif`))

  for (const imagePath of imagesPaths) {
    if (!existsSync(imagePath)) {
      if (hasLegacyImage) {
        copyFileSync(legacyImagePath, imagePath)
      } else {
        copyFileSync(DEFAULT_IMAGE_PATH, imagePath)
      }
    }
  }

  if (hasLegacyImage) {
    rmSync(legacyImagePath, { force: true })
  }

  // FIXME: remove this after allowing user to set avatar for paid message
  const avatarPath = resolve(assetsDir, 'avatar.gif')
  if (!existsSync(avatarPath)) {
    copyFileSync(DEFAULT_AVATAR_PATH, avatarPath)
  }

  // FIXME: remove this after allowing user to set progress bar image
  const progressImagePath = resolve(assetsDir, 'progress.gif')
  if (!existsSync(progressImagePath)) {
    copyFileSync(DEFAULT_PROGRESS_IMAGE_PATH, progressImagePath)
  }

  const settingsContent = readFileSync(settingsPath, 'utf-8')

  settings = settingsSchema.parse(JSON.parse(settingsContent))

  console.dir({ settings }, { depth: Infinity })

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return settings
}

export function getSettings() {
  return settings
}

export function updateAnimationTimeInMillisecondsSetting(input: number) {
  settings.animationTimeInMilliseconds = input

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return input
}

export function updateImage(newImagePath: string, amount: number) {
  if (!existsSync(newImagePath)) {
    return { error: '找不到此檔案', newImagePath, amount }
  }

  const imagePath = resolve(getSettingsPath(), '..', 'assets', `image${amount}.gif`)

  rmSync(imagePath, { force: true })

  copyFileSync(newImagePath, imagePath)

  return { error: '', newImagePath, amount }
}

export function resetImage(amount: number) {
  const imagePath = resolve(getSettingsDir(), 'assets', `image${amount}.gif`)

  rmSync(imagePath, { force: true })

  copyFileSync(DEFAULT_IMAGE_PATH, imagePath)

  return { amount }
}

export function updateSoundEffect(newSoundEffectPath: string, amount: number) {
  if (!existsSync(newSoundEffectPath)) {
    return { error: '找不到此檔案', newSoundFilePath: newSoundEffectPath, amount }
  }

  const soundEffectPath = resolve(getSettingsDir(), 'assets', `sound${amount}.mp3`)

  rmSync(soundEffectPath, { force: true })

  copyFileSync(newSoundEffectPath, soundEffectPath)

  return { error: '', newSoundFilePath: newSoundEffectPath, amount }
}

export function resetSoundEffect(amount: number) {
  const soundEffectPath = resolve(getSettingsDir(), 'assets', `sound${amount}.mp3`)

  rmSync(soundEffectPath, { force: true })

  copyFileSync(DEFAULT_SOUND_EFFECT_PATH, soundEffectPath)

  return { amount }
}

export function updateVolumeSetting(input: number) {
  settings.volume = input

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return input
}

export function updateChannelInfoSetting(input: ChannelInfo) {
  settings.channelInfo = input

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return input
}

export function removeChannelInfoSetting() {
  settings.channelInfo = null

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
}

export function updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplateSetting(template: Template) {
  settings.liveChatSponsorshipsGiftPurchaseAnnouncementTemplate = template

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return template
}

export function addPaymentsSettings(payment: ParsedPaymentUrlData) {
  settings.payments = [...settings.payments, payment]

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return payment
}

export function removePaymentsSettings(payment: ParsedPaymentUrlData) {
  settings.payments = []

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return payment
}

export function addTempDonation(donation: TempDonation) {
  const donations = [...settings.tempDonations, donation]

  const uniqueDonations = donations.filter(
    (item, index) => donations.findIndex((donation) => donation.uniqueId === item.uniqueId) === index,
  )

  settings.tempDonations = uniqueDonations

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  io?.emit('donation-list-updated')
}

export function updateProgressBarTextSetting(text: string) {
  settings.progressBarText = text

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  io?.emit('progress-bar-updated')

  return text
}

export function updateProgressBarCurrentValueSetting(value: number) {
  settings.progressBarCurrentValue = value <= 0 ? 0 : Math.floor(value)

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  io?.emit('progress-bar-updated')

  return value
}

export function updateProgressBarCurrentValueSettingViaDelta(delta: number) {
  const value = settings.progressBarCurrentValue + Math.floor(delta)

  return updateProgressBarCurrentValueSetting(value)
}

export function updateProgressBarTargetValueSetting(value: number) {
  settings.progressBarTargetValue = value <= 1 ? 1 : Math.floor(value)

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  io?.emit('progress-bar-updated')

  return value
}

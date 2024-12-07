import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  DEFAULT_ANIMATION_TIME_IN_MILLISECONDS,
  DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE,
  DEFAULT_VOLUME,
  settingsSchema,
  SettingsSchema,
  type Template,
} from './schema'

let settings: SettingsSchema = {
  animationTimeInMilliseconds: DEFAULT_ANIMATION_TIME_IN_MILLISECONDS,
  volume: DEFAULT_VOLUME,
  liveChatSponsorshipsGiftPurchaseAnnouncementTemplate:
    DEFAULT_LIVE_CHAT_SPONSORSHIPS_GIFT_PURCHASE_ANNOUNCEMENT_TEMPLATE,
}

const DEFAULT_SOUND_EFFECT_PATH = is.dev
  ? resolve(import.meta.dirname, '..', '..', 'resources', 'sound.m4a')
  : resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'sound.m4a')

const DEFAULT_IMAGE_PATH = is.dev
  ? resolve(import.meta.dirname, '..', '..', 'resources', 'icon.png')
  : resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'icon.png')

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

  const settingsContent = readFileSync(settingsPath, 'utf-8')

  settings = settingsSchema.parse(JSON.parse(settingsContent))

  console.dir({ settings }, { depth: Infinity })

  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
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

export function updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplateSetting(template: Template) {
  settings.liveChatSponsorshipsGiftPurchaseAnnouncementTemplate = template

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return template
}

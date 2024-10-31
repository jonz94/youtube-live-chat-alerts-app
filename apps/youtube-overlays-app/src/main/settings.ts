import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

const DEFAULT_ANIMATION_TIME_IN_MILLISECONDS = 10_000
const DEFAULT_VOLUME = 50

const settingsSchema = z.object({
  animationTimeInMilliseconds: z.number().default(DEFAULT_ANIMATION_TIME_IN_MILLISECONDS),
  volume: z.number().default(DEFAULT_VOLUME),
})

export type SettingsSchema = z.infer<typeof settingsSchema>

let settings: SettingsSchema = {
  animationTimeInMilliseconds: DEFAULT_ANIMATION_TIME_IN_MILLISECONDS,
  volume: DEFAULT_VOLUME,
}

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

  const soundEffectPath = resolve(assetsDir, 'sound.mp3')

  if (!existsSync(soundEffectPath)) {
    if (is.dev) {
      copyFileSync(
        // default sound effect
        resolve(import.meta.dirname, '..', '..', 'resources', 'sound.ogg'),
        soundEffectPath,
      )
    } else {
      copyFileSync(
        // default sound effect
        resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'sound.ogg'),
        soundEffectPath,
      )
    }
  }

  const imagePath = resolve(assetsDir, 'image.gif')

  if (!existsSync(imagePath)) {
    if (is.dev) {
      copyFileSync(
        // default image
        resolve(import.meta.dirname, '..', '..', 'resources', 'icon.png'),
        imagePath,
      )
    } else {
      copyFileSync(
        // default image
        resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'icon.png'),
        imagePath,
      )
    }
  }

  const settingsContent = readFileSync(settingsPath, 'utf-8')

  settings = settingsSchema.parse(JSON.parse(settingsContent))

  console.log({ settings })

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

export function updateImage(newImagePath: string) {
  if (!existsSync(newImagePath)) {
    return { error: '找不到此檔案', newImagePath }
  }

  const imagePath = resolve(getSettingsPath(), '..', 'assets', 'image.gif')

  rmSync(imagePath, { force: true })

  copyFileSync(newImagePath, imagePath)

  return { error: '', newImagePath }
}

export function resetImage() {
  const imagePath = resolve(getSettingsDir(), 'assets', 'image.gif')

  rmSync(imagePath, { force: true })

  if (is.dev) {
    copyFileSync(
      // default image
      resolve(import.meta.dirname, '..', '..', 'resources', 'icon.png'),
      imagePath,
    )
  } else {
    copyFileSync(
      // default image
      resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'icon.png'),
      imagePath,
    )
  }
}

export function updateSoundEffect(newSoundEffectPath: string) {
  if (!existsSync(newSoundEffectPath)) {
    return { error: '找不到此檔案', newSoundFilePath: newSoundEffectPath }
  }

  const soundEffectPath = resolve(getSettingsPath(), '..', 'assets', 'image.gif')

  rmSync(soundEffectPath, { force: true })

  copyFileSync(newSoundEffectPath, soundEffectPath)

  return { error: '', newSoundFilePath: newSoundEffectPath }
}

export function resetSoundEffect() {
  const soundEffectPath = resolve(getSettingsDir(), 'assets', 'sound.mp3')

  rmSync(soundEffectPath, { force: true })

  if (is.dev) {
    copyFileSync(
      // default sound effect
      resolve(import.meta.dirname, '..', '..', 'resources', 'sound.ogg'),
      soundEffectPath,
    )
  } else {
    copyFileSync(
      // default sound effect
      resolve(app.getAppPath(), '..', '..', 'resources', 'app.asar.unpacked', 'resources', 'sound.ogg'),
      soundEffectPath,
    )
  }
}

export function updateVolumeSetting(input: number) {
  settings.volume = input

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

  return input
}

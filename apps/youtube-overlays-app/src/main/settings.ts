import { is } from '@electron-toolkit/utils'
import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

const settingsSchema = z.object({
  animationTimeInMilliseconds: z.number(),
})

export type SettingsSchema = z.infer<typeof settingsSchema>

let settings: SettingsSchema = {
  animationTimeInMilliseconds: 10000,
}

function getSettingsPath() {
  const fileName = 'settings.json'

  if (is.dev) {
    const monorepoProjectRoot = resolve(import.meta.dirname, '..', '..', '..', '..')

    return resolve(monorepoProjectRoot, 'tmp', fileName)
  }

  return resolve(app.getPath('appData'), app.getName(), fileName)
}

export function initializeSettings() {
  const settingsPath = getSettingsPath()
  const settingsDir = resolve(getSettingsPath(), '..')

  if (!existsSync(settingsPath)) {
    if (!existsSync(settingsDir)) {
      mkdirSync(settingsDir, { recursive: true })
    }

    writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')

    return
  }

  const settingsContent = readFileSync(settingsPath, 'utf-8')

  settings = settingsSchema.parse(JSON.parse(settingsContent))

  console.log({ settings })
}

export function getSettings() {
  return settings
}

export function updateAnimationTimeInMillisecondsSetting(input: number) {
  settings.animationTimeInMilliseconds = input

  const settingsPath = getSettingsPath()
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
}

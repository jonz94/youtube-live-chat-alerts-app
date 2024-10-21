import { execSync } from 'node:child_process'
import { existsSync, renameSync, unlinkSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function getDirname() {
  return import.meta.dirname ?? dirname(fileURLToPath(import.meta.url))
}

const appProjectRoot = resolve(getDirname(), '..')
const projectRoot = resolve(appProjectRoot, '..')
const youtubeiProjectRoot = resolve(projectRoot, 'YouTube.js')

execSync('npm ci', { cwd: youtubeiProjectRoot })
execSync('npm pack', { cwd: youtubeiProjectRoot })

const fileName = 'youtubei.js-10.0.0.tgz'
const original = resolve(projectRoot, fileName)
const rebuild = resolve(youtubeiProjectRoot, fileName)

if (existsSync(rebuild)) {
  if (existsSync(original)) {
    unlinkSync(original)
  }

  renameSync(rebuild, original)
}

execSync('pnpm i', { cwd: appProjectRoot })

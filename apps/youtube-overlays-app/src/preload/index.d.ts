import { ElectronAPI } from '@electron-toolkit/preload'
import { webUtils } from 'electron'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getPathForFile: typeof webUtils.getPathForFile
    }
  }
}

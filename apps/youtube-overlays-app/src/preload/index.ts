import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, webUtils } from 'electron'
import { exposeElectronTRPC } from 'trpc-electron/main'

exposeElectronTRPC()

const api = {
  getPathForFile: webUtils.getPathForFile,
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

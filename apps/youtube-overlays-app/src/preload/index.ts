import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, webUtils } from 'electron'
import { exposeElectronTRPC } from 'trpc-electron/main'

exposeElectronTRPC()

const api = {
  // eslint-disable-next-line @typescript-eslint/unbound-method
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
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.api = api
}

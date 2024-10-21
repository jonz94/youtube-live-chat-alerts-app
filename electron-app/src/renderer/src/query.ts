export const getVideoBasicInfo = (videoId: string) => {
  return async () => {
    const result = await window.electron.ipcRenderer.invoke('ping', videoId)

    return result
  }
}

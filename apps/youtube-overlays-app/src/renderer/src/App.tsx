import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { Connection } from '~/renderer/components/connection'
import { Launcher } from '~/renderer/components/launcher'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import { Open } from '~/renderer/components/open'
import { Settings } from '~/renderer/components/settings'
import { SoundEffect } from '~/renderer/components/sound-effect'
import { FullscreenScrollArea } from '~/renderer/components/ui/scroll-area'
import { viewportRefAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'

export default function App() {
  const [, setViewportRef] = useAtom(viewportRefAtom)
  const { data, error, isLoading } = trpcReact.initial.useQuery()

  const callbackRef = useCallback<React.RefCallback<HTMLDivElement>>(
    (node) => {
      if (node) {
        setViewportRef({ current: node })
      }
    },
    [setViewportRef],
  )

  if (isLoading) {
    return <p>程式初始化中...</p>
  }

  if (error) {
    return (
      <div className="text-center">
        <p>程式初始化時發生錯誤：</p>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return <p>程式初始化失敗...</p>
  }

  return (
    <FullscreenScrollArea viewportRef={callbackRef} className="h-screen w-screen">
      <div className="max-w-lg min-h-screen grid gap-y-4 py-8 px-4 place-content-center mx-auto">
        <Launcher isDev={data.isDev}></Launcher>
        <Connection></Connection>
        <Settings></Settings>
        <Open></Open>

        <AppWithSettings></AppWithSettings>
      </div>

      <div className="fixed top-4 right-4">
        <ModeToggle></ModeToggle>
      </div>
    </FullscreenScrollArea>
  )
}

function AppWithSettings() {
  const { data: settings, error, isLoading } = trpcReact.settings.useQuery()

  if (isLoading) {
    return <p>載入設定檔...</p>
  }

  if (error) {
    return (
      <div className="text-center">
        <p>載入設定檔時發生錯誤：</p>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!settings) {
    return <p>載入設定檔失敗...</p>
  }

  return <SoundEffect volume={settings.volume}></SoundEffect>
}

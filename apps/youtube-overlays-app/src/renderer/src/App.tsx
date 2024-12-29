import { Connection } from '~/renderer/components/connection'
import { Launcher } from '~/renderer/components/launcher'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import { Open } from '~/renderer/components/open'
import { Settings } from '~/renderer/components/settings'
import { SoundEffect } from '~/renderer/components/sound-effect'
import { trpcReact } from '~/renderer/trpc'

export default function App() {
  const { data, error, isLoading } = trpcReact.initial.useQuery()

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
    <div className="min-h-screen grid gap-y-4 py-8 px-4 place-content-center">
      <div className="fixed top-4 right-4">
        <ModeToggle></ModeToggle>
      </div>

      <Launcher isDev={data.isDev}></Launcher>
      <Connection></Connection>
      <Settings></Settings>
      <Open></Open>

      <AppWithSettings></AppWithSettings>
    </div>
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

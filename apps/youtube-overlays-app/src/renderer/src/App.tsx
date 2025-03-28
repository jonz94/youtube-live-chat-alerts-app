import { useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { Connection } from '~/renderer/components/connection'
import { DonationList } from '~/renderer/components/donation-list'
import { DonationProgressBar } from '~/renderer/components/donation-progress-bar'
import { Launcher } from '~/renderer/components/launcher'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import { Open } from '~/renderer/components/open'
import { PaymentConnection } from '~/renderer/components/payment-connection'
import { Settings } from '~/renderer/components/settings'
import { SoundEffect } from '~/renderer/components/sound-effect'
import { FullscreenScrollArea } from '~/renderer/components/ui/scroll-area'
import { viewportRefAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'

export default function App() {
  const setViewportRef = useSetAtom(viewportRefAtom)
  const { data, error, isLoading } = trpcReact.initial.useQuery()

  const [currentPage, setCurrentPage] = useState<'YOUTUBE_GIFTED_MEMBERSHIP' | 'DONATION_LIST' | 'PROGRESS_BAR'>(
    'YOUTUBE_GIFTED_MEMBERSHIP',
  )

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
      <div className="max-w-lg min-h-screen flex flex-col gap-y-4 py-8 px-4 justify-center mx-auto">
        <div className="flex gap-4">
          <div>切換選單:</div>
          <div onClick={() => setCurrentPage('YOUTUBE_GIFTED_MEMBERSHIP')}>YT 贈訂</div>
          <div onClick={() => setCurrentPage('DONATION_LIST')}>斗內清單</div>
          <div onClick={() => setCurrentPage('PROGRESS_BAR')}>進度條</div>
        </div>

        <div className="flex flex-col gap-y-4 flex-1">
          <section className={currentPage === 'YOUTUBE_GIFTED_MEMBERSHIP' ? 'contents' : 'hidden'}>
            <Launcher
              url={data.isDev ? 'http://localhost:1337/overlays' : 'http://localhost:21829/overlays'}
            ></Launcher>
            <Connection></Connection>
            <Settings></Settings>
            <Open></Open>

            <AppWithSettings></AppWithSettings>
          </section>

          <section className={currentPage === 'DONATION_LIST' ? 'contents' : 'hidden'}>
            <Launcher
              url={data.isDev ? 'http://localhost:1337/overlays' : 'http://localhost:21829/overlays'}
            ></Launcher>

            <PaymentConnection></PaymentConnection>
            <DonationList></DonationList>
          </section>

          <section className={currentPage === 'PROGRESS_BAR' ? 'contents' : 'hidden'}>
            <Launcher
              url={data.isDev ? 'http://localhost:1337/overlays' : 'http://localhost:21829/overlays'}
            ></Launcher>

            <DonationProgressBar></DonationProgressBar>
          </section>
        </div>
      </div>

      <div className="fixed top-6 right-6">
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

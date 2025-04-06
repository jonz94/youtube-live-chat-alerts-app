import { useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { Connection } from '~/renderer/components/connection'
import { DonationList } from '~/renderer/components/donation-list'
import { DonationProgressBar } from '~/renderer/components/donation-progress-bar'
import { DonationProgressBarSettings } from '~/renderer/components/donation-progress-bar-settings'
import { Launcher } from '~/renderer/components/launcher'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import { Open } from '~/renderer/components/open'
import { PaymentConnection } from '~/renderer/components/payment-connection'
import { Settings } from '~/renderer/components/settings'
import { SoundEffect } from '~/renderer/components/sound-effect'
import { FullscreenScrollArea } from '~/renderer/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '~/renderer/components/ui/tabs'
import { viewportRefAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'
import { PORT } from '../../main/const'

type Page = 'YOUTUBE_GIFTED_MEMBERSHIP' | 'DONATION_LIST' | 'PROGRESS_BAR'

const pages = ['YOUTUBE_GIFTED_MEMBERSHIP', 'DONATION_LIST', 'PROGRESS_BAR'] as const

const pageToPageName: Record<Page, string> = {
  YOUTUBE_GIFTED_MEMBERSHIP: 'YT 會員贈訂',
  DONATION_LIST: '斗內清單',
  PROGRESS_BAR: '斗內進度條',
}

export default function App() {
  const setViewportRef = useSetAtom(viewportRefAtom)
  const { data, error, isLoading } = trpcReact.initial.useQuery()

  const [currentPage, setCurrentPage] = useState<Page>('YOUTUBE_GIFTED_MEMBERSHIP')

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
      <Tabs
        value={currentPage}
        onValueChange={(value) => setCurrentPage(value as Page)}
        className="sticky z-10 top-0 bg-background"
      >
        <TabsList className="pt-6 h-auto justify-center">
          {pages.map((page) => (
            <TabsTrigger
              key={`tab-trigger-${page}`}
              value={page}
              className="text-base text-muted-foreground/90 dark:text-muted-foreground/90 transition-colors duration-300 hover:text-foreground dark:hover:text-foreground"
            >
              {pageToPageName[page]}
            </TabsTrigger>
          ))}

          <div className="absolute top-0 left-2 text-muted-foreground">v1.0.0-beta.1</div>

          <div className="absolute top-3 right-3">
            <ModeToggle></ModeToggle>
          </div>
        </TabsList>
      </Tabs>

      <div className="max-w-[29rem] min-h-screen flex flex-col gap-y-4 py-8 px-4 justify-center mx-auto">
        <div className="flex flex-col gap-y-4 flex-1">
          <section className={currentPage === 'YOUTUBE_GIFTED_MEMBERSHIP' ? 'contents' : 'hidden'}>
            <Launcher
              name={pageToPageName['YOUTUBE_GIFTED_MEMBERSHIP']}
              url={data.isDev ? 'http://localhost:1337/overlays' : `http://localhost:${PORT}/overlays`}
            ></Launcher>
            <Connection></Connection>
            <Settings></Settings>
            <Open></Open>

            <AppWithSettings></AppWithSettings>
          </section>

          <section className={currentPage === 'DONATION_LIST' ? 'contents' : 'hidden'}>
            <Launcher
              name={pageToPageName['DONATION_LIST']}
              url={
                data.isDev
                  ? 'http://localhost:1337/overlays/donation-list'
                  : `http://localhost:${PORT}/overlays/donation-list`
              }
            ></Launcher>

            <PaymentConnection></PaymentConnection>
            <DonationList></DonationList>
          </section>

          <section className={currentPage === 'PROGRESS_BAR' ? 'contents' : 'hidden'}>
            <Launcher
              name={pageToPageName['PROGRESS_BAR']}
              url={
                data.isDev
                  ? 'http://localhost:1337/overlays/progress-bar'
                  : `http://localhost:${PORT}/overlays/progress-bar`
              }
            ></Launcher>

            <DonationProgressBar></DonationProgressBar>
            <DonationProgressBarSettings></DonationProgressBarSettings>
          </section>
        </div>
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

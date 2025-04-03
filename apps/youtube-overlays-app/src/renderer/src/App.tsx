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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/renderer/components/ui/tabs'
import { viewportRefAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'

type Page = 'YOUTUBE_GIFTED_MEMBERSHIP' | 'DONATION_LIST' | 'PROGRESS_BAR'

const pages = ['YOUTUBE_GIFTED_MEMBERSHIP', 'DONATION_LIST', 'PROGRESS_BAR'] as const

const pageToPageName: Record<Page, string> = {
  YOUTUBE_GIFTED_MEMBERSHIP: 'YT 會員贈訂',
  DONATION_LIST: '斗內清單',
  PROGRESS_BAR: '進度條',
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
      <Tabs value={currentPage} onValueChange={(value) => setCurrentPage(value as Page)} className="pb-4">
        <TabsList className="before:bg-border relative h-auto w-full gap-2 bg-transparent pt-6 pb-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
          {pages.map((page) => (
            <TabsTrigger
              key={`tab-trigger-${page}`}
              value={page}
              className="w-28 bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
            >
              {pageToPageName[page]}
            </TabsTrigger>
          ))}

          <div className="absolute top-4 right-6">
            <ModeToggle></ModeToggle>
          </div>
        </TabsList>

        <TabsContent value="YOUTUBE_GIFTED_MEMBERSHIP">
          <div className="max-w-[29rem] flex flex-col gap-y-4 py-8 px-4 justify-center mx-auto">
            <Launcher
              url={data.isDev ? 'http://localhost:1337/overlays' : 'http://localhost:21829/overlays'}
            ></Launcher>
            <Connection></Connection>
            <Settings></Settings>
            <Open></Open>

            <AppWithSettings></AppWithSettings>
          </div>
        </TabsContent>
        <TabsContent value="DONATION_LIST">
          <div className="max-w-[29rem] flex flex-col gap-y-4 py-8 px-4 justify-center mx-auto">
            <Launcher
              url={data.isDev ? 'http://localhost:1337/overlays' : 'http://localhost:21829/overlays'}
            ></Launcher>

            <PaymentConnection></PaymentConnection>
            <DonationList></DonationList>
          </div>
        </TabsContent>
        <TabsContent value="PROGRESS_BAR">
          <div className="max-w-[29rem] flex flex-col gap-y-4 py-8 px-4 justify-center mx-auto">
            <Launcher
              url={data.isDev ? 'http://localhost:1337/overlays' : 'http://localhost:21829/overlays'}
            ></Launcher>

            <DonationProgressBar></DonationProgressBar>
          </div>
        </TabsContent>
      </Tabs>
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

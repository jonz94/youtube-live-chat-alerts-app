import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Progress } from '~/components/ui/progress'
import type { SettingsSchema } from '~/lib/schema'
import { fetchSettings } from '~/query'
import { socket } from '~/socket'

export const Route = createFileRoute('/progress-bar')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: settings, error, isLoading, refetch } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  useEffect(() => {
    function onProgressBarUpdate() {
      void refetch()
    }

    socket.on('progress-bar-updated', onProgressBarUpdate)

    return () => {
      socket.off('progress-bar-updated', onProgressBarUpdate)
    }
  }, [refetch])

  if (isLoading) {
    return <>設定載入中...</>
  }

  if (error) {
    return (
      <>
        <p>載入設定時發生錯誤！</p>
        <p>詳細錯誤訊息如下：</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </>
    )
  }

  if (!settings) {
    return <>載入設定時發生錯誤：設定資料空空如也</>
  }

  return <ProgressBar settings={settings}></ProgressBar>
}

const PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL = 4
const 上方預留空間_IN_PIXEL = 100

function ProgressBar({ settings }: { settings: SettingsSchema }) {
  const progress = settings.progressBarCurrentValue <= 0 ? 0 : settings.progressBarCurrentValue
  const target = settings.progressBarTargetValue <= 1 ? 1 : settings.progressBarTargetValue
  const text = settings.progressBarText

  const progressBarValue = (progress / target) * 100

  return (
    <div
      className="w-full px-8"
      style={{
        paddingBottom: 上方預留空間_IN_PIXEL,
      }}
    >
      <div className="relative isolate">
        <p
          className="absolute font-pixel text-2xl text-shadow text-white whitespace-pre"
          style={{
            zIndex: 10,
            top: -2 + 上方預留空間_IN_PIXEL,
            left: 16,
          }}
        >
          {!text ? '進度條 ' : `${text} `} {progress} / {target}
        </p>

        <div
          className="absolute transition-transform duration-1000 w-full"
          style={{
            zIndex: 20,
            left: 5,
            top: -50 + 上方預留空間_IN_PIXEL,
            transform: `translateX(${progressBarValue <= 1 ? 1 : progressBarValue >= 100 ? 100 : progressBarValue}%)`,
          }}
        >
          {/* FIXME: use settings.json to load this image */}
          <img
            className="-translate-x-1/2 -translate-y-1/2"
            src="http://localhost:21829/assets/progress.gif"
            alt=""
            style={{
              height: 'auto',
              width: 200,
            }}
          />
        </div>

        <div
          className="relative m-1"
          style={{
            zIndex: 0,
            top: 上方預留空間_IN_PIXEL,
            left: 0,
          }}
        >
          <Progress
            className="h-6 rounded-none bg-[#333]"
            value={progressBarValue < 1 ? 1 : progressBarValue}
          ></Progress>
          {/* top pixel border */}
          <div
            className="absolute bg-black"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: `calc(100% - ${2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
              top: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              right: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          {/* bottom pixel border */}
          <div
            className="absolute bg-black"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: `calc(100% - ${2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
              bottom: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              right: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          {/* top left corner pixel */}
          <div
            className="absolute bg-black top-0 left-0"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          {/* top right corner pixel */}
          <div
            className="absolute bg-black top-0 right-0"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          {/* bottom left corner pixel */}
          <div
            className="absolute bg-black bottom-0 left-0"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>

          {/* bottom right corner pixel */}
          <div
            className="absolute bg-black bottom-0 right-0"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          {/* left pixel border */}
          <div
            className="absolute bg-black"
            style={{
              height: `calc(100% - ${2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              bottom: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              left: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          {/* right pixel border */}
          <div
            className="absolute bg-black"
            style={{
              height: `calc(100% - ${2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              bottom: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              right: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>

          {/* right pixel shadown */}
          <div
            className="absolute bg-[#0004]"
            style={{
              height: `calc(100% - ${2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              top: 2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              right: -2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          {/* shadow */}
          <div
            className="absolute bg-[#0003]"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: `calc(100% - ${2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
              bottom: -2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              right: 0,
            }}
          ></div>
          <div
            className="absolute bg-[#0004]"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              bottom: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              right: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          <div
            className="absolute bg-[#0008]"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              bottom: 0,
              right: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            }}
          ></div>
          <div
            className="absolute bg-[#0008]"
            style={{
              height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              bottom: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
              right: 0,
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

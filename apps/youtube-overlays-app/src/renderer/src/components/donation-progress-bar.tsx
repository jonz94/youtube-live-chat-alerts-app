import { useEffect, useState } from 'react'
import { Progress } from '~/renderer/components/ui/progress'
import { socket } from '~/renderer/socket'

const TARGET = 100_000
const PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL = 4

interface Donation {
  type: 'ECPAY'
  to: string
  data: unknown
}

export function DonationProgressBar() {
  // TODO: use settings.json to load this value
  const [progress, setProgress] = useState(0)

  const progressBarValue = (progress / TARGET) * 100

  const 上方預留空間 = 80

  // TODO: listen socket event to increase progress
  useEffect(() => {
    // const timeout = setInterval(
    //   () => setProgress((progress) => progress + Math.floor(Math.random() * 10000 + 5000)),
    //   1000,
    // )
    // return () => clearInterval(timeout)
  }, [])

  useEffect(() => {
    function onReceiveDonation({ type, to, data }: Donation) {
      console.log('receive donation', type, to, data)
    }

    socket.on('receive-donation', onReceiveDonation)

    return () => {
      socket.off('receive-donation', onReceiveDonation)
    }
  }, [])

  return (
    <div className="mt-8 w-full px-4 flex flex-col gap-y-1 flex-1">
      <div className="relative isolate">
        <p
          className="absolute font-pixel text-2xl text-shadow text-white"
          style={{
            zIndex: 10,
            top: 0 + 上方預留空間,
            left: 16,
          }}
        >
          進度條 {progress}/{TARGET}
        </p>

        <div
          className="absolute transition-transform duration-1000 w-full"
          style={{
            zIndex: 20,
            left: 5,
            top: 30,
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
            top: 上方預留空間,
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

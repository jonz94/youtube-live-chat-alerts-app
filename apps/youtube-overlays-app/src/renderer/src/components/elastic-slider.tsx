import * as RadixSlider from '@radix-ui/react-slider'
import { Volume1, Volume2, VolumeX } from 'lucide-react'
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { type Dispatch, type SetStateAction, ElementRef, useRef, useState } from 'react'
import { Label } from '~/renderer/components/ui/label'

const MAX_OVERFLOW = 50

interface ElasticSliderProps {
  volume: number
  setVolume: Dispatch<SetStateAction<number>>
}

/**
 * sigmoid-based decay function
 */
function decay(value: number, max: number) {
  if (max === 0) {
    return 0
  }

  const entry = value / max
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5)

  return sigmoid * max
}

/**
 * credits: https://buildui.com/recipes/elastic-slider
 */
export default function ElasticSlider({ volume, setVolume }: ElasticSliderProps) {
  const ref = useRef<ElementRef<typeof RadixSlider.Root>>(null)
  const [region, setRegion] = useState('middle')
  const clientX = useMotionValue(0)
  const overflow = useMotionValue(0)
  const scale = useMotionValue(1.2)

  useMotionValueEvent(clientX, 'change', (latest) => {
    if (ref.current) {
      const { left, right } = ref.current.getBoundingClientRect()
      let newValue: number

      if (latest < left) {
        setRegion('left')
        newValue = left - latest
      } else if (latest > right) {
        setRegion('right')
        newValue = latest - right
      } else {
        setRegion('middle')
        newValue = 0
      }

      overflow.jump(decay(newValue, MAX_OVERFLOW))
    }
  })

  return (
    <>
      <div className="flex justify-center">
        <Label>音量: {volume}%</Label>
      </div>

      <motion.div
        style={{
          scale: 1.2,
          opacity: 1,
        }}
        className="flex w-full touch-none select-none items-center justify-center gap-3"
      >
        <motion.div
          animate={{
            scale: region === 'left' ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 },
          }}
          style={{
            x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0)),
          }}
        >
          {volume === 0 ? (
            <VolumeX className="size-5 translate-x-0 translate-y-0 text-foreground" />
          ) : (
            <Volume1 className="size-5 translate-x-0 translate-y-0 text-foreground" />
          )}
        </motion.div>

        <RadixSlider.Root
          ref={ref}
          value={[volume]}
          onValueChange={([v]) => setVolume(Math.floor(v))}
          step={0.01}
          className="relative flex w-full max-w-[200px] grow cursor-grab touch-none select-none items-center py-4 active:cursor-grabbing"
          onPointerMove={(e) => {
            if (e.buttons > 0) {
              clientX.jump(e.clientX)
            }
          }}
          onLostPointerCapture={() => {
            animate(overflow, 0, { type: 'spring', bounce: 0.5 })
          }}
        >
          <motion.div
            style={{
              scaleX: useTransform(() => {
                if (ref.current) {
                  const { width } = ref.current.getBoundingClientRect()

                  return 1 + overflow.get() / width
                }

                return
              }),
              scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
              transformOrigin: useTransform(() => {
                if (ref.current) {
                  const { left, width } = ref.current.getBoundingClientRect()

                  return clientX.get() < left + width / 2 ? 'right' : 'left'
                }

                return
              }),
              height: useTransform(scale, [1, 1.2], [6, 12]),
              marginTop: useTransform(scale, [1, 1.2], [0, -3]),
              marginBottom: useTransform(scale, [1, 1.2], [0, -3]),
            }}
            className="flex grow"
          >
            <RadixSlider.Track className="relative isolate h-full grow overflow-hidden rounded-full bg-primary/20 dark:bg-gray-500">
              <RadixSlider.Range className="absolute h-full bg-primary dark:bg-white" />
            </RadixSlider.Track>
          </motion.div>
        </RadixSlider.Root>

        <motion.div
          animate={{
            scale: region === 'right' ? [1, 1.4, 1] : 1,
            transition: { duration: 0.25 },
          }}
          style={{
            x: useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0)),
          }}
        >
          <Volume2 className="size-5 translate-x-0 translate-y-0 text-foreground" />
        </motion.div>
      </motion.div>
    </>
  )
}

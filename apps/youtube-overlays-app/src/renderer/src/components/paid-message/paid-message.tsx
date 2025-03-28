import { useWindowSize } from '~/renderer/hooks/use-window-size'
import { cn } from '~/renderer/lib/utils'
import './paid-message.css'

interface PaidMessageProp {
  headerBackgroundColor?: string
  contentBackgroundColor?: string
  textColor: string
  nickname: string
  price: number
  message?: string
  effect?: 'rainbow' | 'shiny'
  fill?: boolean
}

const DEFAULT_WIDTH_IN_PIXEL = 400
const IMAGE_SIZE_IN_PIXEL = 40
const PADDING_IN_PIXEL = 16
const GAP_IN_PIXEL = 8

export function PaidMessage({
  headerBackgroundColor,
  contentBackgroundColor,
  textColor,
  nickname,
  price,
  message,
  effect,
  fill = false,
}: PaidMessageProp) {
  const { width: windowWidth } = useWindowSize()

  const width = fill ? windowWidth : DEFAULT_WIDTH_IN_PIXEL

  return (
    <div
      className={cn('overflow-hidden flex flex-col', effect)}
      style={{
        width,
        borderRadius: 4,
      }}
    >
      <div
        className="font-normal text-[15px] w-full leading-[normal] py-2 min-h-[20px] grid items-center"
        style={{
          background: headerBackgroundColor,
          color: textColor,
          paddingLeft: PADDING_IN_PIXEL,
          paddingRight: PADDING_IN_PIXEL,
          columnGap: GAP_IN_PIXEL,
          gridTemplateColumns: `40px ${width - IMAGE_SIZE_IN_PIXEL - PADDING_IN_PIXEL - PADDING_IN_PIXEL - GAP_IN_PIXEL}px`,
        }}
      >
        <div
          className="overflow-hidden rounded-full bg-white"
          style={{ zIndex: 1000, width: IMAGE_SIZE_IN_PIXEL, height: IMAGE_SIZE_IN_PIXEL }}
        >
          <img alt="" className="max-h-full max-w-full" />
        </div>

        <div className="min-h-4" style={{ zIndex: 1000 }}>
          <div className="truncate w-full block">{nickname}</div>
          <div>
            $
            {new Intl.NumberFormat('zh-TW', {
              style: 'decimal',
              minimumFractionDigits: 2,
            }).format(price)}
          </div>
        </div>
      </div>

      <div
        className="font-normal text-base py-2 min-h-10"
        style={{
          background: contentBackgroundColor,
          color: textColor,
          paddingLeft: PADDING_IN_PIXEL,
          paddingRight: PADDING_IN_PIXEL,
        }}
      >
        <div
          className="flex items-center"
          style={{
            zIndex: 1000,
          }}
        >
          {message}
        </div>
      </div>
    </div>
  )
}

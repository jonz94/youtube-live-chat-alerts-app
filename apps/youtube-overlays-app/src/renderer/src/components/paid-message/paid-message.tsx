import { useWindowSize } from '~/renderer/hooks/use-window-size'
import { cn } from '~/renderer/lib/utils'

import './paid-message.css'

const DEFAULT_WIDTH_IN_PIXEL = 400
const IMAGE_SIZE_IN_PIXEL = 40
const PADDING_IN_PIXEL = 16
const GAP_IN_PIXEL = 8

const PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL = 4
const MARGIN_FOR_PIXEL_ART_IN_PIXEL = PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL * 2

type PriceVariant = { threshold: number; variant: string }

const defaultPriceRanges: PriceVariant[] = [
  { threshold: 0, variant: 'unknown' },
  { threshold: 29, variant: 'blue' },
  { threshold: 74, variant: 'cyan' },
  { threshold: 149, variant: 'green' },
  { threshold: 299, variant: 'yellow' },
  { threshold: 749, variant: 'orange' },
  { threshold: 1499, variant: 'pink' },
  { threshold: 2819, variant: 'red' },
  { threshold: 9999, variant: 'rainbow' },
  { threshold: Infinity, variant: 'purple' },
]

type Variant = {
  name: string
  effectClassName?: string
  headerBackgroundColor?: string
  contentBackgroundColor?: string
  textColor: string
}

const variants: Record<Variant['name'], Variant> = {
  blue: {
    name: 'blue',
    headerBackgroundColor: '#1565c0',
    contentBackgroundColor: '#1e88e5',
    textColor: 'white',
  },
  cyan: {
    name: 'cyan',
    headerBackgroundColor: '#00b8d4',
    contentBackgroundColor: '#00e5ff',
    textColor: 'black',
  },
  green: {
    name: 'green',
    headerBackgroundColor: '#00bfa5',
    contentBackgroundColor: '#1de9b6',
    textColor: 'black',
  },
  yellow: {
    name: 'yellow',
    headerBackgroundColor: '#ffb300',
    contentBackgroundColor: '#ffca28',
    textColor: 'black',
  },
  orange: {
    name: 'orange',
    headerBackgroundColor: '#e65100',
    contentBackgroundColor: '#f57c00',
    textColor: 'white',
  },
  pink: {
    name: 'pink',
    headerBackgroundColor: '#c2185b',
    contentBackgroundColor: '#e91e63',
    textColor: 'white',
  },
  red: {
    name: 'red',
    headerBackgroundColor: '#d00000',
    contentBackgroundColor: '#e62117',
    textColor: 'white',
  },
  rainbow: {
    name: 'rainbow',
    effectClassName: 'rainbow',
    textColor: 'white',
  },
  purple: {
    name: 'purple',
    headerBackgroundColor: '#6d28d9',
    contentBackgroundColor: '#7c3aed',
    textColor: 'white',
  },
  shiny: {
    name: 'shiny',
    effectClassName: 'shiny',
    textColor: 'black',
  },
  unknown: {
    name: 'unknown',
    textColor: 'unknown',
  },
}

export function priceToVariant(price: number | null, priceRanges: PriceVariant[] = defaultPriceRanges) {
  const matched = priceRanges.find(({ threshold }) => (price ?? 0) <= threshold)

  const variantName = matched?.variant ?? 'unknown'

  return variants[variantName]
}

type PaidMessageProp = {
  nickname: string
  price: number | null
  message?: string
  fill?: boolean
}

export function PaidMessage({ nickname, price, message, fill = false }: PaidMessageProp) {
  const { width: windowWidth } = useWindowSize()

  const width = fill ? windowWidth : DEFAULT_WIDTH_IN_PIXEL

  const variant = priceToVariant(price ?? 0)

  if (variant.name === 'unknown') {
    return null
  }

  return (
    <div
      className="overflow-hidden flex flex-col isolate"
      style={{
        width,
        borderRadius: 4,
      }}
    >
      <div
        className={cn(
          'font-normal text-[15px] leading-[normal] py-2 min-h-[20px] grid items-center',
          // for pixel art
          'relative',
          variant.effectClassName,
        )}
        style={{
          background: variant.headerBackgroundColor,
          color: variant.textColor,
          marginTop: MARGIN_FOR_PIXEL_ART_IN_PIXEL,
          marginRight: MARGIN_FOR_PIXEL_ART_IN_PIXEL,
          marginLeft: MARGIN_FOR_PIXEL_ART_IN_PIXEL,
          paddingLeft: PADDING_IN_PIXEL,
          paddingRight: PADDING_IN_PIXEL,
          columnGap: GAP_IN_PIXEL,
          gridTemplateColumns: `40px ${width - IMAGE_SIZE_IN_PIXEL - 2 * MARGIN_FOR_PIXEL_ART_IN_PIXEL - 2 * PADDING_IN_PIXEL - GAP_IN_PIXEL}px`,
        }}
      >
        <div
          className="overflow-hidden rounded-full bg-white"
          style={{ zIndex: 1000, width: IMAGE_SIZE_IN_PIXEL, height: IMAGE_SIZE_IN_PIXEL }}
        >
          <img src="http://localhost:21829/assets/avatar.gif" alt="" className="max-h-full max-w-full scale-75" />
        </div>

        <div className="min-h-4" style={{ zIndex: 1000 }}>
          <div className="truncate w-full block">{nickname}</div>
          <div>
            $
            {new Intl.NumberFormat('zh-TW', {
              style: 'decimal',
              minimumFractionDigits: 2,
            }).format(price ?? 0)}
          </div>
        </div>

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

        {/* left pixel border */}
        <div
          className="absolute bg-black"
          style={{
            height: `calc(100% - ${PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            top: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            left: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
          }}
        ></div>

        {/* right pixel border */}
        <div
          className="absolute bg-black"
          style={{
            height: `calc(100% - ${PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            top: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            right: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
          }}
        ></div>

        {/* right pixel shadown */}
        <div
          className="absolute bg-[#0004]"
          style={{
            height: `calc(100% - ${2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            bottom: 0,
            right: -2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
          }}
        ></div>
      </div>

      <div
        aria-label="content"
        className={cn(
          'font-normal text-base py-2 min-h-10',
          // for pixel art
          'relative',
          variant.effectClassName,
        )}
        style={{
          background: variant.contentBackgroundColor,
          color: variant.textColor,
          marginBottom: MARGIN_FOR_PIXEL_ART_IN_PIXEL,
          marginRight: MARGIN_FOR_PIXEL_ART_IN_PIXEL,
          marginLeft: MARGIN_FOR_PIXEL_ART_IN_PIXEL,
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
            height: `calc(100% - ${PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            bottom: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            left: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
          }}
        ></div>

        {/* right pixel border */}
        <div
          className="absolute bg-black"
          style={{
            height: `calc(100% - ${PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            bottom: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            right: -1 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
          }}
        ></div>

        {/* right pixel shadown */}
        <div
          className="absolute bg-[#0004]"
          style={{
            height: `100%`,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            top: 0,
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
  )
}

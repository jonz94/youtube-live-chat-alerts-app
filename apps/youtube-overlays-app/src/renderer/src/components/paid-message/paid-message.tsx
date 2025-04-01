import { useWindowSize } from '~/renderer/hooks/use-window-size'
import { cn } from '~/renderer/lib/utils'

import './paid-message.css'

const DEFAULT_WIDTH_IN_PIXEL = 400
const IMAGE_SIZE_IN_PIXEL = 40
const PADDING_IN_PIXEL = 16
const GAP_IN_PIXEL = 8

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
  { threshold: Infinity, variant: 'shiny' },
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

function priceToVariant(price: number, priceRanges: PriceVariant[] = defaultPriceRanges) {
  const matched = priceRanges.find(({ threshold }) => price <= threshold)

  const variantName = matched?.variant ?? 'unknown'

  return variants[variantName]
}

type PaidMessageProp = {
  nickname: string
  price: number
  message?: string
  fill?: boolean
}

export function PaidMessage({ nickname, price, message, fill = false }: PaidMessageProp) {
  const { width: windowWidth } = useWindowSize()

  const width = fill ? windowWidth : DEFAULT_WIDTH_IN_PIXEL

  const variant = priceToVariant(price)

  if (variant.name === 'unknown') {
    return null
  }

  return (
    <div
      className={cn('overflow-hidden flex flex-col', variant.effectClassName)}
      style={{
        width,
        borderRadius: 4,
      }}
    >
      <div
        className="font-normal text-[15px] w-full leading-[normal] py-2 min-h-[20px] grid items-center"
        style={{
          background: variant.headerBackgroundColor,
          color: variant.textColor,
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
          background: variant.contentBackgroundColor,
          color: variant.textColor,
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

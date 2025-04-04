import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '~/renderer/lib/utils'

const PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL = 4

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  value ??= 0

  const translateXValue = 100 - value

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="relative h-full w-full flex-1 bg-primary transition-all duration-1000"
        style={{ transform: `translateX(-${translateXValue <= 0 ? 0 : translateXValue}%)` }}
      >
        {/* left pixel border */}
        <div
          className="absolute bg-black"
          style={{
            height: `calc(100% - ${2 * PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            top: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            left: '100%',
          }}
        ></div>
        {/* top left corner pixel */}
        <div
          className="absolute bg-black"
          style={{
            height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            top: 0,
            left: `calc(100% - ${PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
          }}
        ></div>
        {/* bottom left corner pixel */}
        <div
          className="absolute bg-black"
          style={{
            height: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            width: PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL,
            bottom: 0,
            left: `calc(100% - ${PIXEL_SIZE_FOR_PIXEL_ART_IN_PIXEL}px)`,
          }}
        ></div>
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

import { AnimationProps, motion } from 'motion/react'
import { cn } from '~/renderer/lib/utils'

export function Bounce({
  children,
  delayInMilliseconds,
  className,
}: {
  children: string
  delayInMilliseconds: number
  className?: string
}) {
  const DURATION_IN_MILLISECONDS = 1_000

  // NOTE: the value of `animationDelayInMilliseconds` will be negative
  // a negative value indicates the animation should start as if it has already been playing
  // for the specified duration. this is useful for creating staggered animations where
  // multiple elements use the same animation but start at different points in time.
  const animationDelayInMilliseconds = (delayInMilliseconds % DURATION_IN_MILLISECONDS) - DURATION_IN_MILLISECONDS

  return (
    <b
      className={cn(
        'inline-block whitespace-pre animate-bounce duration-1000 repeat-infinite relative top-1',
        className,
      )}
      style={{
        animationDelay: `${animationDelayInMilliseconds}ms`,
      }}
    >
      {children}
    </b>
  )
}

export function TextEffect({
  children,
  className,
  animate,
  transition,
}: {
  children: string
  className?: string
  animate?: AnimationProps['animate']
  transition?: AnimationProps['transition']
}) {
  let spaceCount = 0

  // NOTE: instead of simple `children.split('')`, we use `Intl.Segmenter` API to better handle complex Emoji/Unicode
  const graphemes = [...new Intl.Segmenter().segment(children)].map((x) => x.segment)

  return graphemes.map((grapheme, index) => {
    if (grapheme === ' ') {
      spaceCount++
    }

    const delayInSeconds = (index - spaceCount) / 16
    const delayInMilliseconds = delayInSeconds * 1_000

    if (animate === 'bounce' || animate === undefined) {
      return (
        <Bounce key={`grapheme-${index}`} delayInMilliseconds={delayInMilliseconds}>
          {grapheme}
        </Bounce>
      )
    }

    return (
      <motion.b
        key={`grapheme-${index}`}
        className={cn('inline-block whitespace-pre', className)}
        animate={animate}
        transition={{
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 0.5,
          delay: delayInSeconds,
          ...transition,
        }}
      >
        {grapheme}
      </motion.b>
    )
  })
}

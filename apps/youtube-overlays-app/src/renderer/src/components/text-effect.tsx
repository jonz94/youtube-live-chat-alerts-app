import { AnimationProps, motion } from 'motion/react'
import { cn } from '~/renderer/lib/utils'

export function Bounce({
  children,
  delayInSeconds,
  className,
}: {
  children: string
  delayInSeconds: number
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-block whitespace-pre animate-bounce duration-1000 repeat-infinite relative top-1',
        className,
      )}
      style={{
        animationDelay: `${delayInSeconds}s`,
      }}
    >
      {children}
    </span>
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

  return children.split('').map((char, index) => {
    if (char === ' ') {
      spaceCount++
    }

    const delayInSeconds = (index - spaceCount) / 16

    if (animate === 'bounce' || animate === undefined) {
      return (
        <Bounce key={`char-${index}`} delayInSeconds={delayInSeconds}>
          {char}
        </Bounce>
      )
    }

    return (
      <motion.span
        key={`char-${index}`}
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
        {char}
      </motion.span>
    )
  })
}

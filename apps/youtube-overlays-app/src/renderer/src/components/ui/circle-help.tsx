import { motion, useAnimation, type Variants } from 'motion/react'
import { cn } from '~/renderer/lib/utils'

const variants: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -10, 10, -10, 0] },
}

const CircleHelpIcon = ({ className }: { className: string }) => {
  const controls = useAnimation()

  return (
    <div
      className={cn(
        'flex cursor-pointer select-none items-center justify-center rounded-md p-2 transition-colors duration-200 hover:bg-accent',
        className,
      )}
      onMouseEnter={() => void controls.start('animate')}
      onMouseLeave={() => void controls.start('normal')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <motion.g
          variants={variants}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
          }}
          animate={controls}
        >
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </motion.g>
      </svg>
    </div>
  )
}

export { CircleHelpIcon }

/**
 * Animated Tabs Component
 *
 * An enhanced tabs interface with a smooth animated underline that follows the active tab.
 *
 * credits: https://github.com/ibelick/motion-primitives/blob/a76299b99743501ac394f7b29903a1d772e3bf0d/components/website/tabs.tsx
 */

import * as TabsPrimitive from '@radix-ui/react-tabs'
import * as React from 'react'

import { motion } from 'motion/react'
import { cn } from '~/renderer/lib/utils'

const TabsContext = React.createContext<string>('')

const Tabs = ({ ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) => {
  const uniqueId = React.useId()
  return (
    <TabsContext value={uniqueId}>
      <TabsPrimitive.Root {...props} />
    </TabsContext>
  )
}
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-10 w-full items-center justify-start border-b border-zinc-200 bg-transparent text-zinc-900 dark:border-zinc-800 dark:text-zinc-50',
      className,
    )}
    {...props}
  />
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = ({
  className,
  children,
  classNameIndicator,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  classNameIndicator?: string
}) => {
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [isActive, setIsActive] = React.useState(false)
  const tabsId = React.use(TabsContext)

  React.useEffect(() => {
    const element = triggerRef.current

    if (!element) {
      return
    }

    setIsActive(element.dataset.state === 'active')

    const observer = new MutationObserver(() => {
      setIsActive(element.dataset.state === 'active')
    })

    observer.observe(element, { attributes: true })

    return () => observer.disconnect()
  }, [])

  return (
    <TabsPrimitive.Trigger
      ref={triggerRef}
      className={cn(
        'focus-visible:outline-hidden group relative inline-flex h-10 items-center justify-center whitespace-nowrap rounded-none bg-transparent px-4 py-1 pb-3 pt-2 text-sm font-medium text-zinc-500 ring-offset-background transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-zinc-950 dark:text-zinc-500 dark:data-[state=active]:text-white',
        className,
      )}
      {...props}
    >
      {isActive && (
        <motion.div
          layout
          className="absolute bottom-0 flex h-0.5 w-full justify-center"
          transition={{
            type: 'spring',
            stiffness: 26.7,
            damping: 4.1,
            mass: 0.2,
          }}
          layoutId={`underline-${tabsId}`}
        >
          <div className={cn('h-0.5 w-4/5 bg-zinc-950 dark:bg-white', classNameIndicator)} />
        </motion.div>
      )}
      {children}
    </TabsPrimitive.Trigger>
  )
}
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = ({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn(
      'focus-visible:outline-hidden relative mt-2 rounded-md ring-offset-blue-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsContent, TabsList, TabsTrigger }

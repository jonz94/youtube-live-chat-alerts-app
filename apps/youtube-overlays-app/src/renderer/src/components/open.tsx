import { motion } from 'framer-motion'
import { FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/renderer/components/ui/button'
import { cn } from '~/renderer/lib/utils'
import { trpcReact } from '~/renderer/trpc'

function TextEffect({ children, className }: { children: string; className?: string }) {
  let spaceCount = 0

  return children.split('').map((char, index) => {
    if (char === ' ') {
      spaceCount++
    }

    const delay = (index - spaceCount) / 10

    return (
      <motion.span
        key={index}
        className={cn('inline-block whitespace-pre', className)}
        animate={{
          y: [0, -4, 0, 4, 0],
        }}
        transition={{
          duration: 1,
          ease: 'linear',
          times: [0, 0.25, 0.5, 0.75, 1],
          repeat: Infinity,
          repeatDelay: 0,
          delay,
        }}
      >
        {char}
      </motion.span>
    )
  })
}

export function Open() {
  const { error, mutate, isPending } = trpcReact.open.useMutation({
    onSuccess: ({ opened }) => {
      if (opened) {
        toast.success('已成功送出贈訂測試訊息')
      }
    },
  })

  return (
    <div>
      <div className="flex gap-x-4 items-center">
        <Button variant="secondary" onClick={() => mutate()} disabled={isPending}>
          <FlaskConical />
          贈訂測試
        </Button>

        <div className="flex p-4 space-x-1 text-xl font-bold text-[#d48e26] text-shadow">
          <div>感謝</div>
          <div className="text-[#32c3a6] flex">
            <TextEffect>測試</TextEffect>
          </div>
          <div>種了</div>
          <div className="text-[#32c3a6] flex">
            <TextEffect>87</TextEffect>
          </div>
          <div>個貓草</div>
        </div>
      </div>

      {error ? (
        <div className="text-center">
          <p>發生錯誤：</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}

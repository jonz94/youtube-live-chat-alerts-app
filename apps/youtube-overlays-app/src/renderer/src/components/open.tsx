import { FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/renderer/components/ui/button'
import { trpcReact } from '~/renderer/trpc'

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

        <p className="space-x-1 text-xl font-bold text-[#d48e26] text-shadow">
          <span>感謝</span>
          <span className="text-[#32c3a6]">測試</span>
          <span>種了</span>
          <span className="text-[#32c3a6]">87</span>
          <span>個貓草</span>
        </p>
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

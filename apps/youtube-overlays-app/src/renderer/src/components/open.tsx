import { FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { TextEffect } from '~/renderer/components/text-effect'
import { Button } from '~/renderer/components/ui/button'
import { trpcReact } from '~/renderer/trpc'

function convertToDisplayName(id: string | null) {
  if (!id) {
    return null
  }

  const lookupTable = {
    name: '測試貓草',
    amount: '87',
  } as const

  return (lookupTable[id] as string) ?? null
}

export function Open() {
  const { data: settings, error, isLoading } = trpcReact.settings.useQuery()

  const {
    error: sendError,
    mutate,
    isPending,
  } = trpcReact.open.useMutation({
    onSuccess: ({ opened }, { amount }) => {
      if (opened) {
        toast.success(`已成功送出贈訂測試訊息【數量: ${amount}】`)
      }
    },
  })

  if (isLoading) {
    return <>載入中</>
  }

  if (error) {
    return <>發生錯誤</>
  }

  if (!settings) {
    return <>發生錯誤</>
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex gap-x-4 items-center">
        <Button variant="secondary" onClick={() => mutate({ amount: '87' })} disabled={isPending}>
          <FlaskConical />
          贈訂測試
        </Button>

        <div className="flex p-4 space-x-1 text-xl font-bold text-[#d48e26] text-shadow">
          {settings.liveChatSponsorshipsGiftPurchaseAnnouncementTemplate.map((item, index) => {
            if (item.type === 'text') {
              return <div key={`block-${index}`}>{item.text}</div>
            }

            return (
              <div key={`block-${index}`} className="text-[#32c3a6] flex">
                <TextEffect animate="bounce">{convertToDisplayName(item.attrs.id) ?? 'null'}</TextEffect>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-x-4 items-center">
        {['50', '20', '10', '5', '1'].map((amount) => (
          <Button key={amount} variant="secondary" onClick={() => mutate({ amount })} disabled={isPending}>
            <FlaskConical />
            {amount}
          </Button>
        ))}
      </div>

      {error ? (
        <div className="text-center">
          <p>發生錯誤：</p>
          <pre>{JSON.stringify(sendError, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  )
}

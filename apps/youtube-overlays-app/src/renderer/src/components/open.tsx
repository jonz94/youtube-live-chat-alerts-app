import { FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { trpcReact } from '~/renderer/trpc'

export function Open() {
  const { data: settings, error, isLoading } = trpcReact.settings.useQuery()

  const { mutate, isPending } = trpcReact.open.useMutation({
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
    <Card>
      <CardHeader>
        <CardTitle>贈訂測試</CardTitle>
        <CardDescription>點擊按鈕即可測試贈訂各種不同會員數量時會發生的效果</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-x-4 items-center">
          {['50', '20', '10', '5', '1'].map((amount) => (
            <Button key={amount} variant="secondary" onClick={() => mutate({ amount })} disabled={isPending}>
              <FlaskConical />
              {amount}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

import { useAtomValue } from 'jotai'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { Input } from '~/renderer/components/ui/input'
import { parsePaymentUrl } from '~/renderer/lib/parse-payment-url'
import { cn } from '~/renderer/lib/utils'
import { socket } from '~/renderer/socket'
import { viewportRefAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'
import { SettingsSchema } from '../../../main/schema'

export function PaymentConnection() {
  const { data: settings, error, isLoading, refetch } = trpcReact.settings.useQuery()

  useEffect(() => {
    function onChannelUpdated() {
      console.log('update')
      void refetch()
    }

    socket.on('channel-updated', onChannelUpdated)

    return () => {
      socket.off('channel-updated', onChannelUpdated)
    }
  }, [refetch])

  if (isLoading) {
    return <p>載入設定檔...</p>
  }

  if (error) {
    return (
      <div className="text-center">
        <p>載入設定檔時發生錯誤：</p>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!settings) {
    return <p>載入設定檔失敗...</p>
  }

  return <ConnectionCard settings={settings}></ConnectionCard>
}

function ConnectionCard({ settings }: { settings: SettingsSchema }) {
  console.log({ settings })

  const inputRef = useRef<HTMLInputElement>(null)
  const viewportRef = useAtomValue(viewportRefAtom)

  const connectPaymentUrl = trpcReact.connectPaymentUrl.useMutation({
    onSuccess: ({ error, data }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log('success', data)

      toast.success('成功與 payment 建立連線！')

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      viewportRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>建立連線</CardTitle>
        <CardDescription className={cn('max-w-sm')}>輸入 Payment 網址</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <Input ref={inputRef} type="text" placeholder="請輸入 Payment 網址" />
      </CardContent>

      <CardFooter className={cn('flex justify-end')}>
        <Button
          onClick={() => {
            const value = inputRef.current?.value

            if (!value) {
              return
            }

            const { type, id } = parsePaymentUrl(value)

            console.log({ type, id })

            console.log(type, id)

            connectPaymentUrl.mutate({ url: value })
          }}
        >
          🚀 開始
        </Button>
      </CardFooter>
    </Card>
  )
}

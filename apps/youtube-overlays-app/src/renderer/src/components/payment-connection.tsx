import { useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { Input } from '~/renderer/components/ui/input'
import { parsePaymentUrl } from '~/renderer/lib/parse-payment-url'
import { cn } from '~/renderer/lib/utils'
import { socket } from '~/renderer/socket'
import { viewportRefAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'

function useEcpayConnectionState() {
  const [connectionState, setConnectionState] = useState<string | null>(null)

  useEffect(() => {
    function onEcpayConnectionStatusChanged(state: string) {
      console.log('ecpay-connection-state-changed', state)
      setConnectionState(state)
    }

    socket.on('ecpay-connection-state-changed', onEcpayConnectionStatusChanged)

    return () => {
      socket.off('ecpay-connection-state-changed', onEcpayConnectionStatusChanged)
    }
  }, [])

  return { connectionState }
}

export function PaymentConnection() {
  const inputRef = useRef<HTMLInputElement>(null)
  const viewportRef = useAtomValue(viewportRefAtom)

  const { connectionState } = useEcpayConnectionState()

  const connectPaymentUrl = trpcReact.connectPaymentUrl.useMutation({
    onSuccess: ({ error }, { id, type }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log({ id, type })

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

  const disconnectPaymentUrl = trpcReact.disconnectPaymentUrl.useMutation({
    onSuccess: ({ error }) => {
      if (error) {
        console.log('error', error)

        return
      }

      toast.success('成功與 payment 斷開連線！')

      if (inputRef.current) {
        inputRef.current.value = ''
      }
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
        <p>{connectionState}</p>
      </CardContent>

      <CardFooter className={cn('flex justify-between')}>
        <Button
          onClick={() => {
            disconnectPaymentUrl.mutate()
          }}
        >
          斷開連線
        </Button>

        <Button
          onClick={() => {
            const value = inputRef.current?.value

            if (!value) {
              return
            }

            const { type, id } = parsePaymentUrl(value)

            console.log({ type, id })

            if (!id) {
              return
            }

            connectPaymentUrl.mutate({ type, id })
          }}
        >
          🚀 開始
        </Button>
      </CardFooter>
    </Card>
  )
}

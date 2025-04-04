import { HubConnectionState } from '@microsoft/signalr'
import { useAtomValue } from 'jotai'
import { CircleCheck } from 'lucide-react'
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
  const {
    data: settings,
    error: settingsError,
    isLoading: isSettingsLoading,
    refetch: refetchSettings,
  } = trpcReact.settings.useQuery()

  const {
    data: connectionState,
    error: connectionError,
    isLoading: isConnectionLoading,
    refetch: refetchConnectionState,
  } = trpcReact.getConnectionState.useQuery()

  useEffect(() => {
    function onChannelUpdated() {
      console.log('update')
      void refetchSettings()
    }

    socket.on('channel-updated', onChannelUpdated)

    return () => {
      socket.off('channel-updated', onChannelUpdated)
    }
  }, [refetchSettings])

  useEffect(() => {
    const timeout = setInterval(() => void refetchConnectionState(), 5000)

    return () => clearInterval(timeout)
  }, [refetchConnectionState])

  useEffect(() => {
    function onEcpayConnectionStatusChanged(state: HubConnectionState) {
      console.log('ecpay-connection-state-changed', state)
      void refetchConnectionState()
    }

    socket.on('ecpay-connection-state-changed', onEcpayConnectionStatusChanged)

    return () => {
      socket.off('ecpay-connection-state-changed', onEcpayConnectionStatusChanged)
    }
  }, [refetchConnectionState])

  if (isSettingsLoading || isConnectionLoading) {
    return <p>載入中...</p>
  }

  const error = settingsError || connectionError
  if (error) {
    return (
      <div className="text-center">
        <p>載入時發生錯誤：</p>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!settings || connectionState === undefined) {
    return <p>載入資料失敗...</p>
  }

  return <PaymentConnectionCard settings={settings} initialConnectionState={connectionState} />
}

function PaymentConnectionCard({
  settings,
  initialConnectionState,
}: {
  settings: SettingsSchema
  initialConnectionState: HubConnectionState | null
}) {
  console.log(settings.payments, initialConnectionState)

  const inputRef = useRef<HTMLInputElement>(null)
  const viewportRef = useAtomValue(viewportRefAtom)

  const connectionState = initialConnectionState

  const connectPaymentUrl = trpcReact.connectPaymentUrl.useMutation({
    onSuccess: ({ error }, { id, type }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log({ id, type })

      toast.success('成功建立連線！')

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      viewportRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const removePaymentSetting = trpcReact.removePaymentSetting.useMutation({
    onSuccess: ({ error }) => {
      if (error) {
        console.log('error', error)

        return
      }

      toast.success('成功移除連線設定！')

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
        <CardDescription className={cn('max-w-sm')}>
          輸入綠界實況主收款網址，並按下開始，讓小程式可以讀取到綠界的贊助成功訊息
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {connectionState === HubConnectionState.Connected && (
          <div className="flex flex-col gap-y-2">
            <div className="rounded-lg border-2 border-green-500 px-4 py-3 text-green-500">
              <p>
                <CircleCheck className="-mt-0.5 me-3 inline-flex" aria-hidden="true" />
                <span className="font-semibold tracking-tight">成功與綠界建立連線！</span>
              </p>

              <p className="break-all pt-4">
                連線網址:{' '}
                {settings.payments.at(0)?.type === 'ECPAY_STAGE'
                  ? `https://payment-stage.ecpay.com.tw/Broadcaster/Donate/${settings.payments.at(0)?.id}`
                  : settings.payments.at(0)?.type === 'ECPAY'
                    ? `https://payment-stage.ecpay.com.tw/Broadcaster/Donate/${settings.payments.at(0)?.id}`
                    : ''}
              </p>
            </div>
          </div>
        )}

        <div className={connectionState === HubConnectionState.Connected ? 'hidden' : ''}>
          <p>目前還暫不支援短網址，請輸入完整的網址，例如：</p>
          <p className="break-all">
            https://payment-stage.ecpay.com.tw/Broadcaster/Donate/C1B8B9E32C2467466E4A8B4CE4A99378
          </p>
        </div>

        <Input
          className={connectionState === HubConnectionState.Connected ? 'hidden' : ''}
          ref={inputRef}
          type="text"
          placeholder="請輸入綠界實況主收款網址"
        />
      </CardContent>

      <CardFooter className="flex justify-end gap-x-4">
        {connectionState === HubConnectionState.Connected ? (
          <>
            {settings.payments.map((payment) => (
              <Button
                key={`${payment.type}-${payment.id}`}
                variant="destructive"
                onClick={() => {
                  removePaymentSetting.mutate(payment)
                }}
              >
                刪除連線設定
              </Button>
            ))}
          </>
        ) : (
          <>
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
          </>
        )}
      </CardFooter>

      <div className="text-muted-foreground w-full text-center">
        連線狀態: {connectionState === null ? '未設定' : connectionState}
      </div>
    </Card>
  )
}

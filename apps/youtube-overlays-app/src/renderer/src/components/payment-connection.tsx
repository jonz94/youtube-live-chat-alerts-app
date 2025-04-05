import { HubConnectionState } from '@microsoft/signalr'
import { useAtomValue } from 'jotai'
import { CircleCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { Input } from '~/renderer/components/ui/input'
import { generatePaymentUrl, parsePaymentUrl } from '~/renderer/lib/payment-url'
import { cn } from '~/renderer/lib/utils'
import { socket } from '~/renderer/socket'
import { viewportRefAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'
import { SettingsSchema } from '../../../main/schema'

const connectionStateName: Record<HubConnectionState, string> = {
  Connected: '已連線',
  Connecting: '正在連線',
  Disconnected: '已中斷連線',
  Disconnecting: '正在中斷連線',
  Reconnecting: '重新連線中',
}

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
    function onEcpayConnectionStatusChanged() {
      console.log('ecpay-connection-state-changed')
      void refetchSettings()
      void refetchConnectionState()
    }

    socket.on('ecpay-connection-state-changed', onEcpayConnectionStatusChanged)

    return () => {
      socket.off('ecpay-connection-state-changed', onEcpayConnectionStatusChanged)
    }
  }, [refetchConnectionState, refetchSettings])

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
  const isInitialized = useRef(false)
  const [inputValue, setInputValue] = useState('')
  const viewportRef = useAtomValue(viewportRefAtom)

  const currentPayment = settings.payments.at(0) ?? null
  const connectionState = initialConnectionState

  const connectPaymentUrl = trpcReact.connectPaymentUrl.useMutation({
    onSuccess: ({ error }, { id, type }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log({ id, type })

      toast.success('成功與綠界建立連線！')

      setInputValue('')

      viewportRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  useEffect(() => {
    if (!isInitialized.current && initialConnectionState !== HubConnectionState.Connected) {
      const payment = settings.payments.at(0)

      if (payment) {
        connectPaymentUrl.mutate(payment)
      }
    }

    return () => {
      isInitialized.current = true
    }
  }, [connectPaymentUrl, initialConnectionState, settings.payments])

  const disconnectPaymentUrl = trpcReact.disconnectPaymentUrl.useMutation({
    onSuccess: ({ error }) => {
      if (error) {
        console.log('error', error)

        return
      }

      toast.success('成功與綠界中斷連線')

      setInputValue('')
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

      setInputValue('')
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

              <p className="pt-4">連線網址:</p>
              <p className="break-all">{currentPayment && generatePaymentUrl(currentPayment)}</p>
            </div>
          </div>
        )}

        <div
          className={connectionState === HubConnectionState.Connected || settings.payments.length > 0 ? 'hidden' : ''}
        >
          <p>目前還暫不支援短網址，請輸入完整的網址，例如：</p>
          <p className="break-all">
            https://payment-stage.ecpay.com.tw/Broadcaster/Donate/C1B8B9E32C2467466E4A8B4CE4A99378
          </p>
        </div>

        <Input
          className={connectionState === HubConnectionState.Connected || settings.payments.length > 0 ? 'hidden' : ''}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="請輸入綠界實況主收款網址"
        />

        <div
          className={cn(
            'flex flex-col gap-y-2',

            connectionState !== HubConnectionState.Connected && settings.payments.length > 0 ? '' : 'hidden',
          )}
        >
          <div className="rounded-md border border-border px-4 py-3">
            <p>
              <span className="font-semibold tracking-tight">目前已設定綠界網址:</span>
            </p>

            <p className="break-all pt-4">{currentPayment && generatePaymentUrl(currentPayment)}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col">
        {connectionState === HubConnectionState.Connected ? (
          <div className="flex justify-end w-full">
            <Button variant="destructive" onClick={() => disconnectPaymentUrl.mutate()}>
              中斷連線
            </Button>
          </div>
        ) : settings.payments.length > 0 ? (
          <div className="flex justify-between w-full">
            <Button
              variant="destructive"
              onClick={() => {
                const payment = settings.payments.at(0)

                if (!payment) {
                  return
                }

                removePaymentSetting.mutate(payment)
              }}
            >
              刪除連線設定
            </Button>

            <Button
              onClick={() => {
                const payment = settings.payments.at(0)

                if (!payment) {
                  return
                }

                connectPaymentUrl.mutate(payment)
              }}
            >
              🚀 開始
            </Button>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <Button
              disabled={inputValue === ''}
              onClick={() => {
                if (!inputValue) {
                  return
                }

                const { type, id } = parsePaymentUrl(inputValue)

                console.log({ type, id })

                if (!id) {
                  return
                }

                connectPaymentUrl.mutate({ type, id })
              }}
            >
              🚀 開始
            </Button>
          </div>
        )}

        <div className="relative top-3 text-muted-foreground w-full text-center">
          連線狀態：
          {connectionState !== null
            ? connectionStateName[connectionState]
            : settings.payments.length <= 0
              ? '未設定綠界網址'
              : connectionStateName.Disconnected}
        </div>
      </CardFooter>
    </Card>
  )
}

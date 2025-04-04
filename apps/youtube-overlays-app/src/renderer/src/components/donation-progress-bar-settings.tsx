import { CircleDollarSign, Minus, Plus, Save, Target, Type } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { Input } from '~/renderer/components/ui/input'
import { trpcReact } from '~/renderer/trpc'
import { SettingsSchema } from '../../../main/schema'

export function DonationProgressBarSettings() {
  const { data: settings, error, isLoading, refetch } = trpcReact.settings.useQuery()

  if (isLoading) {
    return <>載入中</>
  }

  if (error) {
    return <>發生錯誤</>
  }

  if (!settings) {
    return <>發生錯誤</>
  }

  return <SettingsCard settings={settings} refetch={() => void refetch()}></SettingsCard>
}

function SettingsCard({ settings, refetch }: { settings: SettingsSchema; refetch: () => void }) {
  const [progressBarCurrentValue, setProgressBarCurrentValue] = useState(settings.progressBarCurrentValue)
  const [progressBarTargetValue, setProgressBarTargetValue] = useState(settings.progressBarTargetValue)
  const [text, setText] = useState(settings.progressBarText)

  const [delta, setDelta] = useState(0)

  const updateProgressBarText = trpcReact.updateProgressBarTextSetting.useMutation({
    onSuccess: (output) => {
      if (output.error) {
        toast.error(output.error)
        return
      }

      console.log('success')
      refetch()

      toast.success(`儲存成功：已經成功更新進度條文字為 ${output.data}`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const updateProgressBarCurrentValue = trpcReact.updateProgressBarCurrentValueSetting.useMutation({
    onSuccess: (output) => {
      if (output.error) {
        toast.error(output.error)
        return
      }

      console.log('success')
      refetch()

      toast.success(`儲存成功：已經成功更新現在金額為 ${output.data}`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const updateProgressBarCurrentValueViaDelta = trpcReact.updateProgressBarCurrentValueSettingViaDelta.useMutation({
    onSuccess: (output) => {
      if (output.error) {
        toast.error(output.error)
        return
      }

      console.log('success')
      refetch()

      toast.success(`儲存成功：已經成功更新現在金額 ${output.data}`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const updateProgressBarTargetValue = trpcReact.updateProgressBarTargetValueSetting.useMutation({
    onSuccess: (output) => {
      if (output.error) {
        toast.error(output.error)
        return
      }

      console.log('success')
      refetch()

      toast.success(`儲存成功：已經成功更新目標金額為 ${output.data}`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>斗內清單設定</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-y-4">
        <hr className="-mx-6" />

        <div className="flex flex-col gap-y-2">
          <label className="flex items-center gap-2">
            <Type />
            進度條文字
          </label>
          <div className="flex gap-x-2">
            <Input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="進度條文字" />
            <Button
              onClick={() => {
                updateProgressBarText.mutate({ text })
                refetch()
              }}
            >
              <Save />
              儲存設定
            </Button>
          </div>
        </div>

        <hr className="-mx-6" />

        <div className="flex flex-col gap-y-2">
          <label className="flex items-center gap-2">
            <CircleDollarSign />
            設定目前金額（直接設定）
          </label>
          <div className="flex gap-x-2">
            <Input
              type="number"
              value={progressBarCurrentValue}
              onChange={(e) => setProgressBarCurrentValue(Math.floor(Number(e.target.value)))}
              min={0}
              placeholder="現在金額"
            />
            <Button
              onClick={() => {
                updateProgressBarCurrentValue.mutate({ value: progressBarCurrentValue })
                refetch()
              }}
            >
              <Save />
              儲存設定
            </Button>
          </div>
        </div>

        <hr className="-mx-6" />

        <div className="flex flex-col gap-y-2">
          <label className="flex items-center gap-2">
            <CircleDollarSign />
            調整目前金額（增加 / 減少）
          </label>
          <div className="grid grid-cols-[40px_1fr_40px] gap-x-2">
            <Button
              className="bg-red-600 hover:bg-red-600/80"
              onClick={() => {
                if (delta === 0) {
                  return
                }

                updateProgressBarCurrentValueViaDelta.mutate({ delta })
                refetch()
                setDelta(0)
              }}
            >
              <Plus />
            </Button>
            <Input
              className="text-center"
              type="number"
              value={delta}
              onChange={(e) => setDelta(Math.floor(Number(e.target.value)))}
              min={0}
            />
            <Button
              className="bg-green-600 hover:bg-green-600/80"
              onClick={() => {
                if (delta === 0) {
                  return
                }

                updateProgressBarCurrentValueViaDelta.mutate({ delta: -1 * delta })
                refetch()
                setDelta(0)
              }}
            >
              <Minus />
            </Button>
          </div>
        </div>

        <hr className="-mx-6" />

        <div className="flex flex-col gap-y-2">
          <label className="flex items-center gap-2">
            <Target />
            目標金額
          </label>
          <div className="flex gap-x-2">
            <Input
              type="number"
              value={progressBarTargetValue}
              onChange={(e) => {
                const value = Number(e.target.value)
                setProgressBarTargetValue(Math.floor(value <= 1 ? 1 : value))
              }}
              min={1}
              placeholder="目標金額"
            />
            <Button
              onClick={() => {
                updateProgressBarTargetValue.mutate({ value: progressBarTargetValue })
                refetch()
              }}
            >
              <Save />
              儲存設定
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

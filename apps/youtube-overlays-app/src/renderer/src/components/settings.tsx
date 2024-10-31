import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import ElasticSlider from '~/renderer/components/elastic-slider'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { Input } from '~/renderer/components/ui/input'
import { Label } from '~/renderer/components/ui/label'
import { cacheTimestampAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'

export function Settings() {
  const { data: settings, error, isLoading } = trpcReact.settings.useQuery()
  if (isLoading) {
    return <>載入中</>
  }

  if (error) {
    return <>發生錯誤</>
  }

  if (!settings) {
    return <>發生錯誤</>
  }

  return <SettingsCard settings={settings}></SettingsCard>
}

function SettingsCard({ settings }: { settings: { animationTimeInMilliseconds: number; volume: number } }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const audioInputRef = useRef<HTMLInputElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [volume, setVolume] = useState(settings.volume)
  const [cacheTimestamp, setCacheTimestamp] = useAtom(cacheTimestampAtom)

  const utils = trpcReact.useUtils()

  const updateAnimationTime = trpcReact.updateAnimationTimeSetting.useMutation({
    onSuccess: (input) => {
      utils.settings.invalidate()

      toast.success(`儲存成功：【顯示持續時間】已成功更新為 ${input / 1000} 秒`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const updateImage = trpcReact.updateImage.useMutation({
    onSuccess: (input) => {
      if (input.error) {
        toast.error(input.error)
        return
      }

      console.log('success')
      utils.settings.invalidate()
      setCacheTimestamp(String(Date.now()))

      toast.success(`儲存成功：【圖片檔】已經成功更新為\n${input.newImagePath}`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const resetImage = trpcReact.resetImage.useMutation({
    onSuccess: () => {
      utils.settings.invalidate()
      setCacheTimestamp(String(Date.now()))

      toast.success(`儲存成功：【圖片檔】已經成功重置為預設圖片`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const updateSoundEffect = trpcReact.updateSoundEffect.useMutation({
    onSuccess: (input) => {
      if (input.error) {
        toast.error(input.error)
        return
      }

      console.log('success')
      utils.settings.invalidate()
      setCacheTimestamp(String(Date.now()))

      toast.success(`儲存成功：【音效檔】已經成功更新為\n${input.newSoundFilePath}`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const resetSoundEffect = trpcReact.resetSoundEffect.useMutation({
    onSuccess: () => {
      utils.settings.invalidate()
      setCacheTimestamp(String(Date.now()))

      toast.success(`儲存成功：【音效檔】已經成功重置為預設音效`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const updateVolume = trpcReact.updateVolumeSetting.useMutation({
    onSuccess: (input) => {
      console.log('success')
      utils.settings.invalidate()

      toast.success(`儲存成功：【音效音量】已經成功更新為 ${input}%`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  return (
    <Card>
      <CardHeader>
        <CardTitle>設定</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-6">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <hr className="-mx-6" />

          <img src={`http://localhost:21829/assets/image.gif?t=${cacheTimestamp}`} alt="" />

          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                imageInputRef.current?.click()
              }}
            >
              使用自訂圖片 (可使用動圖)
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                resetImage.mutate()
              }}
            >
              使用預設圖片
            </Button>
          </div>

          <input
            ref={imageInputRef}
            className="hidden"
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.item(0)

              if (file) {
                const newImagePath = window.api.getPathForFile(file)

                updateImage.mutate({ newImagePath })
              }
            }}
          />
        </div>

        <hr className="-mx-6" />

        <form
          className="grid w-full max-w-sm items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()

            const value = inputRef.current?.value

            if (!value) {
              return
            }

            updateAnimationTime.mutate(Number(value) * 1000)
          }}
        >
          <Label htmlFor="animationTimeInMilliseconds" className="px-3">
            顯示持續時間 (秒)
          </Label>
          <Input
            id="animationTimeInMilliseconds"
            ref={inputRef}
            type="number"
            defaultValue={Math.round(settings.animationTimeInMilliseconds / 1000)}
          />

          <div>
            <Button type="submit">更新</Button>
          </div>
        </form>

        <hr className="-mx-6" />

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="sound" className="px-3">
            音效檔
          </Label>

          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                audioInputRef.current?.click()
              }}
            >
              使用自訂音效檔
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                resetSoundEffect.mutate()
              }}
            >
              使用預設音效檔
            </Button>
          </div>

          <input
            ref={audioInputRef}
            className="hidden"
            id="sound"
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.item(0)

              if (file) {
                const newSoundEffectPath = window.api.getPathForFile(file)

                updateSoundEffect.mutate({ newSoundEffectPath })
              }
            }}
          />
        </div>

        <hr className="-mx-6" />

        <form
          className="grid w-full max-w-sm items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()

            console.log({ volume })

            updateVolume.mutate({ volume })
          }}
        >
          <audio ref={audioRef} src={`http://localhost:21829/assets/sound.mp3?t=${cacheTimestamp}`}></audio>

          <div className="min-h-16 flex items-center">
            <div className="w-full">
              <ElasticSlider volume={volume} setVolume={setVolume}></ElasticSlider>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault()

                if (!audioRef.current) {
                  return
                }

                audioRef.current.play()
              }}
            >
              播放音效檔
            </Button>
            <Button type="submit">儲存音量設定</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

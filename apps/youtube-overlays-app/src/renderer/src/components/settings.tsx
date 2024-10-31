import { useAtom } from 'jotai'
import { FileImage, FileMusic, Music, Save, Timer, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import ElasticSlider from '~/renderer/components/elastic-slider'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/renderer/components/ui/alert-dialog'
import { Button, buttonVariants } from '~/renderer/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { Input } from '~/renderer/components/ui/input'
import { Label } from '~/renderer/components/ui/label'
import { cn } from '~/renderer/lib/utils'
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

      toast.success(`儲存成功：【持續時間】已成功更新為 ${input / 1000} 秒`)
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
        <CardTitle>贈訂通知設定</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-6">
        <div className="grid w-full max-w-sm items-center gap-4">
          <hr className="-mx-6" />

          <div className="rounded-md overflow-hidden mt-2">
            <img
              className="h-auto w-[400px]"
              src={`http://localhost:21829/assets/image.gif?t=${cacheTimestamp}`}
              alt=""
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            <Button
              onClick={() => {
                imageInputRef.current?.click()
              }}
            >
              <FileImage />
              自訂圖片或動圖
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 />
                  還原預設
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要還原為預設圖片嗎？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作將會移除目前的自訂圖片，並將圖片還原為系統預設圖片。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-x-2">
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    className={cn(buttonVariants({ variant: 'destructive' }))}
                    onClick={() => {
                      resetImage.mutate()
                    }}
                  >
                    還原
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

              if (imageInputRef.current) {
                imageInputRef.current.value = ''
              }
            }}
          />
        </div>

        <hr className="-mx-6" />

        <div className="grid w-full max-w-sm items-center grid-cols-1 xs:grid-cols-2 gap-4">
          <div className="flex items-center gap-x-2">
            <Label htmlFor="animationTimeInMilliseconds" className="min-w-fit inline-flex items-center gap-x-1">
              <Timer />
              持續時間
            </Label>

            <Input
              id="animationTimeInMilliseconds"
              ref={inputRef}
              type="number"
              defaultValue={Math.round(settings.animationTimeInMilliseconds / 1000)}
            />

            <span className="min-w-fit">秒</span>
          </div>

          <div className="w-full flex">
            <Button
              className="w-full"
              onClick={() => {
                const value = inputRef.current?.value

                if (!value) {
                  return
                }

                updateAnimationTime.mutate(Number(value) * 1000)
              }}
            >
              <Save />
              儲存設定
            </Button>
          </div>
        </div>

        <hr className="-mx-6" />

        <div className="grid w-full max-w-sm items-center gap-4">
          <Button
            onClick={() => {
              audioInputRef.current?.click()
            }}
          >
            <FileMusic />
            自訂音效
          </Button>

          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            <Button
              variant="secondary"
              onClick={() => {
                if (!audioRef.current) {
                  return
                }

                audioRef.current.play()
              }}
            >
              <Music />
              試播音效
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 />
                  還原預設
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要還原為預設音效嗎？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作將會移除目前的自訂音效，並將音效還原為系統預設音效。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-x-2">
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    className={cn(buttonVariants({ variant: 'destructive' }))}
                    onClick={() => {
                      resetSoundEffect.mutate()
                    }}
                  >
                    還原
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

                console.log({ newSoundEffectPath })

                updateSoundEffect.mutate({ newSoundEffectPath })
              }

              if (audioInputRef.current) {
                audioInputRef.current.value = ''
              }
            }}
          />
        </div>

        <hr className="-mx-6" />

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <audio ref={audioRef} src={`http://localhost:21829/assets/sound.mp3?t=${cacheTimestamp}`}></audio>

          <div className="min-h-16 flex items-center">
            <div className="w-full">
              <ElasticSlider volume={volume} setVolume={setVolume}></ElasticSlider>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2">
            <Button
              variant="secondary"
              onClick={() => {
                if (!audioRef.current) {
                  return
                }

                audioRef.current.play()
              }}
            >
              <Music />
              試播音效
            </Button>

            <Button
              onClick={() => {
                console.log({ volume })

                updateVolume.mutate({ volume })
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

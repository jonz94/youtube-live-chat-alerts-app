import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Eye, FileImage, MessageSquareText, Music, Play, Save, Timer, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useOneLineEditor } from '~/renderer/components/editor/core'
import { Tiptap } from '~/renderer/components/editor/Tiptap'
import { convertToDisplayName } from '~/renderer/components/editor/utils'
import ElasticSlider from '~/renderer/components/elastic-slider'
import { TextEffect } from '~/renderer/components/text-effect'
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
import { Popover, PopoverContent, PopoverTrigger } from '~/renderer/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/renderer/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/renderer/components/ui/tooltip'
import { cn } from '~/renderer/lib/utils'
import { cacheTimestampAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'
import { SettingsSchema, Template, templateSchema } from '../../../main/schema'

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

function SettingsCard({ settings }: { settings: SettingsSchema }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [volume, setVolume] = useState(settings.volume)
  const cacheTimestamp = useAtomValue(cacheTimestampAtom)
  const editor = useOneLineEditor(settings.liveChatSponsorshipsGiftPurchaseAnnouncementTemplate)

  const utils = trpcReact.useUtils()

  const updateAnimationTime = trpcReact.updateAnimationTimeSetting.useMutation({
    onSuccess: (input) => {
      void utils.settings.invalidate()

      toast.success(`儲存成功：【持續時間】已成功更新為 ${input / 1000} 秒`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const updateVolume = trpcReact.updateVolumeSetting.useMutation({
    onSuccess: (input) => {
      console.log('success')
      void utils.settings.invalidate()

      toast.success(`儲存成功：【音效音量】已經成功更新為 ${input}%`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplate =
    trpcReact.updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplateSetting.useMutation({
      onSuccess: () => {
        console.log('success')
        void utils.settings.invalidate()

        toast.success(`儲存成功：【通知訊息文字】已經成功更新`)
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
        <div className="grid w-full max-w-sm items-center">
          <div className="-mx-6">
            <EffectSettingsTable settings={settings}></EffectSettingsTable>
          </div>
        </div>

        <form
          className="grid w-full max-w-sm items-center grid-cols-1 xs:grid-cols-2 gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-x-2">
            <Label htmlFor="animationTimeInSeconds" className="min-w-fit inline-flex items-center gap-x-1">
              <Timer />
              持續時間
            </Label>

            <Input
              id="animationTimeInSeconds"
              ref={inputRef}
              type="number"
              min={1}
              defaultValue={Math.round(settings.animationTimeInMilliseconds / 1000)}
            />

            <span className="min-w-fit">秒</span>
          </div>

          <div className="w-full flex">
            <Button
              type="submit"
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
        </form>

        <hr className="-mx-6" />

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <audio ref={audioRef} src={`http://localhost:21829/assets/sound1.mp3?t=${cacheTimestamp}`}></audio>

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

                void audioRef.current.play()
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

        <hr className="-mx-6" />

        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2">
            <MessageSquareText />
            自訂通知訊息文字
          </label>

          <div className="flex space-x-1 text-xl font-bold text-[#d48e26] text-shadow min-h-7">
            {editor &&
              templateSchema.safeParse(editor.getJSON().content!.at(0)!.content)?.data?.map((item, index) => {
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

          {editor && <Tiptap editor={editor}></Tiptap>}

          <Button
            onClick={() => {
              if (!editor) {
                return
              }

              const template = editor.getJSON().content!.at(0)!.content as Template

              updateLiveChatSponsorshipsGiftPurchaseAnnouncementTemplate.mutate(template)
            }}
          >
            <Save />
            儲存設定
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const items = [
  {
    amount: 50,
  },
  {
    amount: 20,
  },
  {
    amount: 10,
  },
  {
    amount: 5,
  },
  {
    amount: 1,
  },
]

function ImageInput({ item }: { item: { amount: number } }) {
  const setCacheTimestamp = useSetAtom(cacheTimestampAtom)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const utils = trpcReact.useUtils()

  const updateImage = trpcReact.updateImage.useMutation({
    onSuccess: (output) => {
      if (output.error) {
        toast.error(output.error)
        return
      }

      console.log('success')
      void utils.settings.invalidate()
      setCacheTimestamp(String(Date.now()))

      toast.success(`儲存成功：贈送 ${output.amount} 會員時的【圖片檔】已經成功更新為\n${output.newImagePath}`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  return (
    <>
      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={() => {
                imageInputRef.current?.click()
              }}
            >
              <FileImage />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            <p>選擇圖片檔</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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

            updateImage.mutate({ newImagePath, amount: item.amount })
          }

          if (imageInputRef.current) {
            imageInputRef.current.value = ''
          }
        }}
      />
    </>
  )
}

function AudioInput({ item }: { item: { amount: number } }) {
  const setCacheTimestamp = useSetAtom(cacheTimestampAtom)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const utils = trpcReact.useUtils()

  const updateSoundEffect = trpcReact.updateSoundEffect.useMutation({
    onSuccess: (output) => {
      if (output.error) {
        toast.error(output.error)
        return
      }

      console.log('success')
      void utils.settings.invalidate()
      setCacheTimestamp(String(Date.now()))

      toast.success(`儲存成功：贈送 ${output.amount} 會員時的【音效檔】已經成功更新為\n${output.newSoundFilePath}`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  return (
    <>
      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              onClick={() => {
                audioInputRef.current?.click()
              }}
            >
              <Music />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            <p>選擇音效檔</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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

            updateSoundEffect.mutate({ newSoundEffectPath, amount: item.amount })
          }

          if (audioInputRef.current) {
            audioInputRef.current.value = ''
          }
        }}
      />
    </>
  )
}

function AudioPlay({ amount, volume }: { amount: number; volume: number }) {
  const cacheTimestamp = useAtomValue(cacheTimestampAtom)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  return (
    <>
      <audio ref={audioRef} src={`http://localhost:21829/assets/sound${amount}.mp3?t=${cacheTimestamp}`}></audio>

      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => {
                if (!audioRef.current) {
                  return
                }

                void audioRef.current.play()
              }}
            >
              <Play />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>試播音效</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}

function EffectSettingsTable({ settings }: { settings: SettingsSchema }) {
  const [cacheTimestamp, setCacheTimestamp] = useAtom(cacheTimestampAtom)

  const utils = trpcReact.useUtils()

  const resetImage = trpcReact.resetImage.useMutation({
    onSuccess: (output) => {
      void utils.settings.invalidate()
      setCacheTimestamp(String(Date.now()))

      toast.success(`儲存成功：贈送 ${output.amount} 會員時的【圖片檔】已經成功重置為預設圖片`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const resetSoundEffect = trpcReact.resetSoundEffect.useMutation({
    onSuccess: (output) => {
      void utils.settings.invalidate()
      setCacheTimestamp(String(Date.now()))

      toast.success(`儲存成功：贈送 ${output.amount} 會員時的【音效檔】已經成功重置為預設音效`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  return (
    <Table className="border-separate border-spacing-0 text-center">
      <TableHeader className="sticky top-0 bottom-8 bg-background">
        <TableRow>
          <TableHead className="border-y text-foreground text-center">贈訂數量</TableHead>
          <TableHead className="border-y text-foreground text-center">自訂圖片或動圖</TableHead>
          <TableHead className="border-y text-foreground text-center">自訂音效</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.map((item) => (
          <TableRow key={item.amount}>
            <TableCell className="border-b font-medium text-lg">{item.amount}</TableCell>

            <TableCell className="border-b">
              <div className="flex gap-2">
                <ImageInput item={item}></ImageInput>

                <Popover>
                  <TooltipProvider delayDuration={250}>
                    <Tooltip>
                      <PopoverTrigger asChild>
                        <TooltipTrigger asChild>
                          <Button variant="secondary" size="icon">
                            <Eye />
                          </Button>
                        </TooltipTrigger>
                      </PopoverTrigger>
                      <TooltipContent>
                        <p>圖片預覽</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <PopoverContent className="w-min">
                    <div className="rounded-md overflow-hidden flex justify-center">
                      <img
                        className="h-auto w-[400px]"
                        src={`http://localhost:21829/assets/image${item.amount}.gif?t=${cacheTimestamp}`}
                        alt=""
                      />
                    </div>

                    <div className="flex p-4 space-x-1 text-xl font-bold text-[#d48e26] text-shadow">
                      {settings.liveChatSponsorshipsGiftPurchaseAnnouncementTemplate.map((templateItem, index) => {
                        if (templateItem.type === 'text') {
                          return (
                            <div key={`block-${index}`} className="whitespace-nowrap">
                              {templateItem.text}
                            </div>
                          )
                        }

                        return (
                          <div key={`block-${index}`} className="text-[#32c3a6] flex">
                            <TextEffect animate="bounce">
                              {templateItem.attrs.id === 'name' ? '測試貓草' : `${item.amount}`}
                            </TextEffect>
                          </div>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                <AlertDialog>
                  <TooltipProvider delayDuration={250}>
                    <Tooltip>
                      <AlertDialogTrigger asChild>
                        <TooltipTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 />
                          </Button>
                        </TooltipTrigger>
                      </AlertDialogTrigger>
                      <TooltipContent>
                        <p>還原預設</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>確定要還原為預設圖片嗎？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作將會移除目前的自訂圖片，並將圖片還原為初始的預設圖片。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-x-2">
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        className={cn(buttonVariants({ variant: 'destructive' }))}
                        onClick={() => {
                          resetImage.mutate({ amount: item.amount })
                        }}
                      >
                        還原
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>

            <TableCell className="border-b">
              <div className="flex gap-2">
                <AudioInput item={item}></AudioInput>

                <AudioPlay amount={item.amount} volume={settings.volume}></AudioPlay>

                <AlertDialog>
                  <TooltipProvider delayDuration={250}>
                    <Tooltip>
                      <AlertDialogTrigger asChild>
                        <TooltipTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 />
                          </Button>
                        </TooltipTrigger>
                      </AlertDialogTrigger>
                      <TooltipContent>
                        <p>還原預設</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>確定要還原為預設音效嗎？</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作將會移除目前的自訂音效，並將音效還原為初始的預設音效。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-x-2">
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        className={cn(buttonVariants({ variant: 'destructive' }))}
                        onClick={() => {
                          resetSoundEffect.mutate({ amount: item.amount })
                        }}
                      >
                        還原
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

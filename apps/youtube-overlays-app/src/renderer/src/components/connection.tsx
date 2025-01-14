import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { CircleCheck, Info, Radio, RotateCw, Trash2, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
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
import { Avatar, AvatarFallback, AvatarImage } from '~/renderer/components/ui/avatar'
import { Badge } from '~/renderer/components/ui/badge'
import { Button, buttonVariants } from '~/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { CircleHelpIcon } from '~/renderer/components/ui/circle-help'
import { DataList, DataListItem, DataListLabel, DataListValue } from '~/renderer/components/ui/data-list'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '~/renderer/components/ui/hover-card'
import { Input } from '~/renderer/components/ui/input'
import { Label } from '~/renderer/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/renderer/components/ui/popover'
import { Switch } from '~/renderer/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/renderer/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/renderer/components/ui/tooltip'
import { format } from '~/renderer/lib/date-time-format'
import { parseYoutubeUrl } from '~/renderer/lib/parse-youtube-url'
import { cn } from '~/renderer/lib/utils'
import { socket } from '~/renderer/socket'
import { connectionVideoInfoAtom, viewportRefAtom } from '~/renderer/store'
import { trpcReact } from '~/renderer/trpc'
import { ChannelInfo, SettingsSchema, VideoInfo } from '../../../main/schema'

export function Connection() {
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(settings.channelInfo)
  const [connectionVideoInfo, setConnectionVideoInfo] = useAtom(connectionVideoInfoAtom)
  const viewportRef = useAtomValue(viewportRefAtom)
  const [enableAutoConnection, setEnableAutoConnection] = useState(false)

  const getChannelInfoAndThenUpdateChannelInfoSettings =
    trpcReact.getChannelInfoAndThenUpdateChannelInfoSettings.useMutation({
      onSuccess: ({ error, data }) => {
        if (error) {
          console.log('error', error)

          return
        }

        console.log('success', data)

        setChannelInfo(data)

        if (inputRef.current) {
          inputRef.current.value = ''
        }

        toast.success('成功儲存 YouTube 頻道設定！')
      },
      onError: (error) => {
        console.log('error', error)
      },
    })

  const removeChannelInfoSettings = trpcReact.removeChannelInfoSettings.useMutation({
    onSuccess: ({ error, data }) => {
      if (error) {
        console.log('error', error)

        return
      }

      setChannelInfo(null)

      console.log('success', data)

      toast.success('成功清除 YouTube 頻道設定！')
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const start = trpcReact.start.useMutation({
    onSuccess: ({ error, data }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log('success', data)

      toast.success('成功與直播聊天室建立連線！')

      setConnectionVideoInfo(data)

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
        <CardTitle>與聊天室建立連線</CardTitle>
        <CardDescription className={cn('max-w-sm', channelInfo && 'hidden', connectionVideoInfo && 'hidden')}>
          輸入 YouTube 頻道或直播網址，並按下開始，讓小程式可以讀取到聊天室訊息
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {channelInfo && !connectionVideoInfo && (
          <>
            <Card className="rounded-md">
              <CardHeader>
                <CardTitle className="flex gap-x-2 items-center">
                  <span>已設定 YouTube 頻道</span>

                  <TooltipProvider delayDuration={250}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <CircleHelpIcon className="p-0 mt-1 size-6 hover:bg-inherit cursor-help" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent asChild>
                        <div className="max-w-xs text-base font-normal">
                          設定 YouTube
                          頻道後，小程式就可以自動獲取所有「當下正在進行的直播」以及「直播待機室」的網址列表，往後就不需要再每次手動輸入直播網址了～
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-y-4">
                <div className="flex justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={channelInfo.avatar ?? ''} />
                          <AvatarFallback>
                            <UserRound size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium truncate max-w-[10rem]">{channelInfo.name}</p>
                          {channelInfo?.handle && (
                            <p className="text-xs text-muted-foreground truncate max-w-[10rem]">{channelInfo.handle}</p>
                          )}
                        </div>
                      </div>
                    </HoverCardTrigger>

                    <HoverCardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-x-2">
                          <Avatar className="mr-auto">
                            <AvatarImage src={channelInfo.avatar ?? ''} />
                            <AvatarFallback>
                              <UserRound size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
                            </AvatarFallback>
                          </Avatar>

                          <TooltipProvider delayDuration={250}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="destructive" size="icon" asChild>
                                  <a
                                    href={
                                      channelInfo.handle
                                        ? `https://www.youtube.com/${channelInfo.handle}`
                                        : `https://www.youtube.com/channel/${channelInfo.id}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <title>YouTube</title>
                                      <path
                                        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>查看 YouTube 頻道</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider delayDuration={250}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => {
                                    getChannelInfoAndThenUpdateChannelInfoSettings.mutate({
                                      channelIdOrHandle: channelInfo.id,
                                    })
                                  }}
                                >
                                  <RotateCw />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>重新讀取 YouTube 頻道資料</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <DataList orientation="vertical" className="gap-4">
                          <DataListItem>
                            <DataListLabel>頻道名稱</DataListLabel>
                            <DataListValue className="break-all">{channelInfo.name}</DataListValue>
                          </DataListItem>

                          <DataListItem>
                            <DataListLabel>帳號代碼</DataListLabel>
                            <DataListValue className="break-all">{channelInfo.handle}</DataListValue>
                          </DataListItem>
                        </DataList>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <div className="flex">
                    <div>
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
                            <TooltipContent>刪除頻道設定</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>確定要刪除目前的 YouTube 頻道設定嗎？</AlertDialogTitle>
                            <AlertDialogDescription className="sr-only">
                              此操作將會刪除目前的 YouTube 頻道設定。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-x-2">
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              className={cn(buttonVariants({ variant: 'destructive' }))}
                              onClick={() => {
                                removeChannelInfoSettings.mutate()
                              }}
                            >
                              刪除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>

                {/* TODO: wait until we are able to disconnect from live chat. hidden for now */}
                <div
                  className={cn(
                    'relative flex w-full items-center gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5',
                    'hidden',
                  )}
                >
                  <div className="grid grow gap-2">
                    <Label>自動連線功能</Label>
                    <p className="text-xs text-muted-foreground">開啟小程式時，自動連線至聊天室</p>
                  </div>

                  <div>
                    <Label htmlFor="enableAutoConntection" className="sr-only">
                      Toggle Enable Auto Connection Feature
                    </Label>

                    <div
                      className="group inline-flex items-center gap-2"
                      data-state={enableAutoConnection ? 'checked' : 'unchecked'}
                    >
                      <Switch
                        id="enableAutoConntection"
                        checked={enableAutoConnection}
                        onCheckedChange={(value) => {
                          console.log(value)
                          setEnableAutoConnection(value)
                        }}
                        aria-labelledby="switch-off-label switch-on-label"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <LiveOrUpcomingStreams channelInfo={channelInfo}></LiveOrUpcomingStreams>
          </>
        )}

        <div
          className={cn(
            'rounded-md border border-border px-4 py-3',
            !channelInfo && 'hidden',
            connectionVideoInfo && 'hidden',
          )}
        >
          <div className="flex items-center text-sm">
            <Info className="-mt-0.5 me-3 inline-flex text-blue-500" aria-hidden="true" />

            <div>
              <p className="max-w-sm">直播沒有出現在上面的列表嗎？</p>
              <p className="max-w-sm">可以在下方貼上直播網址進行手動連線喔！</p>
            </div>
          </div>
        </div>

        <Input
          className={connectionVideoInfo ? 'hidden' : ''}
          ref={inputRef}
          type="text"
          placeholder="請輸入 YouTube 頻道或直播網址"
        />

        {connectionVideoInfo && (
          <div className="flex flex-col gap-y-2">
            <div className="rounded-lg border-2 border-green-500 px-4 py-3 text-green-500">
              <p>
                <CircleCheck className="-mt-0.5 me-3 inline-flex" aria-hidden="true" />
                <span className="font-semibold tracking-tight">成功與直播聊天室建立連線！</span>
              </p>
            </div>

            <div className="flex font-medium text-lg max-w-sm">
              <Popover>
                <TooltipProvider delayDuration={250}>
                  <Tooltip>
                    <PopoverTrigger asChild>
                      <TooltipTrigger asChild>
                        <p className="line-clamp-2 cursor-pointer hover:bg-muted py-1 px-2 rounded-md">
                          {connectionVideoInfo.title}
                        </p>
                      </TooltipTrigger>
                    </PopoverTrigger>
                    <TooltipContent>點擊查看詳細資訊</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <PopoverContent className="flex flex-col gap-2 w-[432px]">
                  <div className="flex">
                    <img
                      className="h-auto w-[400px]"
                      width={400}
                      height={225}
                      src={`https://i.ytimg.com/vi/${connectionVideoInfo.id}/maxresdefault.jpg`}
                      alt=""
                    />
                  </div>

                  <DataList orientation="vertical" className="gap-4">
                    <DataListItem>
                      <DataListLabel>標題</DataListLabel>
                      <DataListValue className="break-all">{connectionVideoInfo.title}</DataListValue>
                    </DataListItem>

                    <DataListItem>
                      <DataListLabel>狀態</DataListLabel>
                      <DataListValue>
                        {connectionVideoInfo.isLive && (
                          <Badge variant="outline" className="gap-1.5">
                            <Radio className="text-red-500" aria-hidden="true" />
                            <span className="text-red-500">正在直播</span>
                          </Badge>
                        )}

                        {connectionVideoInfo.isUpcoming && (
                          <Badge variant="secondary" className="gap-1.5">
                            即將直播
                          </Badge>
                        )}
                      </DataListValue>
                    </DataListItem>

                    <DataListItem>
                      <DataListLabel>{connectionVideoInfo.isLive ? '開始時間' : '預定開始時間'}</DataListLabel>
                      <DataListValue className="break-all">
                        {new Date(connectionVideoInfo.startTimestamp).toLocaleString('zh-Hant-TW')}
                      </DataListValue>
                    </DataListItem>
                  </DataList>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className={cn('flex justify-end', connectionVideoInfo && 'hidden')}>
        <Button
          onClick={() => {
            const value = inputRef.current?.value

            if (!value) {
              return
            }

            const { type, id } = parseYoutubeUrl(value)

            console.log({ type, id })

            if (type === 'clip' || id === null) {
              toast.error('此網址並非 YouTube 頻道或直播網址')

              return
            }

            if (type === 'channel' || type === 'channelHandle') {
              console.log(id)

              getChannelInfoAndThenUpdateChannelInfoSettings.mutate({ channelIdOrHandle: id })

              return
            }

            console.log(type, id)

            start.mutate({ videoId: id })
          }}
        >
          🚀 開始
        </Button>
      </CardFooter>
    </Card>
  )
}

function LiveOrUpcomingStreams({ channelInfo }: { channelInfo: ChannelInfo }) {
  const isInitialized = useRef(false)
  const [liveOrUpcomingStreams, setLiveOrUpcomingStreams] = useState<VideoInfo[]>([])

  const getLiveOrUpcomingStreams = trpcReact.getLiveOrUpcomingStreams.useMutation({
    onSuccess: ({ error, data }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log('success', data)

      data.sort((a, b) => (a.startTimestamp ?? 0) - (b.startTimestamp ?? 0))

      setLiveOrUpcomingStreams(data)

      if (data.length > 0) {
        toast.success('成功取得直播與待機室資料！')
      }
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  useEffect(() => {
    if (!isInitialized.current) {
      getLiveOrUpcomingStreams.mutate({ channelIdOrHandle: channelInfo.id })
    }

    return () => {
      isInitialized.current = true
    }
  }, [channelInfo.id, getLiveOrUpcomingStreams])

  return (
    <div className="flex flex-col max-w-sm">
      <div className="flex justify-between items-center">
        <CardTitle>直播與待機室列表</CardTitle>

        <TooltipProvider delayDuration={250}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => {
                  getLiveOrUpcomingStreams.mutate({ channelIdOrHandle: channelInfo.id })
                }}
              >
                <RotateCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>重新整理列表</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {liveOrUpcomingStreams.length > 0 && (
        <div className="-mx-6 pt-4">
          <ListTable liveOrUpcomingStreams={liveOrUpcomingStreams}></ListTable>
        </div>
      )}

      {liveOrUpcomingStreams.length === 0 && (
        <div className="flex flex-col py-2 text-muted-foreground">
          <p>此頻道目前沒有任何直播或待機室</p>
          <p className="inline">
            <span>可以嘗試按一下</span>
            <span
              className="inline-flex items-center cursor-pointer border-b border-muted-foreground"
              onClick={() => {
                getLiveOrUpcomingStreams.mutate({ channelIdOrHandle: channelInfo.id })
              }}
            >
              右上角
              <RotateCw className="ml-1" size={18} />
              「重新整理列表」按鈕
            </span>
            <span>看看</span>
          </p>
        </div>
      )}
    </div>
  )
}

function ListTable({ liveOrUpcomingStreams }: { liveOrUpcomingStreams: VideoInfo[] }) {
  const viewportRef = useAtomValue(viewportRefAtom)
  const setConnectionVideoInfo = useSetAtom(connectionVideoInfoAtom)

  const start = trpcReact.start.useMutation({
    onSuccess: ({ error, data }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log('success', data)

      toast.success('成功與直播聊天室建立連線！')

      setConnectionVideoInfo(data)

      viewportRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  return (
    <Table className="border-separate border-spacing-0">
      <TableHeader className="sticky -top-px bottom-8 bg-background">
        <TableRow>
          <TableHead className="border-y text-foreground">
            <p className="pl-4">直播或待機室標題</p>
          </TableHead>
          <TableHead className="border-y text-foreground text-center">建立連線</TableHead>
        </TableRow>

        {/* <div className="absolute w-full h-px bg-border bottom-0"></div> */}
      </TableHeader>

      <TableBody>
        {liveOrUpcomingStreams.map((liveOrUpcomingStream) => (
          <TableRow key={liveOrUpcomingStream.id}>
            <TableCell className="border-b">
              <div className="flex font-medium text-lg max-w-[19rem]">
                <Popover>
                  <TooltipProvider delayDuration={250}>
                    <Tooltip>
                      <PopoverTrigger asChild>
                        <TooltipTrigger asChild>
                          <p className="line-clamp-2 cursor-pointer hover:bg-muted py-1 px-2 rounded-md">
                            {liveOrUpcomingStream.title}
                          </p>
                        </TooltipTrigger>
                      </PopoverTrigger>
                      <TooltipContent>點擊查看詳細資訊</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <PopoverContent className="flex flex-col gap-2 w-[432px]">
                    <div className="flex">
                      <img
                        className="h-auto w-[400px]"
                        width={400}
                        height={225}
                        src={`https://i.ytimg.com/vi/${liveOrUpcomingStream.id}/maxresdefault.jpg`}
                        alt=""
                      />
                    </div>

                    <DataList orientation="vertical" className="gap-4">
                      <DataListItem>
                        <DataListLabel>標題</DataListLabel>
                        <DataListValue className="break-all">{liveOrUpcomingStream.title}</DataListValue>
                      </DataListItem>

                      <DataListItem>
                        <DataListLabel>狀態</DataListLabel>
                        <DataListValue>
                          {liveOrUpcomingStream.isLive && (
                            <Badge variant="outline" className="gap-1.5">
                              <Radio className="text-red-500" aria-hidden="true" />
                              <span className="text-red-500">正在直播</span>
                            </Badge>
                          )}

                          {liveOrUpcomingStream.isUpcoming && (
                            <Badge variant="secondary" className="gap-1.5">
                              即將直播
                            </Badge>
                          )}
                        </DataListValue>
                      </DataListItem>

                      <DataListItem>
                        <DataListLabel>{liveOrUpcomingStream.isLive ? '開始時間' : '預定開始時間'}</DataListLabel>
                        <DataListValue className="break-all">
                          {format(liveOrUpcomingStream.startTimestamp)}
                        </DataListValue>
                      </DataListItem>
                    </DataList>
                  </PopoverContent>
                </Popover>
              </div>
            </TableCell>

            <TableCell className="border-b">
              <div className="flex gap-2 justify-center">
                <TooltipProvider delayDuration={250}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        onClick={() => {
                          start.mutate({ videoId: liveOrUpcomingStream.id })
                        }}
                      >
                        🚀
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>建立連線</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

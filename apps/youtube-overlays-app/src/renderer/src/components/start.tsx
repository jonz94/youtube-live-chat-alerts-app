import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { Input } from '~/renderer/components/ui/input'
import { parseYoutubeUrl } from '~/renderer/lib/parse-youtube-url'
import { trpcReact } from '~/renderer/trpc'

export function Start() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [videoTitle, setVideoTitle] = useState('')
  const start = trpcReact.start.useMutation({
    onSuccess: ({ error, data }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log('success', data)

      toast.success('成功與直播聊天室建立連線！')

      setVideoTitle(data?.title ?? '')
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  const getLiveOrUpcomingStreams = trpcReact.getLiveOrUpcomingStreams.useMutation({
    onSuccess: ({ error, data }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log('success', data)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>與聊天室建立連線</CardTitle>
        <CardDescription>輸入直播網址並按下開始，讓小程式可以讀取到聊天室訊息</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          className={videoTitle ? 'hidden' : ''}
          ref={inputRef}
          type="text"
          placeholder="請輸入 YouTube 頻道或直播網址"
        />

        <div className={videoTitle ? '' : 'hidden'}>
          <p className="text-green-500">成功與直播聊天室建立連線！</p>
          <p className="truncate max-w-sm">{videoTitle}</p>
        </div>
      </CardContent>
      <CardFooter className={videoTitle ? 'hidden' : ''}>
        <Button
          onClick={() => {
            const value = inputRef.current?.value

            if (!value) {
              return
            }

            const { type, id } = parseYoutubeUrl(value)

            if (type === 'clip' || id === null) {
              toast.error('此網址並非 YouTube 頻道或直播網址')

              return
            }

            if (type === 'channel' || type === 'channelHandler') {
              console.log(id)

              getLiveOrUpcomingStreams.mutate({ channelIdOrHandler: id })

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

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
    onSuccess: async ({ error, data }) => {
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()

        const value = inputRef.current?.value

        if (!value) {
          return
        }

        const { type, id } = parseYoutubeUrl(value)

        if (type === 'clip' || type === 'channel' || id === null) {
          toast.error('此網址並非 YouTube 直播')

          return
        }

        console.log(id)

        start.mutate({ videoId: id })
      }}
    >
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
            placeholder="請輸入 YouTube 直播網址"
          />

          <div className={videoTitle ? '' : 'hidden'}>
            <p className="text-green-500">成功與直播聊天室建立連線！</p>
            <ul>
              <li>{videoTitle}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className={videoTitle ? 'hidden' : ''}>
          <Button type="submit">🚀 開始</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

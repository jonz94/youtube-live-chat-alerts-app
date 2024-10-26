import { useRef, useState } from 'react'
import { Button } from '~/renderer/components/ui/button'
import { Input } from '~/renderer/components/ui/input'
import { parseYoutubeUrl } from '~/renderer/lib/parse-youtube-url'
import { cn } from '~/renderer/lib/utils'
import { trpcReact } from '~/renderer/trpc'

export function Start() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const start = trpcReact.start.useMutation({
    onSuccess: async ({ error, data }) => {
      if (error) {
        console.log('error', error)

        return
      }

      console.log('success', data)

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
      className="flex flex-col gap-y-4"
      onSubmit={(e) => {
        e.preventDefault()

        const value = inputRef.current?.value

        if (!value) {
          return
        }

        const { type, id } = parseYoutubeUrl(value)

        if (type === 'clip' || type === 'channel' || id === null) {
          setErrorMessage('此網址並非 YouTube 直播')

          return
        }

        setErrorMessage('')

        console.log(id)

        start.mutate({ videoId: id })
      }}
    >
      <div>
        <Input ref={inputRef} type="text" placeholder="請輸入 YouTube 直播網址" />
        <p className={cn('px-4 mt-1 text-red-500 min-h-6', errorMessage ? 'visible' : 'invisible')}>{errorMessage}</p>
      </div>

      <div>
        <Button type="submit">送出</Button>
      </div>

      <div className={videoTitle ? '' : 'hidden'}>
        <p className="text-green-500">成功與直播聊天室建立連線！</p>
        <ul>
          <li>{videoTitle}</li>
        </ul>
      </div>
    </form>
  )
}

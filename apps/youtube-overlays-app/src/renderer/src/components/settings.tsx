import { useEffect, useRef } from 'react'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { Input } from '~/renderer/components/ui/input'
import { Label } from '~/renderer/components/ui/label'
import { trpcReact } from '~/renderer/trpc'

export function Settings() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { data: settings, error, isLoading } = trpcReact.settings.useQuery()
  const utils = trpcReact.useUtils()
  const update = trpcReact.updateAnimationTimeSetting.useMutation({
    onSuccess: async () => {
      console.log('success')
      utils.settings.invalidate()
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  useEffect(() => {
    if (inputRef.current && settings) {
      inputRef.current.value = String(settings.animationTimeInMilliseconds)
    }
  }, [])

  if (isLoading) {
    return <>載入中</>
  }

  if (error) {
    return <>發生錯誤</>
  }

  if (!settings) {
    return <>發生錯誤</>
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()

        const value = inputRef.current?.value

        if (!value) {
          return
        }

        console.log({ value })

        update.mutate(Number(value) * 1000)
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="animationTimeInMilliseconds" className="px-3">
              顯示時間 (秒)
            </Label>
            <Input
              id="animationTimeInMilliseconds"
              ref={inputRef}
              type="number"
              defaultValue={Math.round(settings.animationTimeInMilliseconds / 1000)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">更新</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

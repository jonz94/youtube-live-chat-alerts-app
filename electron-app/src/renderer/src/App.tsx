import { ModeToggle } from '~/renderer/components/mode-toggle'
import { Open } from '~/renderer/components/open'
import { Card, CardContent, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { trpcReact } from '~/renderer/trpc'

export default function App() {
  const { data, error, isLoading } = trpcReact.initial.useQuery()

  if (isLoading) {
    return <p>程式初始化中...</p>
  }

  if (error) {
    return (
      <div className="text-center">
        <p>程式初始化時發生錯誤：</p>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid gap-y-4 place-content-center">
      <div className="fixed top-4 right-4">
        <ModeToggle></ModeToggle>
      </div>

      <a
        href={data?.isDev ? 'http://localhost:1337/overlays' : 'http://localhost:21829/overlays'}
        target="_blank"
        rel="noreferrer"
      >
        <Card>
          <CardHeader>
            <CardTitle>瀏覽器顯示</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">註：可直接用滑鼠拖曳此方框、然後丟進 OBS 視窗內</p>
          </CardContent>
        </Card>
      </a>

      <div>
        <Open></Open>
      </div>
    </div>
  )
}

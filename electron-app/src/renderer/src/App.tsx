import { Launcher } from '~/renderer/components/launcher'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import { Open } from '~/renderer/components/open'
import { Start } from '~/renderer/components/start'
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

      <Launcher isDev={!!data?.isDev}></Launcher>

      <Start></Start>

      <Open></Open>
    </div>
  )
}

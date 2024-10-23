import Debug from '~/renderer/components/debug'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import Versions from '~/renderer/components/versions'
import { trpcReact } from '~/renderer/trpc'

export default function App() {
  const {
    data: info,
    error,
    isLoading,
  } = trpcReact.getVideoBasicInfo.useQuery({
    videoId: 'oH0qJJqEBRE',
  })

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-content-center">
        <div className="text-center">
          <p>資料載入中</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen grid place-content-center">
        <div className="text-center">
          <p>資料載入時發生異常：</p>
          <p>{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid place-content-center">
      <div className="w-screen overflow-x-auto">
        <pre>{JSON.stringify(info, null, 2)}</pre>
      </div>

      <ModeToggle></ModeToggle>

      <Debug></Debug>

      <Versions></Versions>
    </div>
  )
}

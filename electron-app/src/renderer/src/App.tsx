import { useQuery } from '@tanstack/react-query'
import { ModeToggle } from '~/renderer/components/mode-toggle'
import Versions from '~/renderer/components/versions'
import { getVideoBasicInfo } from '~/renderer/query'

export default function App() {
  const {
    data: info,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['info'],
    queryFn: getVideoBasicInfo('oH0qJJqEBRE'),
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

      <Versions></Versions>
    </div>
  )
}

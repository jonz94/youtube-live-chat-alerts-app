import { trpcReact } from '~/renderer/trpc'

export default function VideoInfo() {
  const {
    data: info,
    error,
    isLoading,
  } = trpcReact.getVideoBasicInfo.useQuery({
    videoId: 'oH0qJJqEBRE',
  })

  if (isLoading) {
    return (
      <div className="text-center">
        <p>資料載入中</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <p>資料載入時發生異常：</p>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="w-screen overflow-x-auto">
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  )
}

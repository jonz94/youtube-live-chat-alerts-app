import { trpcReact } from '~/renderer/trpc'

export default function Debug() {
  const { data, error, isLoading } = trpcReact.debug.useQuery()

  if (isLoading) {
    return <p>資料載入中</p>
  }

  if (error) {
    return (
      <div className="text-center">
        <p>資料載入時發生異常：</p>
        <p>{error.message}</p>
      </div>
    )
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

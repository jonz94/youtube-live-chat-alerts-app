import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { fetchLivechatData } from '~/query'
import { socket } from '~/socket'

export function Livechat() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['livechat'],
    queryFn: fetchLivechatData('BjBBXyeP7f0'),
  })

  useEffect(() => {
    function onLivechat(action: unknown) {
      console.log(action)
    }

    socket.on('livechat', onLivechat)

    return () => {
      socket.off('livechat', onLivechat)
    }
  }, [])

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

  return <pre>{JSON.stringify(data ?? null, null, 2)}</pre>
}

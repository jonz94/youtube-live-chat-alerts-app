import { useEffect } from 'react'
import { PaidMessage } from '~/renderer/components/paid-message/paid-message'
import { socket } from '~/renderer/socket'

interface Donation {
  type: 'ECPAY'
  to: string
  data: unknown
}

export function DonationList() {
  useEffect(() => {
    function onReceiveDonation({ type, to, data }: Donation) {
      console.log('receive donation', type, to, data)
    }

    socket.on('receive-donation', onReceiveDonation)

    return () => {
      socket.off('receive-donation', onReceiveDonation)
    }
  }, [])

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 font-pixel">
      <PaidMessage price={-Infinity} nickname={'測試者'.repeat(100)}></PaidMessage>
      <PaidMessage price={0} nickname={'測試者'.repeat(100)} message={'這是一筆贊助測試~'}></PaidMessage>
      <PaidMessage price={15} nickname={'測試者'.repeat(100)} message={'這是一筆贊助測試~'}></PaidMessage>
      <PaidMessage price={30} nickname={'測試者'.repeat(100)} message={'這是一筆贊助測試~'}></PaidMessage>
      <PaidMessage nickname={'測試者'.repeat(100)} price={75} message={'這是一筆贊助測試~'}></PaidMessage>
      <PaidMessage nickname={'測試者'.repeat(100)} price={150} message={'這是一筆贊助測試~'}></PaidMessage>
      <PaidMessage nickname={'測試者'.repeat(100)} price={300} message={'這是一筆贊助測試~'}></PaidMessage>
      <PaidMessage nickname={'測試者'.repeat(100)} price={750} message={'這是一筆贊助測試~'}></PaidMessage>
      <PaidMessage
        nickname={'測試者'.repeat(100)}
        price={1500}
        message={'很長很長的文字測試~'.repeat(10)}
      ></PaidMessage>
      <PaidMessage nickname={'測試者'.repeat(100)} price={2820} message={'RGB 彩虹測試！'}></PaidMessage>
      <PaidMessage nickname={'測試者'.repeat(100)} price={10000} message={'這是一筆贊助測試~'}></PaidMessage>
    </div>
  )
}

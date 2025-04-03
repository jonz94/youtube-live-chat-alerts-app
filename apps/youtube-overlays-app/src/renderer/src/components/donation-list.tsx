import { useEffect, useState } from 'react'
import { PaidMessage } from '~/renderer/components/paid-message/paid-message'
import { socket } from '~/renderer/socket'

interface Donation {
  type: 'ECPAY'
  to: string
  data: unknown
}

export function DonationList() {
  const [donations] = useState([
    { price: -Infinity, nickname: '測試者'.repeat(100) },
    { price: 0, nickname: '測試者'.repeat(100), message: '這是一筆贊助測試~' },
    { price: 15, nickname: '測試者'.repeat(100), message: '這是一筆贊助測試~' },
    { price: 30, nickname: '測試者'.repeat(100), message: '這是一筆贊助測試~' },
    { price: 75, nickname: '測試者'.repeat(100), message: '這是一筆贊助測試~' },
    { price: 150, nickname: '測試者'.repeat(100), message: '這是一筆贊助測試~' },
    { price: 300, nickname: '測試者'.repeat(100), message: '這是一筆贊助測試~' },
    { price: 750, nickname: '測試者'.repeat(100), message: '這是一筆贊助測試~' },
    {
      price: 1500,
      nickname: '測試者'.repeat(100),
      message: '很長很長的文字測試~'.repeat(10),
    },
    { price: 2820, nickname: '測試者'.repeat(100), message: 'RGB 彩虹測試！' },
    { price: 10000, nickname: '測試者'.repeat(100), message: '這是一筆贊助測試~' },
  ])

  // TODO: listen donation event and add it to the donation list
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
      {donations.slice(0, 100).map((props, index) => (
        <PaidMessage key={index} {...props} />
      ))}
    </div>
  )
}

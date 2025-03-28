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
      <PaidMessage
        headerBackgroundColor="#1565c0"
        contentBackgroundColor="#1e88e5"
        textColor="white"
        nickname={'測試者'.repeat(100)}
        price={15}
      ></PaidMessage>

      <PaidMessage
        headerBackgroundColor="#00b8d4"
        contentBackgroundColor="#00e5ff"
        textColor="black"
        nickname={'測試者'.repeat(100)}
        price={30}
        message={'這是一筆贊助測試~'}
      ></PaidMessage>

      <PaidMessage
        headerBackgroundColor="#00bfa5"
        contentBackgroundColor="#1de9b6"
        textColor="black"
        nickname={'測試者'.repeat(100)}
        price={75}
        message={'這是一筆贊助測試~'}
      ></PaidMessage>

      <PaidMessage
        headerBackgroundColor="#ffb300"
        contentBackgroundColor="#ffca28"
        textColor="black"
        nickname={'測試者'.repeat(100)}
        price={150}
        message={'這是一筆贊助測試~'}
      ></PaidMessage>

      <PaidMessage
        headerBackgroundColor="#e65100"
        contentBackgroundColor="#f57c00"
        textColor="white"
        nickname={'測試者'.repeat(100)}
        price={300}
        message={'這是一筆贊助測試~'}
      ></PaidMessage>

      <PaidMessage
        headerBackgroundColor="#c2185b"
        contentBackgroundColor="#e91e63"
        textColor="white"
        nickname={'測試者'.repeat(100)}
        price={750}
        message={'這是一筆贊助測試~'}
      ></PaidMessage>

      <PaidMessage
        headerBackgroundColor="#d00000"
        contentBackgroundColor="#e62117"
        textColor="white"
        nickname={'測試者'.repeat(100)}
        price={1500}
        message={'這是一筆贊助測試~'}
      ></PaidMessage>

      <PaidMessage
        textColor="white"
        nickname={'測試者'.repeat(100)}
        price={2820}
        message={'這是一筆贊助測試~'}
        effect="rainbow"
      ></PaidMessage>

      <PaidMessage
        textColor="black"
        nickname={'測試者'.repeat(100)}
        price={10000}
        message={'這是一筆贊助測試~'}
        effect="shiny"
      ></PaidMessage>
    </div>
  )
}

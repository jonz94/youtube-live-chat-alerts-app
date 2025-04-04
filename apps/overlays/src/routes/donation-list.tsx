import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PaidMessage, priceToVariant } from '~/components/paid-message/paid-message'
import type { SettingsSchema } from '~/lib/schema'
import { cn } from '~/lib/utils'
import { fetchSettings } from '~/query'
import { socket } from '~/socket'

export const Route = createFileRoute('/donation-list')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: settings, error, isLoading, refetch } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })

  useEffect(() => {
    function onDonationListUpdate() {
      void refetch()
    }

    socket.on('donation-list-updated', onDonationListUpdate)

    return () => {
      socket.off('donation-list-updated', onDonationListUpdate)
    }
  }, [refetch])

  if (isLoading) {
    return <>設定載入中...</>
  }

  if (error) {
    return (
      <>
        <p>載入設定時發生錯誤！</p>
        <p>詳細錯誤訊息如下：</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </>
    )
  }

  if (!settings) {
    return <>載入設定時發生錯誤：設定資料空空如也</>
  }

  return <DonationList settings={settings}></DonationList>
}

function DonationList({ settings }: { settings: SettingsSchema }) {
  const donations = settings.tempDonations

  const uniqueDonations = donations.filter(
    (item, index) => donations.findIndex((donation) => donation.uniqueId === item.uniqueId) === index,
  )

  return (
    <div className="w-full flex flex-col justify-center gap-2 font-pixel">
      {uniqueDonations
        .reverse()
        .slice(0, 100)
        .map((donation) => (
          <div
            key={donation.uniqueId}
            className={cn('relative', priceToVariant(donation.price).name === 'unknown' && 'hidden')}
          >
            <PaidMessage {...donation} />
          </div>
        ))}
    </div>
  )
}

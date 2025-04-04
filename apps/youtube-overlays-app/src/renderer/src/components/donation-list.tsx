import { X } from 'lucide-react'
import { useEffect } from 'react'
import { PaidMessage, priceToVariant } from '~/renderer/components/paid-message/paid-message'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/renderer/components/ui/card'
import { cn } from '~/renderer/lib/utils'
import { socket } from '~/renderer/socket'
import { trpcReact } from '~/renderer/trpc'
import { SettingsSchema } from '../../../main/schema'

export function DonationList() {
  const { data: settings, error, isLoading, refetch } = trpcReact.settings.useQuery()

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
    return <p>載入設定檔...</p>
  }

  if (error) {
    return (
      <div className="text-center">
        <p>載入設定檔時發生錯誤：</p>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!settings) {
    return <p>載入設定檔失敗...</p>
  }

  return <DonationListCard settings={settings}></DonationListCard>
}

function DonationListCard({ settings }: { settings: SettingsSchema }) {
  const donations = settings.tempDonations

  const uniqueDonations = donations.filter(
    (item, index) => donations.findIndex((donation) => donation.uniqueId === item.uniqueId) === index,
  )

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>斗內清單</CardTitle>
          <CardDescription>目前只會顯示最新的 100 筆斗內紀錄</CardDescription>
        </CardHeader>

        <CardContent className="py-4 bg-white">
          <div className="w-full flex flex-col items-center justify-center gap-2 font-pixel">
            {uniqueDonations
              .reverse()
              .slice(0, 100)
              .map((donation) => (
                <div
                  key={donation.uniqueId}
                  className={cn('relative', priceToVariant(donation.price).name === 'unknown' && 'hidden')}
                >
                  <PaidMessage {...donation} />

                  {/* TODO: click to hide donation */}
                  <Button
                    className="hidden absolute top-0 right-0 text-black hover:bg-transparent size-12"
                    variant="ghost"
                    onClick={() => console.log(donation.uniqueId)}
                  >
                    <X></X>
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>斗內清單設定</CardTitle>
        </CardHeader>

        <CardContent>
          <p>即將推出</p>
        </CardContent>
      </Card>
    </>
  )
}

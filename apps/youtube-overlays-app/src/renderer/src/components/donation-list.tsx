import { X } from 'lucide-react'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { PaidMessage, priceToVariant } from '~/renderer/components/paid-message/paid-message'
import { Button } from '~/renderer/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/renderer/components/ui/card'
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
  const donations = settings.tempDonations.filter(
    (donation) => priceToVariant(donation.price).name !== 'unknown' && donation.hide !== true,
  )

  const uniqueDonations = donations.filter(
    (item, index) => donations.findIndex((donation) => donation.uniqueId === item.uniqueId) === index,
  )

  const hideDonation = trpcReact.hideDonation.useMutation({
    onSuccess: (output) => {
      if (output.error) {
        toast.error(output.error)
        return
      }

      console.log('success')

      toast.success(`儲存成功：已經成功隱藏該斗內訊息`)
    },
    onError: (error) => {
      console.log('error', error)
    },
  })

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>斗內清單</CardTitle>
          <CardDescription>目前只會顯示最新的 100 筆斗內紀錄</CardDescription>
        </CardHeader>

        {uniqueDonations.length <= 0 ? (
          <CardContent className="bg-white py-4">
            <p className="font-pixel text-black">目前還沒有斗內訊息～</p>
          </CardContent>
        ) : (
          <CardContent className="bg-white py-4">
            <div className="flex w-full flex-col items-center justify-center gap-2 font-pixel">
              {uniqueDonations
                .reverse()
                .slice(0, 100)
                .map((donation) => (
                  <div key={donation.uniqueId} className="relative">
                    <PaidMessage {...donation} />

                    <Button
                      className="absolute right-0 top-0 size-12 text-black hover:bg-transparent"
                      variant="ghost"
                      onClick={() => hideDonation.mutate({ id: donation.uniqueId })}
                    >
                      <X></X>
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        )}
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

import { Button } from '~/renderer/components/ui/button'
import { trpcReact } from '~/renderer/trpc'

export function Open() {
  const { error, mutate, isPending } = trpcReact.open.useMutation()

  return (
    <>
      <Button className="p-8" onClick={() => mutate()} disabled={isPending}>
        <span className="text-2xl">贈訂測試</span>
      </Button>

      {error ? (
        <div className="text-center">
          <p>發生錯誤：</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : null}
    </>
  )
}

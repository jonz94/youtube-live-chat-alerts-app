import { Button } from '~/renderer/components/ui/button'
import { trpcReact } from '~/renderer/trpc'

export function Open() {
  const { error, mutate, isPending } = trpcReact.open.useMutation()

  return (
    <>
      <Button variant="secondary" onClick={() => mutate()} disabled={isPending}>
        贈訂測試
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

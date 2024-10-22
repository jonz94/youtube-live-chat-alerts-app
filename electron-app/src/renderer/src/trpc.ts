import { QueryClient } from '@tanstack/react-query'
import { createTRPCReact } from '@trpc/react-query'
import { ipcLink } from 'trpc-electron/renderer'
import type { AppRouter } from '../../main/api'

export const queryClient = new QueryClient()
export const trpcReact = createTRPCReact<AppRouter>()
export const trpcClient = trpcReact.createClient({
  links: [ipcLink()],
})

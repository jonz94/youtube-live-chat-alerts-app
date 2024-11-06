import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { ThemeProvider } from '~/renderer/components/theme-provider'
import App from './App'
import { queryClient, trpcClient, trpcReact } from './trpc'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App />
          <Toaster richColors expand closeButton />
        </ThemeProvider>
      </QueryClientProvider>
    </trpcReact.Provider>
  </StrictMode>,
)

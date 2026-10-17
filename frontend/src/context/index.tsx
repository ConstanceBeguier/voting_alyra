'use client'

import { wagmiAdapter, projectId, networks } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

const queryClient = new QueryClient()

// url must match the origin the app is served from, or WalletConnect rejects
// the session
const metadata = {
  name: 'Voting',
  description: 'On-chain voting dApp',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  icons: []
}

// registers the <appkit-*> elements; the returned handle is unused
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  themeMode: 'dark',
  features: {
    analytics: false
  },
  themeVariables: {
    '--w3m-accent': '#8b5cf6',
    '--w3m-color-mix': '#8b5cf6',
    '--w3m-color-mix-strength': 8,
    '--w3m-border-radius-master': '3px',
  }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider

import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia, hardhat } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
const envProjectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!envProjectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set — see .env.example')
}

// narrowing does not cross module boundaries, hence the re-export
export const projectId: string = envProjectId

// must match the networks declared in backend/hardhat.config.ts
const supported = [sepolia, hardhat] as const

// The first network is the default: what useChainId reports before a wallet
// is connected, and what AppKit offers first.
const defaultChainId = Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID ?? sepolia.id)
const preferred = supported.find((network) => network.id === defaultChainId)

if (!preferred) {
  throw new Error(
    `NEXT_PUBLIC_DEFAULT_CHAIN_ID=${defaultChainId} is not a supported chain ` +
      `(expected one of ${supported.map((n) => n.id).join(', ')})`,
  )
}

export const networks = [
  preferred,
  ...supported.filter((network) => network !== preferred),
] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
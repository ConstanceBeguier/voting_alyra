import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { sepolia, hardhat } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
const envProjectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!envProjectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set — see .env.example')
}

// re-exported through a narrowed const: the check above does not narrow the
// type across module boundaries
export const projectId: string = envProjectId

// must match the networks declared in backend/hardhat.config.ts
export const networks = [sepolia, hardhat] as [AppKitNetwork, ...AppKitNetwork[]]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
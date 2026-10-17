'use client'
import { useAppKit } from '@reown/appkit/react'
import { useAccount } from 'wagmi'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/Avatar'

/** Our own button over AppKit's modal, so it matches the rest of the site. */
export function ConnectButton() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  if (isConnected && address) {
    return (
      <button
        onClick={() => open({ view: 'Account' })}
        className="glass flex items-center gap-2 rounded-full py-1 pr-3.5 pl-1 text-sm font-medium transition-colors hover:border-white/20"
      >
        <Avatar address={address} className="size-7" />
        <span className="font-mono">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
      </button>
    )
  }

  return (
    <Button variant="brand" className="h-9 px-4" onClick={() => open()}>
      <Wallet /> Connect wallet
    </Button>
  )
}

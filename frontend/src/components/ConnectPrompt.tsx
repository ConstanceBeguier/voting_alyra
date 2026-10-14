'use client'
import { useAccount } from 'wagmi'

export function ConnectPrompt() {
  const { isConnected } = useAccount()

  if (isConnected) return null

  return (
    <p className="text-muted-foreground">
      Connect your wallet to take part in the vote.
    </p>
  )
}

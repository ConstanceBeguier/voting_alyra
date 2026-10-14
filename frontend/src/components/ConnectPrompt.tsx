'use client'
import { useAccount } from 'wagmi'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Wallet } from 'lucide-react'

export function ConnectPrompt() {
  const { isConnected } = useAccount()

  if (isConnected) return null

  return (
    <Alert>
      <Wallet />
      <AlertTitle>No wallet connected</AlertTitle>
      <AlertDescription>
        Connect your wallet to take part in the vote.
      </AlertDescription>
    </Alert>
  )
}

'use client'
import { useAccount } from 'wagmi'
import { Wallet } from 'lucide-react'
import { ConnectButton } from '@/components/ConnectButton'

export function ConnectPrompt() {
  const { isConnected } = useAccount()

  if (isConnected) return null

  return (
    <section className="glass mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl p-6 text-center motion-safe:animate-rise sm:flex-row sm:text-left">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-[0_0_30px_-6px_var(--brand)]">
        <Wallet className="size-6" />
      </span>
      <div className="flex-1">
        <p className="font-medium">Ready to take part?</p>
        <p className="text-sm text-muted-foreground">Connect your wallet — it only takes a moment.</p>
      </div>
      <ConnectButton />
    </section>
  )
}

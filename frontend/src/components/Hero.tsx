'use client'
import { useChainId } from 'wagmi'
import { networks } from '@/config'

export function Hero() {
  const chainId = useChainId()
  const network = networks.find((n) => n.id === chainId)?.name

  return (
    <section className="pt-6 text-center motion-safe:animate-rise">
      {network && (
        <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          Live on {network}
        </span>
      )}
      <h2 className="mt-6 text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
        Every voice, <span className="text-gradient">on-chain.</span>
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground sm:text-lg">
        Propose ideas, cast your ballot and watch the result unfold —
        transparent, tamper-proof, and verifiable by anyone.
      </p>
    </section>
  )
}

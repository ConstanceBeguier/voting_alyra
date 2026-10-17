'use client'
import { useEffect } from 'react'
import { useChainId, useReadContract } from 'wagmi'
import { Trophy } from 'lucide-react'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { WorkflowStatus } from '@/lib/workflow'
import { celebrateBig } from '@/lib/celebrate'

export function Winner({ status }: { status: number | undefined }) {
  const chainId = useChainId()
  const tallied = status === WorkflowStatus.VotesTallied

  const { data: winningId } = useReadContract({
    address: getVotingAddress(chainId),
    abi: votingAbi,
    functionName: 'winningProposalID',
    query: { enabled: tallied },
  })

  const revealed = tallied && winningId !== undefined

  useEffect(() => {
    if (revealed) celebrateBig()
  }, [revealed])

  if (!revealed) return null

  return (
    <section className="glass relative overflow-hidden rounded-2xl px-6 py-12 text-center shadow-[0_0_120px_-30px_var(--brand)] motion-safe:animate-rise">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--brand)_30%,transparent),transparent_65%)]" />
      <div className="relative">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand-gradient text-white shadow-[0_0_50px_-6px_var(--brand-2)] motion-safe:animate-pop">
          <Trophy className="size-10" />
        </span>
        <p className="eyebrow mt-6">And the winner is</p>
        <p className="mt-2 text-6xl font-semibold tracking-tight text-gradient">
          Proposal #{String(winningId)}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Counted on-chain. Final, and open for anyone to verify.</p>
      </div>
    </section>
  )
}

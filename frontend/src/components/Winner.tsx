'use client'
import { useEffect } from 'react'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { Trophy } from 'lucide-react'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { WorkflowStatus } from '@/lib/workflow'
import { celebrateBig } from '@/lib/celebrate'
import { revertedError } from '@/lib/revert'

export function Winner({ status }: { status: number | undefined }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const votingAddress = getVotingAddress(chainId)
  const tallied = status === WorkflowStatus.VotesTallied

  const { data: winningId } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'winningProposalID',
    query: { enabled: tallied },
  })

  const revealed = tallied && winningId !== undefined
  // the contract always registers the blank vote first
  const blank = winningId === 0n

  // getOneProposal is onlyVoters: anyone else just sees the id
  const { data: winner } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'getOneProposal',
    args: [winningId ?? 0n],
    account: address,
    query: {
      enabled: revealed && !blank && Boolean(address),
      retry: (failureCount, error) => !revertedError(error) && failureCount < 3,
    },
  })

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
        <p className="mt-2 text-5xl font-semibold tracking-tight break-words text-gradient sm:text-6xl">
          {blank ? 'Blank vote' : (winner?.description ?? `Proposal #${winningId}`)}
        </p>
        {winner && (
          <p className="mt-3 font-mono text-sm text-muted-foreground">Proposal #{String(winningId)}</p>
        )}
        <p className="mt-3 text-sm text-muted-foreground">Counted on-chain. Final, and open for anyone to verify.</p>
      </div>
    </section>
  )
}

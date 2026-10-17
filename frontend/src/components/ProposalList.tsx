'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import {
  votingAbi,
  getVotingAddress,
  getVotingDeployBlock,
} from '@/contracts/voting'
import { useWatchProposals } from '@/hooks/useVotingEvents'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { ListError } from '@/components/ListError'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { WorkflowStatus } from '@/lib/workflow'
import { cn } from 'cn'
import { Check, Lightbulb, Loader2, Vote } from 'lucide-react'

/**
 * A description is written once and never changes, so it is cacheable. Keyed by
 * the registering transaction, not the contract address: a local redeploy
 * reuses the same deterministic address with different proposals.
 */
const descriptions = new Map<string, string>()

export function ProposalList({
  status,
  hasVoted,
  votedProposalId,
}: {
  status: number | undefined
  hasVoted: boolean
  votedProposalId: bigint | undefined
}) {
  const { address } = useAccount()
  const chainId = useChainId()
  const votingAddress = getVotingAddress(chainId)
  const client = usePublicClient()
  const fromBlock = getVotingDeployBlock(chainId)

  useWatchProposals(votingAddress)

  const { data: proposals, isPending, error } = useQuery({
    queryKey: ['proposals', chainId, votingAddress, address],
    enabled: Boolean(client && votingAddress && address),
    queryFn: async () => {
      // guaranteed by `enabled` above; asserted so the rest reads cleanly
      if (!client || !votingAddress || !address) throw new Error('Not ready')

      // the event only carries the id
      const logs = await client.getContractEvents({
        address: votingAddress,
        abi: votingAbi,
        eventName: 'ProposalRegistered',
        fromBlock,
      })

      return Promise.all(
        logs.map(async (log) => {
          const id = log.args.proposalId!
          const key = log.transactionHash
          let description = descriptions.get(key)

          if (description === undefined) {
            const proposal = await client.readContract({
              address: votingAddress,
              abi: votingAbi,
              functionName: 'getOneProposal',
              args: [id],
              account: address,
            })
            description = proposal.description
            descriptions.set(key, description)
          }

          return { id, description }
        }),
      )
    },
  })

  // one write for the whole list: while a vote is pending, no other can be sent
  const { busy, write, tx } = useVotingWrite()
  const [choice, setChoice] = useState<bigint>()

  if (isPending) return null
  if (error) return <ListError what="proposals" error={error} />

  const canVote = status === WorkflowStatus.VotingSessionStarted && !hasVoted

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="eyebrow">Proposals</h3>
        <span className="text-xs text-muted-foreground tabular-nums">{proposals?.length ?? 0}</span>
      </div>

      {proposals?.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {proposals.map((proposal, index) => {
            const mine = votedProposalId === proposal.id
            const chosen = choice === proposal.id
            // the contract always registers the blank vote first
            const blank = proposal.id === 0n

            return (
              <li
                key={String(proposal.id)}
                style={{ animationDelay: `${index * 60}ms` }}
                className={cn(
                  'group flex flex-wrap items-center gap-3 rounded-xl border p-4 transition-all duration-300 motion-safe:animate-rise',
                  mine
                    ? 'border-voter/60 bg-voter/10 shadow-[0_0_40px_-12px_var(--voter)]'
                    : 'border-white/8 bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]',
                  blank && !mine && 'border-dashed',
                  hasVoted && !mine && 'opacity-55',
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-xs text-muted-foreground">
                  {blank ? '∅' : `#${proposal.id}`}
                </span>
                {blank ? (
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Blank vote</span>
                    <span className="block text-xs text-muted-foreground">No preference — wins only with a strict majority</span>
                  </span>
                ) : (
                  <span className="min-w-0 flex-1 truncate font-medium">{proposal.description}</span>
                )}
                {mine && (
                  <span className="flex items-center gap-1 rounded-full bg-voter px-2.5 py-1 text-xs font-semibold text-background motion-safe:animate-pop">
                    <Check className="size-3.5" /> Your vote
                  </span>
                )}
                {canVote && (
                  <Button
                    size="sm"
                    variant="brand"
                    disabled={busy}
                    onClick={() => {
                      setChoice(proposal.id)
                      write(
                        'setVote',
                        [proposal.id],
                        blank ? 'Your blank vote has been recorded.' : `Your vote for proposal #${proposal.id} has been recorded.`,
                      )
                    }}
                  >
                    {busy && chosen ? <Loader2 className="animate-spin" /> : <Vote />}
                    {busy && chosen ? 'Confirming…' : 'Vote'}
                  </Button>
                )}
                {chosen && (
                  // full width, so a message wraps under the card instead of squeezing it
                  <div className="basis-full empty:hidden">
                    <TransactionAlert tx={tx} />
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 px-5 py-8 text-sm text-muted-foreground">
          <Lightbulb className="size-5 shrink-0 text-voter" />
          {/* the blank vote is registered as proposals open, so empty means not yet open */}
          Proposals open once voter registration ends.
        </div>
      )}
    </div>
  )
}

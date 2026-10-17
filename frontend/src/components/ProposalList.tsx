'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import {
  votingAbi,
  getVotingAddress,
  getVotingDeployBlock,
} from '@/contracts/voting'
import { VoteButton } from '@/components/VoteButton'
import { useWatchProposals } from '@/hooks/useVotingEvents'
import { ListError } from '@/components/ListError'
import { WorkflowStatus } from '@/lib/workflow'

/**
 * A description is written once and never changes, so it is cacheable. Keyed by
 * the registering transaction, not the contract address: a local redeploy
 * reuses the same deterministic address with different proposals.
 */
const descriptions = new Map<string, string>()

export function ProposalList({
  status,
  hasVoted,
}: {
  status: number | undefined
  hasVoted: boolean
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

  if (isPending) return null
  if (error) return <ListError what="proposals" error={error} />

  const canVote = status === WorkflowStatus.VotingSessionStarted && !hasVoted

  return (
    <div className="flex flex-col items-start gap-2">
      <h3 className="font-medium">Proposals</h3>
      {proposals?.length ? (
        <ul className="list-disc pl-5">
          {proposals.map((proposal) => (
            <li key={String(proposal.id)} className="py-1">
              <div className="flex items-center gap-2">
                <span>{proposal.description}</span>
                {canVote && <VoteButton proposalId={proposal.id} />}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No proposal yet.</p>
      )}
    </div>
  )
}

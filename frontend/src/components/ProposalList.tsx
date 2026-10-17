'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { VoteButton } from '@/components/VoteButton'
import { useWatchProposals } from '@/hooks/useVotingEvents'
import { ListError } from '@/components/ListError'

const VOTING_SESSION_STARTED = 3

/**
 * A proposal's description is written once and never changes, so it is worth
 * remembering: without this, every new proposal re-read all the previous ones.
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

  useWatchProposals(votingAddress)

  const { data: proposals, isPending, error } = useQuery({
    queryKey: ['proposals', chainId, votingAddress, address],
    enabled: Boolean(client && votingAddress && address),
    queryFn: async () => {
      // the event only carries the id, so the whole history gives us the ids
      const logs = await client!.getContractEvents({
        address: votingAddress!,
        abi: votingAbi,
        eventName: 'ProposalRegistered',
        fromBlock: 0n,
      })

      const ids = logs.map((log) => log.args.proposalId!)

      return Promise.all(
        ids.map(async (id) => {
          const key = `${votingAddress}:${id}`
          let description = descriptions.get(key)

          if (description === undefined) {
            const proposal = await client!.readContract({
              address: votingAddress!,
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

  // one vote per voter, only while the session is open
  const canVote = status === VOTING_SESSION_STARTED && !hasVoted

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

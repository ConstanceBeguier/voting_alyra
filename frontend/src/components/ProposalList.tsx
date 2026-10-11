'use client'
import { useQuery } from '@tanstack/react-query'
import { useAccount, usePublicClient } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'

export function ProposalList() {
  const { address, chainId } = useAccount()
  const votingAddress = getVotingAddress(chainId)
  const client = usePublicClient()

  const { data: proposals, isPending } = useQuery({
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

      // getOneProposal is onlyVoters: each call must run as the connected
      // address, which rules out a multicall batch (msg.sender would be
      // Multicall3 and every call would revert)
      return Promise.all(
        logs.map(async (log) => {
          const id = log.args.proposalId!
          const proposal = await client!.readContract({
            address: votingAddress!,
            abi: votingAbi,
            functionName: 'getOneProposal',
            args: [id],
            account: address,
          })
          return { id, ...proposal }
        }),
      )
    },
  })

  if (isPending) return null

  return (
    <div className="flex flex-col items-start gap-2">
      <h3 className="font-medium">Proposals</h3>
      {proposals?.length ? (
        <ul className="list-disc pl-5">
          {proposals.map((proposal) => (
            <li key={String(proposal.id)}>
              {proposal.description}{' '}
              <span className="text-muted-foreground">
                — {String(proposal.voteCount)} vote(s)
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No proposal yet.</p>
      )}
    </div>
  )
}

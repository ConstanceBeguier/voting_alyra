'use client'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { AddProposal } from '@/components/AddProposal'
import { ProposalList } from '@/components/ProposalList'

/** Everything only a registered voter may see. Renders nothing for anyone else. */
export function Voter({ status }: { status: number | undefined }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const votingAddress = getVotingAddress(chainId)

  // getVoter is onlyVoters, so it reverts for anyone else — which is exactly
  // how we tell. `account` makes the call run as the connected address;
  // without it msg.sender would be the zero address and it would always fail.
  const { data: voter } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'getVoter',
    args: address ? [address] : undefined,
    account: address,
    query: { enabled: Boolean(address && votingAddress), retry: false },
  })

  if (!voter?.isRegistered) return null

  return (
    <section className="flex flex-col items-start gap-3">
      <h2 className="text-lg font-semibold">Voter</h2>
      <p>
        {voter.hasVoted
          ? `You voted for proposal #${voter.votedProposalId}`
          : 'You have not voted yet'}
      </p>
      <AddProposal status={status} />
      <ProposalList status={status} hasVoted={voter.hasVoted} />
    </section>
  )
}

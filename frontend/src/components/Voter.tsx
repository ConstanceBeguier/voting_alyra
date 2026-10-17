'use client'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { revertedError } from '@/lib/revert'
import { AddProposal } from '@/components/AddProposal'
import { ProposalList } from '@/components/ProposalList'
import { RolePanel } from '@/components/RolePanel'
import { UserCheck } from 'lucide-react'

/** Everything only a registered voter may see. Renders nothing for anyone else. */
export function Voter({ status }: { status: number | undefined }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const votingAddress = getVotingAddress(chainId)

  // getVoter is onlyVoters: the revert is how we tell. `account` is required,
  // or msg.sender is the zero address and it fails for everyone.
  const { data: voter } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'getVoter',
    args: address ? [address] : undefined,
    account: address,
    query: {
      enabled: Boolean(address && votingAddress),
      // a revert is the answer, not an incident — but a network failure is
      retry: (failureCount, error) => !revertedError(error) && failureCount < 3,
    },
  })

  if (!voter?.isRegistered) return null

  return (
    <RolePanel
      accent="voter"
      icon={<UserCheck className="size-5.5" />}
      title="Your ballot"
      subtitle={
        voter.hasVoted
          ? 'Your vote is in — thank you for taking part.'
          : 'Submit ideas, then choose the one you believe in.'
      }
      badge="Registered voter"
    >
      <AddProposal status={status} />
      <ProposalList
        status={status}
        hasVoted={voter.hasVoted}
        votedProposalId={voter.hasVoted ? voter.votedProposalId : undefined}
      />
    </RolePanel>
  )
}

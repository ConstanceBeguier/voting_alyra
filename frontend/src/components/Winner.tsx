'use client'
import { useAccount, useReadContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'

const VOTES_TALLIED = 5

export function Winner() {
  const { chainId } = useAccount()
  const votingAddress = getVotingAddress(chainId)

  const { data: status } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'workflowStatus',
  })

  const tallied = status === VOTES_TALLIED

  const { data: winningId } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'winningProposalID',
    query: { enabled: tallied },
  })

  if (!tallied || winningId === undefined) return null

  return (
    <p>
      Winning proposal: <strong>#{winningId}</strong>
    </p>
  )
}

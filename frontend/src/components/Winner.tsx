'use client'
import { useChainId, useReadContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { WorkflowStatus } from '@/lib/workflow'

export function Winner({ status }: { status: number | undefined }) {
  const chainId = useChainId()
  const tallied = status === WorkflowStatus.VotesTallied

  const { data: winningId } = useReadContract({
    address: getVotingAddress(chainId),
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

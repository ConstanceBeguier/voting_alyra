'use client'
import { useAccount, useReadContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'

const LABELS = [
  'Registering voters',
  'Proposals registration started',
  'Proposals registration ended',
  'Voting session started',
  'Voting session ended',
  'Votes tallied',
] as const

export function WorkflowStatus() {
  const { chainId } = useAccount()

  const { data: status } = useReadContract({
    address: getVotingAddress(chainId),
    abi: votingAbi,
    functionName: 'workflowStatus',
  })

  if (status === undefined) return null

  return (
    <p>
      Current phase: <strong>{LABELS[status]}</strong>
    </p>
  )
}

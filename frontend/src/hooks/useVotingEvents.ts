'use client'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWatchContractEvent } from 'wagmi'
import { votingAbi } from '@/contracts/voting'

/**
 * Keeps the screen in step with the chain whoever caused the change —
 * useVotingWrite only refreshes after transactions this tab sent.
 *
 * Each watcher is called from the component that needs it, so mounting gates
 * it on the viewer's role. On HTTP these poll eth_getLogs: expect a lag.
 */

/** Phase changes, shown to everyone — including visitors without a wallet. */
export function useWatchWorkflowStatus(
  votingAddress: `0x${string}` | undefined,
  /** the page owns the workflow status read, so it hands back its refetch */
  onStatusChange: () => void,
) {
  useWatchContractEvent({
    address: votingAddress,
    abi: votingAbi,
    eventName: 'WorkflowStatusChange',
    enabled: Boolean(votingAddress),
    onLogs: onStatusChange,
  })
}

/** Registered voters, listed by the owner only. */
export function useWatchVoters(votingAddress: `0x${string}` | undefined) {
  const queryClient = useQueryClient()

  // onLogs is a watcher dependency: an inline arrow would resubscribe
  const onVoterRegistered = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['voters'] })
  }, [queryClient])

  useWatchContractEvent({
    address: votingAddress,
    abi: votingAbi,
    eventName: 'VoterRegistered',
    enabled: Boolean(votingAddress),
    onLogs: onVoterRegistered,
  })
}

/** Proposals, listed by registered voters only. */
export function useWatchProposals(votingAddress: `0x${string}` | undefined) {
  const queryClient = useQueryClient()

  const onProposalRegistered = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['proposals'] })
  }, [queryClient])

  useWatchContractEvent({
    address: votingAddress,
    abi: votingAbi,
    eventName: 'ProposalRegistered',
    enabled: Boolean(votingAddress),
    onLogs: onProposalRegistered,
  })
}

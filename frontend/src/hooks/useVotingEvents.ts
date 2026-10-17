'use client'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWatchContractEvent } from 'wagmi'
import { votingAbi } from '@/contracts/voting'

/**
 * Watchers that keep the screen in step with the chain, whoever caused the
 * change: useVotingWrite only refreshes after transactions *this* tab sent.
 *
 * They are split per concern and called from the component that needs them, so
 * a subscription only exists while its consumer is mounted — which gates them
 * on the viewer's role without having to compute it.
 *
 * On an HTTP transport these poll eth_getLogs, so expect a few seconds of lag.
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

  // onLogs sits in the watcher's dependency array, so an inline arrow would
  // resubscribe on every render
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

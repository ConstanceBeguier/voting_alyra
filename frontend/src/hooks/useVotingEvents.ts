'use client'
import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWatchContractEvent } from 'wagmi'
import { votingAbi } from '@/contracts/voting'

/**
 * Keep the screen in step with the chain, whoever caused the change.
 *
 * Watches the three events the screen depends on. useVotingWrite only refreshes
 * after transactions *this* tab sent, so a voter would not see the blank vote
 * appear when the owner opens the proposal phase, nor a proposal submitted by
 * someone else.
 *
 * On an HTTP transport this polls eth_getLogs, so expect a few seconds of lag.
 */
export function useVotingEvents(
  votingAddress: `0x${string}` | undefined,
  /** the page owns the workflow status read, so it hands back its refetch */
  onStatusChange: () => void,
) {
  const queryClient = useQueryClient()
  const enabled = Boolean(votingAddress)

  // onLogs sits in the watcher's dependency array, so an inline arrow would
  // resubscribe on every render
  const onVoterRegistered = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['voters'] })
  }, [queryClient])

  const onProposalRegistered = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['proposals'] })
  }, [queryClient])

  useWatchContractEvent({
    address: votingAddress,
    abi: votingAbi,
    eventName: 'WorkflowStatusChange',
    enabled,
    onLogs: onStatusChange,
  })

  useWatchContractEvent({
    address: votingAddress,
    abi: votingAbi,
    eventName: 'VoterRegistered',
    enabled,
    onLogs: onVoterRegistered,
  })

  useWatchContractEvent({
    address: votingAddress,
    abi: votingAbi,
    eventName: 'ProposalRegistered',
    enabled,
    onLogs: onProposalRegistered,
  })
}

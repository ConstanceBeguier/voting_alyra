'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { getVotingAddress } from '@/contracts/voting'

/**
 * Shared plumbing for every write on the Voting contract: a `busy` flag while
 * the transaction is in flight, and a cache invalidation once it is mined —
 * reads never refresh on their own, and forgetting it leaves a stale screen.
 *
 * `writeContract` is handed back untouched so callers keep the argument types
 * the ABI guarantees; wrapping it would widen functionName back to `string`.
 */
export function useVotingWrite() {
  const { chainId } = useAccount()
  const votingAddress = getVotingAddress(chainId)
  const queryClient = useQueryClient()

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) queryClient.invalidateQueries()
  }, [isSuccess, queryClient])

  return { votingAddress, busy: isPending || isConfirming, writeContract }
}

'use client'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'

export function VoteButton({ proposalId }: { proposalId: bigint }) {
  const { chainId } = useAccount()
  const votingAddress = getVotingAddress(chainId)
  const queryClient = useQueryClient()

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // the vote changes both the voter state and the proposal counts
  useEffect(() => {
    if (isSuccess) queryClient.invalidateQueries()
  }, [isSuccess, queryClient])

  if (!votingAddress) return null

  const busy = isPending || isConfirming

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={busy}
      onClick={() =>
        writeContract({
          address: votingAddress,
          abi: votingAbi,
          functionName: 'setVote',
          args: [proposalId],
        })
      }
    >
      {busy ? <Loader2 className="animate-spin" /> : <Check />}
      {busy ? 'Confirming…' : 'Vote'}
    </Button>
  )
}

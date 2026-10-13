'use client'
import { votingAbi } from '@/contracts/voting'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'

export function VoteButton({ proposalId }: { proposalId: bigint }) {
  const { votingAddress, busy, writeContract, tx } = useVotingWrite()

  if (!votingAddress) return null

  return (
    <div className="flex flex-col items-start gap-2">
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
      <TransactionAlert tx={tx} />
    </div>
  )
}

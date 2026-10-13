'use client'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'

export function VoteButton({ proposalId }: { proposalId: bigint }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()

  if (!votingAddress) return null

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() =>
          write('setVote', [proposalId])
        }
      >
        {busy ? <Loader2 className="animate-spin" /> : <Check />}
        {busy ? 'Confirming…' : 'Vote'}
      </Button>
      <TransactionAlert tx={tx} />
    </div>
  )
}

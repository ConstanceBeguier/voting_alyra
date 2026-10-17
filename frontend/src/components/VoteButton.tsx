'use client'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { Loader2, Vote } from 'lucide-react'

export function VoteButton({ proposalId }: { proposalId: bigint }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()

  if (!votingAddress) return null

  return (
    <>
      <Button
        size="sm"
        variant="brand"
        disabled={busy}
        onClick={() =>
          write('setVote', [proposalId], `Your vote for proposal #${proposalId} has been recorded.`)
        }
      >
        {busy ? <Loader2 className="animate-spin" /> : <Vote />}
        {busy ? 'Confirming…' : 'Vote'}
      </Button>
      {/* full width, so a message wraps under the card instead of squeezing it */}
      <div className="basis-full empty:hidden">
        <TransactionAlert tx={tx} />
      </div>
    </>
  )
}

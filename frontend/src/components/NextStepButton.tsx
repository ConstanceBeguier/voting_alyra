'use client'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'

const NEXT_STEP = [
  { fn: 'startProposalsRegistering', label: 'Start proposals registration' },
  { fn: 'endProposalsRegistering', label: 'End proposals registration' },
  { fn: 'startVotingSession', label: 'Start voting session' },
  { fn: 'endVotingSession', label: 'End voting session' },
  { fn: 'tallyVotes', label: 'Tally votes' },
] as const

export function NextStepButton({ status }: { status: number | undefined }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()

  // the owner check lives in <Owner />
  if (!votingAddress || status === undefined) return null

  const step = NEXT_STEP[status]
  if (!step) return null

  return (
    <div className="flex flex-col items-start gap-2">
      {/* tallyVotes closes the vote for good, so it gets a warning colour */}
      <Button
        size="lg"
        variant={step.fn === 'tallyVotes' ? 'destructive' : 'default'}
        disabled={busy}
        onClick={() =>
          write(step.fn)
        }
      >
        {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        {busy ? 'Confirming…' : step.label}
      </Button>
      <TransactionAlert tx={tx} />
    </div>
  )
}

'use client'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'

const NEXT_STEP = [
  {
    fn: 'startProposalsRegistering',
    label: 'Start proposals registration',
    done: 'Proposals registration is now open.',
  },
  {
    fn: 'endProposalsRegistering',
    label: 'End proposals registration',
    done: 'Proposals registration is closed.',
  },
  {
    fn: 'startVotingSession',
    label: 'Start voting session',
    done: 'The voting session is now open.',
  },
  {
    fn: 'endVotingSession',
    label: 'End voting session',
    done: 'The voting session is closed.',
  },
  { fn: 'tallyVotes', label: 'Tally votes', done: 'Votes have been tallied.' },
] as const

export function NextStepButton({ status }: { status: number | undefined }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()

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
          write(step.fn, [], step.done)
        }
      >
        {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}
        {busy ? 'Confirming…' : step.label}
      </Button>
      <TransactionAlert tx={tx} />
    </div>
  )
}

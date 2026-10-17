'use client'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { ArrowRight, CircleCheck, Loader2, Trophy } from 'lucide-react'

// indexed by the current status: the transition out of it
const NEXT_STEP = [
  {
    fn: 'startProposalsRegistering',
    label: 'Open proposals',
    hint: 'Registered voters will be able to submit their ideas.',
    done: 'Proposals registration is now open.',
  },
  {
    fn: 'endProposalsRegistering',
    label: 'Close proposals',
    hint: 'No new proposal can be added after this.',
    done: 'Proposals registration is closed.',
  },
  {
    fn: 'startVotingSession',
    label: 'Open the polls',
    hint: 'Voters can cast their ballot — one each.',
    done: 'The voting session is now open.',
  },
  {
    fn: 'endVotingSession',
    label: 'Close the polls',
    hint: 'Ballots close. No more votes will be accepted.',
    done: 'The voting session is closed.',
  },
  {
    fn: 'tallyVotes',
    label: 'Reveal the winner',
    hint: 'Counts the votes and publishes the result. This is final.',
    done: 'Votes have been tallied.',
  },
] as const

export function NextStepButton({ status }: { status: number | undefined }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()

  if (!votingAddress || status === undefined) return null

  const step = NEXT_STEP[status]
  if (!step) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] p-5 motion-safe:animate-rise">
        <CircleCheck className="size-5 shrink-0 text-emerald-400" />
        <p className="text-sm">
          <span className="font-medium">All done.</span>{' '}
          <span className="text-muted-foreground">The result is published and can no longer change.</span>
        </p>
      </div>
    )
  }

  const isFinal = step.fn === 'tallyVotes'

  return (
    <div className="rounded-xl border border-admin/20 bg-admin/[0.06] p-5">
      <p className="text-xs font-medium tracking-[0.09em] text-admin uppercase">Next step</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-sm text-sm text-muted-foreground">{step.hint}</p>
        <Button size="lg" variant="brand" className="h-11 px-5" disabled={busy} onClick={() => write(step.fn, [], step.done)}>
          {busy ? <Loader2 className="animate-spin" /> : isFinal && <Trophy />}
          {busy ? 'Confirming…' : step.label}
          {!busy && !isFinal && <ArrowRight className="transition-transform group-hover/button:translate-x-0.5" />}
        </Button>
      </div>
      <div className="mt-3 empty:hidden">
        <TransactionAlert tx={tx} />
      </div>
    </div>
  )
}

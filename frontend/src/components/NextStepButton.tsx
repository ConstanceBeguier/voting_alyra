'use client'
import { votingAbi } from '@/contracts/voting'
import { useVotingWrite } from '@/hooks/useVotingWrite'
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
  const { votingAddress, busy, writeContract } = useVotingWrite()

  // the owner check lives in <Owner />
  if (!votingAddress || status === undefined) return null

  const step = NEXT_STEP[status]
  if (!step) return null

  return (
    // tallyVotes closes the vote for good, so it gets a warning colour
    <Button
      size="lg"
      variant={step.fn === 'tallyVotes' ? 'destructive' : 'default'}
      disabled={busy}
      onClick={() =>
        writeContract({ address: votingAddress, abi: votingAbi, functionName: step.fn })
      }
    >
      {busy ? <Loader2 className="animate-spin" /> : <ArrowRight />}
      {busy ? 'Confirming…' : step.label}
    </Button>
  )
}

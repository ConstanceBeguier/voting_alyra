'use client'
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { isAddressEqual } from 'viem'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
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
  const { address, chainId } = useAccount()
  const votingAddress = getVotingAddress(chainId)

  const { data: owner } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'owner',
  })

  const { data: hash, writeContract, isPending } = useWriteContract()
  // only used to keep the button disabled until the transaction is mined;
  // the page refreshes the phase by watching WorkflowStatusChange
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  if (!votingAddress || !address || !owner || !isAddressEqual(owner, address)) {
    return null
  }
  if (status === undefined) return null

  const step = NEXT_STEP[status]
  if (!step) return null

  const busy = isPending || isConfirming

  return (
    // tallyVotes closes the vote for good, so it gets a warning colour
    <Button
      size="lg"
      variant={step.fn === 'tallyVotes' ? 'destructive' : 'default'}
      className="h-11 gap-2 px-6 text-base shadow-sm"
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

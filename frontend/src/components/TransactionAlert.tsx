'use client'
import { BaseError } from 'viem'
import { revertedError } from '@/lib/revert'
import type { TxState } from '@/hooks/useVotingWrite'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { CircleAlert, CircleCheck, Loader2 } from 'lucide-react'

const REASONS: Record<string, string> = {
  AlreadyRegistered: 'This address is already a registered voter.',
  NotAVoter: 'This account is not a registered voter.',
  AlreadyVoted: 'You have already voted.',
  EmptyProposal: 'The proposal cannot be empty.',
  ProposalNotFound: 'This proposal does not exist.',
  WrongStatus: 'The contract is not in the right phase for this action.',
  OwnableUnauthorizedAccount: 'Only the contract owner can do this.',
}

function describe(error: Error) {
  if (!(error instanceof BaseError)) return error.message

  const name = revertedError(error)?.data?.errorName
  if (name) return REASONS[name] ?? name

  // otherwise the one readable line, e.g. "User rejected the request."
  return error.shortMessage
}

export function TransactionAlert({ tx }: { tx: TxState }) {
  if (tx.error) {
    return (
      <Alert variant="destructive" className="border-destructive/30 bg-destructive/[0.07] motion-safe:animate-rise">
        <CircleAlert />
        <AlertTitle>That didn&rsquo;t go through</AlertTitle>
        <AlertDescription>{describe(tx.error)}</AlertDescription>
      </Alert>
    )
  }

  if (tx.isPending || tx.isConfirming) {
    return (
      <Alert className="relative overflow-hidden border-brand/25 bg-brand/[0.06] motion-safe:animate-rise">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-transparent via-white/[0.06] to-transparent motion-safe:animate-shimmer" />
        <Loader2 className="animate-spin text-brand" />
        <AlertTitle>{tx.isPending ? 'Waiting for your signature' : 'Writing it on-chain…'}</AlertTitle>
        <AlertDescription>
          {tx.isPending ? 'Confirm the transaction in your wallet.' : 'This usually takes a few seconds.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (tx.isSuccess) {
    return (
      <Alert className="border-emerald-400/30 bg-emerald-400/[0.07] motion-safe:animate-rise">
        <CircleCheck className="text-emerald-400 motion-safe:animate-pop" />
        <AlertTitle>Done!</AlertTitle>
        {tx.success && <AlertDescription>{tx.success}</AlertDescription>}
      </Alert>
    )
  }

  return null
}

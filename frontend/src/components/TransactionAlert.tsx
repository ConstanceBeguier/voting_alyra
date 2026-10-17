'use client'
import { BaseError, ContractFunctionRevertedError } from 'viem'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { CircleAlert, CircleCheck, Loader2 } from 'lucide-react'

export type TxState = {
  isPending: boolean
  isConfirming: boolean
  isSuccess: boolean
  error: Error | null
  success?: string
}

// the contract's custom errors, in plain words
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

  // a reverted call carries the decoded custom error somewhere in its causes
  const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError)
  if (reverted instanceof ContractFunctionRevertedError) {
    const name = reverted.data?.errorName
    if (name) return REASONS[name] ?? name
  }

  // otherwise the one readable line, e.g. "User rejected the request."
  return error.shortMessage
}

export function TransactionAlert({ tx }: { tx: TxState }) {
  if (tx.error) {
    const message = describe(tx.error)

    return (
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>Transaction failed</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  if (tx.isPending || tx.isConfirming) {
    return (
      <Alert>
        <Loader2 className="animate-spin" />
        <AlertTitle>
          {tx.isPending ? 'Waiting for your signature' : 'Transaction in progress'}
        </AlertTitle>
        <AlertDescription>
          {tx.isPending
            ? 'Confirm the transaction in your wallet.'
            : 'Waiting for the transaction to be mined.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (tx.isSuccess) {
    return (
      <Alert>
        <CircleCheck />
        <AlertTitle>Transaction confirmed</AlertTitle>
        {tx.success && <AlertDescription>{tx.success}</AlertDescription>}
      </Alert>
    )
  }

  return null
}

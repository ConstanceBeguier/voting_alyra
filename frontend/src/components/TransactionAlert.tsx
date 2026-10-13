'use client'
import { BaseError } from 'viem'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { CircleAlert, CircleCheck, Loader2 } from 'lucide-react'

export type TxState = {
  isPending: boolean
  isConfirming: boolean
  isSuccess: boolean
  error: Error | null
}

export function TransactionAlert({ tx }: { tx: TxState }) {
  if (tx.error) {
    // wagmi errors carry a full stack of causes; shortMessage is the one line
    // worth showing ("User rejected the request", the revert reason, …)
    const message =
      tx.error instanceof BaseError ? tx.error.shortMessage : tx.error.message

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
      </Alert>
    )
  }

  return null
}

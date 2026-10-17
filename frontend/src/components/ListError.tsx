'use client'
import { BaseError } from 'viem'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { CircleAlert } from 'lucide-react'

/**
 * A failed query leaves `data` undefined, which reads exactly like an empty
 * list — so a broken RPC would silently claim there is nothing to show.
 */
export function ListError({ what, error }: { what: string; error: Error }) {
  const message = error instanceof BaseError ? error.shortMessage : error.message

  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>Could not load the {what}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

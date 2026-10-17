'use client'
import { useState } from 'react'
import { isAddress } from 'viem'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { WorkflowStatus } from '@/lib/workflow'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, UserPlus } from 'lucide-react'

export function AddVoter({ status }: { status: number | undefined }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()
  const [value, setValue] = useState('')

  if (status !== WorkflowStatus.RegisteringVoters || !votingAddress) return null

  // checked here so a malformed address never costs a reverted transaction
  const valid = isAddress(value)

  return (
    <div className="flex w-full flex-col gap-2">
      <h3 className="eyebrow">Register a voter</h3>
      <form
        className="flex w-full items-center gap-2"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!valid) return
          // keep what was typed if the simulation rejected it
          if (await write('addVoter', [value], `The voter ${value} is registered.`)) setValue('')
        }}
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0x…"
          aria-label="Voter address"
          aria-invalid={value !== '' && !valid}
          disabled={busy}
          className="h-11 border-white/10 bg-white/[0.03] px-3.5"
        />
        <Button type="submit" variant="brand" size="lg" className="h-11 px-5" disabled={!valid || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {busy ? 'Confirming…' : 'Add voter'}
        </Button>
      </form>
      <TransactionAlert tx={tx} />
    </div>
  )
}

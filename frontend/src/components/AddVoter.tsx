'use client'
import { useState } from 'react'
import { isAddress } from 'viem'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, UserPlus } from 'lucide-react'

const REGISTERING_VOTERS = 0

export function AddVoter({ status }: { status: number | undefined }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()
  const [value, setValue] = useState('')

  // voters can only be registered during the first phase
  if (status !== REGISTERING_VOTERS || !votingAddress) return null

  // checked here so a malformed address never costs a reverted transaction
  const valid = isAddress(value)

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <form
        className="flex w-full max-w-md items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid) return
          write('addVoter', [value])
          setValue('')
        }}
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0x…"
          aria-label="Voter address"
          aria-invalid={value !== '' && !valid}
          disabled={busy}
        />
        <Button type="submit" disabled={!valid || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {busy ? 'Confirming…' : 'Add voter'}
        </Button>
      </form>
      <TransactionAlert tx={tx} />
    </div>
  )
}

'use client'
import { useState } from 'react'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus } from 'lucide-react'

const PROPOSALS_REGISTRATION_STARTED = 1

export function AddProposal({ status }: { status: number | undefined }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()
  const [description, setDescription] = useState('')

  // proposals are only accepted during that one phase
  if (status !== PROPOSALS_REGISTRATION_STARTED || !votingAddress) return null

  // the contract rejects an empty description, so do not pay for a revert
  const valid = description.trim().length > 0

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <form
        className="flex w-full max-w-md items-center gap-2"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!valid) return
          // keep what was typed if the simulation rejected it
          if (await write('addProposal', [description.trim()], `Your proposal "${description.trim()}" has been added.`)) setDescription('')
        }}
      >
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe your proposal"
          aria-label="Proposal description"
          disabled={busy}
        />
        <Button type="submit" disabled={!valid || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Plus />}
          {busy ? 'Confirming…' : 'Add proposal'}
        </Button>
      </form>
      <TransactionAlert tx={tx} />
    </div>
  )
}

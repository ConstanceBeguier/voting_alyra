'use client'
import { useState } from 'react'
import { useVotingWrite } from '@/hooks/useVotingWrite'
import { WorkflowStatus } from '@/lib/workflow'
import { TransactionAlert } from '@/components/TransactionAlert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus } from 'lucide-react'

export function AddProposal({ status }: { status: number | undefined }) {
  const { votingAddress, busy, write, tx } = useVotingWrite()
  const [description, setDescription] = useState('')

  if (status !== WorkflowStatus.ProposalsRegistrationStarted || !votingAddress) return null

  // the contract rejects an empty description, so do not pay for a revert
  const valid = description.trim().length > 0

  return (
    <div className="flex w-full flex-col gap-2">
      <h3 className="eyebrow">Submit a proposal</h3>
      <form
        className="flex w-full items-center gap-2"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!valid) return
          if (await write('addProposal', [description.trim()], `Your proposal "${description.trim()}" has been added.`)) setDescription('')
        }}
      >
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe your proposal"
          aria-label="Proposal description"
          disabled={busy}
          className="h-11 border-white/10 bg-white/[0.03] px-3.5"
        />
        <Button type="submit" variant="brand" size="lg" className="h-11 px-5" disabled={!valid || busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Plus />}
          {busy ? 'Confirming…' : 'Add proposal'}
        </Button>
      </form>
      <TransactionAlert tx={tx} />
    </div>
  )
}

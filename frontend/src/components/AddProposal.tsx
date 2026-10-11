'use client'
import { useState } from 'react'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus } from 'lucide-react'

const PROPOSALS_REGISTRATION_STARTED = 1

export function AddProposal({ status }: { status: number | undefined }) {
  const { chainId } = useAccount()
  const votingAddress = getVotingAddress(chainId)
  const [description, setDescription] = useState('')

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  // proposals are only accepted during that one phase
  if (status !== PROPOSALS_REGISTRATION_STARTED || !votingAddress) return null

  const busy = isPending || isConfirming
  // the contract rejects an empty description, so do not pay for a revert
  const valid = description.trim().length > 0

  return (
    <form
      className="flex w-full max-w-md items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!valid) return
        writeContract({
          address: votingAddress,
          abi: votingAbi,
          functionName: 'addProposal',
          args: [description.trim()],
        })
        setDescription('')
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
  )
}

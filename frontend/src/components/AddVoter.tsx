'use client'
import { useState } from 'react'
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { isAddress } from 'viem'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, UserPlus } from 'lucide-react'

const REGISTERING_VOTERS = 0

export function AddVoter({ status }: { status: number | undefined }) {
  const { chainId } = useAccount()
  const votingAddress = getVotingAddress(chainId)
  const [value, setValue] = useState('')

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })

  // voters can only be registered during the first phase
  if (status !== REGISTERING_VOTERS || !votingAddress) return null

  const busy = isPending || isConfirming
  // checked here so a malformed address never costs a reverted transaction
  const valid = isAddress(value)

  return (
    <form
      className="flex w-full max-w-md items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        if (!valid) return
        writeContract({
          address: votingAddress,
          abi: votingAbi,
          functionName: 'addVoter',
          args: [value],
        })
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
  )
}

'use client'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { isAddressEqual } from 'viem'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { NextStepButton } from '@/components/NextStepButton'
import { AddVoter } from '@/components/AddVoter'
import { VoterList } from '@/components/VoterList'
import { RolePanel } from '@/components/RolePanel'
import { ShieldCheck } from 'lucide-react'

/** Everything only the contract owner may see. Renders nothing for anyone else. */
export function Owner({ status }: { status: number | undefined }) {
  const { address } = useAccount()
  const chainId = useChainId()

  const { data: owner } = useReadContract({
    address: getVotingAddress(chainId),
    abi: votingAbi,
    functionName: 'owner',
  })

  if (!address || !owner || !isAddressEqual(owner, address)) return null

  return (
    <RolePanel
      accent="admin"
      icon={<ShieldCheck className="size-5.5" />}
      title="Administration"
      subtitle="You run this vote: register voters and move it forward."
      badge="Contract owner"
    >
      <NextStepButton status={status} />
      <AddVoter status={status} />
      <VoterList />
    </RolePanel>
  )
}

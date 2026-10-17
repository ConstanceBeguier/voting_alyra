'use client'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { isAddressEqual } from 'viem'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { NextStepButton } from '@/components/NextStepButton'
import { AddVoter } from '@/components/AddVoter'
import { VoterList } from '@/components/VoterList'

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
    <section className="flex flex-col items-start gap-3">
      <h2 className="text-lg font-semibold">Admin</h2>
      <AddVoter status={status} />
      <VoterList />
      <NextStepButton status={status} />
    </section>
  )
}

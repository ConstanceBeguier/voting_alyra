'use client';
import { useAccount, useReadContract } from 'wagmi'
import { isAddressEqual } from 'viem'
import { votingAbi, getVotingAddress } from '@/contracts/voting'

export default function Home() {
  const { address, chainId } = useAccount();
  const votingAddress = getVotingAddress(chainId);

  const { data: owner } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'owner',
  });

  return (
    <div>
      {address && owner && (
        <p>
          {isAddressEqual(owner, address)
            ? 'You are the owner of the contract'
            : `You are not the owner (owner is ${owner})`}
        </p>
      )}
    </div>
  );
}

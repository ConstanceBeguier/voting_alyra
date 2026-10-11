'use client';
import { useCallback } from 'react'
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi'
import { isAddressEqual } from 'viem'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { WorkflowStatus } from '@/components/WorkflowStatus'
import { NextStepButton } from '@/components/NextStepButton'
import { Winner } from '@/components/Winner'

export default function Home() {
  const { address, chainId } = useAccount();
  const votingAddress = getVotingAddress(chainId);

  const { data: owner } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'owner',
  });

  const { data: status, refetch: refetchStatus } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'workflowStatus',
  });

  const onStatusChanged = useCallback(() => {
    refetchStatus();
  }, [refetchStatus]);

  useWatchContractEvent({
    address: votingAddress,
    abi: votingAbi,
    eventName: 'WorkflowStatusChange',
    enabled: Boolean(votingAddress),
    onLogs: onStatusChanged,
  });

  return (
    <div>
      <WorkflowStatus status={status} />
      <NextStepButton status={status} />
      <Winner status={status} />
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

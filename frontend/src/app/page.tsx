'use client';
import { useCallback } from 'react'
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { WorkflowStatus } from '@/components/WorkflowStatus'
import { Owner } from '@/components/Owner'
import { Winner } from '@/components/Winner'

export default function Home() {
  const { chainId } = useAccount();
  const votingAddress = getVotingAddress(chainId);

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
      <Winner status={status} />
      <Owner status={status} />
    </div>
  );
}

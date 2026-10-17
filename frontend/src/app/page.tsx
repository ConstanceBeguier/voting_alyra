'use client';
import { useCallback } from 'react'
import { useChainId, useReadContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { useVotingEvents } from '@/hooks/useVotingEvents'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { WorkflowStatus } from '@/components/WorkflowStatus'
import { Owner } from '@/components/Owner'
import { Voter } from '@/components/Voter'
import { Winner } from '@/components/Winner'

export default function Home() {
  // useChainId, not useAccount: it resolves to the configured chain even
  // without a wallet, so the public parts stay readable for a visitor
  const chainId = useChainId();
  const votingAddress = getVotingAddress(chainId);

  const { data: status, refetch: refetchStatus } = useReadContract({
    address: votingAddress,
    abi: votingAbi,
    functionName: 'workflowStatus',
  });

  const onStatusChanged = useCallback(() => {
    refetchStatus();
  }, [refetchStatus]);

  // every on-chain change the screen depends on, whoever triggered it
  useVotingEvents(votingAddress, onStatusChanged);

  return (
    <div className="flex flex-col items-start gap-3">
      <ConnectPrompt />
      <WorkflowStatus status={status} />
      <Winner status={status} />
      <Owner status={status} />
      <Voter status={status} />
    </div>
  );
}

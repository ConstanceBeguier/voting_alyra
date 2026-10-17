'use client';
import { useCallback } from 'react'
import { useChainId, useReadContract } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { useWatchWorkflowStatus } from '@/hooks/useVotingEvents'
import { Hero } from '@/components/Hero'
import { ConnectPrompt } from '@/components/ConnectPrompt'
import { PhaseStepper } from '@/components/PhaseStepper'
import { Owner } from '@/components/Owner'
import { Voter } from '@/components/Voter'
import { Winner } from '@/components/Winner'

export default function Home() {
  // useChainId, not useAccount: resolves even without a wallet
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

  // the phase is public, so this one runs for every visitor
  useWatchWorkflowStatus(votingAddress, onStatusChanged);

  return (
    <div className="flex flex-col gap-8">
      <Hero />
      <ConnectPrompt />
      <Winner status={status} />
      <PhaseStepper status={status} />
      <Owner status={status} />
      <Voter status={status} />
    </div>
  );
}

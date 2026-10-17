'use client'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import type { ContractFunctionArgs, ContractFunctionName } from 'viem'
import { votingAbi, getVotingAddress } from '@/contracts/voting'

type Mutability = 'nonpayable' | 'payable'
type VotingFunction = ContractFunctionName<typeof votingAbi, Mutability>
type VotingArgs<F extends VotingFunction> = ContractFunctionArgs<
  typeof votingAbi,
  Mutability,
  F
>

/**
 * Shared plumbing for every write on the Voting contract: a `busy` flag while
 * the transaction is in flight, a cache invalidation once it is mined — reads
 * never refresh on their own — and the transaction state the alert needs.
 */
export function useVotingWrite() {
  const { address, chainId } = useAccount()
  const votingAddress = getVotingAddress(chainId)
  const client = usePublicClient()
  const queryClient = useQueryClient()
  const [simulationError, setSimulationError] = useState<Error | null>(null)
  const [success, setSuccess] = useState<string>()

  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract()
  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) queryClient.invalidateQueries()
  }, [isSuccess, queryClient])

  /**
   * Simulate before sending. A write that would revert is otherwise rejected
   * for an unrelated gas reason, hiding the contract's own error; an eth_call
   * carries it back intact and decodable.
   */
  async function write<F extends VotingFunction>(
    functionName: F,
    args: VotingArgs<F>,
    /** shown once the transaction is mined; passed in rather than built at
     *  render time, since the caller's inputs are cleared on submit */
    successMessage?: string,
  ) {
    // clear the previous transaction first: isSuccess and the receipt still
    // describe it until writeContract produces a new hash, so anything shown
    // before that point would be about the wrong transaction
    reset()
    setSimulationError(null)
    setSuccess(undefined)
    if (!client || !address || !votingAddress) return

    const params = {
      address: votingAddress,
      abi: votingAbi,
      functionName,
      args,
    } as const

    try {
      await client.simulateContract({ ...params, account: address } as never)
    } catch (error) {
      setSimulationError(error as Error)
      return
    }
    // only now is the message about a transaction that is actually being sent
    setSuccess(successMessage)
    writeContract(params as never)
  }

  return {
    votingAddress,
    busy: isPending || isConfirming,
    write,
    tx: {
      isPending,
      isConfirming,
      isSuccess,
      error: simulationError ?? writeError ?? receiptError,
      success,
    },
  }
}

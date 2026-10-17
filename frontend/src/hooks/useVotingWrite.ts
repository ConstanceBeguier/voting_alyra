'use client'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import type { ContractFunctionArgs, ContractFunctionName } from 'viem'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { celebrate } from '@/lib/celebrate'

type Mutability = 'nonpayable' | 'payable'
type VotingFunction = ContractFunctionName<typeof votingAbi, Mutability>
type VotingArgs<F extends VotingFunction> = ContractFunctionArgs<
  typeof votingAbi,
  Mutability,
  F
>

/** Every write on the Voting contract: state, simulation, cache invalidation. */
export function useVotingWrite() {
  const { address } = useAccount()
  const chainId = useChainId()
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
    if (!isSuccess) return
    queryClient.invalidateQueries()
    celebrate()
  }, [isSuccess, queryClient])

  /**
   * Simulates first: sending straight away loses the revert reason behind an
   * unrelated gas error. Returns whether the transaction reached the wallet.
   */
  async function write<F extends VotingFunction>(
    functionName: F,
    args: VotingArgs<F>,
    /** passed in, not built at render time: forms clear their input */
    successMessage?: string,
  ) {
    // isSuccess still describes the previous transaction until a new hash
    reset()
    setSimulationError(null)
    setSuccess(undefined)
    if (!client || !address || !votingAddress) return false

    const params = {
      address: votingAddress,
      abi: votingAbi,
      functionName,
      args,
    } as const

    try {
      // `as never`: viem needs a literal functionName, ours is generic. Call
      // sites stay checked by write's own signature.
      await client.simulateContract({ ...params, account: address } as never)
    } catch (error) {
      setSimulationError(error as Error)
      return false
    }
    setSuccess(successMessage)
    writeContract(params as never) // same reason as the cast above
    return true
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

/** Derived, so it cannot drift from the hook. */
export type TxState = ReturnType<typeof useVotingWrite>['tx']

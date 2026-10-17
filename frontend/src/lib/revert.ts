import { BaseError, ContractFunctionRevertedError } from 'viem'

/** Did the contract reject the call, rather than the request failing to reach it? */
export function revertedError(error: Error) {
  if (!(error instanceof BaseError)) return undefined

  const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError)
  return reverted instanceof ContractFunctionRevertedError ? reverted : undefined
}

/** A revert is an answer, not an incident: only retry network failures. */
export function retryUnlessReverted(failureCount: number, error: Error) {
  return !revertedError(error) && failureCount < 3
}

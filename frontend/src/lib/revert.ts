import { BaseError, ContractFunctionRevertedError } from 'viem'

/**
 * Did the contract itself reject the call, as opposed to the request failing
 * on its way there? A revert is deterministic — retrying cannot change it.
 */
export function revertedError(error: Error) {
  if (!(error instanceof BaseError)) return undefined

  const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError)
  return reverted instanceof ContractFunctionRevertedError ? reverted : undefined
}

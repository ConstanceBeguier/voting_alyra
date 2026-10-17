import { BaseError, ContractFunctionRevertedError } from 'viem'

/** Did the contract reject the call, rather than the request failing to reach it? */
export function revertedError(error: Error) {
  if (!(error instanceof BaseError)) return undefined

  const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError)
  return reverted instanceof ContractFunctionRevertedError ? reverted : undefined
}

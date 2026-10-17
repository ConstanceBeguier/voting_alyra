import { hardhat, sepolia } from '@reown/appkit/networks'

/** An unset NEXT_PUBLIC_* var reaches us as "", not undefined. */
function address(value: string | undefined) {
  return value ? (value as `0x${string}`) : undefined
}

/**
 * Deployed Voting contract per chain; undefined where it is not deployed.
 * Addresses come from backend/ignition/deployments/chain-<id>/.
 */
export const votingAddress: Record<number, `0x${string}` | undefined> = {
  [sepolia.id]: address(process.env.NEXT_PUBLIC_VOTING_ADDRESS_SEPOLIA),
  [hardhat.id]: address(process.env.NEXT_PUBLIC_VOTING_ADDRESS_LOCAL),
}

/** Address for the chain the wallet is on, or undefined if unsupported. */
export function getVotingAddress(chainId: number | undefined) {
  return chainId === undefined ? undefined : votingAddress[chainId]
}

// the ABI lives in its own file: it is generated, and 350 lines of it would
// bury the twenty hand-written ones above
export { votingAbi } from './voting.abi'

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

export function getVotingAddress(chainId: number | undefined) {
  return chainId === undefined ? undefined : votingAddress[chainId]
}

export { votingAbi } from './voting.abi'

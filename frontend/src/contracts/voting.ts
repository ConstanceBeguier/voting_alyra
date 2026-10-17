import { hardhat, sepolia } from '@reown/appkit/networks'

/** An unset NEXT_PUBLIC_* var reaches us as "", not undefined. */
function address(value: string | undefined) {
  return value ? (value as `0x${string}`) : undefined
}

function block(value: string | undefined) {
  return value ? BigInt(value) : undefined
}

/**
 * Deployed Voting contract per chain; undefined where it is not deployed.
 * Addresses come from backend/ignition/deployments/chain-<id>/.
 */
const votingAddress: Record<number, `0x${string}` | undefined> = {
  [sepolia.id]: address(process.env.NEXT_PUBLIC_VOTING_ADDRESS_SEPOLIA),
  [hardhat.id]: address(process.env.NEXT_PUBLIC_VOTING_ADDRESS_LOCAL),
}

export function getVotingAddress(chainId: number | undefined) {
  return chainId === undefined ? undefined : votingAddress[chainId]
}

/**
 * Block the contract was deployed in, per chain. Scanning logs from genesis
 * works locally but public RPCs cap the range of eth_getLogs.
 */
const deployBlock: Record<number, bigint | undefined> = {
  [sepolia.id]: block(process.env.NEXT_PUBLIC_VOTING_DEPLOY_BLOCK_SEPOLIA),
  [hardhat.id]: block(process.env.NEXT_PUBLIC_VOTING_DEPLOY_BLOCK_LOCAL),
}

export function getVotingDeployBlock(chainId: number | undefined) {
  return (chainId === undefined ? undefined : deployBlock[chainId]) ?? 0n
}

export { votingAbi } from './voting.abi'

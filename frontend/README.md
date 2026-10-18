# Voting — frontend

The web app for the [Voting contract](../README.md): the owner registers voters and moves the
workflow forward, registered voters submit proposals and vote, and everyone sees the current
phase and the winner.

Live at <https://voting-alyra.vercel.app/>, on Sepolia.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- [wagmi](https://wagmi.sh) 2 and [viem](https://viem.sh) 2 for contract reads, writes and events
- [Reown AppKit](https://docs.reown.com/appkit/overview) for wallet connection
- [TanStack Query](https://tanstack.com/query) for caching
- [Tailwind CSS](https://tailwindcss.com) 4 and [shadcn/ui](https://ui.shadcn.com) components

## Getting started

```shell
npm install
cp .env.example .env.local   # then fill it in, see below
npm run dev
```

Open <http://localhost:3000>.

| Script | |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Configuration

`.env.local`:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_PROJECT_ID` | A Reown project id, from <https://dashboard.reown.com> |
| `NEXT_PUBLIC_APP_URL` | The origin the app is served from, as shown to wallets |
| `NEXT_PUBLIC_DEFAULT_CHAIN_ID` | Chain shown before a wallet connects: `31337` locally, `11155111` for Sepolia |
| `NEXT_PUBLIC_VOTING_ADDRESS_LOCAL` / `_SEPOLIA` | From `backend/ignition/deployments/chain-<id>/deployed_addresses.json` |
| `NEXT_PUBLIC_VOTING_DEPLOY_BLOCK_LOCAL` / `_SEPOLIA` | `receipt.blockNumber` in the same folder's `journal.jsonl` |

`NEXT_PUBLIC_*` variables are inlined at build time: restart `npm run dev`, or redeploy, after
changing them.

The deploy block is where event scans start. Public RPCs cap the range of `eth_getLogs`, so
scanning Sepolia from block 0 fails.

To run against a local Hardhat node instead of Sepolia, see the
[root README](../README.md#run-everything-locally).

## Project layout

```text
src/
  app/          Layout, page and global styles
  components/   UI, one file per component; ui/ holds the shadcn primitives
  config/       Supported networks and the wagmi adapter
  context/      Wagmi, TanStack Query and AppKit providers
  contracts/    Contract address and deploy block per chain, and the ABI
  hooks/        useVotingWrite (every transaction) and the event watchers
  lib/          Workflow constants, revert decoding and small helpers
```

## How it works

- **Roles.** `Owner` renders only for the contract owner and `Voter` only for a registered
  voter, so one page serves every visitor. An owner who is also a voter sees both panels.
- **Writes.** Every transaction goes through `useVotingWrite`. It simulates the call first, so a
  revert shows the contract's custom error (`AlreadyVoted`, `WrongStatus`…) instead of a gas
  estimation failure, then sends it and waits for the receipt.
- **Reads.** `getVoter` and `getOneProposal` are restricted to voters, so they are called with
  the connected account as `msg.sender`.
- **Lists.** Voters and proposals are rebuilt from the contract's events, scanned from the deploy
  block, and refreshed when a new event arrives.

## Updating the ABI

`src/contracts/voting.abi.ts` is generated from the compiled contract. After changing
`Voting.sol`:

```shell
cd ../backend && npx hardhat compile && cd ../frontend
node -e '
const abi = require("../backend/artifacts/contracts/Voting.sol/Voting.json").abi;
const header = "// Generated — do not edit.\n// Source: backend/artifacts/contracts/Voting.sol/Voting.json\n// Regenerate after changing the contract:\n//   cd backend && npx hardhat compile\n";
process.stdout.write(header + "export const votingAbi = " + JSON.stringify(abi, null, 2) + " as const;\n");
' > src/contracts/voting.abi.ts
```

## Deploying

The live site is deployed on [Vercel](https://vercel.com) with `frontend/` as the root directory.
Set the variables above in the project's environment settings, with
`NEXT_PUBLIC_APP_URL=https://voting-alyra.vercel.app`, and redeploy after any change.

## Known issue: MetaMask "Added protection"

On Sepolia, MetaMask 13.45+ may wrap transactions to an unknown contract in its "Added
protection" (enforced simulations). The wrapper uses so much gas that the call to the contract
runs out, and the transaction fails with "Execution reverted for an unknown reason". Turn
**Added protection** off on the MetaMask confirmation screen before confirming.

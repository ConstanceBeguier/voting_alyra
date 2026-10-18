# Voting

An Ethereum voting contract where an administrator (`Ownable`) registers a whitelist of voters,
who then submit proposals and vote for one of them.
The process follows a sequential 6-state workflow (`RegisteringVoters`,
`ProposalsRegistrationStarted`, `ProposalsRegistrationEnded`, `VotingSessionStarted`,
`VotingSessionEnded`, `VotesTallied`), with every transition restricted to the contract owner.
`tallyVotes()` closes the process by recording the most-voted proposal in `winningProposalID`.

## Live

| | |
| --- | --- |
| Frontend | <https://voting-alyra.vercel.app/> |
| Contract | [`0x7Bb5B64cb5F98C8d6ac40EF6251383a4ce9D57bf`](https://sepolia.etherscan.io/address/0x7Bb5B64cb5F98C8d6ac40EF6251383a4ce9D57bf#code) on Sepolia |

Connect a wallet on the Sepolia network to take part. Only the contract owner can register
voters and move the workflow forward, and only registered voters can propose and vote.

## How it works

| Phase | Owner | Registered voters |
| --- | --- | --- |
| `RegisteringVoters` | `addVoter(address)` | — |
| `ProposalsRegistrationStarted` | — | `addProposal(description)` |
| `ProposalsRegistrationEnded` | — | — |
| `VotingSessionStarted` | — | `setVote(proposalId)`, once each |
| `VotingSessionEnded` | — | — |
| `VotesTallied` | — | — |

The owner moves from one phase to the next with `startProposalsRegistering`,
`endProposalsRegistering`, `startVotingSession`, `endVotingSession` and `tallyVotes`.

- **Blank vote.** Opening proposals registers proposal `0`, the blank vote. A real proposal beats
  it on a tie, so it only wins with strictly more votes than every other proposal.
- **No tally loop.** `setVote` updates `winningProposalID` after each ballot, so `tallyVotes`
  is constant-cost whatever the number of proposals. Between two real proposals on a tie, the
  first to reach the score keeps the lead.
- **Voters only.** `getVoter` and `getOneProposal` are restricted to registered voters.
  Phase changes, registrations and votes are all public events.

## Repository layout

```text
backend/    Hardhat 3 project: Voting.sol, Mocha tests, Ignition deployment module
frontend/   Next.js app: wagmi + viem, Reown AppKit for wallets, Tailwind and shadcn/ui
```

See [`backend/README.md`](backend/README.md) for the test suite and its coverage.

## Getting started

Requires Node.js 22 or later.

### Run everything locally

```shell
# terminal 1 — a local chain
cd backend
npm install
npx hardhat node

# terminal 2 — deploy the contract to it
cd backend
npx hardhat ignition deploy ignition/modules/Voting.ts --network localhost

# terminal 3 — the frontend
cd frontend
npm install
cp .env.example .env.local   # then fill it in, see below
npm run dev
```

Open <http://localhost:3000> and add the local network (chain id `31337`, RPC
`http://127.0.0.1:8545`) to your wallet. The first account printed by `hardhat node` is the owner.

### Frontend configuration

`frontend/.env.local`:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_PROJECT_ID` | A Reown project id, from <https://dashboard.reown.com> |
| `NEXT_PUBLIC_APP_URL` | The origin the app is served from |
| `NEXT_PUBLIC_DEFAULT_CHAIN_ID` | `31337` locally, `11155111` for Sepolia |
| `NEXT_PUBLIC_VOTING_ADDRESS_LOCAL` / `_SEPOLIA` | From `backend/ignition/deployments/chain-<id>/deployed_addresses.json` |
| `NEXT_PUBLIC_VOTING_DEPLOY_BLOCK_LOCAL` / `_SEPOLIA` | `receipt.blockNumber` in the same folder's `journal.jsonl` |

### Tests

```shell
cd backend
npx hardhat test
```

## Deploying to Sepolia

Secrets live in the [Hardhat keystore](https://hardhat.org/docs/plugins/hardhat-keystore),
encrypted and outside the repository:

```shell
cd backend
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat keystore set ETHERSCAN_API_KEY

npx hardhat ignition deploy ignition/modules/Voting.ts --network sepolia --verify
```

Ignition records the deployment in `backend/ignition/deployments/chain-11155111/`, which is
committed: running the command again does not redeploy.

## License

[MIT](LICENSE)

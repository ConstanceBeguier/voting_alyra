# Voting smart contract

An Ethereum voting contract where an administrator (`Ownable`) registers a whitelist of voters,
who then submit proposals and vote for one of them.
The process follows a sequential 6-state workflow (`RegisteringVoters`,
`ProposalsRegistrationStarted`, `ProposalsRegistrationEnded`, `VotingSessionStarted`,
`VotingSessionEnded`, `VotesTallied`), with every transition restricted to the contract owner.
`tallyVotes()` closes the process by recording the most-voted proposal in `winningProposalID`.

## Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

Current output:

```text
Compiled 1 Solidity file with solc 0.8.28 (evm target: cancun)

Running Solidity tests


Running Mocha tests


  Voting contract
    Deployment
      ✔ sets the deployer as owner
      ✔ starts in RegisteringVoters status
    RegisteringVoters status
      ✔ allows only addVoter and startProposalsRegistering
      addVoter
        ✔ rejects an already registered voter
        ✔ stores the new voter's default state
        ✔ emits VoterRegistered with the voter address
        ✔ rejects a non-owner caller
        ✔ accepts the zero address
      startProposalsRegistering
        ✔ changes status and creates GENESIS proposal
        ✔ emits WorkflowStatusChange with both statuses
        ✔ rejects a non-owner caller


  11 passing (69ms)


11 passing (11 mocha)
```

Only the `RegisteringVoters` workflow status is covered so far.

## Coverage

Solidity coverage is collected by the `--coverage` flag on the test task:

```shell
npx hardhat test --coverage
```

```text
Saved html report to <project>/coverage/html
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                     Coverage Report                                                      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ File Coverage                                                                                                            ║
╟──────────────────────┬────────┬─────────────┬────────────────────────────────────────────────────────────────────────────╢
║ File Path            │ Line % │ Statement % │ Uncovered Lines                                                            ║
╟──────────────────────┼────────┼─────────────┼────────────────────────────────────────────────────────────────────────────╢
║ contracts/Voting.sol │ 45.45  │ 43.48       │ 77, 80-82, 84, 91-92, 94-96, 98, 117-118, 123-124, 129-130, 136-139, 142,… ║
╟──────────────────────┼────────┼─────────────┼────────────────────────────────────────────────────────────────────────────╢
║ Total                │ 45.45  │ 43.48       │                                                                            ║
╚══════════════════════╧════════╧═════════════╧════════════════════════════════════════════════════════════════════════════╝
```

| File | Line % | Statement % |
| --- | --- | --- |
| `contracts/Voting.sol` | 45.45 | 43.48 |
| **Total** | **45.45** | **43.48** |

The report truncates the uncovered lines. The full list is 77, 80-82, 84, 91-92,
94-96, 98, 117-118, 123-124, 129-130, 136-139, 142, 144-145 — `addProposal`,
`setVote` and every workflow transition after `startProposalsRegistering`, which
matches the tested scope described above.

The run also writes a browsable HTML report to `coverage/html/index.html` plus an
`lcov.info` file. Both are gitignored.

# Voting smart contract

An Ethereum voting contract where an administrator (`Ownable`) registers a whitelist of voters,
who then submit proposals and vote for one of them.
The process follows a sequential 6-state workflow (`RegisteringVoters`,
`ProposalsRegistrationStarted`, `ProposalsRegistrationEnded`, `VotingSessionStarted`,
`VotingSessionEnded`, `VotesTallied`), with every transition restricted to the contract owner.
`tallyVotes()` closes the process by recording the most-voted proposal in `winningProposalID`.

## Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

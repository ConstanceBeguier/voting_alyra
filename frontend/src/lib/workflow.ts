/**
 * The contract's WorkflowStatus enum, in one place.
 *
 * The ABI types it as a plain `number`, so TypeScript cannot check this
 * against Voting.sol: keep the order identical to the enum there.
 */
export const WorkflowStatus = {
  RegisteringVoters: 0,
  ProposalsRegistrationStarted: 1,
  ProposalsRegistrationEnded: 2,
  VotingSessionStarted: 3,
  VotingSessionEnded: 4,
  VotesTallied: 5,
} as const

export type WorkflowStatus = (typeof WorkflowStatus)[keyof typeof WorkflowStatus]

/** Indexed by the enum values above. */
export const WORKFLOW_LABELS = [
  'Registering voters',
  'Proposals registration started',
  'Proposals registration ended',
  'Voting session started',
  'Voting session ended',
  'Votes tallied',
] as const

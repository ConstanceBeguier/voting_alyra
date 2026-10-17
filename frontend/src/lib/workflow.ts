/**
 * The contract's WorkflowStatus enum. The ABI types it as a plain `number`, so
 * nothing checks this against Voting.sol: keep the order identical.
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

/** One word per phase, for the stepper. Same order. */
export const WORKFLOW_SHORT_LABELS = [
  'Registration',
  'Proposals',
  'Review',
  'Voting',
  'Counting',
  'Results',
] as const

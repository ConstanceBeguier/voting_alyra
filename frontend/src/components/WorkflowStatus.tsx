const LABELS = [
  'Registering voters',
  'Proposals registration started',
  'Proposals registration ended',
  'Voting session started',
  'Voting session ended',
  'Votes tallied',
] as const

export function WorkflowStatus({ status }: { status: number | undefined }) {
  if (status === undefined) return null

  return (
    <p>
      Current phase: <strong>{LABELS[status]}</strong>
    </p>
  )
}

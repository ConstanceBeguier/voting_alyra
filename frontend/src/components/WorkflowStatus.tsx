import { WORKFLOW_LABELS } from '@/lib/workflow'

export function WorkflowStatus({ status }: { status: number | undefined }) {
  if (status === undefined) return null

  return (
    <p>
      Current phase: <strong>{WORKFLOW_LABELS[status]}</strong>
    </p>
  )
}

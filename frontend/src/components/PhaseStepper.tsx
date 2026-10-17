import { cn } from 'cn'
import { Check, Hourglass, Lightbulb, Lock, Trophy, UserPlus, Vote } from 'lucide-react'
import { WORKFLOW_LABELS, WORKFLOW_SHORT_LABELS } from '@/lib/workflow'

// same order as the workflow enum
const ICONS = [UserPlus, Lightbulb, Lock, Vote, Hourglass, Trophy]

export function PhaseStepper({ status }: { status: number | undefined }) {
  if (status === undefined) return null

  const last = WORKFLOW_LABELS.length - 1

  return (
    <section className="glass rounded-2xl p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Current phase</p>
          <p key={status} className="mt-1 text-2xl font-semibold tracking-tight motion-safe:animate-rise">
            {WORKFLOW_LABELS[status]}
          </p>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
          Step {status + 1} / {last + 1}
        </p>
      </div>

      <div className="relative mt-8">
        {/* the track runs from the centre of the first node to the last one */}
        <div className="absolute inset-x-[8.33%] top-5 h-0.5 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gradient transition-[width] duration-700 ease-out"
            style={{ width: `${(status / last) * 100}%` }}
          />
        </div>

        <ol className="relative grid grid-cols-6">
          {WORKFLOW_SHORT_LABELS.map((label, step) => {
            const Icon = ICONS[step]
            // the last phase is an outcome, not something in progress
            const finished = status === last
            const done = step < status || finished
            const current = step === status && !finished

            return (
              <li key={label} className="flex flex-col items-center gap-2.5">
                <span
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex size-10 items-center justify-center rounded-full border transition-all duration-500',
                    done && 'border-transparent bg-brand-gradient text-white',
                    current && 'border-brand bg-background text-brand motion-safe:animate-pulse-ring',
                    !done && !current && 'border-white/10 bg-background text-muted-foreground',
                  )}
                >
                  {done && step !== last ? <Check className="size-4.5" /> : <Icon className="size-4.5" />}
                </span>
                <span
                  className={cn(
                    'hidden text-xs sm:block',
                    current || (finished && step === last) ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

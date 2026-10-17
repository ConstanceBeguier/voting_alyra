import type { ReactNode } from 'react'
import { cn } from 'cn'

// literal class names, so Tailwind's scanner can see them
const ACCENTS = {
  admin: {
    line: 'via-admin',
    icon: 'bg-admin/15 text-admin ring-admin/25',
    chip: 'border-admin/30 bg-admin/10 text-admin',
    glow: 'shadow-[0_0_70px_-38px_var(--admin)]',
  },
  voter: {
    line: 'via-voter',
    icon: 'bg-voter/15 text-voter ring-voter/25',
    chip: 'border-voter/30 bg-voter/10 text-voter',
    glow: 'shadow-[0_0_70px_-38px_var(--voter)]',
  },
}

/** The card each role lives in: a colour, an icon, a badge. */
export function RolePanel({
  accent,
  icon,
  title,
  badge,
  subtitle,
  children,
}: {
  accent: keyof typeof ACCENTS
  icon: ReactNode
  title: string
  badge: string
  subtitle?: ReactNode
  children: ReactNode
}) {
  const a = ACCENTS[accent]

  return (
    <section className={cn('glass relative overflow-hidden rounded-2xl p-6 motion-safe:animate-rise sm:p-8', a.glow)}>
      <div className={cn('absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent', a.line)} />

      <div className="flex flex-wrap items-center gap-3">
        <span className={cn('flex size-11 items-center justify-center rounded-xl ring-1', a.icon)}>{icon}</span>
        <div className="mr-auto">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <span className={cn('rounded-full border px-3 py-1 text-xs font-medium', a.chip)}>{badge}</span>
      </div>

      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </section>
  )
}

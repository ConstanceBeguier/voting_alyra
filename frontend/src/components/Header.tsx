import { Vote } from 'lucide-react'
import { ConnectButton } from '@/components/ConnectButton'

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-[0_0_24px_-6px_var(--brand)]">
            <Vote className="size-4.5" />
          </span>
          <h1 className="text-base font-semibold tracking-tight">Voting</h1>
        </div>
        <ConnectButton />
      </div>
    </header>
  )
}

import { cn } from 'cn'

/** A colour pair derived from the address, so each account is recognisable. */
export function Avatar({ address, className }: { address: string; className?: string }) {
  const hue = parseInt(address.slice(2, 8), 16) % 360
  return (
    <span
      aria-hidden
      className={cn('size-7 shrink-0 rounded-full ring-1 ring-white/15', className)}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 80% 62%), hsl(${(hue + 70) % 360} 80% 52%))` }}
    />
  )
}

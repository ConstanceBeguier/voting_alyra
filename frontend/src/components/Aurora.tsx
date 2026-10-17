/** The glowing backdrop behind every page. */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-48 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand/30 blur-[130px] motion-safe:animate-aurora" />
      <div className="absolute top-1/3 -right-48 h-[460px] w-[560px] rounded-full bg-brand-2/20 blur-[130px] motion-safe:animate-aurora [animation-delay:-7s]" />
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.07)_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
    </div>
  )
}

import confetti from 'canvas-confetti'

const COLORS = ['#a78bfa', '#67e8f9', '#f0abfc', '#ffffff']

// bursts start where the user last clicked — the button that sent the transaction
let origin = { x: 0.5, y: 0.6 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (e) => (origin = { x: e.clientX / innerWidth, y: e.clientY / innerHeight }),
    { passive: true },
  )
}

export function celebrate() {
  confetti({
    particleCount: 80,
    spread: 75,
    startVelocity: 35,
    origin,
    colors: COLORS,
    disableForReducedMotion: true,
  })
}

export function celebrateBig() {
  const end = Date.now() + 1200
  const frame = () => {
    for (const [x, angle] of [[0, 60], [1, 120]] as const) {
      confetti({ particleCount: 7, angle, spread: 65, origin: { x, y: 0.75 }, colors: COLORS, disableForReducedMotion: true })
    }
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

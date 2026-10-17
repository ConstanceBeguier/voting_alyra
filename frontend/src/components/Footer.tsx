export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Voting · Every ballot recorded on Ethereum
      </div>
    </footer>
  )
}

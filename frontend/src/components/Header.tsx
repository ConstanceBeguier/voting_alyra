import { ConnectButton } from "@/components/ConnectButton";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <h1 className="text-lg font-semibold">Voting</h1>
      <ConnectButton />
    </header>
  );
}

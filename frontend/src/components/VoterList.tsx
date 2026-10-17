'use client'
import { useQuery } from '@tanstack/react-query'
import { useChainId, usePublicClient } from 'wagmi'
import {
  votingAbi,
  getVotingAddress,
  getVotingDeployBlock,
} from '@/contracts/voting'
import { useWatchVoters } from '@/hooks/useVotingEvents'
import { ListError } from '@/components/ListError'
import { UserPlus } from 'lucide-react'
import { Avatar } from '@/components/Avatar'

export function VoterList() {
  const chainId = useChainId()
  const votingAddress = getVotingAddress(chainId)
  const client = usePublicClient()
  const fromBlock = getVotingDeployBlock(chainId)

  useWatchVoters(votingAddress)

  const { data: voters, isPending, error } = useQuery({
    queryKey: ['voters', chainId, votingAddress],
    enabled: Boolean(client && votingAddress),
    queryFn: async () => {
      // guaranteed by `enabled` above; asserted so the rest reads cleanly
      if (!client || !votingAddress) throw new Error('Not ready')

      // the event carries the address itself, so the logs are the whole story
      const logs = await client.getContractEvents({
        address: votingAddress,
        abi: votingAbi,
        eventName: 'VoterRegistered',
        fromBlock,
      })
      return logs.map((log) => log.args.voterAddress!)
    },
  })

  if (isPending) return null
  if (error) return <ListError what="voters" error={error} />

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h3 className="eyebrow">Registered voters</h3>
        <span className="text-xs text-muted-foreground tabular-nums">{voters?.length ?? 0}</span>
      </div>
      {voters?.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {voters.map((voter, index) => (
            <li
              key={voter}
              style={{ animationDelay: `${index * 50}ms` }}
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.05] motion-safe:animate-rise"
            >
              <Avatar address={voter} />
              <span className="truncate font-mono text-sm">
                {voter.slice(0, 6)}…{voter.slice(-4)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 px-5 py-8 text-sm text-muted-foreground">
          <UserPlus className="size-5 shrink-0 text-admin" />
          No voters yet — add the first address above.
        </div>
      )}
    </div>
  )
}

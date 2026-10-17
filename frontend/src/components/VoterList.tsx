'use client'
import { useQuery } from '@tanstack/react-query'
import { useChainId, usePublicClient } from 'wagmi'
import { votingAbi, getVotingAddress } from '@/contracts/voting'
import { useWatchVoters } from '@/hooks/useVotingEvents'

export function VoterList() {
  const chainId = useChainId()
  const votingAddress = getVotingAddress(chainId)
  const client = usePublicClient()

  useWatchVoters(votingAddress)

  const { data: voters, isPending } = useQuery({
    queryKey: ['voters', chainId, votingAddress],
    enabled: Boolean(client && votingAddress),
    queryFn: async () => {
      // the event carries the address itself, so the logs are the whole story
      const logs = await client!.getContractEvents({
        address: votingAddress!,
        abi: votingAbi,
        eventName: 'VoterRegistered',
        fromBlock: 0n,
      })
      return logs.map((log) => log.args.voterAddress!)
    },
  })

  if (isPending) return null

  return (
    <div className="flex flex-col items-start gap-2">
      <h3 className="font-medium">Registered voters ({voters?.length ?? 0})</h3>
      {voters?.length ? (
        <ul className="list-disc pl-5 font-mono text-sm">
          {voters.map((voter) => (
            <li key={voter}>{voter}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground">No voter registered yet.</p>
      )}
    </div>
  )
}

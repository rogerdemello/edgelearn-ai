'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

export default function Leaderboard() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week')

  const leaderboardData = [
    { rank: 1, name: 'Sarah Chen', xp: 8540, streak: 45, level: 12 },
    { rank: 2, name: 'Marcus Johnson', xp: 8120, streak: 38, level: 11 },
    { rank: 3, name: 'Elena Rodriguez', xp: 7890, streak: 42, level: 11 },
    { rank: 4, name: 'Kai Nakamura', xp: 7620, streak: 31, level: 10 },
    { rank: 5, name: 'Priya Patel', xp: 7310, streak: 28, level: 10 },
    { rank: 6, name: 'James Wilson', xp: 6980, streak: 25, level: 9 },
    { rank: 7, name: 'Sophie Laurent', xp: 6540, streak: 19, level: 9 },
    { rank: 8, name: user?.name ?? 'You', xp: user?.totalXp ?? 0, streak: 7, level: user?.level ?? 1 },
    { rank: 9, name: 'Alex Thompson', xp: 5820, streak: 15, level: 8 },
    { rank: 10, name: 'Jordan Blake', xp: 5210, streak: 12, level: 7 },
  ]

  const timeframes: { id: 'week' | 'month' | 'all'; label: string }[] = [
    { id: 'week', label: 'This week' },
    { id: 'month', label: 'This month' },
    { id: 'all', label: 'All time' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Leaderboard</h1>
        <p className="text-muted-foreground">See how you rank.</p>
      </div>

      <div className="flex gap-2">
        {timeframes.map((tf) => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeframe === tf.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { rank: 1, height: 'h-44' },
          { rank: 2, height: 'h-36' },
          { rank: 3, height: 'h-28' },
        ].map((podium) => {
          const data = leaderboardData[podium.rank - 1]
          return (
            <div key={podium.rank} className="text-center">
              <div className={`${podium.height} rounded-lg border border-border bg-secondary/50 flex flex-col items-center justify-end p-4 mb-3`}>
                <span className="text-4xl font-bold text-primary mb-2">#{podium.rank}</span>
              </div>
              <h3 className="font-semibold text-foreground">{data.name}</h3>
              <p className="text-sm text-muted-foreground">{data.xp} XP · Level {data.level}</p>
            </div>
          )
        })}
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">XP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboardData.map((entry, i) => {
                const isCurrentUser = entry.name === user?.name
                return (
                  <tr
                    key={i}
                    className={isCurrentUser ? 'bg-primary/10' : 'hover:bg-secondary/30'}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex w-8 h-8 items-center justify-center rounded-md bg-secondary font-semibold text-sm text-foreground">
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                          {entry.name.charAt(0)}
                        </div>
                        <span className={`font-medium ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {entry.name}
                          {isCurrentUser && ' (you)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.level}</td>
                    <td className="px-4 py-3">
                      <span className="badge-accent">{entry.xp}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{entry.streak}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total participants', value: '50,234' },
          { label: 'Avg. daily active', value: '12,456' },
          { label: 'Weekly contests', value: '12' },
        ].map((stat, i) => (
          <div key={i} className="card-premium p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { api, MasteryEntry, AttemptStats } from '@/lib/api'
import { Loader2 } from 'lucide-react'

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [masteryData, setMasteryData] = useState<MasteryEntry[]>([])
  const [attemptStats, setAttemptStats] = useState<AttemptStats | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [mastery, stats] = await Promise.all([
        api.getAllMastery(),
        api.getAttemptStats()
      ])
      setMasteryData(mastery)
      setAttemptStats(stats)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const avgMastery = masteryData.length > 0
    ? masteryData.reduce((sum, m) => sum + m.mastery_score, 0) / masteryData.length
    : 0

  const avgConfidence = masteryData.length > 0
    ? masteryData.reduce((sum, m) => sum + m.confidence_score, 0) / masteryData.length
    : 0

  const strongConcepts = masteryData
    .filter(m => m.mastery_score >= 0.7)
    .sort((a, b) => b.mastery_score - a.mastery_score)
    .slice(0, 3)

  const weakConcepts = masteryData
    .filter(m => m.mastery_score < 0.5)
    .sort((a, b) => a.mastery_score - b.mastery_score)
    .slice(0, 3)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Progress and performance</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-premium p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Total Attempts
          </p>
          <p className="text-2xl font-bold text-foreground">
            {attemptStats?.total_attempts || 0}
          </p>
        </div>
        <div className="card-premium p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Accuracy Rate
          </p>
          <p className="text-2xl font-bold text-foreground">
            {attemptStats ? Math.round(attemptStats.accuracy_rate * 100) : 0}%
          </p>
        </div>
        <div className="card-premium p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Avg Mastery
          </p>
          <p className="text-2xl font-bold text-foreground">
            {Math.round(avgMastery * 100)}%
          </p>
        </div>
        <div className="card-premium p-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Concepts Tracked
          </p>
          <p className="text-2xl font-bold text-foreground">
            {masteryData.length}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Strong Areas</h2>
          {strongConcepts.length > 0 ? (
            <div className="space-y-4">
              {strongConcepts.map((concept, i) => (
                <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground text-sm">{concept.concept_title}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary">
                      {Math.round(concept.mastery_score * 100)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${concept.mastery_score * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {concept.attempts} attempts • Confidence: {Math.round(concept.confidence_score * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Start practicing to build mastery!</p>
          )}
        </div>

        <div className="card-premium p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">Areas to Improve</h2>
          {weakConcepts.length > 0 ? (
            <div className="space-y-4">
              {weakConcepts.map((concept, i) => (
                <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground text-sm">{concept.concept_title}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {Math.round(concept.mastery_score * 100)}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${concept.mastery_score * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {concept.attempts} attempts • Needs more practice
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Great work! No weak areas detected.</p>
          )}
        </div>
      </div>

      <div className="card-premium p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Performance Metrics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-md border border-border bg-background/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Average Score</p>
            <p className="font-semibold text-foreground mb-1">
              {attemptStats ? Math.round(attemptStats.avg_score * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Across all attempts</p>
          </div>
          <div className="p-4 rounded-md border border-border bg-background/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Hints Used</p>
            <p className="font-semibold text-foreground mb-1">
              {attemptStats ? attemptStats.avg_hints_used.toFixed(1) : '0.0'}
            </p>
            <p className="text-xs text-muted-foreground">Average per question</p>
          </div>
          <div className="p-4 rounded-md border border-border bg-background/50">
            <p className="text-xs font-medium text-muted-foreground mb-1">Avg Time</p>
            <p className="font-semibold text-foreground mb-1">
              {attemptStats && attemptStats.avg_time_taken > 0 
                ? `${Math.round(attemptStats.avg_time_taken / 60)}m` 
                : 'N/A'}
            </p>
            <p className="text-xs text-muted-foreground">Per question</p>
          </div>
        </div>
      </div>
    </div>
  )
}

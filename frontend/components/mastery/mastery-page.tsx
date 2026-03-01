'use client'

import { useState, useEffect } from 'react'
import { api, type MasteryEntry } from '@/lib/api'
import ProgressRing from '@/components/ui/progress-ring'

type Filter = 'all' | 'strong' | 'weak'

export default function MasteryPage() {
  const [entries, setEntries] = useState<MasteryEntry[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMastery()
  }, [])

  const loadMastery = async () => {
    setLoading(true)
    try {
      const data = await api.getAllMastery()
      setEntries(data)
    } catch (e) {
      console.error('Failed to load mastery:', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = entries.filter(e => {
    if (filter === 'strong') return e.mastery_score >= 0.8
    if (filter === 'weak') return e.mastery_score < 0.5
    return true
  })

  const avgMastery = entries.length > 0
    ? (entries.reduce((s, e) => s + e.mastery_score, 0) / entries.length) * 100
    : 0

  const avgConfidence = entries.length > 0
    ? (entries.reduce((s, e) => s + e.confidence_score, 0) / entries.length) * 100
    : 0

  return (
    <div className="max-w-4xl mx-auto animation-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mastery <span className="accent-text">Tracker</span>
        </h1>
        <p className="text-body text-muted-foreground">Track your progress and confidence across all concepts</p>
      </div>

      {/* Overview stats */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8 stagger-in">
        <div className="card-glass !p-6 text-center">
          <ProgressRing value={avgMastery} size={90} strokeWidth={7} label="Mastery" />
          <p className="text-sm text-muted-foreground mt-3">Average Mastery</p>
        </div>
        <div className="card-glass !p-6 text-center">
          <ProgressRing value={avgConfidence} size={90} strokeWidth={7} label="Confidence" color="#7c3aed" />
          <p className="text-sm text-muted-foreground mt-3">Average Confidence</p>
        </div>
        <div className="card-glass !p-6 text-center">
          <div className="text-4xl font-bold text-foreground mb-1">{entries.length}</div>
          <p className="text-sm text-muted-foreground">Total Concepts</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: 'all' as Filter, label: 'All', count: entries.length },
          { key: 'strong' as Filter, label: 'Strong', count: entries.filter(e => e.mastery_score >= 0.8).length },
          { key: 'weak' as Filter, label: 'Weak', count: entries.filter(e => e.mastery_score < 0.5).length },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Mastery list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 skeleton-shimmer rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-premium !p-12 text-center">
          <p className="text-2xl mb-3">📊</p>
          <p className="text-foreground font-medium mb-1">No mastery data yet</p>
          <p className="text-sm text-muted-foreground">Complete diagnostic tests or practice sessions to build your mastery profile.</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-in">
          {filtered.map(entry => (
            <div key={entry.concept_id} className="card-premium !p-5 flex items-center gap-6">
              <ProgressRing value={entry.mastery_score * 100} size={60} strokeWidth={5} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{entry.concept_title}</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Attempts: <span className="text-foreground font-medium">{entry.attempts}</span></span>
                  <span>Last: <span className="text-foreground font-medium">{new Date(entry.last_practiced).toLocaleDateString()}</span></span>
                  {entry.next_review && (
                    <span>Next review: <span className="text-foreground font-medium">{new Date(entry.next_review).toLocaleDateString()}</span></span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-violet-500"
                    style={{ width: `${entry.confidence_score * 100}%` }}
                  />
                </div>
                <p className="text-xs text-foreground mt-1">{Math.round(entry.confidence_score * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

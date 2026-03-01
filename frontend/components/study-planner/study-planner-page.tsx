'use client'

import { useState, useEffect } from 'react'
import { api, type DueConcept, type ConceptItem } from '@/lib/api'
import { Button } from '@/components/ui/button'
import ProgressRing from '@/components/ui/progress-ring'

export default function StudyPlannerPage() {
  const [dueConcepts, setDueConcepts] = useState<DueConcept[]>([])
  const [allConcepts, setAllConcepts] = useState<ConceptItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [examDate, setExamDate] = useState('')
  const [examReadiness, setExamReadiness] = useState<{ readiness_score: number; status: string; days_until_exam: number; recommendations: string[] } | null>(null)
  const [checkingReadiness, setCheckingReadiness] = useState(false)

  // Create plan state
  const [planConceptIds, setPlanConceptIds] = useState<number[]>([])
  const [planExamDate, setPlanExamDate] = useState('')
  const [planDailyMinutes, setPlanDailyMinutes] = useState(60)
  const [creating, setCreating] = useState(false)
  const [planResult, setPlanResult] = useState<{ plan_id: number; total_concepts: number; estimated_days: number } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dueData, conceptData] = await Promise.all([
        api.getDueConcepts().catch(() => ({ due_concepts: [] })),
        api.getDiagnosticConcepts(),
      ])
      setDueConcepts(dueData.due_concepts)
      setAllConcepts(conceptData.concepts)
    } catch (e) {
      console.error('Failed to load data:', e)
    } finally {
      setLoading(false)
    }
  }

  const checkReadiness = async () => {
    if (!examDate) return
    setCheckingReadiness(true)
    try {
      const data = await api.getExamReadiness(examDate)
      setExamReadiness(data)
    } catch (e) {
      console.error('Failed to check readiness:', e)
    } finally {
      setCheckingReadiness(false)
    }
  }

  const createPlan = async () => {
    if (planConceptIds.length === 0) return
    setCreating(true)
    try {
      const data = await api.createStudyPlan(planConceptIds, planExamDate || undefined, planDailyMinutes)
      setPlanResult(data)
      setShowCreateModal(false)
    } catch (e) {
      console.error('Failed to create plan:', e)
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready': return 'badge-success'
      case 'almost ready': return 'badge-warning'
      case 'needs work': return 'badge-warning'
      default: return 'badge-danger'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-10 w-64 skeleton-shimmer rounded-lg" />
        <div className="h-48 skeleton-shimmer rounded-lg" />
        <div className="h-48 skeleton-shimmer rounded-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animation-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Study <span className="accent-text">Planner</span>
          </h1>
          <p className="text-body text-muted-foreground">Plan your study sessions with spaced repetition</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
          + Create Plan
        </Button>
      </div>

      {planResult && (
        <div className="card-glass !p-6 mb-6 animation-scaleIn">
          <div className="flex items-center gap-3 mb-3">
            <span className="pulse-dot" />
            <h3 className="font-semibold text-foreground">Active Study Plan</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <p className="text-caption uppercase mb-1">Concepts</p>
              <p className="text-xl font-bold text-foreground">{planResult.total_concepts}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <p className="text-caption uppercase mb-1">Est. Days</p>
              <p className="text-xl font-bold text-foreground">{planResult.estimated_days}</p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <p className="text-caption uppercase mb-1">Daily Time</p>
              <p className="text-xl font-bold text-foreground">{planDailyMinutes}min</p>
            </div>
          </div>
        </div>
      )}

      {/* Due Concepts */}
      <div className="card-premium !p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-5">Concepts Due for Review</h2>
        {dueConcepts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm text-muted-foreground">No concepts due. Great job staying on top!</p>
          </div>
        ) : (
          <div className="space-y-3 stagger-in">
            {dueConcepts.map(dc => (
              <div key={dc.concept_id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <ProgressRing value={dc.mastery * 100} size={48} strokeWidth={4} />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{dc.concept_title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Mastery: {Math.round(dc.mastery * 100)}%</p>
                </div>
                <span className={dc.overdue ? 'badge-danger' : 'badge-warning'}>
                  {dc.overdue ? 'Overdue' : `Due in ${dc.days_until_due}d`}
                </span>
                <Button size="sm" className="bg-primary text-primary-foreground text-xs hover:bg-primary/90">
                  Review
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Readiness */}
      <div className="card-premium !p-6">
        <h2 className="text-lg font-semibold text-foreground mb-5">Exam Readiness Check</h2>
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="date"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={checkReadiness}
            disabled={!examDate || checkingReadiness}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium disabled:opacity-50"
          >
            {checkingReadiness ? 'Checking...' : 'Check Readiness'}
          </Button>
        </div>

        {examReadiness && (
          <div className="animation-scaleIn">
            <div className="flex items-center gap-6 mb-5">
              <ProgressRing value={examReadiness.readiness_score} size={100} strokeWidth={8} label="Ready" />
              <div>
                <span className={getStatusColor(examReadiness.status)}>{examReadiness.status}</span>
                <p className="text-sm text-muted-foreground mt-2">{examReadiness.days_until_exam} days until exam</p>
              </div>
            </div>
            {examReadiness.recommendations.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Recommendations:</p>
                {examReadiness.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">→</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animation-fadeIn">
          <div className="card-glass !p-8 w-full max-w-lg mx-4 animation-scaleIn">
            <h2 className="text-xl font-bold text-foreground mb-6">Create Study Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="text-label text-muted-foreground mb-2 block">Select Concepts</label>
                <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-border p-2">
                  {allConcepts.map(c => (
                    <label key={c.id} className="flex items-center gap-2 p-2 rounded hover:bg-secondary/30 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={planConceptIds.includes(c.id)}
                        onChange={() => setPlanConceptIds(prev =>
                          prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                        )}
                        className="accent-primary"
                      />
                      <span className="text-foreground">{c.title}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{c.subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-label text-muted-foreground mb-2 block">Exam Date (optional)</label>
                <input
                  type="date"
                  value={planExamDate}
                  onChange={e => setPlanExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-label text-muted-foreground mb-2 block">Daily Study Time (minutes)</label>
                <input
                  type="number"
                  value={planDailyMinutes}
                  onChange={e => setPlanDailyMinutes(Number(e.target.value))}
                  min={15}
                  max={480}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border-border text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={createPlan}
                disabled={planConceptIds.length === 0 || creating}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-50"
              >
                {creating ? 'Creating...' : `Create Plan (${planConceptIds.length})`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

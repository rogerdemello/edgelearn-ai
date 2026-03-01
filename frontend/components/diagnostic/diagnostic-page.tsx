'use client'

import { useState, useEffect } from 'react'
import { api, type ConceptItem, type DiagnosticResult } from '@/lib/api'
import { Button } from '@/components/ui/button'
import ProgressRing from '@/components/ui/progress-ring'

type Phase = 'select' | 'assess' | 'results'

export default function DiagnosticPage() {
  const [phase, setPhase] = useState<Phase>('select')
  const [concepts, setConcepts] = useState<ConceptItem[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [results, setResults] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingConcepts, setLoadingConcepts] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  const loadConcepts = async () => {
    setLoadingConcepts(true)
    try {
      const data = await api.getDiagnosticConcepts(subjectFilter || undefined, difficultyFilter || undefined)
      setConcepts(data.concepts)
    } catch (e) {
      console.error('Failed to load concepts:', e)
    } finally {
      setLoadingConcepts(false)
    }
  }

  useEffect(() => { loadConcepts() }, [])

  const toggleConcept = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await api.submitDiagnostic(
        selectedIds,
        selectedIds.map(id => ({ concept_id: id, response_text: responses[id] || '' }))
      )
      setResults(res)
      setPhase('results')
    } catch (e) {
      console.error('Assessment failed:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto animation-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Diagnostic <span className="accent-text">Assessment</span>
        </h1>
        <p className="text-body text-muted-foreground">Understand your knowledge gaps with AI-powered diagnostics</p>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-3 mb-8">
        {(['select', 'assess', 'results'] as Phase[]).map((p, i) => (
          <div key={p} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              phase === p ? 'bg-primary/15 text-primary border border-primary/30' :
              (['select', 'assess', 'results'].indexOf(phase) > i ? 'bg-primary/10 text-primary/70' : 'bg-secondary text-muted-foreground')
            }`}>
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                {i + 1}
              </span>
              {p === 'select' ? 'Select' : p === 'assess' ? 'Assess' : 'Results'}
            </div>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Phase 1: Select concepts */}
      {phase === 'select' && (
        <div className="space-y-6 animation-slideUp">
          <div className="card-premium !p-6">
            <h2 className="text-lg font-semibold text-foreground mb-5">Filter Concepts</h2>
            <div className="flex flex-wrap gap-4 mb-4">
              <select
                value={subjectFilter}
                onChange={e => setSubjectFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Programming">Programming</option>
                <option value="Biology">Biology</option>
                <option value="History">History</option>
              </select>
              <select
                value={difficultyFilter}
                onChange={e => setDifficultyFilter(e.target.value)}
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
              >
                <option value="">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Button onClick={loadConcepts} variant="outline" className="border-border text-muted-foreground hover:text-foreground">
                Load Concepts
              </Button>
            </div>
          </div>

          <div className="card-premium !p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Available Concepts</h2>
              <span className="badge-accent">{selectedIds.length} selected</span>
            </div>

            {loadingConcepts ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 skeleton-shimmer rounded-lg" />)}
              </div>
            ) : concepts.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No concepts found. Try different filters.</p>
            ) : (
              <div className="space-y-2 stagger-in">
                {concepts.map(c => (
                  <label
                    key={c.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedIds.includes(c.id)
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border hover:bg-secondary/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => toggleConcept(c.id)}
                      className="w-4 h-4 accent-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{c.title}</p>
                      {c.description && <p className="text-sm text-muted-foreground mt-0.5">{c.description}</p>}
                    </div>
                    <span className="badge-accent">{c.subject}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      c.difficulty_level === 'beginner' ? 'badge-success' :
                      c.difficulty_level === 'intermediate' ? 'badge-warning' : 'badge-danger'
                    }`}>{c.difficulty_level}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={() => setPhase('assess')}
            disabled={selectedIds.length === 0}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold disabled:opacity-50"
          >
            Continue to Assessment ({selectedIds.length} concepts)
          </Button>
        </div>
      )}

      {/* Phase 2: Assessment */}
      {phase === 'assess' && (
        <div className="space-y-6 animation-slideUp">
          {selectedIds.map((id, idx) => {
            const concept = concepts.find(c => c.id === id)
            return (
              <div key={id} className="card-premium !p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                  <h3 className="font-semibold text-foreground">{concept?.title || `Concept ${id}`}</h3>
                  {concept && <span className="badge-accent text-xs">{concept.subject}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-3">Explain your understanding of this concept:</p>
                <textarea
                  value={responses[id] || ''}
                  onChange={e => setResponses(prev => ({ ...prev, [id]: e.target.value }))}
                  placeholder="Type your response..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            )
          })}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setPhase('select')} className="flex-1 border-border text-muted-foreground hover:text-foreground">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-semibold disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />Analyzing...</span>
              ) : 'Submit Assessment'}
            </Button>
          </div>
        </div>
      )}

      {/* Phase 3: Results */}
      {phase === 'results' && results && (
        <div className="space-y-6 animation-slideUp">
          <div className="card-glass !p-8 text-center">
            <ProgressRing value={results.confidence * 100} size={120} strokeWidth={8} label="Confidence" />
            <h2 className="text-xl font-bold text-foreground mt-5 mb-2">Assessment Complete</h2>
            <p className="text-body text-muted-foreground max-w-lg mx-auto">{results.diagnosis}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-premium !p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Strong Areas
              </h3>
              {results.strong_areas.length > 0 ? (
                <div className="space-y-2">
                  {results.strong_areas.map((area, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-sm text-foreground">{area}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Keep practicing!</p>}
            </div>

            <div className="card-premium !p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Areas for Improvement
              </h3>
              {results.weak_areas.length > 0 ? (
                <div className="space-y-2">
                  {results.weak_areas.map((area, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/15">
                      <span className="text-red-400">→</span>
                      <span className="text-sm text-foreground">{area}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Great job! No weak areas.</p>}
            </div>
          </div>

          {results.recommended_path.length > 0 && (
            <div className="card-premium !p-6">
              <h3 className="font-semibold text-foreground mb-4">Recommended Learning Path</h3>
              <div className="space-y-3">
                {results.recommended_path.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-foreground">{JSON.stringify(step)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => { setPhase('select'); setSelectedIds([]); setResponses({}); setResults(null) }}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-semibold"
          >
            Start New Assessment
          </Button>
        </div>
      )}
    </div>
  )
}

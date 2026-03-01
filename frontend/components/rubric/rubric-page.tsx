'use client'

import { useState } from 'react'
import { api, type RubricResult } from '@/lib/api'
import { Button } from '@/components/ui/button'
import ProgressRing from '@/components/ui/progress-ring'

export default function RubricPage() {
  const [assessmentId, setAssessmentId] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RubricResult | null>(null)
  const [expandedCriterion, setExpandedCriterion] = useState<number | null>(null)

  const handleSubmit = async () => {
    if (!assessmentId || !response.trim()) return
    setLoading(true)
    try {
      const data = await api.evaluateRubric(Number(assessmentId), response)
      setResults(data)
    } catch (e) {
      console.error('Evaluation failed:', e)
    } finally {
      setLoading(false)
    }
  }

  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-excellent'
    if (score >= 60) return 'score-good'
    if (score >= 40) return 'score-average'
    return 'score-poor'
  }

  return (
    <div className="max-w-4xl mx-auto animation-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Rubric <span className="accent-text">Feedback</span>
        </h1>
        <p className="text-body text-muted-foreground">Get explainable, rubric-based evaluation on your work</p>
      </div>

      {!results ? (
        <div className="space-y-6 animation-slideUp">
          <div className="card-premium !p-6">
            <h2 className="text-lg font-semibold text-foreground mb-5">Submit for Evaluation</h2>
            <div className="space-y-4">
              <div>
                <label className="text-label text-muted-foreground mb-2 block">Assessment ID</label>
                <input
                  type="number"
                  value={assessmentId}
                  onChange={e => setAssessmentId(e.target.value)}
                  placeholder="Enter assessment ID..."
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-label text-muted-foreground mb-2 block">Your Response</label>
                <textarea
                  value={response}
                  onChange={e => setResponse(e.target.value)}
                  placeholder="Paste your essay, code, or response here..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{response.length} characters</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!assessmentId || !response.trim() || loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Evaluating...
              </span>
            ) : 'Submit for Evaluation'}
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animation-slideUp">
          {/* Overall Score */}
          <div className="card-glass !p-8 text-center">
            <ProgressRing value={results.overall_score} size={130} strokeWidth={9} label="Overall" />
            <h2 className={`text-2xl font-bold mt-4 ${getScoreClass(results.overall_score)}`}>
              {results.overall_score >= 80 ? 'Excellent' : results.overall_score >= 60 ? 'Good' : results.overall_score >= 40 ? 'Needs Improvement' : 'Needs Work'}
            </h2>
          </div>

          {/* Rubric Breakdown */}
          <div className="card-premium !p-6">
            <h3 className="font-semibold text-foreground mb-5">Rubric Breakdown</h3>
            <div className="space-y-3">
              {results.criteria.map((criterion, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedCriterion(expandedCriterion === i ? null : i)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{criterion.name}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              criterion.score >= 80 ? 'bg-emerald-400' :
                              criterion.score >= 60 ? 'bg-teal-400' :
                              criterion.score >= 40 ? 'bg-amber-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${criterion.score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${getScoreClass(criterion.score)}`}>{criterion.score}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">w: {criterion.weight}</span>
                    <span className="text-muted-foreground text-sm">{expandedCriterion === i ? '▲' : '▼'}</span>
                  </button>
                  {expandedCriterion === i && (
                    <div className="px-4 pb-4 border-t border-border pt-3 animation-fadeIn">
                      <p className="text-sm text-muted-foreground">{criterion.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Overall Feedback */}
          <div className="card-premium !p-6">
            <h3 className="font-semibold text-foreground mb-3">Overall Feedback</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{results.overall_feedback}</p>
          </div>

          {/* Suggestions */}
          {results.suggestions.length > 0 && (
            <div className="card-premium !p-6">
              <h3 className="font-semibold text-foreground mb-4">Suggestions for Improvement</h3>
              <div className="space-y-2">
                {results.suggestions.map((sugg, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-primary text-sm mt-0.5">💡</span>
                    <span className="text-sm text-foreground">{sugg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => { setResults(null); setResponse(''); setAssessmentId('') }}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 font-semibold"
          >
            Submit Another
          </Button>
        </div>
      )}
    </div>
  )
}

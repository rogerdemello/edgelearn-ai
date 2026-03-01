'use client'

import { useState, useEffect } from 'react'
import { api, ExamPredictionResponse, ExamSimulationSummary, ExamSimulationResult } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GraduationCap, TrendingUp, AlertTriangle, Play, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function ExamSimulationPage() {
  const [prediction, setPrediction] = useState<ExamPredictionResponse | null>(null)
  const [simulations, setSimulations] = useState<ExamSimulationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'predict' | 'sim-list' | 'active-sim'>('predict')
  const [activeSimId, setActiveSimId] = useState<number | null>(null)
  const [simResult, setSimResult] = useState<ExamSimulationResult | null>(null)

  // Sim creation form
  const [simTitle, setSimTitle] = useState('')
  const [simTime, setSimTime] = useState(30)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [pred, sims] = await Promise.all([
        api.predictExamScore().catch(() => null),
        api.getExamSimulations().catch(() => ({ simulations: [] })),
      ])
      setPrediction(pred)
      setSimulations(sims.simulations || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function createSim() {
    if (!simTitle.trim()) return
    try {
      const sim = await api.startExamSimulation(simTitle, [], simTime)
      setActiveSimId(sim.id)
      setTab('active-sim')
      loadData()
    } catch { /* ignore */ }
  }

  async function finishSim(simId: number) {
    try {
      const result = await api.finishExamSimulation(simId)
      setSimResult(result)
      loadData()
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="animation-fadeIn">
        <h1 className="text-2xl font-bold mb-6">Exam Readiness</h1>
        <div className="card-glass p-12 text-center text-muted-foreground">Loading exam data…</div>
      </div>
    )
  }

  return (
    <div className="animation-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary" /> Exam Readiness</h1>
          <p className="text-sm text-muted-foreground mt-1">Predict your exam score and run timed simulations</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'predict' as const, label: 'Prediction' },
          { id: 'sim-list' as const, label: 'Simulations' },
        ].map(t => (
          <Button key={t.id} variant={tab === t.id ? 'default' : 'outline'} size="sm" onClick={() => setTab(t.id)}>{t.label}</Button>
        ))}
      </div>

      {tab === 'predict' && <PredictionView prediction={prediction} />}
      {tab === 'sim-list' && (
        <div className="space-y-6">
          {/* Create new simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Start New Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Title</label>
                  <Input value={simTitle} onChange={e => setSimTitle(e.target.value)} placeholder="e.g. Midterm Practice" />
                </div>
                <div className="w-28">
                  <label className="text-xs text-muted-foreground mb-1 block">Time (min)</label>
                  <Input type="number" value={simTime} onChange={e => setSimTime(Number(e.target.value))} min={5} max={180} />
                </div>
                <Button onClick={createSim} disabled={!simTitle.trim()}><Play className="w-4 h-4 mr-1" /> Start</Button>
              </div>
            </CardContent>
          </Card>

          {/* Past simulations */}
          <SimListView simulations={simulations} onFinish={finishSim} />

          {/* Result display */}
          {simResult && <SimResultView result={simResult} />}
        </div>
      )}
    </div>
  )
}

function PredictionView({ prediction }: { prediction: ExamPredictionResponse | null }) {
  if (!prediction) {
    return (
      <Card><CardContent className="p-12 text-center text-muted-foreground">
        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        Complete more practice to get an exam prediction.
      </CardContent></Card>
    )
  }

  const statusColor = prediction.status === 'Ready' ? 'text-green-400' : prediction.status === 'Almost Ready' ? 'text-chart-4' : 'text-destructive'

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exam Score Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Readiness</p>
              <p className="text-3xl font-bold text-primary">{(prediction.readiness_score * 100).toFixed(0)}%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Predicted Range</p>
              <p className="text-2xl font-bold">{prediction.predicted_score_low}–{prediction.predicted_score_high}%</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <p className={`text-xl font-bold ${statusColor}`}>{prediction.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {prediction.high_risk_topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> High Risk Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prediction.high_risk_topics.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded bg-destructive/5 border border-destructive/20">
                  <span className="text-sm font-medium">{t.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{(t.mastery * 100).toFixed(0)}%</span>
                    <Badge variant="destructive">{t.risk}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {prediction.recommendations.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Recommendations</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {prediction.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />{r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SimListView({ simulations, onFinish }: { simulations: ExamSimulationSummary[]; onFinish: (id: number) => void }) {
  if (simulations.length === 0) {
    return <Card><CardContent className="p-8 text-center text-muted-foreground">No simulations yet. Create one above!</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Past Simulations</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-2">
          {simulations.map(sim => (
            <div key={sim.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border">
              <div>
                <p className="text-sm font-medium">{sim.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(sim.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                {sim.status === 'completed' ? (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" /> {sim.score?.toFixed(0)}%
                  </Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => onFinish(sim.id)}>
                    <Clock className="w-3 h-3 mr-1" /> Finish
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SimResultView({ result }: { result: ExamSimulationResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-400" /> Simulation Complete</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-primary">{result.score.toFixed(0)}%</p>
          </div>
          <div className="text-center p-3 rounded bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground">Correct</p>
            <p className="text-2xl font-bold">{result.correct}/{result.total_questions}</p>
          </div>
          <div className="text-center p-3 rounded bg-secondary/30 border border-border">
            <p className="text-xs text-muted-foreground">Rushed</p>
            <p className="text-2xl font-bold">{result.stress_indicators?.rushed_answers || 0}</p>
          </div>
        </div>

        {result.breakdown && Object.keys(result.breakdown).length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Concept Breakdown</p>
            <div className="space-y-1">
              {Object.entries(result.breakdown).map(([concept, data]) => (
                <div key={concept} className="flex items-center justify-between p-2 rounded bg-secondary/10 text-sm">
                  <span>{concept}</span>
                  <span className="font-mono text-xs">{data.correct}/{data.total} ({data.score.toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

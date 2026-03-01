'use client'

import { useState, useEffect } from 'react'
import { api, CognitiveProfileResponse, LearningDNAResponse, ConfidenceGrowthItem } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Dna, Sparkles, Target, Zap } from 'lucide-react'

export default function CognitiveProfilePage() {
  const [profile, setProfile] = useState<CognitiveProfileResponse | null>(null)
  const [dna, setDna] = useState<LearningDNAResponse | null>(null)
  const [growth, setGrowth] = useState<ConfidenceGrowthItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'profile' | 'dna' | 'confidence'>('profile')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [p, d, g] = await Promise.all([
        api.getCognitiveProfile().catch(() => null),
        api.getLearningDNA().catch(() => null),
        api.getConfidenceGrowth().catch(() => ({ growth_data: [] })),
      ])
      setProfile(p)
      setDna(d)
      setGrowth(g.growth_data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="animation-fadeIn">
        <h1 className="text-2xl font-bold mb-6">Cognitive Profile</h1>
        <div className="card-glass p-12 text-center text-muted-foreground">Loading cognitive data…</div>
      </div>
    )
  }

  return (
    <div className="animation-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="w-6 h-6 text-primary" /> Cognitive Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Your personalized learning intelligence report</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'profile' as const, label: 'Profile', icon: <Brain className="w-4 h-4" /> },
          { id: 'dna' as const, label: 'Learning DNA', icon: <Dna className="w-4 h-4" /> },
          { id: 'confidence' as const, label: 'Confidence Growth', icon: <TrendingUp className="w-4 h-4" /> },
        ].map(t => (
          <Button key={t.id} variant={tab === t.id ? 'default' : 'outline'} size="sm" onClick={() => setTab(t.id)}>
            {t.icon}<span className="ml-1">{t.label}</span>
          </Button>
        ))}
      </div>

      {tab === 'profile' && profile && <ProfileView profile={profile} />}
      {tab === 'profile' && !profile && <NoDataCard />}
      {tab === 'dna' && dna && <DNAView dna={dna} />}
      {tab === 'dna' && !dna && <NoDataCard />}
      {tab === 'confidence' && <ConfidenceView growth={growth} />}
    </div>
  )
}

function NoDataCard() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Complete some practice sessions to build your cognitive profile.</p>
      </CardContent>
    </Card>
  )
}

function ProfileView({ profile }: { profile: CognitiveProfileResponse }) {
  const metrics = [
    { label: 'Abstraction Skill', value: profile.abstraction_skill, icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Procedural Strength', value: profile.procedural_strength, icon: <Target className="w-4 h-4" /> },
    { label: 'Retention Rate', value: profile.retention_rate, icon: <Brain className="w-4 h-4" /> },
    { label: 'Transfer Ability', value: profile.transfer_ability, icon: <Zap className="w-4 h-4" /> },
    { label: 'Consistency', value: profile.consistency_score, icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Metacognition', value: profile.metacognition_score, icon: <Lightbulb className="w-4 h-4" /> },
  ]

  const warnings = [
    { label: 'Overconfidence', value: profile.overconfidence_index, threshold: 0.6 },
    { label: 'Hesitation', value: profile.hesitation_index, threshold: 0.6 },
    { label: 'Hint Dependency', value: profile.hint_dependency_index, threshold: 0.5 },
    { label: 'Frustration', value: profile.frustration_score, threshold: 0.6 },
  ]

  return (
    <div className="space-y-6">
      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cognitive Strengths</CardTitle>
          <CardDescription>Your learning capability scores (0–1 scale)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="p-4 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">{m.icon}<span className="text-xs font-medium">{m.label}</span></div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-foreground">{(m.value * 100).toFixed(0)}%</div>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.value * 100}%`, background: m.value >= 0.7 ? 'hsl(var(--primary))' : m.value >= 0.4 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-chart-4" /> Risk Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {warnings.map(w => (
              <div key={w.label} className={`p-4 rounded-lg border ${w.value >= w.threshold ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-secondary/20'}`}>
                <p className="text-xs text-muted-foreground mb-1">{w.label}</p>
                <p className={`text-xl font-bold ${w.value >= w.threshold ? 'text-destructive' : 'text-foreground'}`}>{(w.value * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meta */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="outline">Learning Style: {profile.learning_style}</Badge>
        <Badge variant="outline">Error Pattern: {profile.error_pattern_cluster}</Badge>
        <Badge variant="outline">Motivation: {profile.motivation_pattern}</Badge>
      </div>
    </div>
  )
}

function DNAView({ dna }: { dna: LearningDNAResponse }) {
  const d = dna.learning_dna
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Dna className="w-5 h-5 text-primary" /> Your Learning DNA</CardTitle>
          <CardDescription>A comprehensive fingerprint of how you learn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Learning Type</p>
              <p className="text-lg font-bold text-primary">{d.learning_type}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Ideal Difficulty</p>
              <p className="text-lg font-bold">{d.ideal_difficulty}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Optimal Session</p>
              <p className="text-lg font-bold">{d.optimal_session_length}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Motivation Driver</p>
              <p className="text-lg font-bold">{d.motivation_driver}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Cognitive Strengths</p>
              <div className="flex flex-wrap gap-2">
                {d.cognitive_strengths.map((s, i) => <Badge key={i} className="bg-green-500/10 text-green-400 border-green-500/30">{s}</Badge>)}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Areas to Improve</p>
              <div className="flex flex-wrap gap-2">
                {d.cognitive_weaknesses.map((w, i) => <Badge key={i} variant="destructive" className="bg-destructive/10">{w}</Badge>)}
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Error Pattern</p>
            <p className="text-sm text-muted-foreground">{d.error_pattern}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Recommendations</p>
            <ul className="space-y-1.5">
              {d.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-chart-4 mt-0.5 shrink-0" />{r}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ConfidenceView({ growth }: { growth: ConfidenceGrowthItem[] }) {
  if (growth.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Record emotional states during practice to see confidence growth over time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Confidence Growth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {growth.map((g, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20 border border-border">
              <div className="text-xs text-muted-foreground w-24">{g.date}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">Before:</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-chart-4 rounded-full" style={{ width: `${g.avg_confidence_before * 100}%` }} />
                  </div>
                  <span className="text-xs font-mono">{(g.avg_confidence_before * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">After: </span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${g.avg_confidence_after * 100}%` }} />
                  </div>
                  <span className="text-xs font-mono">{(g.avg_confidence_after * 100).toFixed(0)}%</span>
                </div>
              </div>
              <Badge variant={g.delta > 0 ? 'default' : 'destructive'} className="text-xs">
                {g.delta > 0 ? '+' : ''}{(g.delta * 100).toFixed(0)}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

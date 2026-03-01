'use client'

import { useState, useEffect } from 'react'
import { api, ClassAnalyticsResponse, StudentSummaryResponse, LeaderboardResponse } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Users, AlertTriangle, Trophy, RefreshCw, ChevronRight, BarChart3 } from 'lucide-react'

export default function InstitutionalDashboardPage() {
  const [analytics, setAnalytics] = useState<ClassAnalyticsResponse | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null)
  const [studentDetail, setStudentDetail] = useState<StudentSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'heatmap' | 'students' | 'leaderboard'>('overview')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [a, lb] = await Promise.all([
        api.getClassAnalytics().catch(() => null),
        api.getLeaderboard(20).catch(() => null),
      ])
      setAnalytics(a)
      setLeaderboard(lb)
    } catch { /* ignore */ }
    setLoading(false)
  }

  async function loadStudent(userId: number) {
    try {
      const s = await api.getStudentSummary(userId)
      setStudentDetail(s)
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="animation-fadeIn">
        <h1 className="text-2xl font-bold mb-6">Institutional Dashboard</h1>
        <div className="card-glass p-12 text-center text-muted-foreground">Loading class analytics…</div>
      </div>
    )
  }

  return (
    <div className="animation-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> Institutional Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Class-wide analytics, heatmaps, and at-risk identification</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'overview' as const, label: 'Overview' },
          { id: 'heatmap' as const, label: 'Concept Heatmap' },
          { id: 'students' as const, label: 'At-Risk Students' },
          { id: 'leaderboard' as const, label: 'Leaderboard' },
        ].map(t => (
          <Button key={t.id} variant={tab === t.id ? 'default' : 'outline'} size="sm" onClick={() => setTab(t.id)}>{t.label}</Button>
        ))}
      </div>

      {tab === 'overview' && analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={analytics.total_students} />
            <StatCard label="Total Concepts" value={analytics.total_concepts} />
            <StatCard label="Class Avg Mastery" value={`${(analytics.class_avg_mastery * 100).toFixed(0)}%`} />
            <StatCard label="Weak Concepts" value={analytics.weak_concepts.length} alert={analytics.weak_concepts.length > 0} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">At-Risk Students</CardTitle></CardHeader>
              <CardContent>
                {analytics.at_risk_students.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No at-risk students detected!</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.at_risk_students.slice(0, 5).map(s => (
                      <div key={s.user_id} className="flex items-center justify-between p-2 rounded bg-destructive/5 border border-destructive/20 cursor-pointer hover:bg-destructive/10"
                        onClick={() => { loadStudent(s.user_id); setTab('students') }}>
                        <span className="text-sm">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono">{(s.avg_mastery * 100).toFixed(0)}%</span>
                          <Badge variant="destructive">{s.risk_level}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Weakest Concepts</CardTitle></CardHeader>
              <CardContent>
                {analytics.weak_concepts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All concepts above threshold!</p>
                ) : (
                  <div className="space-y-2">
                    {analytics.weak_concepts.slice(0, 5).map(c => (
                      <div key={c.concept_id} className="flex items-center justify-between p-2 rounded bg-secondary/20 border border-border">
                        <span className="text-sm">{c.concept_title}</span>
                        <span className="text-xs font-mono">{(c.avg_mastery * 100).toFixed(0)}% avg</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {tab === 'heatmap' && analytics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Concept Mastery Heatmap</CardTitle>
            <CardDescription>Ordered from weakest to strongest across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.concept_heatmap.map(c => {
                const pct = Math.max(c.avg_mastery * 100, 5)
                const color = c.avg_mastery >= 0.7 ? 'bg-green-500' : c.avg_mastery >= 0.4 ? 'bg-chart-4' : 'bg-destructive'
                return (
                  <div key={c.concept_id} className="flex items-center gap-3">
                    <span className="text-sm w-36 truncate">{c.concept_title}</span>
                    <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden relative">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{(c.avg_mastery * 100).toFixed(0)}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground w-16 text-right">{c.students_struggling} weak</div>
                    <div className="text-xs text-green-400 w-16 text-right">{c.students_mastered} mastered</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'students' && (
        <div className="space-y-4">
          {analytics && analytics.at_risk_students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> At-Risk Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.at_risk_students.map(s => (
                    <div key={s.user_id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border cursor-pointer hover:bg-secondary/40"
                      onClick={() => loadStudent(s.user_id)}>
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.concepts_attempted} concepts attempted</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono">{(s.avg_mastery * 100).toFixed(0)}%</span>
                        <Badge variant="destructive">{s.risk_level}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student detail */}
          {studentDetail && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{studentDetail.student.name}</CardTitle>
                <CardDescription>{studentDetail.student.email} · Level {studentDetail.student.level} · {studentDetail.student.total_xp} XP</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center p-3 rounded bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground">Avg Mastery</p>
                    <p className="text-xl font-bold">{(studentDetail.mastery_summary.avg_mastery * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center p-3 rounded bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                    <p className="text-xl font-bold">{(studentDetail.attempt_summary.accuracy * 100).toFixed(0)}%</p>
                  </div>
                  <div className="text-center p-3 rounded bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground">Attempts</p>
                    <p className="text-xl font-bold">{studentDetail.attempt_summary.total_attempts}</p>
                  </div>
                  <div className="text-center p-3 rounded bg-secondary/30 border border-border">
                    <p className="text-xs text-muted-foreground">Avg Hints</p>
                    <p className="text-xl font-bold">{studentDetail.attempt_summary.avg_hints}</p>
                  </div>
                </div>

                {studentDetail.cognitive_profile && (
                  <div className="flex gap-2 flex-wrap mb-4">
                    <Badge variant="outline">Style: {studentDetail.cognitive_profile.learning_style}</Badge>
                    <Badge variant="outline">Motivation: {studentDetail.cognitive_profile.motivation_pattern}</Badge>
                  </div>
                )}

                <div className="space-y-1">
                  {studentDetail.concept_scores.map(c => (
                    <div key={c.concept_id} className="flex items-center gap-2 p-2 rounded bg-secondary/10 text-sm">
                      <span className="flex-1">{c.concept_title}</span>
                      <span className="font-mono text-xs">{(c.mastery * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === 'leaderboard' && leaderboard && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-chart-4" /> Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.leaderboard.map(entry => (
                <div key={entry.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 border border-border">
                  <span className={`text-lg font-bold w-8 ${entry.rank <= 3 ? 'text-chart-4' : 'text-muted-foreground'}`}>#{entry.rank}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{entry.total_xp} XP</p>
                    <p className="text-xs text-muted-foreground">{entry.concepts_mastered} mastered</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ label, value, alert }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-bold ${alert ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { api, type MasteryDashboard } from '@/lib/api'
import ProgressRing from '@/components/ui/progress-ring'
import { Stethoscope, Brain, CalendarDays, ClipboardCheck, Shield, Languages } from 'lucide-react'
import type { PageId } from '@/components/dashboard/dashboard-nav'

interface DashboardHomeProps {
  onNavigate?: (page: PageId) => void
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<MasteryDashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const data = await api.getMasteryDashboard()
      setDashboard(data)
    } catch (e) {
      console.error('Failed to load dashboard:', e)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { id: 'diagnostic' as PageId, label: 'Diagnostic Test', desc: 'Find knowledge gaps', icon: <Stethoscope className="w-5 h-5" />, color: 'from-teal-500/20 to-teal-500/5' },
    { id: 'mastery' as PageId, label: 'Mastery Tracker', desc: 'Track your progress', icon: <Brain className="w-5 h-5" />, color: 'from-violet-500/20 to-violet-500/5' },
    { id: 'study-planner' as PageId, label: 'Study Planner', desc: 'Plan study sessions', icon: <CalendarDays className="w-5 h-5" />, color: 'from-amber-500/20 to-amber-500/5' },
    { id: 'rubric' as PageId, label: 'Rubric Feedback', desc: 'Get AI evaluation', icon: <ClipboardCheck className="w-5 h-5" />, color: 'from-emerald-500/20 to-emerald-500/5' },
    { id: 'integrity' as PageId, label: 'Integrity Check', desc: 'Check originality', icon: <Shield className="w-5 h-5" />, color: 'from-blue-500/20 to-blue-500/5' },
    { id: 'settings' as PageId, label: 'Languages', desc: 'Translate & settings', icon: <Languages className="w-5 h-5" />, color: 'from-rose-500/20 to-rose-500/5' },
  ]

  return (
    <div className="space-y-10 animation-fadeIn">
      <div className="space-y-2">
        <h1 className="heading-glow text-3xl md:text-4xl text-foreground">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-body text-muted-foreground">Here's your learning overview.</p>
      </div>

      {/* Stats row */}
      {loading ? (
        <div className="grid sm:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-28 skeleton-shimmer rounded-lg" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5 stagger-in">
          <div className="card-glass !p-6 flex items-center gap-5">
            <ProgressRing value={(dashboard?.avg_mastery ?? 0) * 100} size={64} strokeWidth={5} />
            <div>
              <p className="text-caption uppercase mb-1">Avg Mastery</p>
              <p className="text-2xl font-bold text-foreground">{Math.round((dashboard?.avg_mastery ?? 0) * 100)}%</p>
            </div>
          </div>
          <div className="card-glass !p-6 flex items-center gap-5">
            <ProgressRing value={(dashboard?.avg_confidence ?? 0) * 100} size={64} strokeWidth={5} color="#7c3aed" />
            <div>
              <p className="text-caption uppercase mb-1">Confidence</p>
              <p className="text-2xl font-bold text-foreground">{Math.round((dashboard?.avg_confidence ?? 0) * 100)}%</p>
            </div>
          </div>
          <div className="card-glass !p-6">
            <p className="text-caption uppercase mb-1">Total Concepts</p>
            <p className="text-3xl font-bold text-foreground">{dashboard?.total_concepts ?? 0}</p>
            <div className="flex gap-3 mt-2">
              <span className="badge-success text-[10px]">↑ {dashboard?.strong_areas?.length ?? 0} strong</span>
              <span className="badge-danger text-[10px]">↓ {dashboard?.weak_areas?.length ?? 0} weak</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-5">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-in">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => onNavigate?.(action.id)}
              className="card-interactive !p-5 text-left group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 text-foreground group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{action.label}</h3>
              <p className="text-xs text-muted-foreground">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Strong / Weak areas */}
      {dashboard && (dashboard.strong_areas.length > 0 || dashboard.weak_areas.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-premium !p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Strong Areas
            </h3>
            {dashboard.strong_areas.length > 0 ? (
              <div className="space-y-2">
                {dashboard.strong_areas.map((area, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-sm text-foreground">Concept #{area.concept_id}</span>
                    <span className="text-xs font-medium text-emerald-400">{Math.round(area.mastery * 100)}%</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Keep practicing to build strong areas!</p>}
          </div>
          <div className="card-premium !p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Areas for Improvement
            </h3>
            {dashboard.weak_areas.length > 0 ? (
              <div className="space-y-2">
                {dashboard.weak_areas.map((area, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <span className="text-sm text-foreground">Concept #{area.concept_id}</span>
                    <span className="text-xs font-medium text-red-400">{Math.round(area.mastery * 100)}%</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Great job! No weak areas detected.</p>}
          </div>
        </div>
      )}

      {/* Feature highlights */}
      <div className="card-glass !p-6 md:!p-8">
        <h2 className="text-xl font-semibold text-foreground mb-5">Platform Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: '5-Level Hints', desc: 'Scaffolded guidance from subtle to explicit', icon: '💡' },
            { title: 'AI Diagnostics', desc: 'Identify knowledge gaps with LLM analysis', icon: '🔬' },
            { title: '10+ Languages', desc: 'Full multilingual support for Indian languages', icon: '🌐' },
            { title: 'Spaced Repetition', desc: 'Optimized review scheduling', icon: '📅' },
            { title: 'Rubric Scoring', desc: 'Explainable criterion-based evaluation', icon: '📋' },
            { title: 'Integrity Tools', desc: 'Originality check and citation generator', icon: '🛡️' },
          ].map((f, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-background/30 hover:border-primary/20 transition-colors">
              <span className="text-lg mb-2 block">{f.icon}</span>
              <h4 className="font-medium text-foreground text-sm mb-1">{f.title}</h4>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

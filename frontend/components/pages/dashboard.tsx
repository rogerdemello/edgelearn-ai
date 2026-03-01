'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import DashboardNav, { type PageId } from '@/components/dashboard/dashboard-nav'
import DashboardHome from '@/components/dashboard/dashboard-home'
import CoursesGrid from '@/components/courses/courses-grid'
import Leaderboard from '@/components/leaderboard/leaderboard'
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard'
import DiagnosticPage from '@/components/diagnostic/diagnostic-page'
import MasteryPage from '@/components/mastery/mastery-page'
import StudyPlannerPage from '@/components/study-planner/study-planner-page'
import RubricPage from '@/components/rubric/rubric-page'
import SettingsPage from '@/components/settings/settings-page'
import IntegrityPage from '@/components/integrity/integrity-page'
import CognitiveProfilePage from '@/components/cognitive/cognitive-profile-page'
import KnowledgeGraphPage from '@/components/knowledge-graph/knowledge-graph-page'
import ExamSimulationPage from '@/components/exam/exam-simulation-page'
import DebateTutorPage from '@/components/debate/debate-tutor-page'
import InstitutionalDashboardPage from '@/components/institutional/institutional-dashboard-page'
import AnimatedBackground from '@/components/ui/animated-bg'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState<PageId>('home')

  if (!user) return null

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />

      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto container-pad py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base">A</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">EdgeLearn AI</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Level {user.level} · {user.totalXp} XP</p>
            </div>
            <Button variant="outline" onClick={logout} className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        <DashboardNav currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 container-pad py-8 md:py-10 max-w-5xl">
          {currentPage === 'home' && <DashboardHome onNavigate={setCurrentPage} />}
          {currentPage === 'courses' && <CoursesGrid />}
          {currentPage === 'analytics' && <AnalyticsDashboard />}
          {currentPage === 'leaderboard' && <Leaderboard />}
          {currentPage === 'profile' && <ProfilePage user={user} />}
          {currentPage === 'diagnostic' && <DiagnosticPage />}
          {currentPage === 'mastery' && <MasteryPage />}
          {currentPage === 'study-planner' && <StudyPlannerPage />}
          {currentPage === 'rubric' && <RubricPage />}
          {currentPage === 'settings' && <SettingsPage />}
          {currentPage === 'integrity' && <IntegrityPage />}
          {currentPage === 'cognitive' && <CognitiveProfilePage />}
          {currentPage === 'knowledge-graph' && <KnowledgeGraphPage />}
          {currentPage === 'exam-sim' && <ExamSimulationPage />}
          {currentPage === 'debate' && <DebateTutorPage />}
          {currentPage === 'institutional' && <InstitutionalDashboardPage />}
        </main>
      </div>
    </div>
  )
}

function ProfilePage({ user }: { user: { name: string; email: string; level: number; totalXp: number } }) {
  return (
    <div className="max-w-2xl mx-auto animation-fadeIn">
      <div className="card-glass !p-8 md:!p-10">
        <h2 className="text-2xl font-bold text-foreground mb-8">Profile</h2>
        <div className="space-y-7">
          <div>
            <label className="block text-label text-muted-foreground mb-2">Name</label>
            <p className="text-foreground text-body">{user.name}</p>
          </div>
          <div>
            <label className="block text-label text-muted-foreground mb-2">Email</label>
            <p className="text-foreground text-body">{user.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="card-premium !p-5 text-center">
              <p className="text-3xl font-bold text-foreground mb-1">{user.level}</p>
              <p className="text-caption">Level</p>
            </div>
            <div className="card-premium !p-5 text-center">
              <p className="text-3xl font-bold accent-text mb-1">{user.totalXp}</p>
              <p className="text-caption">Total XP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

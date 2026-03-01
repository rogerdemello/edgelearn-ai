'use client'

import { LayoutDashboard, BookOpen, BarChart3, Trophy, User, Stethoscope, Brain, CalendarDays, ClipboardCheck, Languages, Shield, Settings, Network, GraduationCap, Swords, Building2, Dna } from 'lucide-react'

export type PageId = 'home' | 'courses' | 'analytics' | 'leaderboard' | 'profile' | 'diagnostic' | 'mastery' | 'study-planner' | 'rubric' | 'settings' | 'integrity' | 'cognitive' | 'knowledge-graph' | 'exam-sim' | 'debate' | 'institutional'

interface DashboardNavProps {
  currentPage: PageId
  onPageChange: (page: PageId) => void
}

const navSections: { title?: string; items: { id: PageId; label: string; icon: React.ReactNode }[] }[] = [
  {
    items: [
      { id: 'home', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Learn',
    items: [
      { id: 'diagnostic', label: 'Diagnostics', icon: <Stethoscope className="w-4 h-4" /> },
      { id: 'courses', label: 'Practice', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'mastery', label: 'Mastery', icon: <Brain className="w-4 h-4" /> },
      { id: 'study-planner', label: 'Study Planner', icon: <CalendarDays className="w-4 h-4" /> },
      { id: 'debate', label: 'AI Debate', icon: <Swords className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'cognitive', label: 'Cognitive Profile', icon: <Dna className="w-4 h-4" /> },
      { id: 'knowledge-graph', label: 'Knowledge Graph', icon: <Network className="w-4 h-4" /> },
      { id: 'exam-sim', label: 'Exam Readiness', icon: <GraduationCap className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'rubric', label: 'Rubric Feedback', icon: <ClipboardCheck className="w-4 h-4" /> },
      { id: 'integrity', label: 'Integrity', icon: <Shield className="w-4 h-4" /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
      { id: 'institutional', label: 'Class Dashboard', icon: <Building2 className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
      { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    ],
  },
]

export default function DashboardNav({ currentPage, onPageChange }: DashboardNavProps) {
  return (
    <nav className="w-60 border-r border-border bg-card/50 py-5 px-4 min-h-[calc(100vh-65px)] hidden md:block">
      <div className="space-y-6">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.title && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2 px-3">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-3 ${
                    currentPage === item.id
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {currentPage === item.id && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}

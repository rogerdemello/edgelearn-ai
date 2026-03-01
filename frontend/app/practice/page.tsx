'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import PracticeSession from '@/components/practice/practice-session'

export default function PracticePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [showSession, setShowSession] = useState(false)
  const [selectedConcept, setSelectedConcept] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const handleComplete = (score: number, xpEarned: number) => {
    setShowSession(false)
    // Could add a success notification here
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="max-w-7xl mx-auto container-pad py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/')}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-foreground">Practice Session</h1>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">Level {user.level} · {user.totalXp} XP</p>
          </div>
        </div>
      </header>

      <main className="container-pad py-8 md:py-10">
        {!showSession ? (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="card-premium !p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Practice?</h2>
              <p className="text-muted-foreground mb-8">
                Answer questions, get hints when needed, and watch your mastery grow!
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setSelectedConcept(undefined)
                    setShowSession(true)
                  }}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Start Random Practice
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  Questions from all available topics
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Features</h3>
                <div className="grid md:grid-cols-3 gap-4 text-left">
                  <div className="p-4 rounded-lg bg-background/50 border border-border">
                    <div className="text-primary font-semibold mb-2">💡 Progressive Hints</div>
                    <p className="text-sm text-muted-foreground">Get 5 levels of hints when stuck</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border">
                    <div className="text-primary font-semibold mb-2">📊 Real-time Feedback</div>
                    <p className="text-sm text-muted-foreground">See your mastery update instantly</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border">
                    <div className="text-primary font-semibold mb-2">🎯 Smart Tracking</div>
                    <p className="text-sm text-muted-foreground">Performance-based scoring</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PracticeSession
            conceptId={selectedConcept}
            limit={5}
            onComplete={handleComplete}
          />
        )}
      </main>
    </div>
  )
}

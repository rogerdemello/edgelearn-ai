'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import AnalyticsDashboard from '@/components/analytics/analytics-dashboard'

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border sticky top-0 z-40 bg-card/80 backdrop-blur">
        <div className="max-w-7xl mx-auto container-pad py-4 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">EdgeLearn AI</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <Button variant="outline" onClick={() => router.push('/')} className="border-border text-muted-foreground hover:text-foreground hover:bg-card">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto container-pad py-10">
        <AnalyticsDashboard />
      </main>
    </div>
  )
}

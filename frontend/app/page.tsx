'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LandingPage from '@/components/pages/landing-page'
import Dashboard from '@/components/pages/dashboard'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

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

  return user ? <Dashboard /> : <LandingPage />
}

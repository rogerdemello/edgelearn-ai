'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginFormProps {
  onSwitchToSignup: () => void
  onSuccess: () => void
  onGoHome?: () => void
}

export default function LoginForm({ onSwitchToSignup, onSuccess, onGoHome }: LoginFormProps) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        return
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email')
        return
      }
      await login(email, password)
      onSuccess()
    } catch {
      setError('Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center section-pad py-20">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 flex justify-start">
          {onGoHome ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={onGoHome}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          ) : (
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          )}
        </div>
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in</h1>
          <p className="text-body text-muted-foreground">Continue to EdgeLearn AI</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-label text-foreground mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-label text-foreground mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-primary"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-lg text-base">
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <Button variant="outline" className="h-11 border-border text-muted-foreground hover:text-foreground hover:bg-card rounded-lg">
            Google
          </Button>
          <Button variant="outline" className="h-11 border-border text-muted-foreground hover:text-foreground hover:bg-card rounded-lg">
            GitHub
          </Button>
        </div>

        <p className="text-center text-body text-muted-foreground">
          No account?{' '}
          <button type="button" onClick={onSwitchToSignup} className="text-primary hover:underline font-medium">
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}

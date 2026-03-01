'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'
import { api } from '@/lib/api'

const TOKEN_KEY = 'edgelearn_token'
const USER_KEY = 'edgelearn_user'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function meToUser(me: { id: string; email: string; name: string; level: number; totalXp: number }): User {
  return {
    id: me.id,
    email: me.email,
    name: me.name,
    totalXp: me.totalXp ?? 0,
    level: me.level ?? 1,
    createdAt: new Date(),
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    const stored = localStorage.getItem(USER_KEY)
    if (token && stored) {
      api.me(token).then((me) => {
        setUser(meToUser(me))
      }).catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { access_token } = await api.login(email, password)
    localStorage.setItem(TOKEN_KEY, access_token)
    const me = await api.me(access_token)
    const u = meToUser(me)
    setUser(u)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  const signup = async (email: string, name: string, password: string) => {
    const { access_token } = await api.register(email, name, password)
    localStorage.setItem(TOKEN_KEY, access_token)
    const me = await api.me(access_token)
    const u = meToUser(me)
    setUser(u)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

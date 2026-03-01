'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import LoginForm from '@/components/auth/login-form'
import SignupForm from '@/components/auth/signup-form'
import AnimatedBackground from '@/components/ui/animated-bg'
import { Stethoscope, Brain, CalendarDays, ClipboardCheck, Shield, Languages, Lightbulb, BarChart3 } from 'lucide-react'

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const duration = 1500
          const step = (timestamp: number) => {
            if (!start) start = timestamp
            const progress = Math.min((timestamp - start) / duration, 1)
            setCount(Math.floor(progress * target))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function LandingPage() {
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup'>('landing')

  return (
    <div className="min-h-screen aurora-bg relative">
      <AnimatedBackground />
      {authMode === 'landing' && (
        <LandingContent onAuthModeChange={setAuthMode} />
      )}
      {authMode === 'login' && (
        <LoginForm
          onSwitchToSignup={() => setAuthMode('signup')}
          onSuccess={() => {}}
          onGoHome={() => setAuthMode('landing')}
        />
      )}
      {authMode === 'signup' && (
        <SignupForm
          onSwitchToLogin={() => setAuthMode('login')}
          onSuccess={() => {}}
          onGoHome={() => setAuthMode('landing')}
        />
      )}
    </div>
  )
}

function LandingContent({ onAuthModeChange }: { onAuthModeChange: (mode: 'login' | 'signup') => void }) {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-5xl mx-auto section-pad flex items-center justify-between py-4 md:py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-bold text-primary-foreground text-base">A</span>
            </div>
            <span className="text-xl font-semibold text-foreground tracking-tight">EdgeLearn AI</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onAuthModeChange('login')}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-card"
            >
              Sign in
            </Button>
            <Button onClick={() => onAuthModeChange('signup')} className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
              Start learning
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="section-pad py-24 md:py-32 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8">
            <span className="pulse-dot" />
            <span className="text-xs text-primary font-medium">AI-Powered Adaptive Learning</span>
          </div>
          <h1 className="heading-glow text-foreground mb-8">
            Master <span className="gradient-text">any skill</span> with clarity
          </h1>
          <p className="text-body-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            Build real understanding with stepwise guidance and explainable AI feedback. Personalized diagnostics, mastery tracking, and multilingual support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => onAuthModeChange('signup')}
              size="lg"
              className="btn-glow h-12 px-8 rounded-lg text-base"
            >
              Start learning — free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 rounded-lg border-border text-foreground hover:bg-card text-base"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              See how it works
            </Button>
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <section className="section-pad py-12 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center stagger-in">
            {[
              { value: 5, suffix: '-Level', label: 'Scaffolded Hints' },
              { value: 10, suffix: '+', label: 'Indian Languages' },
              { value: 3, suffix: '', label: 'Citation Formats' },
              { value: 8, suffix: '', label: 'AI Agent Modules' },
            ].map((stat, i) => (
              <div key={i} className="card-glass !p-5">
                <p className="text-2xl md:text-3xl font-bold gradient-text">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section-pad py-20 md:py-28 border-t border-border scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-foreground font-semibold mb-4">Everything you need to <span className="accent-text">learn effectively</span></h2>
            <p className="text-body text-muted-foreground max-w-lg mx-auto">A multi-agent system that adapts to your learning style</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-in">
            {[
              { title: 'AI Diagnostics', desc: 'Identify knowledge gaps with LLM-powered assessment across multiple concepts.', icon: <Stethoscope className="w-5 h-5" /> },
              { title: 'Stepwise Hints', desc: '5 levels from subtle to explicit — build understanding, not dependence.', icon: <Lightbulb className="w-5 h-5" /> },
              { title: 'Mastery Tracking', desc: 'Progress with confidence scores, spaced repetition, and review scheduling.', icon: <Brain className="w-5 h-5" /> },
              { title: 'Study Planner', desc: 'Optimal study plans with exam readiness checks and priority ordering.', icon: <CalendarDays className="w-5 h-5" /> },
              { title: 'Rubric Feedback', desc: 'Explainable criterion-by-criterion evaluation for essays, code & more.', icon: <ClipboardCheck className="w-5 h-5" /> },
              { title: 'Multilingual', desc: 'Full support for Hindi, Tamil, Telugu, Kannada, and 6 more Indian languages.', icon: <Languages className="w-5 h-5" /> },
              { title: 'Integrity Tools', desc: 'Originality checker with flagging + APA/MLA/Chicago citation generator.', icon: <Shield className="w-5 h-5" /> },
              { title: 'Analytics', desc: 'Track progress over time with visual dashboards and detailed breakdowns.', icon: <BarChart3 className="w-5 h-5" /> },
            ].map((feature, i) => (
              <div key={i} className="card-interactive !p-5 group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture / How it works */}
      <section className="section-pad py-20 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-foreground text-center font-semibold mb-12">How EdgeLearn AI <span className="accent-text">works</span></h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Diagnose', desc: 'Take an adaptive diagnostic to reveal your strengths and knowledge gaps across topics.' },
              { step: '02', title: 'Practice', desc: 'Work through problems with AI-powered hints that progressively guide you to understanding.' },
              { step: '03', title: 'Master', desc: 'Track mastery with spaced repetition, get rubric feedback, and achieve exam readiness.' },
            ].map((item, i) => (
              <div key={i} className="card-glass !p-6 text-center">
                <span className="text-3xl font-bold gradient-text mb-3 block">{item.step}</span>
                <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-body text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-pad py-16 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-semibold text-foreground mb-6">Built with modern tech</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 16', 'React 19', 'FastAPI', 'OpenAI GPT-4', 'LangChain', 'SQLAlchemy', 'TypeScript', 'Tailwind CSS'].map(tech => (
              <span key={tech} className="px-4 py-2 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad py-20 md:py-24 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-semibold text-foreground mb-5">Ready to <span className="gradient-text">transform</span> your learning?</h2>
          <p className="text-body-lg text-muted-foreground mb-10">Create an account and start your personalized learning journey.</p>
          <Button
            onClick={() => onAuthModeChange('signup')}
            size="lg"
            className="btn-glow px-8 h-12 rounded-lg text-base"
          >
            Get started — free
          </Button>
        </div>
      </section>

      <footer className="border-t border-border section-pad py-8 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">A</span>
            </div>
            <span>EdgeLearn AI — learn at the edge</span>
          </div>
          <span className="text-xs">Built for AMD Hackathon 2026</span>
        </div>
      </footer>
    </div>
  )
}

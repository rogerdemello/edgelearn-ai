'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import PracticeSession from '@/components/practice/practice-session'
import PracticeResults from '@/components/practice/practice-results'

interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'short-answer'
  options?: string[]
  correctAnswer: string
  explanation: string
}

interface LessonViewProps {
  courseTitle: string
  lessonTitle: string
  lessonContent: string
  practiceTitle: string
  questions: Question[]
  onComplete: () => void
}

export default function LessonView({
  courseTitle,
  lessonTitle,
  lessonContent,
  practiceTitle,
  questions,
  onComplete,
}: LessonViewProps) {
  const [view, setView] = useState<'content' | 'practice' | 'results'>('content')
  const [practiceScore, setPracticeScore] = useState(0)
  const [practiceXp, setPracticeXp] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)

  const handlePracticeComplete = (score: number, xpEarned: number) => {
    const correct = Math.round((score / 100) * questions.length)
    setCorrectAnswers(correct)
    setPracticeScore(score)
    setPracticeXp(xpEarned)
    setView('results')
  }

  const handleRetry = () => setView('practice')
  const handleContinue = () => onComplete()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border sticky top-0 z-40 bg-card/80 backdrop-blur">
        <div className="max-w-4xl mx-auto container-pad py-4 md:py-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{courseTitle}</span>
            <span className="mx-2">/</span>
            <span className="text-foreground">{lessonTitle}</span>
          </p>
        </div>
      </div>

      {view === 'content' && (
        <div className="max-w-4xl mx-auto container-pad py-10">
          <div className="card-premium mb-10 !p-6 md:!p-10">
            <h1 className="text-3xl font-bold text-foreground mb-7">{lessonTitle}</h1>
            <div className="max-w-none mb-8">
              <div className="text-reading text-muted-foreground space-y-5">
                {lessonContent.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4">Key concepts</h3>
              <ul className="space-y-3 text-body text-muted-foreground">
                {['Fundamentals', 'Practice with examples', 'Apply in projects', 'Review and reinforce'].map((concept, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-primary">·</span>
                    {concept}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between pt-8 border-t border-border">
              <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-card rounded-lg">
                ← Previous
              </Button>
              <Button onClick={() => setView('practice')} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
                Start practice →
              </Button>
            </div>
          </div>
          <div className="card-premium !p-6 md:!p-8">
            <h2 className="text-xl font-semibold text-foreground mb-5">Resources</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {['Documentation', 'Video tutorials', 'Code examples', 'Forum'].map((resource, i) => (
                <button
                  key={i}
                  className="flex items-center gap-3 p-5 rounded-lg border border-border text-left hover:bg-secondary/50 transition-colors text-body"
                >
                  <span className="text-muted-foreground text-sm font-medium">—</span>
                  <span className="font-medium text-foreground">{resource}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'practice' && (
        <div className="max-w-4xl mx-auto container-pad py-10">
          <PracticeSession title={practiceTitle} questions={questions} onComplete={handlePracticeComplete} />
        </div>
      )}

      {view === 'results' && (
        <div className="max-w-4xl mx-auto container-pad py-10">
          <PracticeResults
            title={practiceTitle}
            score={practiceScore}
            xpEarned={practiceXp}
            correctAnswers={correctAnswers}
            totalQuestions={questions.length}
            onRetry={handleRetry}
            onContinue={handleContinue}
          />
        </div>
      )}
    </div>
  )
}

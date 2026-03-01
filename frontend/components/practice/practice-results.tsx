'use client'

import { Button } from '@/components/ui/button'

interface PracticeResultsProps {
  title: string
  score: number
  xpEarned: number
  correctAnswers: number
  totalQuestions: number
  onRetry: () => void
  onContinue: () => void
}

export default function PracticeResults({
  score,
  xpEarned,
  correctAnswers,
  totalQuestions,
  onRetry,
  onContinue,
}: PracticeResultsProps) {
  const getScoreMessage = () => {
    if (score >= 90) return 'Outstanding'
    if (score >= 80) return 'Great job'
    if (score >= 70) return 'Good effort'
    return 'Keep practicing'
  }

  const getScoreBg = () => {
    if (score >= 90) return 'bg-primary'
    if (score >= 80) return 'bg-primary/90'
    if (score >= 70) return 'bg-amber-500/80'
    return 'bg-amber-600/80'
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card-premium !p-8 md:!p-10 text-center">
        <div className="mb-10">
          <div className={`w-36 h-36 rounded-full ${getScoreBg()} flex items-center justify-center mx-auto`}>
            <div>
              <div className="text-4xl font-bold text-primary-foreground">{score}%</div>
              <div className="text-primary-foreground/80 text-sm mt-1">Score</div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3">{getScoreMessage()}</h2>
        <p className="text-body text-muted-foreground mb-10">
          {correctAnswers} of {totalQuestions} correct.
        </p>

        <div className="grid grid-cols-2 gap-6 mb-10 py-8 border-y border-border">
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">XP earned</p>
            <p className="text-2xl font-bold text-foreground">+{xpEarned}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-foreground">{Math.round((correctAnswers / totalQuestions) * 100)}%</p>
          </div>
        </div>

        {score >= 90 && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-5 mb-8 text-left">
            <p className="font-semibold text-primary mb-2">Achievement</p>
            <p className="text-body text-muted-foreground">90%+ on a practice session</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" onClick={onRetry} className="flex-1 border-border text-muted-foreground hover:text-foreground hover:bg-card">
            Try again
          </Button>
          <Button onClick={onContinue} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

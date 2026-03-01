'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { api, QuestionItem } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface PracticeSessionProps {
  conceptId?: number
  difficultyLevel?: string
  limit?: number
  onComplete?: (score: number, xpEarned: number) => void
}

export default function PracticeSession({ 
  conceptId, 
  difficultyLevel, 
  limit = 5,
  onComplete 
}: PracticeSessionProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [hints, setHints] = useState<string[]>([])
  const [currentHint, setCurrentHint] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [attemptResult, setAttemptResult] = useState<{
    is_correct: string
    feedback: string
    score: number
    mastery_delta: number
  } | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const currentQuestion = questions[currentQuestionIndex]

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      const fetchedQuestions = await api.getQuestions(conceptId, difficultyLevel, limit)
      setQuestions(fetchedQuestions)
      setStartTime(Date.now())
    } catch (error) {
      console.error('Failed to load questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return

    setSubmitting(true)
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const result = await api.submitAttempt(
        currentQuestion.id,
        answer,
        hintLevel,
        hints,
        undefined,
        timeTaken
      )

      setAttemptResult(result)
      setShowResult(true)
      setTotalScore(prev => prev + result.score)
      if (result.is_correct === 'correct') {
        setCorrectCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Failed to submit attempt:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestHint = async () => {
    if (!currentQuestion) return

    try {
      const newHintLevel = hintLevel + 1
      const hintResult = await api.getHint(
        currentQuestion.id,
        answer,
        newHintLevel,
        hints
      )

      setCurrentHint(hintResult.hint)
      setHintLevel(newHintLevel)
      setHints([...hints, hintResult.hint])
    } catch (error) {
      console.error('Failed to get hint:', error)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setAnswer('')
      setShowResult(false)
      setHintLevel(0)
      setHints([])
      setCurrentHint(null)
      setAttemptResult(null)
      setStartTime(Date.now())
    } else {
      const avgScore = Math.round((totalScore / questions.length) * 100)
      const xpEarned = Math.round(correctCount * 20)
      setSessionComplete(true)
      if (onComplete) {
        onComplete(avgScore, xpEarned)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No questions available for this topic.</p>
      </div>
    )
  }

  if (sessionComplete) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="card-premium !p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Session Complete!</h2>
          <p className="text-lg text-muted-foreground mb-2">
            You answered {correctCount} out of {questions.length} questions correctly
          </p>
          <p className="text-3xl font-bold text-primary my-6">
            {Math.round((correctCount / questions.length) * 100)}%
          </p>
          <Button onClick={() => window.location.reload()} className="mt-6">
            Start New Session
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-3">
          {currentQuestion.concept_title}
        </h1>
        <div className="flex items-center justify-between text-body text-muted-foreground">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="w-40 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card-premium !p-6 md:!p-8">
        <h2 className="text-lg font-semibold text-foreground mb-7">
          {currentQuestion.question_text}
        </h2>

        <div className="mb-7">
          <textarea
            placeholder="Type your answer…"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={showResult}
            className="w-full px-5 py-4 rounded-lg border border-border bg-background text-foreground text-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
          />
        </div>

        {currentHint && !showResult && (
          <div className="p-5 rounded-lg mb-7 border bg-blue-500/10 border-blue-500/30">
            <h3 className="font-semibold mb-2 text-blue-400">
              Hint (Level {hintLevel})
            </h3>
            <p className="text-sm text-muted-foreground">{currentHint}</p>
          </div>
        )}

        {showResult && attemptResult && (
          <div
            className={`p-5 rounded-lg mb-7 border ${
              attemptResult.is_correct === 'correct'
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <h3 className={`font-semibold mb-2 ${
              attemptResult.is_correct === 'correct' ? 'text-green-400' : 'text-red-400'
            }`}>
              {attemptResult.is_correct === 'correct' ? 'Correct!' : 'Incorrect'}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Score: {Math.round(attemptResult.score * 100)}%
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Mastery Change: {attemptResult.mastery_delta > 0 ? '+' : ''}{(attemptResult.mastery_delta * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">{attemptResult.feedback}</p>
          </div>
        )}

        <div className="flex gap-3">
          {!showResult ? (
            <>
              <Button
                onClick={handleRequestHint}
                disabled={hintLevel >= 5 || !answer.trim()}
                variant="outline"
                className="flex-1"
              >
                {hintLevel > 0 ? `Get Hint (${hintLevel + 1}/5)` : 'Get Hint'}
              </Button>
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || submitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
              </Button>
            </>
          ) : (
            <Button onClick={handleNext} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>

      {!showResult && hintLevel > 0 && (
        <div className="mt-8 p-5 rounded-lg border border-border bg-secondary/30 text-body text-muted-foreground">
          Note: Using hints will reduce your mastery gain for this question.
        </div>
      )}
    </div>
  )
}

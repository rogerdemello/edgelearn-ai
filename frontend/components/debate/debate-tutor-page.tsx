'use client'

import { useState, useRef, useEffect } from 'react'
import { api, DebateSessionResponse, DebateHistoryItem } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Swords, Send, Award, Clock, MessageSquare, User, Bot, RefreshCw } from 'lucide-react'

export default function DebateTutorPage() {
  const [tab, setTab] = useState<'new' | 'active' | 'history'>('new')
  const [topic, setTopic] = useState('')
  const [position, setPosition] = useState('')
  const [debate, setDebate] = useState<DebateSessionResponse | null>(null)
  const [argument, setArgument] = useState('')
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<DebateHistoryItem[]>([])
  const [resolution, setResolution] = useState<Record<string, unknown> | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadHistory() }, [])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [debate?.turns])

  async function loadHistory() {
    try {
      const res = await api.getDebateHistory(20)
      setHistory(res.debates || [])
    } catch { /* ignore */ }
  }

  async function startDebate() {
    if (!topic.trim()) return
    setSending(true)
    try {
      const res = await api.startDebate(topic, undefined, position || undefined)
      setDebate(res)
      setTab('active')
    } catch { /* ignore */ }
    setSending(false)
  }

  async function submitTurn() {
    if (!debate || !argument.trim()) return
    setSending(true)
    try {
      const res = await api.submitDebateTurn(debate.debate_id, argument)
      setDebate(prev => prev ? {
        ...prev,
        turns: [...(prev.turns || []),
          { role: 'student', content: argument, timestamp: new Date().toISOString() },
          { role: res.latest_turn.role, content: res.latest_turn.content, timestamp: new Date().toISOString() },
        ],
      } : prev)
      setArgument('')
    } catch { /* ignore */ }
    setSending(false)
  }

  async function resolveDebate() {
    if (!debate) return
    setSending(true)
    try {
      const res = await api.resolveDebate(debate.debate_id)
      setResolution(res as unknown as Record<string, unknown>)
      setDebate(prev => prev ? { ...prev, status: 'completed' } : prev)
      loadHistory()
    } catch { /* ignore */ }
    setSending(false)
  }

  return (
    <div className="animation-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Swords className="w-6 h-6 text-primary" /> AI Debate Tutor</h1>
          <p className="text-sm text-muted-foreground mt-1">Sharpen your critical thinking through structured debate</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'new' as const, label: 'New Debate' },
          { id: 'active' as const, label: 'Active Debate', disabled: !debate },
          { id: 'history' as const, label: 'History' },
        ].map(t => (
          <Button key={t.id} variant={tab === t.id ? 'default' : 'outline'} size="sm"
            onClick={() => setTab(t.id)} disabled={t.disabled}>
            {t.label}
          </Button>
        ))}
      </div>

      {tab === 'new' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Start a Debate</CardTitle>
            <CardDescription>Choose a topic and optionally state your position. The AI will challenge your reasoning.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Topic</label>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Is renewable energy sufficient to replace fossil fuels?" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Your Position (optional)</label>
              <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Yes, with proper investment in infrastructure..." />
            </div>
            <Button onClick={startDebate} disabled={!topic.trim() || sending}>
              <Swords className="w-4 h-4 mr-1" /> {sending ? 'Starting…' : 'Start Debate'}
            </Button>
          </CardContent>
        </Card>
      )}

      {tab === 'active' && debate && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{debate.topic}</CardTitle>
                <Badge variant={debate.status === 'active' ? 'default' : 'outline'}>{debate.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Chat messages */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 mb-4">
                {(debate.turns || []).map((turn, i) => (
                  <div key={i} className={`flex gap-3 ${turn.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      turn.role === 'student'
                        ? 'bg-primary/10 border border-primary/20 text-foreground'
                        : 'bg-secondary/30 border border-border text-foreground'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        {turn.role === 'student' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {turn.role === 'student' ? 'You' : turn.role}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{turn.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              {debate.status === 'active' && (
                <div className="flex gap-2">
                  <Input
                    value={argument}
                    onChange={e => setArgument(e.target.value)}
                    placeholder="Type your argument…"
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitTurn()}
                    disabled={sending}
                  />
                  <Button onClick={submitTurn} disabled={!argument.trim() || sending}>
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={resolveDebate} disabled={sending}>
                    <Award className="w-4 h-4 mr-1" /> Finish
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resolution / scores */}
          {resolution && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Debate Evaluation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                  {(['critical_thinking', 'argument_quality', 'evidence_usage', 'metacognition', 'overall'] as const).map(key => {
                    const scores = (resolution as unknown as { scores: Record<string, number> }).scores
                    const val = scores?.[key] ?? 0
                    return (
                      <div key={key} className="text-center p-3 rounded bg-secondary/20 border border-border">
                        <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="text-xl font-bold">{typeof val === 'number' ? val.toFixed(0) : val}</p>
                      </div>
                    )
                  })}
                </div>
                <p className="text-sm text-muted-foreground">{String((resolution as Record<string, unknown>).resolution || '')}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> Debate History</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No debates yet. Start your first one!</p>
            ) : (
              <div className="space-y-2">
                {history.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border">
                    <div>
                      <p className="text-sm font-medium">{d.topic}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> {d.total_turns} turns · {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={d.status === 'completed' ? 'default' : 'outline'}>{d.status}</Badge>
                      {d.overall_score != null && (
                        <span className="text-sm font-bold text-primary">{d.overall_score.toFixed(0)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-3" onClick={loadHistory}><RefreshCw className="w-3 h-3 mr-1" /> Refresh</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { api, KnowledgeGraphResponse } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Network, AlertTriangle, RefreshCw, ArrowRight, Circle } from 'lucide-react'

export default function KnowledgeGraphPage() {
  const [graph, setGraph] = useState<KnowledgeGraphResponse | null>(null)
  const [gaps, setGaps] = useState<Record<string, unknown> | null>(null)
  const [depScores, setDepScores] = useState<{ concept_id: number; title: string; dependency_score: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'graph' | 'gaps' | 'deps'>('graph')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [g, gp, ds] = await Promise.all([
        api.getKnowledgeGraph().catch(() => null),
        api.getGapPropagation().catch(() => ({ propagation_map: {} })),
        api.getDependencyScores().catch(() => ({ dependency_scores: [] })),
      ])
      setGraph(g)
      setGaps(gp.propagation_map || {})
      setDepScores(ds.dependency_scores || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="animation-fadeIn">
        <h1 className="text-2xl font-bold mb-6">Knowledge Graph</h1>
        <div className="card-glass p-12 text-center text-muted-foreground">Loading knowledge graph…</div>
      </div>
    )
  }

  return (
    <div className="animation-fadeIn space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Network className="w-6 h-6 text-primary" /> Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize concept relationships and identify knowledge gaps</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'graph' as const, label: 'Concept Map' },
          { id: 'gaps' as const, label: 'Gap Propagation' },
          { id: 'deps' as const, label: 'Dependencies' },
        ].map(t => (
          <Button key={t.id} variant={tab === t.id ? 'default' : 'outline'} size="sm" onClick={() => setTab(t.id)}>{t.label}</Button>
        ))}
      </div>

      {tab === 'graph' && graph && <GraphView graph={graph} />}
      {tab === 'graph' && !graph && <EmptyCard message="No knowledge graph data available yet." />}
      {tab === 'gaps' && <GapsView gaps={gaps} />}
      {tab === 'deps' && <DepsView scores={depScores} />}
    </div>
  )
}

function EmptyCard({ message }: { message: string }) {
  return (
    <Card><CardContent className="p-12 text-center text-muted-foreground">{message}</CardContent></Card>
  )
}

function GraphView({ graph }: { graph: KnowledgeGraphResponse }) {
  const getColor = (mastery: number) => {
    if (mastery >= 0.8) return 'bg-green-500'
    if (mastery >= 0.5) return 'bg-chart-4'
    if (mastery > 0) return 'bg-destructive'
    return 'bg-muted-foreground'
  }

  return (
    <div className="space-y-4">
      {/* Nodes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Concepts</CardTitle>
          <CardDescription>{graph.nodes.length} concepts · {graph.edges.length} connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {graph.nodes.map(node => (
              <div key={node.id} className="p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getColor(node.mastery)}`} />
                  <span className="text-sm font-medium truncate">{node.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{node.subject}</Badge>
                  <span className="text-xs font-mono text-muted-foreground">{(node.mastery * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {graph.edges.map((edge, i) => {
              const src = graph.nodes.find(n => n.id === edge.source)
              const tgt = graph.nodes.find(n => n.id === edge.target)
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded bg-secondary/10 text-sm">
                  <span className="font-medium">{src?.title || edge.source}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">{tgt?.title || edge.target}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">{edge.type}</Badge>
                </div>
              )
            })}
            {graph.edges.length === 0 && <p className="text-sm text-muted-foreground">No connections found.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Circle className="w-3 h-3 fill-green-500 text-green-500" /> Mastered ≥80%</span>
        <span className="flex items-center gap-1"><Circle className="w-3 h-3 fill-chart-4 text-chart-4" /> Developing 50-80%</span>
        <span className="flex items-center gap-1"><Circle className="w-3 h-3 fill-destructive text-destructive" /> Weak &lt;50%</span>
      </div>
    </div>
  )
}

function GapsView({ gaps }: { gaps: Record<string, unknown> | null }) {
  if (!gaps || Object.keys(gaps).length === 0) {
    return <EmptyCard message="No gap propagation data. Complete more concepts to detect knowledge gaps." />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-chart-4" /> Gap Propagation Analysis</CardTitle>
        <CardDescription>Concepts where weakness may cascade to dependent topics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(gaps).map(([key, val]) => (
            <div key={key} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-medium text-foreground">Concept {key}</p>
              <p className="text-xs text-muted-foreground mt-1">{JSON.stringify(val)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DepsView({ scores }: { scores: { concept_id: number; title: string; dependency_score: number }[] }) {
  if (scores.length === 0) {
    return <EmptyCard message="No dependency score data available yet." />
  }

  const sorted = [...scores].sort((a, b) => b.dependency_score - a.dependency_score)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dependency Scores</CardTitle>
        <CardDescription>Higher score = more concepts depend on this one</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map(s => (
            <div key={s.concept_id} className="flex items-center gap-3 p-2 rounded bg-secondary/20">
              <span className="text-sm font-medium flex-1">{s.title}</span>
              <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(s.dependency_score * 20, 100)}%` }} />
              </div>
              <span className="text-xs font-mono w-8 text-right">{s.dependency_score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

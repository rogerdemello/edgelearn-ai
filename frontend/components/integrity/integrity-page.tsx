'use client'

import { useState } from 'react'
import { api, type OriginalityResult, type CitationResult } from '@/lib/api'
import { Button } from '@/components/ui/button'
import ProgressRing from '@/components/ui/progress-ring'

type Tab = 'originality' | 'citations'

export default function IntegrityPage() {
  const [tab, setTab] = useState<Tab>('originality')

  // Originality
  const [origText, setOrigText] = useState('')
  const [refText, setRefText] = useState('')
  const [showRef, setShowRef] = useState(false)
  const [origLoading, setOrigLoading] = useState(false)
  const [origResult, setOrigResult] = useState<OriginalityResult | null>(null)

  // Citations
  const [citText, setCitText] = useState('')
  const [sourceType, setSourceType] = useState('web')
  const [sourceUrl, setSourceUrl] = useState('')
  const [citLoading, setCitLoading] = useState(false)
  const [citResult, setCitResult] = useState<CitationResult | null>(null)
  const [copiedField, setCopiedField] = useState('')

  const handleOriginalityCheck = async () => {
    if (!origText.trim()) return
    setOrigLoading(true)
    try {
      const refs = refText.trim() ? [refText] : []
      const data = await api.checkOriginality(origText, refs)
      setOrigResult(data)
    } catch (e) {
      console.error('Originality check failed:', e)
    } finally {
      setOrigLoading(false)
    }
  }

  const handleGenerateCitations = async () => {
    if (!citText.trim()) return
    setCitLoading(true)
    try {
      const data = await api.generateCitations(citText, sourceType, sourceUrl || undefined)
      setCitResult(data)
    } catch (e) {
      console.error('Citation generation failed:', e)
    } finally {
      setCitLoading(false)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto animation-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Academic <span className="accent-text">Integrity</span>
        </h1>
        <p className="text-body text-muted-foreground">Check originality and generate citations for your work</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('originality')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'originality'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
          }`}
        >
          Originality Check
        </button>
        <button
          onClick={() => setTab('citations')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            tab === 'citations'
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent'
          }`}
        >
          Citation Generator
        </button>
      </div>

      {/* Originality Check Tab */}
      {tab === 'originality' && (
        <div className="space-y-6 animation-slideUp">
          <div className="card-premium !p-6">
            <h2 className="text-lg font-semibold text-foreground mb-5">Check Originality</h2>
            <textarea
              value={origText}
              onChange={e => setOrigText(e.target.value)}
              placeholder="Paste your text here to check for originality..."
              rows={10}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
            />
            <button
              onClick={() => setShowRef(!showRef)}
              className="text-xs text-primary hover:text-primary/80 font-medium mb-3 block"
            >
              {showRef ? '− Hide reference text' : '+ Add reference text'}
            </button>
            {showRef && (
              <textarea
                value={refText}
                onChange={e => setRefText(e.target.value)}
                placeholder="Paste reference text to compare against (optional)..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4 animation-fadeIn"
              />
            )}
            <Button
              onClick={handleOriginalityCheck}
              disabled={!origText.trim() || origLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold disabled:opacity-50"
            >
              {origLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Checking...
                </span>
              ) : 'Check Originality'}
            </Button>
          </div>

          {origResult && (
            <div className="space-y-6 animation-scaleIn">
              <div className="card-glass !p-8 text-center">
                <ProgressRing value={origResult.originality_score} size={120} strokeWidth={8} label="Original" />
                <h3 className={`text-xl font-bold mt-4 ${
                  origResult.originality_score >= 80 ? 'score-excellent' :
                  origResult.originality_score >= 60 ? 'score-good' : 'score-poor'
                }`}>
                  {origResult.originality_score}% Original
                </h3>
                {origResult.needs_citation && (
                  <span className="badge-warning mt-3 inline-block">Needs Citation</span>
                )}
              </div>

              {origResult.flagged_sections.length > 0 && (
                <div className="card-premium !p-6">
                  <h3 className="font-semibold text-foreground mb-4">Flagged Sections</h3>
                  <div className="space-y-3">
                    {origResult.flagged_sections.map((flag, i) => (
                      <div key={i} className="p-4 rounded-lg bg-red-500/5 border border-red-500/15">
                        <p className="text-sm text-foreground font-medium mb-1">"{flag.text}"</p>
                        <p className="text-xs text-muted-foreground">{flag.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {origResult.suggestions.length > 0 && (
                <div className="card-premium !p-6">
                  <h3 className="font-semibold text-foreground mb-4">Suggestions</h3>
                  <div className="space-y-2">
                    {origResult.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">→</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Citation Generator Tab */}
      {tab === 'citations' && (
        <div className="space-y-6 animation-slideUp">
          <div className="card-premium !p-6">
            <h2 className="text-lg font-semibold text-foreground mb-5">Generate Citations</h2>
            <div className="space-y-4">
              <div>
                <label className="text-label text-muted-foreground mb-2 block">Source Text</label>
                <textarea
                  value={citText}
                  onChange={e => setCitText(e.target.value)}
                  placeholder="Enter the text or title to cite..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[160px]">
                  <label className="text-label text-muted-foreground mb-2 block">Source Type</label>
                  <select
                    value={sourceType}
                    onChange={e => setSourceType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
                  >
                    <option value="web">Web</option>
                    <option value="book">Book</option>
                    <option value="journal">Journal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {sourceType === 'web' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-label text-muted-foreground mb-2 block">Source URL</label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={e => setSourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleGenerateCitations}
              disabled={!citText.trim() || citLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold mt-4 disabled:opacity-50"
            >
              {citLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Generating...
                </span>
              ) : 'Generate Citations'}
            </Button>
          </div>

          {citResult && (
            <div className="space-y-4 animation-scaleIn stagger-in">
              {[
                { label: 'APA Format', value: citResult.apa, key: 'apa' },
                { label: 'MLA Format', value: citResult.mla, key: 'mla' },
                { label: 'Chicago Format', value: citResult.chicago, key: 'chicago' },
              ].map(fmt => (
                <div key={fmt.key} className="card-premium !p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground text-sm">{fmt.label}</h3>
                    <button
                      onClick={() => copyToClipboard(fmt.value, fmt.key)}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {copiedField === fmt.key ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg font-mono leading-relaxed break-all">
                    {fmt.value}
                  </p>
                </div>
              ))}

              {citResult.in_text_citations.length > 0 && (
                <div className="card-premium !p-5">
                  <h3 className="font-medium text-foreground text-sm mb-3">In-Text Citations</h3>
                  <div className="space-y-2">
                    {citResult.in_text_citations.map((cit, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/20">
                        <span className="text-sm text-muted-foreground font-mono">{cit}</span>
                        <button
                          onClick={() => copyToClipboard(cit, `in-text-${i}`)}
                          className="text-xs text-primary hover:text-primary/80"
                        >
                          {copiedField === `in-text-${i}` ? '✓' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

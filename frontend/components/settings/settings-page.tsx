'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' },
]

export default function SettingsPage() {
  const [preferredLang, setPreferredLang] = useState('en')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Translation tool state
  const [sourceText, setSourceText] = useState('')
  const [fromLang, setFromLang] = useState('en')
  const [toLang, setToLang] = useState('hi')
  const [translatedText, setTranslatedText] = useState('')
  const [translating, setTranslating] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSetLanguage = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await api.setLanguage(preferredLang)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error('Failed to set language:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleTranslate = async () => {
    if (!sourceText.trim()) return
    setTranslating(true)
    try {
      const data = await api.translate(sourceText, toLang, fromLang)
      setTranslatedText(data.translated_text)
    } catch (e) {
      console.error('Translation failed:', e)
    } finally {
      setTranslating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto animation-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          <span className="accent-text">Settings</span>
        </h1>
        <p className="text-body text-muted-foreground">Customize your learning experience</p>
      </div>

      {/* Language Preference */}
      <div className="card-premium !p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-5">Language Preference</h2>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-sm text-muted-foreground">Current:</span>
          <span className="badge-accent">{LANGUAGES.find(l => l.code === preferredLang)?.name || preferredLang}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setPreferredLang(lang.code)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                preferredLang === lang.code
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-secondary/30 text-muted-foreground hover:text-foreground border border-transparent hover:border-border'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSetLanguage}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Set as Default'}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-400 animation-fadeIn">
              ✓ Saved
            </span>
          )}
        </div>
      </div>

      {/* Translation Tool */}
      <div className="card-premium !p-6">
        <h2 className="text-lg font-semibold text-foreground mb-5">Translation Tool</h2>
        <div className="space-y-4">
          <div>
            <label className="text-label text-muted-foreground mb-2 block">Source Text</label>
            <textarea
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">From:</label>
              <select
                value={fromLang}
                onChange={e => setFromLang(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            <button
              onClick={() => { setFromLang(toLang); setToLang(fromLang) }}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              title="Swap languages"
            >
              ⇄
            </button>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">To:</label>
              <select
                value={toLang}
                onChange={e => setToLang(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary"
              >
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <Button
            onClick={handleTranslate}
            disabled={!sourceText.trim() || translating}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold disabled:opacity-50"
          >
            {translating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Translating...
              </span>
            ) : 'Translate'}
          </Button>

          {translatedText && (
            <div className="animation-slideUp">
              <div className="flex items-center justify-between mb-2">
                <label className="text-label text-muted-foreground">Translation</label>
                <button
                  onClick={handleCopy}
                  className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-4 rounded-lg bg-secondary/30 border border-border text-foreground text-sm leading-relaxed">
                {translatedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

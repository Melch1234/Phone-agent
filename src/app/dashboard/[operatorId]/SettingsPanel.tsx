'use client'

import { useState } from 'react'

interface Props {
  operatorId: string
  token: string
  initialBusinessName: string
  initialGreeting: string
  initialFaq: string
  initialIntakeQuestions: string
}

const s = {
  section: { marginTop: '2.5rem' },
  h2: { fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' },
  label: { display: 'block', fontSize: '.82rem', opacity: .5, marginBottom: 6 },
  input: {
    width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 10, padding: '0.75rem 1rem', color: '#f0e8d8', fontSize: '.9rem',
    outline: 'none', boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)',
    borderRadius: 10, padding: '0.75rem 1rem', color: '#f0e8d8', fontSize: '.88rem',
    outline: 'none', resize: 'vertical' as const, lineHeight: 1.6, boxSizing: 'border-box' as const,
  },
  row: { display: 'flex', gap: '0.75rem', marginTop: '0.75rem' },
  btn: (primary: boolean) => ({
    padding: '0.65rem 1.4rem', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontWeight: 600, fontSize: '.88rem',
    background: primary ? '#f5a82a' : 'rgba(255,255,255,.08)',
    color: primary ? '#040d1f' : '#f0e8d8',
  }),
  msg: (ok: boolean) => ({ fontSize: '.82rem', color: ok ? '#6fcf97' : '#ff6b6b', marginTop: 8 }),
}

export default function SettingsPanel({ operatorId, token, initialBusinessName, initialGreeting, initialFaq, initialIntakeQuestions }: Props) {
  const [businessName, setBusinessName] = useState(initialBusinessName)
  const [greeting, setGreeting] = useState(initialGreeting)
  const [faq, setFaq] = useState(initialFaq)
  const [intakeQuestions, setIntakeQuestions] = useState(initialIntakeQuestions)
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  async function importFromWebsite() {
    if (!scrapeUrl) return
    setScraping(true)
    setMsg(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl, operatorId, token }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFaq(data.faq)
      setMsg({ text: 'Imported — review and save when ready.', ok: true })
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Import failed', ok: false })
    } finally {
      setScraping(false)
    }
  }

  async function saveSettings() {
    setSaving(true)
    setMsg(null)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId, token, faq, greeting, business_name: businessName, intake_questions: intakeQuestions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ text: 'Settings saved.', ok: true })
    } catch (err) {
      setMsg({ text: err instanceof Error ? err.message : 'Save failed', ok: false })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.section}>
      <h2 style={s.h2}>AI Agent Settings</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Business name</label>
        <input style={s.input} value={businessName} onChange={e => setBusinessName(e.target.value)} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Opening greeting</label>
        <input style={s.input} value={greeting} onChange={e => setGreeting(e.target.value)}
          placeholder="Thanks for calling [Business]! How can I help?" />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Questions to ask every caller</label>
        <textarea style={s.textarea} rows={5} value={intakeQuestions} onChange={e => setIntakeQuestions(e.target.value)}
          placeholder={'Ask about their swimming ability\nAsk if they have any dietary restrictions\nAsk which hotel they are staying at\nAsk if they have rafted before'} />
        <p style={{ fontSize: '.75rem', opacity: .35, marginTop: 4 }}>One question per line. The AI will weave these naturally into every call.</p>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <label style={s.label}>Import knowledge from your website</label>
        <div style={s.row}>
          <input style={{ ...s.input, flex: 1 }} value={scrapeUrl}
            onChange={e => setScrapeUrl(e.target.value)}
            placeholder="https://yourtourwebsite.com" />
          <button style={s.btn(true)} onClick={importFromWebsite} disabled={scraping}>
            {scraping ? 'Importing…' : 'Import'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={s.label}>Knowledge base — tours, pricing, policies, FAQ</label>
        <textarea style={s.textarea} rows={14} value={faq} onChange={e => setFaq(e.target.value)}
          placeholder="Describe your tours, pricing, booking policies, what's included, common questions…" />
      </div>

      <button style={s.btn(true)} onClick={saveSettings} disabled={saving}>
        {saving ? 'Saving…' : 'Save settings'}
      </button>

      {msg && <p style={s.msg(msg.ok)}>{msg.text}</p>}
    </div>
  )
}

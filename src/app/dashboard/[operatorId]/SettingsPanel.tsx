'use client'

import { useState } from 'react'
import type { FaqPair } from '@/types'

type FaqPairUI = FaqPair & { _uiId: string }

interface Props {
  operatorId: string
  token: string
  initialBusinessName: string
  initialGreeting: string
  initialFaq: string
  initialIntakeQuestions: string
  initialStructuredFaqs: FaqPair[]
}

function withId(pair: FaqPair, index: number): FaqPairUI {
  return { ...pair, _uiId: `${Date.now()}-${index}-${Math.random()}` }
}

const s = {
  section: { marginTop: '2.5rem' },
  h2: { fontFamily: 'Fraunces, serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' },
  h3: { fontFamily: 'Fraunces, serif', fontSize: '1.05rem', fontWeight: 700, marginBottom: '.3rem' },
  subtitle: { fontSize: '.78rem', opacity: .4 as number, marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '.82rem', opacity: .5 as number, marginBottom: 6 },
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
  divider: { borderTop: '1px solid rgba(255,255,255,.07)', margin: '1.25rem 0' },
  addBtn: {
    width: '100%', background: 'transparent',
    border: '1px dashed rgba(255,255,255,.2)', borderRadius: 8,
    color: '#f0e8d8', fontSize: '.85rem', padding: '.55rem 1rem',
    cursor: 'pointer', marginTop: '.25rem',
  },
  removeLink: {
    display: 'block', textAlign: 'right' as const, fontSize: '.75rem',
    opacity: .35 as number, cursor: 'pointer', marginTop: '.4rem',
    background: 'none', border: 'none', color: '#f0e8d8', padding: 0,
  },
}

export default function SettingsPanel({
  operatorId, token,
  initialBusinessName, initialGreeting, initialFaq, initialIntakeQuestions, initialStructuredFaqs,
}: Props) {
  const [businessName, setBusinessName] = useState(initialBusinessName)
  const [greeting, setGreeting] = useState(initialGreeting)
  const [faq, setFaq] = useState(initialFaq)
  const [intakeQuestions, setIntakeQuestions] = useState(initialIntakeQuestions)
  const [structuredFaqs, setStructuredFaqs] = useState<FaqPairUI[]>(
    initialStructuredFaqs.map((p, i) => withId(p, i))
  )
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  function addFaq() {
    setStructuredFaqs(prev => [...prev, { q: '', a: '', _uiId: `new-${Date.now()}-${Math.random()}` }])
  }

  function removeFaq(index: number) {
    setStructuredFaqs(prev => prev.filter((_, i) => i !== index))
  }

  function updateFaq(index: number, field: 'q' | 'a', value: string) {
    setStructuredFaqs(prev => prev.map((pair, i) => i === index ? { ...pair, [field]: value } : pair))
  }

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
        body: JSON.stringify({
          operatorId, token, faq, greeting,
          business_name: businessName,
          intake_questions: intakeQuestions,
          structured_faqs: structuredFaqs.map(({ _uiId, ...pair }) => pair),
        }),
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

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={s.label}>Questions to ask every caller</label>
        <textarea style={s.textarea} rows={5} value={intakeQuestions} onChange={e => setIntakeQuestions(e.target.value)}
          placeholder={'Ask about their swimming ability\nAsk if they have any dietary restrictions\nAsk which hotel they are staying at\nAsk if they have rafted before'} />
        <p style={{ fontSize: '.75rem', opacity: .35, marginTop: 4 }}>One question per line. The AI will weave these naturally into every call.</p>
      </div>

      {/* Structured FAQ editor */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={s.h3}>Common questions &amp; answers</h3>
        <p style={s.subtitle}>Ringo will know these cold — add as many as you like.</p>

        {structuredFaqs.map((pair, i) => (
          <div key={pair._uiId}>
            {i > 0 && <div style={s.divider} />}
            <div style={{ marginBottom: '.5rem' }}>
              <label style={s.label}>Question</label>
              <input
                style={s.input}
                value={pair.q}
                onChange={e => updateFaq(i, 'q', e.target.value)}
                placeholder="e.g. What's included in the tour price?"
              />
            </div>
            <div>
              <label style={s.label}>Answer</label>
              <textarea
                style={s.textarea}
                rows={3}
                value={pair.a}
                onChange={e => updateFaq(i, 'a', e.target.value)}
                placeholder="e.g. All equipment, a guide, lunch, and transport."
              />
            </div>
            <button style={s.removeLink} onClick={() => removeFaq(i)}>Remove</button>
          </div>
        ))}

        <button style={s.addBtn} onClick={addFaq}>+ Add question</button>
      </div>

      {/* Import from website */}
      <div style={{ marginBottom: '.5rem' }}>
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

      {/* Free-form knowledge base */}
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

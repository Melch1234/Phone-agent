# FAQ Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a structured Q&A editor above the knowledge base in the operator dashboard so Ringo knows common questions cold.

**Architecture:** New `structured_faqs` JSONB column on operators. Pairs are formatted and injected into the AI system prompt before the free-form FAQ text. The SettingsPanel grows a stacked Q&A editor (Question input → Answer textarea → Remove link, repeated) with an Add button. Everything saves together on the existing Save Settings button.

**Tech Stack:** Next.js App Router, TypeScript, Supabase (JSONB), Vitest, OpenAI Realtime API system prompt

---

## File Map

| File | Change |
|------|--------|
| `supabase/migrations/005_add_structured_faqs.sql` | Create — DDL migration |
| `src/types/index.ts` | Modify — add `FaqPair` type, add `structured_faqs` to `Operator` |
| `api/settings.ts` | Modify — accept + validate + save `structured_faqs` |
| `api/stream.ts` | Modify — export `buildSystemPrompt`, inject FAQ pairs into prompt |
| `src/app/dashboard/[operatorId]/page.tsx` | Modify — pass `initialStructuredFaqs` to `SettingsPanel` |
| `src/app/dashboard/[operatorId]/SettingsPanel.tsx` | Modify — FAQ editor UI |
| `__tests__/stream-prompt.test.ts` | Create — unit tests for `buildSystemPrompt` |

---

## Task 1: DB Migration + Types

**Files:**
- Create: `supabase/migrations/005_add_structured_faqs.sql`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/005_add_structured_faqs.sql`:

```sql
ALTER TABLE operators ADD COLUMN structured_faqs JSONB DEFAULT '[]'::jsonb;
```

- [ ] **Step 2: Run migration**

In the Supabase dashboard SQL editor (or via Supabase CLI if configured), run the migration:

```sql
ALTER TABLE operators ADD COLUMN structured_faqs JSONB DEFAULT '[]'::jsonb;
```

Verify: in the Supabase table editor, the `operators` table now has a `structured_faqs` column of type `jsonb`.

- [ ] **Step 3: Add FaqPair type and update Operator**

In `src/types/index.ts`, add `FaqPair` before `Operator`, and add `structured_faqs` to `Operator`:

```typescript
export interface FaqPair {
  q: string
  a: string
}

export interface Operator {
  id: string
  business_name: string
  owner_name: string
  email: string
  alert_phone: string
  twilio_number: string | null
  greeting: string | null
  faq: string
  voice: string | null
  intake_questions: string | null
  structured_faqs: FaqPair[]
  active: boolean
  plan: 'starter' | 'growth' | 'agency'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  dashboard_token: string
  created_at: string
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/005_add_structured_faqs.sql src/types/index.ts
git commit -m "feat: add structured_faqs column and FaqPair type"
```

---

## Task 2: Update Settings API

**Files:**
- Modify: `api/settings.ts`

- [ ] **Step 1: Accept and save structured_faqs**

Replace the contents of `api/settings.ts` with:

```typescript
import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'
import type { FaqPair } from '../src/types'

export async function handleSettings(req: Request, res: Response): Promise<void> {
  const { operatorId, token, faq, greeting, business_name, voice, intake_questions, structured_faqs } = req.body as {
    operatorId: string
    token: string
    faq?: string
    greeting?: string
    business_name?: string
    voice?: string
    intake_questions?: string
    structured_faqs?: FaqPair[]
  }

  if (!operatorId || !token) {
    res.status(400).json({ error: 'operatorId and token are required' })
    return
  }

  const { data: operator } = await supabase
    .from('operators')
    .select('id, dashboard_token')
    .eq('id', operatorId)
    .single()

  if (!operator || operator.dashboard_token !== token) {
    res.status(403).json({ error: 'Unauthorized' })
    return
  }

  const updates: Record<string, unknown> = {}
  if (faq !== undefined) updates.faq = faq
  if (greeting !== undefined) updates.greeting = greeting || null
  if (business_name !== undefined) updates.business_name = business_name || null
  if (voice !== undefined) updates.voice = voice || null
  if (intake_questions !== undefined) updates.intake_questions = intake_questions || null
  if (structured_faqs !== undefined) {
    if (!Array.isArray(structured_faqs)) {
      res.status(400).json({ error: 'structured_faqs must be an array' })
      return
    }
    updates.structured_faqs = structured_faqs.filter(p => p.q?.trim())
  }

  const { error } = await supabase
    .from('operators')
    .update(updates)
    .eq('id', operatorId)

  if (error) {
    res.status(500).json({ error: 'Failed to save settings' })
    return
  }

  res.json({ ok: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add api/settings.ts
git commit -m "feat: settings API accepts structured_faqs"
```

---

## Task 3: Update buildSystemPrompt + Tests

**Files:**
- Modify: `api/stream.ts`
- Create: `__tests__/stream-prompt.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/stream-prompt.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildSystemPrompt } from '../api/stream'
import type { Operator } from '../src/types'

const base: Operator = {
  id: 'test-id',
  business_name: 'River Runners',
  owner_name: 'Jo',
  email: 'jo@example.com',
  alert_phone: '+15550000000',
  twilio_number: '+15551111111',
  greeting: null,
  faq: 'We run guided rafting tours.',
  voice: null,
  intake_questions: null,
  active: true,
  plan: 'starter',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  dashboard_token: 'tok',
  created_at: '2026-01-01',
  structured_faqs: [],
}

describe('buildSystemPrompt', () => {
  it('omits FAQ section when structured_faqs is empty', () => {
    const prompt = buildSystemPrompt(base)
    expect(prompt).not.toContain('Frequently asked questions')
  })

  it('includes formatted FAQ pairs when present', () => {
    const op = { ...base, structured_faqs: [{ q: "What's included?", a: 'Equipment and lunch.' }] }
    const prompt = buildSystemPrompt(op)
    expect(prompt).toContain('Frequently asked questions:')
    expect(prompt).toContain("Q: What's included?")
    expect(prompt).toContain('A: Equipment and lunch.')
  })

  it('separates multiple FAQ pairs with blank lines', () => {
    const op = {
      ...base,
      structured_faqs: [
        { q: 'Q1', a: 'A1' },
        { q: 'Q2', a: 'A2' },
      ],
    }
    const prompt = buildSystemPrompt(op)
    expect(prompt).toContain('Q: Q1\nA: A1\n\nQ: Q2\nA: A2')
  })

  it('places FAQ section before the free-form knowledge base', () => {
    const op = { ...base, structured_faqs: [{ q: 'Q?', a: 'A.' }] }
    const prompt = buildSystemPrompt(op)
    const faqIdx = prompt.indexOf('Frequently asked questions')
    const kbIdx = prompt.indexOf('About River Runners and their tours')
    expect(faqIdx).toBeGreaterThanOrEqual(0)
    expect(faqIdx).toBeLessThan(kbIdx)
  })

  it('uses default greeting when none set', () => {
    const prompt = buildSystemPrompt(base)
    expect(prompt).toContain("Thanks for calling River Runners!")
  })

  it('uses custom greeting when set', () => {
    const op = { ...base, greeting: 'Howdy partner!' }
    const prompt = buildSystemPrompt(op)
    expect(prompt).toContain('Howdy partner!')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- --reporter=verbose 2>&1 | grep "stream-prompt"
```

Expected: tests fail because `buildSystemPrompt` is not exported.

- [ ] **Step 3: Update stream.ts**

In `api/stream.ts`, make two changes:

**a)** Export `buildSystemPrompt` and add FAQ formatting:

```typescript
export function buildSystemPrompt(op: Operator): string {
  const greeting = op.greeting
    ?? `Thanks for calling ${op.business_name}! I'm here to help with any questions about our tours.`

  const faqSection = Array.isArray(op.structured_faqs) && op.structured_faqs.length > 0
    ? `Frequently asked questions:\n${op.structured_faqs.map(p => `Q: ${p.q}\nA: ${p.a}`).join('\n\n')}\n\n`
    : ''

  return `You are the after-hours phone assistant for ${op.business_name}.

Always respond in English regardless of the language of any reference material.

Your role:
- Answer questions about tours warmly and helpfully
- Naturally capture during the conversation: caller name, callback phone number, party size, preferred tour date, type of trip they want, where they are staying (optional), and any special requests
- Keep responses concise — this is a phone call, not an email
- If the caller mentions an emergency, injury, being stranded, or any urgent situation, tell them you are flagging it for immediate attention
${op.intake_questions ? `\nAlways work these questions naturally into the conversation:\n${op.intake_questions}` : ''}

${faqSection}About ${op.business_name} and their tours:
${op.faq}

Open every call with: "${greeting}"`
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- --reporter=verbose 2>&1 | grep -A2 "stream-prompt"
```

Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add api/stream.ts __tests__/stream-prompt.test.ts
git commit -m "feat: inject structured FAQs into system prompt"
```

---

## Task 4: Update Dashboard Page

**Files:**
- Modify: `src/app/dashboard/[operatorId]/page.tsx`

- [ ] **Step 1: Pass initialStructuredFaqs to SettingsPanel**

In `src/app/dashboard/[operatorId]/page.tsx`, update the `<SettingsPanel>` JSX (currently around line 114):

```typescript
<SettingsPanel
  operatorId={operator.id}
  token={operator.dashboard_token}
  initialBusinessName={operator.business_name ?? ''}
  initialGreeting={operator.greeting ?? ''}
  initialFaq={operator.faq ?? ''}
  initialIntakeQuestions={operator.intake_questions ?? ''}
  initialStructuredFaqs={Array.isArray(operator.structured_faqs) ? operator.structured_faqs : []}
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/[operatorId]/page.tsx
git commit -m "feat: pass initialStructuredFaqs to SettingsPanel"
```

---

## Task 5: FAQ Editor UI

**Files:**
- Modify: `src/app/dashboard/[operatorId]/SettingsPanel.tsx`

- [ ] **Step 1: Replace SettingsPanel with full FAQ editor**

Replace the entire contents of `src/app/dashboard/[operatorId]/SettingsPanel.tsx` with:

```typescript
'use client'

import { useState } from 'react'
import type { FaqPair } from '@/types'

interface Props {
  operatorId: string
  token: string
  initialBusinessName: string
  initialGreeting: string
  initialFaq: string
  initialIntakeQuestions: string
  initialStructuredFaqs: FaqPair[]
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
  const [structuredFaqs, setStructuredFaqs] = useState<FaqPair[]>(initialStructuredFaqs)
  const [scrapeUrl, setScrapeUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  function addFaq() {
    setStructuredFaqs(prev => [...prev, { q: '', a: '' }])
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
          structured_faqs: structuredFaqs,
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
          <div key={i}>
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
```

- [ ] **Step 2: Run the full test suite**

```bash
npm test
```

Expected: all existing tests still pass. (The new stream-prompt tests were committed in Task 3.)

- [ ] **Step 3: Start dev server and manually verify**

```bash
npm run dev
```

Open `http://localhost:3000/dashboard/<your-operator-id>` and verify:
- "Common questions & answers" section appears between the intake questions and the website import
- "+ Add question" button adds a new stacked Q/A pair
- "Remove" link removes the pair
- Saving with filled pairs — network request to `/api/settings` includes `structured_faqs` array
- Saving with a blank question field — that pair is not saved (stripped server-side)
- Reload the page — saved FAQs reappear

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/[operatorId]/SettingsPanel.tsx
git commit -m "feat: add structured FAQ editor to operator dashboard"
```

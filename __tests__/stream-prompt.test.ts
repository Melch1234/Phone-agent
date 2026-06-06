import { describe, it, expect, vi } from 'vitest'

// Mock heavy dependencies that initialise at module load time
vi.mock('openai', () => {
  function MockOpenAI() {
    return { chat: { completions: { create: vi.fn() } } }
  }
  return { default: MockOpenAI }
})

vi.mock('ws', () => ({ default: vi.fn() }))

vi.mock('../src/lib/supabase', () => ({ supabase: {} }))
vi.mock('../src/lib/twilio', () => ({ sendUrgentSms: vi.fn() }))
vi.mock('../src/lib/urgency', () => ({ containsUrgency: vi.fn() }))

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

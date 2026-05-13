import { describe, it, expect } from 'vitest'
import { buildBriefingEmail } from '../src/lib/briefing'
import type { Call, Operator } from '../src/types'

const operator: Operator = {
  id: 'op-1', business_name: 'Blue Ridge Adventures', owner_name: 'Mike',
  email: 'mike@blueridge.com', alert_phone: '+16045550100',
  twilio_number: '+16045550200', greeting: null, faq: '',
  active: true, plan: 'starter', dashboard_token: 'token-abc', created_at: '', voice: null, intake_questions: null
}

const calls: Call[] = [
  {
    id: 'call-1', operator_id: 'op-1', caller_number: '+16045550192',
    duration_seconds: 240, transcript: '', urgent: false,
    summary: 'Sarah asked about the 3-day hike for a party of 4 on July 12.',
    leads: [{ name: 'Sarah', party_size: 4, tour_date: 'July 12', trip_type: null, phone_number: null, callback_time: null, accommodation: null, notes: 'vegetarian in group' }],
    created_at: new Date().toISOString()
  },
  {
    id: 'call-2', operator_id: 'op-1', caller_number: '+16045550381',
    duration_seconds: 90, transcript: '', urgent: true,
    summary: 'Guest was stranded at the trailhead.',
    leads: [],
    created_at: new Date().toISOString()
  }
]

describe('buildBriefingEmail', () => {
  it('includes operator name', () => {
    const { html } = buildBriefingEmail(operator, calls)
    expect(html).toContain('Mike')
    expect(html).toContain('Blue Ridge Adventures')
  })

  it('includes call count in subject', () => {
    const { subject } = buildBriefingEmail(operator, calls)
    expect(subject).toContain('2 calls')
  })

  it('marks urgent calls', () => {
    const { html } = buildBriefingEmail(operator, calls)
    expect(html).toContain('URGENT')
  })

  it('includes lead info', () => {
    const { html } = buildBriefingEmail(operator, calls)
    expect(html).toContain('Sarah')
    expect(html).toContain('4 pax')
    expect(html).toContain('July 12')
  })

  it('handles zero calls gracefully', () => {
    const { subject, html } = buildBriefingEmail(operator, [])
    expect(subject).toContain('Quiet night')
    expect(html).toContain('No calls')
  })
})

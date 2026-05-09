import { describe, it, expect } from 'vitest'
import { buildStreamTwiml, buildFallbackTwiml } from '../src/lib/twilio'

describe('buildStreamTwiml', () => {
  it('returns TwiML with Stream pointing to the operator', () => {
    process.env.STREAM_HOST = 'app.railway.app'
    const xml = buildStreamTwiml('op-123', '+16045550192')
    expect(xml).toContain('<Connect>')
    expect(xml).toContain('wss://app.railway.app/stream')
    expect(xml).toContain('op-123')
    expect(xml).toContain('+16045550192')
  })

  it('returns fallback TwiML when operator is inactive', () => {
    const xml = buildFallbackTwiml()
    expect(xml).toContain('<Say')
    expect(xml).not.toContain('<Connect>')
  })
})

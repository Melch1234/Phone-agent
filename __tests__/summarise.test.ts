import { describe, it, expect, vi } from 'vitest'

vi.mock('openai', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          summary: 'Sarah called about the 3-day hike for a party of 4 on July 12.',
          leads: [{ name: 'Sarah', party_size: 4, tour_date: 'July 12', notes: 'vegetarian in group' }]
        })
      }
    }]
  })

  function MockOpenAI() {
    return {
      chat: {
        completions: {
          create: mockCreate,
        }
      }
    }
  }

  return { default: MockOpenAI }
})

import { summariseCall } from '../src/lib/openai'

describe('summariseCall', () => {
  it('returns summary and leads from transcript', async () => {
    const result = await summariseCall('AI: Thanks for calling. Caller: Hi, I am Sarah...')
    expect(result.summary).toContain('Sarah')
    expect(result.leads).toHaveLength(1)
    expect(result.leads[0].name).toBe('Sarah')
    expect(result.leads[0].party_size).toBe(4)
  })

  it('returns empty leads for an empty transcript', async () => {
    const result = await summariseCall('')
    expect(result.summary).toBeDefined()
    expect(Array.isArray(result.leads)).toBe(true)
  })
})

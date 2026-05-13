import OpenAI from 'openai'
import type { CallSummary } from '../types'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are extracting structured data from a tour booking phone call transcript.
Return valid JSON with exactly these fields:
- summary: string (1-2 sentences describing the call)
- leads: array of objects, each with:
  {
    name: string|null,
    party_size: number|null,
    tour_date: string|null,
    trip_type: string|null,
    phone_number: string|null,
    callback_time: string|null,
    accommodation: string|null,
    notes: string|null
  }

If no leads were captured, return an empty leads array.`

export async function summariseCall(transcript: string): Promise<CallSummary> {
  const content = transcript.trim() || 'Call with no transcript recorded.'

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  })

  try {
    const parsed = JSON.parse(completion.choices[0].message.content || '{}')
    return {
      summary: parsed.summary || '',
      leads: Array.isArray(parsed.leads) ? parsed.leads : [],
    }
  } catch {
    return { summary: '', leads: [] }
  }
}

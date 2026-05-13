import { Request, Response } from 'express'
import OpenAI from 'openai'
import { supabase } from '../src/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function handleScrape(req: Request, res: Response): Promise<void> {
  const { url, operatorId, token } = req.body as { url: string; operatorId: string; token: string }

  if (!url || !operatorId || !token) {
    res.status(400).json({ error: 'url, operatorId, and token are required' })
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

  let html: string
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TourAgentBot/1.0)' },
      signal: AbortSignal.timeout(10000),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    html = await resp.text()
  } catch (err) {
    res.status(400).json({ error: `Could not fetch URL: ${err instanceof Error ? err.message : 'Unknown error'}` })
    return
  }

  const text = stripHtml(html).slice(0, 12000)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Extract tour operator information from this website text and organize it into a clean knowledge base a phone agent can use to answer caller questions. Include:
- Tour types and descriptions
- Pricing and packages
- Availability and scheduling
- Booking and cancellation policies
- What's included or excluded
- Any physical requirements or age restrictions
- Common questions and answers

Be factual and concise. Skip navigation links, cookie notices, and generic marketing copy.`,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.2,
  })

  res.json({ faq: completion.choices[0].message.content || '' })
}

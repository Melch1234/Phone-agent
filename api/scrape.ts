import { Request, Response } from 'express'
import OpenAI from 'openai'
import { supabase } from '../src/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const RELEVANT_PATH_KEYWORDS = ['tour', 'trip', 'price', 'pricing', 'rate', 'faq', 'about', 'package', 'experience', 'activity', 'book', 'schedule', 'itinerar', 'cancel', 'policy', 'includ']

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

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1])
  const seen = new Set<string>()
  const links: string[] = []
  for (const href of hrefs) {
    try {
      const abs = new URL(href, baseUrl).toString()
      if (!abs.startsWith(origin)) continue
      const path = new URL(abs).pathname.toLowerCase()
      if (!RELEVANT_PATH_KEYWORDS.some(k => path.includes(k))) continue
      if (seen.has(abs)) continue
      seen.add(abs)
      links.push(abs)
    } catch { /* skip malformed */ }
  }
  return links.slice(0, 4)
}

async function fetchText(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TourAgentBot/1.0)' },
    signal: AbortSignal.timeout(8000),
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  return resp.text()
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

  let mainHtml: string
  try {
    mainHtml = await fetchText(url)
  } catch (err) {
    res.status(400).json({ error: `Could not fetch URL: ${err instanceof Error ? err.message : 'Unknown error'}` })
    return
  }

  // Scrape additional relevant pages in parallel
  const extraLinks = extractInternalLinks(mainHtml, url)
  const extraTexts = await Promise.allSettled(extraLinks.map(fetchText))

  const allText = [mainHtml, ...extraTexts.map(r => r.status === 'fulfilled' ? r.value : '')]
    .map(stripHtml)
    .join('\n\n')
    .slice(0, 20000)

  console.log(`[scrape] Scraped ${1 + extraLinks.length} pages from ${url}`)

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
      { role: 'user', content: allText },
    ],
    temperature: 0.2,
  })

  res.json({ faq: completion.choices[0].message.content || '' })
}

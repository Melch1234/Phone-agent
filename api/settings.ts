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

import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'

export async function handleSettings(req: Request, res: Response): Promise<void> {
  const { operatorId, token, faq, greeting, business_name, voice } = req.body as {
    operatorId: string
    token: string
    faq?: string
    greeting?: string
    business_name?: string
    voice?: string
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

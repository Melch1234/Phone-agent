import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'

export async function handleSettings(req: Request, res: Response): Promise<void> {
  const { operatorId, token, faq, greeting, business_name } = req.body as {
    operatorId: string
    token: string
    faq: string
    greeting?: string
    business_name?: string
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

  const { error } = await supabase
    .from('operators')
    .update({ faq: faq ?? '', greeting: greeting || null, business_name: business_name || null })
    .eq('id', operatorId)

  if (error) {
    res.status(500).json({ error: 'Failed to save settings' })
    return
  }

  res.json({ ok: true })
}

import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'

function isAdmin(token: string | undefined): boolean {
  return !!token && token === process.env.ADMIN_TOKEN
}

export async function handleAdminOperators(req: Request, res: Response): Promise<void> {
  const token = (req.query.token || req.body?.token) as string | undefined

  if (!isAdmin(token)) {
    res.status(403).json({ error: 'Unauthorized' })
    return
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('operators')
      .select('id, business_name, owner_name, email, alert_phone, twilio_number, active, created_at')
      .order('created_at', { ascending: false })

    if (error) { res.status(500).json({ error: 'Failed to fetch operators' }); return }
    res.json(data)
    return
  }

  if (req.method === 'PATCH') {
    const { operatorId, twilio_number, active } = req.body as {
      operatorId: string
      twilio_number?: string
      active?: boolean
    }

    if (!operatorId) { res.status(400).json({ error: 'operatorId required' }); return }

    const updates: Record<string, unknown> = {}
    if (twilio_number !== undefined) updates.twilio_number = twilio_number || null
    if (active !== undefined) updates.active = active

    const { error } = await supabase.from('operators').update(updates).eq('id', operatorId)
    if (error) { res.status(500).json({ error: 'Failed to update operator' }); return }
    res.json({ ok: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'

export async function handleDeleteCall(req: Request, res: Response): Promise<void> {
  const { callId, operatorId, token } = req.body as { callId: string; operatorId: string; token: string }

  if (!callId || !operatorId || !token) {
    res.status(400).json({ error: 'callId, operatorId, and token are required' })
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
    .from('calls')
    .delete()
    .eq('id', callId)
    .eq('operator_id', operatorId)

  if (error) {
    res.status(500).json({ error: 'Failed to delete call' })
    return
  }

  res.json({ ok: true })
}

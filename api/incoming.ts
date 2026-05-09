import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'
import { buildStreamTwiml, buildFallbackTwiml } from '../src/lib/twilio'

export async function handleIncoming(req: Request, res: Response): Promise<void> {
  const toNumber: string = req.body.To || ''
  const fromNumber: string = req.body.From || 'unknown'

  const { data: operator, error } = await supabase
    .from('operators')
    .select('id, active')
    .eq('twilio_number', toNumber)
    .single()

  res.type('text/xml')

  if (error || !operator || !operator.active) {
    res.send(buildFallbackTwiml())
    return
  }

  res.send(buildStreamTwiml(operator.id, fromNumber))
}

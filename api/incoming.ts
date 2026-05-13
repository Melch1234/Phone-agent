import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'
import { buildStreamTwiml, buildFallbackTwiml } from '../src/lib/twilio'

export async function handleIncoming(req: Request, res: Response): Promise<void> {
  const toNumber: string = req.body.To || ''
  const fromNumber: string = req.body.From || 'unknown'

  console.log(`[incoming] To=${toNumber} From=${fromNumber}`)

  const { data: operator, error } = await supabase
    .from('operators')
    .select('id, active')
    .eq('twilio_number', toNumber)
    .single()

  console.log(`[incoming] operator=${JSON.stringify(operator)} error=${JSON.stringify(error)}`)

  res.type('text/xml')

  if (error || !operator || !operator.active) {
    console.log(`[incoming] falling back — no active operator for ${toNumber}`)
    res.send(buildFallbackTwiml())
    return
  }

  console.log(`[incoming] connecting operator ${operator.id}`)
  res.send(buildStreamTwiml(operator.id, fromNumber))
}

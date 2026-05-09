import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'
import { sendEmail } from '../src/lib/resend'
import type { OnboardPayload } from '../src/types'

export async function handleOperators(req: Request, res: Response): Promise<void> {
  const body = req.body as OnboardPayload

  const required: (keyof OnboardPayload)[] = ['business_name', 'owner_name', 'email', 'alert_phone', 'faq']
  for (const field of required) {
    if (!body[field]) {
      res.status(400).json({ error: `${field} is required` })
      return
    }
  }

  const { data: operator, error } = await supabase
    .from('operators')
    .insert({
      business_name: body.business_name.trim(),
      owner_name: body.owner_name.trim(),
      email: body.email.trim().toLowerCase(),
      alert_phone: body.alert_phone.trim(),
      faq: body.faq.trim(),
      greeting: body.greeting?.trim() || null,
      active: false,
    })
    .select()
    .single()

  if (error || !operator) {
    console.error('Failed to create operator:', error)
    res.status(500).json({ error: 'Failed to save. Please try again.' })
    return
  }

  await sendEmail({
    to: process.env.YOUR_NOTIFICATION_EMAIL!,
    subject: `New signup: ${operator.business_name}`,
    html: `
      <h2>New tour operator signup</h2>
      <p><strong>Business:</strong> ${operator.business_name}</p>
      <p><strong>Owner:</strong> ${operator.owner_name}</p>
      <p><strong>Email:</strong> ${operator.email}</p>
      <p><strong>Alert phone:</strong> ${operator.alert_phone}</p>
      <p><strong>FAQ:</strong></p>
      <pre style="background:#f5f5f5;padding:12px;">${operator.faq}</pre>
      <p><strong>Operator ID:</strong> ${operator.id}</p>
      <hr>
      <p>To activate: set <code>twilio_number</code> and flip <code>active = true</code> in Supabase.</p>
    `,
  }).catch(err => console.error('Failed to send signup notification:', err))

  res.json({ ok: true, operatorId: operator.id })
}

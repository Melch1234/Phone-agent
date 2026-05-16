import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'
import { sendEmail } from '../src/lib/resend'
import type { OnboardPayload } from '../src/types'

export async function handleOperators(req: Request, res: Response): Promise<void> {
  const body = req.body as OnboardPayload & { call_slots?: string[] }

  const required: (keyof OnboardPayload)[] = ['business_name', 'owner_name', 'email', 'alert_phone']
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
      location: body.location?.trim() || null,
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

  const baseUrl = process.env.BASE_URL ?? 'https://phone-agent-production-e8a7.up.railway.app'
  const dashboardUrl = `${baseUrl}/dashboard/${operator.id}?token=${operator.dashboard_token}`

  await Promise.allSettled([
    sendEmail({
      to: 'fun@bugme.travel',
      subject: `New signup: ${operator.business_name}`,
      html: `
        <h2>New tour operator signup</h2>
        <p><strong>Business:</strong> ${operator.business_name}</p>
        <p><strong>Owner:</strong> ${operator.owner_name}</p>
        <p><strong>Email:</strong> ${operator.email}</p>
        <p><strong>Alert phone:</strong> ${operator.alert_phone}</p>
        <p><strong>Location:</strong> ${operator.location || '—'}</p>
        ${body.call_slots?.length ? `<p><strong>Preferred call times:</strong></p><ul>${body.call_slots.map((s: string) => `<li>${s}</li>`).join('')}</ul>` : '<p><em>No call times selected — reach out by email.</em></p>'}
        <hr>
        <p>To activate: go to the <a href="${process.env.BASE_URL ?? 'https://phone-agent-production-e8a7.up.railway.app'}/admin?token=tour+agent">admin panel</a>, assign a Twilio number, and click Activate.</p>
      `,
    }),
    sendEmail({
      to: operator.email,
      subject: `We've received your Tour Agent application`,
      html: `
        <p>Hi ${operator.owner_name},</p>
        <p>Thanks for applying! We've received your details and will be in touch soon to discuss next steps.</p>
        <p>— The Tour Agent team</p>
      `,
    }),
  ])

  res.json({ ok: true, operatorId: operator.id })
}

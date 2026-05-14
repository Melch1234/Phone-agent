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
        <p><strong>FAQ:</strong></p>
        <pre style="background:#f5f5f5;padding:12px;">${operator.faq}</pre>
        <p><strong>Dashboard:</strong> <a href="${dashboardUrl}">${dashboardUrl}</a></p>
        <hr>
        <p>To activate: go to the <a href="${process.env.BASE_URL ?? 'https://phone-agent-production-e8a7.up.railway.app'}/admin?token=tour+agent">admin panel</a>, assign a Twilio number, and click Activate.</p>
      `,
    }),
    sendEmail({
      to: operator.email,
      subject: `Welcome to Tour Agent — your dashboard is ready`,
      html: `
        <p>Hi ${operator.owner_name},</p>
        <p>Thanks for signing up! We're setting up your dedicated phone number and will have your AI agent live within 24 hours.</p>
        <p>In the meantime, your dashboard is ready. You can set your voice, import your website, and tweak your agent's knowledge base:</p>
        <p style="margin:24px 0;">
          <a href="${dashboardUrl}" style="background:#e8820c;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:600;">Open your dashboard →</a>
        </p>
        <p style="color:#666;font-size:14px;">Keep this link safe — it's your private access to your dashboard.</p>
        <p>We'll email you again once your agent is live.<br>— The Tour Agent team</p>
      `,
    }),
  ])

  res.json({ ok: true, operatorId: operator.id })
}

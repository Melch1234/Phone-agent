import { Request, Response } from 'express'
import { supabase } from '../src/lib/supabase'

function isAdmin(token: string | undefined, req: Request): boolean {
  const adminToken = process.env.ADMIN_TOKEN
  const cookieToken = req.cookies?.admin_auth
  return !!adminToken && (token === adminToken || cookieToken === adminToken)
}

export async function handleAdminOperators(req: Request, res: Response): Promise<void> {
  const token = (req.query.token || req.body?.token) as string | undefined

  if (!isAdmin(token, req)) {
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

    // If activating with a number, notify the operator
    if (active === true && twilio_number) {
      const { data: op } = await supabase
        .from('operators')
        .select('id, business_name, owner_name, email, dashboard_token')
        .eq('id', operatorId)
        .single()

      if (op) {
        const { sendEmail } = await import('../src/lib/resend')
        const baseUrl = process.env.BASE_URL ?? 'https://phone-agent-production-e8a7.up.railway.app'
        const dashboardUrl = `${baseUrl}/dashboard/${op.id}?token=${op.dashboard_token}`
        await sendEmail({
          to: op.email,
          subject: `Your Tour Agent line is ready — ${twilio_number}`,
          html: `
            <p>Hi ${op.owner_name},</p>
            <p>Great news — your dedicated AI phone line is live!</p>
            <p><strong>Your number: ${twilio_number}</strong></p>
            <p>Forward this number to your existing business line, or start using it straight away. Your AI agent is ready to answer calls 24/7.</p>
            <p><strong>Next steps:</strong></p>
            <ol>
              <li>Visit your <a href="${dashboardUrl}">dashboard</a> to set up your FAQ and greeting.</li>
              <li>Forward <strong>${twilio_number}</strong> to your business phone, or share it with guests directly.</li>
              <li>Your overnight briefing email will arrive at 6am UTC each day.</li>
            </ol>
            <p>Any questions? Reply to this email or reach us at <a href="mailto:fun@bugme.travel">fun@bugme.travel</a>.</p>
            <p>— The Tour Agent team</p>
          `,
        }).catch(err => console.error('[admin] Failed to send activation email:', err))
      }
    }

    res.json({ ok: true })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
